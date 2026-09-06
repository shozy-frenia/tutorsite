"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

/**
 * The seam between two pages.
 *
 * Two pilots wrote "анимации не хватало" without being asked what they meant,
 * and this is the largest part of it: clicking a link on this site produced an
 * instantaneous, total repaint. Nothing moved, so nothing told you the click
 * had registered — which on a slow connection is indistinguishable from a dead
 * button, and is a fair part of why ten of twenty-six closed the site in under
 * five minutes.
 *
 * What happens now is small on purpose. The incoming page rises eight pixels
 * and fades over a third of a second. That is enough to read as "this is a new
 * page" and short enough that nobody navigating quickly ever waits on it.
 *
 * Three things it deliberately does not do:
 *
 *   - No exit animation. The App Router unmounts the old tree before the new
 *     one commits, so an exit would need the whole page held in a portal.
 *     The cost is real and the gain is a fade nobody sees.
 *   - Nothing is hidden in CSS. `useLayoutEffect` sets the start state before
 *     the browser paints, so if this component never runs, the page is simply
 *     visible — a failed chunk costs the animation, not the content.
 *   - It never animates the first load. The hero has its own arrival timeline
 *     (HeroIntro), and running both means the landing page fades in twice.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.set(el, { opacity: 0, y: 8 });
  }, [pathname]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.34,
      ease: "power2.out",
      // The transform is dropped once it lands. A page left with a residual
      // `translate3d(0,0,0)` becomes a containing block for `position: fixed`,
      // which would quietly break the tutor drawer and the floating nav.
      clearProps: "transform,opacity",
    });
    return () => {
      tween.kill();
      gsap.set(el, { clearProps: "transform,opacity" });
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
