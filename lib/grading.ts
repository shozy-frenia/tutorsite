import {
  type Band,
  type BoundarySet,
  type Grade,
  type GradeYear,
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
export function gradeComponent(
  subjectId: string,
  componentIndex: number,
  mark: number,
  gradeYear: GradeYear
) {
  const subject = boundariesFor(subjectId, gradeYear);
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
  mark: number,
  gradeYear: GradeYear
): { grade: Grade; projectedTotal: number; maxMark: number; projected: true } | null {
  const subject = boundariesFor(subjectId, gradeYear);
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
  componentIndex: number,
  gradeYear: GradeYear
): { scaledMark: number; componentMax: number } | null {
  const component = boundariesFor(subjectId, gradeYear)?.components[componentIndex];
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

/* -------------------------------------------------------- answer matching */

/**
 * Answer comparison.
 *
 * Three pilots reported a correct answer marked wrong. The cause was a
 * straight string comparison: `2x-6` and `-6+2x` are the same expression and
 * compared unequal. Marking a student wrong for the order they wrote a sum in
 * teaches them nothing about the syllabus, so equivalence is decided on the
 * meaning of the answer rather than its spelling:
 *
 *   - whitespace, brackets and multiplication signs carry no meaning here;
 *   - a sum is a set, not a sequence — terms are sorted before comparing;
 *   - `6,25` and `6.25` are the same number written by different keyboards;
 *   - `0.5`, `1/2`, `2/4` and `½` are one value;
 *   - `10 2/3` is `32/3`.
 *
 * What normalisation cannot reach — rearranged equations, alternative valid
 * phrasings — belongs in the question's `acceptedAnswers`, not here. Widening
 * these rules to cover those would start marking wrong answers correct.
 */

/** Unicode vulgar fractions, spelled out. Leading space keeps `2½` = `2 1/2`. */
const VULGAR_FRACTIONS: Record<string, string> = {
  "½": " 1/2",
  "⅓": " 1/3",
  "⅔": " 2/3",
  "¼": " 1/4",
  "¾": " 3/4",
  "⅕": " 1/5",
  "⅖": " 2/5",
  "⅗": " 3/5",
  "⅘": " 4/5",
  "⅙": " 1/6",
  "⅚": " 5/6",
  "⅛": " 1/8",
  "⅜": " 3/8",
  "⅝": " 5/8",
  "⅞": " 7/8",
};

const OPENERS = "([{";
const CLOSERS = ")]}";
/** Characters after which a `+`/`-` is a sign on the next term, not an operator. */
const PRECEDES_SIGN = new Set(["+", "-", "^", "/", "=", ",", ...OPENERS]);

/**
 * Split on the given characters, ignoring any that sit inside brackets.
 * `(-16,-9)` is one coordinate pair, not two items.
 */
function splitTop(expr: string, separators: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (OPENERS.includes(ch)) depth++;
    else if (CLOSERS.includes(ch)) depth = Math.max(0, depth - 1);
    else if (depth === 0 && separators.includes(ch)) {
      parts.push(expr.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(expr.slice(start));
  return parts;
}

/** The additive terms of an expression, each carrying its own sign. */
function splitTerms(expr: string): string[] {
  const terms: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (OPENERS.includes(ch)) depth++;
    else if (CLOSERS.includes(ch)) depth = Math.max(0, depth - 1);
    else if (
      (ch === "+" || ch === "-") &&
      depth === 0 &&
      i > start && // a sign opening the term is part of it
      !PRECEDES_SIGN.has(expr[i - 1])
    ) {
      terms.push(expr.slice(start, i));
      start = i;
    }
  }
  terms.push(expr.slice(start));
  return terms.filter((t) => t !== "");
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** `2/4` -> `1/2`. Left alone unless the whole term is an integer fraction. */
function reduceFraction(term: string): string {
  const match = /^([+-]?)(\d+)\/(\d+)$/.exec(term);
  if (!match) return term;
  const [, sign, top, bottom] = match;
  const divisor = gcd(Number(top), Number(bottom));
  if (divisor <= 1) return term;
  return `${sign}${Number(top) / divisor}/${Number(bottom) / divisor}`;
}

/** Canonical form of one expression: brackets dropped, terms sorted. */
function canonicalExpression(expr: string): string {
  const terms = splitTerms(expr)
    .map((term) => {
      const bare = term.replace(/[(){}[\]]/g, "");
      return reduceFraction(/^[+-]/.test(bare) ? bare : `+${bare}`);
    })
    .sort();
  return terms.join("").replace(/^\+/, "");
}

/** Canonical form of a whole answer — each side of `=`, each item of a list. */
function canonicalStatement(text: string): string {
  return splitTop(text, "=")
    .map((side) => splitTop(side, ",").map(canonicalExpression).join(","))
    .join("=");
}

/** Everything that is the same regardless of how the comma is read. */
function prepare(raw: string): string {
  let text = raw.toLowerCase();
  text = text.replace(/[−–—]/g, "-"); // unicode minus and dashes
  text = text.replace(/[×·∙]/g, "*");
  text = text.replace(/±/g, "+-");
  text = text.replace(/√/g, "sqrt");
  text = text.replace(/π/g, "pi");
  text = text.replace(/[°]/g, " deg");
  text = text.replace(/degrees?/g, "deg");
  text = text.replace(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g, (ch) => VULGAR_FRACTIONS[ch] ?? ch);
  // Mixed numbers: "10 2/3" is one value, and the space is about to be lost.
  text = text.replace(
    /(\d+)\s+(\d+)\/(\d+)/g,
    (_, whole: string, top: string, bottom: string) =>
      `${Number(whole) * Number(bottom) + Number(top)}/${bottom}`
  );
  return text;
}

/**
 * A comma is either a decimal point or a list separator, and `8,5` is
 * genuinely both ("8.5" and "8 and 5"). Rather than guess, read it both ways
 * and let a match on either count — the ambiguity is the keyboard's, and the
 * student should not lose the mark to it.
 */
function commaReadings(text: string): string[] {
  const asList = text.replace(/;/g, ",");
  const commas = (text.match(/,/g) ?? []).length;
  if (commas === 1 && !text.includes(";") && /\d\s*,\s*\d/.test(text)) {
    const asDecimal = text.replace(/(\d)\s*,\s*(\d)/, "$1.$2");
    if (asDecimal !== asList) return [asList, asDecimal];
  }
  return [asList];
}

/** Every canonical form an answer can legitimately be read as. */
export function answerForms(raw: string): string[] {
  const forms = commaReadings(prepare(raw)).map((reading) =>
    canonicalStatement(reading.replace(/\s+/g, "").replace(/\*/g, "")).replace(/,$/, "")
  );
  return [...new Set(forms)];
}

/**
 * Canonical form of an answer. Two answers with the same one are the same
 * answer; the converse does not hold, so compare with `answersMatch`.
 */
export function normaliseAnswer(raw: string): string {
  return answerForms(raw)[0] ?? "";
}

/** Value of a bare number or fraction, so `0.5`, `1/2` and `2/4` compare equal. */
function numericValue(text: string): number | null {
  const match = /^([+-]?\d*\.?\d+)(?:\/([+-]?\d*\.?\d+))?$/.exec(text);
  if (!match) return null;
  const top = Number(match[1]);
  if (!Number.isFinite(top)) return null;
  if (match[2] === undefined) return top;
  const bottom = Number(match[2]);
  if (!Number.isFinite(bottom) || bottom === 0) return null;
  return top / bottom;
}

/**
 * Do a submitted answer and an answer key mean the same thing?
 *
 * `numeric` drops a trailing unit, so `16 cm` answers a key of `16`. It is
 * only set for questions whose answer is a bare quantity.
 */
export function answersMatch(
  submitted: string,
  key: string,
  options: { numeric?: boolean } = {}
): boolean {
  const submittedForms = answerForms(submitted);
  const keyForms = answerForms(key);
  if (submittedForms.some((form) => keyForms.includes(form))) return true;

  const value = (form: string) =>
    numericValue(options.numeric ? form.replace(/[a-z]/g, "") : form);
  for (const form of submittedForms) {
    const left = value(form);
    if (left === null) continue;
    for (const keyForm of keyForms) {
      const right = value(keyForm);
      if (right !== null && Math.abs(left - right) < 1e-9) return true;
    }
  }
  return false;
}
