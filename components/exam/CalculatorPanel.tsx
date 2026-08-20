"use client";

import { useEffect, useRef, useState } from "react";
import { evaluate, formatResult, toThreeSigFigs, type AngleMode } from "@/lib/calculator";

/**
 * On-screen scientific calculator, for the papers that permit one.
 *
 * Mathematics Component 2 lists a calculator among its additional materials,
 * and its rubric asks for inexact answers to 3 significant figures and angles
 * to 0.1° — so the panel shows the 3 s.f. rounding next to the full value
 * rather than leaving a candidate to copy sixteen digits the mark scheme does
 * not want.
 *
 * It takes a whole expression rather than one keypress at a time, because that
 * is how a scientific calculator is actually used on this paper: `acos(11/
 * sqrt(143))` is one keying, not nine.
 *
 * The panel only mounts on papers where `Paper.calculator` is true. Offering
 * one on a non-calculator paper would be training the wrong habit.
 */

interface Entry {
  expression: string;
  result: string;
}

const KEYS: Array<Array<{ label: string; insert?: string; action?: "clear" | "back" | "equals" }>> =
  [
    [
      { label: "sin", insert: "sin(" },
      { label: "cos", insert: "cos(" },
      { label: "tan", insert: "tan(" },
      { label: "AC", action: "clear" },
      { label: "⌫", action: "back" },
    ],
    [
      { label: "sin⁻¹", insert: "asin(" },
      { label: "cos⁻¹", insert: "acos(" },
      { label: "tan⁻¹", insert: "atan(" },
      { label: "(", insert: "(" },
      { label: ")", insert: ")" },
    ],
    [
      { label: "√", insert: "sqrt(" },
      { label: "x²", insert: "^2" },
      { label: "xʸ", insert: "^" },
      { label: "π", insert: "pi" },
      { label: "÷", insert: "/" },
    ],
    [
      { label: "7", insert: "7" },
      { label: "8", insert: "8" },
      { label: "9", insert: "9" },
      { label: "ln", insert: "ln(" },
      { label: "×", insert: "*" },
    ],
    [
      { label: "4", insert: "4" },
      { label: "5", insert: "5" },
      { label: "6", insert: "6" },
      { label: "log", insert: "log(" },
      { label: "−", insert: "-" },
    ],
    [
      { label: "1", insert: "1" },
      { label: "2", insert: "2" },
      { label: "3", insert: "3" },
      { label: "e", insert: "e" },
      { label: "+", insert: "+" },
    ],
    [
      { label: "0", insert: "0" },
      { label: ".", insert: "." },
      { label: "|x|", insert: "abs(" },
      { label: "Ans", insert: "ANS" },
      { label: "=", action: "equals" },
    ],
  ];

export default function CalculatorPanel() {
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const [mode, setMode] = useState<AngleMode>("deg");
  const [answer, setAnswer] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Live preview of whatever is typed, so a slip is visible before "=".
  const substituted = answer === null ? expression : expression.replaceAll("ANS", `(${answer})`);
  const preview = evaluate(substituted, mode);

  function press(key: { insert?: string; action?: "clear" | "back" | "equals" }) {
    if (key.action === "clear") {
      setExpression("");
      return;
    }
    if (key.action === "back") {
      setExpression((value) => value.slice(0, -1));
      return;
    }
    if (key.action === "equals") {
      commit();
      return;
    }
    if (key.insert) setExpression((value) => value + key.insert);
    inputRef.current?.focus();
  }

  function commit() {
    if (!expression.trim() || preview.value === null) return;
    setHistory((entries) =>
      [{ expression, result: formatResult(preview.value as number) }, ...entries].slice(0, 8)
    );
    setAnswer(preview.value);
    setExpression("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="press-swiss t-label"
        style={{
          background: "var(--color-sheet)",
          border: "2px solid var(--color-ink)",
          boxShadow: "var(--shadow-swiss)",
          padding: "10px 18px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        CALCULATOR ⌗
      </button>
    );
  }

  return (
    <div style={{ border: "3px solid var(--color-ink)", background: "var(--color-sheet)" }}>
      <div
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{ background: "var(--color-ink)" }}
      >
        <span className="mark t-micro">CALCULATOR</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode((value) => (value === "deg" ? "rad" : "deg"))}
            className="t-micro"
            style={{
              background: "var(--color-highlighter)",
              border: "1px solid var(--color-ink)",
              padding: "3px 8px",
              cursor: "pointer",
              color: "var(--color-ink)",
            }}
            title="Switch between degrees and radians"
          >
            {mode.toUpperCase()}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="t-micro"
            style={{
              background: "transparent",
              border: "1px solid var(--color-canvas)",
              color: "var(--color-canvas)",
              padding: "3px 8px",
              cursor: "pointer",
            }}
          >
            HIDE ✕
          </button>
        </div>
      </div>

      {/* display */}
      <div className="px-3 py-2" style={{ borderBottom: "2px solid var(--color-ink)" }}>
        <input
          ref={inputRef}
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          placeholder="type or tap — e.g. acos(11/sqrt(143))"
          spellCheck={false}
          className="w-full px-2 py-2 t-mono text-[16px]"
          style={{ border: "2px solid var(--color-ink)", background: "var(--color-canvas)" }}
        />

        <div className="mt-2 flex items-baseline justify-between gap-3 min-h-[26px]">
          {preview.error ? (
            <span className="t-micro" style={{ color: "var(--color-ink)", opacity: 0.6 }}>
              {expression.trim() ? preview.error.toUpperCase() : ""}
            </span>
          ) : preview.value !== null ? (
            <>
              <span className="t-mono text-[19px]" style={{ fontWeight: 700 }}>
                = {formatResult(preview.value)}
              </span>
              <span className="t-micro" style={{ opacity: 0.6 }}>
                3 S.F. {toThreeSigFigs(preview.value)}
              </span>
            </>
          ) : (
            <span className="t-micro" style={{ opacity: 0.4 }}>
              {mode === "deg" ? "ANGLES IN DEGREES" : "ANGLES IN RADIANS"}
            </span>
          )}
        </div>
      </div>

      {/* keys */}
      <div className="p-2 flex flex-col gap-1">
        {KEYS.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1">
            {row.map((key) => (
              <button
                key={key.label}
                onClick={() => press(key)}
                className="t-mono"
                style={{
                  border: "2px solid var(--color-ink)",
                  background:
                    key.action === "equals"
                      ? "var(--color-highlighter)"
                      : key.action
                        ? "var(--color-paper)"
                        : "var(--color-canvas)",
                  padding: "9px 0",
                  fontSize: 14,
                  fontWeight: key.action === "equals" ? 700 : 500,
                  cursor: "pointer",
                }}
              >
                {key.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div
          className="px-3 py-2 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--color-ink)", background: "var(--color-study)" }}
        >
          <span className="t-micro" style={{ opacity: 0.55 }}>
            HISTORY · ANS = {answer === null ? "—" : formatResult(answer)}
          </span>
          {history.map((entry, i) => (
            <button
              key={i}
              onClick={() => setExpression(entry.expression)}
              className="t-mono text-[12px] text-left"
              style={{
                background: "transparent",
                border: 0,
                padding: 0,
                cursor: "pointer",
                opacity: i === 0 ? 1 : 0.6,
              }}
              title="Put this expression back in the display"
            >
              {entry.expression} = {entry.result}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
