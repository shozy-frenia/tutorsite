"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { firebaseAuth, firebaseEnabled } from "./client";

/**
 * Accounts.
 *
 * The pilot asked for this in as many words — "удобство входа и сохранение
 * данных" was one student's entire answer to what would make them switch. The
 * previous build had a single Google button in the header and nothing else:
 * no registration, no email option, no way to recover, and no page to land on
 * if the popup was blocked. This module is the whole of what an account needs
 * and `app/auth/page.tsx` is the window it opens in.
 *
 * Two providers, deliberately. Google is one tap and most students have a
 * school account already; email and password exists because some do not, and
 * because a blocked popup should never be the end of the road.
 */

export type AuthState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "signed-out" }
  | {
      status: "signed-in";
      user: { uid: string; name: string | null; email: string | null; photo: string | null };
    };

/** Watch sign-in state. Returns an unsubscribe, or a no-op when unconfigured. */
export function watchAuth(onChange: (state: AuthState) => void): () => void {
  const auth = firebaseAuth();
  if (!firebaseEnabled || !auth) {
    onChange({ status: "disabled" });
    return () => {};
  }
  onChange({ status: "loading" });
  return onAuthStateChanged(auth, (user: User | null) => {
    onChange(
      user
        ? {
            status: "signed-in",
            user: {
              uid: user.uid,
              name: user.displayName,
              email: user.email,
              photo: user.photoURL,
            },
          }
        : { status: "signed-out" }
    );
  });
}

function requireAuth() {
  const auth = firebaseAuth();
  if (!auth) throw new AuthError("not-configured");
  return auth;
}

/**
 * A sign-in failure with a message a sixteen-year-old can act on.
 *
 * Firebase's own errors are codes like `auth/invalid-credential`, and showing
 * one to a student is the same as showing nothing. Every code this app can
 * actually produce is mapped; anything unmapped falls through to a generic
 * line rather than leaking the code itself.
 */
export class AuthError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(messageFor(code));
    this.code = code;
    this.name = "AuthError";
  }
}

function messageFor(code: string): string {
  switch (code) {
    case "not-configured":
      return "Вход пока не настроен на этом сервере.";
    case "auth/invalid-email":
      return "Проверь адрес почты — в нём опечатка.";
    case "auth/missing-password":
      return "Введи пароль.";
    case "auth/weak-password":
      return "Пароль слишком короткий — нужно минимум 6 символов.";
    case "auth/email-already-in-use":
      return "На эту почту аккаунт уже есть. Войди вместо регистрации.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Почта или пароль не подходят.";
    case "auth/too-many-requests":
      return "Слишком много попыток. Подожди пару минут.";
    case "auth/network-request-failed":
      return "Нет связи с сервером. Проверь интернет.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Окно Google закрылось. Попробуй ещё раз.";
    case "auth/popup-blocked":
      return "Браузер заблокировал окно Google — открываем вход на этой странице.";
    case "auth/unauthorized-domain":
      return "Этот домен не разрешён в настройках Firebase.";
    case "auth/operation-not-allowed":
      return "Этот способ входа выключен в консоли Firebase.";
    default:
      return "Не получилось войти. Попробуй ещё раз.";
  }
}

/**
 * Fail a hung request rather than spinning forever.
 *
 * Firebase's SDK has no request timeout of its own: if `identitytoolkit`
 * cannot be reached — a captive portal, a school firewall, a network that
 * accepts the connection and never answers — the promise simply never
 * settles. The button then sits on "Секунду…" indefinitely, which is
 * indistinguishable from a broken button and is the same class of fault five
 * pilots reported against the tutor ("отвечал долго или не ответил").
 *
 * Fifteen seconds is well past a slow-but-working sign-in and well short of
 * the point where someone reloads the page. Applied to the three calls that
 * are one round trip; the Google popup is excluded, and says why at its own
 * call site.
 */
async function withTimeout<T>(work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new AuthError("auth/network-request-failed")), 15_000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function wrap(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "unknown";
  return new AuthError(code);
}

/**
 * Google, by popup, falling back to a full-page redirect.
 *
 * A popup is the better experience — the student stays on the page and the
 * app's state survives — but popups are blocked often enough on mobile
 * browsers that treating a block as a failure would strand exactly the group
 * that matters most here: fourteen of twenty-six pilots were on a phone.
 */
export async function signInWithGoogle(): Promise<void> {
  const auth = requireAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    // Deliberately not wrapped in withTimeout. The other calls are a single
    // round trip the student cannot influence; this one waits on a human
    // choosing an account in a second window, which fairly takes longer than
    // any timeout worth setting. Abandoning it also shows an error and then
    // signs them in anyway when they finish, which is worse than waiting.
    // A closed popup already reports itself as auth/popup-closed-by-user.
    await signInWithPopup(auth, provider);
  } catch (error) {
    const wrapped = wrap(error);
    if (wrapped.code === "auth/popup-blocked" || wrapped.code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw wrapped;
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<void> {
  const auth = requireAuth();
  try {
    const credential = await withTimeout(
      createUserWithEmailAndPassword(auth, email.trim(), password)
    );
    const displayName = name.trim();
    if (displayName) await updateProfile(credential.user, { displayName });
  } catch (error) {
    throw wrap(error);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const auth = requireAuth();
  try {
    await withTimeout(signInWithEmailAndPassword(auth, email.trim(), password));
  } catch (error) {
    throw wrap(error);
  }
}

export async function sendReset(email: string): Promise<void> {
  const auth = requireAuth();
  try {
    await withTimeout(sendPasswordResetEmail(auth, email.trim()));
  } catch (error) {
    throw wrap(error);
  }
}

export async function signOutOfTalap(): Promise<void> {
  const auth = firebaseAuth();
  if (auth) await signOut(auth);
}
