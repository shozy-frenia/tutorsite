import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import AuthPanel from "@/components/auth/AuthPanel";

export const metadata: Metadata = {
  title: "Вход — Talap",
  description:
    "Войти в Talap через Google или по почте, чтобы прогресс по пробникам МЭСК открывался на всех устройствах.",
};

/**
 * The account window.
 *
 * A route of its own rather than a modal, because the pilot's complaint was
 * about the *absence* of a place to do this — a dialog that can only be
 * reached by finding one button in a header is barely more discoverable than
 * no dialog at all. A URL can be linked, bookmarked, redirected to after a
 * Google redirect flow, and opened from the phone the popup was blocked on.
 *
 * The right-hand column is here for one reason: signing up is the moment a
 * student is most likely to leave, so it states plainly what an account buys
 * and, more importantly, what it does not gate.
 */
export default function AuthPage() {
  return (
    <main style={{ minHeight: "100dvh" }}>
      <Nav />

      <div className="px-5 md:px-10 py-10 md:py-16">
        <div
          className="mx-auto grid gap-10 lg:gap-16 items-center"
          style={{ maxWidth: 1100, gridTemplateColumns: "minmax(0, 1fr)" }}
        >
          <div className="grid lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-10 lg:gap-16 items-center">
            <AuthPanel />

            <aside className="max-w-[420px]">
              <span className="t-label" style={{ color: "var(--color-muted)" }}>
                Зачем аккаунт
              </span>
              <h2 className="t-subheading mt-2">Три вещи, которые он делает</h2>

              <ul className="flex flex-col gap-3 mt-6">
                {REASONS.map((reason) => (
                  <li
                    key={reason.title}
                    className="px-4 py-3.5"
                    style={{
                      background: reason.tint,
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <strong className="block text-[15px] font-semibold">{reason.title}</strong>
                    <span className="block text-[14px] mt-1" style={{ lineHeight: 1.45 }}>
                      {reason.body}
                    </span>
                  </li>
                ))}
              </ul>

              <p
                className="text-[13px] mt-6"
                style={{ color: "var(--color-muted)", lineHeight: 1.5 }}
              >
                Мы храним только имя, почту и результаты твоих работ. Ничего из этого не
                видно другим ученикам — доступ к записи есть у того, кто в неё вошёл, и
                больше ни у кого.{" "}
                <Link href="/library" style={{ color: "var(--color-ink)" }}>
                  Решать можно и без входа
                </Link>
                .
              </p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

const REASONS = [
  {
    title: "Работы не теряются",
    body: "Решил на телефоне в автобусе — разбор открывается вечером на ноутбуке. Без входа история живёт только в одном браузере и пропадает, если его почистить.",
    tint: "var(--color-note-mint)",
  },
  {
    title: "Прогресс считается по всем работам",
    body: "Проекция оценки и карта тем строятся по всей истории сразу, а не по тому, что успело накопиться на одном устройстве.",
    tint: "var(--color-note-teal)",
  },
  {
    title: "Профиль подставляется сам",
    body: "Класс, параллель и профильные предметы запоминаются один раз, и библиотека сразу показывает те работы, которые ты реально сдаёшь.",
    tint: "var(--color-note-sky)",
  },
];
