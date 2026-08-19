import Link from "next/link";
import Nav from "@/components/Nav";
import { PAPERS, availableMarks, paperTopics } from "@/data/exams";
import { GRADE_STAGES, SUBJECTS, subjectById } from "@/data/curriculum";
import { boundariesFor } from "@/data/grade-boundaries";

export const metadata = {
  title: "Mock papers — Talap",
  description: "Full NIS / МЭСК mock papers with official grade boundaries.",
};

/**
 * Paper library.
 *
 * Papers that exist are openable; the rest of the curriculum is listed as
 * explicitly not-yet-seeded rather than shown as a dead link, so the shape of
 * the full product is visible without pretending the content is there.
 */
export default function Library() {
  const seededSubjects = new Set(PAPERS.map((p) => p.subjectId));

  return (
    <main>
      <Nav />

      <section className="px-5 md:px-10">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <h1 className="t-heading" style={{ maxWidth: "12ch" }}>
            Mock papers
          </h1>
          <span className="t-label pb-2">↳ {PAPERS.length} READY TO SIT</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {PAPERS.map((paper) => {
            const subject = subjectById(paper.subjectId);
            const component = boundariesFor(paper.subjectId)?.components[paper.componentIndex];
            const marks = availableMarks(paper);
            const topics = paperTopics(paper);

            return (
              <article key={paper.id} className="brutal flex flex-col">
                <div
                  className="px-5 py-4 border-b-[3px] flex items-start justify-between gap-4"
                  style={{ borderColor: "var(--color-ink)", background: "var(--color-highlighter)" }}
                >
                  <div>
                    <span className="t-micro">
                      GRADE {paper.gradeYear} · {subject?.name.toUpperCase()}
                    </span>
                    <h2 className="t-subheading mt-1">{paper.title}</h2>
                    <span className="t-label mt-1 block">{paper.sitting}</span>
                  </div>
                  <span
                    className="t-micro px-2 py-1 shrink-0"
                    style={{ background: "var(--color-ink)", color: "var(--color-canvas)" }}
                  >
                    {paper.calculator ? "CALCULATOR" : "NO CALCULATOR"}
                  </span>
                </div>

                <dl className="grid grid-cols-3 ruled-none">
                  {[
                    { label: "QUESTIONS", value: `${paper.questions.length}` },
                    { label: "MARKS", value: `${marks}` },
                    { label: "MINUTES", value: `${paper.durationMinutes}` },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className="px-5 py-4"
                      style={{
                        borderRight: i < 2 ? "1px solid var(--color-ink)" : undefined,
                      }}
                    >
                      <dt className="t-micro" style={{ opacity: 0.6 }}>
                        {stat.label}
                      </dt>
                      <dd className="t-subheading t-mono m-0">{stat.value}</dd>
                    </div>
                  ))}
                </dl>

                <div
                  className="px-5 py-4 border-t"
                  style={{ borderColor: "var(--color-ink)" }}
                >
                  <span className="t-micro" style={{ opacity: 0.6 }}>
                    TOPICS
                  </span>
                  <ul className="flex flex-wrap gap-1.5 mt-2 list-none p-0">
                    {topics.map((topic) => (
                      <li
                        key={topic}
                        className="t-micro px-2 py-1"
                        style={{ border: "1px solid var(--color-ink)" }}
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                {component && (
                  <div
                    className="px-5 py-3 border-t t-micro flex flex-wrap gap-x-4 gap-y-1"
                    style={{ borderColor: "var(--color-ink)", background: "var(--color-paper)" }}
                  >
                    <span style={{ opacity: 0.6 }}>GRADED ON {component.name.toUpperCase()} / {component.maxMark}:</span>
                    {component.bands
                      .filter((b) => b.grade !== "U")
                      .map((band) => (
                        <span key={band.grade}>
                          {band.grade} ≥ {band.min}
                        </span>
                      ))}
                  </div>
                )}

                <div className="p-5 mt-auto">
                  <Link
                    href={`/exam/${paper.id}`}
                    className="no-underline press inline-block"
                    style={{
                      background: "var(--color-ink)",
                      color: "var(--color-canvas)",
                      border: "3px solid var(--color-ink)",
                      boxShadow: "var(--shadow-brutal-sm)",
                      padding: "12px 22px",
                      fontWeight: 700,
                    }}
                  >
                    Sit this paper →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Curriculum coverage — what exists and what does not */}
      <section className="px-5 md:px-10 mt-12">
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <h2 className="t-heading-sm" style={{ maxWidth: "16ch" }}>
            The rest of the curriculum
          </h2>
          <span className="t-label pb-2">↳ NOT YET SEEDED</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {GRADE_STAGES.map((stage) => (
            <div key={stage.year} className="swiss-flat p-5">
              <span className="mark t-micro">GRADE {stage.year}</span>
              <ul className="mt-3 list-none p-0 flex flex-col gap-2">
                {stage.subjectIds.map((id) => {
                  const subject = SUBJECTS.find((s) => s.id === id);
                  if (!subject) return null;
                  const ready = seededSubjects.has(id) && stage.year === 10;
                  return (
                    <li key={id} className="flex items-center justify-between gap-3 text-[15px]">
                      <span>
                        {subject.glyph} {subject.name}
                      </span>
                      <span
                        className="t-micro px-2 py-0.5 shrink-0"
                        style={
                          ready
                            ? { background: "var(--color-acid-lime)", border: "1px solid var(--color-ink)" }
                            : { border: "1px solid var(--color-ink)", opacity: 0.55 }
                        }
                      >
                        {ready ? "READY" : "SOON"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-5 md:px-10 py-10 mt-12" style={{ background: "var(--color-ink)" }}>
        <span className="t-micro" style={{ color: "var(--color-canvas)", opacity: 0.6 }}>
          TALAP® · QUESTION CONTENT TRANSCRIBED FROM NIS PAST PAPERS FOR STUDY USE
        </span>
      </footer>
    </main>
  );
}
