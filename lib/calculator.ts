/**
 * Expression evaluator for the on-screen calculator.
 *
 * Papers that permit a calculator permit a *scientific* one, so this parses a
 * whole expression rather than accumulating one operation at a time: a
 * candidate working through `sin(2*pi/9)` should type it the way they would
 * key it, not decompose it.
 *
 * It is a hand-written tokeniser and shunting-yard parser rather than `eval`.
 * `eval` on a string the page collected would execute whatever was typed, and
 * a calculator is not worth an arbitrary-code-execution hole. Everything below
 * only ever produces numbers.
 */

export type AngleMode = "deg" | "rad";

export interface CalcResult {
  value: number | null;
  error: string | null;
}

type Token =
  | { kind: "number"; value: number }
  | { kind: "operator"; value: string }
  | { kind: "function"; value: string }
  | { kind: "paren"; value: "(" | ")" };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
};

/** Right-associative operators bind the other way round: 2^3^2 is 2^9. */
const PRECEDENCE: Record<string, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
  "%": 2,
  // Negation binds tighter than multiplication so 2*-3 is -6, and looser than
  // exponentiation so -3^2 is -9 — the convention every calculator follows.
  "u-": 2.5,
  "^": 3,
};
const RIGHT_ASSOCIATIVE = new Set(["^", "u-"]);
const UNARY = new Set(["u-"]);

const FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "acos",
  "atan",
  "ln",
  "log",
  "sqrt",
  "abs",
]);

/** Trigonometric functions read the angle mode; everything else ignores it. */
function applyFunction(name: string, argument: number, mode: AngleMode): number {
  const toRadians = (value: number) => (mode === "deg" ? (value * Math.PI) / 180 : value);
  const fromRadians = (value: number) => (mode === "deg" ? (value * 180) / Math.PI : value);

  switch (name) {
    case "sin":
      return Math.sin(toRadians(argument));
    case "cos":
      return Math.cos(toRadians(argument));
    case "tan":
      return Math.tan(toRadians(argument));
    case "asin":
      return fromRadians(Math.asin(argument));
    case "acos":
      return fromRadians(Math.acos(argument));
    case "atan":
      return fromRadians(Math.atan(argument));
    case "ln":
      return Math.log(argument);
    case "log":
      return Math.log10(argument);
    case "sqrt":
      return Math.sqrt(argument);
    case "abs":
      return Math.abs(argument);
    default:
      throw new Error(`unknown function ${name}`);
  }
}

function tokenise(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    if (char === " ") {
      i += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let literal = "";
      while (i < input.length && /[0-9.]/.test(input[i])) literal += input[i++];
      const value = Number(literal);
      if (!Number.isFinite(value)) throw new Error(`bad number "${literal}"`);
      tokens.push({ kind: "number", value });
      continue;
    }

    if (/[a-zπ]/i.test(char)) {
      let word = "";
      while (i < input.length && /[a-zπ]/i.test(input[i])) word += input[i++];
      const key = word.toLowerCase();

      if (key in CONSTANTS) {
        tokens.push({ kind: "number", value: CONSTANTS[key] });
        continue;
      }
      if (FUNCTIONS.has(key)) {
        tokens.push({ kind: "function", value: key });
        continue;
      }
      throw new Error(`unknown name "${word}"`);
    }

    if (char === "(" || char === ")") {
      tokens.push({ kind: "paren", value: char });
      i += 1;
      continue;
    }

    if (char in PRECEDENCE) {
      tokens.push({ kind: "operator", value: char });
      i += 1;
      continue;
    }

    if (char === "×") {
      tokens.push({ kind: "operator", value: "*" });
      i += 1;
      continue;
    }
    if (char === "÷") {
      tokens.push({ kind: "operator", value: "/" });
      i += 1;
      continue;
    }
    if (char === "−") {
      tokens.push({ kind: "operator", value: "-" });
      i += 1;
      continue;
    }

    throw new Error(`unexpected character "${char}"`);
  }

  return tokens;
}

/**
 * Insert the multiplication people leave out: 2π, 3(4+1), (1+2)(3+4), 2sin(x).
 * Doing it on the token stream keeps the parser itself honest about what an
 * operator is.
 */
function insertImplicitMultiplication(tokens: Token[]): Token[] {
  const out: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const previous = out[out.length - 1];

    const endsValue =
      previous &&
      (previous.kind === "number" ||
        (previous.kind === "paren" && previous.value === ")"));
    const startsValue =
      token.kind === "number" ||
      token.kind === "function" ||
      (token.kind === "paren" && token.value === "(");

    if (endsValue && startsValue) out.push({ kind: "operator", value: "*" });
    out.push(token);
  }

  return out;
}

/** Unary minus, resolved before parsing: -3, 2*-3, (-4)^2, sin(-x). */
function resolveUnaryMinus(tokens: Token[]): Token[] {
  const out: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const previous = out[out.length - 1];

    const isUnary =
      token.kind === "operator" &&
      token.value === "-" &&
      (!previous ||
        previous.kind === "operator" ||
        previous.kind === "function" ||
        (previous.kind === "paren" && previous.value === "("));

    if (isUnary) {
      // A prefix operator in its own right. Rewriting it as "0 -" would bind
      // to the wrong operand: 2*-3 would parse as (2*0)-3.
      out.push({ kind: "operator", value: "u-" });
      continue;
    }
    out.push(token);
  }

  return out;
}

/** Evaluate one expression. Returns an error rather than throwing. */
export function evaluate(input: string, mode: AngleMode = "deg"): CalcResult {
  const trimmed = input.trim();
  if (!trimmed) return { value: null, error: null };

  try {
    const tokens = resolveUnaryMinus(insertImplicitMultiplication(tokenise(trimmed)));

    const values: number[] = [];
    const operators: Token[] = [];

    const applyTop = () => {
      const operator = operators.pop();
      if (!operator) throw new Error("malformed expression");

      if (operator.kind === "function") {
        const argument = values.pop();
        if (argument === undefined) throw new Error("missing argument");
        values.push(applyFunction(operator.value, argument, mode));
        return;
      }

      // Only operators and functions ever reach the operator stack; the guard
      // is for the type system, which cannot know that.
      if (operator.kind !== "operator") throw new Error("malformed expression");

      if (UNARY.has(operator.value)) {
        const operand = values.pop();
        if (operand === undefined) throw new Error("malformed expression");
        values.push(-operand);
        return;
      }

      const right = values.pop();
      const left = values.pop();
      if (right === undefined || left === undefined) throw new Error("malformed expression");

      switch (operator.value) {
        case "+":
          values.push(left + right);
          break;
        case "-":
          values.push(left - right);
          break;
        case "*":
          values.push(left * right);
          break;
        case "/":
          values.push(left / right);
          break;
        case "%":
          values.push(left % right);
          break;
        case "^":
          values.push(Math.pow(left, right));
          break;
        default:
          throw new Error(`unknown operator ${operator.value}`);
      }
    };

    for (const token of tokens) {
      if (token.kind === "number") {
        values.push(token.value);
        continue;
      }
      if (token.kind === "function") {
        operators.push(token);
        continue;
      }
      if (token.kind === "paren") {
        if (token.value === "(") {
          operators.push(token);
        } else {
          while (
            operators.length &&
            !(operators[operators.length - 1].kind === "paren" &&
              (operators[operators.length - 1] as { value: string }).value === "(")
          ) {
            applyTop();
          }
          if (!operators.length) throw new Error("unbalanced brackets");
          operators.pop();
          // A function sitting immediately before the bracket applies now.
          if (operators.length && operators[operators.length - 1].kind === "function") {
            applyTop();
          }
        }
        continue;
      }

      // operator
      while (operators.length) {
        const top = operators[operators.length - 1];
        if (top.kind === "paren") break;
        if (top.kind === "function") {
          applyTop();
          continue;
        }
        const topPrecedence = PRECEDENCE[top.value];
        const tokenPrecedence = PRECEDENCE[token.value];
        const shouldApply = RIGHT_ASSOCIATIVE.has(token.value)
          ? topPrecedence > tokenPrecedence
          : topPrecedence >= tokenPrecedence;
        if (!shouldApply) break;
        applyTop();
      }
      operators.push(token);
    }

    while (operators.length) {
      const top = operators[operators.length - 1];
      if (top.kind === "paren") throw new Error("unbalanced brackets");
      applyTop();
    }

    if (values.length !== 1) throw new Error("malformed expression");

    const value = values[0];
    if (!Number.isFinite(value)) {
      return { value: null, error: Number.isNaN(value) ? "Undefined" : "Out of range" };
    }
    return { value, error: null };
  } catch (error) {
    return { value: null, error: (error as Error).message };
  }
}

/**
 * Format a result the way the paper asks for it.
 *
 * The 2024 Mathematics Component 2 rubric is explicit: where no accuracy is
 * specified, give inexact numeric answers to 3 significant figures and angles
 * to 0.1°. Showing a full float would invite candidates to copy digits the
 * mark scheme does not want.
 */
export function formatResult(value: number, significantFigures = 10): string {
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value);

  const rounded = Number(value.toPrecision(significantFigures));
  if (Math.abs(rounded) >= 1e10 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
    return rounded.toExponential(6).replace(/e([+-])(\d)$/, "e$10$2");
  }
  return String(rounded);
}

/** The same value at 3 significant figures — what most answers are written to. */
export const toThreeSigFigs = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(3)));
