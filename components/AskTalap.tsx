"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide study assistant.
 *
 * A floating panel on every page except the exam workspace, which has its own
 * question-bound tutor drawer — two chat surfaces on one screen would compete.
 *
 * The browser posts to /api/chat and never holds a key. When the route is
 * unreachable the widget says so plainly instead of inventing an answer: the
 * honest fallback lives on the server, built from the real boundary tables.
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHIPS = [
  "What do I sit in Grade 10?",
  "Сколько нужно на A по математике?",
  "How are the grade boundaries set?",
  "How should I revise for Paper 1?",
];

const OPENING =
  "I am the Talap study assistant. Ask me what you sit this year, what a grade actually needs, or anything on the syllabus — in Kazakh, Russian or English.";

/** Render **bold** spans; everything else stays plain text. */
function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
    chunk.startsWith("**") && chunk.endsWith("**") ? (
      <strong key={i}>{chunk.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{chunk}</span>
    )
  );
}

export default function AskTalap() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"live" | "offline" | null>(null);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The exam workspace has its own tutor; stay out of its way.
  if (pathname?.startsWith("/exam/")) return null;

  async function ask(text: string) {
    if (busy) return;

    const history: Message[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.reply) {
        setMessages([
          ...history,
          {
            role: "assistant",
            content:
              payload?.error ??
              "I could not reach the assistant just now. Try again in a moment.",
          },
        ]);
        return;
      }

      setMode(payload.mode === "offline" ? "offline" : "live");
      setMessages([...history, { role: "assistant", content: payload.reply }]);
    } catch {
      setMessages([
        ...history,
        {
          role: "assistant",
          content:
            "I could not reach the assistant — check your connection and try again. The mock papers and their mark schemes work offline.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open the study assistant"
        className="press t-label fixed z-40"
        style={{
          right: "20px",
          bottom: "20px",
          background: "var(--color-highlighter)",
          border: "3px solid var(--color-ink)",
          boxShadow: "var(--shadow-brutal-sm)",
          color: "var(--color-ink)",
          padding: "12px 18px",
          cursor: "pointer",
        }}
      >
        ASK TALAP ↗
      </button>
    );
  }

  return (
    <aside
      role="dialog"
      aria-label="Talap study assistant"
      className="fixed z-50 flex flex-col rise"
      style={{
        right: "20px",
        bottom: "20px",
        width: "min(400px, calc(100vw - 40px))",
        height: "min(560px, calc(100vh - 40px))",
        background: "var(--color-sheet)",
        border: "3px solid var(--color-ink)",
        boxShadow: "var(--shadow-brutal)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
        style={{ background: "var(--color-ink)", borderBottom: "3px solid var(--color-ink)" }}
      >
        <div className="flex items-center gap-2">
          <span className="mark t-micro">ASK TALAP</span>
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
          onClick={() => setOpen(false)}
          className="t-label"
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

      <div ref={logRef} className="grow overflow-y-auto p-3 flex flex-col gap-2.5">
        <div className="swiss-flat p-3">
          <p className="text-[14px] m-0" style={{ lineHeight: 1.4 }}>
            {OPENING}
          </p>
        </div>

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
              {message.role === "user" ? "YOU" : "TALAP"}
            </span>
            <p className="text-[14px] whitespace-pre-wrap m-0" style={{ lineHeight: 1.45 }}>
              {renderText(message.content)}
            </p>
          </div>
        ))}

        {busy && <span className="t-micro blink">THINKING…</span>}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => void ask(chip)}
                className="t-micro press-swiss text-left"
                style={{
                  border: "2px solid var(--color-ink)",
                  background: "var(--color-study)",
                  padding: "6px 10px",
                  cursor: "pointer",
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

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
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={600}
          placeholder="Ask about the exam…"
          className="grow px-3 py-2 text-[14px]"
          style={{ border: "2px solid var(--color-ink)", background: "var(--color-sheet)" }}
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="press-swiss t-label px-4"
          style={{
            background: busy ? "var(--color-paper)" : "var(--color-ink)",
            color: "var(--color-canvas)",
            border: "2px solid var(--color-ink)",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          SEND
        </button>
      </form>
    </aside>
  );
}
