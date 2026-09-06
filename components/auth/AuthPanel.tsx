"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthError,
  registerWithEmail,
  sendReset,
  signInWithEmail,
  signInWithGoogle,
  watchAuth,
  type AuthState,
} from "@/lib/firebase/auth";
import { firebaseEnabled, firebaseSyncEnabled } from "@/lib/firebase/client";
import { syncStore } from "@/lib/firebase/sync";
import { readStore } from "@/lib/storage";

type Mode = "sign-in" | "register" | "reset";

const COPY: Record<Mode, { title: string; action: string; swap: string; swapTo: Mode }> = {
  "sign-in": {
    title: "С возвращением",
    action: "Войти",
    swap: "Ещё нет аккаунта? Зарегистрироваться",
    swapTo: "register",
  },
  register: {
    title: "Создать аккаунт",
    action: "Зарегистрироваться",
    swap: "Уже есть аккаунт? Войти",
    swapTo: "sign-in",
  },
  reset: {
    title: "Восстановить пароль",
    action: "Отправить ссылку",
    swap: "Вспомнил пароль? Войти",
    swapTo: "sign-in",
  },
};

/**
 * The sign-in window.
 *
 * The pilot's answer to "чего не хватает, чтобы ты пользовался этим" included,
 * verbatim, "удобство входа и сохранение данных". Before this the entire
 * account surface was one Google button in the header — no registration, no
 * email path, no recovery, and nothing to look at if the popup was blocked.
 *
 * Three things this screen is careful about:
 *
 *   1. It never blocks the product. Everything on Talap works signed out, and
 *      this page says so in as many words rather than pretending an account is
 *      a gate. The local progress count is read live so the promise it makes —
 *      "these attempts will follow you" — is a real number, not a slogan.
 *   2. Errors are in the student's language and name the fix. Firebase's own
 *      `auth/invalid-credential` is mapped in lib/firebase/auth.ts.
 *   3. It works with no Firebase config at all: the form is replaced with an
 *      honest explanation instead of throwing on first render, so a checkout
 *      with an empty environment still builds and still renders this route.
 */
export default function AuthPanel() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<null | "google" | "email">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [localAttempts, setLocalAttempts] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => watchAuth(setState), []);

  useEffect(() => {
    setLocalAttempts(readStore().attempts.length);
  }, []);

  // Signing in is what the page is for, so as soon as it happens the student
  // should be looking at their progress, not at a form telling them they are
  // signed in. Sync starts first so the dashboard has the merged history.
  useEffect(() => {
    if (state.status !== "signed-in") return undefined;
    const stop = firebaseSyncEnabled ? syncStore(state.user.uid) : () => {};
    const timer = setTimeout(() => router.push("/dashboard"), 900);
    return () => {
      clearTimeout(timer);
      stop();
      // The dashboard mounts its own sync, so tearing this one down on the way
      // out is correct and not a gap.
    };
  }, [state, router]);

  const run = async (kind: "google" | "email", fn: () => Promise<void>) => {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      await fn();
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Не получилось. Попробуй ещё раз.");
    } finally {
      setBusy(null);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "reset") {
      void run("email", async () => {
        await sendReset(email);
        setNotice(`Ссылка отправлена на ${email.trim()}. Проверь почту и папку «Спам».`);
      });
      return;
    }
    void run("email", () =>
      mode === "register"
        ? registerWithEmail(email, password, name)
        : signInWithEmail(email, password)
    );
  };

  /* ---------------------------------------------------------------- states */

  if (!firebaseEnabled) {
    return (
      <Shell>
        <h1 className="t-heading-sm">Вход ещё не подключён</h1>
        <p className="mt-4" style={{ color: "var(--color-muted)" }}>
          На этом сервере нет ключей Firebase, поэтому аккаунты выключены. Это ничего
          не ломает: пробники, проверка и прогресс работают без входа — всё хранится
          в этом браузере.
        </p>
        <Link href="/library" className="btn btn-primary mt-8 no-underline">
          К пробникам
        </Link>
      </Shell>
    );
  }

  if (state.status === "loading") {
    return (
      <Shell>
        <p className="t-label" style={{ color: "var(--color-muted)" }}>
          Проверяем сессию…
        </p>
      </Shell>
    );
  }

  if (state.status === "signed-in") {
    const who = state.user.name ?? state.user.email ?? "";
    return (
      <Shell>
        <span className="chip chip-mark">Вход выполнен</span>
        <h1 className="t-heading-sm mt-4">Готово{who ? `, ${who.split(" ")[0]}` : ""}</h1>
        <p className="mt-3" style={{ color: "var(--color-muted)" }}>
          Прогресс с этого устройства уже синхронизируется. Открываем твой дашборд…
        </p>
        <Link href="/dashboard" className="btn btn-primary mt-8 no-underline">
          Перейти сейчас
        </Link>
      </Shell>
    );
  }

  const copy = COPY[mode];

  return (
    <Shell>
      <h1 className="t-heading-sm">{copy.title}</h1>
      <p className="mt-3 text-[15px]" style={{ color: "var(--color-muted)" }}>
        {localAttempts > 0
          ? `Аккаунт нужен для одного: чтобы ${localAttempts} ${plural(localAttempts)} с этого устройства открывались и с телефона, и с ноутбука.`
          : "Аккаунт нужен для одного: чтобы твои работы открывались и с телефона, и с ноутбука. Решать можно и без него."}
      </p>

      {/* Google first — most students already have a school account, and one
          tap beats a form on a phone keyboard. */}
      <button
        type="button"
        onClick={() => void run("google", signInWithGoogle)}
        disabled={busy !== null}
        className="btn btn-outline w-full mt-7"
        style={{ padding: "13px 20px" }}
      >
        <GoogleGlyph />
        {busy === "google" ? "Открываем Google…" : "Продолжить с Google"}
      </button>

      <div className="flex items-center gap-3 my-6" aria-hidden="true">
        <span style={{ flex: 1, height: 1, background: "var(--color-rule)" }} />
        <span className="t-micro" style={{ color: "var(--color-muted)" }}>
          или почтой
        </span>
        <span style={{ flex: 1, height: 1, background: "var(--color-rule)" }} />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === "register" && (
          <Field
            label="Как тебя зовут"
            value={name}
            onChange={setName}
            type="text"
            autoComplete="name"
            placeholder="Аружан"
          />
        )}
        <Field
          label="Почта"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
          required
          inputRef={emailRef}
          placeholder="you@example.com"
        />
        {mode !== "reset" && (
          <Field
            label="Пароль"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            minLength={6}
            placeholder={mode === "register" ? "минимум 6 символов" : "••••••"}
          />
        )}

        {error && (
          <p
            role="alert"
            className="text-[14px] px-3 py-2.5"
            style={{
              background: "var(--color-signal-red-wash)",
              color: "var(--color-signal-red)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="text-[14px] px-3 py-2.5"
            style={{
              background: "var(--color-acid-lime-wash)",
              color: "var(--color-acid-lime)",
              borderRadius: "var(--radius-md)",
            }}
          >
            {notice}
          </p>
        )}

        <button type="submit" disabled={busy !== null} className="btn btn-primary w-full mt-1">
          {busy === "email" ? "Секунду…" : copy.action}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5 text-[14px]">
        <button
          type="button"
          className="auth-swap"
          onClick={() => {
            setMode(copy.swapTo);
            setError(null);
            setNotice(null);
          }}
        >
          {copy.swap}
        </button>
        {mode === "sign-in" && (
          <button
            type="button"
            className="auth-swap"
            onClick={() => {
              setMode("reset");
              setError(null);
              setNotice(null);
              emailRef.current?.focus();
            }}
          >
            Забыл пароль
          </button>
        )}
      </div>

      <p className="mt-7 text-[13px]" style={{ color: "var(--color-muted)" }}>
        Можно и не входить —{" "}
        <Link href="/library" style={{ color: "var(--color-ink)" }}>
          открыть пробники без аккаунта
        </Link>
        . Прогресс тогда останется только в этом браузере.
      </p>
    </Shell>
  );
}

function plural(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "работа";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "работы";
  return "работ";
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card w-full"
      style={{ maxWidth: 460, padding: "clamp(24px, 5vw, 40px)", boxShadow: "var(--shadow-float)" }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  inputRef,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  inputRef?: React.Ref<HTMLInputElement>;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="t-label" style={{ color: "var(--color-muted)" }}>
        {label}
      </span>
      <input
        {...rest}
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="auth-input"
      />
    </label>
  );
}

/** Google's mark, inline so the button has no network dependency. */
function GoogleGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-2.7-.4-4H24v7.3h12.1c-.2 2-1.6 5-4.5 7l6.9 5.3c4.1-3.8 6.6-9.4 6.6-15.6z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.3c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.1 5.5C8.1 41.1 15.5 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.5 28.5c-.5-1.4-.7-2.9-.7-4.5s.3-3.1.7-4.5l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 10z"
      />
      <path
        fill="#EA4335"
        d="M24 10.2c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.9 3.9 29.9 2 24 2 15.5 2 8.1 6.9 4.4 14l7.1 5.5c1.8-5.3 6.7-9.3 12.5-9.3z"
      />
    </svg>
  );
}
