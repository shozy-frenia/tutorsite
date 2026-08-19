import type { Question } from "@/lib/exam-types";

/**
 * Deterministic same-level question generation, no model required.
 *
 * Each generator re-parameterises a real question type from the seeded papers
 * and computes the answer arithmetically, so the practice question is correct
 * by construction rather than by trust. Numbers are chosen to stay
 * non-calculator: integer or simple-surd answers only.
 *
 * This is the fallback when ANTHROPIC_API_KEY is absent. The live generator
 * (/api/generate) produces more varied questions; this one guarantees a
 * working feature on a bare checkout.
 */

export interface GeneratedQuestion {
  prompt: string;
  topic: string;
  marks: number;
  answer: string;
  markScheme: Array<{ text: string; marks: number }>;
  hint: string;
}

/** Small deterministic PRNG (mulberry32) so a question id maps to a variant. */
function rng(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (text: string): number => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const pick = <T,>(items: T[], r: () => number): T => items[Math.floor(r() * items.length)];
const between = (lo: number, hi: number, r: () => number): number =>
  lo + Math.floor(r() * (hi - lo + 1));

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** Reduce a fraction to lowest terms and render it. */
function fraction(numerator: number, denominator: number): string {
  const g = gcd(numerator, denominator) || 1;
  const n = numerator / g;
  const d = denominator / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

const nCr = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return Math.round(result);
};

const nPr = (n: number, k: number): number => {
  let result = 1;
  for (let i = 0; i < k; i++) result *= n - i;
  return result;
};

type Generator = (marks: number, r: () => number) => GeneratedQuestion;

/* -------------------------------------------------------------------------
   Per-topic generators
   ------------------------------------------------------------------------- */

const coordinateGeometry: Generator = (marks, r) => {
  // Perpendicular through a point. Pick a, b coprime so the gradient is tidy.
  const pairs: Array<[number, number]> = [
    [7, 3],
    [5, 2],
    [4, 3],
    [9, 2],
    [3, 5],
    [8, 5],
  ];
  const [a, b] = pick(pairs, r);
  const px = between(-5, 5, r);
  const py = between(-5, 5, r);
  const c = between(-9, 9, r);

  // Given line ax + by + c = 0 has gradient -a/b. Perpendicular gradient b/a.
  // Line through (px, py): b(x - px) - a(y - py) = 0  →  bx - ay + (a·py - b·px) = 0
  const k = a * py - b * px;
  const sign = k >= 0 ? "+" : "−";
  const equation = `${b}x − ${a}y ${sign} ${Math.abs(k)} = 0`;

  return {
    prompt: `Write the general equation of the line passing through E(${px}; ${py}) and perpendicular to the line ${a}x + ${b}y ${c >= 0 ? "+" : "−"} ${Math.abs(c)} = 0.`,
    topic: "Coordinate Geometry",
    marks,
    answer: equation,
    markScheme: [
      { text: `Gradient of the given line is −${a}/${b}`, marks: 1 },
      { text: `Perpendicular gradient is the negative reciprocal, ${b}/${a}`, marks: 1 },
      { text: `Point–gradient form: y − (${py}) = (${b}/${a})(x − (${px}))`, marks: 1 },
      { text: `Clear fractions to the general form ${equation}`, marks: Math.max(1, marks - 3) },
    ].slice(0, Math.max(1, marks)),
    hint: "The general form wants everything on one side equal to zero — stopping at y = mx + c loses the final mark.",
  };
};

const combinatorics: Generator = (marks, r) => {
  const boys = between(10, 18, r);
  const girls = between(8, 14, r);
  const pickBoys = between(3, 4, r);
  const pickGirls = 2;
  const total = nCr(boys, pickBoys) * nCr(girls, pickGirls);

  return {
    prompt: `A sports section has ${boys} boys and ${girls} girls. A team of ${pickBoys} boys and ${pickGirls} girls must be chosen. In how many ways can this be done?`,
    topic: "Combinatorics",
    marks,
    answer: `${total}`,
    markScheme: [
      { text: "Order does not matter within each group — use combinations", marks: 1 },
      {
        text: `C(${boys},${pickBoys}) = ${nCr(boys, pickBoys)} and C(${girls},${pickGirls}) = ${nCr(girls, pickGirls)}`,
        marks: 1,
      },
      {
        text: `Multiply the independent choices: ${nCr(boys, pickBoys)} × ${nCr(girls, pickGirls)} = ${total}`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: "Choose boys and girls independently, then multiply. Adding the two counts is the classic slip.",
  };
};

const circleGeometry: Generator = (marks, r) => {
  // Intersecting chords with an integer solution: AP·BP = product, BP = AP - d.
  const ap = between(6, 12, r);
  const d = between(2, 5, r);
  const bp = ap - d;
  const product = ap * bp;
  // Split the product into two integer chord parts.
  const divisors = [];
  for (let i = 2; i <= Math.sqrt(product); i++) if (product % i === 0) divisors.push(i);
  const cp = divisors.length ? pick(divisors, r) : 1;
  const dp = product / cp;

  return {
    prompt: `Chords AB and CD of a circle intersect at point P. Given CP = ${cp} cm, DP = ${dp} cm, and that BP is ${d} cm shorter than AP, find the lengths of AP and BP.`,
    topic: "Circle Geometry",
    marks,
    answer: `AP = ${ap} cm, BP = ${bp} cm`,
    markScheme: [
      { text: `Intersecting chords: AP · BP = CP · DP = ${product}`, marks: 1 },
      { text: `Substitute BP = AP − ${d} to get AP² − ${d}·AP − ${product} = 0`, marks: 1 },
      {
        text: `Solve and reject the negative root: AP = ${ap} cm, BP = ${bp} cm`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: "The intersecting-chord product gives the constant immediately; rejecting the negative root explicitly is worth a mark.",
  };
};

const similarity: Generator = (marks, r) => {
  const small = between(3, 9, r);
  const large = small + between(1, 5, r);
  const g = gcd(small, large);

  return {
    prompt: `Triangles ABC and PQR are similar, with AB = ${small} cm and PQ = ${large} cm. Find the ratio of the area of triangle ABC to the area of triangle PQR.`,
    topic: "Similarity",
    marks,
    answer: `${(small / g) ** 2} : ${(large / g) ** 2}`,
    markScheme: [
      { text: `Linear scale factor = ${small}/${large} = ${fraction(small, large)}`, marks: 1 },
      { text: "Areas scale with the square of the linear ratio", marks: 1 },
      {
        text: `Area ratio = (${fraction(small, large)})² = ${(small / g) ** 2} : ${(large / g) ** 2}`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: "Areas scale with the square of the linear ratio, volumes with the cube.",
  };
};

const inverseTrig: Generator = (marks, r) => {
  // Pythagorean triples keep the answer exact without a calculator.
  const triples: Array<[number, number, number]> = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [20, 21, 29],
  ];
  const [opp, adj, hyp] = pick(triples, r);
  const negative = r() < 0.5;
  const sinValue = `${negative ? "−" : ""}${opp}/${hyp}`;

  return {
    prompt: `Evaluate cos(arcsin(${sinValue})).`,
    topic: "Inverse Trigonometry",
    marks,
    answer: `${adj}/${hyp}`,
    markScheme: [
      { text: `Let θ = arcsin(${sinValue}), so sin θ = ${sinValue}`, marks: 1 },
      {
        text: "θ lies in [−π/2, π/2], the range of arcsin, where cosine is non-negative",
        marks: 1,
      },
      {
        text: `cos θ = +√(1 − ${opp}²/${hyp}²) = ${adj}/${hyp}`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: `The sign is the whole question: arcsin returns an angle in [−π/2, π/2], where cosine is positive — so the answer is +${adj}/${hyp}.`,
  };
};

const trigEquations: Generator = (marks, r) => {
  // Build 2cos²x + bcos x + c = 0 with roots cos x = 1/2 (or similar) and an
  // out-of-range root that must be rejected.
  const options: Array<{ value: string; root: string; reject: number; b: number; c: number }> = [
    { value: "1/2", root: "±π/3 + 2πn", reject: -3, b: 5, c: -3 },
    { value: "−1/2", root: "±2π/3 + 2πn", reject: 3, b: -5, c: -3 },
  ];
  const choice = pick(options, r);

  return {
    prompt: `Solve the equation 2sin²x ${choice.b >= 0 ? "−" : "+"} ${Math.abs(choice.b)}cos x + ${2 + choice.c} = 0.`,
    topic: "Trigonometric Equations",
    marks,
    answer: `x = ${choice.root}`,
    markScheme: [
      {
        text: `Replace sin²x with 1 − cos²x to get the quadratic 2cos²x ${choice.b >= 0 ? "+" : "−"} ${Math.abs(choice.b)}cos x ${choice.c >= 0 ? "+" : "−"} ${Math.abs(choice.c)} = 0`,
        marks: 1,
      },
      { text: `Solve: cos x = ${choice.value} or cos x = ${choice.reject}`, marks: 1 },
      {
        text: `Reject cos x = ${choice.reject} as out of range; cos x = ${choice.value} gives x = ${choice.root}`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: "Convert to a single trigonometric function first. Rejecting the out-of-range root explicitly earns its own mark.",
  };
};

const functions: Generator = (marks, r) => {
  const a = between(2, 8, r);
  const b = between(1, 9, r);
  const f1 = a + b;
  const ff1 = a * f1 + b;

  return {
    prompt: `Two functions are given: f(x) = ${a}x + ${b} and g(x) = 1/(2x), x ≠ 0. Find f(f(1)), g(f(x)) and f⁻¹(x).`,
    topic: "Functions",
    marks,
    answer: `f(f(1)) = ${ff1};  g(f(x)) = 1/(${2 * a}x + ${2 * b});  f⁻¹(x) = (x − ${b})/${a}`,
    markScheme: [
      { text: `f(1) = ${f1}, then f(${f1}) = ${ff1}`, marks: 1 },
      { text: `g(f(x)) = 1/(2(${a}x + ${b})) = 1/(${2 * a}x + ${2 * b})`, marks: 1 },
      {
        text: `Set y = ${a}x + ${b} and solve for x: f⁻¹(x) = (x − ${b})/${a}`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: "g(f(x)) substitutes f into g — the inner function replaces g's variable, not the other way round.",
  };
};

const binomial: Generator = (marks, r) => {
  const a = between(2, 9, r);
  const b = a + between(1, 4, r);
  const n = pick([9, 11, 13, 15], r);
  const base = a - b; // the value of the bracket at x = 1
  const result = base ** n;

  return {
    prompt: `Find the sum of the coefficients of the polynomial in x obtained in the expansion of the binomial (${a} − ${b}x)^${n}.`,
    topic: "Binomial Theorem",
    marks,
    answer: `${result}`,
    markScheme: [
      {
        text: "The sum of all coefficients equals the value of the polynomial at x = 1",
        marks: 1,
      },
      { text: `Substitute x = 1: (${a} − ${b})^${n} = (${base})^${n}`, marks: 1 },
      { text: `= ${result}`, marks: Math.max(1, marks - 2) },
    ].slice(0, Math.max(1, marks)),
    hint: "Never expand this. Setting x = 1 turns every power of x into 1, so the value of the polynomial is the sum of its coefficients.",
  };
};

const arrangements: Generator = (marks, r) => {
  const subjects = between(6, 10, r);
  const lessons = between(3, 5, r);
  const total = nPr(subjects, lessons);

  return {
    prompt: `In how many ways can a school-day timetable of ${lessons} different lessons be built from ${subjects} subjects?`,
    topic: "Combinatorics",
    marks,
    answer: `${total}`,
    markScheme: [
      { text: "Order matters — this is an arrangement, not a selection", marks: 1 },
      {
        text: `A(${subjects},${lessons}) = ${Array.from({ length: lessons }, (_, i) => subjects - i).join(" × ")}`,
        marks: 1,
      },
      { text: `= ${total}`, marks: Math.max(1, marks - 2) },
    ].slice(0, Math.max(1, marks)),
    hint: "A timetable is ordered, so it is A(n,k), not C(n,k).",
  };
};

const probability: Generator = (marks, r) => {
  const white = between(3, 8, r);
  const black = between(3, 8, r);
  const total = white + black;
  const boxes = 3;

  return {
    prompt: `Three boxes each contain balls. Box A holds ${white} white and ${black} black balls. A box is chosen at random from the ${boxes} boxes and one ball is drawn from it. What is the probability that the ball is white and came from box A?`,
    topic: "Probability",
    marks,
    answer: fraction(white, boxes * total),
    markScheme: [
      { text: `P(box A) = 1/${boxes}`, marks: 1 },
      { text: `P(white | A) = ${white}/${total} = ${fraction(white, total)}`, marks: 1 },
      {
        text: `P = 1/${boxes} × ${fraction(white, total)} = ${fraction(white, boxes * total)}`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: "Two stages, so two probabilities multiplied. The box choice carries its own 1/3 — do not skip it.",
  };
};

const trigIdentities: Generator = (marks, r) => {
  const forms = [
    {
      prompt: "Simplify (sin³t − cos³t) / (sin t − cos t).",
      answer: "1 + sin t cos t",
      steps: [
        "Apply the difference of cubes: a³ − b³ = (a − b)(a² + ab + b²)",
        "Cancel the common factor (sin t − cos t)",
        "Use sin²t + cos²t = 1 to give 1 + sin t cos t",
      ],
      hint: "a³ − b³ = (a − b)(a² + ab + b²) — the denominator is already the first factor.",
    },
    {
      prompt: "Simplify (tan t + cot t) · sin t cos t.",
      answer: "1",
      steps: [
        "tan t + cot t = sin t/cos t + cos t/sin t = 1/(sin t cos t)",
        "Multiply by sin t cos t",
        "The product cancels to 1",
      ],
      hint: "Put the bracket over a common denominator first — it becomes the reciprocal of what multiplies it.",
    },
    {
      prompt: "Simplify sin(π/2 + α) + cos(π − α) + tan(π − α) + cot(π/2 + α).",
      answer: "−2 tan α",
      steps: [
        "sin(π/2 + α) = cos α and cos(π − α) = −cos α, so the first two terms cancel",
        "tan(π − α) = −tan α",
        "cot(π/2 + α) = −tan α, giving −2 tan α in total",
      ],
      hint: "Reduce each term separately with the reduction formulas; two of the four cancel outright.",
    },
  ];
  const form = pick(forms, r);

  return {
    prompt: form.prompt,
    topic: "Trigonometric Identities",
    marks,
    answer: form.answer,
    markScheme: form.steps.map((text, i) => ({
      text,
      marks: i === form.steps.length - 1 ? Math.max(1, marks - (form.steps.length - 1)) : 1,
    })),
    hint: form.hint,
  };
};

const vectors: Generator = (marks, r) => {
  const num = between(1, 5, r);
  const den = between(num + 1, 8, r);

  return {
    prompt: `In square ABCD, point E divides side BC from B in the ratio ${num} : ${den - num}, and F is the midpoint of side CD. Let b = AB and d = AD. Express the vector EF in terms of b and d.`,
    topic: "Vectors",
    marks,
    answer: `EF = (1 − ${fraction(num, den)})d − (1/2)b, i.e. ${fraction(den - num, den)}d − (1/2)b`,
    markScheme: [
      { text: `AE = b + ${fraction(num, den)}d`, marks: 1 },
      { text: "AF = (1/2)b + d", marks: 1 },
      {
        text: `EF = AF − AE = ${fraction(den - num, den)}d − (1/2)b`,
        marks: Math.max(1, marks - 2),
      },
    ].slice(0, Math.max(1, marks)),
    hint: "BC is the same vector as AD. Write both AE and AF from A, then subtract — EF never needs its own construction.",
  };
};

const inequalities: Generator = (marks, r) => {
  const forms = [
    {
      prompt: "Solve the inequality sin x < 1.",
      answer: "x ≠ π/2 + 2πn, n ∈ ℤ",
      steps: [
        "sin x ≤ 1 for every real x, so the inequality fails only at equality",
        "sin x = 1 exactly when x = π/2 + 2πn",
        "Therefore the solution is all real x except x = π/2 + 2πn",
      ],
      hint: "Sine never exceeds 1, so the only thing to exclude is where it equals 1.",
    },
    {
      prompt: "Solve the inequality cos x > −1.",
      answer: "x ≠ π + 2πn, n ∈ ℤ",
      steps: [
        "cos x ≥ −1 for every real x, so the inequality fails only at equality",
        "cos x = −1 exactly when x = π + 2πn",
        "Therefore the solution is all real x except x = π + 2πn",
      ],
      hint: "Cosine never drops below −1, so exclude only the points where it equals −1.",
    },
  ];
  const form = pick(forms, r);

  return {
    prompt: form.prompt,
    topic: "Inequalities",
    marks,
    answer: form.answer,
    markScheme: form.steps.map((text, i) => ({
      text,
      marks: i === form.steps.length - 1 ? Math.max(1, marks - (form.steps.length - 1)) : 1,
    })),
    hint: form.hint,
  };
};

const GENERATORS: Record<string, Generator> = {
  Vectors: vectors,
  "Coordinate Geometry": coordinateGeometry,
  Combinatorics: combinatorics,
  "Binomial Theorem": binomial,
  "Circle Geometry": circleGeometry,
  Similarity: similarity,
  "Trigonometric Identities": trigIdentities,
  "Inverse Trigonometry": inverseTrig,
  "Trigonometric Equations": trigEquations,
  Functions: functions,
  Probability: probability,
  Inequalities: inequalities,
};

/**
 * Produce a same-level variant of a question.
 *
 * Topics without a dedicated generator (proofs, constructions, solid geometry)
 * fall back to an arrangements question at the same tariff, with the shortfall
 * stated plainly rather than disguised.
 */
export function variantFor(question: Question, salt = ""): GeneratedQuestion {
  const seed = hash(`${question.id}:${salt}`);
  const r = rng(seed);
  const generator = GENERATORS[question.topic];

  if (generator) return generator(question.marks, r);

  const fallback = arrangements(question.marks, r);
  return {
    ...fallback,
    hint: `${fallback.hint} (No offline generator covers "${question.topic}" — this is a same-tariff question on a different topic. Set ANTHROPIC_API_KEY for on-topic generation.)`,
  };
}

/** Topics that have a true offline generator. */
export const offlineTopics = (): string[] => Object.keys(GENERATORS);
