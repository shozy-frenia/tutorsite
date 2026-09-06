/**
 * Exam / question model.
 *
 * Mirrors how NIS papers are actually marked. A real Paper 1 awards *method*
 * marks: a student who sets up a valid proof but slips in arithmetic still
 * scores. So questions come in two marking modes:
 *
 *   auto   — a single determinate answer (a number, a coordinate pair, an
 *            expression). Marked by the machine, all-or-nothing.
 *   worked — proofs, constructions and diagram questions. The student marks
 *            their own work against the published mark scheme, step by step.
 *            This is not a cop-out: it is how the paper is graded, and
 *            self-marking against a scheme is itself a taught exam skill.
 *
 * Only questions whose answer is unambiguous are set to `auto`.
 */

import { answersMatch } from "./grading";

export type MarkingMode = "auto" | "worked" | "assessed";

export type AnswerKind = "numeric" | "expression" | "choice";

export type Difficulty = "foundation" | "standard" | "stretch";

export interface MarkSchemeStep {
  /** What earns the mark, phrased the way a mark scheme phrases it. */
  text: string;
  /** Marks awarded for this step. */
  marks: number;
}

/**
 * One row of a banded rubric — how many marks a level of response earns and
 * what that level looks like. Copied from the published mark scheme, in the
 * language the scheme is written in.
 */
export interface CriterionBand {
  /** Mark range as the scheme prints it, e.g. "9-10" or "5". */
  range: string;
  /** Highest mark inside this band. */
  max: number;
  descriptor: string;
}

/**
 * A criterion an extended answer is marked against.
 *
 * Two shapes, because real mark schemes come in two shapes. Language papers
 * and History use *bands*: a level of response, and a mark chosen inside it.
 * The sciences use *points*: a list of creditworthy statements, one mark each,
 * awarded if the answer contains them. Encoding a science scheme as bands, or
 * an essay scheme as points, would produce a number the real examiner would
 * not recognise — so a criterion carries whichever its paper actually uses.
 *
 * Exactly one of `bands` and `points` is present; `npm run check` enforces it.
 */
export interface Criterion {
  id: string;
  name: string;
  maxMarks: number;
  /** What the marker is looking for, in one sentence. */
  focus: string;
  /** Level-of-response marking: pick a band, then a mark inside it. */
  bands?: CriterionBand[];
  /** Point marking: each creditworthy statement and what it is worth. */
  points?: MarkSchemeStep[];
}

/**
 * Source material a question is answered from: a text extract, a photograph,
 * or a table of data. History marks explicitly reward using several of them,
 * so each one is addressable by its printed reference.
 */
export interface SourceMaterial {
  /** Reference as printed, e.g. "A", "B", "Text 1". */
  ref: string;
  kind: "text" | "image" | "data";
  title: string;
  /** The extract itself, or for an image the caption plus what it shows. */
  content: string;
  /** Attribution line as printed on the paper. */
  attribution?: string;
  /** Path under /public when the figure itself is available. */
  image?: string;
}

export interface Question {
  id: string;
  /** Question number as printed on the paper. */
  number: number;
  marks: number;
  topic: string;
  difficulty: Difficulty;
  /** Question text, English. */
  prompt: string;
  /** Original Kazakh stem, where the paper carries one. */
  promptKk?: string;
  /** Sub-parts, e.g. ["a) …", "b) …"]. */
  parts?: string[];
  /** Path under /public for a diagram the question depends on. */
  figure?: string;
  figureAlt?: string;

  marking: MarkingMode;
  answerKind?: AnswerKind;
  /** Canonical answer. Present for every question — `worked` shows it on review. */
  answer: string;
  /**
   * Extra answers to accept, beyond the key and everything normalisation
   * already reaches. For equivalences the normaliser cannot decide — a
   * rearranged equation, a valid alternative phrasing — not for spelling.
   */
  acceptedAnswers?: string[];
  /** Options for choice questions. */
  options?: string[];
  /** Unit suffix shown next to the input, e.g. "cm". */
  unit?: string;

  markScheme: MarkSchemeStep[];
  /** One nudge — the single step students usually miss. */
  hint: string;

  /* ---------------------------------------------------- extended answers */

  /**
   * Rubric for an `assessed` question. Marks across the criteria must sum to
   * the question's tariff — `npm run check` asserts it.
   */
  criteria?: Criterion[];
  /** Sources the answer must draw on. */
  sources?: SourceMaterial[];
  /** Length the paper asks for, in words. */
  minWords?: number;
  maxWords?: number;
  /** Language the answer must be written in, as the paper requires it. */
  answerLanguage?: "kk" | "ru" | "en";
}

/**
 * Where a paper's questions came from.
 *
 * `transcribed` — copied question by question from a real NIS past paper.
 * `authored`    — written to the syllabus standard for practice. Still graded
 *                 on the official boundary table, but it is not a past paper
 *                 and the UI must never imply that it is.
 */
export type Provenance = "transcribed" | "authored";

export interface Paper {
  id: string;
  subjectId: string;
  /** Boundary component index: 0 = Paper 1, 1 = Paper 2. */
  componentIndex: number;
  title: string;
  gradeYear: 10 | 11 | 12;
  /** Sitting date as printed on the paper, or the standard it was written to. */
  sitting: string;
  durationMinutes: number;
  totalMarks: number;
  calculator: boolean;
  provenance: Provenance;
  /** One line on origin, shown wherever the paper is offered. */
  provenanceNote: string;
  instructions: string[];
  questions: Question[];
}

/** Sum of question marks — used to assert the paper totals what it claims. */
export const paperMarkTotal = (paper: Paper): number =>
  paper.questions.reduce((sum, q) => sum + q.marks, 0);

/**
 * Answer marking.
 *
 * The comparison itself lives in `lib/grading.ts`; these are the two entry
 * points the workspace and `npm run check` have always called.
 */

export { normaliseAnswer } from "./grading";

/**
 * Scientific notation hides a "+"/"-" that is not a term separator: splitting
 * "1e-5" on signs would produce "1e" and "5". Expressions like that are left
 * to exact matching.
 */
const SCIENTIFIC = /\d(?:e)[-+]?\d/;

/**
 * A normalised sum, split into signed terms and sorted: "2x-6" and "-6+2x"
 * both become ["+2x", "-6"].
 *
 * Addition commutes, so a student who writes the terms in the other order has
 * given the same answer — three pilot testers lost marks to exactly this.
 * Sorting cannot make a wrong answer match a right one: "a-b" sorts to
 * ["+a","-b"] and "b-a" to ["+b","-a"], which still differ.
 *
 * Returns null unless the expression really is a plain sum of two or more
 * terms, so anything with an "=" or a comma falls through to exact matching.
 */
function additiveTerms(expr: string): string | null {
  if (SCIENTIFIC.test(expr)) return null;
  if (!/^[-+]?[a-z0-9.^/]+(?:[-+][a-z0-9.^/]+)+$/.test(expr)) return null;

  const terms: string[] = [];
  let sign = "+";
  let buf = "";
  for (const ch of expr) {
    if (ch === "+" || ch === "-") {
      if (buf) terms.push(sign + buf);
      buf = "";
      sign = ch;
    } else {
      buf += ch;
    }
  }
  if (buf) terms.push(sign + buf);
  return terms.length > 1 ? terms.sort().join("") : null;
}

/**
 * A comma-separated answer as an order-independent set: "x=2,x=3" and
 * "x=3,x=2" are the same pair of roots. Only applied when both sides carry the
 * same number of parts, so a short list never matches a longer one.
 */
function commaSet(expr: string): string | null {
  if (!expr.includes(",")) return null;
  const parts = expr.split(",").filter(Boolean);
  return parts.length > 1 ? parts.sort().join(",") : null;
}

/**
 * Read a normalised answer as a number, accepting the forms students actually
 * type for the same value.
 *
 * A mark scheme writes 0.5; a student writes 1/2, and both are right. This was
 * the second half of "правильный ответ засчитало как неправильный" — the term
 * ordering fix above covers algebra, and this covers arithmetic. Handled here:
 *
 *   "1/2"    -> 0.5     a plain fraction
 *   "50%"    -> 0.5     a percentage
 *   "16cm"   -> 16      a value with its unit still attached
 *   "1.5e3"  -> 1500    scientific notation
 *
 * Returns null for anything that is not a single value, so a comma-separated
 * pair or an equation never reaches the numeric comparison and falls through
 * to exact matching instead.
 */
function numericValue(expr: string): number | null {
  if (!expr || expr.includes(",") || expr.includes("=")) return null;

  const percent = expr.endsWith("%");
  const body = percent ? expr.slice(0, -1) : expr;

  // Strip a trailing unit, but only letters that follow the number — a leading
  // letter means this is a variable or a word, not a measurement.
  const stripped = SCIENTIFIC.test(body) ? body : body.replace(/[a-z]+$/, "");
  if (!stripped || /^[a-z]/.test(stripped)) return null;

  const fraction = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(stripped);
  let value: number;
  if (fraction) {
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    value = Number(fraction[1]) / denominator;
  } else {
    value = Number(stripped);
  }

  if (!Number.isFinite(value)) return null;
  return percent ? value / 100 : value;
}

/**
 * Compare two numbers the way a marker would.
 *
 * An absolute epsilon is wrong across the range this app covers: answers run
 * from 0.002 mol to 1 680 arrangements, and a tolerance that is sane for one
 * is nonsense for the other. Relative for large values, absolute near zero.
 */
function closeEnough(a: number, b: number): boolean {
  const scale = Math.max(Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= (scale > 1 ? scale * 1e-9 : 1e-9);
}

/** Does a submitted answer match the key (or any accepted variant)? */
export function isCorrect(submitted: string, question: Question): boolean {
  if (!submitted.trim()) return false;
  const keys = [question.answer, ...(question.acceptedAnswers ?? [])];
  return keys.some((key) =>
    answersMatch(submitted, key, { numeric: question.answerKind === "numeric" })
  );
}
