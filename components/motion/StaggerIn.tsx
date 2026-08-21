"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Deals this element's direct children in, one after another, the first time
 * the group scrolls into view.
 *
 * Bounce Cards' entrance, generalised. That component animates a fixed fan of
 * overlapping photos — each card carries a hand-written
 * `rotate(…) translate(…)` and hovering pushes its siblings aside. None of
 * that survives contact with a real content grid, where the layout is the
 * grid's job. What is worth keeping is the timing: a gsap stagger with a
 * little overshoot on the ease, so a list of cards arrives as a sequence
 * rather than a block. The overshoot is pulled back from the original's
 * `elastic.out(1, 0.8)` to a mild `back.out` — this is a page of exam papers,
 * not a toy.
 *
 * Progressive enhancement: nothing is hidden until the effect runs, so if the
 * script never executes the grid simply renders.
 */
export default function StaggerIn({ children, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const items = Array.from(root.children) as HTMLElement[];
    if (!items.length) return undefined;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    gsap.set(items, { autoAlpha: 0, y: 20, scale: 0.97 });
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "back.out(1.2)",
          // Clear the inline transform once it has landed, so a card's own
          // hover transform isn't fighting a leftover `scale(1)` from here.
          clearProps: "transform",
        });
        io.disconnect();
      },
      { threshold: 0.05 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
