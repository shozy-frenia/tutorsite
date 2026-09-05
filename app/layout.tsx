import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Inter,
  Roboto_Mono,
  Unbounded,
} from "next/font/google";
import { cookies, headers } from "next/headers";
import AskTalap from "@/components/AskTalap";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import SessionProvider from "@/components/auth/SessionProvider";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_TAG,
  isLocale,
  localeFromAcceptLanguage,
  translate,
  type Locale,
} from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
  // "latin-ext" and "cyrillic-ext" carry the Kazakh letters — ә ғ қ ң ө ұ ү һ і.
  // Without cyrillic-ext the Kazakh locale falls back to a system face mid-word,
  // which is visible and ugly.
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Display type is a two-font stack, and the reason is the alphabet.
 *
 * Bricolage Grotesque is the face the design is drawn in, but Google serves it
 * in latin, latin-ext and vietnamese only — it has no Cyrillic at all. Left on
 * its own it would hand every Kazakh and Russian heading to a system face, and
 * 21 of 26 pilots are in the Kazakh stream.
 *
 * So Unbounded sits behind it in the stack (see --font-display in globals.css).
 * It carries cyrillic and cyrillic-ext, which between them cover ә ғ қ ң ө ұ ү
 * һ і, and it is the same species of heavy geometric display face. The browser
 * resolves per glyph run, so Latin gets Bricolage, Cyrillic gets Unbounded, and
 * neither alphabet is ever split across two faces inside one word.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-bricolage",
});

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-unbounded",
});

/** Mono carries the labels, tickers and every tabular number. */
const robotoMono = Roboto_Mono({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-roboto-mono",
});

/**
 * The public origin, used for canonical and hreflang URLs.
 *
 * It is a variable rather than a constant because the deployed site
 * canonicalises to www — talap.online 308s to www.talap.online — and pointing
 * canonical at the address that redirects tells crawlers the wrong thing. Set
 * NEXT_PUBLIC_SITE_URL if that ever flips to the apex.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.talap.online"
).replace(/\/$/, "");

const fontVariables = [
  inter.variable,
  bricolage.variable,
  unbounded.variable,
  robotoMono.variable,
].join(" ");

/**
 * Resolve the locale before the first byte goes out.
 *
 * Cookie beats header beats default, so a student who has chosen Kazakh once
 * never sees a flash of Russian on the next visit.
 */
async function resolveLocale(): Promise<Locale> {
  const store = await cookies();
  const saved = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const h = await headers();
  return localeFromAcceptLanguage(h.get("accept-language")) ?? DEFAULT_LOCALE;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const t = (key: string) => translate(locale, key);

  return {
    title: `Talap — ${t("landing.title.a")} ${t("landing.title.b")}`,
    description: t("landing.sub"),
    keywords: [
      "NIS",
      "МЭСК",
      "Cambridge",
      "Nazarbayev Intellectual Schools",
      "exam prep",
      "ҰБТ",
      "сынақ",
    ],
    // The site is one URL per page in all three locales — the locale is a
    // cookie, not a path — so alternates point at the same href with different
    // hreflang, which is what tells crawlers the page is multilingual.
    alternates: {
      canonical: `${SITE_URL}/`,
      languages: {
        kk: `${SITE_URL}/`,
        ru: `${SITE_URL}/`,
        en: `${SITE_URL}/`,
      },
    },
  };
}

export const viewport: Viewport = {
  // Matches the cream paper canvas, so the browser chrome agrees with the page.
  themeColor: "#fcfaf5",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // Never lock zoom on a study tool — students pinch into diagrams constantly,
  // and 14 of 26 pilots were on a phone.
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await resolveLocale();

  return (
    <html lang={LOCALE_TAG[locale]} className={fontVariables}>
      <body>
        <LocaleProvider initial={locale}>
          <SessionProvider>
            {children}
            <AskTalap />
          </SessionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
