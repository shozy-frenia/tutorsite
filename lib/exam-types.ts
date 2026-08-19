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

export type MarkingMode = "auto" | "worked";

export type AnswerKind = "numeric" | "expression" | "choice";

export type Difficulty = "foundation" | "standard" | "stretch";

export interface MarkSchemeStep {
  /** What earns the mark, phrased the way a mark scheme phrases it. */
  text: string;
  /** Marks awarded for this step. */
  marks: number;
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
  /** Alternative accepted forms for auto-marked questions. */
  accepts?: string[];
  /** Options for choice questions. */
  options?: string[];
  /** Unit suffix shown next to the input, e.g. "cm". */
  unit?: string;

  markScheme: MarkSchemeStep[];
  /** One nudge — the single step students usually miss. */
  hint: string;
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
 * Normalise a free-text answer for comparison.
 *
 * Students type `-16;-9`, `(-16, -9)` or `(−16; −9)` with a Unicode minus and
 * all three mean the same thing. Strip everything that is not semantically
 * load-bearing, then compare.
 */
export function normaliseAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[−–—]/g, "-") // unicode minus/dashes -> hyphen
    .replace(/[°]/g, " deg")
    .replace(/\s+/g, "")
    .replace(/[(){}[\]]/g, "")
    .replace(/;/g, ",")
    .replace(/\*/g, "")
    .replace(/·/g, "")
    .replace(/^\+/, "")
    .replace(/,$/, "");
}

/** Does a submitted answer match the key (or any accepted variant)? */
export function isCorrect(submitted: string, question: Question): boolean {
  if (!submitted.trim()) return false;
  const candidate = normaliseAnswer(submitted);
  const keys = [question.answer, ...(question.accepts ?? [])].map(normaliseAnswer);
  if (keys.includes(candidate)) return true;

  // Numeric answers: compare as numbers so "16" === "16.0" === "16 cm".
  if (question.answerKind === "numeric") {
    const num = Number(candidate.replace(/[a-z]/g, ""));
    if (!Number.isNaN(num)) {
      return keys.some((k) => {
        const kn = Number(k.replace(/[a-z]/g, ""));
        return !Number.isNaN(kn) && Math.abs(kn - num) < 1e-9;
      });
    }
  }
  return false;
}
