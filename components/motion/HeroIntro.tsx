"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/**
 * The page's arrival.
 *
 * Everything else on this site animates on scroll, which means the first two
 * seconds — the only two seconds a first-time visitor reliably gives you —
 * were completely still. This runs one timeline over the hero on load: the
 * framed canvas wipes up, the headline's lines ride out of their masks, and
 * the supporting copy and buttons follow.
 *
 * The elements are addressed by `data-enter` rather than by walking children,
 * so the hero's markup can be rearranged without the choreography silently
 * animating the wrong thing. Anything with a `data-enter` this file does not
 * name is still revealed by the catch-all at the end of the timeline, so a new
 * element can never be left hidden.
 *
 * Hiding is done in CSS under `html.js-motion` (globals.css), and that class is
 * set by the pre-paint script in layout.tsx — not here — because a class added
 * in an effect lands *after* first paint, which would show the finished hero
 * for a frame and then yank it away. The same script disarms itself if this
 * component never runs, so a chunk that fails to load costs the animation, not
 * the content.
 */
export default function HeroIntro({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    // Tell the safety net in layout.tsx that motion is in hand.
    document.documentElement.dataset.motionReady = "1";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pick = (name: string) =>
      Array.from(root.querySelectorAll<HTMLElement>(`[data-enter="${name}"]`));
    const lines = Array.from(root.querySelectorAll<HTMLElement>(".line-mask > *"));
    const everything = [
      ...Array.from(root.querySelectorAll<HTMLElement>(".enter, .enter-rise, .enter-wipe")),
      ...lines,
    ];

    if (reduced) {
      gsap.set(everything, { opacity: 1, y: 0, clipPath: "none" });
      document.documentElement.classList.remove("js-motion");
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.to(pick("panel"), {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "power4.inOut",
      })
        .to(pick("eyebrow"), { opacity: 1, y: 0, duration: 0.5 }, 0.15)
        .to(
          lines,
          { y: "0%", duration: 0.9, stagger: 0.075, ease: "power4.out" },
          0.2
        )
        .to(
          pick("lede"),
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          0.55
        )
        .to(
          pick("cta"),
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: "back.out(1.6)" },
          0.7
        )
        .to(pick("ticker"), { opacity: 1, y: 0, duration: 0.5 }, 0.85)
        // Catch-all: anything marked for entrance that the timeline above does
        // not name still ends up visible.
        .to(everything, { opacity: 1, y: 0, duration: 0.4 }, 1.1)
        .add(() => {
          // Drop the gate so nothing on the page is hidden by a stylesheet any
          // more — later re-renders then need no help from this component.
          document.documentElement.classList.remove("js-motion");
          gsap.set(everything, { clearProps: "opacity,transform,clipPath" });
        });
    }, root);

    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
