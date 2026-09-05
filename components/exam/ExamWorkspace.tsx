"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Paper, Question } from "@/lib/exam-types";
import { isCorrect } from "@/lib/exam-types";
import {
  gradeForMark,
  marksToNextGrade,
  scaleToComponent,
} from "@/lib/grading";
import { boundariesFor, type Grade } from "@/data/grade-boundaries";
import { saveAttempt, type QuestionOutcome } from "@/lib/storage";
import TutorDrawer from "./TutorDrawer";
import ExtendedAnswer from "./ExtendedAnswer";
import CalculatorPanel from "./CalculatorPanel";
import GradeBadge from "@/components/GradeBadge";
import BrandMark from "@/components/BrandMark";

/**
 * The test sheet — Swiss bento register.
 *
 * Muted cream ground, white question sheets with 2px rules and a 3px offset,
 * everything angular. One question at a time with a numbered rail, because
 * that is how students actually navigate a paper: they skip, then come back.
 *
 * Scoring is live. Auto-marked questions resolve the moment the student hits
 * Check; worked questions are self-marked step by step against the real mark
 * scheme, which is both how the paper is graded and a skill worth drilling.
 */

interface Props {
  paper: Paper;
  availableMarks: number;
}

type AnswerState = Record<string, string>;
type ResultState = Record<string, { awarded: number; checked: boolean; selfMarked: boolean }>;

export default function ExamWorkspace({ paper, availableMarks }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [results, setResults] = useState<ResultState>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState(false);

  const startedAt = useRef(Date.now());
  const question = paper.questions[index];

  /* --------------------------------------------------------------- timer */
  useEffect(() => {
    if (submitted) return;
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [submitted]);

  const remaining = paper.durationMinutes * 60 - elapsed;
  const overtime = remaining < 0;

  /* ------------------------------------------------------------- scoring */
  const rawMark = useMemo(
    () => Object.values(results).reduce((sum, r) => sum + r.awarded, 0),
    [results]
  );

  const markedMarks = useMemo(
    () =>
      paper.questions
        .filter((q) => results[q.id]?.checked)
        .reduce((sum, q) => sum + q.marks, 0),
    [paper.questions, results]
  );

  const scaled = useMemo(
    () =>
      scaleToComponent(
        rawMark,
        availableMarks,
        paper.subjectId,
        paper.componentIndex,
        paper.gradeYear
      ),
    [rawMark, availableMarks, paper.subjectId, paper.componentIndex, paper.gradeYear]
  );

  const component = boundariesFor(paper.subjectId, paper.gradeYear)?.components[
    paper.componentIndex
  ];

  const grade: Grade = useMemo(() => {
    if (!component || !scaled) return "U";
    return gradeForMark(scaled.scaledMark, component);
  }, [component, scaled]);

  const next = useMemo(() => {
    if (!component || !scaled) return null;
    return marksToNextGrade(scaled.scaledMark, component);
  }, [component, scaled]);

  const answeredCount = paper.questions.filter((q) => (answers[q.id] ?? "").trim()).length;
  const checkedCount = Object.values(results).filter((r) => r.checked).length;

  /* ------------------------------------------------------------- actions */
  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const checkAuto = useCallback(
    (q: Question) => {
      const submittedAnswer = answers[q.id] ?? "";
      const correct = isCorrect(submittedAnswer, q);
      setResults((prev) => ({
        ...prev,
        [q.id]: { awarded: correct ? q.marks : 0, checked: true, selfMarked: false },
      }));
      setRevealed((prev) => ({ ...prev, [q.id]: true }));
    },
    [answers]
  );

  const setSelfMark = useCallback((q: Question, awarded: number) => {
    setResults((prev) => ({
      ...prev,
      [q.id]: { awarded, checked: true, selfMarked: true },
    }));
  }, []);

  const submit = useCallback(() => {
    setSubmitted(true);
    setDrawerOpen(false);

    const outcomes: QuestionOutcome[] = paper.questions.map((q) => {
      const result = results[q.id];
      return {
        questionId: q.id,
        number: q.number,
        topic: q.topic,
        marks: q.marks,
        awarded: result?.awarded ?? 0,
        correct: (result?.awarded ?? 0) === q.marks,
        selfMarked: result?.selfMarked ?? false,
      };
    });

    const finalScaled = scaleToComponent(
      rawMark,
      availableMarks,
      paper.subjectId,
      paper.componentIndex,
      paper.gradeYear
    );

    saveAttempt({
      id: `${paper.id}-${Date.now()}`,
      paperId: paper.id,
      paperTitle: `${paper.title} · ${paper.sitting}`,
      subjectId: paper.subjectId,
      componentIndex: paper.componentIndex,
      gradeYear: paper.gradeYear,
      finishedAt: new Date().toISOString(),
      rawMark,
      availableMarks,
      scaledMark: finalScaled?.scaledMark ?? 0,
      componentMax: finalScaled?.componentMax ?? 0,
      grade,
      durationSeconds: elapsed,
      outcomes,
    });
    setSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [paper, results, rawMark, availableMarks, grade, elapsed]);

  /* -------------------------------------------------------- keyboard nav */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (drawerOpen) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.key === "ArrowRight")
        setIndex((i) => Math.min(i + 1, paper.questions.length - 1));
      if (event.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, paper.questions.length]);

  if (submitted) {
    return (
      <Results
        paper={paper}
        availableMarks={availableMarks}
        rawMark={rawMark}
        scaledMark={scaled?.scaledMark ?? 0}
        componentMax={scaled?.componentMax ?? 0}
        grade={grade}
        elapsed={elapsed}
        results={results}
        saved={saved}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ---------------------------------------------------------- top bar */}
      <div className="exam-bar">
        <div className="flex items-center gap-3 min-w-0">
          {/* The square only — not a link. A route home sitting under the
              cursor mid-paper is a trap, and EXIT already offers the way out. */}
          <BrandMark height={20} iconOnly className="shrink-0" />
          <Link href="/library" className="mono no-underline exam-bar__exit">
            ↳ Exit
          </Link>
          <span className="body-sm truncate" style={{ fontWeight: 600 }}>
            {paper.title}
          </span>
          <span className="mono hidden md:inline exam-bar__meta">
            Grade {paper.gradeYear} · {paper.sitting} ·{" "}
            {paper.calculator ? "calculator" : "no calculator"}
          </span>
          <span
            className="mono hidden lg:inline shrink-0 exam-bar__flag"
            title={paper.provenanceNote}
          >
            {paper.provenance === "transcribed" ? "past paper" : "practice"}
          </span>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="text-right">
            <span className="mono block exam-bar__meta">
              {overtime ? "Overtime" : "Time left"}
            </span>
            <span
              className="mono t-mono"
              style={{
                color:
                  overtime || remaining < 600
                    ? "var(--color-highlighter-yellow)"
                    : "inherit",
              }}
            >
              {formatClock(Math.abs(remaining))}
            </span>
          </div>

          <div className="text-right">
            <span className="mono block exam-bar__meta">Marked</span>
            <span className="mono t-mono">
              {rawMark}/{markedMarks || 0}
            </span>
          </div>

          <GradeBadge grade={grade} size="sm" />

          <button onClick={submit} className="btn btn--yellow btn--sm">
            Submit
          </button>
        </div>
      </div>

      <div className="exam-grid">
        {/* -------------------------------------------------------- rail */}
        <nav className="qrail" aria-label="Question navigation">
          {paper.questions.map((q, i) => {
            const result = results[q.id];
            const answered = (answers[q.id] ?? "").trim().length > 0;
            const active = i === index;

            let background = "var(--color-cream-paper)";
            if (result?.checked) {
              background =
                result.awarded === q.marks
                  ? "var(--color-sticky-note-mint)"
                  : result.awarded > 0
                    ? "var(--color-highlighter-yellow)"
                    : "var(--color-bad-bg)";
            } else if (answered) {
              background = "var(--color-whisper-gray)";
            }

            return (
              <button
                key={q.id}
                onClick={() => setIndex(i)}
                aria-current={active}
                title={`Q${q.number} — ${q.topic}`}
                className="qrail__btn"
                style={{ background }}
              >
                {q.number}
              </button>
            );
          })}
        </nav>

        {/* ------------------------------------------------------- sheet */}
        <main className="exam-sheet">
          <QuestionSheet
            key={question.id}
            paperId={paper.id}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={(value) => setAnswer(question.id, value)}
            result={results[question.id]}
            revealed={revealed[question.id] ?? false}
            onReveal={() => setRevealed((prev) => ({ ...prev, [question.id]: true }))}
            onCheck={() => checkAuto(question)}
            onSelfMark={(awarded) => setSelfMark(question, awarded)}
            onAskTutor={() => setDrawerOpen(true)}
          />

          {/* On a phone this is the thumb bar: pinned to the bottom edge,
              where the hand already is. Pilot 14 and four others reported
              moving between questions from the top of the page as the single
              most awkward thing about the workspace on mobile. */}
          <div className="qnav thumbbar">
            <button
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={index === 0}
              className="btn btn--outline btn--sm"
            >
              ← Previous
            </button>

            <span className="mono muted qnav__count">
              {index + 1} / {paper.questions.length}
            </span>

            <button
              onClick={() =>
                setIndex((i) => Math.min(i + 1, paper.questions.length - 1))
              }
              disabled={index === paper.questions.length - 1}
              className="btn btn--outline btn--sm"
            >
              Next →
            </button>
          </div>
        </main>

        {/* ------------------------------------------------------- score */}
        <aside className="exam-aside">
          <div className="card card--plain flex flex-col gap-3">
            <span className="mono muted">Live score</span>

            <div className="flex items-end gap-2">
              <span className="stat-card__big">{rawMark}</span>
              <span className="mono pb-1">/ {availableMarks}</span>
            </div>

            {scaled && component && (
              <>
                <div className="pt-3" style={{ borderTop: "1px solid var(--color-pencil-gray)" }}>
                  <span className="t-micro block" style={{ opacity: 0.6 }}>
                    ON THE {component.name.toUpperCase()} SCALE
                  </span>
                  <span className="t-subheading t-mono">
                    {scaled.scaledMark}
                    <span className="t-label"> / {component.maxMark}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <GradeBadge grade={grade} size="lg" />
                  <div className="text-right">
                    {next ? (
                      <>
                        <span className="t-micro block" style={{ opacity: 0.6 }}>
                          TO {next.nextGrade}
                        </span>
                        <span className="t-subheading t-mono">+{next.marksNeeded}</span>
                      </>
                    ) : (
                      <span className="t-micro">TOP BAND</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="pt-3 flex flex-col gap-1" style={{ borderTop: "1px solid var(--color-pencil-gray)" }}>
              <Stat label="ANSWERED" value={`${answeredCount} / ${paper.questions.length}`} />
              <Stat label="MARKED" value={`${checkedCount} / ${paper.questions.length}`} />
              <Stat label="ELAPSED" value={formatClock(elapsed)} />
            </div>

            <p className="t-micro" style={{ opacity: 0.55, lineHeight: 1.4 }}>
              Marks scale from the {availableMarks} available here onto the official{" "}
              {component?.maxMark ?? "—"}-mark component scale before the grade is read.
            </p>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="btn btn--yellow btn--sm btn--block"
            style={{ marginTop: "var(--spacing-12)" }}
          >
            Ask the AI tutor
          </button>

          {/* The paper says whether a calculator is allowed; offering one on a
              non-calculator paper would train the wrong habit. */}
          {paper.calculator && (
            <div className="mt-3">
              <CalculatorPanel />
            </div>
          )}
        </aside>
      </div>

      <TutorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        paperId={paper.id}
        paperTitle={paper.title}
        question={question}
        studentAnswer={answers[question.id] ?? ""}
      />
    </div>
  );
}

/* ========================================================== question sheet */

interface SheetProps {
  paperId: string;
  question: Question;
  value: string;
  onChange: (value: string) => void;
  result?: { awarded: number; checked: boolean; selfMarked: boolean };
  revealed: boolean;
  onReveal: () => void;
  onCheck: () => void;
  onSelfMark: (awarded: number) => void;
  onAskTutor: () => void;
}

function QuestionSheet({
  paperId,
  question,
  value,
  onChange,
  result,
  revealed,
  onReveal,
  onCheck,
  onSelfMark,
  onAskTutor,
}: SheetProps) {
  const [steps, setSteps] = useState<boolean[]>(() =>
    question.markScheme.map(() => false)
  );

  const selfAwarded = question.markScheme.reduce(
    (sum, step, i) => sum + (steps[i] ? step.marks : 0),
    0
  );

  const correct = result?.checked && result.awarded === question.marks;
  const wrong = result?.checked && result.awarded === 0;

  return (
    <article className="card card--plain question-sheet rise">
      {/* header */}
      <div
        className="flex items-start justify-between gap-4 px-5 py-4"
        style={{ borderBottom: "1px solid var(--color-pencil-gray)" }}
      >
        <div className="flex items-baseline gap-3">
          <span className="question-sheet__number">{question.number}</span>
          <div>
            <span className="tag">{question.topic}</span>
            <span className="micro muted block mt-1">{question.difficulty}</span>
          </div>
        </div>
        <span className="tag tag--outline shrink-0">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>

      {/* body */}
      <div className="px-5 py-5 flex flex-col gap-4">
        <p className="text-[19px] m-0" style={{ lineHeight: 1.35 }}>
          {question.prompt}
        </p>

        {question.parts && (
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {question.parts.map((part, i) => (
              <li
                key={i}
                className="text-[17px] pl-4"
                style={{ borderLeft: "3px solid var(--color-highlighter)", lineHeight: 1.35 }}
              >
                {part}
              </li>
            ))}
          </ul>
        )}

        {question.figure && (
          <figure className="m-0">
            <div
              className="inline-block p-3"
              style={{ border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)", background: "var(--color-cream-paper)" }}
            >
              <Image
                src={question.figure}
                alt={question.figureAlt ?? "Question diagram"}
                width={420}
                height={280}
                style={{ height: "auto", width: "100%", maxWidth: 420 }}
                unoptimized
              />
            </div>
            <figcaption className="t-micro mt-1" style={{ opacity: 0.55 }}>
              FIGURE AS PRINTED ON THE PAPER
            </figcaption>
          </figure>
        )}

        {question.promptKk && (
          <details>
            <summary className="t-micro cursor-pointer" style={{ opacity: 0.6 }}>
              ↳ ORIGINAL (KAZAKH)
            </summary>
            <p className="text-[15px] mt-2 m-0" style={{ lineHeight: 1.35, opacity: 0.8 }}>
              {question.promptKk}
            </p>
          </details>
        )}
      </div>

      {/* answer zone */}
      {question.marking === "assessed" ? (
        <div
          style={{ borderTop: "1px solid var(--color-pencil-gray)", background: "var(--color-whisper-gray)" }}
        >
          <ExtendedAnswer
            paperId={paperId}
            question={question}
            value={value}
            onChange={onChange}
            onMarked={onSelfMark}
          />
          <div className="px-5 pb-5">
            <button
              onClick={onAskTutor}
              className="btn btn--yellow btn--sm"
            >
              Ask the tutor
            </button>
          </div>
        </div>
      ) : (
      <div
        className="px-5 py-5 flex flex-col gap-3"
        style={{ borderTop: "1px solid var(--color-pencil-gray)", background: "var(--color-whisper-gray)" }}
      >
        {question.marking === "auto" && question.answerKind === "choice" ? (
          <fieldset className="border-0 p-0 m-0 flex flex-col gap-2">
            <legend className="t-micro mb-2" style={{ opacity: 0.6 }}>
              YOUR ANSWER
            </legend>
            {question.options?.map((option) => {
              const selected = value === option;
              return (
                <label
                  key={option}
                  className="press-swiss flex items-center gap-3 px-4 py-3 cursor-pointer"
                  style={{
                    border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                    background: selected
                      ? "var(--color-highlighter-yellow)"
                      : "var(--color-cream-paper)",
                  }}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={selected}
                    onChange={() => onChange(option)}
                    disabled={result?.checked}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    style={{
                      width: 16,
                      height: 16,
                      border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                      background: selected ? "var(--color-ink)" : "transparent",
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-[17px]">{option}</span>
                </label>
              );
            })}
          </fieldset>
        ) : question.marking === "auto" ? (
          <label className="flex flex-col gap-2">
            <span className="t-micro" style={{ opacity: 0.6 }}>
              YOUR ANSWER {question.unit ? `(${question.unit})` : ""}
            </span>
            <input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              disabled={result?.checked}
              maxLength={220}
              placeholder="Type your answer…"
              className="px-4 py-3 text-[18px] t-mono"
              style={{
                border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                background: "var(--color-cream-paper)",
                              }}
            />
          </label>
        ) : (
          <label className="flex flex-col gap-2">
            <span className="t-micro" style={{ opacity: 0.6 }}>
              YOUR WORKING — YOU WILL MARK THIS AGAINST THE SCHEME
            </span>
            <textarea
              value={value}
              onChange={(event) => onChange(event.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Set out your working, one step per line…"
              className="px-4 py-3 text-[16px]"
              style={{
                border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                background: "var(--color-cream-paper)",
                                resize: "vertical",
                lineHeight: 1.4,
              }}
            />
          </label>
        )}

        <div className="flex flex-wrap gap-2">
          {question.marking === "auto" && !result?.checked && (
            <button
              onClick={onCheck}
              disabled={!value.trim()}
              className="btn btn--primary btn--sm"
            >
              Check answer
            </button>
          )}

          {question.marking === "worked" && !revealed && (
            <button
              onClick={onReveal}
              className="btn btn--primary btn--sm"
            >
              Reveal mark scheme
            </button>
          )}

          <button
              onClick={onAskTutor}
              className="btn btn--yellow btn--sm"
            >
              Ask the tutor
            </button>

        </div>

        <HintBlock hint={question.hint} />
      </div>
      )}

      {/* feedback */}
      {result?.checked && question.marking === "auto" && (
        <div
          className="px-5 py-4 rise"
          style={{
            borderTop: "1px solid var(--color-pencil-gray)",
            background: correct
              ? "var(--color-acid-lime)"
              : wrong
                ? "var(--color-signal-red)"
                : "var(--color-highlighter)",
          }}
        >
          <span className="t-label">
            {correct
              ? `CORRECT — ${question.marks} MARK${question.marks === 1 ? "" : "S"}`
              : "NOT THE ANSWER — 0 MARKS"}
          </span>
          {!correct && (
            <p className="text-[16px] mt-2 m-0">
              <strong>Answer:</strong> {question.answer}
            </p>
          )}
        </div>
      )}

      {/* mark scheme + self-marking */}
      {revealed && (
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid var(--color-pencil-gray)", background: "var(--color-cream-paper)" }}
        >
          <span className="t-micro" style={{ opacity: 0.6 }}>
            MARK SCHEME
            {question.marking === "worked" ? " — TICK WHAT YOUR WORKING EARNS" : ""}
          </span>

          <ul className="list-none p-0 mt-3 flex flex-col gap-2">
            {question.markScheme.map((step, i) => (
              <li key={i}>
                {question.marking === "worked" ? (
                  <label
                    className="flex items-start gap-3 px-3 py-2 cursor-pointer press-swiss"
                    style={{
                      border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                      background: steps[i] ? "var(--color-acid-lime)" : "var(--color-sheet)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={steps[i]}
                      onChange={() => {
                        const nextSteps = [...steps];
                        nextSteps[i] = !nextSteps[i];
                        setSteps(nextSteps);
                      }}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className="t-micro shrink-0 px-1.5 py-0.5"
                      style={{
                        border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                        background: steps[i] ? "var(--color-ink)" : "transparent",
                        color: steps[i] ? "var(--color-canvas)" : "var(--color-ink)",
                        minWidth: 24,
                        textAlign: "center",
                      }}
                    >
                      {step.marks}
                    </span>
                    <span className="text-[15px]" style={{ lineHeight: 1.35 }}>
                      {step.text}
                    </span>
                  </label>
                ) : (
                  <div className="flex items-start gap-3 px-3 py-2" style={{ border: "1px solid var(--color-pencil-gray)" }}>
                    <span
                      className="t-micro shrink-0 px-1.5 py-0.5"
                      style={{ background: "var(--color-highlighter)", minWidth: 24, textAlign: "center" }}
                    >
                      {step.marks}
                    </span>
                    <span className="text-[15px]" style={{ lineHeight: 1.35 }}>
                      {step.text}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <p className="text-[16px] mt-3 mb-0">
            <span
              className="t-micro px-1.5 py-0.5 mr-2"
              style={{ background: "var(--color-acid-lime)" }}
            >
              ANSWER
            </span>
            {question.answer}
          </p>

          {question.marking === "worked" && (
            <div className="flex items-center justify-between gap-3 mt-4 pt-3" style={{ borderTop: "1px solid var(--color-pencil-gray)" }}>
              <span className="t-label">
                SELF-MARK: {selfAwarded} / {question.marks}
              </span>
              <button
                onClick={() => onSelfMark(selfAwarded)}
                className="press-swiss t-label"
                style={{
                  background: result?.checked ? "var(--color-acid-lime)" : "var(--color-ink)",
                  color: result?.checked ? "var(--color-ink)" : "var(--color-canvas)",
                  border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                                    padding: "9px 16px",
                  cursor: "pointer",
                }}
              >
                {result?.checked ? `RECORDED — ${result.awarded}` : "RECORD MY MARKS"}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function HintBlock({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn btn--quiet btn--sm"
        >
          ↳ Show hint
        </button>
      ) : (
        <div
          className="p-3 rise"
          style={{ border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)", background: "var(--color-highlighter)" }}
        >
          <span className="t-micro block mb-1">HINT</span>
          <p className="text-[15px] m-0" style={{ lineHeight: 1.35 }}>
            {hint}
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================ results */

function Results({
  paper,
  availableMarks,
  rawMark,
  scaledMark,
  componentMax,
  grade,
  elapsed,
  results,
  saved,
}: {
  paper: Paper;
  availableMarks: number;
  rawMark: number;
  scaledMark: number;
  componentMax: number;
  grade: Grade;
  elapsed: number;
  results: ResultState;
  saved: boolean;
}) {
  const byTopic = useMemo(() => {
    const totals = new Map<string, { marks: number; awarded: number }>();
    for (const q of paper.questions) {
      const current = totals.get(q.topic) ?? { marks: 0, awarded: 0 };
      current.marks += q.marks;
      current.awarded += results[q.id]?.awarded ?? 0;
      totals.set(q.topic, current);
    }
    return [...totals.entries()]
      .map(([topic, v]) => ({ topic, ...v, percent: Math.round((v.awarded / v.marks) * 100) }))
      .sort((a, b) => a.percent - b.percent);
  }, [paper.questions, results]);

  const component = boundariesFor(paper.subjectId, paper.gradeYear)?.components[
    paper.componentIndex
  ];
  const next = component ? marksToNextGrade(scaledMark, component) : null;

  return (
    <div style={{ background: "var(--color-whisper-gray)", minHeight: "100vh" }} className="pb-16">
      <div
        className="px-4 md:px-10 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: "var(--color-ink)", color: "var(--color-canvas)" }}
      >
        <Link href="/library" className="t-label no-underline" style={{ color: "inherit" }}>
          ↳ MOCK PAPERS
        </Link>
        <Link href="/dashboard" className="t-label no-underline" style={{ color: "inherit" }}>
          DASHBOARD ↳
        </Link>
      </div>

      <div className="px-4 md:px-10 pt-8 max-w-[1100px]">
        <span className="mark t-label">PAPER COMPLETE</span>
        <h1 className="t-heading mt-4" style={{ maxWidth: "16ch" }}>
          {paper.title}
        </h1>

        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <div className="swiss p-5 flex flex-col justify-between md:col-span-1">
            <span className="t-micro" style={{ opacity: 0.6 }}>
              GRADE
            </span>
            <GradeBadge grade={grade} size="xl" />
            {next && (
              <span className="t-micro mt-2">
                +{next.marksNeeded} MARKS TO {next.nextGrade}
              </span>
            )}
          </div>

          <div className="swiss p-5 md:col-span-3 grid sm:grid-cols-3 gap-4">
            <Metric label="RAW MARK" value={`${rawMark}`} sub={`of ${availableMarks} available`} />
            <Metric
              label="SCALED"
              value={`${scaledMark}`}
              sub={`of ${componentMax} on ${component?.name ?? "the paper"}`}
            />
            <Metric label="TIME" value={formatClock(elapsed)} sub={`of ${paper.durationMinutes}:00 allowed`} />
          </div>
        </div>

        {/* topic breakdown */}
        <div className="swiss mt-4">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-pencil-gray)" }}>
            <h2 className="t-subheading">Where the marks went</h2>
          </div>
          <ul className="list-none p-0 m-0">
            {byTopic.map((row) => (
              <li
                key={row.topic}
                className="px-5 py-3 flex items-center gap-4"
                style={{ borderTop: "1px solid var(--color-pencil-gray)" }}
              >
                <span className="text-[16px] grow min-w-0 truncate">{row.topic}</span>
                <div
                  className="hidden sm:block shrink-0"
                  style={{ width: 180, height: 14, border: "1px solid var(--color-pencil-gray)" }}
                >
                  <div
                    style={{
                      width: `${row.percent}%`,
                      height: "100%",
                      background:
                        row.percent >= 70
                          ? "var(--color-acid-lime)"
                          : row.percent >= 40
                            ? "var(--color-highlighter)"
                            : "var(--color-signal-red)",
                    }}
                  />
                </div>
                <span className="t-label t-mono shrink-0" style={{ minWidth: 76, textAlign: "right" }}>
                  {row.awarded}/{row.marks} · {row.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* question list */}
        <div className="swiss mt-4">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-pencil-gray)" }}>
            <h2 className="t-subheading">Question by question</h2>
          </div>
          <ul className="list-none p-0 m-0">
            {paper.questions.map((q) => {
              const result = results[q.id];
              const awarded = result?.awarded ?? 0;
              return (
                <li
                  key={q.id}
                  className="px-5 py-3 flex items-start gap-3"
                  style={{ borderTop: "1px solid var(--color-pencil-gray)" }}
                >
                  <span
                    className="t-label shrink-0 px-2 py-1"
                    style={{
                      border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                      background:
                        awarded === q.marks
                          ? "var(--color-acid-lime)"
                          : awarded > 0
                            ? "var(--color-highlighter)"
                            : "var(--color-signal-red)",
                      minWidth: 44,
                      textAlign: "center",
                    }}
                  >
                    {awarded}/{q.marks}
                  </span>
                  <div className="min-w-0">
                    <span className="t-micro" style={{ opacity: 0.6 }}>
                      Q{q.number} · {q.topic}
                      {result?.selfMarked ? " · SELF-MARKED" : ""}
                    </span>
                    <p className="text-[15px] m-0 mt-0.5" style={{ lineHeight: 1.3 }}>
                      {q.prompt}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 mt-6 items-center">
          <Link
            href="/dashboard"
            className="no-underline press-swiss t-label"
            style={{
              background: "var(--color-highlighter)",
              border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                            padding: "12px 20px",
              color: "var(--color-ink)",
            }}
          >
            SEE IT ON THE DASHBOARD →
          </Link>
          <Link
            href="/library"
            className="no-underline press-swiss t-label"
            style={{
              background: "var(--color-cream-paper)",
              border: "1px solid var(--color-pencil-gray)", borderRadius: "var(--radius-md)",
                            padding: "12px 20px",
              color: "var(--color-ink)",
            }}
          >
            ANOTHER PAPER
          </Link>
          {saved && (
            <span className="t-micro" style={{ opacity: 0.6 }}>
              ✓ SAVED TO THIS DEVICE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================= bits */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="t-micro" style={{ opacity: 0.6 }}>
        {label}
      </span>
      <span className="t-label t-mono">{value}</span>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <span className="t-micro block" style={{ opacity: 0.6 }}>
        {label}
      </span>
      <span className="t-heading-sm t-mono block" style={{ lineHeight: 0.9 }}>
        {value}
      </span>
      <span className="t-micro block mt-1" style={{ opacity: 0.55 }}>
        {sub}
      </span>
    </div>
  );
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
