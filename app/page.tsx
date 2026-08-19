import Link from "next/link";
import Nav from "@/components/Nav";
import HeroCanvas from "@/components/HeroCanvas";
import { GRADE_STAGES, subjectById } from "@/data/curriculum";
import { SUBJECT_BOUNDARIES } from "@/data/grade-boundaries";
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
                <Link
                  href="/library"
                  className="no-underline press"
                  style={{
                    background: "var(--color-highlighter)",
                    border: "3px solid var(--color-ink)",
                    boxShadow: "var(--shadow-brutal)",
                    padding: "14px 26px",
                    fontWeight: 700,
                    fontSize: "18px",
                    letterSpacing: "-0.02em",
                    color: "var(--color-ink)",
                  }}
                >
                  Sit a mock exam →
                </Link>
                <Link
                  href="/dashboard"
                  className="no-underline press"
                  style={{
                    background: "var(--color-canvas)",
                    border: "3px solid var(--color-ink)",
                    boxShadow: "var(--shadow-brutal)",
                    padding: "14px 26px",
                    fontWeight: 700,
                    fontSize: "18px",
                    letterSpacing: "-0.02em",
                    color: "var(--color-ink)",
                  }}
                >
                  See the dashboard
                </Link>
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
                    `${SUBJECT_BOUNDARIES.length} OFFICIAL BOUNDARY TABLES`,
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

      {/* ---------------------------------------------------------------- GRADES */}
      <section className="px-5 md:px-10 mt-12 md:mt-14">
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
                  {stage.subjectIds.map((id) => {
                    const subject = subjectById(id);
                    if (!subject) return null;
                    return (
                      <li
                        key={id}
                        className="t-micro px-2 py-1"
                        style={{ border: "2px solid var(--color-ink)" }}
                      >
                        {subject.glyph} {subject.name}
                      </li>
                    );
                  })}
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
        <div className="brutal">
          <div
            className="px-5 py-4 border-b-[3px] flex items-center justify-between flex-wrap gap-3"
            style={{ borderColor: "var(--color-ink)" }}
          >
            <h2 className="t-subheading">The boundaries we grade against</h2>
            <span className="mark t-micro">SUBJECT LEVEL · MINIMUM MARK PER GRADE</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse t-mono" style={{ minWidth: 660 }}>
              <thead>
                <tr style={{ background: "var(--color-ink)" }}>
                  {["SUBJECT", "MAX", "A*", "A", "B", "C", "D", "E", "U"].map((head, i) => (
                    <th
                      key={head}
                      className="t-micro px-3 py-2"
                      style={{
                        color: "var(--color-canvas)",
                        textAlign: i === 0 ? "left" : "right",
                      }}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBJECT_BOUNDARIES.map((subject, row) => (
                  <tr
                    key={subject.id}
                    style={{
                      background: row % 2 ? "var(--color-paper)" : "transparent",
                      borderTop: "1px solid var(--color-ink)",
                    }}
                  >
                    <td className="px-3 py-2 text-[14px]" style={{ fontWeight: 700 }}>
                      {subject.name}
                    </td>
                    <td className="px-3 py-2 text-[14px] text-right">
                      {subject.subject.maxMark}
                    </td>
                    {(["A*", "A", "B", "C", "D", "E", "U"] as const).map((grade) => {
                      const band = subject.subject.bands.find((b) => b.grade === grade);
                      return (
                        <td
                          key={grade}
                          className="px-3 py-2 text-[14px] text-right"
                          style={
                            grade === "A*"
                              ? { background: "var(--color-highlighter)", fontWeight: 700 }
                              : undefined
                          }
                        >
                          {band ? band.min : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ CTA */}
      <section className="px-5 md:px-10 mt-12 md:mt-14">
        <div
          className="brutal p-6 md:p-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8"
          style={{ background: "var(--color-ink)", boxShadow: "var(--shadow-brutal-lg)" }}
        >
          <h2 className="t-heading" style={{ color: "var(--color-canvas)", maxWidth: "13ch" }}>
            Start with one paper
          </h2>
          <div className="flex flex-col gap-4">
            <p style={{ color: "var(--color-canvas)", maxWidth: "40ch" }}>
              90 minutes, 18 questions, no calculator. You will know your grade the second
              you submit.
            </p>
            <Link
              href="/library"
              className="no-underline press self-start"
              style={{
                background: "var(--color-highlighter)",
                border: "3px solid var(--color-canvas)",
                boxShadow: "5px 5px 0 var(--color-canvas)",
                padding: "14px 26px",
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--color-ink)",
              }}
            >
              Choose a mock →
            </Link>
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
