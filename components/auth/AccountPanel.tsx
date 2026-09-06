"use client";

import { useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import AuthDialog from "@/components/auth/AuthDialog";
import { useT } from "@/components/i18n/LocaleProvider";
import { deleteEverything } from "@/lib/supabase/sync";
import { clearStore, type Store } from "@/lib/storage";

/**
 * Where the account becomes visible.
 *
 * Signing in is offered in the header, but the header cannot answer the only
 * question a student actually has about an account: *is my work safe?* This
 * panel answers it in one line, on the page where their record lives.
 *
 * It is deliberately the last block on the dashboard. The pilot who asked for
 * "удобство входа и сохранение данных" wanted durability, not a gate, so the
 * account is something you find after your progress exists — never something
 * standing between you and a paper.
 *
 * With no Supabase keys configured the panel renders nothing at all. Guest mode
 * has no account to describe, and a dead "sign in" button would be worse than
 * silence.
 */
export default function AccountPanel({
  onCleared,
}: {
  /** Called after a successful delete, so the dashboard can reset its state. */
  onCleared: (store: Store) => void;
}) {
  const t = useT();
  const { user, enabled, syncState, mergedCount, signOut } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!enabled) return null;

  const remove = async () => {
    if (!window.confirm(t("auth.deleteConfirm"))) return;
    setBusy(true);
    const ok = await deleteEverything();
    setBusy(false);

    if (!ok) {
      setMessage(t("auth.deleteFailed"));
      return;
    }

    // Local first, then sign out: if the sign-out round trip fails the device
    // is still clean, which is the half of the promise we can always keep.
    onCleared(clearStore());
    await signOut();
    setMessage(t("auth.deleteDone"));
  };

  if (!user) {
    return (
      <>
        <div className="panel account">
          <div className="account__body">
            <span className="mono muted">{t("auth.guestTitle")}</span>
            <p className="body-sm">{t("auth.guestPitch")}</p>
          </div>
          <button
            type="button"
            className="btn btn--yellow btn--sm shrink-0"
            onClick={() => setAuthOpen(true)}
          >
            <span className="btn__arrow">→</span>
            {t("auth.title")}
          </button>
        </div>
        <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  const who = user.email ?? user.user_metadata?.name ?? "—";

  return (
    <div className="panel account">
      <div className="account__body">
        <span className="mono muted">{t("auth.account")}</span>
        <p className="body-sm">{t("auth.signedInAs", { name: who })}</p>

        <p className="account__state">
          <span
            className={`account__dot account__dot--${syncState}`}
            aria-hidden="true"
          />
          <span className="micro">
            {syncState === "syncing"
              ? t("auth.syncing")
              : syncState === "error"
                ? t("auth.syncFailed")
                : t("auth.synced")}
          </span>
        </p>

        {mergedCount > 0 && (
          <p className="micro muted">
            {t("auth.merged", { count: String(mergedCount) })}
          </p>
        )}
        {message && (
          <p className="micro" role="status">
            {message}
          </p>
        )}
      </div>

      <div className="account__actions">
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => void signOut()}
        >
          {t("nav.signOut")}
        </button>
        <button
          type="button"
          className="btn btn--quiet btn--sm"
          onClick={() => void remove()}
          disabled={busy}
        >
          {t("auth.deleteData")}
        </button>
      </div>
    </div>
  );
}
