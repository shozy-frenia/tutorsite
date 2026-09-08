"use client";

import { useEffect } from "react";

/**
 * One observer for every reveal on the page.
 *
 * The design marks things up declaratively — `data-reveal`, `data-hl`,
 * `data-stagger`, and the components that animate themselves once on entry
 * (`.ladder`, `.divider`, `.app`). All of them just want the class `is-in`
 * added when they first come into view, so they share a single
 * IntersectionObserver rather than mounting one per element.
 *
 * Two rules the pilots' phones made necessary:
 *
 *   · Reveal is one-way. Elements are unobserved once shown, so scrolling back
 *     up never replays an animation mid-read.
 *   · Anything already on screen at mount is shown immediately without a
 *     transition. A student landing mid-page must never see a blank block.
 *
 * `prefers-reduced-motion` is handled in CSS (everything is visible with no
 * transition), so this component simply shows everything and stops.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const selector =
      "[data-reveal],[data-hl],[data-stagger],[data-reveal-group]";
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (nodes.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced || typeof IntersectionObserver === "undefined") {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }

    // Stagger children by their index so a grid deals itself in rather than
    // appearing as one block.
    const stagger = (node: HTMLElement) => {
      if (!node.hasAttribute("data-stagger")) return;
      Array.from(node.children).forEach((child, index) => {
        (child as HTMLElement).style.transitionDelay = `${index * 90}ms`;
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          stagger(node);
          node.classList.add("is-in");
          observer.unobserve(node);
        });
      },
      // Fire a little before the element's top edge clears the fold, so the
      // motion is finishing as the reader arrives rather than starting then.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    // Arriving on a deep link is the one case where "reveal when scrolled to"
    // is not enough. The browser jumps to the section before or around the
    // moment this mounts, and anything inside it that is still waiting to be
    // revealed would leave the reader looking at empty paper. So the hash
    // target and everything inside it is shown outright, no transition.
    const hash = window.location.hash.slice(1);
    const target = hash ? document.getElementById(hash) : null;
    if (target) {
      const inside = [target, ...Array.from(target.querySelectorAll<HTMLElement>(selector))];
      inside.forEach((node) => {
        stagger(node);
        node.classList.add("is-in");
      });
    }

    nodes.forEach((node) => {
      if (node.classList.contains("is-in")) return;

      const box = node.getBoundingClientRect();
      const alreadyVisible = box.top < window.innerHeight && box.bottom > 0;
      if (alreadyVisible) {
        stagger(node);
        node.classList.add("is-in");
        return;
      }
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
