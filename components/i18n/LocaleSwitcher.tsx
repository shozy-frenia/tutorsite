"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { LOCALES, LOCALE_LABEL, LOCALE_SHORT, type Locale } from "@/lib/i18n";

/**
 * Language switcher.
 *
 * Two shapes from one component:
 *   · `segmented` — all three locales visible at once. Used in the profile
 *     setup and the footer, where there is room and where being able to see
 *     that Kazakh exists is the point.
 *   · `menu` — a single button that opens the list. Used in the header, where
 *     three 44px targets would eat the phone bar.
 *
 * Switching never navigates. The locale is a cookie, so a shared link opens in
 * the reader's own language rather than the sender's.
 */
export default function LocaleSwitcher({
  variant = "menu",
  className = "",
}: {
  variant?: "menu" | "segmented";
  className?: string;
}) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "segmented") {
    return (
      <div
        className={`seg ${className}`}
        role="group"
        aria-label={t("nav.language")}
      >
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={l === locale}
            onClick={() => setLocale(l)}
          >
            {LOCALE_LABEL[l]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <button
        type="button"
        className="btn btn--outline btn--sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.language")}
        onClick={() => setOpen((v) => !v)}
      >
        <GlobeIcon />
        <span className="t-micro">{LOCALE_SHORT[locale]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("nav.language")}
          className="card absolute right-0 z-50 mt-2 min-w-[168px] overflow-hidden p-1"
        >
          {LOCALES.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                className="flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left text-[14px] font-medium"
                style={
                  l === locale
                    ? { background: "var(--color-highlighter-yellow)" }
                    : undefined
                }
                onClick={() => {
                  setLocale(l as Locale);
                  setOpen(false);
                }}
              >
                <span>{LOCALE_LABEL[l]}</span>
                {l === locale && <CheckIcon />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.6 10h14.8M10 2.6c1.9 2 3 4.6 3 7.4s-1.1 5.4-3 7.4c-1.9-2-3-4.6-3-7.4s1.1-5.4 3-7.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8.4 6.2 11.6 13 4.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
