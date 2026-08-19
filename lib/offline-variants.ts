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

const SUPERSCRIPTS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

/** Render a non-negative integer as Unicode superscript digits. */
const sup = (n: number): string =>
  String(Math.abs(Math.trunc(n)))
    .split("")
    .map((d) => SUPERSCRIPTS[Number(d)])
    .join("");

/**
 * Render `base` raised to `n` the way a person writes it: x¹ is just x, and
 * anything to the power 0 disappears. Without this the generators emit "x¹e³ˣ"
 * and "(x² + 5)¹", which read as mistakes even though the maths is right.
 */
const pow = (base: string, n: number): string =>
  n === 0 ? "1" : n === 1 ? base : `${base}${sup(n)}`;

/** Multiply a coefficient into a term, dropping a redundant leading 1. */
const coeff = (value: string, term: string): string =>
  value === "1" ? term : value === "-1" ? `−${term}` : `${value}${term}`;

/** Render a signed number with the Unicode minus the rest of the app uses. */
const num = (value: number): string => String(value).replace("-", "−");

/**
 * Distribute a mark tariff across mark-scheme steps so the total always
 * matches exactly — the property `npm run check` asserts.
 *
 * More marks than steps: the spare marks land on the final step, which is
 * where the answer is stated. Fewer marks than steps: the tail steps are
 * merged into one so no step is ever worth zero.
 */
function spreadMarks(steps: string[], marks: number): Array<{ text: string; marks: number }> {
  if (steps.length === 0) return [{ text: "Correct answer", marks }];

  if (steps.length <= marks) {
    return steps.map((text, i) => ({
      text,
      marks: i === steps.length - 1 ? marks - (steps.length - 1) : 1,
    }));
  }

  const kept = steps.slice(0, marks - 1).map((text) => ({ text, marks: 1 }));
  return [...kept, { text: steps.slice(marks - 1).join("; then "), marks: 1 }];
}

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

/* ------------------------------- A-Level (Grade 12) topics ---------------- */

const differentiation: Generator = (marks, r) => {
  const forms = [
    () => {
      // Product rule with an exponential: d/dx(xⁿ e^{kx})
      const n = between(2, 4, r);
      const k = between(2, 5, r);
      const inner = pow("x", n - 1);
      return {
        prompt: `Differentiate y = ${pow("x", n)}e${sup(k)}ˣ with respect to x, giving your answer in a fully factorised form.`,
        answer: `${inner}e${sup(k)}ˣ(${n} + ${k}x)`,
        steps: [
          "Identify a product and state the rule: d(uv)/dx = u′v + uv′",
          `u = ${pow("x", n)} gives u′ = ${n}${inner}`,
          `v = e${sup(k)}ˣ gives v′ = ${k}e${sup(k)}ˣ by the chain rule`,
          `Combine and factorise: ${inner}e${sup(k)}ˣ(${n} + ${k}x)`,
        ],
        hint: `The chain rule inside the product is where marks go missing — the derivative of e${sup(k)}ˣ is ${k}e${sup(k)}ˣ, not e${sup(k)}ˣ.`,
      };
    },
    () => {
      // Stationary points of a cubic with integer roots of the derivative.
      const a = between(1, 3, r);
      const b = a + between(1, 4, r); // derivative roots a and b
      // y = x³ − (3/2)(a+b)x² + 3ab x  →  keep integers: use y' = 3(x−a)(x−b)
      const p = -3 * (a + b) / 2;
      // Choose a+b even so the x² coefficient stays an integer.
      const sum = a + b;
      if (sum % 2 !== 0) {
        // fall through to a guaranteed-integer pair
        return {
          prompt:
            "The curve C has equation y = x³ − 6x² + 9x + 4. Find the coordinates of the stationary points of C and determine the nature of each.",
          answer: "(1; 8) maximum, (3; 4) minimum",
          steps: [
            "dy/dx = 3x² − 12x + 9 = 3(x − 1)(x − 3)",
            "Stationary where dy/dx = 0, so x = 1 and x = 3",
            "y(1) = 8 and y(3) = 4",
            "d²y/dx² = 6x − 12: negative at x = 1 (maximum), positive at x = 3 (minimum)",
          ],
          hint: "Finding the x values is only half the question — substitute back for y and test the second derivative for the nature.",
        };
      }
      const c = between(1, 6, r);
      const y = (x: number) => x ** 3 + p * x ** 2 + 3 * a * b * x + c;
      return {
        prompt: `The curve C has equation y = x³ ${p < 0 ? "−" : "+"} ${Math.abs(p)}x² + ${3 * a * b}x + ${c}. Find the coordinates of the stationary points of C and determine the nature of each.`,
        answer: `(${a}; ${num(y(a))}) maximum, (${b}; ${num(y(b))}) minimum`,
        steps: [
          `dy/dx = 3x² ${2 * p < 0 ? "−" : "+"} ${Math.abs(2 * p)}x + ${3 * a * b} = 3(x − ${a})(x − ${b})`,
          `Stationary where dy/dx = 0, so x = ${a} and x = ${b}`,
          `y(${a}) = ${num(y(a))} and y(${b}) = ${num(y(b))}`,
          `d²y/dx² = 6x ${2 * p < 0 ? "−" : "+"} ${Math.abs(2 * p)}: negative at x = ${a} (maximum), positive at x = ${b} (minimum)`,
        ],
        hint: "Finding the x values is only half the question — substitute back for y and test the second derivative for the nature.",
      };
    },
    () => {
      // Quotient rule tangent at a clean point.
      const a = between(2, 5, r);
      const b = between(1, 4, r);
      const c = between(2, 5, r);
      // y = (ax − b)/(x + c); y' = (a·c + b)/(x + c)²
      const num = a * c + b;
      const x0 = 1;
      const y0den = x0 + c;
      // Reduce it — a student who answers 2/3 must not be marked wrong for 24/36.
      const grad = fraction(num, y0den * y0den);
      return {
        prompt: `Find the gradient of the tangent to the curve y = (${a}x − ${b})/(x + ${c}) at the point where x = ${x0}, giving your answer in lowest terms.`,
        answer: grad,
        steps: [
          `At x = ${x0}, y = ${fraction(a * x0 - b, y0den)}`,
          `Quotient rule with u = ${a}x − ${b} and v = x + ${c}`,
          `dy/dx = [${a}(x + ${c}) − (${a}x − ${b})]/(x + ${c})² = ${num}/(x + ${c})²`,
          `At x = ${x0} the gradient is ${num}/${y0den * y0den} = ${grad}`,
        ],
        hint: "The numerator of the quotient rule collapses to a constant here — the x terms cancel, so the derivative is simpler than it first looks.",
      };
    },
  ];

  const form = pick(forms, r)();
  return {
    prompt: form.prompt,
    topic: "Differentiation",
    marks,
    answer: form.answer,
    markScheme: spreadMarks(form.steps, marks),
    hint: form.hint,
  };
};

const integration: Generator = (marks, r) => {
  const forms = [
    () => {
      // Area under an inverted parabola y = k² − x², roots ±k.
      const k = between(2, 5, r);
      const area = fraction(4 * k ** 3, 3);
      return {
        prompt: `Find the exact area of the finite region bounded by the curve y = ${k * k} − x² and the x-axis.`,
        answer: area,
        steps: [
          `Solve ${k * k} − x² = 0 for the limits: x = −${k} and x = ${k}`,
          `Set up ∫₋${k}${k} (${k * k} − x²) dx`,
          `Integrate: [${k * k}x − x³/3]`,
          `Substitute the limits and double the half-area: ${area}`,
        ],
        hint: "The limits are not given — they are where the curve meets the x-axis. Find them before you integrate anything.",
      };
    },
    () => {
      // Substitution u = x² + a, integral of 2x/(x²+a)ⁿ.
      const a = between(1, 5, r);
      const n = between(2, 4, r);
      // n = 2 would otherwise render as "1(x² + a)¹". The whole denominator
      // stays inside brackets either way, or the answer reads as a product.
      const denominator =
        n === 2 ? `x² + ${a}` : `${n - 1}(x² + ${a})${sup(n - 1)}`;
      const result = `−1/(${denominator}) + C`;
      return {
        prompt: `Using the substitution u = x² + ${a}, find ∫ 2x/(x² + ${a})${sup(n)} dx.`,
        answer: result,
        steps: [
          `du/dx = 2x, so du = 2x dx`,
          `The numerator is exactly du, so the integral becomes ∫ u⁻${sup(n)} du`,
          `Integrate: u⁻${sup(n - 1)}/(−${n - 1})`,
          `Substitute back and add the constant: ${result}`,
        ],
        hint: "The 2x on top is not a coincidence — it is precisely du, so the substitution consumes it and no stray x remains.",
      };
    },
    () => {
      // Area between y = x² and y = mx.
      const m = between(2, 6, r);
      return {
        prompt: `Find the exact area of the finite region enclosed between the curve y = x² and the line y = ${m}x.`,
        answer: fraction(m ** 3, 6),
        steps: [
          `Set x² = ${m}x, so x(x − ${m}) = 0 and the limits are x = 0 and x = ${m}`,
          "Between the limits the line lies above the curve",
          `Area = ∫₀${m} (${m}x − x²) dx = [${m}x²/2 − x³/3]`,
          `= ${m ** 3}/2 − ${m ** 3}/3 = ${fraction(m ** 3, 6)}`,
        ],
        hint: "Integrate (upper − lower), not each curve separately. Test a value between the limits to see which is on top.",
      };
    },
  ];

  const form = pick(forms, r)();
  return {
    prompt: form.prompt,
    topic: "Integration",
    marks,
    answer: form.answer,
    markScheme: spreadMarks(form.steps, marks),
    hint: form.hint,
  };
};

const differentialEquations: Generator = (marks, r) => {
  // Even k keeps the integrated coefficient a whole number, so the exponent
  // reads as e^(2x²) rather than the ambiguous e^(5/2x²).
  const k = pick([2, 4, 6, 8], r);
  const y0 = between(2, 6, r);
  const half = fraction(k, 2);
  const exponent = coeff(half, "x²");

  return {
    prompt: `Solve the differential equation dy/dx = ${k}xy, given that y = ${y0} when x = 0.`,
    topic: "Differential Equations",
    marks,
    answer: `y = ${y0}e^(${exponent})`,
    markScheme: spreadMarks(
      [
        `Separate the variables: (1/y) dy = ${k}x dx`,
        "Integrate the left side: ln|y|",
        `Integrate the right side: ${exponent} + c`,
        `General solution y = Ae^(${exponent})`,
        `Apply y(0) = ${y0} to get A = ${y0}`,
      ],
      marks
    ),
    hint: "Get every y on one side and every x on the other before integrating. Fold the constant into A = e^c at the exponential stage.",
  };
};

const exponentialsLogs: Generator = (marks, r) => {
  const start = pick([200, 400, 500, 800], r);
  const rate = pick([0.2, 0.4, 0.5], r);
  const factor = pick([2, 3, 4, 5], r);
  const target = start * factor;
  const invRate = 1 / rate;

  return {
    prompt: `A population is modelled by N = ${start}e^(${rate}t), where N is the number after t hours. Find, in exact form, the time taken for the population to reach ${target}, and the rate at which it is increasing at t = 0.`,
    topic: "Exponentials & Logarithms",
    marks,
    answer: `t = ${invRate} ln ${factor} hours; rate = ${start * rate} per hour`,
    markScheme: spreadMarks(
      [
        `Set ${target} = ${start}e^(${rate}t) and divide to get ${factor} = e^(${rate}t)`,
        `Take natural logarithms: ${rate}t = ln ${factor}`,
        `t = (ln ${factor})/${rate} = ${invRate} ln ${factor} hours`,
        `Differentiate: dN/dt = ${start * rate}e^(${rate}t), which is ${start * rate} per hour at t = 0`,
      ],
      marks
    ),
    hint: "An exact answer means leave it as a logarithm — do not reach for a decimal. The rate is a derivative, not a substitution into N.",
  };
};

const complexNumbers: Generator = (marks, r) => {
  // Arguments that land on an exact multiple of π when raised to a power.
  const cases = [
    { z: "1 + i√3", mod: 2, arg: "π/3", n: 6, result: "64" },
    { z: "√3 + i", mod: 2, arg: "π/6", n: 12, result: "4096" },
    { z: "1 + i", mod: "√2", arg: "π/4", n: 8, result: "16" },
    { z: "−1 + i", mod: "√2", arg: "3π/4", n: 8, result: "16" },
  ];
  const c = pick(cases, r);

  return {
    prompt: `The complex number z is given by z = ${c.z}. Find the exact modulus and argument of z, and hence express z${sup(c.n)} in the form a + bi.`,
    topic: "Complex Numbers",
    marks,
    answer: `|z| = ${c.mod}, arg z = ${c.arg}, z${sup(c.n)} = ${c.result}`,
    markScheme: spreadMarks(
      [
        `|z| = ${c.mod}`,
        `arg z = ${c.arg}`,
        "State de Moivre's theorem: zⁿ = rⁿ(cos nθ + i sin nθ)",
        `Raising to the power ${c.n} turns the argument into a whole multiple of 2π, giving z${sup(c.n)} = ${c.result}`,
      ],
      marks
    ),
    hint: "Do not expand the bracket repeatedly. Convert to modulus–argument form and use de Moivre — the argument multiplies to land exactly on an axis.",
  };
};

const vectors3D: Generator = (marks, r) => {
  // Pick vectors from A whose lengths are Pythagorean so |AB| and |AC| are integers.
  const legs: Array<[number, number, number, number]> = [
    [3, 4, 0, 5],
    [1, 2, 2, 3],
    [2, 3, 6, 7],
    [6, 6, 7, 11],
    [2, 6, 9, 11],
  ];
  const [bx, by, bz, bLen] = pick(legs, r);
  let [cx, cy, cz, cLen] = pick(legs, r);
  // Make sure the two directions differ.
  if (bx === cx && by === cy && bz === cz) [cx, cy, cz, cLen] = [1, 2, 2, 3];

  const ax = between(-2, 3, r);
  const ay = between(-2, 3, r);
  const az = between(-2, 3, r);
  // Vary the signs so the dot product is not always positive.
  const sy = r() < 0.5 ? -1 : 1;
  const dot = bx * cx + by * (cy * sy) + bz * cz;

  return {
    prompt: `The points A, B and C have position vectors A(${ax}; ${ay}; ${az}), B(${ax + bx}; ${ay + by}; ${az + bz}) and C(${ax + cx}; ${ay + cy * sy}; ${az + cz}). Find the exact value of cos(∠BAC).`,
    topic: "Vectors 3D",
    marks,
    answer: fraction(dot, bLen * cLen),
    markScheme: spreadMarks(
      [
        `AB = B − A = (${bx}; ${by}; ${bz}) with |AB| = ${bLen}`,
        `AC = C − A = (${cx}; ${cy * sy}; ${cz}) with |AC| = ${cLen}`,
        `AB · AC = ${bx * cx} + ${by * cy * sy} + ${bz * cz} = ${dot}`,
        `cos(∠BAC) = ${dot}/(${bLen} × ${cLen}) = ${fraction(dot, bLen * cLen)}`,
      ],
      marks
    ),
    hint: "Both vectors must start at A — that is what makes the angle ∠BAC. Using BA instead of AB flips the sign of your answer.",
  };
};

const parametric: Generator = (marks, r) => {
  const k = between(2, 6, r);

  return {
    prompt: `A curve is defined by the parametric equations x = t², y = t³ − ${3 * k}t. Find dy/dx in terms of t, and hence find the values of t at which the tangent to the curve is parallel to the x-axis.`,
    topic: "Parametric Equations",
    marks,
    answer: `dy/dx = 3(t² − ${k})/(2t); t = ±√${k}`,
    markScheme: spreadMarks(
      [
        "dx/dt = 2t",
        `dy/dt = 3t² − ${3 * k}`,
        `dy/dx = (dy/dt)/(dx/dt) = (3t² − ${3 * k})/(2t)`,
        `Horizontal tangent needs dy/dx = 0, so t² = ${k} and t = ±√${k}`,
      ],
      marks
    ),
    hint: "dy/dx is the ratio of the two parameter derivatives, not their difference. Set the numerator to zero, and check the denominator is not also zero there.",
  };
};

const binomialSeries: Generator = (marks, r) => {
  // (1 + kx)^(1/2) expansions — coefficients stay rational for any integer k.
  const k = pick([2, 4, 6], r);
  // Coefficients of (1+u)^(1/2) are 1/2, −1/8, 1/16; u = kx brings kⁿ with it.
  const t1 = coeff(fraction(k, 2), "x");
  const t2 = coeff(fraction(k * k, 8), "x²");
  const t3 = coeff(fraction(k ** 3, 16), "x³");
  const expansion = `1 + ${t1} − ${t2} + ${t3}`;
  const validity = `|x| < ${fraction(1, k)}`;

  return {
    prompt: `Expand (1 + ${k}x)^(1/2) in ascending powers of x, up to and including the term in x³, and state the range of values of x for which the expansion is valid.`,
    topic: "Binomial Series",
    marks,
    answer: `${expansion}, valid for ${validity}`,
    markScheme: spreadMarks(
      [
        "State the general binomial series (1 + u)ⁿ = 1 + nu + n(n−1)u²/2! + n(n−1)(n−2)u³/3!",
        "With n = 1/2 the coefficients of u, u² and u³ are 1/2, −1/8 and 1/16",
        `Substitute u = ${k}x, remembering u² = ${k * k}x² and u³ = ${k ** 3}x³`,
        `Simplify to ${expansion}`,
        `Valid when |${k}x| < 1, that is ${validity}`,
      ],
      marks
    ),
    hint: `Expand in u first, then substitute u = ${k}x — the powers of ${k} come along with it.`,
  };
};

/* ------------------------------ Chemistry topics -------------------------- */

const stoichiometry: Generator = (marks, r) => {
  // Salts whose molar mass is a round number, so concentrations stay clean.
  const salts = [
    { formula: "CuSO₄", name: "copper(II) sulfate", mr: 160 },
    { formula: "NaOH", name: "sodium hydroxide", mr: 40 },
    { formula: "CaCO₃", name: "calcium carbonate", mr: 100 },
    { formula: "NaCl", name: "sodium chloride", mr: 58.5 },
    { formula: "KOH", name: "potassium hydroxide", mr: 56 },
  ];
  const salt = pick(salts, r);
  const moles = pick([0.1, 0.2, 0.25, 0.5], r);
  const volumeMl = pick([200, 250, 400, 500], r);
  const mass = Math.round(moles * salt.mr * 100) / 100;
  const litres = volumeMl / 1000;
  const concentration = Math.round((moles / litres) * 1000) / 1000;

  return {
    prompt: `What is the molar concentration of a solution of volume ${volumeMl} ml containing ${mass} g of ${salt.name}, ${salt.formula}?`,
    topic: "Stoichiometry",
    marks,
    answer: `${concentration} mol/l`,
    markScheme: spreadMarks(
      [
        `M(${salt.formula}) = ${salt.mr} g/mol`,
        `n = ${mass} / ${salt.mr} = ${moles} mol`,
        `V = ${volumeMl} ml = ${litres} l`,
        `c = ${moles} / ${litres} = ${concentration} mol/l`,
      ],
      marks
    ),
    hint: "Convert the volume to litres before dividing — working in millilitres is the usual way this goes wrong by a factor of 1000.",
  };
};

const nuclearChemistry: Generator = (marks, r) => {
  const halfLife = pick([5, 8, 10, 12, 20, 25], r);
  const steps = between(3, 6, r);
  const finalMass = pick([0.5, 1.5, 2, 3], r);
  const startMass = finalMass * 2 ** steps;

  return {
    prompt: `How long will it take for the mass of a radioactive substance to decrease from ${startMass} grams to ${finalMass} grams if the half-life is ${halfLife} days?`,
    topic: "Nuclear Chemistry",
    marks,
    answer: `${steps * halfLife} days`,
    markScheme: spreadMarks(
      [
        `The mass falls by a factor of ${startMass}/${finalMass} = ${2 ** steps}`,
        `${2 ** steps} = 2^${steps}, so ${steps} half-lives have passed`,
        `Time = ${steps} × ${halfLife} = ${steps * halfLife} days`,
      ],
      marks
    ),
    hint: "Halve repeatedly and count the steps — no logarithms needed. Each halving is one half-life.",
  };
};

const kinetics: Generator = (marks, r) => {
  const coefficient = pick([2, 3, 4], r);
  const start = pick([10, 15, 20, 25], r);
  const steps = between(2, 5, r);
  const end = start + steps * 10;
  const factor = coefficient ** steps;

  return {
    prompt: `By how many times will the rate of a chemical reaction increase when the temperature is raised from ${start} °C to ${end} °C, if the temperature coefficient of the reaction is ${coefficient}?`,
    topic: "Kinetics & Equilibrium",
    marks,
    answer: `${factor} times`,
    markScheme: spreadMarks(
      [
        `ΔT = ${end} − ${start} = ${steps * 10} °C`,
        `Van 't Hoff: the factor is γ^(ΔT/10) = ${coefficient}^${steps}`,
        `= ${factor}`,
      ],
      marks
    ),
    hint: "The coefficient applies per 10 °C. Divide the temperature rise by 10 first, then raise the coefficient to that power.",
  };
};

const periodicity: Generator = (marks, r) => {
  // Ion electron counts — always exact, always checkable.
  const cases = [
    { symbol: "N", z: 7, mass: 14, charge: -3 },
    { symbol: "O", z: 8, mass: 16, charge: -2 },
    { symbol: "Mg", z: 12, mass: 24, charge: 2 },
    { symbol: "Al", z: 13, mass: 27, charge: 3 },
    { symbol: "S", z: 16, mass: 32, charge: -2 },
    { symbol: "Ca", z: 20, mass: 40, charge: 2 },
  ];
  const c = pick(cases, r);
  const electrons = c.z - c.charge;
  const neutrons = c.mass - c.z;
  const label = `${c.symbol}${Math.abs(c.charge)}${c.charge > 0 ? "+" : "−"}`;

  return {
    prompt: `The ion ${label} is formed from the isotope with mass number ${c.mass}. State the number of protons, neutrons and electrons in this ion.`,
    topic: "Periodicity",
    marks,
    answer: `${c.z} protons, ${neutrons} neutrons, ${electrons} electrons`,
    markScheme: spreadMarks(
      [
        `Protons = atomic number = ${c.z}, unchanged by forming an ion`,
        `Neutrons = ${c.mass} − ${c.z} = ${neutrons}`,
        `Electrons = ${c.z} ${c.charge > 0 ? "−" : "+"} ${Math.abs(c.charge)} = ${electrons}`,
      ],
      marks
    ),
    hint: "Protons and neutrons never change when an ion forms — only electrons do. A positive charge means electrons lost, a negative charge means electrons gained.",
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

  // A-Level (Grade 12) topics
  Differentiation: differentiation,
  Integration: integration,
  "Differential Equations": differentialEquations,
  "Exponentials & Logarithms": exponentialsLogs,
  "Complex Numbers": complexNumbers,
  "Vectors 3D": vectors3D,
  "Parametric Equations": parametric,
  "Binomial Series": binomialSeries,

  // Chemistry topics with a determinate, calculable answer. The descriptive
  // strands (bonding diagrams, organic naming, qualitative analysis) have no
  // offline generator — those need a model, and say so when asked.
  Stoichiometry: stoichiometry,
  "Nuclear Chemistry": nuclearChemistry,
  "Kinetics & Equilibrium": kinetics,
  Periodicity: periodicity,
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
