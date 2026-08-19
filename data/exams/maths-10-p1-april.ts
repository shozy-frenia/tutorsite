import type { Paper } from "@/lib/exam-types";

/**
 * NIS Mathematics, Grade 10, Paper 1 — sitting of 16.04.2021.
 *
 * Same format as the March sitting: 80 marks, 90 minutes, no calculator.
 * Topic coverage overlaps deliberately — question 11 here is the identical
 * intersecting-chords problem set as question 10 in March, which is exactly
 * the sort of repeat the drilling in this app is meant to exploit.
 */
export const MATHS_10_P1_APRIL: Paper = {
  id: "maths-10-p1-2021-04-16",
  subjectId: "mathematics",
  componentIndex: 0,
  title: "Mathematics Paper 1",
  gradeYear: 10,
  sitting: "16 April 2021",
  durationMinutes: 90,
  totalMarks: 80,
  calculator: false,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed question by question from the original NIS question paper.",
  instructions: [
    "Answer all questions.",
    "Calculators are not permitted.",
    "You may lose marks if you do not show your working or omit units.",
    "Marks for each question are shown in brackets [ ].",
  ],
  questions: [
    {
      id: "b-q1",
      number: 1,
      marks: 4,
      topic: "Coordinate Geometry",
      difficulty: "standard",
      prompt:
        "Write the general equation of the line passing through E(1; −3) and perpendicular to the line 7x + 3y − 2 = 0.",
      promptKk:
        "E(1; −3) нүктесі арқылы өтетін және 7x + 3y − 2 = 0 түзуіне перпендикуляр болатын түзудің жалпы теңдеуін құрастыр.",
      marking: "auto",
      answerKind: "expression",
      answer: "3x − 7y − 24 = 0",
      accepts: ["3x-7y-24=0", "3x-7y=24", "y=(3x-24)/7", "-3x+7y+24=0"],
      markScheme: [
        { text: "Rearrange to y = −(7/3)x + 2/3, so the given gradient is −7/3", marks: 1 },
        { text: "Perpendicular gradient is the negative reciprocal, 3/7", marks: 1 },
        { text: "Apply point–gradient form: y + 3 = (3/7)(x − 1)", marks: 1 },
        { text: "Clear fractions to the general form 3x − 7y − 24 = 0", marks: 1 },
      ],
      hint: "The general form is asked for, so finish with everything on one side equal to zero — leaving it as y = mx + c drops the final mark.",
    },
    {
      id: "b-q2",
      number: 2,
      marks: 2,
      topic: "Coordinate Geometry",
      difficulty: "standard",
      prompt:
        "Line a passes through the points P(2; −3) and R(−4; −5). Determine the point A on this line such that PR / RA = 1/2.",
      promptKk:
        "a түзуі P(2; −3) және R(−4; −5) нүктелері арқылы өтеді. PR/RA = 1/2 қатынасы орындалатындай етіп, осы түзуде A нүктесін анықта.",
      marking: "auto",
      answerKind: "expression",
      answer: "A(−16; −9)",
      accepts: ["(-16,-9)", "-16,-9", "a=(-16,-9)", "(8,-1)", "8,-1"],
      markScheme: [
        { text: "PR = R − P = (−6; −2), and RA = 2·PR in length", marks: 1 },
        {
          text: "Continuing beyond R: A = R + 2·PR = (−4 − 12; −5 − 4) = (−16; −9). (The reflected point (8; −1) also satisfies the unsigned ratio.)",
          marks: 1,
        },
      ],
      hint: "Get the vector PR first, then step twice that vector on from R. Because the ratio is unsigned, check whether the reverse direction also fits.",
    },
    {
      id: "b-q3",
      number: 3,
      marks: 3,
      topic: "Combinatorics",
      difficulty: "foundation",
      prompt:
        "A sports section has 15 boys and 11 girls. A team of four boys and two girls must be chosen. In how many ways can this be done?",
      promptKk:
        "15 ұл және 11 қыз қатысатын спорт секциясынан төрт ұлдан және екі қыздан тұратын команданы таңдап алу керек. Бұны қанша тәсілмен орындауға болады?",
      marking: "auto",
      answerKind: "numeric",
      answer: "75075",
      markScheme: [
        { text: "Order does not matter — use combinations", marks: 1 },
        { text: "C(15,4) = 1365 and C(11,2) = 55", marks: 1 },
        { text: "Multiply: 1365 × 55 = 75075", marks: 1 },
      ],
      hint: "Choose the boys and the girls independently, then multiply. Adding the two counts is the classic error here.",
    },
    {
      id: "b-q4",
      number: 4,
      marks: 3,
      topic: "Binomial Theorem",
      difficulty: "standard",
      prompt:
        "Find the sum of the coefficients of the polynomial in x obtained in the expansion of the binomial (5 − 6x)¹¹.",
      promptKk:
        "(5 − 6x)¹¹ биномының жіктелуінде шығатын x-ке қатысты көпмүшенің коэффициенттерінің қосындысын тап.",
      marking: "auto",
      answerKind: "numeric",
      answer: "-1",
      accepts: ["−1", "-1"],
      markScheme: [
        {
          text: "Recognise that the sum of all coefficients is the value of the polynomial at x = 1",
          marks: 1,
        },
        { text: "Substitute x = 1: (5 − 6)¹¹", marks: 1 },
        { text: "= (−1)¹¹ = −1", marks: 1 },
      ],
      hint: "You never need to expand this. Setting x = 1 turns every power of x into 1, so the polynomial's value *is* the sum of its coefficients.",
    },
    {
      id: "b-q5",
      number: 5,
      marks: 3,
      topic: "Similarity",
      difficulty: "standard",
      prompt:
        "It is known that △DOG ~ △PET with DO = x, OG = x + 6, PE = 16 and ET = 2x. Find the ratio of the areas of these triangles.",
      promptKk:
        "△DOG ~ △PET және DO = x, OG = x + 6, PE = 16, ET = 2x екені белгілі. Осы үшбұрыштардың аудандарының қатынасын тап.",
      marking: "auto",
      answerKind: "expression",
      answer: "9 : 16",
      accepts: ["9:16", "9/16", "0.5625", "9 to 16"],
      markScheme: [
        {
          text: "Corresponding sides give DO/PE = OG/ET, so x/16 = (x + 6)/(2x)",
          marks: 1,
        },
        { text: "Cross-multiply and solve 2x² − 16x − 96 = 0 to get x = 12", marks: 1 },
        {
          text: "Linear scale factor 12/16 = 3/4, so the area ratio is (3/4)² = 9/16",
          marks: 1,
        },
      ],
      hint: "The letter order fixes which sides correspond: D↔P, O↔E, G↔T. And areas scale with the *square* of the linear ratio.",
    },
    {
      id: "b-q6",
      number: 6,
      marks: 3,
      topic: "Trigonometric Identities",
      difficulty: "standard",
      prompt: "Simplify (sin t + cos t) / (sec t + cosec t).",
      promptKk: "Өрнекті ықшамда: (sin t + cos t)/(sec t + cosec t)",
      marking: "auto",
      answerKind: "expression",
      answer: "sin t cos t",
      accepts: ["sintcost", "sin t · cos t", "(1/2)sin2t", "0.5sin2t", "sin2t/2"],
      markScheme: [
        {
          text: "Write sec t + cosec t = 1/cos t + 1/sin t = (sin t + cos t)/(sin t cos t)",
          marks: 1,
        },
        { text: "Divide by the fraction — that is, multiply by its reciprocal", marks: 1 },
        { text: "Cancel (sin t + cos t) to leave sin t cos t", marks: 1 },
      ],
      hint: "Turn the denominator into a single fraction first. The numerator then appears inside it and cancels straight out.",
    },
    {
      id: "b-q7",
      number: 7,
      marks: 3,
      topic: "Trigonometric Identities",
      difficulty: "standard",
      prompt: "Simplify sin(π/2 − α) − cos(π + α) + tan(π + α) − cot(3π/2 − α).",
      promptKk:
        "Өрнекті ықшамда: sin(π/2 − α) − cos(π + α) + tg(π + α) − ctg(3π/2 − α)",
      marking: "auto",
      answerKind: "expression",
      answer: "2 cos α",
      accepts: ["2cosa", "2cosα", "2 cos a", "2·cosα"],
      markScheme: [
        { text: "sin(π/2 − α) = cos α and cos(π + α) = −cos α, so the first two terms give 2cos α", marks: 1 },
        { text: "tan(π + α) = tan α", marks: 1 },
        { text: "cot(3π/2 − α) = tan α, so the last two terms cancel, leaving 2 cos α", marks: 1 },
      ],
      hint: "Reduce each term with the reduction formulas separately. The two tangent terms are identical and cancel — spot that before simplifying anything else.",
    },
    {
      id: "b-q8",
      number: 8,
      marks: 3,
      topic: "Circle Geometry",
      difficulty: "standard",
      prompt:
        "From a point P outside a circle, two tangents PK and PE are drawn. The points of tangency K and E divide the circle into two arcs whose degree measures are in the ratio 5 : 7. Find ∠P.",
      promptKk:
        "Шеңберден тысқары жатқан P нүктесінен екі PK және PE жанамалары жүргізілген. K және E жанасу нүктелері шеңберді градустық өлшемдерінің қатынасы 5 : 7 болатындай екі доғаға бөледі. ∠P-ны тап.",
      marking: "auto",
      answerKind: "numeric",
      answer: "30",
      accepts: ["30°", "30 deg", "30 degrees"],
      unit: "°",
      markScheme: [
        { text: "Let the arcs be 5k and 7k with 5k + 7k = 360°, so k = 30°", marks: 1 },
        { text: "The arcs measure 150° and 210°", marks: 1 },
        {
          text: "Angle between two tangents = half the difference of the arcs = (210° − 150°)/2 = 30°",
          marks: 1,
        },
      ],
      hint: "The two arcs must total 360°, which fixes k immediately. Then the external angle is half the *difference* of the arcs, not half their sum.",
    },
    {
      id: "b-q9",
      number: 9,
      marks: 3,
      topic: "Circle Geometry",
      difficulty: "stretch",
      prompt: "Find angle ACE from the diagram.",
      promptKk: "АСЕ бұрышын тап.",
      figure: "/exams/m10p1-b-q09-circle.png",
      figureAlt:
        "Circle through points D, F and E. Lines from C pass through the circle; angles of 35° are marked at A and at B, and an arc of 150° is marked inside the circle.",
      marking: "worked",
      answer:
        "Work in arcs. The 150° arc plus the two 35° external angles fix the remaining arcs of the circle: for each external vertex, the angle equals half the difference of the arcs its two lines intercept. Write one such equation at A and one at B, solve for the unknown arcs, then read ∠ACE as half the difference of the arcs intercepted at C.",
      markScheme: [
        {
          text: "Apply the external-angle rule at A: 35° = ½(far arc − near arc)",
          marks: 1,
        },
        { text: "Apply the same rule at B with the 150° arc to find the remaining arcs", marks: 1 },
        { text: "Use the arcs intercepted at C to obtain ∠ACE", marks: 1 },
      ],
      hint: "Every angle in this figure is half of either one arc (on the circle) or a difference of two arcs (off the circle). Label all four arcs as unknowns summing to 360° and write one equation per marked angle.",
    },
    {
      id: "b-q10",
      number: 10,
      marks: 5,
      topic: "Circle Geometry",
      difficulty: "standard",
      prompt:
        "A circle is inscribed in an isosceles trapezium of perimeter 64 cm. Find the length of the lateral side of the trapezium.",
      promptKk:
        "Периметрі 64 см болатын теңбүйірлі трапецияға іштей шеңбер сызылған. Трапецияның бүйір қабырғасының ұзындығын тап.",
      marking: "auto",
      answerKind: "numeric",
      answer: "16",
      accepts: ["16cm", "16 cm"],
      unit: "cm",
      markScheme: [
        {
          text: "A circle can be inscribed only if the sums of opposite sides are equal (Pitot's theorem)",
          marks: 1,
        },
        { text: "So (top + bottom) = (left + right) = 2 × lateral side", marks: 1 },
        { text: "The two lateral sides are equal since the trapezium is isosceles", marks: 1 },
        { text: "Perimeter = 2 × lateral + 2 × lateral = 4 × lateral = 64", marks: 1 },
        { text: "Lateral side = 16 cm", marks: 1 },
      ],
      hint: "The tangential-quadrilateral condition — opposite sides summing equally — is the whole question. It turns the perimeter into four equal lateral lengths.",
    },
    {
      id: "b-q11",
      number: 11,
      marks: 3,
      topic: "Circle Geometry",
      difficulty: "standard",
      prompt:
        "Chords AB and CD of a circle intersect at point P. Given CP = 5 cm, DP = 8 cm, and that BP is 3 cm shorter than AP, find the lengths of AP and BP.",
      promptKk:
        "Шеңбердің AB және CD хордалары P нүктесінде қиылысады. Егер CP = 5 см, DP = 8 см, ал BP кесіндісінің ұзындығы AP кесіндісінің ұзындығынан 3 см кем болса, AP және BP кесінділерінің ұзындықтарын тап.",
      marking: "auto",
      answerKind: "expression",
      answer: "AP = 8 cm, BP = 5 cm",
      accepts: ["ap=8,bp=5", "8,5", "8 and 5", "ap=8cm,bp=5cm", "8cm,5cm"],
      markScheme: [
        { text: "Intersecting chords: AP · BP = CP · DP = 40", marks: 1 },
        { text: "Substitute BP = AP − 3 to get AP² − 3·AP − 40 = 0", marks: 1 },
        { text: "Solve and reject the negative root: AP = 8 cm, BP = 5 cm", marks: 1 },
      ],
      hint: "This is the identical problem to question 10 of the March paper, worth 5 marks there and 3 here — the same two lines of working earn it.",
    },
    {
      id: "b-q12",
      number: 12,
      marks: 4,
      topic: "Inequalities",
      difficulty: "stretch",
      prompt:
        "There are four inequalities that define the region R shown on the grid. One of these is y ≤ x + 1. Find the other three.",
      figure: "/exams/m10p1-b-q12-region.png",
      figureAlt:
        "Coordinate grid from 0 to 6 on x and 0 to 3 on y, with two parallel solid lines of gradient 1 and one dashed line of negative gradient. The unshaded region R sits between them.",
      marking: "worked",
      answer:
        "Read one inequality per boundary line of R. The two solid lines have gradient 1 (y = x + 1 above, y = x − 1 below), and the dashed line runs from (0; 3) to (6; 0), i.e. x + 2y = 6. Together with the horizontal boundary the region is bounded by y ≥ x − 1, x + 2y ≤ 6 and y ≥ 1. Check each by substituting a point clearly inside R.",
      markScheme: [
        { text: "Identify the equation of each boundary line from two points on it", marks: 2 },
        { text: "Choose the correct side for each, testing an interior point of R", marks: 1 },
        {
          text: "Use ≤ / ≥ for solid boundaries and < / > for dashed ones, matching the printed grid",
          marks: 1,
        },
      ],
      hint: "Do it in two stages: get the *equation* of each line from two grid points it passes through, then pick a point well inside R and test which way each inequality must face.",
    },
    {
      id: "b-q13",
      number: 13,
      marks: 3,
      topic: "Functions",
      difficulty: "standard",
      prompt: "Two functions are given: f(x) = 5x + 4 and g(x) = 1/(2x), x ≠ 0. Answer the following.",
      promptKk: "Екі берілген функция бойынша сұрақтарға жауап беріңіз",
      parts: ["a) f(f(1))", "b) g(f(x))", "c) f⁻¹(x)"],
      marking: "auto",
      answerKind: "expression",
      answer: "a) 49  b) 1/(10x + 8)  c) (x − 4)/5",
      accepts: [
        "49, 1/(10x+8), (x-4)/5",
        "49;1/(10x+8);(x-4)/5",
        "a)49 b)1/(10x+8) c)(x-4)/5",
        "49,1/(2(5x+4)),(x-4)/5",
      ],
      markScheme: [
        { text: "a) f(1) = 9, then f(9) = 45 + 4 = 49", marks: 1 },
        { text: "b) g(f(x)) = 1/(2(5x + 4)) = 1/(10x + 8)", marks: 1 },
        { text: "c) Set y = 5x + 4 and solve for x: f⁻¹(x) = (x − 4)/5", marks: 1 },
      ],
      hint: "g(f(x)) means substitute f into g — the inner function goes where g's variable was. Doing it the other way round gives 1/(10x) + 4, a different function.",
    },
    {
      id: "b-q14",
      number: 14,
      marks: 6,
      topic: "Combinatorics",
      difficulty: "stretch",
      prompt: "Consider the twelve letters of the word REFRIGERATOR.",
      parts: [
        "a) Find the number of different arrangements of all twelve letters if: 1) there are no restrictions; 2) all the letters R must stand together; 3) identical letters must stand together.",
        "b) How many different ways are there to choose four letters from REFRIGERATOR containing no letter R and containing two letters E?",
      ],
      marking: "auto",
      answerKind: "expression",
      answer: "a1) 9979200  a2) 181440  a3) 40320  b) 15",
      accepts: [
        "9979200,181440,40320,15",
        "9979200;181440;40320;15",
        "a1)9979200 a2)181440 a3)40320 b)15",
      ],
      markScheme: [
        { text: "Identify the letter counts: four R, two E, and six distinct letters", marks: 1 },
        { text: "a1) 12! / (4! · 2!) = 9979200", marks: 1 },
        { text: "a2) Treat RRRR as one block: 9! / 2! = 181440", marks: 1 },
        { text: "a3) Block RRRR and block EE with six singles: 8! = 40320", marks: 1 },
        {
          text: "b) Both E are forced, so choose 2 more from the six distinct non-R letters",
          marks: 1,
        },
        { text: "b) C(6,2) = 15", marks: 1 },
      ],
      hint: "Count the letters before anything else: R appears four times and E twice. In a3) both repeated letters get blocked, which leaves eight distinct objects and no division at all.",
    },
    {
      id: "b-q15",
      number: 15,
      marks: 6,
      topic: "Combinatorics",
      difficulty: "stretch",
      prompt:
        "In a shop, 5 identical boxes of toffee, 4 identical boxes of fruit-flavoured chewing gum and 9 identical boxes of sweets are placed in a row on a shelf. In how many ways can the boxes be arranged so that the boxes of sweets stand together?",
      promptKk:
        "Дүкенде иристің 5 бірдей қорабы, жеміс дәмі бар сағыздың 4 бірдей қорабы және кәмпиттің 9 бірдей қорабы сөреде бір қатарда орналасқан. Кәмпиттер қорабы бірге тұратындай етіп, қораптарды қанша тәсілмен орналастыруға болады?",
      marking: "auto",
      answerKind: "numeric",
      answer: "1260",
      markScheme: [
        { text: "Treat the nine identical sweet boxes as a single block", marks: 1 },
        {
          text: "The block does not permute internally, because the boxes inside it are identical",
          marks: 1,
        },
        { text: "This leaves 5 + 4 + 1 = 10 objects to arrange", marks: 1 },
        { text: "Divide by the repeats: 10! / (5! · 4! · 1!)", marks: 2 },
        { text: "= 3628800 / 2880 = 1260", marks: 1 },
      ],
      hint: "The usual block trick multiplies by the internal arrangements of the block — but here those boxes are identical, so that factor is 1, not 9!.",
    },
    {
      id: "b-q16",
      number: 16,
      marks: 3,
      topic: "Inverse Trigonometry",
      difficulty: "standard",
      prompt: "Evaluate cos(arcsin(−3/5)).",
      promptKk: "Есептеңіз: cos(arcsin(−3/5))",
      marking: "auto",
      answerKind: "expression",
      answer: "4/5",
      accepts: ["0.8", "4/5", ".8"],
      markScheme: [
        { text: "Let θ = arcsin(−3/5), so sin θ = −3/5", marks: 1 },
        {
          text: "θ lies in [−π/2, π/2], the range of arcsin, where cosine is non-negative",
          marks: 1,
        },
        { text: "cos θ = +√(1 − 9/25) = 4/5", marks: 1 },
      ],
      hint: "The sign is the whole question. arcsin only ever returns an angle in [−π/2, π/2], and cosine is positive across all of it — so the answer is +4/5, not −4/5.",
    },
    {
      id: "b-q17",
      number: 17,
      marks: 3,
      topic: "Trigonometric Equations",
      difficulty: "standard",
      prompt: "Solve the equation 2sin²x − 5cos x + 1 = 0.",
      promptKk: "Теңдеуді шешіңіз: 2sin²x − 5cos x + 1 = 0",
      marking: "auto",
      answerKind: "expression",
      answer: "x = ±π/3 + 2πn",
      accepts: [
        "±π/3+2πn",
        "x=±pi/3+2pin",
        "±pi/3+2pin",
        "x=±60°+360°n",
        "x=π/3+2πn, x=-π/3+2πn",
      ],
      markScheme: [
        {
          text: "Replace sin²x with 1 − cos²x to get a quadratic in cos x: 2cos²x + 5cos x − 3 = 0",
          marks: 1,
        },
        { text: "Solve: cos x = 1/2 or cos x = −3", marks: 1 },
        {
          text: "Reject cos x = −3 as out of range; cos x = 1/2 gives x = ±π/3 + 2πn",
          marks: 1,
        },
      ],
      hint: "Convert to a single trigonometric function before solving. Rejecting cos x = −3 explicitly — because cosine never leaves [−1, 1] — is worth a mark on its own.",
    },
    {
      id: "b-q18",
      number: 18,
      marks: 3,
      topic: "Inequalities",
      difficulty: "foundation",
      prompt: "Solve the inequality cos x < 1.",
      promptKk: "Теңсіздікті шешіңіз: cos x < 1",
      marking: "auto",
      answerKind: "expression",
      answer: "x ≠ 2πn, n ∈ ℤ",
      accepts: [
        "x≠2πn",
        "x≠2pin",
        "all x except 2πn",
        "r\\{2πn}",
        "x∈r, x≠2πn",
        "x≠2πn,n∈z",
      ],
      markScheme: [
        { text: "cos x ≤ 1 for every real x, so the inequality fails only at equality", marks: 1 },
        { text: "cos x = 1 exactly when x = 2πn, n ∈ ℤ", marks: 1 },
        { text: "Therefore the solution is all real x except x = 2πn", marks: 1 },
      ],
      hint: "Do not solve this as a normal inequality. Cosine already never exceeds 1, so the only thing to exclude is where it equals 1.",
    },
  ],
};
