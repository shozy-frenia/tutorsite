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
import ProfileForm from "@/components/profile/ProfileForm";
import { useT, useLocale } from "@/components/i18n/LocaleProvider";
import { subjectName } from "@/lib/i18n";

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
/** Gridlines: the pencil rule, not the ink. */
const CHART_RULE = "#e4e0d2";
/** The radar outline: yellow that holds its own as a 2px stroke. */
const CHART_YELLOW_DEEP = "#c8a600";

export default function Dashboard() {
  const t = useT();
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
          <span className="mono muted">{t("dash.loading")}</span>
        </div>
      </main>
    );
  }

  if (!store.profile) {
    return (
      <main style={{ minHeight: "100vh" }}>
        <Nav />
        <section className="shell section-tight">
          <div style={{ maxWidth: 720, marginInline: "auto" }}>
            <ProfileForm onDone={(profile) => setStore(saveProfile(profile))} />
          </div>
        </section>
        {/* The account belongs here too, not only once a tracker exists.
            "Set up your tracker" is a local profile — no email, no password —
            and a student who wants their work to follow them to another device
            would otherwise have nothing on this page to tell them an account
            is even possible. */}
        <section className="shell" style={{ paddingBottom: "var(--spacing-48)" }}>
          <div style={{ maxWidth: 720, marginInline: "auto" }}>
            <AccountPanel onCleared={setStore} />
          </div>
        </section>
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
            <span className="tag">{t("nav.grade", { year: store.profile.gradeYear })}</span>
            <h1 className="h" style={{ marginTop: "var(--spacing-16)" }}>
              {store.profile.name}
            </h1>
          </div>
          <div className="text-right">
            <span className="mono muted">{t("dash.target")}</span>
            <GradeBadge grade={store.profile.targetGrade} size="lg" />
          </div>
        </div>

        {store.attempts.length === 0 ? (
          <EmptyState />
        ) : (
          <Loaded store={store} streak={streak} mastery={mastery} />
        )}

        {/* The account panel and the device reset moved to /settings: this
            page is the record, that page is the controls. */}
        <div className="dash-reset">
          <Link href="/settings" className="btn btn--outline btn--sm">
            {t("nav.settings")}
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ================================================================ empty */

function EmptyState() {
  const t = useT();
  return (
    <div className="card card--plain empty-state rise">
      <span className="tag">{t("dash.empty.title")}</span>
      <h2 className="sub measure-sm">{t("dash.empty.body")}</h2>
      <p className="body measure">
        Mastery by topic, your grade trend, and how many marks separate you from
        the next band — all of it comes from real attempts, so there is nothing
        to show until you make one.
      </p>
      <Link href="/library" className="btn btn--primary">
        <span className="btn__arrow">→</span>
        {t("dash.empty.cta")}
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
  const t = useT();
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
        <StatCard label={t("dash.currentGrade")} accent>
          <div className="flex items-center gap-3">
            <GradeBadge grade={latest.grade} size="lg" />
            <div>
              <span className="mono muted" style={{ display: "block" }}>
                {t("dash.latestPaper")}
              </span>
              <span className="mono">
                {latest.scaledMark}/{latest.componentMax}
              </span>
            </div>
          </div>
        </StatCard>

        <StatCard label={t("dash.studyStreak")}>
          <div className="flex items-baseline gap-2">
            <span className="stat-card__big">
              {streak}
            </span>
            <span className="mono">{t("dash.daysInARow")}</span>
          </div>
          <span className="micro muted">
            {t("dash.activeDaysTotal", { count: store.activeDays.length })}
          </span>
        </StatCard>

        <StatCard label={t("dash.marksToNext")}>
          {next ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="stat-card__big">
                  +{next.marksNeeded}
                </span>
                <GradeBadge grade={next.nextGrade} size="sm" />
              </div>
              <span className="micro muted">
                {t("dash.onComponent", { component: component?.name ?? "" })}
              </span>
            </>
          ) : (
            <span className="sub">{t("dash.topBand")}</span>
          )}
        </StatCard>

        <StatCard label={t("dash.papersSat")}>
          <div className="flex items-baseline gap-2">
            <span className="stat-card__big">
              {attempts.length}
            </span>
            <span className="mono">{t("dash.ofPapers", { count: PAPERS.length })}</span>
          </div>
          <span className="micro muted">
            {t("dash.marksEarnedBest", {
              earned: totalMarks,
              total: totalAvailable,
              grade: best.grade,
            })}
          </span>
        </StatCard>
      </div>

      {/* ------------------------------------------------------- charts */}
      <div className="panel-pair">
        <div className="panel">
          <div className="panel__head">
            <h2 className="sub">{t("dash.mastery")}</h2>
            <span className="mono muted">{t("dash.masterySub")}</span>
          </div>
          <div className="panel__body" style={{ height: 340 }}>
            {radarData.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke={CHART_RULE} strokeOpacity={1} />
                  <PolarAngleAxis
                    dataKey="topic"
                    tick={{ fill: CHART_INK, fontSize: 10, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fill: CHART_INK, fontSize: 9 }}
                    stroke={CHART_RULE}
                  />
                  <Radar
                    name="Mastery"
                    dataKey="percent"
                    stroke={CHART_YELLOW_DEEP}
                    strokeWidth={2}
                    fill={CHART_YELLOW}
                    fillOpacity={0.55}
                  />
                  <Tooltip
                    contentStyle={{
                      border: `1px solid ${CHART_INK}`,
                      borderRadius: 6,
                      background: CHART_PAPER,
                      fontSize: 13,
                    }}
                    formatter={(value) => [`${value ?? 0}%`, t("dash.marksEarned")]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="body-sm muted">{t("dash.radarNeedsMore")}</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel__head">
            <h2 className="sub">{t("dash.projection")}</h2>
            <span className="mono muted">{t("dash.projectionSub")}</span>
          </div>
          <div className="panel__body" style={{ height: 340 }}>
            {trend.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                  <CartesianGrid stroke={CHART_RULE} strokeOpacity={1} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: CHART_INK, fontSize: 11, fontWeight: 600 }}
                    stroke={CHART_RULE}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: CHART_INK, fontSize: 11 }}
                    stroke={CHART_RULE}
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
                    dot={{ fill: CHART_YELLOW, stroke: CHART_INK, strokeWidth: 1.5, r: 4 }}
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
            <h2 className="sub">{t("dash.weakest")}</h2>
            <span className="mono muted">{t("dash.weakestSub")}</span>
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
          <h2 className="sub">{t("dash.history")}</h2>
        </div>
        <div className="bt__scroll" style={{ border: 0, borderRadius: 0 }}>
          <table className="bt" style={{ minWidth: 620 }}>
            <thead>
              <tr>
                {[
                  t("dash.col.date"),
                  t("dash.col.paper"),
                  t("dash.col.raw"),
                  t("dash.col.scaled"),
                  t("dash.col.time"),
                  t("common.grade"),
                ].map((head) => (
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
          <span className="btn__arrow">→</span>
          {t("dash.sitAnother")}
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
