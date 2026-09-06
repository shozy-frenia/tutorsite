import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Roboto_Mono } from "next/font/google";
import AskTalap from "@/components/AskTalap";
import PageTransition from "@/components/motion/PageTransition";
import ScrollProgress from "@/components/motion/ScrollProgress";
import "./globals.css";

/**
 * Three faces, all carrying Cyrillic.
 *
 * That last part is the constraint the whole type system bends around. The
 * reference this design follows sets its display type in Bricolage Grotesque,
 * which ships latin, latin-ext and vietnamese and no Cyrillic at all — every
 * Russian and Kazakh headline on the site would fall back to the system face
 * mid-word. Manrope is the closest geometric grotesque that carries cyrillic
 * and cyrillic-ext, so it takes the display role instead.
 */
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Talap — Ace Cambridge Exams Without the Burnout",
  description:
    "Mock exams, real NIS grade boundaries and an AI tutor for students sitting the Cambridge International Examination (МЭСК) at Nazarbayev Intellectual Schools.",
  keywords: ["NIS", "МЭСК", "Cambridge", "Nazarbayev Intellectual Schools", "exam prep"],
};

export const viewport: Viewport = {
  themeColor: "#fcfaf5",
  colorScheme: "light",
};

/**
 * Arms the entrance animations before the first paint.
 *
 * The `.enter*` rules in globals.css only hide anything once `js-motion` is on
 * the root element, and this is the only place that can add it early enough:
 * a class set from a React effect lands after paint, so the hero would flash
 * fully composed and then jump back to its start position.
 *
 * The timeout is the safety net. HeroIntro stamps `data-motion-ready` as soon
 * as it mounts; if it never does — the chunk 404s, GSAP throws, the component
 * is removed from the page — the gate is dropped and everything it was hiding
 * becomes visible. A missing animation is a shrug; a blank hero is not.
 */
const ARM_MOTION = `(function(){try{
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var d=document.documentElement;d.classList.add('js-motion');
setTimeout(function(){if(!d.dataset.motionReady)d.classList.remove('js-motion');},2500);
}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${manrope.variable} ${robotoMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ARM_MOTION }} />
      </head>
      <body>
        <ScrollProgress />
        <PageTransition>{children}</PageTransition>
        <AskTalap />
      </body>
    </html>
  );
}
