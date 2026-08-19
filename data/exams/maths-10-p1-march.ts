import type { Paper } from "@/lib/exam-types";

/**
 * NIS Mathematics, Grade 10, Paper 1 — sitting of 05.03.2021.
 *
 * Transcribed from the original question paper. 80 marks, 90 minutes, no
 * calculator. Question stems are translated from Kazakh; the original stem is
 * kept alongside for the questions that carry prose. Answers and mark schemes
 * are worked from the questions themselves.
 */
export const MATHS_10_P1_MARCH: Paper = {
  id: "maths-10-p1-2021-03-05",
  subjectId: "mathematics",
  componentIndex: 0,
  title: "Mathematics Paper 1",
  gradeYear: 10,
  sitting: "5 March 2021",
  durationMinutes: 90,
  totalMarks: 80,
  calculator: false,
  instructions: [
    "Answer all questions.",
    "Calculators are not permitted.",
    "You may lose marks if you do not show your working or omit units.",
    "Marks for each question are shown in brackets [ ].",
  ],
  questions: [
    {
      id: "a-q1",
      number: 1,
      marks: 4,
      topic: "Vectors",
      difficulty: "standard",
      prompt:
        "In square ABCD, point E divides side BC from B in the ratio 5 : 3, and F is the midpoint of side CD. Let b = AB and d = AD.",
      promptKk:
        "ABCD шаршысында E нүктесі BC қабырғасын B нүктесінен санағанда 5 : 3 қатынасында бөледі, ал F нүктесі — CD қабырғасының ортасы. b = AB, d = AD.",
      parts: [
        "1) Express the vector EF in terms of b and d.",
        "2) Given |EF| = 10, find |b| and |d|.",
      ],
      marking: "auto",
      answerKind: "expression",
      answer: "EF = 3/8 d - 1/2 b; |b| = |d| = 16",
      accepts: [
        "EF=3/8d-1/2b; |b|=|d|=16",
        "3/8d-1/2b, 16",
        "-1/2b+3/8d; 16",
        "EF=-1/2b+3/8d, |b|=|d|=16",
      ],
      markScheme: [
        { text: "Position E correctly: AE = b + (5/8)d", marks: 1 },
        { text: "Position F correctly: AF = (1/2)b + d", marks: 1 },
        { text: "EF = AF − AE = (3/8)d − (1/2)b", marks: 1 },
        {
          text: "Use perpendicularity and |b| = |d| = s: |EF|² = (1/4 + 9/64)s² = (25/64)s², so (5/8)s = 10 and s = 16",
          marks: 1,
        },
      ],
      hint: "BC is the same vector as AD. Write both AE and AF from A, then subtract — EF never needs its own construction.",
    },
    {
      id: "a-q2",
      number: 2,
      marks: 2,
      topic: "Coordinate Geometry",
      difficulty: "foundation",
      prompt: "Prove that the points M(−4; −19), N(1; 1) and K(0; −3) lie on one straight line.",
      promptKk:
        "M(−4; −19), N(1; 1) және K(0; −3) нүктелері бір түзудің бойында жататынын дәлелде.",
      marking: "auto",
      answerKind: "numeric",
      answer: "4",
      accepts: ["gradient 4", "k=4", "slope 4"],
      markScheme: [
        { text: "Gradient MN = (1 − (−19)) / (1 − (−4)) = 20/5 = 4", marks: 1 },
        {
          text: "Gradient MK = (−3 − (−19)) / (0 − (−4)) = 16/4 = 4; equal gradients through a common point M ⇒ collinear",
          marks: 1,
        },
      ],
      hint: "Two gradients from the same point are enough. Equal gradient plus a shared point is the whole proof — you do not need the third pair.",
    },
    {
      id: "a-q3",
      number: 3,
      marks: 6,
      topic: "Coordinate Geometry",
      difficulty: "standard",
      prompt:
        "The points A(3m − 1; 3), B(4m; m + 2), C(0; m + 3) and D(m; 4m − 1) are given.",
      promptKk:
        "A(3m−1; 3), B(4m; m+2), C(0; m+3) және D(m; 4m−1) нүктелері берілген.",
      parts: [
        "1) Find the gradients of the lines AB and CD.",
        "2) For which value of m are AB and CD parallel?",
      ],
      marking: "auto",
      answerKind: "expression",
      answer: "m = ±√2",
      accepts: ["m=±√2", "±√2", "m=√2 or m=-√2", "sqrt2,-sqrt2", "m=±sqrt(2)"],
      markScheme: [
        { text: "Gradient AB = (m + 2 − 3) / (4m − (3m − 1)) = (m − 1)/(m + 1)", marks: 2 },
        { text: "Gradient CD = (4m − 1 − (m + 3)) / (m − 0) = (3m − 4)/m", marks: 2 },
        { text: "Set equal and cross-multiply: m(m − 1) = (3m − 4)(m + 1)", marks: 1 },
        { text: "Simplify to 2m² − 4 = 0, so m² = 2 and m = ±√2", marks: 1 },
      ],
      hint: "Expand both sides fully before collecting. The −m terms cancel, which is what collapses a quadratic-looking equation to m² = 2.",
    },
    {
      id: "a-q4",
      number: 4,
      marks: 4,
      topic: "Sequences & Induction",
      difficulty: "stretch",
      prompt:
        "Prove that the value of the expression 5ⁿ − 4n + 15, where n is a natural number, is divisible by 16 without remainder.",
      promptKk:
        "5ⁿ − 4n + 15 өрнегінің мәні, мұнда n — натурал сан, 16-ға қалдықсыз бөлінетінін дәлелде.",
      marking: "worked",
      answer:
        "Induction. Base n = 1: 5 − 4 + 15 = 16 ✓. Assume 5ᵏ − 4k + 15 = 16t. Then 5ᵏ⁺¹ − 4(k+1) + 15 = 5(5ᵏ − 4k + 15) + 16k − 64 = 16(5t + k − 4), divisible by 16.",
      markScheme: [
        { text: "Base case n = 1 verified: 5 − 4 + 15 = 16", marks: 1 },
        { text: "State inductive hypothesis 5ᵏ − 4k + 15 = 16t for some integer t", marks: 1 },
        {
          text: "Form the (k+1) expression and rewrite as 5(5ᵏ − 4k + 15) + 16k − 64",
          marks: 1,
        },
        { text: "Conclude 16(5t + k − 4), hence divisible by 16 for all natural n", marks: 1 },
      ],
      hint: "Multiply the hypothesis by 5, then ask what you must add back to recover the (k+1) expression. The correction term 16k − 64 is already a multiple of 16.",
    },
    {
      id: "a-q5",
      number: 5,
      marks: 3,
      topic: "Combinatorics",
      difficulty: "foundation",
      prompt:
        "In how many ways can a school-day timetable consisting of 4 different lessons be built from 8 subjects?",
      promptKk:
        "8 оқу пәнінен 4 әртүрлі сабақтан тұратын оқу күнінің кестесін неше тәсілмен құрастыруға болады?",
      marking: "auto",
      answerKind: "numeric",
      answer: "1680",
      markScheme: [
        { text: "Recognise order matters — this is an arrangement, not a selection", marks: 1 },
        { text: "A(8,4) = 8 × 7 × 6 × 5", marks: 1 },
        { text: "= 1680", marks: 1 },
      ],
      hint: "A timetable is ordered — lesson 1 differs from lesson 4. That makes it A(8,4), not C(8,4).",
    },
    {
      id: "a-q6",
      number: 6,
      marks: 3,
      topic: "Coordinate Geometry",
      difficulty: "standard",
      prompt:
        "A(−10; 6), B(−2; 4) and C(−4; −2) are the vertices of a triangle. The point D(6; 2) lies on line AB. Find the coordinates of point E so that triangles ABC and ADE are similar.",
      promptKk:
        "A(−10; 6), B(−2; 4), C(−4; −2) нүктелері — үшбұрыштың төбелері. AB түзуінде D(6; 2) нүктесі берілген. ABC және ADE үшбұрыштары ұқсас болатындай етіп, E нүктесінің координаталарын тап.",
      marking: "auto",
      answerKind: "expression",
      answer: "E(2; −10)",
      accepts: ["(2,-10)", "2,-10", "E=(2,-10)", "x=2,y=-10"],
      markScheme: [
        { text: "AB = (8; −2) and AD = (16; −4) = 2·AB, so the scale factor is 2", marks: 1 },
        { text: "AC = (6; −8), therefore AE = 2·AC = (12; −16)", marks: 1 },
        { text: "E = A + (12; −16) = (2; −10)", marks: 1 },
      ],
      hint: "A is the common vertex. Find the scale factor from AD ÷ AB first — everything else follows from it.",
    },
    {
      id: "a-q7",
      number: 7,
      marks: 3,
      topic: "Trigonometric Identities",
      difficulty: "standard",
      prompt: "Evaluate (sin 630° − cos 540°) / (tan(−225°) − cot 270°).",
      promptKk: "Есепте: (sin630° − cos540°) / (tg(−225°) − ctg270°)",
      marking: "auto",
      answerKind: "numeric",
      answer: "0",
      markScheme: [
        { text: "sin 630° = sin 270° = −1 and cos 540° = cos 180° = −1", marks: 1 },
        { text: "tan(−225°) = −tan 225° = −1 and cot 270° = 0", marks: 1 },
        { text: "Numerator = −1 − (−1) = 0, so the whole expression = 0 / (−1) = 0", marks: 1 },
      ],
      hint: "Reduce every angle into [0°, 360°) first. The numerator collapses to zero — check it before spending time on the denominator.",
    },
    {
      id: "a-q8",
      number: 8,
      marks: 3,
      topic: "Trigonometric Identities",
      difficulty: "standard",
      prompt: "Simplify (sin³α + cos³α) / (sin α + cos α).",
      promptKk: "Өрнекті ықшамда: (sin³α + cos³α)/(sinα + cosα)",
      marking: "auto",
      answerKind: "expression",
      answer: "1 − sin α cos α",
      accepts: [
        "1-sinacosa",
        "1-sin a cos a",
        "1-sinαcosα",
        "1-(1/2)sin2a",
        "1-0.5sin2a",
        "1-sin2a/2",
      ],
      markScheme: [
        {
          text: "Apply the sum of cubes: sin³α + cos³α = (sin α + cos α)(sin²α − sin α cos α + cos²α)",
          marks: 1,
        },
        { text: "Cancel the common factor (sin α + cos α)", marks: 1 },
        { text: "Use sin²α + cos²α = 1 to give 1 − sin α cos α", marks: 1 },
      ],
      hint: "a³ + b³ = (a + b)(a² − ab + b²). The denominator is sitting there as the first factor.",
    },
    {
      id: "a-q9",
      number: 9,
      marks: 3,
      topic: "Circle Geometry",
      difficulty: "stretch",
      prompt:
        "Two secants are drawn from point P, meeting the circle at A, B and at C, D respectively. AB is a diameter of the circle with centre O. Point B lies between A and P, and point C lies between D and P. Given ∠DAP = 60° and ∠P = 18°, find ∠OCD.",
      promptKk:
        "P нүктесінен екі қиюшы жүргізілген, олар шеңберді сәйкесінше A, B және C, D нүктелерінде қиып өтеді. AB — центрі O нүктесінде болатын шеңбердің диаметрі. B нүктесі A және P нүктелерінің арасында жатыр, ал C нүктесі — D және P нүктелерінің арасында. Егер ∠DAP = 60°, ∠P = 18° болса, ∠OCD-ны тап.",
      marking: "auto",
      answerKind: "numeric",
      answer: "42",
      accepts: ["42°", "42 deg", "42 degrees"],
      unit: "°",
      markScheme: [
        {
          text: "In triangle APD, ∠ADP = 180° − 60° − 18° = 102°, so inscribed ∠ADC = 102° and arc ABC = 204°",
          marks: 1,
        },
        {
          text: "AB is a diameter so arc AB = 180°, giving arc BC = 24°; inscribed ∠DAB = 60° gives arc BCD = 120°, so arc CD = 96°",
          marks: 1,
        },
        {
          text: "Triangle OCD is isosceles with central angle ∠COD = 96°, so ∠OCD = (180° − 96°)/2 = 42°",
          marks: 1,
        },
      ],
      hint: "Convert every angle to an arc first. The diameter fixes arc AB at 180°, which is the extra equation that unlocks arc CD.",
    },
    {
      id: "a-q10",
      number: 10,
      marks: 5,
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
        { text: "Intersecting chords: AP · BP = CP · DP", marks: 1 },
        { text: "AP · BP = 5 × 8 = 40", marks: 1 },
        { text: "Substitute BP = AP − 3 to get AP² − 3·AP − 40 = 0", marks: 1 },
        { text: "Factorise (AP − 8)(AP + 5) = 0", marks: 1 },
        { text: "Reject the negative root: AP = 8 cm and BP = 5 cm", marks: 1 },
      ],
      hint: "The intersecting-chord product gives you 40 immediately. From there it is a quadratic — and you must reject the negative root explicitly to earn the last mark.",
    },
    {
      id: "a-q11",
      number: 11,
      marks: 3,
      topic: "Functions",
      difficulty: "standard",
      prompt: "Investigate the function f(x) = |x + 5| + |x − 5| for even/odd parity.",
      promptKk: "Функцияны жұп-тақтылыққа зерттеңіз: f(x) = |x + 5| + |x − 5|",
      marking: "auto",
      answerKind: "choice",
      options: ["Even", "Odd", "Neither even nor odd", "Both even and odd"],
      answer: "Even",
      markScheme: [
        { text: "State the domain is ℝ, which is symmetric about the origin", marks: 1 },
        { text: "f(−x) = |−x + 5| + |−x − 5| = |x − 5| + |x + 5|", marks: 1 },
        { text: "f(−x) = f(x), therefore f is even", marks: 1 },
      ],
      hint: "|−a| = |a|. Factor a −1 out of each modulus and the two terms simply swap places.",
    },
    {
      id: "a-q12",
      number: 12,
      marks: 4,
      topic: "Solid Geometry",
      difficulty: "stretch",
      prompt:
        "A regular tetrahedron is given (all faces are equilateral triangles). Point E is the midpoint of edge AD. Find the angle between BE and AC.",
      promptKk:
        "Дұрыс тетраэдр берілген (барлық жақтары тең қабырғалы үшбұрыш). Е — нүктесі АД қырының ортасы. Табу керек: ВЕ және АС арасындағы бұрыш",
      figure: "/exams/m10p1-a-q12-tetrahedron.png",
      figureAlt:
        "Regular tetrahedron ABCD with apex D, base vertices A, B, C and point E marked on edge AD",
      marking: "auto",
      answerKind: "expression",
      answer: "arccos(√3/6) ≈ 73.2°",
      accepts: [
        "arccos(√3/6)",
        "arccos(sqrt3/6)",
        "73.2",
        "73.2°",
        "73",
        "73°",
        "arccos(0.2887)",
      ],
      markScheme: [
        {
          text: "Set A as origin with AB = b, AC = c, AD = d, all of length a and pairwise dot product a²/2",
          marks: 1,
        },
        { text: "BE = d/2 − b, so BE · c = a²/4 − a²/2 = −a²/4", marks: 1 },
        { text: "|BE|² = a²/4 − a²/2 + a² = 3a²/4, so |BE| = (a√3)/2", marks: 1 },
        {
          text: "cos θ = |−a²/4| / ((a√3/2)·a) = √3/6, giving θ = arccos(√3/6) ≈ 73.2°",
          marks: 1,
        },
      ],
      hint: "Vectors beat construction here. Every pair of edges from A meets at 60°, so every dot product is a²/2 before you start.",
    },
    {
      id: "a-q13",
      number: 13,
      marks: 3,
      topic: "Solid Geometry",
      difficulty: "standard",
      prompt:
        "Construct the cross-section of the plane passing through the three given points M, N and K.",
      promptKk: "Берілген үш нүкте арқылы өтетін жазықтықтың қимасын салыңыз.",
      figure: "/exams/m10p1-a-q13-section.png",
      figureAlt: "Tetrahedron with points M, N and K marked on three of its edges",
      marking: "worked",
      answer:
        "Join the pairs of points that lie in a common face (MN and NK lie in visible faces). Extend MN and the edge it meets to find the trace of the cutting plane on the base plane, then join that trace point to K to locate the fourth vertex of the section on the remaining edge. The section is the closed polygon formed by these intersection lines.",
      markScheme: [
        { text: "Join points lying in the same face of the solid", marks: 1 },
        {
          text: "Extend a section line and a base edge to find the trace point of the plane on the base",
          marks: 1,
        },
        {
          text: "Use the trace to complete the section on the remaining face, giving the closed cross-section polygon",
          marks: 1,
        },
      ],
      hint: "You may only join two points directly if they sit in the same face. When they do not, build the trace line of the plane on the base first.",
    },
    {
      id: "a-q14",
      number: 14,
      marks: 6,
      topic: "Combinatorics",
      difficulty: "stretch",
      prompt:
        "Find how many different numbers can be made by arranging all nine digits of the number 223 677 888.",
      parts: [
        "(i) if there are no restrictions [2]",
        "(ii) if the number made is an even number [4]",
      ],
      marking: "auto",
      answerKind: "expression",
      answer: "(i) 15120  (ii) 10080",
      accepts: ["15120,10080", "15120 and 10080", "i)15120 ii)10080", "15120;10080"],
      markScheme: [
        { text: "(i) Identify repeats: two 2s, two 7s, three 8s", marks: 1 },
        { text: "(i) 9! / (2! · 2! · 3!) = 15120", marks: 1 },
        { text: "(ii) Split by final digit — it must be 2, 6 or 8", marks: 1 },
        { text: "(ii) Ends in 2: 8!/(2!·3!) = 3360; ends in 6: 8!/(2!·2!·3!) = 1680", marks: 1 },
        { text: "(ii) Ends in 8: 8!/(2!·2!·2!) = 5040", marks: 1 },
        { text: "(ii) Total = 3360 + 1680 + 5040 = 10080", marks: 1 },
      ],
      hint: "For part (ii) fix the last digit first, then count arrangements of what is left. The three cases have different repeat patterns, so you cannot shortcut them into one.",
    },
    {
      id: "a-q15",
      number: 15,
      marks: 6,
      topic: "Probability",
      difficulty: "stretch",
      prompt:
        "Boxes A, B and C contain white and black balls. Box A holds 4 white and 6 black, box B holds 7 white and 3 black, box C holds 5 white and 5 black.",
      promptKk:
        "А, В және С қораптарында ақ және қара шарлар бар. А қорабында 4 ақ және 6 қара, В қорабында 7 ақ және 3 қара, С қорабында 5 ақ және 5 қара шар бар.",
      parts: [
        "a) A box is chosen at random and a ball drawn from it. What is the probability the ball is white and came from box A?",
        "b) Two balls are chosen at random from the 30 balls. What is the probability the two balls are different colours?",
      ],
      marking: "auto",
      answerKind: "expression",
      answer: "a) 2/15  b) 224/435",
      accepts: ["2/15,224/435", "2/15 and 224/435", "a)2/15 b)224/435", "2/15;224/435"],
      markScheme: [
        { text: "a) P(box A) = 1/3", marks: 1 },
        { text: "a) P(white | A) = 4/10 = 2/5", marks: 1 },
        { text: "a) P = 1/3 × 2/5 = 2/15", marks: 1 },
        { text: "b) Pool the balls: 16 white and 14 black, 30 in total", marks: 1 },
        { text: "b) Favourable pairs = 16 × 14 = 224; total pairs = C(30,2) = 435", marks: 1 },
        { text: "b) P = 224/435 ≈ 0.515", marks: 1 },
      ],
      hint: "Part (a) is a two-stage tree — the box choice carries its own 1/3. Part (b) pools all 30 balls, so work with combinations rather than a tree.",
    },
    {
      id: "a-q16",
      number: 16,
      marks: 3,
      topic: "Inverse Trigonometry",
      difficulty: "standard",
      prompt: "Evaluate sin(arccos(1/2) + arcsin(−√3/2)).",
      promptKk: "Есептеңіз: sin(arccos(1/2) + arcsin(−√3/2))",
      marking: "auto",
      answerKind: "numeric",
      answer: "0",
      markScheme: [
        { text: "arccos(1/2) = π/3", marks: 1 },
        { text: "arcsin(−√3/2) = −π/3 (principal value in [−π/2, π/2])", marks: 1 },
        { text: "The arguments sum to 0, so sin 0 = 0", marks: 1 },
      ],
      hint: "Evaluate each inverse function to a principal-value angle before adding. Watch the range of arcsin — it is [−π/2, π/2], so the answer is negative, not 4π/3.",
    },
    {
      id: "a-q17",
      number: 17,
      marks: 3,
      topic: "Trigonometric Equations",
      difficulty: "standard",
      prompt: "Solve the equation √3 sin x − tan x = 0.",
      promptKk: "Теңдеуді шешіңіз: √3 sin x − tg x = 0",
      marking: "auto",
      answerKind: "expression",
      answer: "x = πn; x = ±arccos(√3/3) + 2πk",
      accepts: [
        "x=pin, x=±arccos(√3/3)+2pik",
        "πn, ±arccos(√3/3)+2πk",
        "x=πn and x=±arccos(1/√3)+2πk",
        "pin,±arccos(1/sqrt3)+2pik",
      ],
      markScheme: [
        {
          text: "Write tan x = sin x / cos x and factor: sin x (√3 − 1/cos x) = 0, noting cos x ≠ 0",
          marks: 1,
        },
        { text: "sin x = 0 gives x = πn", marks: 1 },
        {
          text: "√3 cos x = 1 gives cos x = √3/3, so x = ±arccos(√3/3) + 2πk",
          marks: 1,
        },
      ],
      hint: "Factor rather than divide. Dividing through by sin x silently throws away the entire x = πn family.",
    },
    {
      id: "a-q18",
      number: 18,
      marks: 3,
      topic: "Inequalities",
      difficulty: "stretch",
      prompt: "Solve the inequality sin(2x + π/3) ≤ 1/2 on the interval (0; 2π).",
      promptKk: "(0;2π) аралығында sin(2x + π/3) ≤ 1/2 теңсіздігін шешіңіз.",
      marking: "auto",
      answerKind: "expression",
      answer: "[π/4; 11π/12] ∪ [5π/4; 23π/12]",
      accepts: [
        "π/4≤x≤11π/12, 5π/4≤x≤23π/12",
        "pi/4,11pi/12,5pi/4,23pi/12",
        "[pi/4;11pi/12]u[5pi/4;23pi/12]",
      ],
      markScheme: [
        {
          text: "Substitute u = 2x + π/3; sin u ≤ 1/2 gives 5π/6 + 2πk ≤ u ≤ 13π/6 + 2πk",
          marks: 1,
        },
        { text: "Back-substitute and halve: π/4 + πk ≤ x ≤ 11π/12 + πk", marks: 1 },
        {
          text: "Select k = 0 and k = 1 to stay inside (0; 2π): [π/4; 11π/12] ∪ [5π/4; 23π/12]",
          marks: 1,
        },
      ],
      hint: "Solve for the whole bracket 2x + π/3 first and only convert to x at the end — halving the interval before you shift is the usual place this goes wrong.",
    },
  ],
};
