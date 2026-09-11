-- ============================================================================
-- TALAP — Supabase schema
--
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query), or via
-- `supabase db push` if you adopt the CLI later.
--
-- Design notes:
--
--   · Data minimisation. The users are schoolchildren, mostly under 18. We
--     store a first name, a grade year, a parallel, chosen profile subjects and
--     attempt history. No surname, no school, no phone, no date of birth. The
--     email lives in auth.users because the auth provider needs it, and is
--     never copied into a public table.
--
--   · Every table is owner-scoped through RLS. There is no "read all" policy
--     anywhere, not even for the service role paths the app uses, so a leaked
--     anon key exposes nothing but the caller's own rows.
--
--   · attempts.client_id is generated on the device before the row ever
--     reaches Postgres. It makes the merge idempotent: a guest who signs in on
--     two devices, or who retries after losing connection, cannot duplicate an
--     attempt. That is the whole reason the unique constraint exists.
--
--   · outcomes stays jsonb rather than a child table. It is written once,
--     read whole, and never queried by its internals — the mastery radar
--     aggregates client-side from the full attempt list.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  display_name        text        not null default '',
  grade_year          smallint    not null check (grade_year in (10, 11, 12)),
  parallel            text        not null check (parallel in ('kazakh', 'russian')),
  profile_subject_ids text[]      not null default '{}',
  target_grade        text        not null default 'A'
                        check (target_grade in ('A*', 'A', 'B', 'C', 'D', 'E', 'U')),
  locale              text        not null default 'ru'
                        check (locale in ('kk', 'ru', 'en')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.profiles is
  'One row per signed-in student. First name only — no surname, school or contact details.';
comment on column public.profiles.parallel is
  'Decides which language is Я1 and which is Я2, so it decides which language papers this student will ever sit.';

alter table public.profiles enable row level security;

drop policy if exists "profiles: owner reads" on public.profiles;
create policy "profiles: owner reads"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: owner inserts" on public.profiles;
create policy "profiles: owner inserts"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles: owner updates" on public.profiles;
create policy "profiles: owner updates"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles: owner deletes" on public.profiles;
create policy "profiles: owner deletes"
  on public.profiles for delete
  using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- attempts
-- ----------------------------------------------------------------------------

create table if not exists public.attempts (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users (id) on delete cascade,

  -- Generated on the device. Makes the local → cloud merge idempotent.
  client_id        text        not null,

  paper_id         text        not null,
  paper_title      text        not null,
  subject_id       text        not null,
  component_index  smallint    not null,
  grade_year       smallint    not null check (grade_year in (10, 11, 12)),

  finished_at      timestamptz not null,
  raw_mark         integer     not null check (raw_mark >= 0),
  available_marks  integer     not null check (available_marks > 0),
  scaled_mark      integer     not null check (scaled_mark >= 0),
  component_max    integer     not null check (component_max > 0),
  grade            text        not null
                     check (grade in ('A*', 'A', 'B', 'C', 'D', 'E', 'U')),
  duration_seconds integer     not null check (duration_seconds >= 0),

  outcomes         jsonb       not null default '[]'::jsonb,
  created_at       timestamptz not null default now(),

  constraint attempts_client_unique unique (user_id, client_id)
);

comment on column public.attempts.client_id is
  'Device-generated id. The unique constraint with user_id is what makes sync idempotent across devices and retries.';

create index if not exists attempts_user_finished_idx
  on public.attempts (user_id, finished_at desc);

create index if not exists attempts_user_subject_idx
  on public.attempts (user_id, subject_id);

alter table public.attempts enable row level security;

drop policy if exists "attempts: owner reads" on public.attempts;
create policy "attempts: owner reads"
  on public.attempts for select
  using (auth.uid() = user_id);

drop policy if exists "attempts: owner inserts" on public.attempts;
create policy "attempts: owner inserts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "attempts: owner updates" on public.attempts;
create policy "attempts: owner updates"
  on public.attempts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "attempts: owner deletes" on public.attempts;
create policy "attempts: owner deletes"
  on public.attempts for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- activity_days — the streak counter
--
-- A separate table rather than a derived query, because a student can open the
-- app, revise, and close it without finishing a paper. That still counts as a
-- day of practice, and deriving the streak from attempts alone would lose it.
-- ----------------------------------------------------------------------------

create table if not exists public.activity_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  primary key (user_id, day)
);

alter table public.activity_days enable row level security;

drop policy if exists "activity: owner reads" on public.activity_days;
create policy "activity: owner reads"
  on public.activity_days for select
  using (auth.uid() = user_id);

drop policy if exists "activity: owner inserts" on public.activity_days;
create policy "activity: owner inserts"
  on public.activity_days for insert
  with check (auth.uid() = user_id);

drop policy if exists "activity: owner deletes" on public.activity_days;
create policy "activity: owner deletes"
  on public.activity_days for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Account deletion
--
-- Cascades from auth.users handle profiles, attempts and activity. This helper
-- exists so the app can offer "delete everything" without an admin key: the
-- caller can only ever wipe their own rows, because auth.uid() is the filter.
-- ----------------------------------------------------------------------------

create or replace function public.delete_my_data()
returns void
language plpgsql
security invoker
as $$
begin
  delete from public.attempts      where user_id = auth.uid();
  delete from public.activity_days where user_id = auth.uid();
  delete from public.profiles      where id      = auth.uid();
end;
$$;

revoke all on function public.delete_my_data() from public;
grant execute on function public.delete_my_data() to authenticated;
