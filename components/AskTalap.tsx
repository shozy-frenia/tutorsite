"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/components/i18n/LocaleProvider";

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
  const t = useT();
  const chips = [t("ask.chip1"), t("ask.chip2"), t("ask.chip3"), t("ask.chip4")];
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
              payload?.error ?? t("ask.unreachable"),
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
          content: t("ask.offlineNote"),
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
        aria-label={t("ask.open")}
        className="ask"
      >
        <i aria-hidden="true" />
        {t("ask.open")} ↗
      </button>
    );
  }

  return (
    <aside
      role="dialog"
      aria-label={t("ask.open")}
      className="fixed z-50 flex flex-col rise"
      style={{
        right: "20px",
        bottom: "20px",
        width: "min(400px, calc(100vw - 40px))",
        height: "min(560px, calc(100vh - 40px))",
        background: "var(--color-cream-paper)",
        border: "1px solid var(--color-forest-ink)",
        borderRadius: "var(--radius-cards)",
        overflow: "hidden",
        boxShadow: "var(--shadow-lifted)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
        style={{
          background: "var(--color-whisper-gray)",
          borderBottom: "1px solid var(--color-pencil-gray)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="mono">{t("ask.open")}</span>
          {mode === "offline" && (
            <span className="tag tag--outline">{t("tutor.offline")}</span>
          )}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="btn btn--outline btn--sm"
          aria-label={t("common.close")}
        >
          {t("common.close")} ✕
        </button>
      </div>

      <div ref={logRef} className="grow overflow-y-auto p-3 flex flex-col gap-2.5">
        <p className="msg msg--ai">{t("ask.opening")}</p>

        {messages.map((message, i) => (
          <p
            key={i}
            className={`msg whitespace-pre-wrap ${
              message.role === "user" ? "msg--me" : "msg--ai"
            }`}
          >
            {renderText(message.content)}
          </p>
        ))}

        {busy && (
          <p className="msg msg--ai" aria-live="polite">
            <span className="typing">
              <i />
              <i />
              <i />
            </span>
          </p>
        )}

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => void ask(chip)}
                className="btn btn--quiet btn--sm"
                style={{ textAlign: "left" }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="shrink-0 p-3 flex gap-2"
        style={{ borderTop: "1px solid var(--color-pencil-gray)" }}
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
          placeholder={t("tutor.placeholder")}
          className="field grow"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="btn btn--primary btn--sm"
        >
          {t("tutor.send")}
        </button>
      </form>
    </aside>
  );
}
