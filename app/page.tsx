import Link from "next/link";
import Nav from "@/components/Nav";
import HeroCanvas from "@/components/HeroCanvas";
import BoundaryExplorer from "@/components/landing/BoundaryExplorer";
import PhoneShowcase from "@/components/landing/PhoneShowcase";
import RevealButton from "@/components/motion/RevealButton";
import SubjectRibbon from "@/components/motion/SubjectRibbon";
import MaskedReveal from "@/components/motion/MaskedReveal";
import PointerLift from "@/components/motion/PointerLift";
import PaperCoverflow from "@/components/motion/PaperCoverflow";
import HeroIntro from "@/components/motion/HeroIntro";
import StaggerIn from "@/components/motion/StaggerIn";
import CountUp from "@/components/motion/CountUp";
import { GRADE_STAGES, examSubjectsFor, subjectById } from "@/data/curriculum";
import { allBoundarySets } from "@/data/grade-boundaries";
import { PAPERS, availableMarks, paperTopics } from "@/data/exams";

/**
 * Landing page — neo-brutalist register, after the pilot.
 *
 * Hard offset shadows, oversized display type and a ruled frame around the 3D
 * hero rather than a full bleed, so the printed-poster structure survives the
 * canvas. Two things changed when twenty-six testers scored the look 3.15/5
 * against 3.77 for usability: the highlighter stopped being the page's
 * labelling system (it now marks the headline and the one button that
 * matters), and the page grew an entrance — HeroIntro on load, StaggerIn and
 * CountUp on scroll. It had four scroll effects and still read as a still
 * image, because nothing moved in the seconds anyone actually watches.
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
    body: "A C in Maths Paper 1 starts at 36/80. A C in Chemistry Paper 1 starts at 45/90. We use the published tables, never a flat percentage.",
    span: "md:col-span-3",
  },
  {
    badge: "AI POWERED",
    title: "A tutor that reads your working",
    body: "It starts from the step you missed, quotes the mark scheme wording, and answers in Kazakh, Russian or English — whichever you wrote in.",
    span: "md:col-span-3",
  },
  {
    badge: "INFINITE DRILL",
    title: "Same topic, same tariff, new numbers",
    body: "Ask for another question at this level and get one: same syllabus strand, same mark count, same number of reasoning steps.",
    span: "md:col-span-3",
  },
  {
    badge: "TRACKED",
    title: "Every attempt, plotted",
    body: "Mastery by topic, grade projection from U to A*, and the streak counter that makes you open it tomorrow.",
    span: "md:col-span-3",
  },
];

export default function Home() {
  const totalQuestions = PAPERS.reduce((sum, p) => sum + p.questions.length, 0);
  const totalMarks = PAPERS.reduce((sum, p) => sum + availableMarks(p), 0);

  // Flattened for the coverflow, which is a client component and so can only
  // be handed plain serialisable values — not whole Paper objects with their
  // question banks attached.
  const coverflowPapers = [...PAPERS]
    .sort((a, b) => a.gradeYear - b.gradeYear)
    .map((paper) => {
      const subject = subjectById(paper.subjectId);
      return {
        id: paper.id,
        title: paper.title,
        subject: subject?.name ?? paper.subjectId,
        glyph: subject?.glyph ?? "",
        gradeYear: paper.gradeYear,
        sitting: paper.sitting,
        questions: paper.questions.length,
        marks: availableMarks(paper),
        minutes: paper.durationMinutes,
        calculator: Boolean(paper.calculator),
        pastPaper: paper.provenance === "transcribed",
        // Enough to show what the paper covers without spilling off a card
        // that is only 320px wide.
        topics: paperTopics(paper).slice(0, 5),
      };
    });

  return (
    <main>
      <Nav />

      {/* ---------------------------------------------------------------- HERO */}
      <HeroIntro>
        <section className="px-5 md:px-10">
          <div className="brutal" style={{ boxShadow: "var(--shadow-brutal-lg)" }}>
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-5 md:p-8 flex flex-col justify-between gap-8">
                <div>
                  {/* Demoted from a filled block: this is the fourth-most
                      important thing in the hero and was wearing the loudest
                      colour on the page. */}
                  <span className="mark-quiet t-label enter-rise" data-enter="eyebrow">
                    МЭСК · NIS · CAMBRIDGE
                  </span>
                  {/* Each line is its own clipping band so the headline can ride
                      up out of the page rather than fading in flat. */}
                  <h1 className="t-display mt-5">
                    <span className="line-mask">
                      <span>Ace Cambridge</span>
                    </span>
                    <span className="line-mask">
                      <span>exams without</span>
                    </span>
                    <span className="line-mask">
                      <span>
                        the <span className="mark">burnout</span>
                      </span>
                    </span>
                  </h1>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <p className="enter-rise" data-enter="lede" style={{ maxWidth: "46ch" }}>
                    Mock papers taken from the real thing, marked against the real boundary
                    table, with a tutor that explains the one step you actually got wrong.
                  </p>
                  <p className="enter-rise" data-enter="lede" style={{ maxWidth: "46ch" }}>
                    Built for students sitting the Cambridge International Examination at
                    Nazarbayev Intellectual Schools. Grades 10, 11 and 12.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <RevealButton
                    href="/library"
                    className="enter-rise"
                    data-enter="cta"
                    fill="var(--color-highlighter)"
                    textColor="var(--color-ink)"
                    hoverFill="var(--color-ink)"
                    hoverTextColor="var(--color-canvas)"
                  >
                    Sit a mock exam →
                  </RevealButton>
                  <RevealButton
                    href="/dashboard"
                    className="enter-rise"
                    data-enter="cta"
                    fill="var(--color-canvas)"
                    textColor="var(--color-ink)"
                    hoverFill="var(--color-ink)"
                    hoverTextColor="var(--color-canvas)"
                  >
                    See the dashboard
                  </RevealButton>
                </div>
              </div>

              {/* 3D canvas, framed rather than full-bleed. Wipes up on arrival —
                  a shutter rather than a fade, which is what a system built out
                  of hard edges should do. */}
              <div
                className="relative min-h-[380px] lg:min-h-[560px] border-t-2 lg:border-t-0 lg:border-l-2 enter-wipe"
                data-enter="panel"
                style={{ borderColor: "var(--color-rule)" }}
              >
                <HeroCanvas />
                <div className="absolute left-4 top-4 pointer-events-none">
                  <span className="mark-quiet t-micro">DRAG · HOVER · CLICK</span>
                </div>
                <div className="absolute right-4 bottom-4 pointer-events-none t-micro text-right">
                  THE GRADE LADDER
                  <br />
                  A* DOWN TO U
                </div>
              </div>
            </div>

            {/* Ticker strip. The counts moved out to the stat band below, where
                they can be read; a marquee is the wrong place for a number. */}
            <div
              className="border-t-2 overflow-hidden enter-rise"
              data-enter="ticker"
              style={{ borderColor: "var(--color-rule)", background: "var(--color-ink)" }}
            >
              <div className="flex whitespace-nowrap marquee-track">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0">
                    {[
                      "REAL NIS PAST PAPERS",
                      "OFFICIAL BOUNDARY TABLES",
                      "MARKED LIKE THE EXAM",
                      "NO CALCULATOR",
                      "90 MINUTES",
                      "A* TO U",
                      "ҚАЗАҚША · РУССКИЙ · ENGLISH",
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
      </HeroIntro>

      {/* ----------------------------------------------------------- STAT BAND */}
      <section className="px-5 md:px-10 mt-10 md:mt-12">
        <StaggerIn className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { figure: PAPERS.length, label: "FULL MOCK PAPERS", note: "Transcribed from the real sittings" },
            { figure: totalQuestions, label: "QUESTIONS", note: "Each with the mark scheme that earns it" },
            { figure: totalMarks, label: "MARKS AVAILABLE", note: "Scored the way the examiner scores" },
            { figure: allBoundarySets().length, label: "BOUNDARY TABLES", note: "Published МЭСК grades, not percentages" },
          ].map((stat) => (
            <div key={stat.label} className="brutal p-5 flex flex-col gap-1">
              <CountUp to={stat.figure} className="t-heading-sm" />
              <span className="t-label">{stat.label}</span>
              <span className="t-micro mt-1" style={{ opacity: 0.6, letterSpacing: 0 }}>
                {stat.note}
              </span>
            </div>
          ))}
        </StaggerIn>
      </section>

      {/* ------------------------------------------------------------- FEATURES */}
      <section className="px-5 md:px-10 mt-12 md:mt-14">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <MaskedReveal as="h2" className="t-heading" style={{ maxWidth: "16ch" }} text="What it actually does" />
          <span className="t-label pb-2">↳ FOUR THINGS, DONE PROPERLY</span>
        </div>

        <StaggerIn className="grid md:grid-cols-6 gap-5">
          {FEATURES.map((feature) => (
            <PointerLift
              as="article"
              key={feature.badge}
              // No `.press` here: PointerLift owns box-shadow, and press's
              // hover rule would outrank it and freeze the swing.
              className={`brutal p-5 md:p-6 flex flex-col gap-3 ${feature.span}`}
              style={
                feature.accent
                  ? { background: "var(--color-highlighter-wash)" }
                  : undefined
              }
            >
              <span
                className={`t-micro self-start px-2 py-1 ${feature.accent ? "" : "mark-quiet"}`}
                style={
                  feature.accent
                    ? { background: "var(--color-highlighter)", color: "var(--color-ink)" }
                    : undefined
                }
              >
                {feature.badge}
              </span>
              <h3 className="t-subheading whitespace-pre-line">{feature.title}</h3>
              <p className="text-[16px]" style={{ lineHeight: 1.3 }}>
                {feature.body}
              </p>
            </PointerLift>
          ))}
        </StaggerIn>
      </section>

      {/* ------------------------------------------------------------- SUBJECTS */}
      <section className="px-5 md:px-10 mt-10 md:mt-12" aria-hidden="true">
        <SubjectRibbon items={SUBJECT_RIBBON} />
      </section>

      {/* ------------------------------------------------------------ COVERFLOW */}
      <section className="px-5 md:px-10 mt-10 md:mt-12">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <MaskedReveal
            as="h2"
            className="t-heading"
            style={{ maxWidth: "15ch" }}
            text="Every paper we have, right now"
          />
          <span className="t-label pb-2">↳ CLICK A CARD · ARROW KEYS WORK</span>
        </div>

        <PaperCoverflow papers={coverflowPapers} />
      </section>

      {/* ---------------------------------------------------------------- GRADES */}
      <section className="px-5 md:px-10 mt-10 md:mt-12">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <MaskedReveal
            as="h2"
            className="t-heading"
            style={{ maxWidth: "14ch" }}
            text="Three years, three different exams"
          />
          <span className="t-label pb-2">↳ THE ARCHITECTURE</span>
        </div>

        <StaggerIn className="grid lg:grid-cols-3 gap-5">
          {GRADE_STAGES.map((stage) => (
            <article key={stage.year} className="brutal flex flex-col">
              <div
                className="flex items-baseline justify-between px-5 py-4 border-b-2"
                style={{ borderColor: "var(--color-rule)", background: "var(--color-ink)" }}
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
                <span className="mark-quiet t-micro self-start">{stage.standard}</span>
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
                      style={{ border: "2px solid var(--color-rule)" }}
                    >
                      {subject.glyph} {subject.name}
                    </li>
                  ))}
                  {stage.year !== 11 && (
                    <li
                      className="t-micro px-2 py-1"
                      style={{ background: "var(--color-highlighter-wash)", border: "2px solid var(--color-rule)" }}
                    >
                      + {stage.year === 12 ? "2 PROFILES" : "1 PROFILE"}
                    </li>
                  )}
                </ul>
              </div>

              <div
                className="px-5 py-3 border-t-2 t-label"
                style={{ borderColor: "var(--color-rule)", background: "var(--color-paper)" }}
              >
                {stage.load}
              </div>
            </article>
          ))}
        </StaggerIn>
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
              border="2px solid var(--color-canvas)"
              shadow="4px 4px 0 var(--color-canvas)"
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
