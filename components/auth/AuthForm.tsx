"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useSession } from "@/components/auth/SessionProvider";
import { useT } from "@/components/i18n/LocaleProvider";

type Mode = "signin" | "signup";
type Status = "idle" | "working" | "sent" | "error";

/**
 * Email and password, on a page of its own.
 *
 * The first build offered only a magic link in a modal. Both halves of that
 * were wrong for this audience: a student mid-revision does not want to leave
 * for their inbox and come back, and a dialog over the page they were reading
 * gives them nowhere to land. So password is the primary route and this is a
 * real URL — linkable, bookmarkable, and survivable by a refresh.
 *
 * The magic link stays as the way back in after a forgotten password. That is
 * deliberate rather than lazy: a full reset flow needs a second page and a
 * token handler, and the link already does the same job with code that is
 * written and verified. If password reset proper is wanted later, it slots in
 * where the link sits now.
 */
export default function AuthForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { user, enabled } = useSession();

  const [mode, setMode] = useState<Mode>(
    params.get("mode") === "signup" ? "signup" : "signin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Where to go once there is a session. Same-site paths only: `next` arrives
  // in a URL the student can edit, and an open redirect is not worth the
  // convenience of trusting it.
  const requested = params.get("next") ?? "/dashboard";
  const next =
    requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/dashboard";

  // Already signed in — nothing to do here.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const emailLooksRight = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = supabaseBrowser();
    if (!supabase || status === "working") return;

    if (!emailLooksRight) {
      setStatus("error");
      setMessage(t("auth.invalidEmail"));
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage(t("auth.passwordShort"));
      return;
    }

    setStatus("working");
    setMessage("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setStatus("error");
        // Supabase reports an existing address as a generic failure; naming it
        // saves the student guessing why their details "do not work".
        setMessage(
          /already|registered|exists/i.test(error.message)
            ? t("auth.alreadyRegistered")
            : t("auth.signUpFailed")
        );
        return;
      }

      // With email confirmation switched off the account is live immediately
      // and signUp hands back a session. With it on there is no session yet
      // and the student has to confirm first, so say so instead of pretending.
      if (!data.session) {
        setStatus("sent");
        setMessage(t("auth.linkSent", { email: email.trim() }));
        return;
      }

      router.replace(next);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      setMessage(t("auth.badCredentials"));
      return;
    }

    router.replace(next);
  }

  async function sendMagicLink() {
    const supabase = supabaseBrowser();
    if (!supabase) return;
    if (!emailLooksRight) {
      setStatus("error");
      setMessage(t("auth.invalidEmail"));
      return;
    }

    setStatus("working");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(t("auth.linkError"));
      return;
    }
    setStatus("sent");
    setMessage(t("auth.linkSent", { email: email.trim() }));
  }

  if (!enabled) {
    return (
      <div className="card card--plain auth-card">
        <p className="body-sm">{t("auth.workingAsGuest")}</p>
        <Link href="/library" className="btn btn--primary btn--sm">
          <span className="btn__arrow">→</span>
          {t("nav.start")}
        </Link>
      </div>
    );
  }

  const busy = status === "working";

  return (
    <div className="card card--plain auth-card">
      <div className="seg auth-card__tabs" role="group">
        {(["signin", "signup"] as Mode[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setStatus("idle");
              setMessage("");
            }}
          >
            {value === "signin" ? t("auth.tabSignIn") : t("auth.tabSignUp")}
          </button>
        ))}
      </div>

      <h1 className="h-sm">
        {mode === "signin" ? t("auth.signInTitle") : t("auth.signUpTitle")}
      </h1>
      <p className="body-sm muted">{t("auth.signInSub")}</p>

      <form className="auth-card__form" onSubmit={submit}>
        <label>
          <span className="field-label">{t("auth.email")}</span>
          <input
            type="email"
            autoComplete="email"
            required
            className={`field ${status === "error" ? "field-invalid" : ""}`}
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          <span className="field-label">{t("auth.password")}</span>
          <input
            type="password"
            // Tells the browser's password manager which of the two this is,
            // so it offers to save a new one rather than autofilling the old.
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={8}
            className={`field ${status === "error" ? "field-invalid" : ""}`}
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={busy}
        >
          {busy ? (
            <span className="dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : mode === "signin" ? (
            t("auth.doSignIn")
          ) : (
            t("auth.doSignUp")
          )}
        </button>
      </form>

      {message && (
        <p
          className="caption auth-card__message"
          role="status"
          style={{
            color:
              status === "error" ? "var(--color-bad)" : "var(--color-ok)",
          }}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        className="link-plain auth-card__link"
        onClick={() => void sendMagicLink()}
      >
        {t("auth.orMagicLink")}
      </button>

      <p className="micro muted">{t("auth.privacy")}</p>

      <Link href="/" className="caption muted auth-card__back">
        ← {t("auth.backToSite")}
      </Link>
    </div>
  );
}
