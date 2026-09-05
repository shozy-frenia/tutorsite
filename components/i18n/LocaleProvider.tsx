"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_TAG,
  isLocale,
  translate,
  type Locale,
} from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Locale state for the whole client tree.
 *
 * The initial value is resolved on the server (cookie → Accept-Language →
 * default) and passed in, so the first paint is already in the right language
 * and there is no flash of English. After that the choice is a cookie, not a
 * route prefix: /library stays /library in all three locales, which keeps every
 * link the pilots have already shared working.
 */
export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      // One year, site-wide, lax — this is a preference, not a credential.
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* cookies blocked — the choice still holds for this session */
    }
    document.documentElement.lang = LOCALE_TAG[next];
    window.dispatchEvent(new CustomEvent("talap:locale", { detail: next }));
  }, []);

  // Keep <html lang> honest for screen readers and for Intl on first mount.
  useEffect(() => {
    document.documentElement.lang = LOCALE_TAG[locale];
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * Read the locale.
 *
 * Falls back to the default rather than throwing when used outside the
 * provider, so a stray component never takes a page down over a missing
 * context — the same defensive stance lib/storage.ts already takes.
 */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx) return ctx;
  return {
    locale: DEFAULT_LOCALE,
    setLocale: () => {},
    t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
  };
}

/** Convenience: just the translate function. */
export function useT() {
  return useLocale().t;
}

export { isLocale };
