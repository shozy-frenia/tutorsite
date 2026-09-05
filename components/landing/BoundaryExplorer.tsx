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
    <>
      <div className="bt__controls" data-reveal>
        <div className="seg" role="group" aria-label="Grade year">
          {YEARS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setYear(value)}
              aria-pressed={year === value}
            >
              Grade {value}
            </button>
          ))}
        </div>

        <div className="seg" role="group" aria-label="Level">
          {(["subject", "component"] as View[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-pressed={view === value}
            >
              {value === "subject" ? "Subject level" : "By component"}
            </button>
          ))}
        </div>
      </div>

      <div className="bt__meta" data-reveal>
        <span className="tag tag--plain">{stage?.standard}</span>
        <span className="caption muted">{stage?.compulsory}</span>
        <span className="tag tag--outline">
          {rows.length} {view === "subject" ? "subjects" : "components"}
        </span>
      </div>

      <div className="bt__scroll" data-reveal>
        <table className="bt">
          <thead>
            <tr>
              <th>{view === "subject" ? "Subject" : "Subject · component"}</th>
              <th>Max</th>
              {COLUMNS.map((grade) => (
                <th key={grade}>{grade}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>
                  {row.subject}
                  {row.component && (
                    <span className="muted"> · {row.component}</span>
                  )}
                </td>
                <td className="cmax">{row.maxMark}</td>
                {COLUMNS.map((grade) => {
                  const band = row.bands.find((b) => b.grade === grade);
                  if (!band) {
                    return (
                      <td key={grade} className="cnone">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={grade} className={grade === "A*" ? "cA2" : undefined}>
                      {band.min}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="body-sm muted measure bt__note" data-reveal>
        A dash means the published table has no band there. A* is awarded at
        subject level in every year, but only Grade 12 component tables carry an
        A* band — Grade 10 and 11 components stop at A. The app grades whatever
        bands the table actually shows rather than assuming a fixed ladder.
      </p>
    </>
  );
}
