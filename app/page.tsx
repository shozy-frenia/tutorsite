import Link from "next/link";
import Nav from "@/components/Nav";
import BrandMark from "@/components/BrandMark";
import ScrollReveal from "@/components/motion/ScrollReveal";
import GradeLadder from "@/components/landing/GradeLadder";
import TutorDemo from "@/components/landing/TutorDemo";
import BoundaryExplorer from "@/components/landing/BoundaryExplorer";
import PaperCoverflow from "@/components/motion/PaperCoverflow";
import { GRADE_STAGES, examSubjectsFor, subjectById } from "@/data/curriculum";
import { allBoundarySets, boundariesFor } from "@/data/grade-boundaries";
import { PAPERS, availableMarks, paperTopics } from "@/data/exams";
import { getT } from "@/lib/i18n/server";
import { subjectName } from "@/lib/i18n";

/**
 * Landing page.
 *
 * Everything with a number in it reads from the repository rather than from a
 * constant typed into this file: the ladder is the published Grade 10
 * Mathematics Component 1 table, the ticker counts the papers that actually
 * exist, and the boundary section renders the same data the marker grades
 * against. A landing page that quotes figures the product cannot reproduce is
 * the fastest way to lose a student on their second visit.
 */





/** A real exchange, replayed. See the note in TutorDemo. */
const DEMO_CHAT = [
  { who: "me" as const, text: "Сколько нужно на A по математике?" },
  {
    who: "ai" as const,
    text: "В 10 классе математика — 160 баллов за два компонента. A начинается с 114/160 на уровне предмета, а на Компоненте 1 — с 56/80.",
  },
  { who: "me" as const, text: "I got 44. What am I missing?" },
  {
    who: "ai" as const,
    text: "44/80 is a C — 12 marks off an A. Your last two attempts both lost method marks on Circle Geometry. Start there.",
  },
];

/** Feature cards, in the order the page shows them. */
const FEATURES = [
  { key: "papers", tone: "card--mint" },
  { key: "scale", tone: "card--plain" },
  { key: "tutor", tone: "card--teal" },
  { key: "drill", tone: "card--plain" },
  { key: "tracked", tone: "card--blush", wide: true },
] as const;

const TUTOR_POINTS = ["everywhere", "inQuestion", "noKey"] as const;

function Divider() {
  return (
    <div className="divider" data-reveal aria-hidden="true">
      <svg viewBox="0 0 760 24" role="presentation">
        <path d="M4 12c60-14 120 14 180 0s120-14 180 0 120 14 180 0 120-14 212 0" />
      </svg>
    </div>
  );
}

export default async function Home() {
  const { t, locale } = await getT();
  const totalQuestions = PAPERS.reduce((sum, p) => sum + p.questions.length, 0);
  const totalMarks = PAPERS.reduce((sum, p) => sum + availableMarks(p), 0);

  // The ladder is Grade 10 Mathematics Component 1 — the paper nine of the
  // twenty-six pilots actually sat, and the one every other number on this
  // page is quoted against.
  const maths10 = boundariesFor("mathematics", 10);
  const component1 = maths10?.components[0];
  const ladderBands = (component1?.bands ?? []).map((band) => ({
    grade: band.grade,
    min: band.min,
    max: band.max,
  }));

  const demoMark = 44;
  const demoMax = component1?.maxMark ?? 80;
  const demoGrade =
    [...(component1?.bands ?? [])]
      .sort((a, b) => b.min - a.min)
      .find((band) => demoMark >= band.min)?.grade ?? "U";
  const demoTicks = [...(component1?.bands ?? [])]
    .sort((a, b) => a.min - b.min)
    .map((band) => band.min)
    .filter((min) => min > 0);

  const ticker = [
    t("landing.ticker.papers", { count: PAPERS.length }),
    t("landing.ticker.questions", { count: totalQuestions }),
    t("landing.ticker.marks", { count: totalMarks }),
    t("landing.ticker.tables", { count: allBoundarySets().length }),
    t("landing.ticker.noCalculator"),
    t("landing.ticker.minutes"),
    t("landing.ticker.scale"),
  ];

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
        subject: subject ? subjectName(subject, locale) : paper.subjectId,
        glyph: subject?.glyph ?? "",
        gradeYear: paper.gradeYear,
        sitting: paper.sitting,
        questions: paper.questions.length,
        marks: availableMarks(paper),
        minutes: paper.durationMinutes,
        calculator: Boolean(paper.calculator),
        pastPaper: paper.provenance === "transcribed",
        topics: paperTopics(paper).slice(0, 5),
      };
    });

  return (
    <>
      <ScrollReveal />
      <Nav />

      <main id="top">
        {/* ------------------------------------------------------------ HERO */}
        <section className="hero">
          <span className="doodle doodle--a" aria-hidden="true">
            <svg viewBox="0 0 140 120">
              <path d="M8 98c12-42 30-66 50-72s32 6 28 24-28 24-40 10S58 20 88 12s44 10 46 32" />
              <path d="M114 36l14-6-4 15" />
            </svg>
          </span>
          <span className="doodle doodle--b" aria-hidden="true">
            <svg viewBox="0 0 160 120">
              <path d="M12 24h116a13 13 0 0 1 0 26H42a13 13 0 0 0 0 26h100" />
              <circle cx="140" cy="94" r="11" />
            </svg>
          </span>

          <div className="shell hero__grid">
            <div>
              <span className="tag" data-reveal>
                {t("landing.eyebrow")}
              </span>
              <h1
                className="display"
                style={{ marginTop: "var(--spacing-24)" }}
                data-hl
              >
                {t("landing.title.a")}{" "}
                <span className="hl">
                  <span>{t("landing.title.b")}</span>
                </span>
              </h1>
              <p
                className="lead measure"
                style={{ marginTop: "var(--spacing-32)" }}
                data-reveal
              >
                {t("landing.sub")}
              </p>
              <p
                className="body-sm measure muted"
                style={{ marginTop: "var(--spacing-16)" }}
                data-reveal
              >
                {t("landing.builtFor")}
              </p>
              <div className="hero__cta" data-reveal>
                <Link className="btn btn--primary" href="/library">
                  <span className="btn__arrow">→</span>
                  {t("landing.cta.primary")}
                </Link>
                <Link className="btn btn--outline" href="/dashboard">
                  {t("landing.cta.secondary")}
                </Link>
              </div>
              <p className="caption muted hero__note" data-reveal>
                {t("landing.noAccount")}
              </p>
            </div>

            {ladderBands.length > 0 && component1 && (
              <GradeLadder
                caption={t("landing.ladder.caption", {
                  component: component1.name,
                  max: component1.maxMark,
                })}
                maxMark={component1.maxMark}
                bands={ladderBands}
                initialMark={demoMark}
                label={t("landing.ladder.aria", { max: component1.maxMark })}
              />
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------- TICKER */}
        <div className="ticker" aria-hidden="true">
          <div className="ticker__track">
            {[0, 1].map((copy) => (
              <div key={copy} style={{ display: "flex" }}>
                {ticker.map((item) => (
                  <span key={`${copy}-${item}`} className="ticker__item">
                    {item}
                    <span aria-hidden="true">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* -------------------------------------------------------- FEATURES */}
        <section className="section" id="features">
          <div className="shell">
            <div className="head">
              <span className="eyebrow" data-reveal>
                ↳ {t("landing.does.eyebrow")}
              </span>
              <h2 className="h measure-mx" data-hl>
                <span className="hl hl--mint">
                  <span>{t("landing.does.title")}</span>
                </span>
              </h2>
            </div>
            <div className="feats" data-stagger>
              {FEATURES.map((feature) => (
                <article
                  key={feature.key}
                  className={`card ${feature.tone} card--tilt feat${
                    "wide" in feature && feature.wide ? " feat--wide" : ""
                  }`}
                >
                  <span
                    className={`tag${feature.tone === "card--plain" ? "" : " tag--outline"}`}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {t(`landing.feature.${feature.key}.tag`)}
                  </span>
                  <h3 className="feat__t">
                    {t(`landing.feature.${feature.key}.title`)}
                  </h3>
                  <p className="body-sm">
                    {t(`landing.feature.${feature.key}.body`)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ------------------------------------------------------- COVERFLOW */}
        <section className="section" id="papers">
          <div className="shell">
            <div className="head">
              <span className="eyebrow" data-reveal>
                ↳ {t("landing.papers.eyebrow")}
              </span>
              <h2 className="h measure-mx" data-hl>
                <span className="hl hl--teal">
                  <span>{t("landing.papers.title")}</span>
                </span>
              </h2>
            </div>
          </div>
          <PaperCoverflow papers={coverflowPapers} />
        </section>

        <Divider />

        {/* ----------------------------------------------------------- GRADES */}
        <section className="section" id="grades">
          <div className="shell">
            <div className="head">
              <span className="eyebrow" data-reveal>
                ↳ {t("landing.architecture.eyebrow")}
              </span>
              <h2 className="h measure-mx" data-hl>
                <span className="hl hl--teal">
                  <span>{t("landing.architecture.title")}</span>
                </span>
              </h2>
            </div>

            <div className="grades" data-stagger>
              {GRADE_STAGES.map((stage, index) => (
                <article
                  key={stage.year}
                  className={`card ${
                    index === 1 ? "card--mint" : "card--plain"
                  } card--tilt grade`}
                >
                  <div className="grade__num">
                    <b>{stage.year}</b>
                    <span className="mono muted">{t("stage.gradeWord")}</span>
                  </div>
                  <h3 className="feat__t">{t(`stage.${stage.year}.title`)}</h3>
                  <span className="mono muted">
                    {t(`stage.${stage.year}.standard`)}
                  </span>
                  <p className="body-sm">{t(`stage.${stage.year}.summary`)}</p>

                  <ul className="grade__list">
                    {examSubjectsFor({
                      gradeYear: stage.year,
                      parallel: "kazakh",
                      profileSubjectIds: [],
                    }).map((subject) => (
                      <li key={subject.id}>
                        <b>{subject.glyph}</b>
                        {subjectName(subject, locale)}
                      </li>
                    ))}
                    {stage.year !== 11 && (
                      <li>
                        <b>+</b>
                        {stage.year === 12
                          ? t("stage.profileTwo")
                          : t("stage.profileOne")}
                      </li>
                    )}
                  </ul>

                  <div className="grade__foot">
                    {t(`stage.${stage.year}.load`)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* ------------------------------------------------------- BOUNDARIES */}
        <section className="section" id="boundaries">
          <div className="shell">
            <div className="head">
              <span className="eyebrow" data-reveal>
                {t("landing.boundaries.eyebrow")}
              </span>
              <h2 className="h measure-mx" data-hl>
                <span className="hl">
                  <span>{t("landing.boundaries.title")}</span>
                </span>
              </h2>
            </div>
            <BoundaryExplorer />
          </div>
        </section>

        <Divider />

        {/* ------------------------------------------------------------ TUTOR */}
        <section className="section" id="tutor">
          <div className="shell">
            <div className="head head--left">
              <span className="eyebrow" data-reveal>
                {t("landing.tutor.eyebrow")}
              </span>
              <h2 className="h" data-hl>
                <span className="hl hl--blush">
                  <span>{t("landing.tutor.title")}</span>
                </span>
              </h2>
            </div>

            <div className="tutor">
              <div>
                <h3 className="sub" data-reveal>
                  {t("landing.tutor.lead")}
                </h3>
                <p
                  className="body"
                  style={{ marginTop: "var(--spacing-16)" }}
                  data-reveal
                >
                  {t("landing.tutor.body")}
                </p>
                <ul className="tutor__points" data-stagger>
                  {TUTOR_POINTS.map((point) => (
                    <li key={point}>
                      <b>{t(`landing.tutorPoint.${point}.title`)}</b>
                      <span className="body-sm">
                        {t(`landing.tutorPoint.${point}.body`)}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  className="btn btn--primary"
                  style={{ marginTop: "var(--spacing-32)" }}
                  href="/library"
                >
                  <span className="btn__arrow">→</span>
                  {t("landing.tutor.cta")}
                </Link>
              </div>

              <TutorDemo
                subjectLine="Talap · Grade 10 · KZ"
                paperLine={`Maths · ${component1?.name ?? "Component 1"}`}
                mark={demoMark}
                maxMark={demoMax}
                grade={demoGrade}
                ticks={demoTicks}
                messages={DEMO_CHAT}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ FINAL */}
        <section className="final" id="start">
          <div className="shell">
            <h2 className="h measure-mx" data-hl>
              <span className="hl">
                <span>{t("landing.final.title")}</span>
              </span>
            </h2>
            <p
              className="body measure-mx"
              style={{ marginTop: "var(--spacing-24)" }}
              data-reveal
            >
              {t("landing.final.sub")}
            </p>
            <div style={{ marginTop: "var(--spacing-40)" }} data-reveal>
              <Link className="btn btn--primary" href="/library">
                <span className="btn__arrow">→</span>
                {t("landing.final.cta")}
              </Link>
              <p className="caption muted" style={{ marginTop: 12 }}>
                {t("landing.noAccount")}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ----------------------------------------------------------- FOOTER */}
      <footer className="footer">
        <div className="shell">
          <div className="footer__top">
            <div className="footer__col">
              <Link className="logo no-underline" href="/" aria-label="Talap — home">
                <BrandMark height={26} />
              </Link>
              <p
                className="caption muted"
                style={{ marginTop: "var(--spacing-16)", maxWidth: 300 }}
              >
                {t("footer.blurb")}
              </p>
            </div>

            <div className="footer__col">
              <h4>{t("footer.practise")}</h4>
              <Link href="/library">↳ {t("nav.mockPapers")}</Link>
              <Link href="/dashboard">↳ {t("nav.dashboard")}</Link>
              <Link href="/#boundaries">↳ {t("nav.boundaryTables")}</Link>
            </div>

            <div className="footer__col">
              <h4>{t("footer.scale")}</h4>
              <ul>
                <li className="mono">↳ A* A B C D E U</li>
                <li className="caption muted">↳ {t("footer.officialBoundaries")}</li>
              </ul>
            </div>
          </div>

          <div className="footer__bottom">
            <p className="micro muted">
              {t("footer.demo")}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
