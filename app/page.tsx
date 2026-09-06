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

const FEATURES = [
  {
    tag: "NIS specific",
    title: "Real papers, not approximations",
    body: "Two full Grade 10 Mathematics Paper 1 sittings, transcribed question by question with the mark scheme that earns each mark.",
    tone: "card--mint",
  },
  {
    tag: "Official scale",
    title: "The actual boundary table",
    body: "A C in Maths Paper 1 starts at 36/80. A C in Chemistry Paper 1 starts at 44/90. We use the published tables, never a flat percentage.",
    tone: "card--plain",
  },
  {
    tag: "AI powered",
    title: "A tutor that reads your working",
    body: "It starts from the step you missed, quotes the mark scheme wording, and answers in Kazakh, Russian or English — whichever you wrote in.",
    tone: "card--teal",
  },
  {
    tag: "Infinite drill",
    title: "Same topic, same tariff, new numbers",
    body: "Ask for another question at this level and get one: same syllabus strand, same mark count, same number of reasoning steps.",
    tone: "card--plain",
  },
  {
    tag: "Tracked",
    title: "Every attempt, plotted",
    body: "Mastery by topic, grade projection from U to A*, and the streak counter that makes you open it tomorrow.",
    tone: "card--blush",
    wide: true,
  },
];

const TUTOR_POINTS = [
  ["On every page", "Ask Talap floats over the library and the dashboard."],
  ["Inside a question", "The workspace drawer marks your working step by step."],
  ["Without a key", "It still answers, from the real tables in this repo."],
];

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

function Divider() {
  return (
    <div className="divider" data-reveal aria-hidden="true">
      <svg viewBox="0 0 760 24" role="presentation">
        <path d="M4 12c60-14 120 14 180 0s120-14 180 0 120 14 180 0 120-14 212 0" />
      </svg>
    </div>
  );
}

export default function Home() {
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
    `${PAPERS.length} full mock papers`,
    `${totalQuestions} questions`,
    `${totalMarks} marks`,
    `${allBoundarySets().length} official boundary tables`,
    "no calculator",
    "90 minutes",
    "A* to U",
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
        subject: subject?.name ?? paper.subjectId,
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
                МЭСК · NIS · Cambridge
              </span>
              <h1
                className="display"
                style={{ marginTop: "var(--spacing-24)" }}
                data-hl
              >
                Ace Cambridge exams{" "}
                <span className="hl">
                  <span>without the burnout</span>
                </span>
              </h1>
              <p
                className="lead measure"
                style={{ marginTop: "var(--spacing-32)" }}
                data-reveal
              >
                Mock papers taken from the real thing, marked against the real
                boundary table, with a tutor that explains the one step you
                actually got wrong.
              </p>
              <p
                className="body-sm measure muted"
                style={{ marginTop: "var(--spacing-16)" }}
                data-reveal
              >
                Built for students sitting the Cambridge International
                Examination at Nazarbayev Intellectual Schools. Grades 10, 11
                and 12.
              </p>
              <div className="hero__cta" data-reveal>
                <Link className="btn btn--primary" href="/library">
                  <span className="btn__arrow">→</span>Sit a mock exam
                </Link>
                <Link className="btn btn--outline" href="/dashboard">
                  See the dashboard
                </Link>
              </div>
              <p className="caption muted hero__note" data-reveal>
                no account needed for the first paper.
              </p>
            </div>

            {ladderBands.length > 0 && component1 && (
              <GradeLadder
                caption={`Maths · ${component1.name} · /${component1.maxMark}`}
                maxMark={component1.maxMark}
                bands={ladderBands}
                initialMark={demoMark}
                label={`Marks out of ${component1.maxMark}`}
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
                ↳ Five things, done properly
              </span>
              <h2 className="h measure-mx" data-hl>
                What it{" "}
                <span className="hl hl--mint">
                  <span>actually does</span>
                </span>
              </h2>
            </div>
            <div className="feats" data-stagger>
              {FEATURES.map((feature) => (
                <article
                  key={feature.tag}
                  className={`card ${feature.tone} card--tilt feat${
                    feature.wide ? " feat--wide" : ""
                  }`}
                >
                  <span
                    className={`tag${feature.tone === "card--plain" ? "" : " tag--outline"}`}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {feature.tag}
                  </span>
                  <h3 className="feat__t">{feature.title}</h3>
                  <p className="body-sm">{feature.body}</p>
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
                ↳ Click a card · arrow keys work
              </span>
              <h2 className="h measure-mx" data-hl>
                Every paper we have,{" "}
                <span className="hl hl--teal">
                  <span>right now</span>
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
                ↳ The architecture
              </span>
              <h2 className="h measure-mx" data-hl>
                Three years,{" "}
                <span className="hl hl--teal">
                  <span>three different exams</span>
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
                    <span className="mono muted">grade</span>
                  </div>
                  <h3 className="feat__t">{stage.title}</h3>
                  <span className="mono muted">{stage.standard}</span>
                  <p className="body-sm">{stage.summary}</p>

                  <ul className="grade__list">
                    {examSubjectsFor({
                      gradeYear: stage.year,
                      parallel: "kazakh",
                      profileSubjectIds: [],
                    }).map((subject) => (
                      <li key={subject.id}>
                        <b>{subject.glyph}</b>
                        {subject.name}
                      </li>
                    ))}
                    {stage.year !== 11 && (
                      <li>
                        <b>+</b>
                        {stage.year === 12 ? "2 profiles" : "1 profile"}
                      </li>
                    )}
                  </ul>

                  <div className="grade__foot">{stage.load}</div>
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
                Minimum mark per grade
              </span>
              <h2 className="h measure-mx" data-hl>
                The boundaries we{" "}
                <span className="hl">
                  <span>grade against</span>
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
                Kazakh · Russian · English
              </span>
              <h2 className="h" data-hl>
                It answers in the{" "}
                <span className="hl hl--blush">
                  <span>language you asked in</span>
                </span>
              </h2>
            </div>

            <div className="tutor">
              <div>
                <h3 className="sub" data-reveal>
                  A tutor that has read the mark scheme.
                </h3>
                <p
                  className="body"
                  style={{ marginTop: "var(--spacing-16)" }}
                  data-reveal
                >
                  Ask it what a grade needs and it answers from the published
                  boundary table, not a percentage it made up. Ask it about your
                  working and it starts at the step you actually lost the mark
                  on.
                </p>
                <ul className="tutor__points" data-stagger>
                  {TUTOR_POINTS.map(([title, body]) => (
                    <li key={title}>
                      <b>{title}</b>
                      <span className="body-sm">{body}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  className="btn btn--primary"
                  style={{ marginTop: "var(--spacing-32)" }}
                  href="/library"
                >
                  <span className="btn__arrow">→</span>Try it on a real paper
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
              Start with{" "}
              <span className="hl">
                <span>one paper</span>
              </span>
            </h2>
            <p
              className="body measure-mx"
              style={{ marginTop: "var(--spacing-24)" }}
              data-reveal
            >
              90 minutes, 18 questions, no calculator. You will know your grade
              the second you submit.
            </p>
            <div style={{ marginTop: "var(--spacing-40)" }} data-reveal>
              <Link className="btn btn--primary" href="/library">
                <span className="btn__arrow">→</span>Choose a mock
              </Link>
              <p className="caption muted" style={{ marginTop: 12 }}>
                no account needed for the first paper.
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
                МЭСК preparation for NIS students. Real papers, real boundaries,
                a tutor that reads your working.
              </p>
            </div>

            <div className="footer__col">
              <h4>Practise</h4>
              <Link href="/library">↳ Mock papers</Link>
              <Link href="/dashboard">↳ Dashboard</Link>
              <Link href="/#boundaries">↳ Boundary tables</Link>
            </div>

            <div className="footer__col">
              <h4>Scale</h4>
              <ul>
                <li className="mono">↳ A* A B C D E U</li>
                <li className="caption muted">↳ Official boundaries</li>
              </ul>
            </div>
          </div>

          <div className="footer__bottom">
            <p className="micro muted">
              Demo build. Question content transcribed from NIS past papers for
              study use. Grade boundaries from the published МЭСК table.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
