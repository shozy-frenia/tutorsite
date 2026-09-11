"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readStore, type Profile } from "@/lib/storage";
import { PARALLEL_LABEL, examSubjectsFor, stageFor } from "@/data/curriculum";
import { useT, useLocale } from "@/components/i18n/LocaleProvider";
import { subjectName } from "@/lib/i18n";

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
  const t = useT();
  const { locale } = useLocale();
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
      <div className="filter-bar card card--plain">
        <p className="body-sm">{t("library.showingAll")}</p>
        <Link href="/dashboard" className="btn btn--yellow btn--sm shrink-0">
          <span className="btn__arrow">→</span>
          {t("library.setUpProfile")}
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
      <div className="filter-bar card card--yellow">
        <div className="min-w-0">
          <span className="mono" style={{ opacity: 0.7 }}>
            {profile.name} · {t("nav.grade", { year: profile.gradeYear })} ·{" "}
            {t(`profile.parallel.${profile.parallel}`)}
          </span>
          <p className="body-sm" style={{ marginTop: 4 }}>
            {showAll
              ? t("library.showingAllNow")
              : t("library.showingOnly", {
                  load: t(`stage.${profile.gradeYear}.load`),
                })}
          </p>
          <ul className="filter-bar__subjects">
            {subjects.map((subject) => (
              <li key={subject.id} className="tag tag--outline">
                {subject.glyph} {subjectName(subject, locale)}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="btn btn--outline btn--sm shrink-0"
        >
          {showAll ? t("library.showOnlyMine") : t("library.showEverything")}
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
  const t = useT();
  return (
    <div
      className="card card--tint empty-notice"
      style={{ marginBottom: "var(--spacing-20)" }}
    >
      <p className="body-sm">{t("library.noMatch", { year })}</p>
    </div>
  );
}
