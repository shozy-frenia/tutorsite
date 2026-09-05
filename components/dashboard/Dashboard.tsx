"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  clearStore,
  currentStreak,
  readStore,
  saveProfile,
  topicMastery,
  type Attempt,
  type Profile,
  type Store,
} from "@/lib/storage";
import {
  GRADE_ORDER,
  boundariesFor,
  type Grade,
  type GradeYear,
} from "@/data/grade-boundaries";
import {
  PARALLEL_LABEL,
  examSubjectsFor,
  firstLanguageFor,
  profileCountFor,
  profileOptionsFor,
  secondLanguageFor,
  stageFor,
  subjectById,
  type Parallel,
} from "@/data/curriculum";
import { gradeRank, marksToNextGrade } from "@/lib/grading";
import { PAPERS } from "@/data/exams";
import GradeBadge from "@/components/GradeBadge";
import Nav from "@/components/Nav";
import AccountPanel from "@/components/auth/AccountPanel";

/**
 * Personal tracking dashboard.
 *
 * Reads from localStorage, always. When an account is signed in, SessionProvider
 * mirrors that store to Postgres in the background and merges it back on the
 * next sign-in — but this component never waits on the network, and everything
 * on the page works with no backend configured at all.
 *
 * Everything shown is derived from real attempts; when there are none, the page
 * says so and points at the library rather than rendering placeholder numbers
 * that look like progress.
 */

const CHART_INK = "#1a3300";
const CHART_YELLOW = "#ffe95c";
const CHART_PAPER = "#fcfaf5";

export default function Dashboard() {
  const [store, setStore] = useState<Store>({ profile: null, attempts: [], activeDays: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(readStore());
    setHydrated(true);
    const onChange = () => setStore(readStore());
    window.addEventListener("talap:store", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("talap:store", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const streak = useMemo(() => currentStreak(store.activeDays), [store.activeDays]);
  const mastery = useMemo(() => topicMastery(store.attempts), [store.attempts]);

  // Avoid a hydration mismatch: localStorage is not available on the server.
  if (!hydrated) {
    return (
      <main style={{ minHeight: "100vh" }}>
        <Nav />
        <div className="shell section-tight">
          <span className="mono muted">Loading your record…</span>
        </div>
      </main>
    );
  }

  if (!store.profile) {
    return (
      <main style={{ minHeight: "100vh" }}>
        <Nav />
        <Register onDone={(profile) => setStore(saveProfile(profile))} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh" }}>
      <Nav />

      <section className="shell section-tight">
        {/* ------------------------------------------------------ header */}
        <div className="dash-head">
          <div>
            <span className="tag">Grade {store.profile.gradeYear}</span>
            <h1 className="h" style={{ marginTop: "var(--spacing-16)" }}>
              {store.profile.name}
            </h1>
          </div>
          <div className="text-right">
            <span className="mono muted">Target</span>
            <GradeBadge grade={store.profile.targetGrade} size="lg" />
          </div>
        </div>

        {store.attempts.length === 0 ? (
          <EmptyState />
        ) : (
          <Loaded store={store} streak={streak} mastery={mastery} />
        )}

        <AccountPanel onCleared={setStore} />

        <div className="dash-reset">
          <button
            onClick={() => {
              if (window.confirm("Delete your profile and all saved attempts on this device?")) {
                setStore(clearStore());
              }
            }}
            className="btn btn--outline btn--sm"
          >
            Reset this device
          </button>
        </div>
      </section>
    </main>
  );
}

/* ============================================================== registration */

function Register({ onDone }: { onDone: (profile: Profile) => void }) {
  const [name, setName] = useState("");
  const [gradeYear, setGradeYear] = useState<GradeYear>(10);
  const [parallel, setParallel] = useState<Parallel>("kazakh");
  const [profileIds, setProfileIds] = useState<string[]>([]);
  const [targetGrade, setTargetGrade] = useState<Grade>("A");

  const profileOptions = profileOptionsFor(gradeYear);
  const needed = profileCountFor(gradeYear);

  // Changing year changes how many profiles are allowed, and Grade 11 has
  // none at all — drop anything that no longer applies rather than carrying
  // a stale choice into the saved profile.
  useEffect(() => {
    const allowed = new Set(profileOptionsFor(gradeYear).map((s) => s.id));
    setProfileIds((prev) => prev.filter((id) => allowed.has(id)).slice(0, profileCountFor(gradeYear)));
  }, [gradeYear]);

  const toggleProfile = (id: string) => {
    setProfileIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (needed === 1) return [id];
      if (prev.length >= needed) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const subjects = examSubjectsFor({ gradeYear, parallel, profileSubjectIds: profileIds });
  const ready = name.trim().length > 0 && profileIds.length === needed;

  return (
    <section className="shell section-tight">
      <div className="card card--plain register rise">
        <div className="register__intro">
          <span className="tag">Demo registration</span>
          <h1 className="sub" style={{ marginTop: "var(--spacing-16)" }}>
            Set up your tracker
          </h1>
          <p className="body-sm" style={{ marginTop: 8 }}>
            No email, no password. This stays on your device. We ask for your
            parallel and profile subjects so you only ever see papers for exams
            you will actually sit.
          </p>
        </div>

        <form
          className="register__form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!ready) return;
            onDone({
              name: name.trim().slice(0, 40),
              gradeYear,
              parallel,
              profileSubjectIds: profileIds,
              targetGrade,
              joinedAt: new Date().toISOString(),
            });
          }}
        >
          <label>
            <span className="field-label">Your name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              required
              placeholder="Aisha"
              className="field"
            />
          </label>

          <fieldset className="border-0 p-0 m-0">
            <legend className="field-label">Grade</legend>
            <div className="choice-row">
              {([10, 11, 12] as const).map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setGradeYear(year)}
                  aria-pressed={gradeYear === year}
                  className="choice grow"
                  style={{ textAlign: "center" }}
                >
                  {year}
                </button>
              ))}
            </div>
            <span className="mono muted" style={{ display: "block", marginTop: 8 }}>
              {stageFor(gradeYear)?.compulsory}
            </span>
          </fieldset>

          <fieldset className="border-0 p-0 m-0">
            <legend className="field-label">
              Parallel — language of instruction
            </legend>
            <div className="choice-grid">
              {(["kazakh", "russian"] as Parallel[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setParallel(value)}
                  aria-pressed={parallel === value}
                  className="choice"
                >
                  <span className="body-sm" style={{ fontWeight: 600 }}>
                    {PARALLEL_LABEL[value]}
                  </span>
                  <span className="micro muted" style={{ display: "block", marginTop: 4 }}>
                    Я1 {subjectById(firstLanguageFor(value))?.name.split(" (")[0]} · Я2{" "}
                    {subjectById(secondLanguageFor(value))?.name.split(" (")[0]}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {needed > 0 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="field-label">
                Profile {needed === 1 ? "subject" : "subjects"} — pick {needed}
              </legend>
              <div className="choice-grid">
                {profileOptions.map((subject) => {
                  const picked = profileIds.includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => toggleProfile(subject.id)}
                      aria-pressed={picked}
                      className="choice choice--mint"
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span style={{ fontSize: 20 }}>{subject.glyph}</span>
                      <span className="body-sm">{subject.name}</span>
                    </button>
                  );
                })}
              </div>
              <span className="mono muted" style={{ display: "block", marginTop: 8 }}>
                {profileIds.length} of {needed} chosen
                {needed === 2 && profileIds.length === 2
                  ? " — picking a third replaces the oldest"
                  : ""}
              </span>
            </fieldset>
          )}

          <fieldset className="border-0 p-0 m-0">
            <legend className="field-label">Target grade</legend>
            <div className="choice-row">
              {[...GRADE_ORDER].reverse().map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setTargetGrade(grade)}
                  aria-pressed={targetGrade === grade}
                  className="choice choice--grade choice--mint"
                >
                  {grade}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Live preview of what this student will actually sit */}
          <div className="card card--tint">
            <span className="mono muted">You will sit</span>
            {subjects.length === 0 ? (
              <p className="body-sm muted" style={{ marginTop: 8 }}>
                Pick your{" "}
                {needed === 1 ? "profile subject" : "profile subjects"} to see
                the list.
              </p>
            ) : (
              <ul className="filter-bar__subjects">
                {subjects.map((subject) => (
                  <li key={subject.id} className="tag tag--outline">
                    {subject.glyph} {subject.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={!ready}
            className="btn btn--primary self-start"
          >
            <span className="btn__arrow">→</span>Start tracking
          </button>
        </form>
      </div>
    </section>
  );
}

/* ================================================================ empty */

function EmptyState() {
  return (
    <div className="card card--plain empty-state rise">
      <span className="tag">Nothing recorded yet</span>
      <h2 className="sub measure-sm">Sit one paper and this page fills up</h2>
      <p className="body measure">
        Mastery by topic, your grade trend, and how many marks separate you from
        the next band — all of it comes from real attempts, so there is nothing
        to show until you make one.
      </p>
      <Link href="/library" className="btn btn--primary">
        <span className="btn__arrow">→</span>Choose a paper
      </Link>
    </div>
  );
}

/* =============================================================== loaded */

function Loaded({
  store,
  streak,
  mastery,
}: {
  store: Store;
  streak: number;
  mastery: Array<{ topic: string; percent: number; marks: number; awarded: number }>;
}) {
  const attempts = store.attempts;
  const latest = attempts[0];
  const best = attempts.reduce((a, b) => (gradeRank(b.grade) > gradeRank(a.grade) ? b : a));

  const component = boundariesFor(latest.subjectId, latest.gradeYear)?.components[
    latest.componentIndex
  ];
  const next = component ? marksToNextGrade(latest.scaledMark, component) : null;

  // Oldest first, so the trend line reads left to right.
  const trend = useMemo(
    () =>
      [...attempts].reverse().map((attempt, i) => ({
        name: `#${i + 1}`,
        percent: attempt.componentMax
          ? Math.round((attempt.scaledMark / attempt.componentMax) * 100)
          : 0,
        grade: attempt.grade,
        rank: gradeRank(attempt.grade),
        date: new Date(attempt.finishedAt).toLocaleDateString(),
      })),
    [attempts]
  );

  const radarData = useMemo(
    () => mastery.map((row) => ({ topic: shortTopic(row.topic), percent: row.percent })),
    [mastery]
  );

  const totalMarks = attempts.reduce((sum, a) => sum + a.rawMark, 0);
  const totalAvailable = attempts.reduce((sum, a) => sum + a.availableMarks, 0);

  return (
    <>
      {/* ------------------------------------------------------ stat row */}
      <div className="stat-row">
        <StatCard label="Current grade" accent>
          <div className="flex items-center gap-3">
            <GradeBadge grade={latest.grade} size="lg" />
            <div>
              <span className="mono muted" style={{ display: "block" }}>
                Latest paper
              </span>
              <span className="mono">
                {latest.scaledMark}/{latest.componentMax}
              </span>
            </div>
          </div>
        </StatCard>

        <StatCard label="Study streak">
          <div className="flex items-baseline gap-2">
            <span className="stat-card__big">
              {streak}
            </span>
            <span className="mono">day{streak === 1 ? "" : "s"}</span>
          </div>
          <span className="micro muted">
            {store.activeDays.length} active day
            {store.activeDays.length === 1 ? "" : "s"} total
          </span>
        </StatCard>

        <StatCard label="Marks to next grade">
          {next ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="stat-card__big">
                  +{next.marksNeeded}
                </span>
                <GradeBadge grade={next.nextGrade} size="sm" />
              </div>
              <span className="micro muted">on {component?.name}</span>
            </>
          ) : (
            <span className="sub">Top band</span>
          )}
        </StatCard>

        <StatCard label="Papers sat">
          <div className="flex items-baseline gap-2">
            <span className="stat-card__big">
              {attempts.length}
            </span>
            <span className="mono">of {PAPERS.length}</span>
          </div>
          <span className="micro muted">
            {totalMarks}/{totalAvailable} marks earned · best {best.grade}
          </span>
        </StatCard>
      </div>

      {/* ------------------------------------------------------- charts */}
      <div className="panel-pair">
        <div className="panel">
          <div className="panel__head">
            <h2 className="sub">Subject mastery</h2>
            <span className="mono muted">Percentage of marks earned, by topic</span>
          </div>
          <div className="panel__body" style={{ height: 340 }}>
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke={CHART_INK} strokeOpacity={0.25} />
                  <PolarAngleAxis
                    dataKey="topic"
                    tick={{ fill: CHART_INK, fontSize: 10, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fill: CHART_INK, fontSize: 9 }}
                    stroke={CHART_INK}
                    strokeOpacity={0.25}
                  />
                  <Radar
                    name="Mastery"
                    dataKey="percent"
                    stroke={CHART_INK}
                    strokeWidth={2}
                    fill={CHART_YELLOW}
                    fillOpacity={0.75}
                  />
                  <Tooltip
                    contentStyle={{
                      border: `1px solid ${CHART_INK}`,
                      borderRadius: 6,
                      background: CHART_PAPER,
                      fontSize: 13,
                    }}
                    formatter={(value) => [`${value ?? 0}%`, "Marks earned"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="body-sm muted">
                Sit a full paper to plot the radar — it needs at least three
                topics.
              </p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2 className="sub">Grade projection</h2>
            <span className="mono muted">Scaled score per attempt, U through A*</span>
          </div>
          <div className="panel__body" style={{ height: 340 }}>
            {trend.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                  <CartesianGrid stroke={CHART_INK} strokeOpacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: CHART_INK, fontSize: 11, fontWeight: 700 }}
                    stroke={CHART_INK}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: CHART_INK, fontSize: 11 }}
                    stroke={CHART_INK}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      border: `1px solid ${CHART_INK}`,
                      borderRadius: 6,
                      background: CHART_PAPER,
                      fontSize: 13,
                    }}
                    formatter={(value, _name, item) => [
                      `${value ?? 0}% · grade ${
                        (item?.payload as { grade?: string } | undefined)?.grade ?? "—"
                      }`,
                      "Result",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                  <Line
                    type="monotone"
                    dataKey="percent"
                    name="SCALED %"
                    stroke={CHART_INK}
                    strokeWidth={3}
                    dot={{ fill: CHART_YELLOW, stroke: CHART_INK, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="t-micro" style={{ opacity: 0.55 }}>
                  ONE ATTEMPT SO FAR — A TREND NEEDS AT LEAST TWO.
                </p>
                <div className="flex items-center gap-3">
                  <GradeBadge grade={latest.grade} size="xl" />
                  <div>
                    <span className="t-subheading block">
                      {trend[0]?.percent ?? 0}%
                    </span>
                    <span className="t-micro" style={{ opacity: 0.55 }}>
                      {latest.paperTitle}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- weakest topics */}
      {mastery.length > 0 && (
        <div className="panel" style={{ marginTop: "var(--spacing-24)" }}>
          <div className="panel__head panel__head--row">
            <h2 className="sub">Work on these first</h2>
            <span className="mono muted">Weakest topics by marks earned</span>
          </div>
          <ul className="weak-list">
            {mastery.slice(0, 6).map((row) => (
              <li key={row.topic}>
                <span className="body-sm grow min-w-0 truncate">{row.topic}</span>
                <div className="meter weak-list__meter">
                  <i
                    style={{
                      width: `${row.percent}%`,
                      background:
                        row.percent >= 70
                          ? "var(--color-sticky-note-mint)"
                          : row.percent >= 40
                            ? "var(--color-highlighter-yellow)"
                            : "var(--color-terracotta)",
                    }}
                  />
                </div>
                <span className="mono weak-list__value">
                  {row.awarded}/{row.marks} · {row.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ------------------------------------------------------- history */}
      <div className="panel" style={{ marginTop: "var(--spacing-24)" }}>
        <div className="panel__head">
          <h2 className="sub">Test history</h2>
        </div>
        <div className="bt__scroll" style={{ border: 0, borderRadius: 0 }}>
          <table className="bt" style={{ minWidth: 620 }}>
            <thead>
              <tr>
                {["Date", "Paper", "Raw", "Scaled", "Time", "Grade"].map((head) => (
                  <th key={head}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <AttemptRow key={attempt.id} attempt={attempt} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/library" className="btn btn--yellow">
          <span className="btn__arrow">→</span>Sit another paper
        </Link>
      </div>
    </>
  );
}

function AttemptRow({ attempt }: { attempt: Attempt }) {
  return (
    <tr>
      <td>{new Date(attempt.finishedAt).toLocaleDateString()}</td>
      <td>{attempt.paperTitle}</td>
      <td>
        {attempt.rawMark}/{attempt.availableMarks}
      </td>
      <td>
        {attempt.scaledMark}/{attempt.componentMax}
      </td>
      <td>{Math.floor(attempt.durationSeconds / 60)}m</td>
      <td>
        <GradeBadge grade={attempt.grade} size="sm" />
      </td>
    </tr>
  );
}

/* ================================================================= bits */

function StatCard({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={`card stat-card${accent ? " card--yellow" : " card--plain"}`}>
      <span className="mono muted">{label}</span>
      {children}
    </div>
  );
}

/** Radar axis labels have to be short or they collide at the poles. */
function shortTopic(topic: string): string {
  const map: Record<string, string> = {
    "Coordinate Geometry": "Coord Geom",
    "Trigonometric Identities": "Trig Ident",
    "Trigonometric Equations": "Trig Eqns",
    "Inverse Trigonometry": "Inv Trig",
    "Sequences & Induction": "Induction",
    "Circle Geometry": "Circles",
    "Solid Geometry": "Solids",
    "Binomial Theorem": "Binomial",
    Combinatorics: "Combi",
  };
  return map[topic] ?? topic;
}
