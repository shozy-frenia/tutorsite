"use client";

import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/exam-types";
import type { GeneratedQuestion } from "@/lib/offline-variants";

/**
 * Slide-over AI tutor panel.
 *
 * Two modes on one surface:
 *   Explain  — streams a reply that starts from the step the student missed.
 *   Practise — asks for a new question at the same topic and mark tariff.
 *
 * Chat bubbles are flat with hard borders; formulas and hints get solid
 * highlight badges rather than coloured text, per the design system.
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  paperId: string;
  paperTitle: string;
  question: Question | null;
  studentAnswer: string;
}

type Tab = "explain" | "practise";

export default function TutorDrawer({
  open,
  onClose,
  paperId,
  paperTitle,
  question,
  studentAnswer,
}: Props) {
  const [tab, setTab] = useState<Tab>("explain");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"live" | "offline" | null>(null);

  const [variant, setVariant] = useState<GeneratedQuestion | null>(null);
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantAnswerShown, setVariantAnswerShown] = useState(false);
  const [variantWarning, setVariantWarning] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Reset the conversation whenever the drawer moves to a different question.
  useEffect(() => {
    setMessages([]);
    setVariant(null);
    setVariantAnswerShown(false);
    setVariantWarning(null);
    setError(null);
  }, [question?.id]);

  // Close on Escape, and stop any in-flight stream when the drawer closes.
  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(followUp?: string) {
    if (!question || streaming) return;

    const history: Message[] = followUp
      ? [...messages, { role: "user" as const, content: followUp }]
      : [];

    if (followUp) setMessages(history);
    setStreaming(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          paperId,
          questionId: question.id,
          studentAnswer,
          ...(followUp ? { messages: history } : {}),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "Request failed." }));
        setError(payload.error ?? "Request failed.");
        setStreaming(false);
        return;
      }

      setMode(response.headers.get("X-Tutor-Mode") === "offline" ? "offline" : "live");

      const reader = response.body?.getReader();
      if (!reader) {
        setError("No response body.");
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let assembled = "";
      setMessages([...history, { role: "assistant", content: "" }]);

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        assembled += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: assembled }]);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Could not reach the tutor. Check your connection.");
      }
    } finally {
      setStreaming(false);
    }
  }

  async function generate() {
    if (!question || variantLoading) return;
    setVariantLoading(true);
    setVariant(null);
    setVariantAnswerShown(false);
    setVariantWarning(null);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId, questionId: question.id }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Could not generate a question.");
        return;
      }

      setVariant(payload.question);
      setMode(payload.mode === "offline" ? "offline" : "live");
      if (payload.marksConsistent === false) {
        setVariantWarning(
          `The generated mark scheme totals ${payload.schemeTotal}, not ${question.marks}. Treat the step marks as approximate.`
        );
      }
    } catch {
      setError("Could not reach the generator.");
    } finally {
      setVariantLoading(false);
    }
  }

  if (!open || !question) return null;

  return (
    <>
      <button
        aria-label="Close tutor"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
        style={{ background: "rgba(21,21,21,0.35)", border: 0 }}
      />

      <aside
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col drawer-in"
        style={{
          width: "min(520px, 100vw)",
          background: "var(--color-sheet)",
          borderLeft: "3px solid var(--color-ink)",
        }}
        role="dialog"
        aria-label="AI tutor"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: "2px solid var(--color-ink)", background: "var(--color-ink)" }}
        >
          <div className="flex items-center gap-2">
            <span className="mark t-micro">AI TUTOR</span>
            {mode === "offline" && (
              <span
                className="t-micro px-2 py-1"
                style={{ border: "1px solid var(--color-canvas)", color: "var(--color-canvas)" }}
              >
                OFFLINE
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="t-label press-swiss"
            style={{
              background: "transparent",
              border: "2px solid var(--color-canvas)",
              color: "var(--color-canvas)",
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            CLOSE ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 shrink-0" style={{ borderBottom: "2px solid var(--color-ink)" }}>
          {(["explain", "practise"] as Tab[]).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className="t-label py-3"
              style={{
                background: tab === value ? "var(--color-highlighter)" : "var(--color-sheet)",
                border: 0,
                borderRight: value === "explain" ? "2px solid var(--color-ink)" : undefined,
                cursor: "pointer",
                color: "var(--color-ink)",
              }}
            >
              {value === "explain" ? "EXPLAIN THIS" : "GIVE ME ANOTHER"}
            </button>
          ))}
        </div>

        {/* Question context strip */}
        <div
          className="px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--color-ink)", background: "var(--color-study)" }}
        >
          <span className="t-micro" style={{ opacity: 0.65 }}>
            Q{question.number} · {question.topic} · {question.marks} MARK
            {question.marks === 1 ? "" : "S"}
          </span>
          <p className="text-[14px] mt-1" style={{ lineHeight: 1.35 }}>
            {question.prompt}
          </p>
        </div>

        {/* Body */}
        {tab === "explain" ? (
          <>
            <div ref={logRef} className="grow overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && !streaming && (
                <div className="swiss-flat p-4">
                  <p className="text-[15px]" style={{ lineHeight: 1.35 }}>
                    Ask for the step you are stuck on. The tutor starts from where your
                    working diverges — it will not just hand you the answer.
                  </p>
                  <button
                    onClick={() => ask()}
                    className="press-swiss mt-3"
                    style={{
                      background: "var(--color-highlighter)",
                      border: "2px solid var(--color-ink)",
                      boxShadow: "var(--shadow-swiss)",
                      padding: "10px 16px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {studentAnswer.trim() ? "Mark my working" : "Get me started"}
                  </button>
                </div>
              )}

              {messages.map((message, i) => (
                <div
                  key={i}
                  className="p-3"
                  style={{
                    border: "2px solid var(--color-ink)",
                    background:
                      message.role === "user" ? "var(--color-highlighter)" : "var(--color-sheet)",
                    alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "94%",
                  }}
                >
                  <span className="t-micro block mb-1" style={{ opacity: 0.6 }}>
                    {message.role === "user" ? "YOU" : "TUTOR"}
                  </span>
                  <p
                    className="text-[15px] whitespace-pre-wrap m-0"
                    style={{ lineHeight: 1.4 }}
                  >
                    {message.content}
                    {streaming && i === messages.length - 1 && message.role === "assistant" && (
                      <span className="blink">▍</span>
                    )}
                  </p>
                </div>
              ))}

              {streaming && messages.length === 0 && (
                <span className="t-micro blink">TUTOR IS THINKING…</span>
              )}

              {error && (
                <div
                  className="p-3 t-label"
                  style={{ border: "2px solid var(--color-ink)", background: "var(--color-signal-red)" }}
                >
                  {error}
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              className="shrink-0 p-3 flex gap-2"
              style={{ borderTop: "2px solid var(--color-ink)" }}
              onSubmit={(event) => {
                event.preventDefault();
                const text = draft.trim();
                if (!text) return;
                setDraft("");
                void ask(text);
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={600}
                placeholder="Ask a follow-up…"
                className="grow px-3 py-2 text-[15px]"
                style={{ border: "2px solid var(--color-ink)", background: "var(--color-sheet)" }}
              />
              <button
                type="submit"
                disabled={streaming || !draft.trim()}
                className="press-swiss t-label px-4"
                style={{
                  background: streaming ? "var(--color-paper)" : "var(--color-ink)",
                  color: "var(--color-canvas)",
                  border: "2px solid var(--color-ink)",
                  cursor: streaming ? "wait" : "pointer",
                }}
              >
                SEND
              </button>
            </form>
          </>
        ) : (
          <div className="grow overflow-y-auto p-4 flex flex-col gap-3">
            <div className="swiss-flat p-4">
              <p className="text-[15px] m-0" style={{ lineHeight: 1.35 }}>
                Get a new question on <strong>{question.topic}</strong> worth exactly{" "}
                <strong>{question.marks} marks</strong> — same syllabus content, same number
                of reasoning steps, different numbers.
              </p>
              <button
                onClick={() => void generate()}
                disabled={variantLoading}
                className="press-swiss mt-3"
                style={{
                  background: "var(--color-highlighter)",
                  border: "2px solid var(--color-ink)",
                  boxShadow: "var(--shadow-swiss)",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: variantLoading ? "wait" : "pointer",
                }}
              >
                {variantLoading ? "Writing a question…" : "Generate a question →"}
              </button>
            </div>

            {variantWarning && (
              <div
                className="p-3 text-[14px]"
                style={{ border: "2px solid var(--color-ink)", background: "var(--color-highlighter)" }}
              >
                {variantWarning}
              </div>
            )}

            {variant && (
              <article className="swiss p-4 rise">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="mark t-micro">{variant.topic}</span>
                  <span className="t-micro">[{variant.marks}]</span>
                </div>
                <p className="text-[16px]" style={{ lineHeight: 1.35 }}>
                  {variant.prompt}
                </p>

                <details
                  className="mt-3 pt-3"
                  style={{ borderTop: "1px solid var(--color-ink)" }}
                >
                  <summary className="t-label cursor-pointer">↳ HINT</summary>
                  <p className="text-[15px] mt-2" style={{ lineHeight: 1.35 }}>
                    {variant.hint}
                  </p>
                </details>

                {!variantAnswerShown ? (
                  <button
                    onClick={() => setVariantAnswerShown(true)}
                    className="press-swiss mt-3 t-label"
                    style={{
                      background: "var(--color-sheet)",
                      border: "2px solid var(--color-ink)",
                      boxShadow: "var(--shadow-swiss)",
                      padding: "8px 14px",
                      cursor: "pointer",
                    }}
                  >
                    REVEAL MARK SCHEME
                  </button>
                ) : (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--color-ink)" }}>
                    <span className="t-micro" style={{ opacity: 0.6 }}>
                      MARK SCHEME
                    </span>
                    <ol className="mt-2 pl-5 flex flex-col gap-1.5">
                      {variant.markScheme.map((step, i) => (
                        <li key={i} className="text-[14px]" style={{ lineHeight: 1.35 }}>
                          <span
                            className="t-micro px-1.5 py-0.5 mr-1.5"
                            style={{ background: "var(--color-highlighter)" }}
                          >
                            {step.marks}
                          </span>
                          {step.text}
                        </li>
                      ))}
                    </ol>
                    <p className="text-[15px] mt-3 m-0">
                      <span
                        className="t-micro px-1.5 py-0.5 mr-1.5"
                        style={{ background: "var(--color-acid-lime)" }}
                      >
                        ANSWER
                      </span>
                      {variant.answer}
                    </p>
                  </div>
                )}
              </article>
            )}

            {error && (
              <div
                className="p-3 t-label"
                style={{ border: "2px solid var(--color-ink)", background: "var(--color-signal-red)" }}
              >
                {error}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
