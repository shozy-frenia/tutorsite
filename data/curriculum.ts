/**
 * NIS grade & subject architecture.
 *
 * Grade 10 — core Maths & Sciences, examined internally on NIS papers.
 * Grade 11 — Cambridge International (English as a Second Language) plus the
 *            two compulsory national subjects (Kazakh History, Kazakh Language).
 * Grade 12 — two profile subjects taken in depth to A-Level standard.
 */

export type GradeYear = 10 | 11 | 12;

export type Track = "core" | "cambridge" | "national" | "profile";

export interface Subject {
  id: string;
  name: string;
  nameKk?: string;
  track: Track;
  /** Links to SUBJECT_BOUNDARIES.id when official boundaries exist. */
  boundaryId?: string;
  grades: GradeYear[];
  /** Syllabus strands, used to tag questions and drive the mastery radar. */
  topics: string[];
  glyph: string;
  blurb: string;
}

export const SUBJECTS: Subject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    nameKk: "Математика",
    track: "core",
    boundaryId: "mathematics",
    grades: [10, 11, 12],
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
    glyph: "∑",
    blurb: "Paper 1 & Paper 2 to the 160-mark subject scale.",
  },
  {
    id: "physics",
    name: "Physics",
    nameKk: "Физика",
    track: "core",
    boundaryId: "physics",
    grades: [10, 11, 12],
    topics: ["Mechanics", "Waves", "Electricity", "Thermodynamics", "Fields", "Nuclear"],
    glyph: "⚛",
    blurb: "130-mark scale across a written and a practical component.",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameKk: "Химия",
    track: "core",
    boundaryId: "chemistry",
    grades: [10, 11, 12],
    topics: ["Stoichiometry", "Bonding", "Energetics", "Kinetics", "Organic", "Analysis"],
    glyph: "⌬",
    blurb: "The steepest boundary table on the sheet — a C starts at 49%.",
  },
  {
    id: "biology",
    name: "Biology",
    nameKk: "Биология",
    track: "core",
    boundaryId: "biology",
    grades: [10, 11, 12],
    topics: ["Cells", "Genetics", "Physiology", "Ecology", "Evolution", "Biotechnology"],
    glyph: "❖",
    blurb: "130-mark scale, Paper 1 weighted 90 marks.",
  },
  {
    id: "computer-science",
    name: "Computer Science",
    nameKk: "Информатика",
    track: "core",
    boundaryId: "computer-science",
    grades: [10, 11, 12],
    topics: ["Algorithms", "Data Structures", "Databases", "Networks", "Programming"],
    glyph: "⌨",
    blurb: "150-mark scale with a 60-mark practical component.",
  },
  {
    id: "english-esl",
    name: "English as a Second Language",
    track: "cambridge",
    grades: [11, 12],
    topics: ["Reading", "Writing", "Listening", "Speaking", "Use of English"],
    glyph: "✎",
    blurb: "Cambridge International — the exam that gates your certificate.",
  },
  {
    id: "history-kazakhstan",
    name: "History of Kazakhstan",
    nameKk: "Қазақстан тарихы",
    track: "national",
    boundaryId: "history-kazakhstan",
    grades: [11],
    topics: [
      "Ancient & Medieval",
      "Kazakh Khanate",
      "Colonial Period",
      "Soviet Era",
      "Independence",
      "Source Analysis",
    ],
    glyph: "⌘",
    blurb: "Compulsory. 150 marks split 54 / 96 across two papers.",
  },
  {
    id: "kazakh-l1",
    name: "Kazakh Language (L1)",
    nameKk: "Қазақ тілі Я1",
    track: "national",
    boundaryId: "kazakh-l1",
    grades: [11],
    topics: ["Grammar", "Lexicology", "Text Analysis", "Composition", "Stylistics"],
    glyph: "Ә",
    blurb: "First-language route. 100 marks, even split across papers.",
  },
  {
    id: "kazakh-l2",
    name: "Kazakh Language & Literature (L2)",
    nameKk: "Қазақ тілі мен әдебиеті Я2",
    track: "national",
    boundaryId: "kazakh-l2",
    grades: [11],
    topics: ["Grammar", "Reading", "Literature", "Writing", "Speaking"],
    glyph: "Ң",
    blurb: "Second-language route. 60 marks — every mark moves a grade.",
  },
  {
    id: "russian-l1",
    name: "Russian Language (L1)",
    nameKk: "Орыс тілі Я1",
    track: "national",
    boundaryId: "russian-l1",
    grades: [11],
    topics: ["Grammar", "Lexicology", "Text Analysis", "Composition", "Stylistics"],
    glyph: "Я",
    blurb: "100 marks. The most forgiving A* threshold on the table (62%).",
  },
  {
    id: "russian-l2",
    name: "Russian Language & Literature (L2)",
    track: "national",
    boundaryId: "russian-l2",
    grades: [11],
    topics: ["Grammar", "Reading", "Literature", "Writing", "Speaking"],
    glyph: "Ж",
    blurb: "60 marks. Paper 2 bands are 1–2 marks wide.",
  },
];

export interface GradeStage {
  year: GradeYear;
  title: string;
  standard: string;
  summary: string;
  subjectIds: string[];
  /** How many subjects a student actually carries in this year. */
  load: string;
}

export const GRADE_STAGES: GradeStage[] = [
  {
    year: 10,
    title: "Core Maths & Sciences",
    standard: "NIS internal / IGCSE standard",
    summary:
      "The foundation year. Mathematics Paper 1 is 80 marks in 90 minutes with no calculator — pace, not cleverness, is what fails people here.",
    subjectIds: ["mathematics", "physics", "chemistry", "biology", "computer-science"],
    load: "5 core subjects",
  },
  {
    year: 11,
    title: "Cambridge + National",
    standard: "Cambridge International (AS standard)",
    summary:
      "English as a Second Language sits alongside the two compulsory national subjects. Three boundary tables, three completely different mark scales.",
    subjectIds: [
      "english-esl",
      "history-kazakhstan",
      "kazakh-l1",
      "kazakh-l2",
      "russian-l1",
      "russian-l2",
    ],
    load: "Cambridge ESL + 2 national",
  },
  {
    year: 12,
    title: "Profile Subjects",
    standard: "A-Level standard",
    summary:
      "Two subjects taken in depth, chosen by profile. This is the grade universities read, so the A* boundary is the only one that matters.",
    subjectIds: ["mathematics", "physics", "chemistry", "biology", "computer-science"],
    load: "2 in-depth profile subjects",
  },
];

export const subjectById = (id: string): Subject | undefined =>
  SUBJECTS.find((s) => s.id === id);

export const subjectsForYear = (year: GradeYear): Subject[] =>
  GRADE_STAGES.find((g) => g.year === year)
    ?.subjectIds.map(subjectById)
    .filter((s): s is Subject => Boolean(s)) ?? [];
