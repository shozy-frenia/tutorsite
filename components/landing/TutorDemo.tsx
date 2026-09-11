"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface DemoMessage {
  who: "me" | "ai";
  text: string;
}

interface Props {
  subjectLine: string;
  paperLine: string;
  mark: number;
  maxMark: number;
  grade: string;
  /** Band floors to print under the bar, low to high. */
  ticks: number[];
  messages: DemoMessage[];
}

/**
 * The tutor panel on the landing page.
 *
 * This is a replay of a real exchange, not a live model, and it says so on the
 * bar. A landing page that fakes an AI answering the visitor's own typed
 * question is making a promise the product then has to keep in a different
 * context — so the composer row is a link into a real paper instead of an
 * input that pretends. The live tutor lives in the workspace drawer and in
 * Ask Talap, where it has a question and a mark scheme to work from.
 */
export default function TutorDemo({
  subjectLine,
  paperLine,
  mark,
  maxMark,
  grade,
  ticks,
  messages,
}: Props) {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  // Hold the replay until the panel is actually on screen, so a visitor who
  // scrolls straight past does not arrive to a finished conversation.
  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      setShown(messages.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [messages.length]);

  useEffect(() => {
    if (!started || shown >= messages.length) return;

    const next = messages[shown];
    // The tutor "thinks" before it answers; the student's own line lands at once.
    const delay = next.who === "ai" ? 900 : 420;

    if (next.who === "ai") {
      const think = window.setTimeout(() => setTyping(true), 120);
      const reveal = window.setTimeout(() => {
        setTyping(false);
        setShown((n) => n + 1);
      }, delay);
      return () => {
        window.clearTimeout(think);
        window.clearTimeout(reveal);
      };
    }

    const reveal = window.setTimeout(() => setShown((n) => n + 1), delay);
    return () => window.clearTimeout(reveal);
  }, [started, shown, messages]);

  const percent = maxMark > 0 ? Math.round((mark / maxMark) * 100) : 0;

  return (
    <div className="app" ref={panelRef} data-reveal>
      <div className="app__bar">
        <span className="mono">{subjectLine}</span>
        <span className="mono muted">{paperLine}</span>
      </div>

      <div className="app__score">
        <div className="app__row">
          <span className="app__big">
            {mark}
            <span className="mono muted" style={{ fontSize: 14 }}>
              /{maxMark}
            </span>
          </span>
          <span className="grade-badge" style={{ fontSize: 20 }}>
            Grade {grade}
          </span>
        </div>
        <div style={{ marginTop: "var(--spacing-16)" }}>
          <div className="meter">
            <i style={{ width: `${percent}%` }} />
          </div>
          <div className="app__ticks">
            {ticks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="chat" style={{ maxHeight: 330 }}>
        {messages.slice(0, shown).map((message, index) => (
          <p
            key={`${message.who}-${index}`}
            className={`msg msg--${message.who} rise`}
          >
            {message.text}
          </p>
        ))}
        {typing && (
          <p className="msg msg--ai" aria-hidden="true">
            <span className="typing">
              <i />
              <i />
              <i />
            </span>
          </p>
        )}
      </div>

      <div className="app__input">
        <span
          className="field"
          aria-hidden="true"
          style={{ display: "flex", alignItems: "center", opacity: 0.7 }}
        >
          Ask about the exam…
        </span>
        <Link className="btn btn--primary btn--sm" href="/library">
          Ask it for real
        </Link>
      </div>
    </div>
  );
}
