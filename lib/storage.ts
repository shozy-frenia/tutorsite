"use client";

import type { Grade, GradeYear } from "@/data/grade-boundaries";
import type { Parallel } from "@/data/curriculum";

/**
 * Local persistence for the demo.
 *
 * Everything lives in localStorage under one namespaced key. There is no
 * server-side account in the MVP — registration is a name and a target grade,
 * which is enough to make the dashboard meaningful without asking students for
 * credentials the app cannot yet protect.
 */

const KEY = "talap.v1";

export interface Profile {
  name: string;
  gradeYear: GradeYear;
  /**
   * Language parallel. Decides which language is Я1 and which is Я2, so it
   * decides which language papers this student will ever sit.
   */
  parallel: Parallel;
  /**
   * Chosen profile subjects: one at Grade 10, two at Grade 12, none at
   * Grade 11. Mock papers are filtered to these.
   */
  profileSubjectIds: string[];
  targetGrade: Grade;
  /** ISO date the profile was created. */
  joinedAt: string;
}

export interface QuestionOutcome {
  questionId: string;
  number: number;
  topic: string;
  marks: number;
  awarded: number;
  correct: boolean;
  /** Whether the student self-marked this one (worked questions). */
  selfMarked: boolean;
}

export interface Attempt {
  id: string;
  paperId: string;
  paperTitle: string;
  subjectId: string;
  componentIndex: number;
  /** Grade year the paper belongs to — boundary tables differ by year. */
  gradeYear: GradeYear;
  /** ISO timestamp the attempt was submitted. */
  finishedAt: string;
  rawMark: number;
  availableMarks: number;
  scaledMark: number;
  componentMax: number;
  grade: Grade;
  /** Seconds spent. */
  durationSeconds: number;
  outcomes: QuestionOutcome[];
}

export interface Store {
  profile: Profile | null;
  attempts: Attempt[];
  /** ISO dates (YYYY-MM-DD) on which the student practised. */
  activeDays: string[];
}

const EMPTY: Store = { profile: null, attempts: [], activeDays: [] };

const isBrowser = () => typeof window !== "undefined";

/**
 * Validate a profile restored from storage.
 *
 * The stored shape has changed once already: profiles written before the
 * parallel and profile-subject rewrite carry neither field, and reading one of
 * those as if it did took the whole library page down with a TypeError. A
 * profile that no longer matches the shape the app requires is treated as
 * absent, so the student is asked to set it up again instead of the page
 * failing. Attempt history and the streak live under separate keys of the same
 * record and survive untouched.
 */
function validProfile(value: unknown): Profile | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<Profile>;

  const { name, gradeYear, parallel } = candidate;
  const yearOk = gradeYear === 10 || gradeYear === 11 || gradeYear === 12;
  const parallelOk = parallel === "kazakh" || parallel === "russian";
  if (typeof name !== "string" || !name || !yearOk || !parallelOk) return null;

  return {
    name,
    gradeYear,
    parallel,
    profileSubjectIds: Array.isArray(candidate.profileSubjectIds)
      ? candidate.profileSubjectIds.filter((id): id is string => typeof id === "string")
      : [],
    targetGrade: candidate.targetGrade ?? "A",
    joinedAt: typeof candidate.joinedAt === "string" ? candidate.joinedAt : todayIso(),
  };
}

export function readStore(): Store {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      profile: validProfile(parsed.profile),
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays : [],
    };
  } catch {
    // Corrupt or unavailable storage should never take the app down.
    return EMPTY;
  }
}

function writeStore(store: Store): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event("talap:store"));
  } catch {
    // Quota exceeded or private mode — the session still works in memory.
  }
}

export const todayIso = (): string => new Date().toISOString().slice(0, 10);

export function saveProfile(profile: Profile): Store {
  const store = readStore();
  const next: Store = { ...store, profile };
  writeStore(next);
  return next;
}

export function saveAttempt(attempt: Attempt): Store {
  const store = readStore();
  const day = todayIso();
  const next: Store = {
    ...store,
    attempts: [attempt, ...store.attempts].slice(0, 200),
    activeDays: store.activeDays.includes(day)
      ? store.activeDays
      : [...store.activeDays, day].sort(),
  };
  writeStore(next);
  return next;
}

export function clearStore(): Store {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(KEY);
      window.dispatchEvent(new Event("talap:store"));
    } catch {
      /* ignore */
    }
  }
  return EMPTY;
}

/**
 * Consecutive days of practice ending today or yesterday.
 *
 * Counting up to yesterday keeps a streak alive until the end of the next day,
 * which is how every study app users already know behaves.
 */
export function currentStreak(activeDays: string[]): number {
  if (activeDays.length === 0) return 0;
  const days = new Set(activeDays);

  const dayMs = 86_400_000;
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  // If today is missing, the streak may still be running through yesterday.
  let cursor = start.getTime();
  if (!days.has(new Date(cursor).toISOString().slice(0, 10))) {
    cursor -= dayMs;
    if (!days.has(new Date(cursor).toISOString().slice(0, 10))) return 0;
  }

  let streak = 0;
  while (days.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= dayMs;
  }
  return streak;
}

/** Per-topic mastery across all attempts, as a percentage of marks earned. */
export function topicMastery(
  attempts: Attempt[]
): Array<{ topic: string; percent: number; marks: number; awarded: number }> {
  const totals = new Map<string, { marks: number; awarded: number }>();

  for (const attempt of attempts) {
    for (const outcome of attempt.outcomes) {
      const current = totals.get(outcome.topic) ?? { marks: 0, awarded: 0 };
      current.marks += outcome.marks;
      current.awarded += outcome.awarded;
      totals.set(outcome.topic, current);
    }
  }

  return [...totals.entries()]
    .map(([topic, { marks, awarded }]) => ({
      topic,
      marks,
      awarded,
      percent: marks > 0 ? Math.round((awarded / marks) * 100) : 0,
    }))
    .sort((a, b) => a.percent - b.percent);
}
