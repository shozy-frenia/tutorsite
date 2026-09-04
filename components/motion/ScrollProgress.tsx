"use client";

import { useEffect, useRef } from "react";

/**
 * How far down the page you are, drawn as a highlighter rule across the top.
 *
 * This is the yellow doing the job the pilot feedback said it should do — mark
 * a position — instead of filling another panel. It is also the one piece of
 * motion on the page that responds to the reader continuously, so the page
 * feels attached to the scroll rather than merely reacting to it.
 *
 * Written straight to a CSS custom property inside rAF: no state, so scrolling
 * never queues a React render.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      el.style.setProperty("--progress", String(Math.min(1, Math.max(0, progress))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
