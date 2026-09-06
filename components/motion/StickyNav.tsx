"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Gets the floating bar out of the way while you are reading down, and brings
 * it back the moment you look for it.
 *
 * On a phone a sticky header costs about 60px of a 780px viewport for the
 * whole session, and fourteen of twenty-six pilots were on a phone. Hiding it
 * on downward scroll gives that back during reading — which is when nobody
 * wants navigation — and returning it on the first upward scroll means it is
 * there before you have finished the gesture you make to look for it.
 *
 * The threshold matters more than it looks. Reacting to every pixel makes the
 * bar flicker on the small scroll jitter a thumb produces while reading, so a
 * direction only counts once it has accumulated eight pixels, and nothing
 * hides at all in the first 90px where the bar and the page top are still
 * one object.
 *
 * All of it is a class toggle written inside rAF — no state, so scrolling
 * never queues a React render.
 */
export default function StickyNav({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let last = window.scrollY;
    let anchor = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const goingDown = y > last;

      // Reset the anchor whenever the direction flips, so the 8px threshold
      // is measured from the turn and not from wherever the page started.
      if (goingDown !== y > anchor) anchor = last;
      last = y;

      if (y < 90) {
        el.classList.remove("nav-tucked");
        anchor = y;
        return;
      }
      if (Math.abs(y - anchor) < 8) return;

      el.classList.toggle("nav-tucked", goingDown);
      anchor = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="sticky top-0 z-50 px-3 pt-3 md:px-5 md:pt-4 nav-shell"
      style={{ pointerEvents: "none" }}
    >
      {children}
    </div>
  );
}
