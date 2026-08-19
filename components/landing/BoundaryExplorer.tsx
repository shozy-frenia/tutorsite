"use client";

import { useState } from "react";
import {
  BOUNDARIES_BY_YEAR,
  GRADE_ORDER,
  type Grade,
  type GradeYear,
} from "@/data/grade-boundaries";
import { stageFor } from "@/data/curriculum";

/**
 * The published boundary tables, switchable by grade year.
 *
 * Three years, three genuinely different tables — that is the whole point of
 * showing them side by side. Grade 10 Mathematics is 160 across two
 * components; Grade 12 Mathematics is 230 across three plus a combined
 * "Components 1 & 3" row; Grade 11 examines two subjects and nothing else.
 *
 * Both views are shown for a reason. The subject-level table is the grade a
 * student is awarded; the component table is the paper they actually sit, and
 * a paper is graded on its own scale — Computer Science Component 2 is out of
 * 60, not out of the subject's 150.
 */

const COLUMNS: Grade[] = [...GRADE_ORDER].reverse();
const YEARS: GradeYear[] = [10, 11, 12];

type View = "subject" | "component";

export default function BoundaryExplorer() {
  const [year, setYear] = useState<GradeYear>(10);
  const [view, setView] = useState<View>("subject");

  const table = BOUNDARIES_BY_YEAR[year];
  const stage = stageFor(year);

  // One flat row per component, carrying the subject it belongs to so a row
  // reads "Computer Science · Component 2" rather than an orphan "Component 2".
  const componentRows = table.flatMap((subject) =>
    subject.components.map((component) => ({
      key: `${subject.id}-${component.name}`,
      subject: subject.name,
      component: component.name,
      maxMark: component.maxMark,
      bands: component.bands,
    }))
  );

  const rows =
    view === "subject"
      ? table.map((subject) => ({
          key: subject.id,
          subject: subject.name,
          component: null as string | null,
          maxMark: subject.subject.maxMark,
          bands: subject.subject.bands,
        }))
      : componentRows;

  return (
    <div className="brutal">
      <div
        className="px-5 py-4 border-b-[3px] flex items-center justify-between flex-wrap gap-3"
        style={{ borderColor: "var(--color-ink)" }}
      >
        <h2 className="t-subheading">The boundaries we grade against</h2>
        <span className="mark t-micro">MINIMUM MARK PER GRADE</span>
      </div>

      {/* Year switch */}
      <div
        className="px-5 py-4 border-b-[3px] flex flex-wrap items-center gap-3"
        style={{ borderColor: "var(--color-ink)", background: "var(--color-paper)" }}
      >
        <div className="flex flex-wrap gap-2">
          {YEARS.map((value) => (
            <button
              key={value}
              onClick={() => setYear(value)}
              aria-pressed={year === value}
              className="press t-label"
              style={{
                background:
                  year === value ? "var(--color-ink)" : "var(--color-canvas)",
                color:
                  year === value ? "var(--color-canvas)" : "var(--color-ink)",
                border: "3px solid var(--color-ink)",
                boxShadow: year === value ? "none" : "var(--shadow-brutal-sm)",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              GRADE {value}
            </button>
          ))}
        </div>

        <div className="flex gap-2 md:ml-auto">
          {(["subject", "component"] as View[]).map((value) => (
            <button
              key={value}
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className="t-micro"
              style={{
                background:
                  view === value ? "var(--color-highlighter)" : "transparent",
                border: "2px solid var(--color-ink)",
                padding: "6px 12px",
                cursor: "pointer",
                color: "var(--color-ink)",
              }}
            >
              {value === "subject" ? "SUBJECT LEVEL" : "BY COMPONENT"}
            </button>
          ))}
        </div>
      </div>

      {/* What this year actually is */}
      <div
        className="px-5 py-3 border-b-[3px] flex flex-wrap gap-x-6 gap-y-1"
        style={{ borderColor: "var(--color-ink)" }}
      >
        <span className="t-micro" style={{ opacity: 0.65 }}>
          {stage?.standard}
        </span>
        <span className="t-micro" style={{ opacity: 0.65 }}>
          {stage?.compulsory}
        </span>
        <span className="t-micro" style={{ opacity: 0.65 }}>
          {rows.length} {view === "subject" ? "SUBJECTS" : "COMPONENTS"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse t-mono" style={{ minWidth: 700 }}>
          <thead>
            <tr style={{ background: "var(--color-ink)" }}>
              {[view === "subject" ? "SUBJECT" : "SUBJECT · COMPONENT", "MAX", ...COLUMNS].map(
                (head, i) => (
                  <th
                    key={head}
                    className="t-micro px-3 py-2"
                    style={{
                      color: "var(--color-canvas)",
                      textAlign: i === 0 ? "left" : "right",
                    }}
                  >
                    {head}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.key}
                style={{
                  background: i % 2 ? "var(--color-paper)" : "transparent",
                  borderTop: "1px solid var(--color-ink)",
                }}
              >
                <td className="px-3 py-2 text-[14px]">
                  <span style={{ fontWeight: 700 }}>{row.subject}</span>
                  {row.component && (
                    <span style={{ opacity: 0.6 }}> · {row.component}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-[14px] text-right">{row.maxMark}</td>
                {COLUMNS.map((grade) => {
                  const band = row.bands.find((b) => b.grade === grade);
                  return (
                    <td
                      key={grade}
                      className="px-3 py-2 text-[14px] text-right"
                      style={
                        grade === "A*" && band
                          ? { background: "var(--color-highlighter)", fontWeight: 700 }
                          : undefined
                      }
                    >
                      {band ? band.min : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="px-5 py-3 text-[13px] m-0"
        style={{ borderTop: "3px solid var(--color-ink)", lineHeight: 1.45 }}
      >
        A dash means the published table has no band there. A* is awarded at
        subject level in every year, but only Grade 12 component tables carry an
        A* band — Grade 10 and 11 components stop at A. The app grades whatever
        bands the table actually shows rather than assuming a fixed ladder.
      </p>
    </div>
  );
}
