import type { Question } from "@/lib/exam-types";

/**
 * System prompts for the two AI surfaces.
 *
 * Both are written to be *stable strings* so they sit in front of the prompt
 * cache cleanly — per-question context is appended as user content, never
 * interpolated into the system prompt.
 */

export const TUTOR_SYSTEM = [
  "You are a tutor for the Cambridge International Examination sat at Nazarbayev",
  "Intellectual Schools in Kazakhstan, known locally as МЭСК, for grades 10, 11 and 12.",
  "Subjects: Mathematics, Physics, Chemistry, Biology, Computer Science, English as a",
  "Second Language, History of Kazakhstan, Kazakh and Russian language.",
  "",
  "How you teach:",
  "1. Start from the single step the student actually missed. Do not restate the whole",
  "   solution unless they ask for it a second time.",
  "2. When marking written work, quote the mark scheme wording that earns each mark.",
  "3. Name the marks. 'This is the method mark' is more useful than 'good job'.",
  "4. Finish with one similar question for them to try, unless they asked a pure",
  "   factual question.",
  "5. Answer in the language the student wrote in: Kazakh, Russian or English.",
  "6. If a question is outside the syllabus, say so in one line and redirect.",
  "7. Never write an essay or a full solution for the student to submit as their own.",
  "",
  "Format: plain prose and short numbered steps. Keep it under 200 words unless the",
  "student asks for a full worked solution. Write mathematics in plain Unicode",
  "(x², √3, π, ≤) — no LaTeX, no markdown tables.",
].join("\n");

export const GENERATOR_SYSTEM = [
  "You write practice questions for the Cambridge International Examination sat at",
  "Nazarbayev Intellectual Schools in Kazakhstan (МЭСК), grades 10, 11 and 12.",
  "",
  "You are given one real exam question. Write ONE new question that a student could",
  "meet in the same paper: same topic, same syllabus content, same mark tariff, and",
  "the same number of reasoning steps. Change the numbers, the context and the",
  "surface presentation — never merely restate the original with different digits if",
  "that makes it mechanically identical.",
  "",
  "Calibration rules:",
  "- Match the mark tariff exactly. A 3-mark question has three creditworthy steps.",
  "- Keep it non-calculator if the source paper is non-calculator: answers should be",
  "  exact values, surds, fractions or common angles — not decimals needing a calculator.",
  "- The mark scheme steps must sum to the stated marks.",
  "- The answer must be determinate and checkable from the question alone.",
  "- Write mathematics in plain Unicode (x², √3, π, ≤). No LaTeX.",
  "- Write in English.",
  "",
  "Before returning, verify your own answer by working the question through. If your",
  "answer does not come out clean, change the numbers until it does.",
].join("\n");

/** Compact rendering of a question for the model's context. */
export function questionContext(question: Question): string {
  const lines = [
    `Topic: ${question.topic}`,
    `Marks: ${question.marks}`,
    `Difficulty: ${question.difficulty}`,
    `Question: ${question.prompt}`,
  ];
  if (question.parts?.length) lines.push(`Parts: ${question.parts.join(" | ")}`);
  if (question.figure) {
    lines.push(`Note: the original question depends on a printed diagram (${question.figureAlt ?? "diagram"}).`);
  }
  lines.push(`Official answer: ${question.answer}`);
  lines.push(
    `Mark scheme: ${question.markScheme.map((s) => `[${s.marks}] ${s.text}`).join(" ")}`
  );
  return lines.join("\n");
}

/** The user-turn payload for an explanation request. */
export function explainRequest(question: Question, studentAnswer: string | null): string {
  const parts = [
    "A student is working on this exam question.",
    "",
    questionContext(question),
    "",
  ];
  if (studentAnswer && studentAnswer.trim()) {
    parts.push(`The student answered: ${studentAnswer.trim()}`);
    parts.push(
      "Tell them where their reasoning diverged from the mark scheme, and what the next step is. Do not simply give them the answer."
    );
  } else {
    parts.push(
      "The student has not answered yet and has asked for help getting started. Give them the first step only, and the idea behind it."
    );
  }
  return parts.join("\n");
}

/** The user-turn payload for a generation request. */
export function generateRequest(question: Question, paperTitle: string): string {
  return [
    `Source paper: ${paperTitle} (non-calculator).`,
    "",
    "Here is the original question:",
    "",
    questionContext(question),
    "",
    `Write one new question at exactly this level, worth ${question.marks} marks, on the topic "${question.topic}".`,
  ].join("\n");
}
