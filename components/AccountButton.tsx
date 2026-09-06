"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOutOfTalap, watchAuth, type AuthState } from "@/lib/firebase/auth";
import { firebaseSyncEnabled } from "@/lib/firebase/client";
import { syncStore } from "@/lib/firebase/sync";

/**
 * The account control in the header.
 *
 * This used to *be* the entire account surface: one button that opened a
 * Google popup and had no answer for a student without a Google account, a
 * blocked popup, or a forgotten password. It is now a signpost to `/auth`,
 * which is the actual window, and the only thing it still does itself is sign
 * out — the one action that needs no form.
 *
 * It also renders when Firebase is unconfigured, where before it returned null
 * and the header simply had no entry point at all. A link to a page that
 * explains why sign-in is off is more useful than a silent absence, and it
 * keeps the header's shape identical between a configured and unconfigured
 * deploy.
 */
export default function AccountButton() {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => watchAuth(setState), []);

  // Whichever page the student is on, being signed in means their progress is
  // mirrored. The dashboard is not the only screen that writes attempts.
  useEffect(() => {
    if (state.status !== "signed-in" || !firebaseSyncEnabled) return undefined;
    return syncStore(state.user.uid);
  }, [state]);

  if (state.status === "loading") {
    return <span style={{ width: 78 }} aria-hidden="true" />;
  }

  if (state.status === "signed-in") {
    const label = (state.user.name ?? state.user.email ?? "Аккаунт").split(/[\s@]/)[0];
    return (
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await signOutOfTalap();
          } finally {
            setBusy(false);
          }
        }}
        className="nav-link shrink-0 whitespace-nowrap"
        style={{ cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}
        title="Выйти — прогресс останется на этом устройстве"
      >
        <span
          aria-hidden="true"
          className="inline-grid place-items-center mr-2 shrink-0"
          style={{
            width: 22,
            height: 22,
            borderRadius: "var(--radius-full)",
            background: "var(--color-highlighter)",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {label.slice(0, 1).toUpperCase()}
        </span>
        Sign out
      </button>
    );
  }

  return (
    <Link href="/auth" className="nav-link no-underline shrink-0 whitespace-nowrap">
      Sign in
    </Link>
  );
}
