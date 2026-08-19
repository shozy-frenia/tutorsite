import { GRADE_STAGES, SUBJECTS, type Subject } from "@/data/curriculum";
import { BOUNDARIES_BY_YEAR, type GradeYear, type SubjectBoundaries } from "@/data/grade-boundaries";
import { PAPERS } from "@/data/exams";
import { paperMarkTotal } from "@/lib/exam-types";

/**
 * Offline answers for the site assistant.
 *
 * With no model key configured, /api/chat still answers — but only from data
 * this repository actually holds: the published boundary tables, the
 * curriculum and the seeded papers. Nothing here is generated prose about the
 * exam, so an offline answer can be trusted the same way the library can.
 *
 * Anything it cannot answer is declined honestly rather than guessed at.
 */

/** Extra spellings students actually type, beyond the subject names themselves. */
const ALIASES: Record<string, string[]> = {
  mathematics: ["math", "maths", "матем", "математик"],
  "history-kazakhstan": ["history", "истор", "тарих"],
  english: ["english", "англ", "ағылшын"],
  "kazakh-l1": ["казахский я1", "қазақ тілі я1", "kazakh l1"],
  "kazakh-l2": ["казахский я2", "қазақ тілі я2", "kazakh l2"],
  "russian-l1": ["русский я1", "орыс тілі я1", "russian l1"],
  "russian-l2": ["русский я2", "орыс тілі я2", "russian l2"],
  biology: ["biolog", "биолог", "биология"],
  chemistry: ["chem", "хими", "химия"],
  physics: ["physic", "физик", "физика"],
  "computer-science": ["computer", "informat", "информат", "программ"],
  geography: ["geograph", "географ"],
};

const has = (text: string, ...needles: string[]): boolean =>
  needles.some((n) => text.includes(n));

/** Which subject a message is about, if any. Longest match wins. */
function matchSubject(text: string): Subject | undefined {
  let best: { subject: Subject; length: number } | undefined;

  for (const subject of SUBJECTS) {
    const candidates = [
      subject.name.toLowerCase(),
      subject.nameKk?.toLowerCase(),
      ...(ALIASES[subject.id] ?? []),
    ].filter((c): c is string => Boolean(c));

    for (const candidate of candidates) {
      if (text.includes(candidate) && (!best || candidate.length > best.length)) {
        best = { subject, length: candidate.length };
      }
    }
  }
  return best?.subject;
}

/** Which grade year a message names, if any. */
function matchYear(text: string): GradeYear | undefined {
  if (/\b1[012]\b/.test(text)) {
    const year = Number(text.match(/\b1[012]\b/)![0]);
    if (year === 10 || year === 11 || year === 12) return year;
  }
  return undefined;
}

const bandLines = (set: { maxMark: number; bands: Array<{ grade: string; min: number }> }) =>
  [...set.bands]
    .filter((band) => band.grade !== "U")
    .sort((a, b) => b.min - a.min)
    .map((band) => `  ${band.grade.padEnd(2)} from ${band.min}/${set.maxMark}`)
    .join("\n");

function boundaryAnswer(subject: Subject, year: GradeYear): string | null {
  const table: SubjectBoundaries | undefined = BOUNDARIES_BY_YEAR[year].find(
    (s) => s.id === subject.id
  );
  if (!table) {
    return `${subject.name} is not examined in Grade ${year}. Grade 11 examines only English and the second language; Grade 12 drops Я2.`;
  }

  const lines = [
    `${table.name} — Grade ${year}, published boundaries.`,
    "",
    `Subject level (out of ${table.subject.maxMark}):`,
    bandLines(table.subject),
  ];

  for (const component of table.components) {
    lines.push("", `${component.name} (out of ${component.maxMark}):`, bandLines(component));
  }

  lines.push(
    "",
    "These are the real published bands, not percentages — a mark on the floor of a band earns that band."
  );
  return lines.join("\n");
}

function stageAnswer(year: GradeYear): string {
  const stage = GRADE_STAGES.find((s) => s.year === year)!;
  return [
    `Grade ${year} — ${stage.title} (${stage.standard}).`,
    "",
    `You sit: ${stage.compulsory} — ${stage.load}.`,
    "",
    stage.summary,
    "",
    "Which language is Я1 and which is Я2 depends on your parallel: the Kazakh parallel sits Kazakh as Я1 and Russian as Я2, the Russian parallel the other way round.",
  ].join("\n");
}

function papersAnswer(): string {
  const lines = ["Papers seeded on the site right now:", ""];
  for (const paper of PAPERS) {
    lines.push(
      `· ${paper.title}, ${paper.sitting} — Grade ${paper.gradeYear}, ${paperMarkTotal(paper)} marks encoded of ${paper.totalMarks} declared, ${paper.provenance === "transcribed" ? "past paper" : "practice paper"}.`
    );
  }
  lines.push("", "Open any of them from the library and it marks itself as you go.");
  return lines.join("\n");
}

function topicsAnswer(subject: Subject): string {
  const lines = [`${subject.name} — syllabus strands on this site:`, ""];
  lines.push(subject.topics.map((t) => `· ${t}`).join("\n"));
  if (subject.topicsAdvanced?.length) {
    lines.push("", "Grade 12 (A-Level standard) adds:");
    lines.push(subject.topicsAdvanced.map((t) => `· ${t}`).join("\n"));
  }
  return lines.join("\n");
}

const CAPABILITIES = [
  "I am running without a model key at the moment, so I can only answer from the data this site holds. Ask me about:",
  "",
  "· grade boundaries — “what do I need for an A in Grade 10 maths”",
  "· what you sit in a given year — “what are the Grade 11 exams”",
  "· which mock papers exist here",
  "· the syllabus strands for a subject",
  "",
  "For everything else, open a paper and use the tutor drawer inside a question — it explains your working step by step.",
].join("\n");

/**
 * Answer from repository data alone. Never guesses: an unmatched question gets
 * the capability list rather than an invented answer.
 */
export function offlineAnswer(message: string): string {
  const text = message.toLowerCase();
  const subject = matchSubject(text);
  const year = matchYear(text);

  const wantsBoundaries = has(
    text,
    "boundar",
    "grade for",
    "need for",
    "порог",
    "границ",
    "балл",
    "сколько нужно",
    "на пятерку",
    "шек"
  );
  const wantsSubjects = has(
    text,
    "what do i sit",
    "which subject",
    "what subject",
    "какие предмет",
    "что сдаю",
    "что сдавать",
    "сдаются",
    "қандай пән"
  );
  const wantsPapers = has(text, "paper", "mock", "пробн", "вариант", "работ", "нұсқа");
  const wantsTopics = has(text, "topic", "syllabus", "тем", "раздел", "программ", "тақырып");

  if (wantsBoundaries && subject) {
    return boundaryAnswer(subject, year ?? 10) ?? CAPABILITIES;
  }
  if (wantsSubjects && year) return stageAnswer(year);
  if (wantsSubjects) {
    return GRADE_STAGES.map((stage) => `Grade ${stage.year}: ${stage.compulsory}`).join("\n");
  }
  if (wantsPapers) return papersAnswer();
  if (wantsTopics && subject) return topicsAnswer(subject);
  if (wantsBoundaries && year) {
    const table = BOUNDARIES_BY_YEAR[year];
    return [
      `Grade ${year} has published boundary tables for: ${table.map((t) => t.name).join(", ")}.`,
      "",
      "Name a subject and I will show you its bands.",
    ].join("\n");
  }

  return CAPABILITIES;
}
