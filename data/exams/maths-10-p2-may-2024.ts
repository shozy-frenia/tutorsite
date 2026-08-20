import type { Paper } from "@/lib/exam-types";

/**
 * NIS Mathematics, Grade 10, Component 2 — sitting of May 2024 (10MATHK/02).
 *
 * Transcribed from the original question paper (Kazakh edition). 80 marks in
 * 90 minutes, and unlike Component 1 this paper *permits a calculator* — its
 * additional materials list a calculator, ruler, compasses and protractor.
 * That is why the workspace shows the on-screen calculator on this paper and
 * not on Component 1, and why the answers below are written the way the paper
 * asks for them: inexact numeric answers to 3 significant figures, angles to
 * 0.1°.
 *
 * Coverage note: 15 of the paper's questions are seeded, worth 43 of the 80
 * marks. Left out, and why:
 *   - Q2 (a)–(c), 4 marks: all three parts read a printed graph of y = f(x).
 *   - Q6 (c), 3 marks: the modulus bars around the vectors are lost in the
 *     document's text layer, so the condition cannot be stated exactly.
 *   - Q9 (a)–(b), 5 marks: one asks which of four printed tetrahedron diagrams
 *     is correct, the other builds a section through a printed cube.
 *   - Q13, 4 marks: the printed interval for x is not in the text layer, so
 *     the solution set cannot be pinned down.
 *   - The document declares 15 printed pages; the file carries 11, so the
 *     remaining marks sit on pages that are not present.
 * Inventing any of it would mean inventing exam content. The workspace scales
 * what is answered onto the official 80-mark Component 2 scale, so the grade
 * stays honest either way.
 */
export const MATHS_10_P2_MAY_2024: Paper = {
  id: "maths-10-p2-2024-05",
  subjectId: "mathematics",
  componentIndex: 1,
  title: "Mathematics Component 2",
  gradeYear: 10,
  sitting: "May 2024",
  durationMinutes: 90,
  totalMarks: 80,
  calculator: true,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed from the original NIS question paper (10MATHK/02). 15 questions seeded of the paper's set; the graph, diagram and cube-section questions need printed figures, and the document's last pages are not in the file.",
  instructions: [
    "Answer all questions.",
    "A calculator is permitted — the panel beside the paper is one.",
    "You may lose marks if you do not show your working or omit units.",
    "Where no accuracy is specified: give inexact numeric answers to 3 significant figures and angles to 0.1°.",
    "Marks for each question are shown in brackets [ ].",
    "Total for this paper: 80 marks.",
  ],
  questions: [
    {
      id: "m10p2-q1",
      number: 1,
      marks: 2,
      topic: "Trigonometric Equations",
      difficulty: "foundation",
      prompt:
        "The sizes of angles A and B are given in radians: ∠A = 4π/9 and ∠B = 2. Write the sizes of these angles in degrees.",
      promptKk:
        "А және В бұрыштарының шамалары радианмен берілген: ∠A = 4π/9, ∠B = 2. Осы бұрыштардың шамаларын градуспен жазыңыз.",
      marking: "worked",
      answer: "∠A = 80°, ∠B = 114.6° (to 0.1°).",
      markScheme: [
        { text: "∠A = 4π/9 × 180/π = 80°.", marks: 1 },
        { text: "∠B = 2 × 180/π = 114.59… = 114.6°, given to 0.1° as the paper requires.", marks: 1 },
      ],
      hint: "Multiply by 180/π. The first converts exactly; the second does not, so the rubric's 0.1° rule decides how you write it.",
    },
    {
      id: "m10p2-q3",
      number: 2,
      marks: 2,
      topic: "Functions",
      difficulty: "standard",
      prompt:
        "For the functions f(x) and g(x) it is known that lim(x→c) f(x) = 3 and lim(x→c) g(x) = −1.2. Calculate lim(x→c) [4·g(x)·f(x) + 1] / [f(x) + g(x)].",
      promptKk:
        "3)(flim = және 2,1)(glim −= екені белгілі. Есептеңіз: (4g(x)f(x)+1)/(f(x)+g(x)) шегін.",
      marking: "auto",
      answerKind: "numeric",
      answer: "-7.44",
      accepts: ["−7.44", "-7.444", "-67/9", "-7,44"],
      markScheme: [
        {
          text: "Substitutes the limits into numerator and denominator: (4 × (−1.2) × 3 + 1) / (3 + (−1.2)).",
          marks: 1,
        },
        { text: "Evaluates −13.4 / 1.8 = −7.444… = −7.44 to 3 s.f.", marks: 1 },
      ],
      hint: "The limit of a quotient is the quotient of the limits when the denominator's limit is not zero. Check that first, then substitute.",
    },
    {
      id: "m10p2-q4a",
      number: 3,
      marks: 2,
      topic: "Similarity",
      difficulty: "standard",
      prompt:
        "The figure shows quadrilateral ABCD. The sides AB, BC and CD are 5 cm, 3.2 cm and 4 cm respectively. The diagonal AC bisects angle A, and ∠ABC = ∠ACD. Complete the sentence: “Triangle ABC is ___ to triangle ACD, because ___.”",
      promptKk:
        "АВС үшбұрышы ACD үшбұрышына ____ , өйткені ____ .",
      marking: "worked",
      answer:
        "Triangle ABC is similar to triangle ACD, because ∠BAC = ∠CAD (AC bisects angle A) and ∠ABC = ∠ACD (given) — two angles equal, so the triangles are similar by AA.",
      markScheme: [
        { text: "States that the triangles are similar.", marks: 1 },
        {
          text: "Justifies it with two equal angles: ∠BAC = ∠CAD from the bisector and ∠ABC = ∠ACD as given (AA).",
          marks: 1,
        },
      ],
      hint: "One equal angle comes from the bisector, the other is handed to you. Two angles are enough for similarity — name the criterion.",
    },
    {
      id: "m10p2-q4b",
      number: 4,
      marks: 2,
      topic: "Similarity",
      difficulty: "standard",
      prompt:
        "Quadrilateral ABCD, with AB = 5 cm, BC = 3.2 cm, CD = 4 cm, AC bisecting angle A and ∠ABC = ∠ACD. Find the diagonal AC.",
      promptKk: "АС диагоналін табыңыз.",
      marking: "auto",
      answerKind: "numeric",
      answer: "6.25",
      accepts: ["6,25", "6.25 cm", "6.25 см"],
      unit: "cm",
      markScheme: [
        {
          text: "Writes the ratio of corresponding sides from the similar triangles: AB/AC = BC/CD.",
          marks: 1,
        },
        { text: "Solves 5/AC = 3.2/4 to get AC = 6.25 cm.", marks: 1 },
      ],
      hint: "In similar triangles ABC and ACD, AC corresponds to AD and BC corresponds to CD. Pair the sides that sit in the same position in each triangle before you write the ratio.",
    },
    {
      id: "m10p2-q4c",
      number: 5,
      marks: 3,
      topic: "Similarity",
      difficulty: "stretch",
      prompt:
        "For the same quadrilateral, the area of triangle ABC is 7.94 cm². Calculate the area of quadrilateral ABCD.",
      promptKk:
        "АВC үшбұрышының ауданы 7,94 см² тең. АВСD төртбұрышының ауданын есептеңіз.",
      marking: "auto",
      answerKind: "numeric",
      answer: "20.3",
      accepts: ["20,3", "20.35", "20.3 cm2", "20.3 см2"],
      unit: "cm²",
      markScheme: [
        { text: "Finds the scale factor between the similar triangles: k = AC/AB = 6.25/5 = 1.25.", marks: 1 },
        { text: "Areas scale as k², so area ACD = 7.94 × 1.25² = 12.4 cm².", marks: 1 },
        { text: "Adds the two triangles: 7.94 + 12.4 = 20.3 cm² to 3 s.f.", marks: 1 },
      ],
      hint: "Lengths scale by k, areas by k². Find k from a pair of corresponding sides you already know, and remember the quadrilateral is both triangles together.",
    },
    {
      id: "m10p2-q5",
      number: 6,
      marks: 4,
      topic: "Differentiation",
      difficulty: "standard",
      prompt:
        "A curve is given by the equation y = x³ − 2x + 5. Find the equation of the normal to the curve at the point where x = 1.",
      promptKk:
        "Қисық y = x³ − 2x + 5 теңдеуімен берілген. х = 1 нүктесінде жүргізілген қисықтың нормалінің теңдеуін құрыңыз.",
      marking: "auto",
      answerKind: "expression",
      answer: "y = -x + 5",
      accepts: ["y=-x+5", "y = 5 - x", "x + y = 5", "y=5-x"],
      markScheme: [
        { text: "Differentiates: dy/dx = 3x² − 2.", marks: 1 },
        { text: "Gradient of the tangent at x = 1 is 3 − 2 = 1.", marks: 1 },
        { text: "Gradient of the normal is the negative reciprocal, −1, and the point is (1, 4).", marks: 1 },
        { text: "Forms y − 4 = −1(x − 1), so y = −x + 5.", marks: 1 },
      ],
      hint: "The normal is perpendicular to the tangent, so its gradient is −1 divided by the tangent's. Do not forget to find the y-coordinate of the point.",
    },
    {
      id: "m10p2-q6a",
      number: 7,
      marks: 4,
      topic: "Vectors",
      difficulty: "standard",
      prompt:
        "Vectors a = (2, 0, 3) and b = (1, −1, 3) are given. Find the angle between a and b.",
      promptKk: "a және b векторларының арасындағы бұрышты табыңыз.",
      marking: "auto",
      answerKind: "numeric",
      answer: "23.1",
      accepts: ["23,1", "23.1°", "23.1 degrees"],
      unit: "°",
      markScheme: [
        { text: "Scalar product a·b = 2×1 + 0×(−1) + 3×3 = 11.", marks: 1 },
        { text: "Magnitudes |a| = √13 and |b| = √11.", marks: 1 },
        { text: "cos θ = 11 / √143 = 0.9199.", marks: 1 },
        { text: "θ = 23.1° to 0.1° as the paper requires.", marks: 1 },
      ],
      hint: "cos θ = a·b / (|a||b|). This is a calculator paper — key the whole thing as one expression and round only at the end.",
    },
    {
      id: "m10p2-q6b",
      number: 8,
      marks: 1,
      topic: "Vectors",
      difficulty: "foundation",
      prompt: "For the same vectors a = (2, 0, 3) and b = (1, −1, 3), find the vector a − 2b.",
      promptKk: "a − 2b векторын табыңыз.",
      marking: "auto",
      answerKind: "expression",
      answer: "(0, 2, -3)",
      accepts: ["(0,2,-3)", "0, 2, -3", "0;2;-3", "(0; 2; −3)"],
      markScheme: [
        { text: "Component by component: (2 − 2, 0 + 2, 3 − 6) = (0, 2, −3).", marks: 1 },
      ],
      hint: "Double b first, then subtract component by component. The middle component is where the sign trips people up.",
    },
    {
      id: "m10p2-q7",
      number: 9,
      marks: 4,
      topic: "Trigonometric Identities",
      difficulty: "stretch",
      prompt:
        "Show that [1 − sin²(π/2 − α)] / [(sin 2α)/2] = tan α.",
      promptKk:
        "(1 − sin²(π/2 − α)) / (sin2α/2) = tg α екенін көрсетіңіз.",
      marking: "worked",
      answer:
        "sin(π/2 − α) = cos α, so the numerator is 1 − cos²α = sin²α. The denominator is (2 sin α cos α)/2 = sin α cos α. Hence sin²α / (sin α cos α) = sin α / cos α = tan α.",
      markScheme: [
        { text: "Uses the complementary identity sin(π/2 − α) = cos α.", marks: 1 },
        { text: "Numerator becomes 1 − cos²α = sin²α by the Pythagorean identity.", marks: 1 },
        { text: "Denominator: sin 2α = 2 sin α cos α, so (sin 2α)/2 = sin α cos α.", marks: 1 },
        { text: "Cancels one factor of sin α to reach sin α / cos α = tan α.", marks: 1 },
      ],
      hint: "Convert the shifted sine to a cosine first. After that both Pythagorean and double-angle identities are doing ordinary work.",
    },
    {
      id: "m10p2-q8",
      number: 10,
      marks: 4,
      topic: "Sequences & Induction",
      difficulty: "stretch",
      prompt:
        "Talgar Peak is the highest point of the Ile Alatau, in the Almaty reserve, at 5017 m. A tourist base sits on the mountainside at 1722 m. A group of climbers plans to reach the summit from the base in 5 days. On the first day they can climb 750 m, but on each following day they cover d m less than the day before, because the climb gets harder. What is the largest natural value d can take?",
      promptKk:
        "Бірінші күні альпинистер 750 м-ге көтеріле алады, бірақ әрбір келесі күні алдыңғы күнмен салыстырғанда d м-ге аз жүреді. d ең үлкен қандай натурал мән қабылдай алады?",
      marking: "auto",
      answerKind: "numeric",
      answer: "45",
      markScheme: [
        { text: "Height to climb: 5017 − 1722 = 3295 m.", marks: 1 },
        {
          text: "Recognises an arithmetic progression with first term 750, common difference −d, 5 terms.",
          marks: 1,
        },
        { text: "Sum = 5/2 × (2×750 − 4d) = 3750 − 10d, and this must be at least 3295.", marks: 1 },
        { text: "10d ≤ 455, so d ≤ 45.5 and the largest natural value is d = 45.", marks: 1 },
      ],
      hint: "They must cover at least the height difference, which makes this an inequality, not an equation. Work out that height first — the summit altitude alone is not the climb.",
    },
    {
      id: "m10p2-q10a",
      number: 11,
      marks: 2,
      topic: "Differentiation",
      difficulty: "foundation",
      prompt: "Find the derivative of y = (4x + 4)¹⁰.",
      promptKk: "y = (4x + 4)¹⁰ функциясының туындысын табыңыз.",
      marking: "auto",
      answerKind: "expression",
      answer: "40(4x+4)^9",
      accepts: ["40(4x + 4)^9", "40*(4x+4)^9", "40(4x+4)⁹"],
      markScheme: [
        { text: "Applies the chain rule: 10(4x + 4)⁹ × d/dx(4x + 4).", marks: 1 },
        { text: "Inner derivative is 4, giving 40(4x + 4)⁹.", marks: 1 },
      ],
      hint: "Bring the power down, reduce it by one, then multiply by the derivative of the bracket. The second mark is the one people forget.",
    },
    {
      id: "m10p2-q10b",
      number: 12,
      marks: 3,
      topic: "Differentiation",
      difficulty: "standard",
      prompt: "Find the derivative of y = x·sin x.",
      promptKk: "y = x·sin x функциясының туындысын табыңыз.",
      marking: "auto",
      answerKind: "expression",
      answer: "sin x + x cos x",
      accepts: ["sinx + xcosx", "sin(x)+x*cos(x)", "x cos x + sin x", "xcosx+sinx"],
      markScheme: [
        { text: "Identifies a product and states the product rule u′v + uv′.", marks: 1 },
        { text: "u = x gives u′ = 1; v = sin x gives v′ = cos x.", marks: 1 },
        { text: "Assembles sin x + x cos x.", marks: 1 },
      ],
      hint: "Two functions multiplied means the product rule, not the chain rule. Write down u, v, u′ and v′ before you assemble anything.",
    },
    {
      id: "m10p2-q11a",
      number: 13,
      marks: 2,
      topic: "Binomial Theorem",
      difficulty: "foundation",
      prompt:
        "Write the missing numbers in Pascal's triangle:\n1\n1 1\n1 2 1\n1 3 3 …\n1 4 … … …\n1 … … … 5 …",
      promptKk: "Паскаль үшбұрышындағы жетіспейтін сандарды жазыңыз.",
      marking: "worked",
      answer:
        "Row 3: 1 3 3 1. Row 4: 1 4 6 4 1. Row 5: 1 5 10 10 5 1.",
      markScheme: [
        { text: "Completes rows 3 and 4: 1 3 3 1 and 1 4 6 4 1.", marks: 1 },
        { text: "Completes row 5: 1 5 10 10 5 1.", marks: 1 },
      ],
      hint: "Each entry is the sum of the two above it, and every row starts and ends with 1.",
    },
    {
      id: "m10p2-q11b",
      number: 14,
      marks: 3,
      topic: "Binomial Theorem",
      difficulty: "stretch",
      prompt:
        "In the expansion of the binomial (2x + k)⁵, the coefficient of x³ is 5. Find the value of k.",
      promptKk:
        "(2x + k)⁵ биномының жіктелуіндегі x³ алдындағы коэффициент 5-ке тең. k мәнін табыңыз.",
      marking: "auto",
      answerKind: "numeric",
      answer: "±0.25",
      accepts: ["+-0.25", "0.25 and -0.25", "±1/4", "±0,25", "-0.25, 0.25"],
      markScheme: [
        { text: "Picks the term in x³: C(5,3)(2x)³k² = 10 × 8x³ × k².", marks: 1 },
        { text: "Sets the coefficient equal to 5: 80k² = 5.", marks: 1 },
        { text: "Solves k² = 1/16, so k = ±0.25 — both signs.", marks: 1 },
      ],
      hint: "The x³ term needs three factors of 2x and two of k. A squared unknown has two solutions; the question says “the value”, but the mathematics says both.",
    },
    {
      id: "m10p2-q12",
      number: 15,
      marks: 5,
      topic: "Trigonometric Equations",
      difficulty: "stretch",
      prompt: "Solve the equation cos(2x − π/6) = −√3/2 for 0 ≤ x ≤ π.",
      promptKk: "0 ≤ x ≤ π үшін cos(2x − π/6) = −√3/2 теңдеуін шешіңіз.",
      marking: "auto",
      answerKind: "expression",
      answer: "x = π/2, 2π/3",
      accepts: ["π/2, 2π/3", "pi/2, 2pi/3", "x = π/2 and x = 2π/3", "2π/3, π/2"],
      markScheme: [
        { text: "Substitutes u = 2x − π/6 and transforms the interval to −π/6 ≤ u ≤ 11π/6.", marks: 1 },
        { text: "cos u = −√3/2 has principal solution u = 5π/6.", marks: 1 },
        { text: "Second solution in the interval: u = 7π/6.", marks: 1 },
        { text: "Solves back: x = (u + π/6)/2 giving x = π/2.", marks: 1 },
        { text: "And x = 2π/3, with no other solutions in 0 ≤ x ≤ π.", marks: 1 },
      ],
      hint: "Transform the interval when you substitute, or you will lose one of the two solutions. Doubling x doubles the width of the window you are searching.",
    },
  ],
};
