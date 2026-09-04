import type { Grade } from "@/data/grade-boundaries";
import { gradeTone } from "@/lib/grading";

/**
 * The grade plate — the same object as the 3D badges on the landing page,
 * flattened to 2D. Lime for A*, yellow for a pass, red for U.
 *
 * U is drawn rather than filled. At `xl` a solid signal-red square is the
 * loudest thing on the screen, and the exam workspace shows the projected
 * grade from the moment the paper opens — so a student who has not yet
 * answered anything was being met with a 96px red block. Red still carries
 * the meaning, as the rule and the letter.
 */

const SIZES = {
  sm: { box: 32, font: 14, border: 2 },
  md: { box: 44, font: 18, border: 2 },
  lg: { box: 64, font: 28, border: 3 },
  xl: { box: 96, font: 44, border: 3 },
} as const;

const TONE_BACKGROUND: Record<ReturnType<typeof gradeTone>, string> = {
  top: "var(--color-acid-lime)",
  good: "var(--color-highlighter)",
  mid: "var(--color-highlighter)",
  low: "var(--color-paper)",
  fail: "var(--color-sheet)",
};

export default function GradeBadge({
  grade,
  size = "md",
}: {
  grade: Grade;
  size?: keyof typeof SIZES;
}) {
  const { box, font, border } = SIZES[size];
  const failing = gradeTone(grade) === "fail";

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: box,
        height: box,
        background: TONE_BACKGROUND[gradeTone(grade)],
        border: `${border}px solid ${failing ? "var(--color-signal-red)" : "var(--color-rule)"}`,
        color: failing ? "var(--color-signal-red)" : "var(--color-ink)",
        fontSize: font,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
      title={`Grade ${grade}`}
    >
      {grade}
    </span>
  );
}
