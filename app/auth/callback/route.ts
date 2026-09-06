import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * OAuth / magic-link landing.
 *
 * Supabase sends the student back here with a one-time `code`. Exchanging it
 * sets the session cookies, after which the browser continues to `next`.
 *
 * `next` is validated as a same-site path before it is used. It arrives in a
 * URL the student can edit, so treating it as trusted would turn the sign-in
 * flow into an open redirect.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requested = url.searchParams.get("next") ?? "/library";

  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/library";

  if (!code) {
    return NextResponse.redirect(new URL("/?auth=missing_code", url.origin));
  }

  const supabase = await supabaseServer();
  if (!supabase) {
    return NextResponse.redirect(new URL("/?auth=unconfigured", url.origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/?auth=failed", url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
