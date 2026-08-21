"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

interface MaskedRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A heading whose words rise into place, staggered, the first time it
 * scrolls into view — the scroll-triggered sibling of the page's own
 * `.rise` fade-up keyframe (globals.css), run per word instead of on the
 * whole block.
 *
 * Adapted from React Bits' Masked Heading, minus the image/video it
 * normally clips through: this site has no photography to mask, and
 * running a solid brand colour through that clip-path machinery would cost
 * the SVG clipPath + per-word glyph measuring for a result identical to
 * colouring the text directly. What's kept is the technique that mattered —
 * each word riding up out of an overflow-hidden band — via gsap +
 * IntersectionObserver instead of a scroll library.
 */
export default function MaskedReveal({ text, as = "h2", className = "", style }: MaskedRevealProps) {
  const rootRef = useRef<HTMLHeadingElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  useEffect(() => {
    const root = rootRef.current;
    const riders = wordRefs.current.filter((el): el is HTMLSpanElement => Boolean(el));
    if (!root || !riders.length) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(riders, { y: "0%" });
      return undefined;
    }

    gsap.set(riders, { y: "110%" });
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        gsap.to(riders, { y: "0%", duration: 0.7, stagger: 0.07, ease: "power4.out" });
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [words]);

  const Tag = as;

  return (
    <Tag ref={rootRef} className={className} style={style}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
        >
          <span
            ref={(el) => {
              wordRefs.current[i] = el;
            }}
            style={{ display: "inline-block" }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
