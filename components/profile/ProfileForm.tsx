"use client";

import { useEffect, useState } from "react";
import {
  GRADE_ORDER,
  type Grade,
  type GradeYear,
} from "@/data/grade-boundaries";
import {
  examSubjectsFor,
  firstLanguageFor,
  profileCountFor,
  profileOptionsFor,
  secondLanguageFor,
  stageFor,
  subjectById,
  type Parallel,
} from "@/data/curriculum";
import type { Profile } from "@/lib/storage";
import { useT, useLocale } from "@/components/i18n/LocaleProvider";
import { subjectName } from "@/lib/i18n";

/**
 * The profile form, used twice.
 *
 * On a first visit the dashboard shows it empty, with its introduction, and a
 * save creates the profile. In settings it is shown pre-filled and a save
 * edits — which is why `joinedAt` is carried through rather than regenerated:
 * changing your target grade should not reset how long you have been here.
 *
 * What it asks for is deliberately short. Year and parallel decide which papers
 * a student will ever sit, and the profile subjects decide the rest; nothing
 * here is asked because it would be nice to know.
 */

export default function ProfileForm({
  initial,
  onDone,
  submitLabel,
  showIntro = true,
}: {
  /** Pre-fills the form. Absent on first run, present when editing. */
  initial?: Profile | null;
  onDone: (profile: Profile) => void;
  /** Defaults to the first-run wording. */
  submitLabel?: string;
  /** The first-run introduction. Settings supplies its own heading. */
  showIntro?: boolean;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [name, setName] = useState(initial?.name ?? "");
  const [gradeYear, setGradeYear] = useState<GradeYear>(initial?.gradeYear ?? 10);
  const [parallel, setParallel] = useState<Parallel>(initial?.parallel ?? "kazakh");
  const [profileIds, setProfileIds] = useState<string[]>(
    initial?.profileSubjectIds ?? []
  );
  const [targetGrade, setTargetGrade] = useState<Grade>(
    initial?.targetGrade ?? "A"
  );
  const [saved, setSaved] = useState(false);

  const profileOptions = profileOptionsFor(gradeYear);
  const needed = profileCountFor(gradeYear);

  // Changing year changes how many profiles are allowed, and Grade 11 has
  // none at all — drop anything that no longer applies rather than carrying
  // a stale choice into the saved profile.
  useEffect(() => {
    const allowed = new Set(profileOptionsFor(gradeYear).map((s) => s.id));
    setProfileIds((prev) => prev.filter((id) => allowed.has(id)).slice(0, profileCountFor(gradeYear)));
  }, [gradeYear]);

  // Any edit makes the "saved" note stale, so it goes away as soon as the
  // form differs from what was written.
  useEffect(() => {
    setSaved(false);
  }, [name, gradeYear, parallel, profileIds, targetGrade]);

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
    <div className="card card--plain register rise">
      {showIntro && !initial && (
        <div className="register__intro">
          <span className="tag">{t("dash.demoRegistration")}</span>
          <h1 className="sub" style={{ marginTop: "var(--spacing-16)" }}>
            {t("profile.title")}
          </h1>
          <p className="body-sm" style={{ marginTop: 8 }}>
            {t("profile.sub")}
          </p>
        </div>
      )}

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
              // Editing keeps the original join date; only a first run sets one.
              joinedAt: initial?.joinedAt ?? new Date().toISOString(),
            });
            setSaved(true);
          }}
        >
          <label>
            <span className="field-label">{t("profile.name")}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={40}
              required
              placeholder={t("profile.namePlaceholder")}
              className="field"
            />
          </label>

          <fieldset className="border-0 p-0 m-0">
            <legend className="field-label">{t("profile.year")}</legend>
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
              {t(`stage.${gradeYear}.compulsory`)}
            </span>
          </fieldset>

          <fieldset className="border-0 p-0 m-0">
            <legend className="field-label">{t("profile.parallel")}</legend>
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
                    {t(`profile.parallel.${value}`)}
                  </span>
                  <span className="micro muted" style={{ display: "block", marginTop: 4 }}>
                    {(() => {
                      const first = subjectById(firstLanguageFor(value));
                      const second = subjectById(secondLanguageFor(value));
                      // The names already carry their own Я1 / Я2 marker in
                      // Russian and Kazakh, so prefixing one would repeat it.
                      return [first, second]
                        .map((subject) =>
                          subject ? subjectName(subject, locale) : ""
                        )
                        .filter(Boolean)
                        .join(" · ");
                    })()}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {needed > 0 && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="field-label">
                {needed === 1
                  ? t("profile.profileSubjectsOne")
                  : t("profile.profileSubjectsTwo")}
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
                      <span className="body-sm">
                        {subjectName(subject, locale)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="mono muted" style={{ display: "block", marginTop: 8 }}>
                {t("dash.chosen", { count: profileIds.length, needed })}
                {needed === 2 && profileIds.length === 2
                  ? t("dash.replacesOldest")
                  : ""}
              </span>
            </fieldset>
          )}

          <fieldset className="border-0 p-0 m-0">
            <legend className="field-label">{t("profile.target")}</legend>
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
            <span className="mono muted">{t("dash.youWillSit")}</span>
            {subjects.length === 0 ? (
              <p className="body-sm muted" style={{ marginTop: 8 }}>
                {t("dash.pickToSee")}
              </p>
            ) : (
              <ul className="filter-bar__subjects">
                {subjects.map((subject) => (
                  <li key={subject.id} className="tag tag--outline">
                    {subject.glyph} {subjectName(subject, locale)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="profile-form__save">
            <button
              type="submit"
              disabled={!ready}
              className="btn btn--primary"
            >
              <span className="btn__arrow">→</span>
              {submitLabel ?? t("profile.submit")}
            </button>
            {saved && (
              <span className="caption" role="status" style={{ color: "var(--color-ok)" }}>
                {t("profile.saved")}
              </span>
            )}
          </div>
        </form>
    </div>
  );
}
