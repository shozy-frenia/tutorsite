"use client";

import { supabaseBrowser } from "./client";
import type { AttemptRow, ProfileRow } from "./types";
import {
  readStore,
  replaceStore,
  type Attempt,
  type Profile,
  type Store,
} from "@/lib/storage";
import type { GradeYear, Grade } from "@/data/grade-boundaries";
import type { Parallel } from "@/data/curriculum";
import type { Locale } from "@/lib/i18n";

/**
 * Local-first sync.
 *
 * The rule this whole file exists to enforce: **the device is the source of
 * truth while you work, and the cloud is a backup that catches up.** Nothing
 * in the exam flow ever awaits the network. A student on school wi-fi mid-paper
 * must never see a spinner because Supabase is slow — 6 of 26 pilots already
 * reported the AI hanging, and the last thing this app needs is a second thing
 * that blocks on a round trip.
 *
 * So:
 *   · saveAttempt() writes localStorage synchronously, as it always did.
 *   · A background push mirrors it to Postgres, and failure is silent.
 *   · On sign-in, mergeOnLogin() unions both sides. Never a replace.
 */

type SyncResult = { ok: boolean; merged: number };

/* --------------------------------------------------------------------------
   Row ⇄ local shape
   -------------------------------------------------------------------------- */

function rowToAttempt(row: AttemptRow): Attempt {
  return {
    id: row.client_id,
    paperId: row.paper_id,
    paperTitle: row.paper_title,
    subjectId: row.subject_id,
    componentIndex: row.component_index,
    gradeYear: row.grade_year as GradeYear,
    finishedAt: row.finished_at,
    rawMark: row.raw_mark,
    availableMarks: row.available_marks,
    scaledMark: row.scaled_mark,
    componentMax: row.component_max,
    grade: row.grade as Grade,
    durationSeconds: row.duration_seconds,
    outcomes: Array.isArray(row.outcomes) ? row.outcomes : [],
  };
}

function attemptToRow(attempt: Attempt, userId: string) {
  return {
    user_id: userId,
    client_id: attempt.id,
    paper_id: attempt.paperId,
    paper_title: attempt.paperTitle,
    subject_id: attempt.subjectId,
    component_index: attempt.componentIndex,
    grade_year: attempt.gradeYear,
    finished_at: attempt.finishedAt,
    raw_mark: attempt.rawMark,
    available_marks: attempt.availableMarks,
    scaled_mark: attempt.scaledMark,
    component_max: attempt.componentMax,
    grade: attempt.grade,
    duration_seconds: attempt.durationSeconds,
    outcomes: attempt.outcomes,
  };
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    name: row.display_name,
    gradeYear: row.grade_year as GradeYear,
    parallel: row.parallel as Parallel,
    profileSubjectIds: row.profile_subject_ids ?? [],
    targetGrade: row.target_grade as Grade,
    joinedAt: row.created_at.slice(0, 10),
  };
}

/* --------------------------------------------------------------------------
   Push
   -------------------------------------------------------------------------- */

export async function pushProfile(
  userId: string,
  profile: Profile,
  locale: Locale
): Promise<boolean> {
  const supabase = supabaseBrowser();
  if (!supabase) return false;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      display_name: profile.name,
      grade_year: profile.gradeYear,
      parallel: profile.parallel,
      profile_subject_ids: profile.profileSubjectIds,
      target_grade: profile.targetGrade,
      locale,
    },
    { onConflict: "id" }
  );
  return !error;
}

/**
 * Mirror attempts to Postgres.
 *
 * upsert on (user_id, client_id) rather than insert, so a retry after a dropped
 * connection is a no-op instead of a duplicate row on the dashboard.
 */
export async function pushAttempts(
  userId: string,
  attempts: Attempt[]
): Promise<boolean> {
  const supabase = supabaseBrowser();
  if (!supabase || attempts.length === 0) return false;

  const { error } = await supabase
    .from("attempts")
    .upsert(
      attempts.map((a) => attemptToRow(a, userId)),
      { onConflict: "user_id,client_id", ignoreDuplicates: false }
    );
  return !error;
}

export async function pushActivityDays(
  userId: string,
  days: string[]
): Promise<boolean> {
  const supabase = supabaseBrowser();
  if (!supabase || days.length === 0) return false;

  const { error } = await supabase
    .from("activity_days")
    .upsert(
      days.map((day) => ({ user_id: userId, day })),
      { onConflict: "user_id,day", ignoreDuplicates: true }
    );
  return !error;
}

/* --------------------------------------------------------------------------
   Pull
   -------------------------------------------------------------------------- */

export async function pullAll(userId: string): Promise<Store | null> {
  const supabase = supabaseBrowser();
  if (!supabase) return null;

  const [profileRes, attemptRes, dayRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("attempts")
      .select("*")
      .eq("user_id", userId)
      .order("finished_at", { ascending: false })
      .limit(500),
    supabase.from("activity_days").select("day").eq("user_id", userId),
  ]);

  if (attemptRes.error) return null;

  return {
    profile: profileRes.data ? rowToProfile(profileRes.data) : null,
    attempts: (attemptRes.data ?? []).map(rowToAttempt),
    activeDays: (dayRes.data ?? []).map((d) => d.day).sort(),
  };
}

/* --------------------------------------------------------------------------
   Merge on login — the important one
   -------------------------------------------------------------------------- */

/**
 * Union local and cloud state after sign-in.
 *
 * The scenario this protects: a student solves three papers as a guest on a
 * phone, then signs in. Replacing local with cloud would silently delete those
 * three. Replacing cloud with local would delete whatever they did on a laptop
 * last week. So both directions are unioned, deduplicated on attempt id.
 *
 * Conflict rule for the profile: whichever side has one wins, and if both do,
 * the *local* one wins. The student was just editing on this device, so the
 * local copy is the more recent intent.
 */
export async function mergeOnLogin(
  userId: string,
  locale: Locale
): Promise<SyncResult> {
  const local = readStore();
  const remote = await pullAll(userId);

  if (!remote) {
    // Cloud unreachable. Keep working locally; the next push will catch up.
    return { ok: false, merged: 0 };
  }

  const byId = new Map<string, Attempt>();
  for (const attempt of remote.attempts) byId.set(attempt.id, attempt);

  let newToCloud = 0;
  const localOnly: Attempt[] = [];
  for (const attempt of local.attempts) {
    if (!byId.has(attempt.id)) {
      byId.set(attempt.id, attempt);
      localOnly.push(attempt);
      newToCloud += 1;
    }
  }

  const attempts = [...byId.values()].sort((a, b) =>
    b.finishedAt.localeCompare(a.finishedAt)
  );

  const activeDays = [
    ...new Set([...remote.activeDays, ...local.activeDays]),
  ].sort();
  const daysOnlyLocal = local.activeDays.filter(
    (d) => !remote.activeDays.includes(d)
  );

  const profile = local.profile ?? remote.profile;

  replaceStore({ profile, attempts, activeDays });

  // Send whatever the cloud was missing. Failures are non-fatal — the merged
  // state is already safe on the device.
  await Promise.all([
    localOnly.length ? pushAttempts(userId, localOnly) : Promise.resolve(true),
    daysOnlyLocal.length
      ? pushActivityDays(userId, daysOnlyLocal)
      : Promise.resolve(true),
    profile && !remote.profile
      ? pushProfile(userId, profile, locale)
      : Promise.resolve(true),
  ]);

  return { ok: true, merged: newToCloud };
}

/**
 * Push everything currently on the device.
 *
 * Called on a debounce after any local write while signed in, and once when a
 * tab regains connectivity. Cheap because upserts are idempotent — worst case
 * we re-send rows Postgres already has.
 */
export async function pushEverything(
  userId: string,
  locale: Locale
): Promise<boolean> {
  const store = readStore();
  const results = await Promise.all([
    store.profile ? pushProfile(userId, store.profile, locale) : true,
    store.attempts.length ? pushAttempts(userId, store.attempts) : true,
    store.activeDays.length ? pushActivityDays(userId, store.activeDays) : true,
  ]);
  return results.every(Boolean);
}

/** Wipe every row belonging to the caller. Used by "delete my data". */
export async function deleteEverything(): Promise<boolean> {
  const supabase = supabaseBrowser();
  if (!supabase) return false;
  const { error } = await supabase.rpc("delete_my_data");
  return !error;
}
