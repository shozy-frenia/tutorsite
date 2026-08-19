/**
 * Official NIS / Cambridge (МЭСК) grade boundaries, per grade year.
 *
 * Transcribed verbatim from the published boundary tables ("На уровне
 * предмета" = subject level, "Компонент N" = paper N). Bands are inclusive
 * mark ranges.
 *
 * The three years use genuinely different tables — not the same table scaled.
 * Grade 10 Mathematics is out of 160 across two components; Grade 12
 * Mathematics is out of 230 across three, plus a combined "Components 1 & 3"
 * row. Grade 11 examines only English and the second language (Я2).
 *
 * Whether A* exists at component level also varies by year: Grade 10 and
 * Grade 11 component tables stop at A, while Grade 12 component tables carry
 * an A* band. The data records whatever the published table shows, and the
 * grading code walks whatever bands exist rather than assuming a fixed ladder.
 *
 * These are real published boundaries, not percentage approximations: a C in
 * Grade 10 Mathematics Paper 1 starts at 36/80 (45%) while a C in Grade 12
 * Mathematics Component 2 starts at 39/90 (43%). Never substitute a flat
 * percentage scale for them.
 */

export type Grade = "A*" | "A" | "B" | "C" | "D" | "E" | "U";

export type GradeYear = 10 | 11 | 12;

export const GRADE_ORDER: Grade[] = ["U", "E", "D", "C", "B", "A", "A*"];

export interface Band {
  grade: Grade;
  /** inclusive lower bound */
  min: number;
  /** inclusive upper bound */
  max: number;
}

export interface BoundarySet {
  maxMark: number;
  bands: Band[];
}

export interface SubjectBoundaries {
  id: string;
  /** Display name, English */
  name: string;
  /** Name as printed on the official table */
  nameRu: string;
  subject: BoundarySet;
  components: Array<{ name: string } & BoundarySet>;
}

/** Terse band builder: [grade, min, max] tuples keep the tables readable. */
const bands = (rows: Array<[Grade, number, number]>): Band[] =>
  rows.map(([grade, min, max]) => ({ grade, min, max }));

/* ========================================================================
   GRADE 10 — Mathematics, History, Я1, Я2 and one profile subject
   ======================================================================== */

const GRADE_10: SubjectBoundaries[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    nameRu: "Математика",
    subject: {
      maxMark: 160,
      bands: bands([
        ["A*", 134, 160],
        ["A", 114, 133],
        ["B", 94, 113],
        ["C", 74, 93],
        ["D", 53, 73],
        ["E", 33, 52],
        ["U", 0, 32],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 80,
        bands: bands([
          ["A", 56, 80],
          ["B", 46, 55],
          ["C", 36, 45],
          ["D", 26, 35],
          ["E", 16, 25],
          ["U", 0, 15],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 80,
        bands: bands([
          ["A", 58, 80],
          ["B", 48, 57],
          ["C", 38, 47],
          ["D", 27, 37],
          ["E", 17, 26],
          ["U", 0, 16],
        ]),
      },
    ],
  },
  {
    id: "history-kazakhstan",
    name: "History of Kazakhstan",
    nameRu: "История Казахстана",
    subject: {
      maxMark: 150,
      bands: bands([
        ["A*", 105, 150],
        ["A", 87, 104],
        ["B", 69, 86],
        ["C", 52, 68],
        ["D", 37, 51],
        ["E", 23, 36],
        ["U", 0, 22],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 54,
        bands: bands([
          ["A", 32, 54],
          ["B", 26, 31],
          ["C", 20, 25],
          ["D", 15, 19],
          ["E", 10, 14],
          ["U", 0, 9],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 96,
        bands: bands([
          ["A", 55, 96],
          ["B", 43, 54],
          ["C", 32, 42],
          ["D", 22, 31],
          ["E", 13, 21],
          ["U", 0, 12],
        ]),
      },
    ],
  },
  {
    id: "kazakh-l1",
    name: "Kazakh Language (L1)",
    nameRu: "Казахский язык Я1",
    subject: {
      maxMark: 100,
      bands: bands([
        ["A*", 73, 100],
        ["A", 63, 72],
        ["B", 53, 62],
        ["C", 43, 52],
        ["D", 33, 42],
        ["E", 23, 32],
        ["U", 0, 22],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 50,
        bands: bands([
          ["A", 32, 50],
          ["B", 27, 31],
          ["C", 22, 26],
          ["D", 17, 21],
          ["E", 11, 16],
          ["U", 0, 10],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 50,
        bands: bands([
          ["A", 31, 50],
          ["B", 26, 30],
          ["C", 21, 25],
          ["D", 16, 20],
          ["E", 12, 15],
          ["U", 0, 11],
        ]),
      },
    ],
  },
  {
    id: "kazakh-l2",
    name: "Kazakh Language & Literature (L2)",
    nameRu: "Казахский язык и литература Я2",
    subject: {
      maxMark: 60,
      bands: bands([
        ["A*", 55, 60],
        ["A", 49, 54],
        ["B", 40, 48],
        ["C", 31, 39],
        ["D", 25, 30],
        ["E", 19, 24],
        ["U", 0, 18],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 40,
        bands: bands([
          ["A", 33, 40],
          ["B", 27, 32],
          ["C", 21, 26],
          ["D", 17, 20],
          ["E", 13, 16],
          ["U", 0, 12],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 20,
        bands: bands([
          ["A", 16, 20],
          ["B", 13, 15],
          ["C", 10, 12],
          ["D", 8, 9],
          ["E", 6, 7],
          ["U", 0, 5],
        ]),
      },
    ],
  },
  {
    id: "russian-l1",
    name: "Russian Language (L1)",
    nameRu: "Русский язык Я1",
    subject: {
      maxMark: 100,
      bands: bands([
        ["A*", 62, 100],
        ["A", 53, 61],
        ["B", 44, 52],
        ["C", 35, 43],
        ["D", 26, 34],
        ["E", 18, 25],
        ["U", 0, 17],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 50,
        bands: bands([
          ["A", 27, 50],
          ["B", 23, 26],
          ["C", 18, 22],
          ["D", 13, 17],
          ["E", 9, 12],
          ["U", 0, 8],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 50,
        bands: bands([
          ["A", 26, 50],
          ["B", 21, 25],
          ["C", 17, 20],
          ["D", 13, 16],
          ["E", 9, 12],
          ["U", 0, 8],
        ]),
      },
    ],
  },
  {
    id: "russian-l2",
    name: "Russian Language & Literature (L2)",
    nameRu: "Русский язык и литература Я2",
    subject: {
      maxMark: 60,
      bands: bands([
        ["A*", 51, 60],
        ["A", 47, 50],
        ["B", 43, 46],
        ["C", 39, 42],
        ["D", 31, 38],
        ["E", 24, 30],
        ["U", 0, 23],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 40,
        bands: bands([
          ["A", 33, 40],
          ["B", 31, 32],
          ["C", 28, 30],
          ["D", 22, 27],
          ["E", 16, 21],
          ["U", 0, 15],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 20,
        bands: bands([
          ["A", 14, 20],
          ["B", 12, 13],
          ["C", 11, 11],
          ["D", 9, 10],
          ["E", 8, 8],
          ["U", 0, 7],
        ]),
      },
    ],
  },
  {
    id: "physics",
    name: "Physics",
    nameRu: "Физика",
    subject: {
      maxMark: 130,
      bands: bands([
        ["A*", 94, 130],
        ["A", 82, 93],
        ["B", 70, 81],
        ["C", 58, 69],
        ["D", 45, 57],
        ["E", 32, 44],
        ["U", 0, 31],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 90,
        bands: bands([
          ["A", 56, 90],
          ["B", 47, 55],
          ["C", 38, 46],
          ["D", 29, 37],
          ["E", 20, 28],
          ["U", 0, 19],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 40,
        bands: bands([
          ["A", 26, 40],
          ["B", 23, 25],
          ["C", 20, 22],
          ["D", 16, 19],
          ["E", 12, 15],
          ["U", 0, 11],
        ]),
      },
    ],
  },
  {
    id: "biology",
    name: "Biology",
    nameRu: "Биология",
    subject: {
      maxMark: 130,
      bands: bands([
        ["A*", 94, 130],
        ["A", 82, 93],
        ["B", 70, 81],
        ["C", 58, 69],
        ["D", 47, 57],
        ["E", 36, 46],
        ["U", 0, 35],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 90,
        bands: bands([
          ["A", 58, 90],
          ["B", 49, 57],
          ["C", 40, 48],
          ["D", 32, 39],
          ["E", 24, 31],
          ["U", 0, 23],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 40,
        bands: bands([
          ["A", 24, 40],
          ["B", 21, 23],
          ["C", 18, 20],
          ["D", 15, 17],
          ["E", 12, 14],
          ["U", 0, 11],
        ]),
      },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameRu: "Химия",
    subject: {
      maxMark: 130,
      bands: bands([
        ["A*", 97, 130],
        ["A", 85, 96],
        ["B", 73, 84],
        ["C", 61, 72],
        ["D", 51, 60],
        ["E", 42, 50],
        ["U", 0, 41],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 90,
        bands: bands([
          ["A", 60, 90],
          ["B", 52, 59],
          ["C", 44, 51],
          ["D", 37, 43],
          ["E", 31, 36],
          ["U", 0, 30],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 40,
        bands: bands([
          ["A", 25, 40],
          ["B", 21, 24],
          ["C", 17, 20],
          ["D", 14, 16],
          ["E", 11, 13],
          ["U", 0, 10],
        ]),
      },
    ],
  },
  {
    id: "computer-science",
    name: "Computer Science",
    nameRu: "Информатика",
    subject: {
      maxMark: 150,
      bands: bands([
        ["A*", 113, 150],
        ["A", 96, 112],
        ["B", 79, 95],
        ["C", 63, 78],
        ["D", 46, 62],
        ["E", 30, 45],
        ["U", 0, 29],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 90,
        bands: bands([
          ["A", 57, 90],
          ["B", 47, 56],
          ["C", 37, 46],
          ["D", 27, 36],
          ["E", 18, 26],
          ["U", 0, 17],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 60,
        bands: bands([
          ["A", 39, 60],
          ["B", 32, 38],
          ["C", 26, 31],
          ["D", 19, 25],
          ["E", 12, 18],
          ["U", 0, 11],
        ]),
      },
    ],
  },
];

/* ========================================================================
   GRADE 11 — only English and the second language (Я2)
   ======================================================================== */

const GRADE_11: SubjectBoundaries[] = [
  {
    id: "english",
    name: "English",
    nameRu: "Английский язык",
    subject: {
      maxMark: 90,
      bands: bands([
        ["A*", 77, 90],
        ["A", 68, 76],
        ["B", 59, 67],
        ["C", 51, 58],
        ["D", 42, 50],
        ["E", 33, 41],
        ["U", 0, 32],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 50,
        bands: bands([
          ["A", 40, 50],
          ["B", 36, 39],
          ["C", 33, 35],
          ["D", 28, 32],
          ["E", 23, 27],
          ["U", 0, 22],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 40,
        bands: bands([
          ["A", 28, 40],
          ["B", 23, 27],
          ["C", 18, 22],
          ["D", 14, 17],
          ["E", 10, 13],
          ["U", 0, 9],
        ]),
      },
    ],
  },
  {
    id: "kazakh-l2",
    name: "Kazakh Language & Literature (L2)",
    nameRu: "Казахский язык и литература Я2",
    subject: {
      maxMark: 100,
      bands: bands([
        ["A*", 80, 100],
        ["A", 71, 79],
        ["B", 62, 70],
        ["C", 53, 61],
        ["D", 41, 52],
        ["E", 30, 40],
        ["U", 0, 29],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 60,
        bands: bands([
          ["A", 44, 60],
          ["B", 39, 43],
          ["C", 33, 38],
          ["D", 25, 32],
          ["E", 18, 24],
          ["U", 0, 17],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 40,
        bands: bands([
          ["A", 27, 40],
          ["B", 23, 26],
          ["C", 20, 22],
          ["D", 16, 19],
          ["E", 12, 15],
          ["U", 0, 11],
        ]),
      },
    ],
  },
  {
    id: "russian-l2",
    name: "Russian Language & Literature (L2)",
    nameRu: "Русский язык и литература Я2",
    subject: {
      maxMark: 100,
      bands: bands([
        ["A*", 76, 100],
        ["A", 68, 75],
        ["B", 60, 67],
        ["C", 53, 59],
        ["D", 45, 52],
        ["E", 38, 44],
        ["U", 0, 37],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 60,
        bands: bands([
          ["A", 42, 60],
          ["B", 38, 41],
          ["C", 34, 37],
          ["D", 29, 33],
          ["E", 25, 28],
          ["U", 0, 24],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 40,
        bands: bands([
          ["A", 26, 40],
          ["B", 22, 25],
          ["C", 19, 21],
          ["D", 16, 18],
          ["E", 13, 15],
          ["U", 0, 12],
        ]),
      },
    ],
  },
];

/* ========================================================================
   GRADE 12 — Mathematics, History, Я1 and two profile subjects.
   Component tables here carry an A* band, unlike Grades 10 and 11.
   ======================================================================== */

const GRADE_12: SubjectBoundaries[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    nameRu: "Математика",
    subject: {
      maxMark: 230,
      bands: bands([
        ["A*", 194, 230],
        ["A", 166, 193],
        ["B", 138, 165],
        ["C", 110, 137],
        ["D", 82, 109],
        ["E", 54, 81],
        ["U", 0, 53],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 60,
        bands: bands([
          ["A*", 52, 60],
          ["A", 45, 51],
          ["B", 38, 44],
          ["C", 30, 37],
          ["D", 23, 29],
          ["E", 17, 22],
          ["U", 0, 16],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 90,
        bands: bands([
          ["A*", 72, 90],
          ["A", 61, 71],
          ["B", 50, 60],
          ["C", 39, 49],
          ["D", 29, 38],
          ["E", 18, 28],
          ["U", 0, 17],
        ]),
      },
      {
        name: "Paper 3",
        maxMark: 80,
        bands: bands([
          ["A*", 70, 80],
          ["A", 60, 69],
          ["B", 50, 59],
          ["C", 41, 49],
          ["D", 30, 40],
          ["E", 19, 29],
          ["U", 0, 18],
        ]),
      },
      {
        // The published table carries this combined row for Papers 1 + 3.
        name: "Papers 1 & 3",
        maxMark: 140,
        bands: bands([
          ["A*", 122, 140],
          ["A", 105, 121],
          ["B", 88, 104],
          ["C", 71, 87],
          ["D", 53, 70],
          ["E", 36, 52],
          ["U", 0, 35],
        ]),
      },
    ],
  },
  {
    id: "history-kazakhstan",
    name: "History of Kazakhstan",
    nameRu: "История Казахстана",
    subject: {
      maxMark: 100,
      bands: bands([
        ["A*", 82, 100],
        ["A", 73, 81],
        ["B", 64, 72],
        ["C", 56, 63],
        ["D", 46, 55],
        ["E", 37, 45],
        ["U", 0, 36],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 60,
        bands: bands([
          ["A*", 42, 60],
          ["A", 38, 41],
          ["B", 34, 37],
          ["C", 30, 33],
          ["D", 25, 29],
          ["E", 21, 24],
          ["U", 0, 20],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 40,
        bands: bands([
          ["A*", 38, 40],
          ["A", 35, 37],
          ["B", 30, 34],
          ["C", 26, 29],
          ["D", 21, 25],
          ["E", 16, 20],
          ["U", 0, 15],
        ]),
      },
    ],
  },
  {
    id: "kazakh-l1",
    name: "Kazakh Language & Literature (L1)",
    nameRu: "Казахский язык и литература Я1",
    subject: {
      maxMark: 100,
      bands: bands([
        ["A*", 74, 100],
        ["A", 64, 73],
        ["B", 54, 63],
        ["C", 45, 53],
        ["D", 37, 44],
        ["E", 29, 36],
        ["U", 0, 28],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 50,
        bands: bands([
          ["A*", 37, 50],
          ["A", 32, 36],
          ["B", 27, 31],
          ["C", 22, 26],
          ["D", 18, 21],
          ["E", 14, 17],
          ["U", 0, 13],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 50,
        bands: bands([
          ["A*", 37, 50],
          ["A", 32, 36],
          ["B", 27, 31],
          ["C", 23, 26],
          ["D", 19, 22],
          ["E", 15, 18],
          ["U", 0, 14],
        ]),
      },
    ],
  },
  {
    id: "russian-l1",
    name: "Russian Language & Literature (L1)",
    nameRu: "Русский язык и литература Я1",
    subject: {
      maxMark: 100,
      bands: bands([
        ["A*", 60, 100],
        ["A", 52, 59],
        ["B", 44, 51],
        ["C", 37, 43],
        ["D", 30, 36],
        ["E", 24, 29],
        ["U", 0, 23],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 50,
        bands: bands([
          ["A*", 30, 50],
          ["A", 26, 29],
          ["B", 22, 25],
          ["C", 18, 21],
          ["D", 15, 17],
          ["E", 12, 14],
          ["U", 0, 11],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 50,
        bands: bands([
          ["A*", 30, 50],
          ["A", 26, 29],
          ["B", 22, 25],
          ["C", 19, 21],
          ["D", 15, 18],
          ["E", 12, 14],
          ["U", 0, 11],
        ]),
      },
    ],
  },
  {
    id: "physics",
    name: "Physics",
    nameRu: "Физика",
    subject: {
      maxMark: 170,
      bands: bands([
        ["A*", 110, 170],
        ["A", 95, 109],
        ["B", 80, 94],
        ["C", 66, 79],
        ["D", 48, 65],
        ["E", 31, 47],
        ["U", 0, 30],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 40,
        bands: bands([
          ["A*", 28, 40],
          ["A", 24, 27],
          ["B", 20, 23],
          ["C", 17, 19],
          ["D", 15, 16],
          ["E", 12, 14],
          ["U", 0, 11],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 100,
        bands: bands([
          ["A*", 60, 100],
          ["A", 52, 59],
          ["B", 44, 51],
          ["C", 36, 43],
          ["D", 23, 35],
          ["E", 11, 22],
          ["U", 0, 10],
        ]),
      },
      {
        name: "Paper 3",
        maxMark: 30,
        bands: bands([
          ["A*", 22, 30],
          ["A", 19, 21],
          ["B", 16, 18],
          ["C", 13, 15],
          ["D", 10, 12],
          ["E", 8, 9],
          ["U", 0, 7],
        ]),
      },
    ],
  },
  {
    id: "biology",
    name: "Biology",
    nameRu: "Биология",
    subject: {
      maxMark: 170,
      bands: bands([
        ["A*", 108, 170],
        ["A", 93, 107],
        ["B", 78, 92],
        ["C", 64, 77],
        ["D", 54, 63],
        ["E", 45, 53],
        ["U", 0, 44],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 40,
        bands: bands([
          ["A*", 28, 40],
          ["A", 25, 27],
          ["B", 22, 24],
          ["C", 20, 21],
          ["D", 18, 19],
          ["E", 15, 17],
          ["U", 0, 14],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 100,
        bands: bands([
          ["A*", 61, 100],
          ["A", 51, 60],
          ["B", 41, 50],
          ["C", 32, 40],
          ["D", 26, 31],
          ["E", 21, 25],
          ["U", 0, 20],
        ]),
      },
      {
        name: "Paper 3",
        maxMark: 30,
        bands: bands([
          ["A*", 19, 30],
          ["A", 17, 18],
          ["B", 15, 16],
          ["C", 12, 14],
          ["D", 10, 11],
          ["E", 9, 9],
          ["U", 0, 8],
        ]),
      },
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    nameRu: "Химия",
    subject: {
      maxMark: 170,
      bands: bands([
        ["A*", 111, 170],
        ["A", 93, 110],
        ["B", 75, 92],
        ["C", 57, 74],
        ["D", 45, 56],
        ["E", 34, 44],
        ["U", 0, 33],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 40,
        bands: bands([
          ["A*", 28, 40],
          ["A", 25, 27],
          ["B", 22, 24],
          ["C", 19, 21],
          ["D", 15, 18],
          ["E", 11, 14],
          ["U", 0, 10],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 100,
        bands: bands([
          ["A*", 63, 100],
          ["A", 51, 62],
          ["B", 39, 50],
          ["C", 26, 38],
          ["D", 20, 25],
          ["E", 15, 19],
          ["U", 0, 14],
        ]),
      },
      {
        name: "Paper 3",
        maxMark: 30,
        bands: bands([
          ["A*", 20, 30],
          ["A", 17, 19],
          ["B", 14, 16],
          ["C", 12, 13],
          ["D", 10, 11],
          ["E", 8, 9],
          ["U", 0, 7],
        ]),
      },
    ],
  },
  {
    id: "computer-science",
    name: "Computer Science",
    nameRu: "Информатика",
    subject: {
      maxMark: 200,
      bands: bands([
        ["A*", 142, 200],
        ["A", 123, 141],
        ["B", 104, 122],
        ["C", 86, 103],
        ["D", 65, 85],
        ["E", 45, 64],
        ["U", 0, 44],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 70,
        bands: bands([
          ["A*", 48, 70],
          ["A", 42, 47],
          ["B", 36, 41],
          ["C", 31, 35],
          ["D", 24, 30],
          ["E", 17, 23],
          ["U", 0, 16],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 70,
        bands: bands([
          ["A*", 49, 70],
          ["A", 42, 48],
          ["B", 35, 41],
          ["C", 29, 34],
          ["D", 22, 28],
          ["E", 15, 21],
          ["U", 0, 14],
        ]),
      },
      {
        name: "Paper 3",
        maxMark: 60,
        bands: bands([
          ["A*", 45, 60],
          ["A", 39, 44],
          ["B", 33, 38],
          ["C", 26, 32],
          ["D", 19, 25],
          ["E", 13, 18],
          ["U", 0, 12],
        ]),
      },
    ],
  },
  {
    id: "geography",
    name: "Geography",
    nameRu: "География",
    subject: {
      maxMark: 130,
      bands: bands([
        ["A*", 96, 130],
        ["A", 83, 95],
        ["B", 70, 82],
        ["C", 58, 69],
        ["D", 48, 57],
        ["E", 39, 47],
        ["U", 0, 38],
      ]),
    },
    components: [
      {
        name: "Paper 1",
        maxMark: 70,
        bands: bands([
          ["A*", 54, 70],
          ["A", 47, 53],
          ["B", 40, 46],
          ["C", 33, 39],
          ["D", 28, 32],
          ["E", 23, 27],
          ["U", 0, 22],
        ]),
      },
      {
        name: "Paper 2",
        maxMark: 60,
        bands: bands([
          ["A*", 42, 60],
          ["A", 36, 41],
          ["B", 30, 35],
          ["C", 25, 29],
          ["D", 20, 24],
          ["E", 16, 19],
          ["U", 0, 15],
        ]),
      },
    ],
  },
];

export const BOUNDARIES_BY_YEAR: Record<GradeYear, SubjectBoundaries[]> = {
  10: GRADE_10,
  11: GRADE_11,
  12: GRADE_12,
};

/**
 * Boundaries for one subject in one grade year.
 * Returns undefined when that subject is not examined that year — which is a
 * real answer, not a lookup failure: Grade 11 examines only English and Я2.
 */
export const boundariesFor = (
  subjectId: string,
  gradeYear: GradeYear
): SubjectBoundaries | undefined =>
  BOUNDARIES_BY_YEAR[gradeYear]?.find((s) => s.id === subjectId);

/** Every (year, subject) pair that has a published table. */
export const allBoundarySets = (): Array<{
  gradeYear: GradeYear;
  subject: SubjectBoundaries;
}> =>
  (Object.keys(BOUNDARIES_BY_YEAR) as unknown as GradeYear[]).flatMap((year) =>
    BOUNDARIES_BY_YEAR[Number(year) as GradeYear].map((subject) => ({
      gradeYear: Number(year) as GradeYear,
      subject,
    }))
  );
