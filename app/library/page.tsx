import Link from "next/link";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/motion/ScrollReveal";
import PaperFilter from "@/components/library/PaperFilter";
import { PAPERS, availableMarks, paperTopics } from "@/data/exams";
import {
  GRADE_STAGES,
  examSubjectsFor,
  profileOptionsFor,
  subjectById,
} from "@/data/curriculum";
import { boundariesFor } from "@/data/grade-boundaries";
import { getT } from "@/lib/i18n/server";
import { subjectName } from "@/lib/i18n";

export async function generateMetadata() {
  const { t } = await getT();
  return {
    title: `${t("nav.mockPapers")} — Talap`,
    description: t("library.hint"),
  };
}

/**
 * Paper library.
 *
 * Papers that exist are openable; the rest of the curriculum is listed as
 * explicitly not-yet-seeded rather than shown as a dead link, so the shape of
 * the full product is visible without pretending the content is there.
 */
export default async function Library() {
  const { t, locale } = await getT();
  const seededSubjects = new Set(
    PAPERS.map((p) => `${p.gradeYear}:${p.subjectId}`)
  );

  return (
    <>
      <ScrollReveal />
      <Nav />

      <main>
        <section className="section-tight">
          <div className="shell">
            <div className="head head--left">
              <span className="eyebrow" data-reveal>
                ↳ {t("library.readyToSit", { count: PAPERS.length })}
              </span>
              <h1 className="h" data-hl>
                <span className="hl">
                  <span>{t("nav.mockPapers")}</span>
                </span>
              </h1>
            </div>

            <PaperFilter
              available={PAPERS.map((p) => ({
                gradeYear: p.gradeYear,
                subjectId: p.subjectId,
              }))}
            />

            <div className="papers" data-stagger>
              {[...PAPERS]
                .sort((a, b) => a.gradeYear - b.gradeYear)
                .map((paper) => {
                  const subject = subjectById(paper.subjectId);
                  const component = boundariesFor(
                    paper.subjectId,
                    paper.gradeYear
                  )?.components[paper.componentIndex];
                  const marks = availableMarks(paper);
                  const topics = paperTopics(paper);

                  return (
                    <article
                      key={paper.id}
                      className="card card--plain paper-card"
                      data-subject={paper.subjectId}
                      data-year={paper.gradeYear}
                    >
                      <div className="paper-card__top">
                        <div>
                          <span className="mono muted">
                            {t("nav.grade", { year: paper.gradeYear })} ·{" "}
                            {subject ? subjectName(subject, locale) : paper.subjectId}
                          </span>
                          <h2 className="sub" style={{ marginTop: 4 }}>
                            {paper.title}
                          </h2>
                          <span className="caption muted">{paper.sitting}</span>
                        </div>
                        <div className="paper-card__flags">
                          <span className="tag tag--plain">
                            {paper.calculator
                              ? t("library.calculator")
                              : t("library.noCalculator")}
                          </span>
                          <span
                            className={
                              paper.provenance === "transcribed"
                                ? "tag tag--mint"
                                : "tag tag--outline"
                            }
                          >
                            {paper.provenance === "transcribed"
                              ? t("library.pastPaper")
                              : t("library.practice")}
                          </span>
                        </div>
                      </div>

                      <p className="body-sm muted">{paper.provenanceNote}</p>

                      <dl className="paper-card__stats">
                        {[
                          {
                            label: t("common.questions"),
                            value: `${paper.questions.length}`,
                          },
                          { label: t("common.marks"), value: `${marks}` },
                          {
                            label: t("common.minutes"),
                            value: `${paper.durationMinutes}`,
                          },
                        ].map((stat) => (
                          <div key={stat.label}>
                            <dt className="mono muted">{stat.label}</dt>
                            <dd className="paper-card__stat">{stat.value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div>
                        <span className="mono muted">{t("library.topics")}</span>
                        <ul className="paper-card__topics">
                          {topics.map((topic) => (
                            <li key={topic} className="tag tag--plain">
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {component && (
                        <div className="paper-card__bands">
                          <span className="mono muted">
                            {t("library.gradedOn", {
                              component: component.name,
                              max: component.maxMark,
                            })}
                          </span>
                          <span className="paper-card__band-list">
                            {component.bands
                              .filter((b) => b.grade !== "U")
                              .map((band) => (
                                <span key={band.grade} className="mono">
                                  {band.grade} ≥ {band.min}
                                </span>
                              ))}
                          </span>
                        </div>
                      )}

                      <Link
                        href={`/exam/${paper.id}`}
                        className="btn btn--primary btn--sm paper-card__cta"
                      >
                        <span className="btn__arrow">→</span>
                        {t("library.sit")}
                      </Link>
                    </article>
                  );
                })}
            </div>
          </div>
        </section>

        {/* Curriculum coverage — what exists and what does not */}
        <section className="section-tight">
          <div className="shell">
            <div className="head head--left">
              <span className="eyebrow" data-reveal>
                ↳ {t("library.notSeeded")}
              </span>
              <h2 className="h-sm" data-hl>
                <span className="hl hl--teal">
                  <span>{t("library.restOfCurriculum")}</span>
                </span>
              </h2>
            </div>

            <div className="coverage" data-stagger>
              {GRADE_STAGES.map((stage) => (
                <div key={stage.year} className="card card--plain">
                  <span className="tag">{t("nav.grade", { year: stage.year })}</span>
                  <p
                    className="mono muted"
                    style={{ marginTop: "var(--spacing-16)" }}
                  >
                    {stage.compulsory}
                  </p>
                  <ul className="coverage__list">
                    {[
                      ...examSubjectsFor({
                        gradeYear: stage.year,
                        parallel: "kazakh",
                        profileSubjectIds: [],
                      }),
                      ...profileOptionsFor(stage.year),
                    ].map((subject) => {
                      const ready = seededSubjects.has(
                        `${stage.year}:${subject.id}`
                      );
                      return (
                        <li key={subject.id}>
                          <span>
                            {subject.glyph} {subjectName(subject, locale)}
                          </span>
                          <span
                            className={`tag ${ready ? "tag--mint" : "tag--plain"}`}
                          >
                            {ready ? t("library.ready") : t("common.soon")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">
          <p className="micro muted">
            {t("footer.studyUse")}
          </p>
        </div>
      </footer>
    </>
  );
}
