import type { Paper, Question } from "@/lib/exam-types";

/**
 * NIS Physics, Grade 10, Component 1 — the published sample paper (10PHYS/01).
 *
 * Transcribed from the sample question paper (Kazakh edition with Russian
 * front matter). 100 marks in 90 minutes; Part A is multiple choice with a
 * recommended 30 minutes, Part B is structured. A calculator, protractor and
 * ruler are permitted, and the paper prints a table of physical constants and
 * formulae.
 *
 * Coverage note: 11 of Part A's 20 questions are seeded, worth 11 marks. The
 * other nine ask the candidate to read a printed ruler, a velocity-time graph,
 * a set of labelled blocks, a forklift diagram, four swimming-pool diagrams, a
 * sealed vessel, a heating curve, two labelled blocks and a heated rod — all of
 * which are figures rather than text, and none of which can be restated without
 * inventing the picture. Part B is structured around the same figures and is
 * not seeded here.
 *
 * The paper declares 100 marks; the boundary table this app grades against has
 * Physics Component 1 out of 90, from a different sitting. The workspace scales
 * what is answered onto the 90-mark component scale and shows both figures, so
 * the mismatch is visible rather than hidden.
 */

/** Every Part A question is one mark, four options, marked by the machine. */
const mcq = (
  id: string,
  number: number,
  topic: string,
  prompt: string,
  promptKk: string,
  options: string[],
  answer: string,
  scheme: string,
  hint: string
): Question => ({
  id,
  number,
  marks: 1,
  topic,
  difficulty: "foundation",
  prompt,
  promptKk,
  marking: "auto",
  answerKind: "choice",
  options,
  answer,
  markScheme: [{ text: scheme, marks: 1 }],
  hint,
});

export const PHYSICS_10_P1_2018: Paper = {
  id: "physics-10-p1-2018",
  subjectId: "physics",
  componentIndex: 0,
  title: "Physics Component 1",
  gradeYear: 10,
  sitting: "Sample paper",
  durationMinutes: 90,
  totalMarks: 100,
  calculator: true,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed from the published NIS sample paper (10PHYS/01). 11 of Part A's 20 multiple-choice questions are seeded; the rest read printed figures, and Part B is built on the same figures.",
  instructions: [
    "Part A: answer all questions. About 30 minutes is recommended for this part.",
    "A calculator is permitted — the panel beside the paper is one.",
    "The real paper prints a table of physical constants and formulae.",
    "Each Part A question carries one mark.",
    "The full paper is 100 marks; the questions seeded here carry 11.",
  ],
  questions: [
    mcq(
      "phys10p1-q3",
      3,
      "Mechanics",
      "A small steel ball falls from a low balcony. If air resistance is neglected, which statement is correct?",
      "Кішкене болат шарик төмен орналасқан балконнан құлады. Ауаның кедергісі ескерілмесе, қандай тұжырымдама дұрыс?",
      [
        "A — it falls with constant acceleration",
        "B — it falls with constant velocity",
        "C — its velocity decreases",
        "D — its acceleration increases",
      ],
      "A — it falls with constant acceleration",
      "With air resistance neglected the only force is weight, so the acceleration is g and constant while the velocity grows.",
      "Neglecting air resistance leaves one force acting. A constant force on a constant mass gives a constant acceleration — which is not the same as a constant speed."
    ),
    mcq(
      "phys10p1-q4",
      4,
      "Mechanics",
      "What are the units of force and of weight?",
      "Күштің және салмақтың өлшем бірліктері қандай?",
      [
        "A — force: kg, weight: kg",
        "B — force: kg, weight: N",
        "C — force: N, weight: kg",
        "D — force: N, weight: N",
      ],
      "D — force: N, weight: N",
      "Weight is the gravitational force on a mass, so both are forces and both are measured in newtons.",
      "Weight is a force, not a mass. The kilogram is what you would use for the other one."
    ),
    mcq(
      "phys10p1-q5",
      5,
      "Thermodynamics",
      "Hot liquid is poured into a cup. Some of the liquid evaporates. What happens to the mass and the weight of the liquid in the cup?",
      "Кесеге ыстық сұйық құйылған. Сұйықтың бір мөлшері буланады. Кеседегі сұйықтың массасы және салмағымен не болады?",
      [
        "A — mass decreases, weight decreases",
        "B — mass decreases, weight unchanged",
        "C — mass unchanged, weight decreases",
        "D — mass unchanged, weight unchanged",
      ],
      "A — mass decreases, weight decreases",
      "Evaporation removes matter, so the mass falls; weight is mass × g at the same place, so it falls with it.",
      "Molecules leaving the cup take their mass with them. Weight follows mass wherever g has not changed."
    ),
    mcq(
      "phys10p1-q7",
      7,
      "Mechanics",
      "A force acting on a body changes some of its properties. Which list gives the properties of a body that a force can change?",
      "Денеге әрекет ететін күш, дененің кейбір қасиеттерін өзгертеді. Қандай тізімде күштің әсерінен дененің өзгеретін қасиеттері жазылған?",
      [
        "A — mass, motion and shape",
        "B — mass, motion and size",
        "C — mass, shape and size",
        "D — motion, shape and size",
      ],
      "D — motion, shape and size",
      "A force can change how a body moves and can deform it, changing shape and size. It cannot change how much matter the body contains.",
      "Three of the four options share one item that a force cannot touch. Find that item and the answer is the option without it."
    ),
    mcq(
      "phys10p1-q9",
      9,
      "Fields",
      "Some energy sources are available at any time and others are not. Which row places the three sources correctly?",
      "Кейбір энергия көздері кез келген уақытта қолжетімді, ал кейбіреуі керісінше. Қандай жолда үш энергия көзі дұрыс орында тұр?",
      [
        "A — available: geothermal; not available: nuclear fission, solar",
        "B — available: geothermal, nuclear fission; not available: solar",
        "C — available: solar, nuclear fission; not available: geothermal",
        "D — available: solar; not available: nuclear fission, geothermal",
      ],
      "B — available: geothermal, nuclear fission; not available: solar",
      "Geothermal heat and a fission reactor run continuously; solar depends on daylight and weather, so it is not available at any time.",
      "Ask of each source: could it deliver at three in the morning under cloud? Two can."
    ),
    mcq(
      "phys10p1-q10",
      10,
      "Mechanics",
      "A worker in a factory has to lift a box from the floor onto a shelf. In which action does she do the least work?",
      "Зауыттағы жұмысшы әйел жерде тұрған қорапты сөреге көтеруі керек. Ең аз жұмыс жасаған кезде әйел қандай әрекет жасайды?",
      [
        "A — lifting the box quickly to the upper shelf",
        "B — lifting the box slowly to the upper shelf",
        "C — lifting the box first to the lower shelf, then to the upper shelf",
        "D — lifting the box to the lower shelf instead of the upper shelf",
      ],
      "D — lifting the box to the lower shelf instead of the upper shelf",
      "Work against gravity is mgh, so it depends only on the height gained. The lower shelf is the smallest h; speed and route change the power, not the work.",
      "Work against gravity does not know how fast you went or how many stops you made. It only knows how much higher the box ended up."
    ),
    mcq(
      "phys10p1-q11",
      11,
      "Mechanics",
      "A drawing pin has a sharp point and a flat head. The pin is pushed into a wooden board. How do the force and the pressure at the sharp point compare with the force and the pressure at the flat head?",
      "Кеңсе түймесінің ұшы үшкір және басы жалпақ болады. Түйме ағаш тақтаға басылады. Өткір ұшындағы қысым мен күш, жалпақ басындағы қысым мен күшпен қалай байланысты?",
      [
        "A — force greater, pressure greater",
        "B — force greater, pressure smaller",
        "C — force equal, pressure greater",
        "D — force equal, pressure equal",
      ],
      "C — force equal, pressure greater",
      "The same push is transmitted through the pin, so the force is equal; pressure is force ÷ area and the point has far the smaller area, so the pressure there is greater.",
      "The pin is rigid, so whatever force goes in at the head comes out at the point. What differs between the two ends is the area it is spread over."
    ),
    mcq(
      "phys10p1-q13",
      13,
      "Thermodynamics",
      "A tightly sealed vessel is filled with gas. Which statement about the gas in the vessel is correct?",
      "Іші газбен толған тығыз жабылған ыдыс. Ыдыстағы газ туралы қандай тұжырымдама дұрыс?",
      [
        "A — as the temperature rises the gas molecules strike the inner walls more often",
        "B — as the temperature rises the gas molecules move more slowly",
        "C — as the temperature rises the gas pressure falls",
        "D — the gas pressure is higher at the top of the vessel than at the bottom",
      ],
      "A — as the temperature rises the gas molecules strike the inner walls more often",
      "Raising the temperature raises the mean kinetic energy, so molecules move faster and collide with the walls both more often and harder — which is why the pressure rises.",
      "Temperature is a measure of average molecular kinetic energy. Work out what faster molecules do in a fixed volume and the rest follows."
    ),
    mcq(
      "phys10p1-q14",
      14,
      "Thermodynamics",
      "An ice-cream brick may be kept from melting by wrapping it in newspaper soaked in water. Water evaporates from the newspaper. Which molecules leave the water, and what happens to the average speed of the water molecules left in the newspaper?",
      "Судан қандай молекулалар кетеді және газетте қалған су молекулаларының орташа жылдамдығымен не болады?",
      [
        "A — lower-energy molecules leave; average speed decreases",
        "B — lower-energy molecules leave; average speed increases",
        "C — higher-energy molecules leave; average speed decreases",
        "D — higher-energy molecules leave; average speed increases",
      ],
      "C — higher-energy molecules leave; average speed decreases",
      "Only the fastest molecules have enough energy to escape the surface, so the ones left behind have a lower average energy and a lower average speed — which is why evaporation cools.",
      "Escaping the liquid surface takes energy, so only some molecules manage it. Removing those from the average moves the average which way?"
    ),
    mcq(
      "phys10p1-q17",
      17,
      "Thermodynamics",
      "A man enters a cold room and switches on a heater. He then stands one metre from the heater and immediately feels warmth. How is the thermal energy transferred so quickly from the heater to the man?",
      "Жылу энергиясы жылытқыштан адамға қалай тез беріледі?",
      [
        "A — by conduction, convection and radiation",
        "B — by conduction only",
        "C — by convection only",
        "D — by radiation only",
      ],
      "D — by radiation only",
      "The transfer is immediate and across a gap of air, which rules out conduction and convection — both need time and moving matter. Radiation travels at the speed of light and needs no medium.",
      "The word doing the work in this question is “immediately”. Two of the three mechanisms carry energy by moving matter, and matter takes time to move a metre."
    ),
    mcq(
      "phys10p1-q19",
      19,
      "Waves",
      "Which row gives an example of a transverse wave and an example of a longitudinal wave?",
      "Көлденең толқынның мысалы және бойлық толқынның мысалы қай жолда көрсетілген?",
      [
        "A — transverse: light, longitudinal: radio",
        "B — transverse: radio, longitudinal: sound",
        "C — transverse: sound, longitudinal: water",
        "D — transverse: water, longitudinal: light",
      ],
      "B — transverse: radio, longitudinal: sound",
      "Radio is an electromagnetic wave and so transverse; sound is a pressure wave in which the oscillation is along the direction of travel, so it is longitudinal.",
      "Only one of the four things listed is longitudinal. Find it first, then find the row that puts it in the right column."
    ),
  ],
};
