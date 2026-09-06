/**
 * Numbers for Instagram carousel #3, read from the exam bank.
 *
 *   npx tsx brand/social/method-marks-post/stats.ts
 *
 * Emits JSON on stdout; `generate.mjs` shells out to this rather than
 * retyping figures onto the slides. The post's whole claim is "this is how
 * the paper is actually marked", so every figure on it has to come from the
 * mark schemes themselves and has to move when they do.
 *
 * A "step mark" here is any mark a scheme awards before its final line. That
 * is deliberately the conservative reading: the last line of a scheme is
 * usually the answer itself, so counting everything above it never
 * overstates how much credit sits in the working.
 */
import { PAPERS } from "@/data/exams";

let totalMarks = 0;
let stepMarks = 0;
let multiStep = 0;
let questions = 0;

for (const paper of PAPERS) {
  for (const question of paper.questions) {
    const scheme = question.markScheme;
    if (!scheme?.length) continue;
    questions += 1;
    totalMarks += question.marks;
    if (scheme.length > 1) {
      multiStep += 1;
      stepMarks += scheme.slice(0, -1).reduce((sum, step) => sum + step.marks, 0);
    }
  }
}

/** The worked example the post is built around. */
const paper = PAPERS.find((p) => p.id === "maths-10-p1-2021-03-05");
const example = paper?.questions.find((q) => String(q.number) === "5");
if (!example?.markScheme) throw new Error("example question missing its mark scheme");

console.log(
  JSON.stringify(
    {
      totalMarks,
      stepMarks,
      answerMarks: totalMarks - stepMarks,
      stepShare: Math.round((stepMarks / totalMarks) * 100),
      questions,
      multiStep,
      papers: PAPERS.length,
      example: {
        marks: example.marks,
        answer: example.answer,
        steps: example.markScheme.map((s) => s.marks),
      },
    },
    null,
    1
  )
);
