import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session refresh.
 *
 * Supabase access tokens are short-lived. Server components cannot write
 * cookies, so without this a student who leaves a tab open overnight comes back
 * signed out even though their refresh token is still valid. Middleware is the
 * one place in the request path that can both read and write them.
 *
 * It does not gate anything. Every route stays reachable signed out — the app
 * is guest-first and this file must not quietly turn it into a walled one.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touching getUser() is what performs the refresh.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and images — those never need a session
     * and running middleware on them is pure latency.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|exams/|brand/|.*\\.(?:png|jpg|jpeg|svg|webp|gif|mp4|woff2?)$).*)",
  ],
};
