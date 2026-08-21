import Link from "next/link";
import Nav from "@/components/Nav";
import HeroCanvas from "@/components/HeroCanvas";
import BoundaryExplorer from "@/components/landing/BoundaryExplorer";
import PhoneShowcase from "@/components/landing/PhoneShowcase";
import RevealButton from "@/components/motion/RevealButton";
import SubjectRibbon from "@/components/motion/SubjectRibbon";
import MaskedReveal from "@/components/motion/MaskedReveal";
import { GRADE_STAGES, examSubjectsFor } from "@/data/curriculum";
import { allBoundarySets } from "@/data/grade-boundaries";
import { PAPERS } from "@/data/exams";
import { availableMarks } from "@/data/exams";

/**
 * Landing page — neo-brutalist register.
 *
 * Heavy 3px borders, hard offset shadows, oversized display type and the
 * highlighter yellow doing all the labelling work. The 3D hero sits inside a
 * ruled frame rather than bleeding off the page, so the printed-poster
 * structure survives the addition of a canvas.
 */

// Short, decorative labels for the SubjectRibbon — not the official subject
// names (those stay exact on the Grade 10/11/12 cards below, where they carry
// real meaning). The ribbon is aria-hidden and unit length has to stay well
// under the wave path's length or the loop overlaps into unreadable text.
const SUBJECT_RIBBON = [
  "MATHEMATICS",
  "PHYSICS",
  "CHEMISTRY",
  "BIOLOGY",
  "COMPUTER SCIENCE",
  "HISTORY",
  "ENGLISH",
  "KAZAKH",
  "RUSSIAN",
  "GEOGRAPHY",
];

const FEATURES = [
  {
    badge: "NIS SPECIFIC",
    title: "Real papers, not\napproximations",
    body: "Two full Grade 10 Mathematics Paper 1 sittings, transcribed question by question with the mark scheme that earns each mark.",
    span: "md:col-span-3 md:row-span-2",
    accent: true,
  },
  {
    badge: "OFFICIAL SCALE",
    title: "The actual boundary table",
    body: "A C in Maths Paper 1 starts at 36/80. A C in Chemistry Paper 1 starts at 44/90. We use the published tables, never a flat percentage.",
    span: "md:col-span-3",
  },
  {
    badge: "AI POWERED",
    title: "A tutor that reads your working",
    body: "It starts from the step you missed, quotes the mark scheme wording, and answers in Kazakh, Russian or English — whichever you wrote in.",
    span: "md:col-span-2",
  },
  {
    badge: "INFINITE DRILL",
    title: "Same topic, same tariff, new numbers",
    body: "Ask for another question at this level and get one: same syllabus strand, same mark count, same number of reasoning steps.",
    span: "md:col-span-2",
  },
  {
    badge: "TRACKED",
    title: "Every attempt, plotted",
    body: "Mastery by topic, grade projection from U to A*, and the streak counter that makes you open it tomorrow.",
    span: "md:col-span-2",
  },
];

export default function Home() {
  const totalQuestions = PAPERS.reduce((sum, p) => sum + p.questions.length, 0);
  const totalMarks = PAPERS.reduce((sum, p) => sum + availableMarks(p), 0);

  return (
    <main>
      <Nav />

      {/* ---------------------------------------------------------------- HERO */}
      <section className="px-5 md:px-10">
        <div className="brutal" style={{ boxShadow: "var(--shadow-brutal-lg)" }}>
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-5 md:p-8 flex flex-col justify-between gap-8">
              <div>
                <span className="mark t-label">МЭСК · NIS · CAMBRIDGE</span>
                <h1 className="t-display mt-5">
                  Ace Cambridge
                  <br />
                  exams without
                  <br />
                  the <span className="mark">burnout</span>
                </h1>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <p style={{ maxWidth: "46ch" }}>
                  Mock papers taken from the real thing, marked against the real boundary
                  table, with a tutor that explains the one step you actually got wrong.
                </p>
                <p style={{ maxWidth: "46ch" }}>
                  Built for students sitting the Cambridge International Examination at
                  Nazarbayev Intellectual Schools. Grades 10, 11 and 12.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <RevealButton
                  href="/library"
                  fill="var(--color-highlighter)"
                  textColor="var(--color-ink)"
                  hoverFill="var(--color-ink)"
                  hoverTextColor="var(--color-canvas)"
                >
                  Sit a mock exam →
                </RevealButton>
                <RevealButton
                  href="/dashboard"
                  fill="var(--color-canvas)"
                  textColor="var(--color-ink)"
                  hoverFill="var(--color-ink)"
                  hoverTextColor="var(--color-canvas)"
                >
                  See the dashboard
                </RevealButton>
              </div>
            </div>

            {/* 3D canvas, framed rather than full-bleed */}
            <div
              className="relative min-h-[380px] lg:min-h-[560px] border-t-[3px] lg:border-t-0 lg:border-l-[3px]"
              style={{ borderColor: "var(--color-ink)" }}
            >
              <HeroCanvas />
              <div className="absolute left-4 top-4 pointer-events-none">
                <span className="mark t-micro">DRAG · HOVER · CLICK</span>
              </div>
              <div className="absolute right-4 bottom-4 pointer-events-none t-micro text-right">
                THE GRADE LADDER
                <br />
                A* DOWN TO U
              </div>
            </div>
          </div>

          {/* Ticker strip */}
          <div
            className="border-t-[3px] overflow-hidden"
            style={{ borderColor: "var(--color-ink)", background: "var(--color-ink)" }}
          >
            <div className="flex whitespace-nowrap marquee-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0">
                  {[
                    `${PAPERS.length} FULL MOCK PAPERS`,
                    `${totalQuestions} QUESTIONS`,
                    `${totalMarks} MARKS`,
                    `${allBoundarySets().length} OFFICIAL BOUNDARY TABLES`,
                    "NO CALCULATOR",
                    "90 MINUTES",
                    "A* TO U",
                  ].map((item) => (
                    <span
                      key={`${copy}-${item}`}
                      className="t-label px-6 py-3"
                      style={{ color: "var(--color-canvas)" }}
                    >
                      {item} <span style={{ color: "var(--color-highlighter)" }}>✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- FEATURES */}
      <section className="px-5 md:px-10 mt-12 md:mt-14">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <h2 className="t-heading" style={{ maxWidth: "16ch" }}>
            What it actually does
          </h2>
          <span className="t-label pb-2">↳ FOUR THINGS, DONE PROPERLY</span>
        </div>

        <div className="grid md:grid-cols-6 gap-5">
          {FEATURES.map((feature) => (
            <article
              key={feature.badge}
              className={`brutal press p-5 md:p-6 flex flex-col gap-3 ${feature.span}`}
              style={
                feature.accent
                  ? { background: "var(--color-highlighter)" }
                  : undefined
              }
            >
              <span
                className="t-micro self-start px-2 py-1"
                style={{
                  background: feature.accent ? "var(--color-ink)" : "var(--color-highlighter)",
                  color: feature.accent ? "var(--color-canvas)" : "var(--color-ink)",
                }}
              >
                {feature.badge}
              </span>
              <h3 className="t-subheading whitespace-pre-line">{feature.title}</h3>
              <p className="text-[16px]" style={{ lineHeight: 1.3 }}>
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- SUBJECTS */}
      <section className="px-5 md:px-10 mt-10 md:mt-12" aria-hidden="true">
        <SubjectRibbon items={SUBJECT_RIBBON} />
      </section>

      {/* ---------------------------------------------------------------- GRADES */}
      <section className="px-5 md:px-10 mt-10 md:mt-12">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <h2 className="t-heading" style={{ maxWidth: "14ch" }}>
            Three years, three different exams
          </h2>
          <span className="t-label pb-2">↳ THE ARCHITECTURE</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {GRADE_STAGES.map((stage) => (
            <article key={stage.year} className="brutal flex flex-col">
              <div
                className="flex items-baseline justify-between px-5 py-4 border-b-[3px]"
                style={{ borderColor: "var(--color-ink)", background: "var(--color-ink)" }}
              >
                <span
                  className="t-heading-sm"
                  style={{ color: "var(--color-highlighter)", lineHeight: 0.8 }}
                >
                  {stage.year}
                </span>
                <span className="t-micro" style={{ color: "var(--color-canvas)" }}>
                  GRADE
                </span>
              </div>

              <div className="p-5 flex flex-col gap-3 grow">
                <h3 className="t-subheading">{stage.title}</h3>
                <span className="mark t-micro self-start">{stage.standard}</span>
                <p className="text-[16px]" style={{ lineHeight: 1.3 }}>
                  {stage.summary}
                </p>

                <ul className="mt-auto pt-3 flex flex-wrap gap-2 list-none p-0">
                  {examSubjectsFor({
                    gradeYear: stage.year,
                    parallel: "kazakh",
                    profileSubjectIds: [],
                  }).map((subject) => (
                    <li
                      key={subject.id}
                      className="t-micro px-2 py-1"
                      style={{ border: "2px solid var(--color-ink)" }}
                    >
                      {subject.glyph} {subject.name}
                    </li>
                  ))}
                  {stage.year !== 11 && (
                    <li
                      className="t-micro px-2 py-1"
                      style={{ background: "var(--color-highlighter)", border: "2px solid var(--color-ink)" }}
                    >
                      + {stage.year === 12 ? "2 PROFILES" : "1 PROFILE"}
                    </li>
                  )}
                </ul>
              </div>

              <div
                className="px-5 py-3 border-t-[3px] t-label"
                style={{ borderColor: "var(--color-ink)", background: "var(--color-paper)" }}
              >
                {stage.load}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- BOUNDARY */}
      <section className="px-5 md:px-10 mt-12 md:mt-14">
        <BoundaryExplorer />
      </section>

      <PhoneShowcase />

      {/* ------------------------------------------------------------------ CTA */}
      <section className="px-5 md:px-10 mt-12 md:mt-14">
        <div
          className="brutal p-6 md:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
          style={{ background: "var(--color-ink)", boxShadow: "var(--shadow-brutal-lg)" }}
        >
          <MaskedReveal
            as="h2"
            className="t-heading"
            style={{ color: "var(--color-canvas)", maxWidth: "13ch" }}
            text="Start with one paper"
          />
          <div className="flex flex-col gap-4">
            <p style={{ color: "var(--color-canvas)", maxWidth: "40ch" }}>
              90 minutes, 18 questions, no calculator. You will know your grade the second
              you submit.
            </p>
            <RevealButton
              href="/library"
              className="self-start"
              fill="var(--color-highlighter)"
              textColor="var(--color-ink)"
              hoverFill="var(--color-canvas)"
              hoverTextColor="var(--color-ink)"
              border="3px solid var(--color-canvas)"
              shadow="5px 5px 0 var(--color-canvas)"
            >
              Choose a mock →
            </RevealButton>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- FOOTER */}
      <footer
        className="mt-12 px-5 md:px-10 py-8"
        style={{ background: "var(--color-ink)", color: "var(--color-canvas)" }}
      >
        <div className="flex flex-wrap justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="t-label">TALAP®</span>
            <span className="t-micro" style={{ opacity: 0.7 }}>
              МЭСК PREPARATION FOR NIS STUDENTS
            </span>
          </div>
          <div className="flex gap-10">
            <div className="flex flex-col gap-2">
              <span className="t-micro" style={{ opacity: 0.7 }}>
                PRACTISE
              </span>
              <Link href="/library" className="t-label no-underline" style={{ color: "inherit" }}>
                ↳ MOCK PAPERS
              </Link>
              <Link href="/dashboard" className="t-label no-underline" style={{ color: "inherit" }}>
                ↳ DASHBOARD
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="t-micro" style={{ opacity: 0.7 }}>
                SCALE
              </span>
              <span className="t-label">↳ A* A B C D E U</span>
              <span className="t-label">↳ OFFICIAL BOUNDARIES</span>
            </div>
          </div>
        </div>
        <p className="t-micro mt-8" style={{ opacity: 0.55, maxWidth: "70ch" }}>
          DEMO BUILD. QUESTION CONTENT TRANSCRIBED FROM NIS PAST PAPERS FOR STUDY USE.
          GRADE BOUNDARIES FROM THE PUBLISHED МЭСК TABLE.
        </p>
      </footer>
    </main>
  );
}
