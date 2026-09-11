"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseBrowser } from "@/lib/supabase/client";
import { mergeOnLogin, pushEverything } from "@/lib/supabase/sync";
import { onStoreChange } from "@/lib/storage";
import { useLocale } from "@/components/i18n/LocaleProvider";

type SyncState = "idle" | "syncing" | "error";

interface SessionValue {
  user: User | null;
  /** True until the first auth check resolves. */
  loading: boolean;
  /** False when no Supabase keys are configured — hide all sign-in UI. */
  enabled: boolean;
  syncState: SyncState;
  /** Attempts moved from this device into the account on the last merge. */
  mergedCount: number;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

/**
 * Auth session + background sync.
 *
 * Guest-first by design. Nothing here blocks rendering: if Supabase is
 * unreachable or unconfigured, `user` stays null, `enabled` is false, and the
 * app behaves exactly as the localStorage-only version did. Sign-in adds
 * durability; it is never a gate.
 *
 * The push is debounced rather than immediate because finishing a paper writes
 * the store once but a review pass can write it several times in a few seconds,
 * and there is no reason to spend a round trip on each.
 */
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const enabled = isSupabaseConfigured();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [mergedCount, setMergedCount] = useState(0);

  // Which user id we have already merged for, so a token refresh does not
  // re-run the merge on every SIGNED_IN event Supabase emits.
  const mergedFor = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const supabase = supabaseBrowser();
    if (!supabase) return;

    let alive = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [enabled]);

  // Merge guest work into the account, once per signed-in user.
  useEffect(() => {
    if (!user || mergedFor.current === user.id) return;
    mergedFor.current = user.id;

    let alive = true;
    setSyncState("syncing");
    mergeOnLogin(user.id, locale)
      .then((result) => {
        if (!alive) return;
        setMergedCount(result.merged);
        setSyncState(result.ok ? "idle" : "error");
      })
      .catch(() => alive && setSyncState("error"));

    return () => {
      alive = false;
    };
  }, [user, locale]);

  // Mirror later local writes up, on a debounce.
  useEffect(() => {
    if (!user) return;

    const schedule = () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        setSyncState("syncing");
        pushEverything(user.id, locale)
          .then((ok) => setSyncState(ok ? "idle" : "error"))
          .catch(() => setSyncState("error"));
      }, 1500);
    };

    const unsubscribe = onStoreChange(schedule);
    // A tab that was offline mid-paper catches up the moment it reconnects.
    window.addEventListener("online", schedule);

    return () => {
      unsubscribe();
      window.removeEventListener("online", schedule);
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [user, locale]);

  const signOut = useCallback(async () => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    mergedFor.current = null;
    setUser(null);
    // Local work is deliberately left in place. Signing out is not "delete my
    // revision" — the student keeps their device history and can sign back in.
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user, loading, enabled, syncState, mergedCount, signOut }),
    [user, loading, enabled, syncState, mergedCount, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (ctx) return ctx;
  return {
    user: null,
    loading: false,
    enabled: false,
    syncState: "idle",
    mergedCount: 0,
    signOut: async () => {},
  };
}
