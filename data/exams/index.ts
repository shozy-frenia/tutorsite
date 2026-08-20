import type { Paper } from "@/lib/exam-types";
import { paperMarkTotal } from "@/lib/exam-types";
import { MATHS_10_P1_MARCH } from "./maths-10-p1-march";
import { MATHS_10_P1_APRIL } from "./maths-10-p1-april";
import { MATHS_12_P1_CALCULUS } from "./maths-12-p1-calculus";
import { CHEMISTRY_10_P1_MAY } from "./chemistry-10-p1-may";
import { CS_10_P2_MAY_2025 } from "./cs-10-p2-may-2025";
import { HISTORY_10_2025 } from "./history-10-2025";
import { KAZAKH_L1_10_P1 } from "./kazakh-l1-10-p1";
import { RUSSIAN_L1_10_P2 } from "./russian-l1-10-p2";
import { MATHS_10_P2_MAY_2024 } from "./maths-10-p2-may-2024";
import { PHYSICS_10_P1_2018 } from "./physics-10-p1-2018";
import { BIOLOGY_10_P1_MAY_2022 } from "./biology-10-p1-may-2022";

export const PAPERS: Paper[] = [
  MATHS_10_P1_MARCH,
  MATHS_10_P1_APRIL,
  CHEMISTRY_10_P1_MAY,
  CS_10_P2_MAY_2025,
  HISTORY_10_2025,
  KAZAKH_L1_10_P1,
  RUSSIAN_L1_10_P2,
  MATHS_10_P2_MAY_2024,
  PHYSICS_10_P1_2018,
  BIOLOGY_10_P1_MAY_2022,
  MATHS_12_P1_CALCULUS,
];

export const papersForYear = (year: 10 | 11 | 12): Paper[] =>
  PAPERS.filter((p) => p.gradeYear === year);

export const paperById = (id: string): Paper | undefined =>
  PAPERS.find((p) => p.id === id);

export const papersForSubject = (subjectId: string): Paper[] =>
  PAPERS.filter((p) => p.subjectId === subjectId);

/**
 * Marks actually available across the encoded questions.
 *
 * Both source papers *declare* a total of 80 marks, but the per-question [n]
 * tags printed on them add up to 67 (March) and 63 (April). The shortfall sits
 * in sub-part mark cells that the source documents do not break down, so it
 * cannot be attributed to specific questions without inventing marks.
 *
 * Rather than pad the papers, the app scores what is really there and scales
 * the result onto the official 80-mark component scale before reading the
 * boundary table — see `scaleToComponent` in lib/grading.ts. The workspace
 * shows both figures so the number is never silently massaged.
 */
export const availableMarks = (paper: Paper): number => paperMarkTotal(paper);

/** All distinct topics covered by a paper, in order of first appearance. */
export const paperTopics = (paper: Paper): string[] => [
  ...new Set(paper.questions.map((q) => q.topic)),
];
