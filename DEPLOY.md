# Deploying Talap to talap.online

The site is a Next.js app with middleware, API routes and server-rendered
pages. It is hosted on Vercel (region fra1) and cannot be served from static
hosting — the `CNAME` file in the repository root is a leftover from an
earlier GitHub Pages attempt and does nothing on Vercel.

## The one detail that breaks sign-in

**The canonical origin is `https://www.talap.online`, not the apex.**

`talap.online` answers with a 308 to the `www` form, query string intact:

```
GET https://talap.online/auth/callback?code=abc
  -> 308 https://www.talap.online/auth/callback?code=abc
```

The sign-in dialog builds its redirect from `window.location.origin`, so it
always asks Supabase to come back to `https://www.talap.online/auth/callback`.
If that exact address is not on Supabase's allowlist, Supabase refuses it and
drops the student on the Site URL instead — the magic link appears to work and
simply does not sign anyone in. Allowlist the `www` form. Adding the apex too
costs nothing and covers a link that was generated before a redirect change.

---

## 1. Environment variables (Vercel)

Project → Settings → Environment Variables. Add to **Production**, **Preview**
and **Development**, then redeploy — Vercel bakes `NEXT_PUBLIC_*` values in at
build time, so an existing deployment will not pick them up.

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the `anon` `public` key from the same page |
| `NEXT_PUBLIC_SITE_URL` | `https://www.talap.online` |

Never add the `service_role` key. It bypasses row-level security, and anything
named `NEXT_PUBLIC_*` is shipped to the browser.

Leaving the two Supabase variables unset is a supported state: the site runs in
guest mode, progress stays in localStorage, and no account UI is rendered.

## 2. Supabase auth configuration

Authentication → **URL Configuration**:

- Site URL: `https://www.talap.online`
- Redirect URLs:
  - `https://www.talap.online/auth/callback`
  - `https://talap.online/auth/callback`
  - `http://localhost:3000/auth/callback`

Authentication → **Providers**:

- **Email** — on. Turn "Confirm email" off; the app uses magic links only.
- **Google** — optional. The sign-in dialog asks the project which providers
  are enabled and shows only those, so leaving Google off is safe: the button
  simply does not appear.

Email sending: the built-in Supabase SMTP is rate limited to a handful of
messages per hour and is fine for testing only. Before real students use this,
attach an SMTP provider under Authentication → Emails, or magic links will
quietly stop arriving on a busy afternoon.

## 3. Database

Run [`supabase/schema.sql`](supabase/schema.sql) once in the SQL editor. It is
idempotent — `create table if not exists`, `drop policy if exists` before each
`create policy` — so re-running it after an edit is safe.

## 4. Ship it

Production tracks `main`. Merge the branch and Vercel builds it:

```bash
git push -u origin design-v2
gh pr create --base main --title "Talap v2" --body "..."
# review, then merge
```

## 5. After the deploy — check these five things

1. `https://www.talap.online` renders the new design (a yellow highlighter
   behind "without the burnout", not a solid block).
2. The header shows a **Sign in** button. If it does not, the Supabase
   variables did not reach the build.
3. Sign in with a magic link. You should land back on the site signed in.
4. Dashboard → the account panel names your account and shows a green dot
   reading "Saved to your account".
5. Sit a paper as a guest in a private window, then sign in from that window.
   The account panel should report the guest attempts as merged, and the
   dashboard should show both those and anything already on the account.

Step 5 is the one worth doing properly: it is the behaviour that stops a
student losing three papers' work the first time they sign in.
