"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface CoverflowPaper {
  id: string;
  title: string;
  subject: string;
  glyph: string;
  gradeYear: number;
  sitting: string;
  questions: number;
  marks: number;
  minutes: number;
  calculator: boolean;
  pastPaper: boolean;
  topics: string[];
}

interface Props {
  papers: CoverflowPaper[];
}

/** Perspective depth of the stage, in px. */
const PERSPECTIVE = 1600;
/** How many cards either side of centre stay on screen. */
const MAX_VISIBLE = 2;
/** Horizontal step between neighbouring cards, px. */
const STEP_X = 232;
/** How far each rank recedes along the z axis, px. */
const DEPTH = 190;
/** Degrees a card yaws per rank away from centre. */
const TILT = 15;
const SCALE_STEP = 0.1;
const CARD_W = 320;
const CARD_H = 400;
const MOVE_MS = 520;

/**
 * The papers, as a 3D coverflow.
 *
 * Adapted from OriginKit's Coverflow Gallery — same geometry (each card is
 * placed by its signed distance from centre: stepped along x, pushed back
 * along z, yawed, and scaled down, all inside one `preserve-3d` stage) and the
 * same click-to-centre interaction. What changed is what rides on it: the
 * original is a photo carousel, and this site has no photography. The cards
 * here are the real paper cards — flat, ink-bordered, highlighter header, hard
 * offset shadow — so the flourish is also the page's clearest statement of
 * what you actually get.
 *
 * Two additions the original lacks, because this one is a primary way into the
 * product rather than decoration: explicit prev/next controls, so the
 * interaction is discoverable without hovering, and the centre card being a
 * real link to the paper.
 */
export default function PaperCoverflow({ papers }: Props) {
  const n = papers.length;
  const [active, setActive] = useState(0);
  const lockRef = useRef(false);

  useEffect(() => {
    setActive((a) => Math.max(0, Math.min(n - 1, a)));
  }, [n]);

  // Ignore input while a card is mid-flight; without it a held arrow key
  // stacks moves and the stage reads as jitter rather than motion.
  const step = useCallback(
    (dir: number) => {
      if (lockRef.current || n < 2) return;
      lockRef.current = true;
      window.setTimeout(() => {
        lockRef.current = false;
      }, MOVE_MS);
      setActive((a) => (((a + dir) % n) + n) % n);
    },
    [n]
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Mock papers"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          position: "relative",
          height: CARD_H + 90,
          perspective: `${PERSPECTIVE}px`,
          overflow: "hidden",
          outline: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: CARD_W,
            height: CARD_H,
            transformStyle: "preserve-3d",
          }}
        >
          {papers.map((paper, i) => {
            let rel = i - active;
            if (rel > n / 2) rel -= n;
            if (rel < -n / 2) rel += n;
            const rank = Math.abs(rel);
            const visible = rank <= MAX_VISIBLE;
            const isActive = rel === 0;

            return (
              <Link
                key={paper.id}
                href={`/exam/${paper.id}`}
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isActive}
                onClick={(event) => {
                  // Only the centre card navigates; the others recentre.
                  if (!isActive) {
                    event.preventDefault();
                    if (!lockRef.current) {
                      lockRef.current = true;
                      window.setTimeout(() => {
                        lockRef.current = false;
                      }, MOVE_MS);
                      setActive(i);
                    }
                  }
                }}
                className="no-underline"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: CARD_W,
                  height: CARD_H,
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--color-canvas)",
                  color: "var(--color-ink)",
                  border: "3px solid var(--color-ink)",
                  boxShadow: "var(--shadow-brutal)",
                  transformOrigin: "center center",
                  transform: `translate(-50%, -50%) translateX(${rel * STEP_X}px) translateZ(${-rank * DEPTH}px) rotateY(${-rel * TILT}deg) scale(${Math.max(0.4, 1 - rank * SCALE_STEP)})`,
                  transition: `transform ${MOVE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${MOVE_MS}ms ease`,
                  opacity: visible ? 1 : 0,
                  pointerEvents: visible ? "auto" : "none",
                  overflow: "hidden",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{
                    background: "var(--color-highlighter)",
                    borderBottom: "3px solid var(--color-ink)",
                  }}
                >
                  <span className="t-micro">
                    GRADE {paper.gradeYear} · {paper.subject.toUpperCase()}
                  </span>
                  <h3 className="t-subheading mt-1" style={{ lineHeight: 0.95 }}>
                    {paper.title}
                  </h3>
                </div>

                <div className="px-4 py-3 grow flex flex-col gap-3">
                  <span className="t-label" style={{ opacity: 0.65 }}>
                    {paper.sitting}
                  </span>

                  <dl className="grid grid-cols-3 m-0">
                    {[
                      ["QUESTIONS", paper.questions],
                      ["MARKS", paper.marks],
                      ["MINUTES", paper.minutes],
                    ].map(([label, value], index) => (
                      <div
                        key={label}
                        style={{
                          borderRight: index < 2 ? "1px solid var(--color-ink)" : undefined,
                          paddingRight: 10,
                          paddingLeft: index > 0 ? 10 : 0,
                        }}
                      >
                        <dt className="t-micro m-0" style={{ opacity: 0.6 }}>
                          {label}
                        </dt>
                        <dd className="t-mono m-0" style={{ fontSize: 26, fontWeight: 700 }}>
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                    {paper.topics.map((topic) => (
                      <li
                        key={topic}
                        className="t-micro px-2 py-1"
                        style={{ border: "1px solid var(--color-ink)" }}
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span
                      className="t-micro px-2 py-1"
                      style={{ background: "var(--color-ink)", color: "var(--color-canvas)" }}
                    >
                      {paper.calculator ? "CALCULATOR" : "NO CALCULATOR"}
                    </span>
                    <span
                      className="t-micro px-2 py-1"
                      style={{
                        border: "2px solid var(--color-ink)",
                        background: paper.pastPaper ? "var(--color-acid-lime)" : "transparent",
                      }}
                    >
                      {paper.pastPaper ? "PAST PAPER" : "PRACTICE"}
                    </span>
                  </div>
                </div>

                <div
                  className="px-4 py-3 t-label"
                  style={{
                    borderTop: "3px solid var(--color-ink)",
                    background: isActive ? "var(--color-ink)" : "var(--color-paper)",
                    color: isActive ? "var(--color-canvas)" : "var(--color-ink)",
                    transition: "background 200ms ease, color 200ms ease",
                  }}
                >
                  {isActive ? "SIT THIS PAPER →" : "BRING TO FRONT"}
                </div>

                {/* Everything off-centre recedes rather than competing. */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--color-ink)",
                    opacity: isActive ? 0 : 0.3,
                    transition: `opacity ${MOVE_MS}ms ease`,
                    pointerEvents: "none",
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous paper"
          className="press-swiss t-label"
          style={{
            border: "3px solid var(--color-ink)",
            boxShadow: "var(--shadow-brutal-sm)",
            background: "var(--color-canvas)",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <span className="t-micro t-mono" style={{ opacity: 0.6, minWidth: "6ch", textAlign: "center" }}>
          {active + 1} / {n}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next paper"
          className="press-swiss t-label"
          style={{
            border: "3px solid var(--color-ink)",
            boxShadow: "var(--shadow-brutal-sm)",
            background: "var(--color-canvas)",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}
