import type { GradeYear } from "@/data/grade-boundaries";

/**
 * NIS exam architecture.
 *
 * What a student actually sits depends on three things: their grade year,
 * which language parallel they study in, and (in Grades 10 and 12) which
 * profile subjects they chose. The rules:
 *
 *   Grade 10 — Mathematics, History of Kazakhstan, first language (Я1),
 *              second language (Я2), and ONE profile subject of four.
 *   Grade 11 — English and the second language (Я2). Two subjects, nothing else.
 *   Grade 12 — Mathematics, History of Kazakhstan, first language (Я1), and
 *              TWO profile subjects.
 *
 * The parallel decides which language is Я1 and which is Я2: a student in the
 * Kazakh parallel sits Kazakh as Я1 and Russian as Я2, and vice versa. This is
 * why the app asks for the parallel at registration — showing a Kazakh-parallel
 * student the Russian Я1 papers would be showing them an exam they will never sit.
 */

/** Language of instruction. Decides which language is Я1 and which is Я2. */
export type Parallel = "kazakh" | "russian";

export type Track = "core" | "language" | "profile" | "cambridge";

export interface Subject {
  id: string;
  name: string;
  nameKk?: string;
  track: Track;
  /** Syllabus strands, used to tag questions and drive the mastery radar. */
  topics: string[];
  /**
   * Strands that only appear at Grade 12 (A-Level standard). Kept separate so
   * a Grade 10 view never advertises calculus the student has not met yet.
   */
  topicsAdvanced?: string[];
  glyph: string;
  blurb: string;
}

export const SUBJECTS: Subject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    nameKk: "Математика",
    track: "core",
    topics: [
      "Vectors",
      "Coordinate Geometry",
      "Sequences & Induction",
      "Combinatorics",
      "Binomial Theorem",
      "Circle Geometry",
      "Similarity",
      "Trigonometric Identities",
      "Inverse Trigonometry",
      "Trigonometric Equations",
      "Functions",
      "Probability",
      "Solid Geometry",
      "Inequalities",
    ],
    topicsAdvanced: [
      "Differentiation",
      "Integration",
      "Differential Equations",
      "Exponentials & Logarithms",
      "Binomial Series",
      "Complex Numbers",
      "Vectors 3D",
      "Parametric Equations",
    ],
    glyph: "∑",
    blurb: "Compulsory in Grades 10 and 12. Two papers at Grade 10, three at Grade 12.",
  },
  {
    id: "history-kazakhstan",
    name: "History of Kazakhstan",
    nameKk: "Қазақстан тарихы",
    track: "core",
    topics: [
      "Ancient & Medieval",
      "Kazakh Khanate",
      "Colonial Period",
      "Soviet Era",
      "Independence",
      "Source Analysis",
    ],
    glyph: "⌘",
    blurb: "Compulsory in Grades 10 and 12.",
  },

  /* ------------------------------------------------------------ languages */
  {
    id: "kazakh-l1",
    name: "Kazakh Language (L1)",
    nameKk: "Қазақ тілі Я1",
    track: "language",
    topics: ["Grammar", "Lexicology", "Text Analysis", "Composition", "Stylistics"],
    glyph: "Ә",
    blurb: "First language for the Kazakh parallel.",
  },
  {
    id: "russian-l1",
    name: "Russian Language (L1)",
    nameKk: "Орыс тілі Я1",
    track: "language",
    topics: ["Grammar", "Lexicology", "Text Analysis", "Composition", "Stylistics"],
    glyph: "Я",
    blurb: "First language for the Russian parallel.",
  },
  {
    id: "kazakh-l2",
    name: "Kazakh Language & Literature (L2)",
    nameKk: "Қазақ тілі мен әдебиеті Я2",
    track: "language",
    topics: ["Grammar", "Reading", "Literature", "Writing", "Speaking"],
    glyph: "Ң",
    blurb: "Second language for the Russian parallel.",
  },
  {
    id: "russian-l2",
    name: "Russian Language & Literature (L2)",
    nameKk: "Орыс тілі мен әдебиеті Я2",
    track: "language",
    topics: ["Grammar", "Reading", "Literature", "Writing", "Speaking"],
    glyph: "Ж",
    blurb: "Second language for the Kazakh parallel.",
  },
  {
    id: "english",
    name: "English",
    nameKk: "Ағылшын тілі",
    track: "cambridge",
    topics: ["Reading", "Writing", "Listening", "Speaking", "Use of English"],
    glyph: "✎",
    blurb: "Grade 11 only. 90 marks across two components.",
  },

  /* ------------------------------------------------------------- profiles */
  {
    id: "physics",
    name: "Physics",
    nameKk: "Физика",
    track: "profile",
    topics: ["Mechanics", "Waves", "Electricity", "Thermodynamics", "Fields", "Nuclear"],
    glyph: "⚛",
    blurb: "Profile subject. 130 marks at Grade 10, 170 across three papers at Grade 12.",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameKk: "Химия",
    track: "profile",
    topics: [
      "Stoichiometry",
      "Bonding & Structure",
      "Periodicity",
      "Acids & Bases",
      "Redox & Electrolysis",
      "Energetics",
      "Kinetics & Equilibrium",
      "Organic Chemistry",
      "Nuclear Chemistry",
      "Qualitative Analysis",
    ],
    glyph: "⌬",
    blurb: "Profile subject. The steepest Grade 10 table on the sheet — a C starts at 49%.",
  },
  {
    id: "biology",
    name: "Biology",
    nameKk: "Биология",
    track: "profile",
    topics: ["Cells", "Genetics", "Physiology", "Ecology", "Evolution", "Biotechnology"],
    glyph: "❖",
    blurb: "Profile subject. Paper 1 carries most of the marks.",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    nameKk: "Информатика",
    track: "profile",
    topics: ["Algorithms", "Data Structures", "Databases", "Networks", "Programming"],
    glyph: "⌨",
    blurb: "Profile subject. 200 marks across three papers at Grade 12.",
  },
  {
    id: "geography",
    name: "Geography",
    nameKk: "География",
    track: "profile",
    topics: [
      "Physical Geography",
      "Human Geography",
      "Cartography",
      "Economic Geography",
      "Environmental Management",
    ],
    glyph: "◍",
    blurb: "Profile subject, Grade 12 only.",
  },
];

export const subjectById = (id: string): Subject | undefined =>
  SUBJECTS.find((s) => s.id === id);

/* ========================================================================
   Parallel → language subject mapping
   ======================================================================== */

/** The first-language subject for a parallel. */
export const firstLanguageFor = (parallel: Parallel): string =>
  parallel === "kazakh" ? "kazakh-l1" : "russian-l1";

/** The second-language subject for a parallel — always the other language. */
export const secondLanguageFor = (parallel: Parallel): string =>
  parallel === "kazakh" ? "russian-l2" : "kazakh-l2";

export const PARALLEL_LABEL: Record<Parallel, string> = {
  kazakh: "Kazakh parallel",
  russian: "Russian parallel",
};

/* ========================================================================
   What a student actually sits
   ======================================================================== */

/** Profile subjects available to choose from, by grade year. */
export function profileOptionsFor(gradeYear: GradeYear): Subject[] {
  if (gradeYear === 11) return [];
  const ids =
    gradeYear === 12
      ? ["biology", "chemistry", "physics", "computer-science", "geography"]
      : ["biology", "chemistry", "physics", "computer-science"];
  return ids.map(subjectById).filter((s): s is Subject => Boolean(s));
}

/** How many profile subjects a student picks in this year. */
export function profileCountFor(gradeYear: GradeYear): number {
  if (gradeYear === 10) return 1;
  if (gradeYear === 12) return 2;
  return 0;
}

/**
 * The exact set of subjects a student sits, given their year, parallel and
 * profile choices. This is the filter the library and dashboard use — a
 * student is never shown a paper for an exam they will not sit.
 */
export function examSubjectsFor(options: {
  gradeYear: GradeYear;
  parallel: Parallel;
  profileSubjectIds: string[];
}): Subject[] {
  const { gradeYear, parallel, profileSubjectIds } = options;

  if (gradeYear === 11) {
    // Grade 11 is only English and the second language.
    return ["english", secondLanguageFor(parallel)]
      .map(subjectById)
      .filter((s): s is Subject => Boolean(s));
  }

  const ids = ["mathematics", "history-kazakhstan", firstLanguageFor(parallel)];

  // Grade 10 also examines the second language; Grade 12 does not.
  if (gradeYear === 10) ids.push(secondLanguageFor(parallel));

  const allowed = new Set(profileOptionsFor(gradeYear).map((s) => s.id));
  ids.push(...profileSubjectIds.filter((id) => allowed.has(id)));

  return ids.map(subjectById).filter((s): s is Subject => Boolean(s));
}

/* ========================================================================
   Stage descriptions — used on the landing page
   ======================================================================== */

export interface GradeStage {
  year: GradeYear;
  title: string;
  standard: string;
  summary: string;
  load: string;
  /** Subjects everyone in the year sits, before profile choices. */
  compulsory: string;
}

export const GRADE_STAGES: GradeStage[] = [
  {
    year: 10,
    title: "Core + one profile",
    standard: "NIS internal / IGCSE standard",
    summary:
      "Mathematics, History of Kazakhstan, both languages, and one profile subject of four. Paper 1 in Maths is 80 marks in 90 minutes with no calculator — pace, not cleverness, is what fails people here.",
    load: "5 subjects",
    compulsory: "Maths · History · Я1 · Я2 · 1 profile",
  },
  {
    year: 11,
    title: "English + second language",
    standard: "Cambridge International",
    summary:
      "Only two exams all year, and they are on completely different mark scales: English is out of 90, the second language out of 100. Both leave very little room between bands.",
    load: "2 subjects",
    compulsory: "English · Я2",
  },
  {
    year: 12,
    title: "Core + two profiles",
    standard: "A-Level standard",
    summary:
      "Same shape as Grade 10 but with two profile subjects and a first language only. Mathematics jumps to 230 marks across three papers. This is the grade universities read.",
    load: "5 subjects",
    compulsory: "Maths · History · Я1 · 2 profiles",
  },
];

export const stageFor = (year: GradeYear): GradeStage | undefined =>
  GRADE_STAGES.find((s) => s.year === year);
