"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

/**
 * Client wrapper for the 3D hero.
 *
 * WebGL is loaded only in the browser (ssr: false) and only once the page is
 * interactive, so the landing page's first paint never waits on three.js. The
 * fallback is a static grade ladder in the same visual language, which means a
 * device that cannot run WebGL still sees the right thing rather than a hole.
 */

const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => <LadderFallback />,
});

const GRADES = ["A*", "A", "B", "C", "D", "E", "U"];

function LadderFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-2 px-6">
      {GRADES.map((grade, i) => (
        <div
          key={grade}
          className="flex items-center justify-center"
          style={{
            width: 46,
            height: 46,
            border: "3px solid var(--color-ink)",
            background: i === 0 ? "var(--color-acid-lime)" : "var(--color-highlighter)",
            fontWeight: 700,
            transform: `translateY(${i * 7}px)`,
          }}
        >
          {grade}
        </div>
      ))}
    </div>
  );
}

export default function HeroCanvas() {
  const [grabbed, setGrabbed] = useState<string | null>(null);

  return (
    <div className="absolute inset-0">
      <Hero3D onGrab={setGrabbed} />

      {grabbed && (
        <div
          className="absolute left-4 bottom-4 px-3 py-2 rise"
          style={{
            border: "2px solid var(--color-ink)",
            background: "var(--color-canvas)",
            boxShadow: "var(--shadow-brutal-sm)",
          }}
        >
          <span className="t-micro">TARGETING</span>{" "}
          <span style={{ fontWeight: 700 }}>{grabbed}</span>
        </div>
      )}
    </div>
  );
}
