"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface Props {
  /** The number to land on. */
  to: number;
  /** Rendered before the count starts and if motion is off. */
  className?: string;
  suffix?: string;
}

/**
 * A figure that counts up to itself the first time it is scrolled into view.
 *
 * The claims on this page are all numeric — how many papers, how many marks,
 * where a C starts — and a number that arrives by counting reads as measured
 * rather than asserted. Only whole numbers here: every figure this is used on
 * is a count of something.
 *
 * The element renders its final value in the markup, so the number is correct
 * for a crawler, for a reader with motion turned off, and in the moment before
 * the observer fires. Nothing is ever hidden.
 */
export default function CountUp({ to, className = "", suffix = "" }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        const counter = { value: 0 };
        gsap.to(counter, {
          value: to,
          duration: Math.min(1.6, 0.5 + to / 260),
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = `${Math.round(counter.value)}${suffix}`;
          },
          onComplete: () => {
            el.textContent = `${to}${suffix}`;
          },
        });
      },
      { threshold: 0.6 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [to, suffix]);

  return (
    <span ref={ref} className={`t-mono ${className}`.trim()}>
      {to}
      {suffix}
    </span>
  );
}
