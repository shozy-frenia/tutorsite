import Link from "next/link";

/**
 * Tilted phone showing the tutor mid-conversation.
 *
 * Everything inside the bezel is real product surface — the same grade dial,
 * the same ASK TALAP panel, the same mark-scheme wording the workspace uses.
 * A mock that invents a screen the app cannot show would be a lie told in CSS.
 *
 * The tilt is a 3D transform on a wrapper, so the phone is one flat element
 * rotated in space rather than a stack of skewed pieces. It flattens out below
 * the md breakpoint, where a rotated 300px-wide phone stops being readable.
 */

const CONVERSATION = [
  {
    role: "student" as const,
    text: "Сколько нужно на A по математике?",
  },
  {
    role: "talap" as const,
    text: "В 10 классе математика — 160 баллов за два компонента. A начинается с 114/160 на уровне предмета, а на Компоненте 1 — с 56/80.",
  },
  {
    role: "student" as const,
    text: "I got 44. What am I missing?",
  },
  {
    role: "talap" as const,
    text: "44/80 is a C — 12 marks off a B. Your last two attempts both lost method marks on Circle Geometry. Start there.",
  },
];

export default function PhoneShowcase() {
  return (
    <section className="px-5 md:px-10 mt-12 md:mt-14">
      <div className="brutal overflow-hidden">
        <div
          className="px-5 py-4 border-b-[3px] flex items-center justify-between flex-wrap gap-3"
          style={{ borderColor: "var(--color-ink)" }}
        >
          <h2 className="t-subheading">It answers in the language you asked in</h2>
          <span className="mark t-micro">KAZAKH · RUSSIAN · ENGLISH</span>
        </div>

        <div
          className="grid md:grid-cols-2 gap-8 md:gap-10 px-5 md:px-10 py-10 items-center"
          style={{ background: "var(--color-study)" }}
        >
          {/* ------------------------------------------------------------ copy */}
          <div>
            <p className="t-heading-sm" style={{ lineHeight: 1.1 }}>
              A tutor that has read the mark scheme.
            </p>
            <p className="text-[16px] mt-4" style={{ lineHeight: 1.5, maxWidth: "46ch" }}>
              Ask it what a grade needs and it answers from the published
              boundary table, not a percentage it made up. Ask it about your
              working and it starts at the step you actually lost the mark on.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {[
                ["ON EVERY PAGE", "Ask Talap floats over the library and dashboard."],
                ["INSIDE A QUESTION", "The workspace drawer marks your working step by step."],
                ["WITHOUT A KEY", "It still answers, from the real tables in this repo."],
              ].map(([label, body]) => (
                <li key={label} className="flex flex-col gap-1">
                  <span className="mark t-micro" style={{ alignSelf: "flex-start" }}>
                    {label}
                  </span>
                  <span className="text-[15px]" style={{ lineHeight: 1.4 }}>
                    {body}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/library"
              className="pill pill-filled press no-underline mt-7 inline-block"
            >
              TRY IT ON A REAL PAPER →
            </Link>
          </div>

          {/* ----------------------------------------------------------- phone */}
          <div
            className="flex justify-center"
            style={{ perspective: "1400px" }}
            aria-hidden="true"
          >
            <div className="phone-tilt">
              <div
                className="relative"
                style={{
                  width: 300,
                  borderRadius: 38,
                  background: "var(--color-ink)",
                  padding: 10,
                  boxShadow: "18px 22px 0 rgba(21,21,21,0.28)",
                }}
              >
                {/* screen */}
                <div
                  className="relative overflow-hidden flex flex-col"
                  style={{
                    borderRadius: 30,
                    background: "var(--color-sheet)",
                    height: 590,
                  }}
                >
                  {/* notch */}
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 96,
                      height: 22,
                      borderRadius: 12,
                      background: "var(--color-ink)",
                      zIndex: 2,
                    }}
                  />

                  {/* app header */}
                  <div
                    className="flex items-center justify-between px-4 shrink-0"
                    style={{
                      paddingTop: 38,
                      paddingBottom: 10,
                      borderBottom: "2px solid var(--color-ink)",
                    }}
                  >
                    <span className="t-label">TALAP®</span>
                    <span className="t-micro" style={{ opacity: 0.55 }}>
                      GRADE 10 · KZ
                    </span>
                  </div>

                  {/* grade dial */}
                  <div
                    className="px-4 py-4 shrink-0"
                    style={{ borderBottom: "2px solid var(--color-ink)" }}
                  >
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <span className="t-micro" style={{ opacity: 0.55 }}>
                          MATHS · COMPONENT 1
                        </span>
                        <p
                          className="m-0"
                          style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}
                        >
                          44
                          <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.5 }}>
                            /80
                          </span>
                        </p>
                      </div>
                      <span
                        className="t-label"
                        style={{
                          background: "var(--color-highlighter)",
                          border: "2px solid var(--color-ink)",
                          padding: "6px 12px",
                        }}
                      >
                        GRADE C
                      </span>
                    </div>

                    {/* band ruler — real Grade 10 Maths Component 1 boundaries */}
                    <div className="mt-3 flex" style={{ height: 12 }}>
                      {[
                        ["E", 16],
                        ["D", 26],
                        ["C", 36],
                        ["B", 46],
                        ["A", 56],
                      ].map(([grade, min], i) => (
                        <div
                          key={grade as string}
                          className="grow"
                          style={{
                            border: "1px solid var(--color-ink)",
                            borderLeftWidth: i === 0 ? 1 : 0,
                            background:
                              (min as number) <= 44
                                ? "var(--color-ink)"
                                : "transparent",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {["16", "26", "36", "46", "56", "80"].map((mark) => (
                        <span key={mark} className="t-micro" style={{ opacity: 0.45 }}>
                          {mark}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* chat */}
                  <div className="grow overflow-hidden px-3 py-3 flex flex-col gap-2">
                    <span className="mark t-micro" style={{ alignSelf: "flex-start" }}>
                      ASK TALAP
                    </span>
                    {CONVERSATION.map((message, i) => (
                      <div
                        key={i}
                        style={{
                          border: "2px solid var(--color-ink)",
                          background:
                            message.role === "student"
                              ? "var(--color-highlighter)"
                              : "var(--color-sheet)",
                          alignSelf:
                            message.role === "student" ? "flex-end" : "flex-start",
                          maxWidth: "88%",
                          padding: "7px 9px",
                          fontSize: 11.5,
                          lineHeight: 1.35,
                        }}
                      >
                        {message.text}
                      </div>
                    ))}
                  </div>

                  {/* composer */}
                  <div
                    className="shrink-0 flex gap-2 px-3 py-3"
                    style={{ borderTop: "2px solid var(--color-ink)" }}
                  >
                    <div
                      className="grow t-micro flex items-center px-2"
                      style={{
                        border: "2px solid var(--color-ink)",
                        height: 30,
                        opacity: 0.45,
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      Ask about the exam…
                    </div>
                    <div
                      className="t-micro flex items-center px-3"
                      style={{
                        background: "var(--color-ink)",
                        color: "var(--color-canvas)",
                        height: 30,
                      }}
                    >
                      SEND
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
