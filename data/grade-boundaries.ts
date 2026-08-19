/**
 * Official NIS / Cambridge (МЭСК) grade boundaries.
 *
 * Transcribed verbatim from the published boundary table ("На уровне предмета"
 * = subject level, "Компонент 1/2" = paper 1 / paper 2). Bands are inclusive
 * mark ranges. A* is awarded at subject level only — individual components top
 * out at A, which is why `components` carries no A* band.
 *
 * These are real published boundaries, not a percentage approximation: a C in
 * Mathematics Paper 1 starts at 36/80 (45%) while a C in Chemistry Paper 1
 * starts at 44/90 (49%). Never substitute a flat percentage scale for them.
 */

export type Grade = "A*" | "A" | "B" | "C" | "D" | "E" | "U";

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

/** Terse band builder: [grade, min, max] tuples keep the table readable. */
const bands = (rows: Array<[Grade, number, number]>): Band[] =>
  rows.map(([grade, min, max]) => ({ grade, min, max }));

export const SUBJECT_BOUNDARIES: SubjectBoundaries[] = [
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

export const boundariesFor = (subjectId: string): SubjectBoundaries | undefined =>
  SUBJECT_BOUNDARIES.find((s) => s.id === subjectId);
