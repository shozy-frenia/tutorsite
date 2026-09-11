import type { ReactNode } from "react";

/**
 * The small amount of Markdown a model actually emits, rendered rather than
 * printed.
 *
 * Both AI surfaces show their replies in a `whitespace-pre-wrap` paragraph,
 * which means any emphasis the model writes arrives on screen as literal
 * asterisks: `**Identify the type of counting**`. The tutor prompt asks for
 * plain prose and forbids LaTeX and tables, but no instruction reliably stops
 * a model reaching for bold on a numbered list, and a student reading a
 * three-step explanation should not have to read around the syntax.
 *
 * Deliberately not a Markdown parser. Rendering arbitrary Markdown from a
 * model into a page is a much larger surface than this needs — links and HTML
 * passthrough in particular — and the only things worth handling are the two
 * that show up: `**bold**` and `*italic*`. Everything else falls through as
 * text, which is the safe direction to fail in.
 *
 * This lived inside AskTalap and the tutor drawer never got it, so the drawer
 * — the surface students actually read during a paper — was the one showing
 * raw asterisks. One copy, both callers.
 */

/**
 * Common LaTeX, rewritten to the Unicode the design system already uses.
 *
 * The tutor prompt asks for plain Unicode maths and says "no LaTeX" in as
 * many words. gpt-oss ignores it often enough to matter: a marking
 * explanation came back containing `\(A(8,4)=8\times7\times6\times5\)`,
 * which a student reads as gibberish in the middle of an otherwise good
 * answer — and unreadable output is how a tutor loses the trust the pilot
 * scored at 3.77.
 *
 * A prompt cannot be relied on for this, so the render fixes it. The list is
 * short on purpose: these are the commands that actually show up in
 * school-level maths, chemistry and physics. Anything else is left alone
 * rather than mangled, and the delimiters are stripped last so a stray
 * `\[ ... \]` around otherwise-fine text simply disappears.
 */
const LATEX: Array<[RegExp, string | ((...args: string[]) => string)]> = [
  [/\\times/g, "×"],
  [/\\cdot/g, "·"],
  [/\\div/g, "÷"],
  [/\\pm/g, "±"],
  [/\\leq?\b/g, "≤"],
  [/\\geq?\b/g, "≥"],
  [/\\neq\b/g, "≠"],
  [/\\approx/g, "≈"],
  [/\\pi\b/g, "π"],
  [/\\theta\b/g, "θ"],
  [/\\alpha\b/g, "α"],
  [/\\beta\b/g, "β"],
  [/\\Delta\b/g, "Δ"],
  [/\\infty/g, "∞"],
  [/\\rightarrow|\\to\b/g, "→"],
  [/\\binom\{([^{}]*)\}\{([^{}]*)\}/g, (_m: string, n: string, k: string) => `C(${n}, ${k})`],
  [/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m: string, a: string, b: string) => `${a}/${b}`],
  [/\\sqrt\{([^{}]*)\}/g, (_m: string, x: string) => `√(${x})`],
  [/\\text\{([^{}]*)\}/g, (_m: string, t: string) => t],
  [/\\left|\\right/g, ""],
  // Delimiters last: by now the contents are already plain.
  [/\\[[\]()]/g, ""],
  [/\$\$?/g, ""],
];

/**
 * Exported so it can be tested without a React runtime: this is pure string
 * work and should not need JSX to prove it is right.
 */
export function deLatex(text: string): string {
  if (!text.includes("\\") && !text.includes("$")) return text;
  let out = text;
  for (const [pattern, replacement] of LATEX) {
    out =
      typeof replacement === "string"
        ? out.replace(pattern, replacement)
        : out.replace(pattern, replacement as (substring: string, ...args: string[]) => string);
  }
  return out;
}

/** Bold first, so `**x**` is never mistaken for two italic markers. */
const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;

export function renderRichText(text: string): ReactNode[] {
  return deLatex(text).split(TOKEN).map((chunk, i) => {
    if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4) {
      return <strong key={i}>{chunk.slice(2, -2)}</strong>;
    }
    if (chunk.startsWith("*") && chunk.endsWith("*") && chunk.length > 2) {
      return <em key={i}>{chunk.slice(1, -1)}</em>;
    }
    return <span key={i}>{chunk}</span>;
  });
}
