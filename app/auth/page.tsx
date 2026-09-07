import { Suspense } from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Вход — Talap",
  description:
    "Войти в Talap или создать аккаунт, чтобы прогресс по пробникам МЭСК открывался на всех устройствах.",
  // A sign-in screen has nothing for a search engine and should not compete
  // with the pages that do.
  robots: { index: false, follow: true },
};

/**
 * Sign-in and registration.
 *
 * A page rather than a dialog. Signing in is a detour from whatever the
 * student was doing, and a detour needs somewhere to stand: a URL you can link
 * to from the header, from the account panel, from an expired-session redirect,
 * and that survives a refresh with the typed email still on screen.
 *
 * `AuthForm` reads `next` from the query string, so every one of those entry
 * points can send the student back where they came from.
 */
export default function AuthPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <Nav />
      <section className="shell section-tight auth-page">
        {/* useSearchParams needs a suspense boundary to keep this page from
            opting the whole route into client-side rendering. */}
        <Suspense fallback={null}>
          <AuthForm />
        </Suspense>
      </section>
    </main>
  );
}
