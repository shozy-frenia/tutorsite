import {
  type Band,
  type BoundarySet,
  type Grade,
  GRADE_ORDER,
  boundariesFor,
} from "@/data/grade-boundaries";

/**
 * Grade conversion against the official boundary tables.
 *
 * Everything here is pure and synchronous — the workspace calls it on every
 * keystroke to keep the live grade readout in sync with the score.
 */

/** Look up the grade a raw mark earns in a given boundary set. */
export function gradeForMark(mark: number, set: BoundarySet): Grade {
  const clamped = Math.max(0, Math.min(mark, set.maxMark));
  // Bands are ordered best-first; the first whose floor we clear is the grade.
  for (const band of set.bands) {
    if (clamped >= band.min) return band.grade;
  }
  return "U";
}

/** The band object (not just the letter) a mark falls into. */
export function bandForMark(mark: number, set: BoundarySet): Band {
  const grade = gradeForMark(mark, set);
  return set.bands.find((b) => b.grade === grade) ?? set.bands[set.bands.length - 1];
}

/**
 * Marks needed to reach the next grade up. Returns null at the ceiling.
 * This is the number students actually care about: "4 marks off a B".
 */
export function marksToNextGrade(
  mark: number,
  set: BoundarySet
): { nextGrade: Grade; marksNeeded: number } | null {
  const current = gradeForMark(mark, set);
  const currentIdx = GRADE_ORDER.indexOf(current);
  // Walk up the ladder to the next band that actually exists in this set.
  for (let i = currentIdx + 1; i < GRADE_ORDER.length; i++) {
    const candidate = set.bands.find((b) => b.grade === GRADE_ORDER[i]);
    if (candidate) {
      return { nextGrade: candidate.grade, marksNeeded: Math.max(0, candidate.min - mark) };
    }
  }
  return null;
}

/** Percentage of the component/subject maximum, rounded to whole percent. */
export function percentOf(mark: number, set: BoundarySet): number {
  if (set.maxMark <= 0) return 0;
  return Math.round((mark / set.maxMark) * 100);
}

/**
 * Grade a single component (paper) of a subject.
 * `componentIndex` is 0-based: 0 = Paper 1, 1 = Paper 2.
 */
export function gradeComponent(subjectId: string, componentIndex: number, mark: number) {
  const subject = boundariesFor(subjectId);
  const component = subject?.components[componentIndex];
  if (!subject || !component) return null;

  return {
    subject: subject.name,
    component: component.name,
    mark,
    maxMark: component.maxMark,
    percent: percentOf(mark, component),
    grade: gradeForMark(mark, component),
    band: bandForMark(mark, component),
    next: marksToNextGrade(mark, component),
  };
}

/**
 * Project a subject-level grade from a single component result.
 *
 * A subject grade is only awarded on the combined total, so a student who has
 * sat one paper has no real subject grade yet. The honest projection is to
 * assume they repeat the same proportion of marks on the remaining papers,
 * then read the subject table. Flagged `projected: true` so the UI never
 * presents it as an awarded grade.
 */
export function projectSubjectGrade(
  subjectId: string,
  componentIndex: number,
  mark: number
): { grade: Grade; projectedTotal: number; maxMark: number; projected: true } | null {
  const subject = boundariesFor(subjectId);
  const component = subject?.components[componentIndex];
  if (!subject || !component) return null;

  const ratio = component.maxMark > 0 ? mark / component.maxMark : 0;
  const projectedTotal = Math.round(ratio * subject.subject.maxMark);

  return {
    grade: gradeForMark(projectedTotal, subject.subject),
    projectedTotal,
    maxMark: subject.subject.maxMark,
    projected: true,
  };
}

/**
 * Scale a raw score onto a component's official mark scale.
 *
 * Needed because a mock may not carry exactly as many marks as the real
 * component. Scoring 45 out of an available 67 is the same performance as
 * 54 out of 80, and only the latter can be read against the boundary table.
 */
export function scaleToComponent(
  rawMark: number,
  availableMarks: number,
  subjectId: string,
  componentIndex: number
): { scaledMark: number; componentMax: number } | null {
  const component = boundariesFor(subjectId)?.components[componentIndex];
  if (!component) return null;
  if (availableMarks <= 0) return { scaledMark: 0, componentMax: component.maxMark };

  return {
    scaledMark: Math.round((rawMark / availableMarks) * component.maxMark),
    componentMax: component.maxMark,
  };
}

/** Numeric rank of a grade, U = 0 … A* = 6. Used for charts and trends. */
export const gradeRank = (grade: Grade): number => GRADE_ORDER.indexOf(grade);

/** Colour role for a grade. Lime is reserved for the top grades, red for U. */
export function gradeTone(grade: Grade): "top" | "good" | "mid" | "low" | "fail" {
  switch (grade) {
    case "A*":
      return "top";
    case "A":
      return "good";
    case "B":
    case "C":
      return "mid";
    case "D":
    case "E":
      return "low";
    default:
      return "fail";
  }
}

/**
 * Sanity check that a boundary set is contiguous and covers 0..maxMark.
 * Exported so the data itself can be regression-tested rather than trusted.
 */
export function validateBoundarySet(set: BoundarySet): string[] {
  const errors: string[] = [];
  const sorted = [...set.bands].sort((a, b) => b.min - a.min);

  if (sorted[0]?.max !== set.maxMark) {
    errors.push(`top band max ${sorted[0]?.max} !== maxMark ${set.maxMark}`);
  }
  if (sorted[sorted.length - 1]?.min !== 0) {
    errors.push(`bottom band min ${sorted[sorted.length - 1]?.min} !== 0`);
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].min !== sorted[i + 1].max + 1) {
      errors.push(
        `gap/overlap between ${sorted[i].grade} (min ${sorted[i].min}) and ${
          sorted[i + 1].grade
        } (max ${sorted[i + 1].max})`
      );
    }
  }
  return errors;
}
