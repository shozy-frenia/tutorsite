/**
 * Data integrity checks. Run with `npm run check`.
 *
 * The content in data/ is transcribed by hand from printed papers and a
 * published boundary table, so it is exactly the kind of thing that rots
 * silently. These checks assert the properties that must hold for the app to
 * grade honestly:
 *
 *   1. Every boundary set is contiguous and spans 0..maxMark.
 *   2. Every mark scheme sums to its question's mark tariff.
 *   3. Every auto-marked question's own answer key marks itself correct.
 *   4. Every offline variant generator produces a scheme that sums correctly.
 *
 * Check 3 is the important one: it catches an answer written in a form the
 * normaliser cannot match, which would silently mark correct students wrong.
 */

import { SUBJECT_BOUNDARIES } from "../data/grade-boundaries";
import { PAPERS } from "../data/exams";
import { paperMarkTotal, isCorrect } from "../lib/exam-types";
import { validateBoundarySet, gradeForMark } from "../lib/grading";
import { variantFor } from "../lib/offline-variants";

let failures = 0;
const fail = (message: string) => {
  console.error(`  ✗ ${message}`);
  failures++;
};
const pass = (message: string) => console.log(`  ✓ ${message}`);

console.log("\nGRADE BOUNDARIES");
let sets = 0;
for (const subject of SUBJECT_BOUNDARIES) {
  for (const [label, set] of [
    [`${subject.name} subject`, subject.subject] as const,
    ...subject.components.map((c) => [`${subject.name} ${c.name}`, c] as const),
  ]) {
    sets++;
    const errors = validateBoundarySet(set);
    if (errors.length) fail(`${label}: ${errors.join("; ")}`);
  }
}
pass(`${sets} boundary sets contiguous and complete`);

// A mark on a band floor must earn that band; one below must not.
for (const subject of SUBJECT_BOUNDARIES) {
  for (const band of subject.subject.bands) {
    if (gradeForMark(band.min, subject.subject) !== band.grade) {
      fail(`${subject.name}: ${band.min} does not award ${band.grade}`);
    }
    if (band.min > 0 && gradeForMark(band.min - 1, subject.subject) === band.grade) {
      fail(`${subject.name}: ${band.min - 1} still awards ${band.grade}`);
    }
  }
}
pass("band floors award the expected grade, one mark below does not");

console.log("\nPAPERS");
for (const paper of PAPERS) {
  const total = paperMarkTotal(paper);
  console.log(`\n  ${paper.title} — ${paper.sitting}`);
  console.log(
    `    ${paper.questions.length} questions, ${total} marks encoded (paper declares ${paper.totalMarks})`
  );

  const ids = new Set<string>();
  for (const question of paper.questions) {
    if (ids.has(question.id)) fail(`duplicate question id ${question.id}`);
    ids.add(question.id);

    const schemeTotal = question.markScheme.reduce((sum, s) => sum + s.marks, 0);
    if (schemeTotal !== question.marks) {
      fail(
        `${question.id}: mark scheme sums to ${schemeTotal}, question is worth ${question.marks}`
      );
    }

    if (!question.answer.trim()) fail(`${question.id}: empty answer`);
    if (!question.hint.trim()) fail(`${question.id}: empty hint`);

    // The canonical answer must satisfy the marker it will be checked against.
    if (question.marking === "auto") {
      if (!isCorrect(question.answer, question)) {
        fail(`${question.id}: its own answer key "${question.answer}" does not self-match`);
      }
      for (const accepted of question.accepts ?? []) {
        if (!isCorrect(accepted, question)) {
          fail(`${question.id}: accepted variant "${accepted}" does not match`);
        }
      }
      if (question.answerKind === "choice") {
        if (!question.options?.length) fail(`${question.id}: choice question has no options`);
        if (!question.options?.includes(question.answer)) {
          fail(`${question.id}: answer is not among its options`);
        }
      }
    }
  }
  pass(`${paper.questions.length} questions: schemes sum, answers self-match`);
}

console.log("\nOFFLINE VARIANT GENERATORS");
const topicsSeen = new Set<string>();
for (const paper of PAPERS) {
  for (const question of paper.questions) {
    topicsSeen.add(question.topic);
    // Several salts, because generators pick numbers at random.
    for (const salt of ["a", "b", "c", "d", "e"]) {
      const variant = variantFor(question, salt);
      const schemeTotal = variant.markScheme.reduce((sum, s) => sum + s.marks, 0);
      if (schemeTotal !== variant.marks) {
        fail(
          `${question.topic} (salt ${salt}): variant scheme sums to ${schemeTotal}, expected ${variant.marks}`
        );
      }
      if (!variant.prompt.trim()) fail(`${question.topic}: variant has empty prompt`);
      if (!variant.answer.trim()) fail(`${question.topic}: variant has empty answer`);
      if (variant.marks !== question.marks) {
        fail(`${question.topic}: variant tariff ${variant.marks} != source ${question.marks}`);
      }
    }
  }
}
pass(`${topicsSeen.size} topics generate valid same-tariff variants`);

console.log(
  failures === 0
    ? "\nAll data checks passed.\n"
    : `\n${failures} check${failures === 1 ? "" : "s"} failed.\n`
);
process.exit(failures === 0 ? 0 : 1);
