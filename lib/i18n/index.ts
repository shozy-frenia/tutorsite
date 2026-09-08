import {
  DICTIONARIES,
  FALLBACK_LOCALE,
  LOCALES,
  LOCALE_TAG,
  type Locale,
} from "./dictionary";
import type { Parallel } from "@/data/curriculum";

export {
  LOCALES,
  LOCALE_LABEL,
  LOCALE_SHORT,
  LOCALE_TAG,
  type Locale,
} from "./dictionary";

export const LOCALE_COOKIE = "talap.locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * The locale a student most likely wants before they have told us.
 *
 * Order of precedence:
 *   1. An explicit choice, stored in the `talap.locale` cookie.
 *   2. Their parallel, once a profile exists. 21 of 26 pilots are Kazakh
 *      parallel, and a Kazakh-parallel student reading an English interface is
 *      exactly the complaint we got.
 *   3. The Accept-Language header.
 *   4. Russian — the safest default in Kazakhstan for someone we know nothing
 *      about, since a Kazakh-parallel student reads Russian comfortably far
 *      more often than the reverse.
 */
export function localeFromParallel(parallel: Parallel): Locale {
  return parallel === "kazakh" ? "kk" : "ru";
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    if (tag.startsWith("kk")) return "kk";
    if (tag.startsWith("ru")) return "ru";
    if (tag.startsWith("en")) return "en";
  }
  return null;
}

export const DEFAULT_LOCALE: Locale = "ru";

/**
 * Translate.
 *
 * Missing keys fall back to English and then to the key itself, so a gap in a
 * translation shows readable English rather than `dash.mastery` on screen.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw =
    DICTIONARIES[locale]?.[key] ?? DICTIONARIES[FALLBACK_LOCALE][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

/** A `t` bound to one locale, for server components that have no context. */
export function translator(locale: Locale) {
  return (key: string, vars?: Record<string, string | number>) =>
    translate(locale, key, vars);
}

/* --------------------------------------------------------------------------
   Formatting

   Dates and numbers go through Intl with the locale's real BCP-47 tag, so a
   Kazakh student sees "5 наурыз" and not "5 March".
   -------------------------------------------------------------------------- */

export function formatDate(locale: Locale, iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale]).format(value);
}

/**
 * Duration as mm:ss. Deliberately not localised — a timer on an exam sheet is
 * read as digits in every locale, and colons survive translation.
 */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/* --------------------------------------------------------------------------
   Content localisation

   Exam content is a separate problem from UI copy. Question stems live in
   data/exams/*.ts and are currently English-only. Rather than fork the data
   files per locale, every localisable content string becomes an optional
   record keyed by locale, and `pickContent` resolves it with a fallback.

   This lets papers be translated incrementally — a question that has a Kazakh
   stem serves it, one that does not still renders in English instead of
   breaking. Which matters, because the pilot who raised this sits Grade 10
   maths in Kazakh and needs those specific papers first, not all of them.
   -------------------------------------------------------------------------- */

export type Localised<T = string> = T | Partial<Record<Locale, T>>;

function isLocalisedRecord<T>(value: Localised<T>): value is Partial<Record<Locale, T>> {
  return (
    typeof value === "object" &&
    value !== null &&
    LOCALES.some((l) => l in (value as object))
  );
}

/**
 * Resolve a localised content value.
 *
 * Fallback order: requested locale → Russian → English → any locale present.
 * Russian sits ahead of English because a Kazakh-parallel student who lacks a
 * Kazakh stem reads the Russian one far more comfortably than the English one.
 */
export function pickContent<T>(value: Localised<T>, locale: Locale): T {
  if (!isLocalisedRecord(value)) return value;
  const order: Locale[] = [locale, "ru", "en", "kk"];
  for (const l of order) {
    const hit = value[l];
    if (hit !== undefined) return hit;
  }
  // Every branch above missed — return whatever the record does carry.
  return Object.values(value)[0] as T;
}

/** True when this content has a stem in the requested locale. */
export function hasLocale<T>(value: Localised<T>, locale: Locale): boolean {
  return isLocalisedRecord(value) ? value[locale] !== undefined : false;
}

/**
 * A subject's name in the reader's language.
 *
 * Subject names are content, not chrome, so they live beside the curriculum
 * rather than in the dictionary — one entry per subject, not one per subject
 * per string. Falls back to English, which is also what the papers print.
 */
export function subjectName(
  subject: { name: string; nameKk?: string; nameRu?: string },
  locale: Locale
): string {
  if (locale === "kk") return subject.nameKk ?? subject.name;
  if (locale === "ru") return subject.nameRu ?? subject.name;
  return subject.name;
}
