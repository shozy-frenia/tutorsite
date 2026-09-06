"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Browser Supabase client.
 *
 * Returns null when the env vars are absent, and every caller is written to
 * cope with that. This is deliberate: the app must keep working with no
 * backend configured at all — a contributor who clones the repo without keys
 * still gets a fully usable guest-mode site, exactly as the AI routes already
 * degrade to the offline generators when there is no model key.
 */

let cached: SupabaseClient<Database> | null = null;

export function supabaseBrowser(): SupabaseClient<Database> | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  cached = createBrowserClient<Database>(url, key);
  return cached;
}

/** True when a backend is configured. Drives whether sign-in UI is offered. */
export const isSupabaseConfigured = (): boolean =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
