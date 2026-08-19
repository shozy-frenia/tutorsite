"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readStore, type Profile } from "@/lib/storage";
import { PARALLEL_LABEL, examSubjectsFor, stageFor } from "@/data/curriculum";

/**
 * Filter banner for the paper library.
 *
 * A registered student sits a specific set of exams — their year, their
 * parallel's languages, their chosen profile subjects. Showing them a Russian
 * Я1 paper when they are in the Russian parallel (so Russian is their Я1, but
 * a Kazakh-parallel student's Я2) is noise at best and misleading at worst.
 *
 * The filtering is done with a generated <style> block naming exactly the
 * cards to show, rather than in React, so the paper list itself stays
 * server-rendered. With JavaScript off, or before hydration, nothing is
 * hidden and the student simply sees every paper.
 */
export default function PaperFilter({
  available,
}: {
  /** Every seeded paper, as (gradeYear, subjectId) pairs. */
  available: Array<{ gradeYear: number; subjectId: string }>;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = () => setProfile(readStore().profile);
    load();
    setHydrated(true);
    window.addEventListener("talap:store", load);
    return () => window.removeEventListener("talap:store", load);
  }, []);

  const subjects = profile
    ? examSubjectsFor({
        gradeYear: profile.gradeYear,
        parallel: profile.parallel,
        profileSubjectIds: profile.profileSubjectIds,
      })
    : [];

  const filtering = Boolean(profile) && !showAll;

  // Flag the document while a filter is active. The generated rules below
  // then re-show only the cards that match.
  useEffect(() => {
    const root = document.documentElement;
    if (filtering && profile) {
      root.setAttribute("data-filter-year", String(profile.gradeYear));
    } else {
      root.removeAttribute("data-filter-year");
    }
    return () => root.removeAttribute("data-filter-year");
  }, [filtering, profile]);

  if (!hydrated) return null;

  if (!profile) {
    return (
      <div
        className="swiss-flat px-5 py-4 mb-5 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: "var(--color-paper)" }}
      >
        <p className="text-[15px] m-0" style={{ lineHeight: 1.35 }}>
          Showing every paper. Set up a profile and the library narrows to the exams you
          actually sit.
        </p>
        <Link
          href="/dashboard"
          className="no-underline press-swiss t-label shrink-0"
          style={{
            background: "var(--color-highlighter)",
            border: "2px solid var(--color-ink)",
            boxShadow: "var(--shadow-swiss)",
            padding: "8px 14px",
            color: "var(--color-ink)",
          }}
        >
          SET UP A PROFILE →
        </Link>
      </div>
    );
  }

  // How many seeded papers this student's filter actually matches. Without
  // this the library would render as a blank page when their year has no
  // papers yet, with no explanation.
  const subjectIds = new Set(subjects.map((s) => s.id));
  const matchCount = available.filter(
    (p) => p.gradeYear === profile.gradeYear && subjectIds.has(p.subjectId)
  ).length;

  // One selector per subject the student actually sits.
  const showRules = subjects
    .map(
      (subject) =>
        `html[data-filter-year="${profile.gradeYear}"] .paper-card[data-year="${profile.gradeYear}"][data-subject="${subject.id}"]`
    )
    .join(",\n");

  return (
    <>
      {filtering && showRules && (
        <style>{`${showRules} { display: flex; }`}</style>
      )}
      <div
        className="swiss px-5 py-4 mb-5 flex items-start justify-between gap-4 flex-wrap"
        style={{ background: "var(--color-highlighter)" }}
      >
      <div className="min-w-0">
        <span className="t-micro" style={{ opacity: 0.7 }}>
          {profile.name.toUpperCase()} · GRADE {profile.gradeYear} ·{" "}
          {PARALLEL_LABEL[profile.parallel].toUpperCase()}
        </span>
        <p className="text-[15px] m-0 mt-1" style={{ lineHeight: 1.35 }}>
          {showAll
            ? "Showing every paper in the library."
            : `Showing only your ${stageFor(profile.gradeYear)?.load ?? "exam subjects"}.`}
        </p>
        <ul className="flex flex-wrap gap-1.5 mt-2 list-none p-0">
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
      </div>

        <button
          onClick={() => setShowAll((v) => !v)}
          className="press-swiss t-label shrink-0"
          style={{
            background: "var(--color-sheet)",
            border: "2px solid var(--color-ink)",
            boxShadow: "var(--shadow-swiss)",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          {showAll ? "SHOW ONLY MINE" : "SHOW EVERYTHING"}
        </button>
      </div>

      {filtering && matchCount === 0 && <NoMatchNotice year={profile.gradeYear} />}
    </>
  );
}

/**
 * Shown underneath the filter when the student's year has no seeded papers
 * yet. The cards are hidden by CSS, so without this the library would look
 * simply empty and broken.
 */
function NoMatchNotice({ year }: { year: number }) {
  return (
    <div
      className="swiss-flat px-5 py-4 mb-5 empty-notice"
      style={{ background: "var(--color-paper)" }}
    >
      <p className="text-[15px] m-0" style={{ lineHeight: 1.35 }}>
        No papers seeded for your Grade {year} subjects yet. Use{" "}
        <strong>Show everything</strong> above to practise on another year&rsquo;s papers in
        the meantime.
      </p>
    </div>
  );
}
