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

/**
 * Personal tracking dashboard.
 *
 * Reads entirely from localStorage — there is no account server in the MVP.
 * Everything shown is derived from real attempts; when there are none, the
 * page says so and points at the library rather than rendering placeholder
 * numbers that look like progress.
 */

const CHART_INK = "#151515";
const CHART_YELLOW = "#fff824";

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
      <main style={{ background: "var(--color-study)", minHeight: "100vh" }}>
        <Nav variant="study" />
        <div className="px-5 md:px-10 py-10">
          <span className="t-label" style={{ opacity: 0.5 }}>
            LOADING YOUR RECORD…
          </span>
        </div>
      </main>
    );
  }

  if (!store.profile) {
    return (
      <main style={{ background: "var(--color-study)", minHeight: "100vh" }}>
        <Nav variant="study" />
        <Register onDone={(profile) => setStore(saveProfile(profile))} />
      </main>
    );
  }

  return (
    <main style={{ background: "var(--color-study)", minHeight: "100vh" }} className="pb-16">
      <Nav variant="study" />

      <section className="px-5 md:px-10">
        {/* ------------------------------------------------------ header */}
        <div className="flex items-end justify-between gap-6 flex-wrap mb-6">
          <div>
            <span className="mark t-label">GRADE {store.profile.gradeYear}</span>
            <h1 className="t-heading mt-3" style={{ maxWidth: "16ch" }}>
              {store.profile.name}
            </h1>
          </div>
          <div className="flex items-end gap-4 pb-2">
            <div className="text-right">
              <span className="t-micro block" style={{ opacity: 0.6 }}>
                TARGET
              </span>
              <GradeBadge grade={store.profile.targetGrade} size="lg" />
            </div>
          </div>
        </div>

        {store.attempts.length === 0 ? (
          <EmptyState />
        ) : (
          <Loaded store={store} streak={streak} mastery={mastery} />
        )}

        <div className="mt-10 pt-4" style={{ borderTop: "1px solid var(--color-ink)" }}>
          <button
            onClick={() => {
              if (window.confirm("Delete your profile and all saved attempts on this device?")) {
                setStore(clearStore());
              }
            }}
            className="t-micro"
            style={{
              background: "transparent",
              border: "1px solid var(--color-ink)",
              padding: "6px 12px",
              cursor: "pointer",
              opacity: 0.6,
            }}
          >
            RESET THIS DEVICE
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
    <section className="px-5 md:px-10">
      <div className="swiss max-w-[720px] rise">
        <div className="px-6 py-5" style={{ borderBottom: "2px solid var(--color-ink)" }}>
          <span className="mark t-micro">DEMO REGISTRATION</span>
          <h1 className="t-subheading mt-3">Set up your tracker</h1>
          <p className="text-[16px] mt-2 m-0" style={{ lineHeight: 1.35 }}>
            No email, no password. This stays on your device. We ask for your parallel and
            profile subjects so you only ever see papers for exams you will actually sit.
          </p>
        </div>

        <form
          className="px-6 py-5 flex flex-col gap-5"
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
          <label className="flex flex-col gap-2">
            <span className="t-micro" style={{ opacity: 0.6 }}>
              YOUR NAME
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              required
              placeholder="Aisha"
              className="px-4 py-3 text-[18px]"
              style={{
                border: "2px solid var(--color-ink)",
                background: "var(--color-sheet)",
                boxShadow: "var(--shadow-swiss)",
              }}
            />
          </label>

          <fieldset className="border-0 p-0 m-0">
            <legend className="t-micro mb-2" style={{ opacity: 0.6 }}>
              GRADE
            </legend>
            <div className="flex gap-2">
              {([10, 11, 12] as const).map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setGradeYear(year)}
                  className="press-swiss t-label grow py-3"
                  style={{
                    border: "2px solid var(--color-ink)",
                    background:
                      gradeYear === year ? "var(--color-highlighter)" : "var(--color-sheet)",
                    boxShadow: gradeYear === year ? "var(--shadow-swiss)" : "none",
                    cursor: "pointer",
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
            <span className="t-micro block mt-2" style={{ opacity: 0.55 }}>
              {stageFor(gradeYear)?.compulsory}
            </span>
          </fieldset>

          <fieldset className="border-0 p-0 m-0">
            <legend className="t-micro mb-2" style={{ opacity: 0.6 }}>
              PARALLEL — LANGUAGE OF INSTRUCTION
            </legend>
            <div className="flex gap-2">
              {(["kazakh", "russian"] as Parallel[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setParallel(value)}
                  className="press-swiss grow py-3 px-4 text-left"
                  style={{
                    border: "2px solid var(--color-ink)",
                    background:
                      parallel === value ? "var(--color-highlighter)" : "var(--color-sheet)",
                    boxShadow: parallel === value ? "var(--shadow-swiss)" : "none",
                    cursor: "pointer",
                  }}
                >
                  <span className="t-label block">{PARALLEL_LABEL[value]}</span>
                  <span className="t-micro block mt-1" style={{ opacity: 0.6 }}>
                    Я1 {subjectById(firstLanguageFor(value))?.name.split(" (")[0]} · Я2{" "}
                    {subjectById(secondLanguageFor(value))?.name.split(" (")[0]}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {needed > 0 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="t-micro mb-2" style={{ opacity: 0.6 }}>
                PROFILE {needed === 1 ? "SUBJECT" : "SUBJECTS"} — PICK {needed}
              </legend>
              <div className="grid sm:grid-cols-2 gap-2">
                {profileOptions.map((subject) => {
                  const picked = profileIds.includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => toggleProfile(subject.id)}
                      className="press-swiss py-3 px-4 text-left flex items-center gap-3"
                      style={{
                        border: "2px solid var(--color-ink)",
                        background: picked ? "var(--color-acid-lime)" : "var(--color-sheet)",
                        boxShadow: picked ? "var(--shadow-swiss)" : "none",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{subject.glyph}</span>
                      <span className="text-[16px]">{subject.name}</span>
                    </button>
                  );
                })}
              </div>
              <span className="t-micro block mt-2" style={{ opacity: 0.55 }}>
                {profileIds.length} OF {needed} CHOSEN
                {needed === 2 && profileIds.length === 2
                  ? " — PICKING A THIRD REPLACES THE OLDEST"
                  : ""}
              </span>
            </fieldset>
          )}

          <fieldset className="border-0 p-0 m-0">
            <legend className="t-micro mb-2" style={{ opacity: 0.6 }}>
              TARGET GRADE
            </legend>
            <div className="flex gap-1.5 flex-wrap">
              {[...GRADE_ORDER].reverse().map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setTargetGrade(grade)}
                  className="press-swiss"
                  style={{
                    border: "2px solid var(--color-ink)",
                    background:
                      targetGrade === grade ? "var(--color-acid-lime)" : "var(--color-sheet)",
                    boxShadow: targetGrade === grade ? "var(--shadow-swiss)" : "none",
                    width: 46,
                    height: 42,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {grade}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Live preview of what this student will actually sit */}
          <div
            className="p-4"
            style={{ border: "2px solid var(--color-ink)", background: "var(--color-study)" }}
          >
            <span className="t-micro" style={{ opacity: 0.6 }}>
              YOU WILL SIT
            </span>
            {subjects.length === 0 ? (
              <p className="text-[15px] m-0 mt-2" style={{ opacity: 0.6 }}>
                Pick your {needed === 1 ? "profile subject" : "profile subjects"} to see the list.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2 mt-2 list-none p-0">
                {subjects.map((subject) => (
                  <li
                    key={subject.id}
                    className="t-micro px-2 py-1"
                    style={{ background: "var(--color-sheet)", border: "1px solid var(--color-ink)" }}
                  >
                    {subject.glyph} {subject.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={!ready}
            className="press-swiss t-label self-start"
            style={{
              background: ready ? "var(--color-ink)" : "var(--color-paper)",
              color: ready ? "var(--color-canvas)" : "var(--color-ink)",
              border: "2px solid var(--color-ink)",
              boxShadow: "var(--shadow-swiss)",
              padding: "12px 22px",
              cursor: ready ? "pointer" : "not-allowed",
            }}
          >
            START TRACKING →
          </button>
        </form>
      </div>
    </section>
  );
}

/* ================================================================ empty */

function EmptyState() {
  return (
    <div className="swiss p-8 flex flex-col items-start gap-4 rise">
      <span className="mark t-micro">NOTHING RECORDED YET</span>
      <h2 className="t-subheading" style={{ maxWidth: "22ch" }}>
        Sit one paper and this page fills up
      </h2>
      <p className="text-[17px] m-0" style={{ maxWidth: "52ch", lineHeight: 1.35 }}>
        Mastery by topic, your grade trend, and how many marks separate you from the next
        band — all of it comes from real attempts, so there is nothing to show until you
        make one.
      </p>
      <Link
        href="/library"
        className="no-underline press-swiss t-label"
        style={{
          background: "var(--color-highlighter)",
          border: "2px solid var(--color-ink)",
          boxShadow: "var(--shadow-swiss)",
          padding: "12px 20px",
          color: "var(--color-ink)",
        }}
      >
        CHOOSE A PAPER →
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CURRENT GRADE" accent>
          <div className="flex items-center gap-3">
            <GradeBadge grade={latest.grade} size="lg" />
            <div>
              <span className="t-micro block" style={{ opacity: 0.6 }}>
                LATEST PAPER
              </span>
              <span className="t-label">
                {latest.scaledMark}/{latest.componentMax}
              </span>
            </div>
          </div>
        </StatCard>

        <StatCard label="STUDY STREAK">
          <div className="flex items-baseline gap-2">
            <span className="t-heading-sm t-mono" style={{ lineHeight: 0.8 }}>
              {streak}
            </span>
            <span className="t-label">DAY{streak === 1 ? "" : "S"}</span>
          </div>
          <span className="t-micro" style={{ opacity: 0.55 }}>
            {store.activeDays.length} ACTIVE DAY{store.activeDays.length === 1 ? "" : "S"} TOTAL
          </span>
        </StatCard>

        <StatCard label="MARKS TO NEXT GRADE">
          {next ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="t-heading-sm t-mono" style={{ lineHeight: 0.8 }}>
                  +{next.marksNeeded}
                </span>
                <GradeBadge grade={next.nextGrade} size="sm" />
              </div>
              <span className="t-micro" style={{ opacity: 0.55 }}>
                ON {component?.name.toUpperCase()}
              </span>
            </>
          ) : (
            <span className="t-subheading">TOP BAND</span>
          )}
        </StatCard>

        <StatCard label="PAPERS SAT">
          <div className="flex items-baseline gap-2">
            <span className="t-heading-sm t-mono" style={{ lineHeight: 0.8 }}>
              {attempts.length}
            </span>
            <span className="t-label">OF {PAPERS.length}</span>
          </div>
          <span className="t-micro" style={{ opacity: 0.55 }}>
            {totalMarks}/{totalAvailable} MARKS EARNED · BEST {best.grade}
          </span>
        </StatCard>
      </div>

      {/* ------------------------------------------------------- charts */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div className="swiss">
          <div className="px-5 py-4" style={{ borderBottom: "2px solid var(--color-ink)" }}>
            <h2 className="t-subheading">Subject mastery</h2>
            <span className="t-micro" style={{ opacity: 0.55 }}>
              PERCENTAGE OF MARKS EARNED, BY TOPIC
            </span>
          </div>
          <div className="p-4" style={{ height: 340 }}>
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
                      border: `2px solid ${CHART_INK}`,
                      borderRadius: 0,
                      background: "#fff",
                      fontSize: 13,
                    }}
                    formatter={(value) => [`${value ?? 0}%`, "Marks earned"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="t-micro" style={{ opacity: 0.55 }}>
                SIT A FULL PAPER TO PLOT THE RADAR — IT NEEDS AT LEAST THREE TOPICS.
              </p>
            )}
          </div>
        </div>

        <div className="swiss">
          <div className="px-5 py-4" style={{ borderBottom: "2px solid var(--color-ink)" }}>
            <h2 className="t-subheading">Grade projection</h2>
            <span className="t-micro" style={{ opacity: 0.55 }}>
              SCALED SCORE PER ATTEMPT, U THROUGH A*
            </span>
          </div>
          <div className="p-4" style={{ height: 340 }}>
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
                      border: `2px solid ${CHART_INK}`,
                      borderRadius: 0,
                      background: "#fff",
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
        <div className="swiss mt-4">
          <div
            className="px-5 py-4 flex items-baseline justify-between gap-4 flex-wrap"
            style={{ borderBottom: "2px solid var(--color-ink)" }}
          >
            <h2 className="t-subheading">Work on these first</h2>
            <span className="t-micro" style={{ opacity: 0.55 }}>
              WEAKEST TOPICS BY MARKS EARNED
            </span>
          </div>
          <ul className="list-none p-0 m-0">
            {mastery.slice(0, 6).map((row) => (
              <li
                key={row.topic}
                className="px-5 py-3 flex items-center gap-4"
                style={{ borderTop: "1px solid var(--color-ink)" }}
              >
                <span className="text-[16px] grow min-w-0 truncate">{row.topic}</span>
                <div
                  className="hidden sm:block shrink-0"
                  style={{ width: 200, height: 14, border: "2px solid var(--color-ink)" }}
                >
                  <div
                    style={{
                      width: `${row.percent}%`,
                      height: "100%",
                      background:
                        row.percent >= 70
                          ? "var(--color-acid-lime)"
                          : row.percent >= 40
                            ? "var(--color-highlighter)"
                            : "var(--color-signal-red)",
                    }}
                  />
                </div>
                <span
                  className="t-label t-mono shrink-0"
                  style={{ minWidth: 84, textAlign: "right" }}
                >
                  {row.awarded}/{row.marks} · {row.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ------------------------------------------------------- history */}
      <div className="swiss mt-4">
        <div className="px-5 py-4" style={{ borderBottom: "2px solid var(--color-ink)" }}>
          <h2 className="t-subheading">Test history</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: 620 }}>
            <thead>
              <tr style={{ background: "var(--color-ink)" }}>
                {["DATE", "PAPER", "RAW", "SCALED", "TIME", "GRADE"].map((head, i) => (
                  <th
                    key={head}
                    className="t-micro px-4 py-2"
                    style={{
                      color: "var(--color-canvas)",
                      textAlign: i === 0 || i === 1 ? "left" : "right",
                    }}
                  >
                    {head}
                  </th>
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
        <Link
          href="/library"
          className="no-underline press-swiss t-label inline-block"
          style={{
            background: "var(--color-highlighter)",
            border: "2px solid var(--color-ink)",
            boxShadow: "var(--shadow-swiss)",
            padding: "12px 20px",
            color: "var(--color-ink)",
          }}
        >
          SIT ANOTHER PAPER →
        </Link>
      </div>
    </>
  );
}

function AttemptRow({ attempt }: { attempt: Attempt }) {
  return (
    <tr style={{ borderTop: "1px solid var(--color-ink)" }}>
      <td className="px-4 py-3 text-[15px] t-mono">
        {new Date(attempt.finishedAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-[15px]">{attempt.paperTitle}</td>
      <td className="px-4 py-3 text-[15px] t-mono text-right">
        {attempt.rawMark}/{attempt.availableMarks}
      </td>
      <td className="px-4 py-3 text-[15px] t-mono text-right">
        {attempt.scaledMark}/{attempt.componentMax}
      </td>
      <td className="px-4 py-3 text-[15px] t-mono text-right">
        {Math.floor(attempt.durationSeconds / 60)}m
      </td>
      <td className="px-4 py-3 text-right">
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
    <div
      className="swiss p-5 flex flex-col gap-2"
      style={accent ? { background: "var(--color-highlighter)" } : undefined}
    >
      <span className="t-micro" style={{ opacity: 0.6 }}>
        {label}
      </span>
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
