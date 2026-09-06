"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";

type Direction = "up" | "left" | "right" | "scale";

interface Props {
  children: ReactNode;
  /* A closed set rather than ElementType: a polymorphic ref is not worth the
     generic gymnastics here, and these are the tags a revealed block is. */
  as?: "div" | "section" | "article" | "aside" | "h2" | "h3" | "p" | "ul";
  className?: string;
  style?: CSSProperties;
  /** Which way it travels in. Default "up". */
  from?: Direction;
  /** Seconds to hold before starting, for choreographing two neighbours. */
  delay?: number;
}

const START: Record<Direction, gsap.TweenVars> = {
  up: { y: 26 },
  left: { x: -26 },
  right: { x: 26 },
  scale: { scale: 0.96 },
};

/**
 * One element arriving as it scrolls into view.
 *
 * StaggerIn already deals a *group* of siblings in one after another, which is
 * right for a grid of cards and wrong for everything else: a section heading,
 * a table, a single panel. Feeding those to StaggerIn animates their children
 * instead — every row of a boundary table sliding in separately, which is
 * noise. This is the single-element case, and between the two of them the
 * whole page has motion rather than just the card grids.
 *
 * Same two rules as StaggerIn, for the same reasons. Nothing is hidden until
 * the effect actually runs, so a failed script costs the animation and not the
 * content. And an element already on screen when this mounts has missed its
 * entrance — hiding it now would blink it out and back, so it keeps the frame
 * it rendered with.
 */
export default function Reveal({
  children,
  as = "div",
  className = "",
  style,
  from = "up",
  delay = 0,
}: Props) {
  const Tag = as;
  const ref = useRef<HTMLElement | null>(null);
  /* A callback ref, not a ref object. `as` is a union of tags, so JSX asks for
     the intersection of their ref types and no single RefObject satisfies it;
     one callback taking HTMLElement satisfies all of them. */
  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return undefined;

    gsap.set(el, { autoAlpha: 0, ...START[from] });

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        gsap.to(el, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.62,
          delay,
          ease: "power3.out",
          clearProps: "transform",
        });
      },
      { threshold: 0.12 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [from, delay]);

  return (
    <Tag ref={setRef} className={className} style={style}>
      {children}
    </Tag>
  );
}
