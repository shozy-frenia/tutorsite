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
 *   5. Every assessed question's criteria sum to its tariff and carry bands.
 *   6. The calculator evaluates the arithmetic its papers actually need.
 *
 * Check 3 is the important one: it catches an answer written in a form the
 * normaliser cannot match, which would silently mark correct students wrong.
 */

import { allBoundarySets } from "../data/grade-boundaries";
import { PAPERS } from "../data/exams";
import { paperMarkTotal, isCorrect } from "../lib/exam-types";
import { validateBoundarySet, gradeForMark } from "../lib/grading";
import { variantFor } from "../lib/offline-variants";
import { evaluate } from "../lib/calculator";

let failures = 0;
const fail = (message: string) => {
  console.error(`  ✗ ${message}`);
  failures++;
};
const pass = (message: string) => console.log(`  ✓ ${message}`);

console.log("\nGRADE BOUNDARIES");
let sets = 0;
const perYear = new Map<number, number>();
for (const { gradeYear, subject } of allBoundarySets()) {
  perYear.set(gradeYear, (perYear.get(gradeYear) ?? 0) + 1);
  for (const [label, set] of [
    [`G${gradeYear} ${subject.name} subject`, subject.subject] as const,
    ...subject.components.map(
      (c) => [`G${gradeYear} ${subject.name} ${c.name}`, c] as const
    ),
  ]) {
    sets++;
    const errors = validateBoundarySet(set);
    if (errors.length) fail(`${label}: ${errors.join("; ")}`);
  }

  // A mark on a band floor must earn that band; one below must not.
  for (const band of subject.subject.bands) {
    if (gradeForMark(band.min, subject.subject) !== band.grade) {
      fail(`G${gradeYear} ${subject.name}: ${band.min} does not award ${band.grade}`);
    }
    if (band.min > 0 && gradeForMark(band.min - 1, subject.subject) === band.grade) {
      fail(`G${gradeYear} ${subject.name}: ${band.min - 1} still awards ${band.grade}`);
    }
  }
}
pass(
  `${sets} boundary sets contiguous and complete (` +
    [...perYear.entries()]
      .sort()
      .map(([y, n]) => `G${y}: ${n} subjects`)
      .join(", ") +
    ")"
);
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

    // Extended answers are marked against a rubric rather than an answer key.
    // The rubric has to be complete and has to add up to the tariff, or the
    // examiner would be asked to award marks the question does not carry.
    if (question.marking === "assessed") {
      if (!question.criteria?.length) {
        fail(`${question.id}: assessed question has no criteria`);
      }
      const criteriaTotal = (question.criteria ?? []).reduce(
        (sum, c) => sum + c.maxMarks,
        0
      );
      if (criteriaTotal !== question.marks) {
        fail(
          `${question.id}: criteria sum to ${criteriaTotal}, question is worth ${question.marks}`
        );
      }
      for (const criterion of question.criteria ?? []) {
        const banded = Boolean(criterion.bands?.length);
        const pointed = Boolean(criterion.points?.length);

        if (banded === pointed) {
          fail(
            `${question.id}/${criterion.id}: needs exactly one of bands or points, has ${banded ? "both" : "neither"}`
          );
        }

        if (banded) {
          const bands = criterion.bands ?? [];
          const top = Math.max(...bands.map((b) => b.max));
          if (top !== criterion.maxMarks) {
            fail(
              `${question.id}/${criterion.id}: top band is ${top}, criterion is worth ${criterion.maxMarks}`
            );
          }
          if (!bands.some((b) => b.max === 0)) {
            fail(`${question.id}/${criterion.id}: no zero band`);
          }
        }

        if (pointed) {
          const total = (criterion.points ?? []).reduce((sum, p) => sum + p.marks, 0);
          if (total !== criterion.maxMarks) {
            fail(
              `${question.id}/${criterion.id}: points sum to ${total}, criterion is worth ${criterion.maxMarks}`
            );
          }
        }
      }
      for (const source of question.sources ?? []) {
        if (!source.content.trim()) fail(`${question.id}: source ${source.ref} is empty`);
      }
    } else if (question.criteria?.length) {
      fail(`${question.id}: has criteria but is not marked as assessed`);
    }

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


/* ------------------------------------------------------------ calculator */

console.log("\nCALCULATOR");
{
  const cases: Array<[string, number, "deg" | "rad"]> = [
    ["2+3*4", 14, "deg"],
    ["2^3^2", 512, "deg"],
    ["-3^2", -9, "deg"],
    ["2*-3", -6, "deg"],
    ["3(4+1)", 15, "deg"],
    ["sin(30)", 0.5, "deg"],
    ["sin(pi/6)", 0.5, "rad"],
    ["atan(1)", 45, "deg"],
    // The arithmetic of the papers that permit a calculator.
    ["4pi/9*180/pi", 80, "deg"],
    ["5*4/3.2", 6.25, "deg"],
    ["acos(11/sqrt(143))", 23.093469, "deg"],
  ];
  for (const [expression, want, mode] of cases) {
    const got = evaluate(expression, mode);
    if (got.value === null || Math.abs(got.value - want) > 1e-5) {
      fail(`calculator: ${expression} [${mode}] gave ${got.value ?? got.error}, expected ${want}`);
    }
  }
  // A malformed expression must fail rather than quietly return a number.
  for (const bad of ["2+", "(1+2", "1+2)", "foo(2)"]) {
    if (evaluate(bad).value !== null) fail(`calculator: "${bad}" should not evaluate`);
  }
  console.log(`  \u2713 ${cases.length} expressions evaluate correctly, malformed input rejected`);
}

console.log(
  failures === 0
    ? "\nAll data checks passed.\n"
    : `\n${failures} check${failures === 1 ? "" : "s"} failed.\n`
);
process.exit(failures === 0 ? 0 : 1);
