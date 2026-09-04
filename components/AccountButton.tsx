"use client";

import { useEffect, useState } from "react";
import {
  signInWithGoogle,
  signOutOfTalap,
  syncStore,
  watchAuth,
  type AuthState,
} from "@/lib/firebase/sync";

/**
 * Sign in with Google, and keep this device's progress mirrored while signed in.
 *
 * Renders nothing at all when Firebase is not configured, so a checkout with no
 * environment still shows exactly the header it showed before accounts existed.
 * Signing in is optional by design: the paper, the marking and the dashboard
 * all work signed out, and the account only buys the history following you to
 * another device.
 */
export default function AccountButton() {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => watchAuth(setState), []);

  useEffect(() => {
    if (state.status !== "signed-in") return;
    return syncStore(state.user.uid);
  }, [state]);

  if (state.status === "disabled" || state.status === "loading") return null;

  const label =
    state.status === "signed-in"
      ? (state.user.name ?? state.user.email ?? "Аккаунт").split(" ")[0]
      : "ВОЙТИ";

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          if (state.status === "signed-in") await signOutOfTalap();
          else await signInWithGoogle();
        } catch {
          // A closed popup is the common case and is not worth an alert.
        } finally {
          setBusy(false);
        }
      }}
      className="pill press t-label no-underline shrink-0"
      style={{ cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}
      title={
        state.status === "signed-in"
          ? "Выйти — прогресс останется на этом устройстве"
          : "Войти через Google, чтобы прогресс был на всех устройствах"
      }
    >
      {state.status === "signed-in" ? `↳ ${label.toUpperCase()}` : label}
    </button>
  );
}
