import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeFromAcceptLanguage,
  translate,
  type Locale,
} from "@/lib/i18n";

/**
 * Locale for a server component.
 *
 * Kept apart from `lib/i18n/index.ts` because it reaches for `next/headers`,
 * which only exists on the server — importing it from a client component is a
 * build error, and index.ts is imported by both.
 *
 * Cookie beats header beats default, the same order the root layout uses, so a
 * page and the layout wrapping it can never disagree about which language they
 * are rendering.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const saved = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const h = await headers();
  return localeFromAcceptLanguage(h.get("accept-language")) ?? DEFAULT_LOCALE;
}

/**
 * The locale and a bound `t`, which is what a page actually wants.
 *
 *   const { t, locale } = await getT();
 *   <h1>{t("landing.title.a")}</h1>
 */
export async function getT(): Promise<{
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
}> {
  const locale = await getLocale();
  return {
    locale,
    t: (key, vars) => translate(locale, key, vars),
  };
}
