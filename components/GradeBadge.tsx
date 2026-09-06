import type { Grade } from "@/data/grade-boundaries";
import { gradeTone } from "@/lib/grading";

/**
 * The grade plate.
 *
 * A grade is the one number a student came here for, so it is rendered as an
 * object rather than as text: a rounded plate in the display face, coloured by
 * band. The colours climb the sticky-note scale the way the grade ladder does
 * — teal and blush in the middle, the highlighter reserved for the top grades,
 * terracotta only for U — so a badge and a rung of the ladder always agree.
 */

const SIZES = {
  sm: { box: 32, font: 14 },
  md: { box: 44, font: 18 },
  lg: { box: 60, font: 26 },
  xl: { box: 92, font: 40 },
} as const;

const TONE_BACKGROUND: Record<ReturnType<typeof gradeTone>, string> = {
  top: "#ffd400",
  good: "var(--color-highlighter-yellow)",
  mid: "var(--color-sticky-note-mint)",
  low: "var(--color-sticky-note-blush)",
  fail: "var(--color-bad-bg)",
};

export default function GradeBadge({
  grade,
  size = "md",
}: {
  grade: Grade;
  size?: keyof typeof SIZES;
}) {
  const { box, font } = SIZES[size];
  const tone = gradeTone(grade);

  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: box,
        height: box,
        background: TONE_BACKGROUND[tone],
        border: "1px solid var(--color-forest-ink)",
        borderRadius: "var(--radius-md)",
        color: tone === "fail" ? "var(--color-bad)" : "var(--color-forest-ink)",
        fontFamily: "var(--font-display)",
        fontSize: font,
        fontWeight: 800,
        letterSpacing: "0.02em",
        lineHeight: 1,
      }}
      title={`Grade ${grade}`}
    >
      {grade}
    </span>
  );
}
