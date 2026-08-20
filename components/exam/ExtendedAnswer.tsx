"use client";

import { useState } from "react";
import type { Question } from "@/lib/exam-types";

/**
 * Extended written answers — the Я1 language papers and History.
 *
 * These questions have no right answer to compare against. They are marked
 * against a banded rubric, so this surface is built round the rubric: the
 * sources sit above the script, the bands sit beside the mark, and every
 * criterion has to come back with the evidence that earned it.
 *
 * The mark comes from /api/assess. Nothing is scored in the browser — the
 * word counter is the only judgement made client-side, and it is a count.
 */

interface CriterionResult {
  id: string;
  name: string;
  max: number;
  awarded: number;
  marked: boolean;
  band: string;
  reason: string;
  evidence: string;
  next: string;
}

interface Assessment {
  criteria: CriterionResult[];
  total: number;
  max: number;
  sourcesUsed: string[];
  sourcesIgnored: string[];
  summary: string;
  mode: "offline" | "anthropic" | "freetheai";
}

interface Props {
  paperId: string;
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onMarked: (awarded: number) => void;
}

const words = (text: string) => (text.trim() ? text.trim().split(/\s+/).length : 0);

export default function ExtendedAnswer({
  paperId,
  question,
  value,
  onChange,
  onMarked,
}: Props) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = words(value);
  // Point-marked science answers can be complete in one sentence; essays
  // marked against bands cannot. Keep the button's threshold matched to the
  // one the route actually applies.
  const pointMarked = (question.criteria ?? []).every((c) => c.points?.length);
  const floor = pointMarked ? 3 : 20;
  const short = question.minWords ? count < question.minWords : false;
  const long = question.maxWords ? count > question.maxWords : false;

  async function mark() {
    if (marking || count < floor) return;
    setMarking(true);
    setError(null);
    setAssessment(null);

    try {
      const response = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId, questionId: question.id, answer: value }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not mark this answer.");
        return;
      }

      setAssessment(payload);
      onMarked(payload.total);
    } catch {
      setError("Could not reach the examiner. Check your connection.");
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="px-5 py-5 flex flex-col gap-4">
      {/* ------------------------------------------------------------ sources */}
      {question.sources?.length ? (
        <div>
          <span className="t-micro" style={{ opacity: 0.6 }}>
            SOURCE MATERIAL — {question.sources.length} SOURCES, THE MARKS ARE FOR USING THEM
          </span>
          <div className="mt-2 flex flex-col gap-2">
            {question.sources.map((source) => (
              <details
                key={source.ref}
                className="swiss-flat"
                style={{ padding: "10px 14px" }}
              >
                <summary className="t-label cursor-pointer">
                  SOURCE {source.ref} · {source.kind.toUpperCase()} — {source.title}
                </summary>
                <p
                  className="text-[15px] mt-2 whitespace-pre-wrap m-0"
                  style={{ lineHeight: 1.45 }}
                >
                  {source.content}
                </p>
                {source.attribution && (
                  <p className="t-micro mt-2 m-0" style={{ opacity: 0.55 }}>
                    {source.attribution}
                  </p>
                )}
              </details>
            ))}
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------------- script */}
      <label className="flex flex-col gap-2">
        <span className="t-micro flex flex-wrap gap-3" style={{ opacity: 0.6 }}>
          <span>YOUR ANSWER — MARKED AGAINST THE PUBLISHED RUBRIC</span>
          <span
            style={{
              color: short || long ? "var(--color-ink)" : undefined,
              background: short || long ? "var(--color-signal-red)" : undefined,
              padding: short || long ? "0 6px" : undefined,
            }}
          >
            {count} WORDS
            {question.minWords || question.maxWords
              ? ` · ASKED FOR ${question.minWords ?? 0}${question.maxWords ? `–${question.maxWords}` : "+"}`
              : ""}
          </span>
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={14}
          maxLength={12_000}
          placeholder="Write your answer here…"
          className="px-4 py-3 text-[16px]"
          style={{
            border: "2px solid var(--color-ink)",
            background: "var(--color-sheet)",
            boxShadow: "var(--shadow-swiss)",
            resize: "vertical",
            lineHeight: 1.5,
          }}
        />
      </label>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => void mark()}
          disabled={marking || count < floor}
          className="press-swiss t-label"
          style={{
            background: count >= floor ? "var(--color-ink)" : "var(--color-paper)",
            color: count >= floor ? "var(--color-canvas)" : "var(--color-ink)",
            border: "2px solid var(--color-ink)",
            boxShadow: "var(--shadow-swiss)",
            padding: "10px 18px",
            cursor: marking ? "wait" : count >= floor ? "pointer" : "not-allowed",
          }}
        >
          {marking ? "EXAMINER IS READING…" : "MARK MY ANSWER"}
        </button>
        {count < floor && (
          <span className="t-micro" style={{ opacity: 0.55 }}>
            AT LEAST {floor} WORDS BEFORE IT CAN BE MARKED
          </span>
        )}
      </div>

      {error && (
        <div
          className="p-3 t-label"
          style={{ border: "2px solid var(--color-ink)", background: "var(--color-signal-red)" }}
        >
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------ result */}
      {assessment && (
        <div className="rise flex flex-col gap-3">
          <div
            className="flex items-center justify-between gap-3 flex-wrap px-4 py-3"
            style={{ border: "3px solid var(--color-ink)", background: "var(--color-highlighter)" }}
          >
            <span className="t-label">
              {assessment.mode === "offline" ? "SELF-MARK GUIDE" : "EXAMINER'S MARK"}
            </span>
            {assessment.mode !== "offline" && (
              <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                {assessment.total}
                <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.6 }}>
                  /{assessment.max}
                </span>
              </span>
            )}
          </div>

          {question.sources?.length ? (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="t-micro" style={{ opacity: 0.6 }}>
                SOURCES USED
              </span>
              {question.sources.map((source) => {
                const used = assessment.sourcesUsed.includes(source.ref);
                return (
                  <span
                    key={source.ref}
                    className="t-micro px-2 py-1"
                    style={{
                      border: "2px solid var(--color-ink)",
                      background: used ? "var(--color-acid-lime)" : "transparent",
                      opacity: used ? 1 : 0.5,
                    }}
                  >
                    {source.ref} {used ? "✓" : "—"}
                  </span>
                );
              })}
            </div>
          ) : null}

          {assessment.criteria.map((criterion) => (
            <article key={criterion.id} className="swiss p-4">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <span className="t-label">{criterion.name}</span>
                <span className="t-mono text-[15px]">
                  {criterion.marked ? (
                    <>
                      <strong>{criterion.awarded}</strong>/{criterion.max}
                      {criterion.band && (
                        <span style={{ opacity: 0.55 }}> · band {criterion.band}</span>
                      )}
                    </>
                  ) : (
                    <span style={{ opacity: 0.55 }}>up to {criterion.max}</span>
                  )}
                </span>
              </div>

              {criterion.marked && (
                <div className="mt-2" style={{ height: 10, display: "flex" }}>
                  {Array.from({ length: criterion.max }, (_, i) => (
                    <div
                      key={i}
                      className="grow"
                      style={{
                        border: "1px solid var(--color-ink)",
                        borderLeftWidth: i === 0 ? 1 : 0,
                        background:
                          i < criterion.awarded ? "var(--color-ink)" : "transparent",
                      }}
                    />
                  ))}
                </div>
              )}

              <p className="text-[15px] mt-3 m-0" style={{ lineHeight: 1.45 }}>
                {criterion.reason}
              </p>

              {criterion.evidence && (
                <p
                  className="text-[14px] mt-2 m-0 px-3 py-2 whitespace-pre-wrap"
                  style={{
                    borderLeft: "3px solid var(--color-ink)",
                    background: "var(--color-study)",
                    lineHeight: 1.4,
                  }}
                >
                  {criterion.evidence}
                </p>
              )}

              {criterion.next && (
                <p className="text-[14px] mt-2 m-0" style={{ lineHeight: 1.4 }}>
                  <span
                    className="t-micro px-1.5 py-0.5 mr-1.5"
                    style={{ background: "var(--color-highlighter)" }}
                  >
                    UP ONE BAND
                  </span>
                  {criterion.next}
                </p>
              )}
            </article>
          ))}

          {assessment.summary && (
            <p
              className="text-[15px] p-4 m-0"
              style={{ border: "2px solid var(--color-ink)", lineHeight: 1.45 }}
            >
              {assessment.summary}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
