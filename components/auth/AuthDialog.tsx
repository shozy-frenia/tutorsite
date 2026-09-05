"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/components/i18n/LocaleProvider";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Sign-in dialog.
 *
 * Opened only on an explicit action — the header button, the account panel, or
 * a soft prompt shown *after* a first paper is finished. It is never shown on
 * arrival. One pilot asked for "удобство входа и сохранение данных", and the
 * point of that request is durability, not a gate: they wanted their work kept,
 * not a form to fill in before they could start.
 *
 * Two routes in, both passwordless. Schoolchildren at NIS already carry Google
 * accounts, and a magic link avoids asking a 16-year-old to invent and remember
 * yet another password.
 */
export default function AuthDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const signInWithGoogle = async () => {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const sendLink = async () => {
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setStatus("error");
      setMessage(t("auth.invalidEmail"));
      return;
    }
    const supabase = supabaseBrowser();
    if (!supabase) return;

    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setMessage(t("auth.linkError"));
      return;
    }
    setStatus("sent");
    setMessage(t("auth.linkSent", { email: trimmed }));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(25,23,16,0.32)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="card drawer-in w-full max-w-[440px] p-6 sm:p-7"
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingBottom: "calc(24px + var(--safe-b))",
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="auth-title" className="t-h2">
              {t("auth.title")}
            </h2>
            <p className="t-caption mt-2">{t("auth.sub")}</p>
          </div>
          <button
            type="button"
            className="btn btn-quiet btn-sm"
            onClick={onClose}
            aria-label={t("common.close")}
          >
            ✕
          </button>
        </div>

        <button
          ref={firstFieldRef}
          type="button"
          className="btn btn-primary btn-block btn-lg"
          onClick={signInWithGoogle}
        >
          <GoogleGlyph />
          {t("auth.google")}
        </button>

        <div className="my-5 flex items-center gap-3">
          <hr className="rule flex-1" />
          <span className="t-micro muted">{t("auth.emailLabel")}</span>
          <hr className="rule flex-1" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            className={`field ${status === "error" ? "field-invalid" : ""}`}
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendLink();
            }}
            aria-label={t("auth.emailPlaceholder")}
          />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={sendLink}
            disabled={status === "sending"}
          >
            {status === "sending" ? (
              <span className="dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            ) : (
              t("auth.sendLink")
            )}
          </button>
        </div>

        {message && (
          <p
            className="t-caption mt-3"
            role="status"
            style={{
              color:
                status === "error" ? "var(--color-bad)" : "var(--color-ok)",
            }}
          >
            {message}
          </p>
        )}

        <p className="t-micro muted mt-6 leading-relaxed">{t("auth.privacy")}</p>

        <button type="button" className="btn btn-quiet btn-block mt-2" onClick={onClose}>
          {t("auth.later")}
        </button>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
