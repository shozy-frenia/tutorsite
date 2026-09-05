import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Server Supabase client, for server components and route handlers.
 *
 * Next 15 made `cookies()` async, hence the await. The `setAll` swallow is the
 * documented pattern: a server component cannot write cookies, and the session
 * refresh that would have written them is handled by middleware instead.
 */
export async function supabaseServer(): Promise<SupabaseClient<Database> | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const store = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        } catch {
          // Called from a server component — middleware refreshes the session.
        }
      },
    },
  });
}

/**
 * The signed-in user, or null.
 *
 * Uses getUser() rather than getSession(): getSession reads the cookie as-is,
 * while getUser revalidates it against the auth server. On anything that
 * decides what data to show, the revalidated one is the one to trust.
 */
export async function currentUser() {
  const supabase = await supabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}
