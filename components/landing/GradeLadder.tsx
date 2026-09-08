"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/components/i18n/LocaleProvider";

export interface LadderBand {
  grade: string;
  min: number;
  max: number;
}

interface Props {
  /** Shown above the readout, e.g. "Maths · Component 1 · /80". */
  caption: string;
  maxMark: number;
  /** Bands as the published table prints them, any order. */
  bands: LadderBand[];
  /** Where the handle starts. Defaults to the middle of the scale. */
  initialMark?: number;
  label: string;
}

/**
 * The grade ladder.
 *
 * A student's real question is never "what is 44 out of 80 as a percentage" —
 * it is "what does 44 get me, and how far is the next grade". So the control
 * is the mark, and everything else reads off it: the bar fills to the band,
 * the rung lights up, the badge changes letter.
 *
 * The bands are passed in from the published boundary table rather than
 * computed from percentages. That is the whole point of the component: a C in
 * Maths Paper 1 starts at 36/80 (45%) and a C in Chemistry Paper 1 at 44/90
 * (49%), and a ladder that drew even 10% steps would be lying about both.
 */
export default function GradeLadder({
  caption,
  maxMark,
  bands,
  initialMark,
  label,
}: Props) {
  const t = useT();
  // Best-first is how a boundary table is printed and how `gradeFor` walks it.
  const ordered = useMemo(
    () => [...bands].sort((a, b) => b.min - a.min),
    [bands]
  );

  const [mark, setMark] = useState(
    () => initialMark ?? Math.round(maxMark * 0.55)
  );
  const [dragging, setDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const current =
    ordered.find((band) => mark >= band.min) ?? ordered[ordered.length - 1];

  const setFromPointer = useCallback(
    (clientX: number) => {
      const rail = sliderRef.current;
      if (!rail) return;
      const box = rail.getBoundingClientRect();
      if (box.width === 0) return;
      const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
      setMark(Math.round(ratio * maxMark));
    },
    [maxMark]
  );

  // Pointer capture is deliberately not used: the drag has to keep tracking
  // when the finger leaves the 44px rail, which on a phone it always does.
  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => setFromPointer(event.clientX);
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, setFromPointer]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    const keys: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
    };
    if (event.key === "Home") {
      event.preventDefault();
      setMark(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setMark(maxMark);
      return;
    }
    const delta = keys[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    setMark((value) => Math.min(maxMark, Math.max(0, value + delta)));
  };

  const percent = maxMark > 0 ? (mark / maxMark) * 100 : 0;

  return (
    <div className="ladder" data-reveal>
      <div className="ladder__top">
        <div>
          <span className="eyebrow">{t("landing.ladder.title")}</span>
          <div className="mono muted" style={{ marginTop: 4 }}>
            {caption}
          </div>
        </div>
        <div className="ladder__read">
          <span className="ladder__mark">{mark}</span>
          <span
            className="ladder__grade"
            style={{ background: gradeColour(current.grade) }}
          >
            {current.grade}
          </span>
        </div>
      </div>

      {/* Rendered best-first, then flipped by `flex-direction: column-reverse`,
          so U sits at the bottom of the ladder where a ladder's bottom is. */}
      <div className="ladder__rungs">
        {ordered.map((band) => {
          const width = maxMark > 0 ? ((band.max - band.min + 1) / maxMark) * 100 : 0;
          return (
            <button
              key={band.grade}
              type="button"
              className={`rung${band.grade === current.grade ? " is-on" : ""}`}
              onClick={() => setMark(band.min)}
              aria-label={`${band.grade}: ${band.min}+`}
            >
              <span className="rung__g">{band.grade}</span>
              <span className="rung__bar">
                <i
                  style={
                    {
                      "--w": `${width}%`,
                      "--rc": gradeColour(band.grade),
                    } as React.CSSProperties
                  }
                />
              </span>
              <span className="rung__n">
                {band.min}–{band.max}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={sliderRef}
        className={`ladder__slider${dragging ? " is-drag" : ""}`}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={maxMark}
        aria-valuenow={mark}
        aria-valuetext={`${mark}/${maxMark} — ${current.grade}`}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          setDragging(true);
          setFromPointer(event.clientX);
        }}
      >
        <div className="ladder__track">
          {[...ordered].reverse().map((band) => (
            <span
              key={band.grade}
              className="ladder__seg"
              style={{
                width: `${((band.max - band.min + 1) / maxMark) * 100}%`,
                background: gradeColour(band.grade),
              }}
            />
          ))}
        </div>
        <span className="ladder__handle" style={{ left: `${percent}%` }} />
      </div>

      <div className="ladder__ticks">
        <span>0</span>
        <span>{Math.round(maxMark / 2)}</span>
        <span>{maxMark}</span>
      </div>

      <div className="ladder__hint">
        <span className="mono muted">{t("landing.ladder.hintKeys")}</span>
        <span className="mono muted">
          {t("landing.ladder.range", {
            top: ordered[0]?.grade ?? "",
            bottom: ordered[ordered.length - 1]?.grade ?? "",
          })}
        </span>
      </div>
    </div>
  );
}

/**
 * Colour per grade.
 *
 * The sticky-note tints climb towards the highlighter: the top of the ladder
 * is the only place pure yellow appears, which is what makes reaching it read
 * as an event.
 */
function gradeColour(grade: string): string {
  switch (grade) {
    case "A*":
      return "#ffd400";
    case "A":
      return "var(--color-highlighter-yellow)";
    case "B":
      return "var(--color-sticky-note-mint)";
    case "C":
      return "var(--color-sticky-note-teal)";
    case "D":
      return "var(--color-sticky-note-blush)";
    case "E":
      return "#e4e0cf";
    default:
      return "var(--color-whisper-gray)";
  }
}
