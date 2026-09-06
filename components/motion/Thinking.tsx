"use client";

/**
 * What the tutor shows while it is composing an answer.
 *
 * "ИИ отвечал долго или не ответил" was the single most-reported fault in the
 * pilot — five of twenty-six — and part of it is genuinely latency, but part
 * of it is that the previous indicator was the word THINKING… under a hard
 * two-step blink. A hard blink reads as a fault light, not as work in
 * progress, so a slow answer and a broken one looked identical. Two students
 * reported the tutor as broken and separately said it explained things well,
 * which is what that confusion looks like in a survey.
 *
 * Three dots travelling in sequence is the convention for a reason: it is
 * continuous, so it cannot be mistaken for something switching on and off.
 *
 * `slow` is not decoration. Past about six seconds the honest thing is to say
 * so, because a student who knows the wait is expected will give it another
 * few seconds, and one who does not will reload and lose the request.
 */
export default function Thinking({
  label = "Tutor is thinking",
  slow = false,
  slowNote,
}: {
  label?: string;
  slow?: boolean;
  slowNote?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5" role="status" aria-live="polite">
      <span className="flex items-center gap-2">
        <span className="thinking-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="t-micro" style={{ color: "var(--color-muted)" }}>
          {label}
        </span>
      </span>
      {slow && slowNote && (
        <span
          className="text-[13px]"
          style={{ color: "var(--color-muted)", lineHeight: 1.4 }}
        >
          {slowNote}
        </span>
      )}
    </div>
  );
}
