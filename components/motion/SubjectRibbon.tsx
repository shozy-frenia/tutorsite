"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

interface SubjectRibbonProps {
  items: string[];
  /** px of path travelled per second. */
  speed?: number;
}

const VIEW_W = 3200;
const VIEW_H = 200;
const CY = VIEW_H / 2;

/** One hump every `step` units, wide enough that a full subject list fits
 *  the path at or near its natural width — the fix for the letter-pileup
 *  that shows up when `textLength` has to compress a unit far longer than
 *  the path down to size (see the SubjectRibbon doc comment below). */
function buildWavePath(viewW: number, cy: number, step = 400) {
  const start = -step;
  const end = viewW + step;
  let d = `M ${start} ${cy} Q ${start + step / 2} ${cy - 60} ${start + step} ${cy}`;
  for (let x = start + step * 2; x <= end; x += step) {
    d += ` T ${x} ${cy}`;
  }
  return d;
}

const WAVE_PATH = buildWavePath(VIEW_W, CY);

/**
 * The one curved flourish on the landing page — a subject list scrolling
 * along a gentle wave rather than a straight line. Everywhere else on the
 * site stays flat and rectilinear on purpose, so this stays a single,
 * restrained accent rather than a repeated motif.
 *
 * Adapted from React Bits' Text Loop: same seamless-loop mechanic (two
 * overlapping <textPath> spans offset by half the loop length, advanced by
 * a gsap tween instead of native SMIL so it can pause on hover and respect
 * reduced motion), reskinned to flat ink-on-canvas — no ribbon fill, no
 * glow, just a faint hairline tracing the path the way the rest of the
 * site rules its dividers.
 *
 * `textLength`/`lengthAdjust="spacing"` force the rendered loop to the
 * path's exact length, which is what makes the seam invisible — but it
 * will happily compress a unit that's longer than the path into an
 * unreadable pile of overlapping glyphs. Keep `items` short enough (or the
 * path wide enough, see `VIEW_W`) that one repetition doesn't approach the
 * path's own length.
 */
export default function SubjectRibbon({ items, speed = 70 }: SubjectRibbonProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const headRef = useRef<SVGTextPathElement>(null);
  const tailRef = useRef<SVGTextPathElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({ length: 0, reps: 1 });

  const rawId = useId();
  const pathId = `subject-ribbon-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const unit = useMemo(() => `${items.join("   ✦   ")}   ✦   `, [items]);

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureRef.current;
    if (!pathEl || !measureEl) return undefined;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const length = pathEl.getTotalLength();
      const unitWidth = measureEl.getComputedTextLength();
      if (!length || !unitWidth) return;
      const reps = Math.max(1, Math.round(length / unitWidth));
      setMetrics((prev) => (prev.length === length && prev.reps === reps ? prev : { length, reps }));
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [unit]);

  useEffect(() => {
    const { length } = metrics;
    const head = headRef.current;
    const tail = tailRef.current;
    if (!head || !tail || !length) return undefined;

    const apply = (offset: number) => {
      const partner = offset >= 0 ? offset - length : offset + length;
      head.setAttribute("startOffset", String(offset));
      tail.setAttribute("startOffset", String(partner));
    };
    apply(0);

    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || speed <= 0) return undefined;

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: length,
      duration: length / speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => apply(state.offset),
    });

    const root = rootRef.current;
    const pause = () => tween.pause();
    const resume = () => tween.resume();
    root?.addEventListener("pointerenter", pause);
    root?.addEventListener("pointerleave", resume);

    return () => {
      tween.kill();
      root?.removeEventListener("pointerenter", pause);
      root?.removeEventListener("pointerleave", resume);
    };
  }, [metrics, speed]);

  const loopText = unit.repeat(metrics.reps);
  const fitLength = metrics.length || undefined;

  return (
    <div ref={rootRef} style={{ width: "100%", lineHeight: 0 }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "auto", display: "block" }}
        role="img"
        aria-label={items.join(", ")}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={WAVE_PATH}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={1.5}
          strokeOpacity={0.18}
        />

        <text ref={measureRef} className="ribbon-text" style={{ visibility: "hidden" }} aria-hidden="true">
          {unit}
        </text>

        <text className="ribbon-text" fill="var(--color-ink)" dominantBaseline="central" aria-hidden="true">
          <textPath ref={headRef} href={`#${pathId}`} startOffset={0} textLength={fitLength} lengthAdjust="spacing">
            {loopText}
          </textPath>
        </text>
        <text className="ribbon-text" fill="var(--color-ink)" dominantBaseline="central" aria-hidden="true">
          <textPath ref={tailRef} href={`#${pathId}`} startOffset={0} textLength={fitLength} lengthAdjust="spacing">
            {loopText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
