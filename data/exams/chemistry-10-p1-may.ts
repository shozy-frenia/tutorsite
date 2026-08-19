import type { Paper } from "@/lib/exam-types";

/**
 * NIS Chemistry, Grade 10, Paper 1 — sitting of May 2021 (10CHEMR/01).
 *
 * Transcribed from the original question paper (Russian edition; a Kazakh
 * edition of the same paper exists). The real paper is 90 marks: Part A is 25
 * one-mark multiple-choice questions, Part B is 65 marks of structured
 * questions. Calculators are permitted and a periodic table is supplied.
 *
 * Coverage note: Part A is complete. Part B carries questions 26–31 (50 marks);
 * questions 32 and 33 depend on an apparatus diagram and a rate-of-reaction
 * graph that are not yet extracted, so they are not seeded. The workspace
 * scales whatever is answered onto the official 90-mark Paper 1 scale, so the
 * grade stays honest either way.
 *
 * Two Part A questions (5 and 14) ask the candidate to pick between printed
 * dot-and-cross diagrams. Those options are images, so the questions are
 * self-marked against a description of the correct diagram rather than
 * auto-marked against a letter that would be meaningless without the figure.
 */
export const CHEMISTRY_10_P1_MAY: Paper = {
  id: "chemistry-10-p1-2021-05",
  subjectId: "chemistry",
  componentIndex: 0,
  title: "Chemistry Paper 1",
  gradeYear: 10,
  sitting: "May 2021",
  durationMinutes: 90,
  totalMarks: 90,
  calculator: true,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed from the original NIS question paper (10CHEMR/01). Part A complete; Part B questions 26–31 of 26–33.",
  instructions: [
    "Answer all questions.",
    "A calculator is permitted.",
    "A copy of the Periodic Table is provided in the real paper.",
    "You may lose marks if you do not show your working or omit units.",
    "Marks for each question are shown in brackets [ ].",
  ],
  questions: [
    /* ================================================== PART A — 25 marks */
    {
      id: "ch-q1",
      number: 1,
      marks: 1,
      topic: "Stoichiometry",
      difficulty: "standard",
      prompt:
        "What is the molar concentration of a solution of volume 500 ml containing 32 g of copper(II) sulfate, CuSO₄?",
      promptKk:
        "Какова молярная концентрация раствора, объём которого 500 мл, содержащий 32 г сульфата меди CuSO₄?",
      marking: "auto",
      answerKind: "choice",
      options: ["0.04 mol/l", "0.06 mol/l", "0.2 mol/l", "0.4 mol/l"],
      answer: "0.4 mol/l",
      markScheme: [
        {
          text: "M(CuSO₄) = 160 g/mol, so n = 32/160 = 0.2 mol; c = 0.2/0.5 = 0.4 mol/l",
          marks: 1,
        },
      ],
      hint: "Convert the volume to litres before dividing. 500 ml is 0.5 l, which doubles the concentration relative to a 1-litre solution.",
    },
    {
      id: "ch-q2",
      number: 2,
      marks: 1,
      topic: "Acids & Bases",
      difficulty: "foundation",
      prompt:
        "Which statement about acids and alkalis is correct? (i) acids dissociate to give H⁺ as the cation; (ii) in an aqueous alkali solution the pH is less than 7; (iii) litmus is blue in alkaline medium.",
      marking: "auto",
      answerKind: "choice",
      options: ["i and iii", "i and ii", "only i", "ii and iii"],
      answer: "i and iii",
      markScheme: [
        {
          text: "(i) and (iii) are true; (ii) is false because alkalis have pH greater than 7",
          marks: 1,
        },
      ],
      hint: "Check statement (ii) first — alkalis are above pH 7, not below. That eliminates two options immediately.",
    },
    {
      id: "ch-q3",
      number: 3,
      marks: 1,
      topic: "Redox & Electrolysis",
      difficulty: "standard",
      prompt:
        "In which case are the electrolysis products correctly stated? A: NaBr → sodium at cathode, bromine at anode. B: K₂SO₄ → hydrogen at cathode, sulfur(IV) oxide at anode. C: CuSO₄ → copper at cathode, oxygen at anode. D: CrCl₂ → hydrogen at cathode, chlorine at anode.",
      marking: "auto",
      answerKind: "choice",
      options: [
        "A — NaBr: sodium / bromine",
        "B — K₂SO₄: hydrogen / sulfur(IV) oxide",
        "C — CuSO₄: copper / oxygen",
        "D — CrCl₂: hydrogen / chlorine",
      ],
      answer: "C — CuSO₄: copper / oxygen",
      markScheme: [
        {
          text: "In aqueous CuSO₄ copper is less reactive than hydrogen so Cu deposits at the cathode, and the sulfate ion is not oxidised so water gives O₂ at the anode",
          marks: 1,
        },
      ],
      hint: "In aqueous solution a metal only deposits if it is less reactive than hydrogen — that rules out sodium straight away.",
    },
    {
      id: "ch-q4",
      number: 4,
      marks: 1,
      topic: "Redox & Electrolysis",
      difficulty: "standard",
      prompt:
        "In which reaction equation does sulfur show reducing properties? A: Na₂S + 2HCl → 2NaCl + H₂S. B: 2SO₂ + O₂ → 2SO₃. C: SO₂ + H₂O → H₂SO₃. D: 2Na + S → Na₂S.",
      marking: "auto",
      answerKind: "choice",
      options: [
        "A — Na₂S + 2HCl → 2NaCl + H₂S",
        "B — 2SO₂ + O₂ → 2SO₃",
        "C — SO₂ + H₂O → H₂SO₃",
        "D — 2Na + S → Na₂S",
      ],
      answer: "B — 2SO₂ + O₂ → 2SO₃",
      markScheme: [
        {
          text: "Sulfur goes from +4 in SO₂ to +6 in SO₃, so it is oxidised and therefore acts as the reducing agent",
          marks: 1,
        },
      ],
      hint: "A reducing agent is itself oxidised. Work out sulfur's oxidation number on both sides and look for the one that increases.",
    },
    {
      id: "ch-q5",
      number: 5,
      marks: 1,
      topic: "Bonding & Structure",
      difficulty: "standard",
      prompt:
        "Identify the dot-and-cross diagram showing the bonding in a water molecule. (The four options are printed diagrams in the original paper.)",
      marking: "worked",
      answer:
        "The correct diagram shows oxygen sharing one electron pair with each hydrogen — two bonding pairs — and retaining two non-bonding lone pairs, giving oxygen a complete octet and each hydrogen two electrons.",
      markScheme: [
        {
          text: "Two shared pairs between O and each H, plus two lone pairs on oxygen (octet on O, duet on each H)",
          marks: 1,
        },
      ],
      hint: "Oxygen has six outer electrons and needs two more. Count the lone pairs — a correct water diagram must show exactly two of them on the oxygen.",
    },
    {
      id: "ch-q6",
      number: 6,
      marks: 1,
      topic: "Qualitative Analysis",
      difficulty: "standard",
      prompt:
        "Identify substance X in the conversion chain Fe₂O₃ → FeCl₃ → X --(heat)--> Fe₂O₃.",
      marking: "auto",
      answerKind: "choice",
      options: ["FeO", "Fe(OH)₃", "Fe(OH)₂", "FeSO₄"],
      answer: "Fe(OH)₃",
      markScheme: [
        {
          text: "FeCl₃ + alkali gives Fe(OH)₃, which decomposes on heating: 2Fe(OH)₃ → Fe₂O₃ + 3H₂O",
          marks: 1,
        },
      ],
      hint: "Work backwards from the last arrow: what iron compound decomposes on heating to give Fe₂O₃ and keeps iron in the +3 state?",
    },
    {
      id: "ch-q7",
      number: 7,
      marks: 1,
      topic: "Periodicity",
      difficulty: "standard",
      prompt:
        "A table describes four particles. N has 7 protons, 7 neutrons, 7 electrons. N³⁻ has 7 protons, 7 neutrons, X electrons. Mg has 12 protons, Y neutrons, 12 electrons. Mg²⁺ has 12 protons, 12 neutrons, Z electrons. Determine X, Y and Z.",
      marking: "auto",
      answerKind: "choice",
      options: [
        "X = 7, Y = 10, Z = 10",
        "X = 10, Y = 12, Z = 10",
        "X = 9, Y = 11, Z = 11",
        "X = 10, Y = 12, Z = 12",
      ],
      answer: "X = 10, Y = 12, Z = 10",
      markScheme: [
        {
          text: "N³⁻ gains 3 electrons so X = 10; magnesium-24 has 24 − 12 = 12 neutrons so Y = 12; Mg²⁺ loses 2 electrons so Z = 10",
          marks: 1,
        },
      ],
      hint: "A 3− charge means three electrons gained, a 2+ charge two lost. Protons never change — only electrons do.",
    },
    {
      id: "ch-q8",
      number: 8,
      marks: 1,
      topic: "Acids & Bases",
      difficulty: "standard",
      prompt: "In a solution of which salt will litmus paper turn blue?",
      marking: "auto",
      answerKind: "choice",
      options: ["NaCl", "CuSO₄", "K₂CO₃", "ZnCl₂"],
      answer: "K₂CO₃",
      markScheme: [
        {
          text: "K₂CO₃ is the salt of a strong base and a weak acid, so it hydrolyses to give an alkaline solution and turns litmus blue",
          marks: 1,
        },
      ],
      hint: "Blue means alkaline. Look for the salt of a strong base and a weak acid — the carbonate ion is the giveaway.",
    },
    {
      id: "ch-q9",
      number: 9,
      marks: 1,
      topic: "Nuclear Chemistry",
      difficulty: "standard",
      prompt:
        "How long will it take for the mass of a substance to decrease from 48 grams to 1.5 grams if the half-life is 10 days?",
      marking: "auto",
      answerKind: "choice",
      options: ["50 days", "60 days", "40 days", "30 days"],
      answer: "50 days",
      markScheme: [
        {
          text: "48 → 24 → 12 → 6 → 3 → 1.5 is five halvings, so 5 × 10 = 50 days",
          marks: 1,
        },
      ],
      hint: "Just halve repeatedly and count the steps — no logarithms needed. 48 to 1.5 is a factor of 32, which is 2⁵.",
    },
    {
      id: "ch-q10",
      number: 10,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "standard",
      prompt:
        "Which name corresponds to the substance with the formula CH₃−HC=CH−CH(CH₃)−CH₃?",
      marking: "auto",
      answerKind: "choice",
      options: ["4-methylpent-2-ene", "2-methylpent-2-ene", "4-methylpent-3-ene", "2-methylpent-4-ene"],
      answer: "4-methylpent-2-ene",
      markScheme: [
        {
          text: "Longest chain is 5 carbons; numbering to give the double bond the lower locant puts it at C2 and the methyl at C4",
          marks: 1,
        },
      ],
      hint: "Number the chain from the end that gives the double bond the lower number — the double bond takes priority over the substituent.",
    },
    {
      id: "ch-q11",
      number: 11,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "stretch",
      prompt:
        "Which substance is formed predominantly in the reaction of 2-methylbut-2-ene with hydrogen bromide?",
      marking: "auto",
      answerKind: "choice",
      options: [
        "2-bromo-2-methylbutane",
        "1-bromo-2-methylbutane",
        "2,3-dibromo-2-methylbutane",
        "2-bromo-3-methylbutane",
      ],
      answer: "2-bromo-2-methylbutane",
      markScheme: [
        {
          text: "By Markovnikov's rule the hydrogen adds to the double-bond carbon carrying more hydrogens, so bromine ends up on the more substituted carbon C2",
          marks: 1,
        },
      ],
      hint: "Markovnikov: hydrogen goes to the carbon that already has more hydrogens, which puts the halogen on the more substituted carbon.",
    },
    {
      id: "ch-q12",
      number: 12,
      marks: 1,
      topic: "Nuclear Chemistry",
      difficulty: "foundation",
      prompt:
        "In medicine radium is used as a source of radon: radioactive decay of ²²⁶Ra produces ²²²Rn. What type of radioactive decay is this?",
      marking: "auto",
      answerKind: "choice",
      options: ["α decay", "β decay", "β⁺ decay", "γ decay"],
      answer: "α decay",
      markScheme: [
        {
          text: "The mass number falls by 4 (226 → 222), which only alpha emission does",
          marks: 1,
        },
      ],
      hint: "Compare the mass numbers. A drop of exactly 4 is the signature of an alpha particle leaving.",
    },
    {
      id: "ch-q13",
      number: 13,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "standard",
      prompt:
        "Which substance is formed in the reaction between ethanol C₂H₅OH and acetic acid CH₃COOH?",
      marking: "auto",
      answerKind: "choice",
      options: [
        "ethyl methanoate HCOOC₂H₅",
        "methyl ethanoate CH₃COOCH₃",
        "ethyl ethanoate CH₃COOCH₂CH₃",
        "propyl methanoate HCOOCH₂CH₂CH₃",
      ],
      answer: "ethyl ethanoate CH₃COOCH₂CH₃",
      markScheme: [
        {
          text: "Esterification: the acid supplies the acyl part (ethanoate) and the alcohol supplies the alkyl part (ethyl)",
          marks: 1,
        },
      ],
      hint: "The ester is named alcohol-part first, acid-part second. Ethanol gives 'ethyl', ethanoic acid gives 'ethanoate'.",
    },
    {
      id: "ch-q14",
      number: 14,
      marks: 1,
      topic: "Bonding & Structure",
      difficulty: "standard",
      prompt:
        "Which of the given schemes corresponds to the sulfide ion S²⁻? (The four options are printed shell diagrams with a +16 nucleus.)",
      marking: "worked",
      answer:
        "The correct scheme shows a +16 nucleus with electron shells 2, 8, 8 — sulfur's 16 electrons plus the two gained, giving a complete outer octet and an overall 2− charge.",
      markScheme: [
        { text: "Shells shown as 2, 8, 8 around a +16 nucleus", marks: 1 },
      ],
      hint: "Sulfur has 16 electrons as an atom. Gaining two gives 18, so the outer shell must be full — count the outer shell first.",
    },
    {
      id: "ch-q15",
      number: 15,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "standard",
      prompt:
        "Which substances are NOT isomers of pent-2-ene? (i) 2-methylpropene; (ii) 2-methylbut-2-ene; (iii) 2,3-dimethylbut-1-ene; (iv) 2-methylbut-1-ene.",
      marking: "auto",
      answerKind: "choice",
      options: ["ii and iii", "i and ii", "i and iii", "iii and iv"],
      answer: "i and iii",
      markScheme: [
        {
          text: "Pent-2-ene is C₅H₁₀; 2-methylpropene is C₄H₈ and 2,3-dimethylbut-1-ene is C₆H₁₂, so neither is an isomer",
          marks: 1,
        },
      ],
      hint: "Isomers must have the identical molecular formula. Count the carbons in each name before thinking about structure.",
    },
    {
      id: "ch-q16",
      number: 16,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "foundation",
      prompt:
        "Which bond forms between amino acid molecules when a protein molecule is formed?",
      marking: "auto",
      answerKind: "choice",
      options: ["carboxyl", "hydrogen", "peptide", "polyester"],
      answer: "peptide",
      markScheme: [
        {
          text: "A peptide (amide) bond forms between the carboxyl group of one amino acid and the amino group of the next",
          marks: 1,
        },
      ],
      hint: "Hydrogen bonds hold the folded shape together, but the bond joining the residues themselves is a different one.",
    },
    {
      id: "ch-q17",
      number: 17,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "foundation",
      prompt: "Which formula is a homologue of propene CH₂=CH−CH₃?",
      marking: "auto",
      answerKind: "choice",
      options: ["C₂H₄", "C₂H₆", "C₃H₄", "C₄H₁₀"],
      answer: "C₂H₄",
      markScheme: [
        {
          text: "Homologues share the general formula and functional group; propene is an alkene CₙH₂ₙ, and C₂H₄ (ethene) fits",
          marks: 1,
        },
      ],
      hint: "Homologues differ by CH₂ but must keep the same functional group. Propene is an alkene, so look for another CₙH₂ₙ.",
    },
    {
      id: "ch-q18",
      number: 18,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "foundation",
      prompt: "From which compounds are fats formed?",
      marking: "auto",
      answerKind: "choice",
      options: [
        "glycerol and lower carboxylic acids",
        "ethylene glycol and higher carboxylic acids",
        "glycerol and higher carboxylic acids",
        "ethanol and higher carboxylic acids",
      ],
      answer: "glycerol and higher carboxylic acids",
      markScheme: [
        {
          text: "Fats are triesters of glycerol (propane-1,2,3-triol) with long-chain (higher) carboxylic acids",
          marks: 1,
        },
      ],
      hint: "Two things must both be right: the alcohol must be the tri-alcohol glycerol, and the acids must be long-chain.",
    },
    {
      id: "ch-q19",
      number: 19,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "foundation",
      prompt:
        "Identify substance X in the conversion scheme: starch → X --(fermentation)--> ethanol.",
      marking: "auto",
      answerKind: "choice",
      options: ["sucrose", "fructose", "ribose", "glucose"],
      answer: "glucose",
      markScheme: [
        {
          text: "Starch hydrolyses to glucose, which ferments to ethanol and carbon dioxide",
          marks: 1,
        },
      ],
      hint: "Starch is a polymer of one specific monosaccharide — hydrolysis simply releases its repeating unit.",
    },
    {
      id: "ch-q20",
      number: 20,
      marks: 1,
      topic: "Periodicity",
      difficulty: "standard",
      prompt:
        "Which chemical elements correspond to the outer electron configuration ns²np³? (i) N, V; (ii) As, P; (iii) B, Al.",
      marking: "auto",
      answerKind: "choice",
      options: ["only i", "only ii", "ii and iii", "i and ii"],
      answer: "only ii",
      markScheme: [
        {
          text: "ns²np³ is Group 15: arsenic and phosphorus both fit. Vanadium is a d-block element and B/Al are Group 13 (ns²np¹)",
          marks: 1,
        },
      ],
      hint: "np³ means three p electrons, so Group 15. Check every element in each pair — one wrong element rules the whole pair out.",
    },
    {
      id: "ch-q21",
      number: 21,
      marks: 1,
      topic: "Bonding & Structure",
      difficulty: "standard",
      prompt: "Select the group of compounds with polar covalent bonds.",
      marking: "auto",
      answerKind: "choice",
      options: ["P₄, O₂, CO₂", "SO₂, N₂O, CO", "HCl, NaCl, CuS", "BaS, CO₂, N₂O"],
      answer: "SO₂, N₂O, CO",
      markScheme: [
        {
          text: "All three are covalent compounds of different elements with an unequal electron distribution; the other options contain either a non-polar element molecule or an ionic compound",
          marks: 1,
        },
      ],
      hint: "Rule out any group containing an element molecule (P₄, O₂ — non-polar) or a metal-and-non-metal pair (NaCl, BaS — ionic).",
    },
    {
      id: "ch-q22",
      number: 22,
      marks: 1,
      topic: "Kinetics & Equilibrium",
      difficulty: "standard",
      prompt:
        "By how many times will the rate of a chemical reaction increase when the temperature is raised from 15 °C to 55 °C, if the temperature coefficient of the reaction is 3?",
      marking: "auto",
      answerKind: "choice",
      options: ["12 times", "81 times", "120 times", "165 times"],
      answer: "81 times",
      markScheme: [
        {
          text: "Van 't Hoff: ΔT = 40 °C so the factor is 3^(40/10) = 3⁴ = 81",
          marks: 1,
        },
      ],
      hint: "The coefficient applies per 10 °C. Divide the temperature rise by 10 first, then raise the coefficient to that power.",
    },
    {
      id: "ch-q23",
      number: 23,
      marks: 1,
      topic: "Acids & Bases",
      difficulty: "stretch",
      prompt:
        "Which reaction equation corresponds to the net ionic equation Ba²⁺(aq) + SO₄²⁻(aq) = BaSO₄(s)? (i) BaO(s) + H₂SO₄(aq); (ii) BaCl₂(aq) + Na₂SO₄(aq); (iii) Ba(OH)₂(aq) + H₂SO₄(aq).",
      marking: "auto",
      answerKind: "choice",
      options: ["only i", "only ii", "ii and iii", "i and iii"],
      answer: "only ii",
      markScheme: [
        {
          text: "Only (ii) has both reactants fully dissociated and forms nothing but the precipitate; (i) has a solid oxide and (iii) also forms water, so both need extra species in the net equation",
          marks: 1,
        },
      ],
      hint: "The net ionic equation shows everything that actually changes. If water is also produced, it must appear — so that reaction cannot match.",
    },
    {
      id: "ch-q24",
      number: 24,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "foundation",
      prompt: "Which compound is able to undergo addition polymerisation?",
      marking: "auto",
      answerKind: "choice",
      options: ["propane", "methylpropane", "propene", "cyclopropane"],
      answer: "propene",
      markScheme: [
        {
          text: "Addition polymerisation requires a carbon–carbon double bond, which only propene has",
          marks: 1,
        },
      ],
      hint: "Addition polymerisation needs something to add across. Look for the compound with a double bond.",
    },
    {
      id: "ch-q25",
      number: 25,
      marks: 1,
      topic: "Organic Chemistry",
      difficulty: "stretch",
      prompt:
        "Which hydrocarbon X is formed in the cracking of octadecane according to C₁₈H₃₈ → C₅H₁₂ + 2C₃H₆ + X?",
      marking: "auto",
      answerKind: "choice",
      options: ["hexane", "heptene", "heptane", "octene"],
      answer: "heptene",
      markScheme: [
        {
          text: "Balancing carbons: 18 − 5 − 6 = 7; balancing hydrogens: 38 − 12 − 12 = 14, giving C₇H₁₄, an alkene",
          marks: 1,
        },
      ],
      hint: "Balance carbon and hydrogen separately. C₇H₁₄ fits CₙH₂ₙ, so the answer is an alkene, not an alkane.",
    },

    /* ================================================== PART B — structured */
    {
      id: "ch-q26",
      number: 26,
      marks: 10,
      topic: "Redox & Electrolysis",
      difficulty: "stretch",
      prompt:
        "Chlorine is a yellow gaseous substance obtained by the electrolysis of a sodium chloride solution.",
      parts: [
        "(a)(i) Write the equations of the reactions occurring at the anode and the cathode during electrolysis of sodium chloride solution. [2]",
        "(a)(ii) Identify the oxidation and reduction processes occurring at the electrodes. [2]",
        "(b) Calculate the volume of chlorine released (at STP) when a direct current is passed through a solution containing 14.625 g of sodium chloride with an impurity mass fraction of 20 %. Give your answer to three significant figures. [4]",
        "(c)(i) Identify the type of bond in the chlorine molecule. [1]",
        "(c)(ii) Using a dot-and-cross diagram, draw the formation of the bond in the chlorine molecule. [1]",
      ],
      marking: "worked",
      answer:
        "(a)(i) Anode: 2Cl⁻ − 2e⁻ → Cl₂; Cathode: 2H₂O + 2e⁻ → H₂ + 2OH⁻. (a)(ii) Oxidation at the anode, reduction at the cathode. (b) Pure NaCl = 14.625 × 0.80 = 11.7 g; n(NaCl) = 11.7 / 58.5 = 0.2 mol; n(Cl₂) = 0.1 mol; V = 0.1 × 22.4 = 2.24 dm³. (c)(i) Non-polar covalent (single bond). (c)(ii) Two chlorine atoms sharing one electron pair, each ending with a complete octet.",
      markScheme: [
        { text: "(a)(i) Anode equation 2Cl⁻ − 2e⁻ → Cl₂", marks: 1 },
        { text: "(a)(i) Cathode equation 2H₂O + 2e⁻ → H₂ + 2OH⁻", marks: 1 },
        { text: "(a)(ii) Anode is oxidation (loss of electrons)", marks: 1 },
        { text: "(a)(ii) Cathode is reduction (gain of electrons)", marks: 1 },
        { text: "(b) Mass of pure NaCl = 14.625 × 0.80 = 11.7 g", marks: 1 },
        { text: "(b) n(NaCl) = 11.7 / 58.5 = 0.2 mol", marks: 1 },
        { text: "(b) n(Cl₂) = 0.2 / 2 = 0.1 mol from the anode half-equation", marks: 1 },
        { text: "(b) V = 0.1 × 22.4 = 2.24 dm³ to three significant figures", marks: 1 },
        { text: "(c)(i) Covalent, non-polar", marks: 1 },
        { text: "(c)(ii) Diagram showing one shared pair and three lone pairs on each atom", marks: 1 },
      ],
      hint: "In part (b) the 20 % is impurity, not product — take 80 % of the mass before converting to moles. Then halve, because two chloride ions make one Cl₂ molecule.",
    },
    {
      id: "ch-q27",
      number: 27,
      marks: 8,
      topic: "Organic Chemistry",
      difficulty: "stretch",
      prompt: "Chlorine reacts chemically with organic substances.",
      parts: [
        "(a)(i) Write the equation for the initiation step of this process and state the conditions required. [2]",
        "(a)(ii) Write the equation for a propagation step between chlorine and methane. [1]",
        "(a)(iii) State one negative environmental consequence of using chloroalkanes. [1]",
        "(b) Complete the equation for the production of polyvinyl chloride from chloroethene H₂C=CHCl. [1]",
        "(c)(i) State a property of addition polymers that causes an environmental problem. [1]",
        "(c)(ii) Suggest ways of solving the problem of the Great Pacific Garbage Patch. [2]",
      ],
      marking: "worked",
      answer:
        "(a)(i) Cl₂ → 2Cl• in the presence of ultraviolet light (homolytic fission). (a)(ii) Cl• + CH₄ → CH₃• + HCl (or CH₃• + Cl₂ → CH₃Cl + Cl•). (a)(iii) Chlorofluoroalkanes destroy stratospheric ozone. (b) n H₂C=CHCl → −[CH₂−CHCl]ₙ−. (c)(i) Addition polymers are chemically inert and non-biodegradable. (c)(ii) Recycling, replacing with biodegradable polymers, reducing single-use plastic, collection and clean-up programmes.",
      markScheme: [
        { text: "(a)(i) Cl₂ → 2Cl• (homolytic fission)", marks: 1 },
        { text: "(a)(i) Condition: ultraviolet light", marks: 1 },
        { text: "(a)(ii) A valid propagation step, e.g. Cl• + CH₄ → CH₃• + HCl", marks: 1 },
        { text: "(a)(iii) Ozone layer depletion (or persistence/toxicity)", marks: 1 },
        { text: "(b) n H₂C=CHCl → −[CH₂−CHCl]ₙ−", marks: 1 },
        { text: "(c)(i) Non-biodegradable / chemically unreactive so it persists", marks: 1 },
        { text: "(c)(ii) One workable solution stated", marks: 1 },
        { text: "(c)(ii) A second, different workable solution stated", marks: 1 },
      ],
      hint: "Initiation always means breaking the halogen bond into two radicals, and the condition is UV light. Propagation steps must have a radical on both sides — one in, one out.",
    },
    {
      id: "ch-q28",
      number: 28,
      marks: 7,
      topic: "Kinetics & Equilibrium",
      difficulty: "standard",
      prompt:
        "Scientists worldwide have long raised the alarm about the harmful effects of acid rain. The paper shows a diagram of the formation and action of acid rain.",
      parts: [
        "(a) Using the diagram, state at least three sources that cause acid rain to form. [3]",
        "(b) Write two reaction equations underlying the production of sulfuric acid that lead to acid rain. [2]",
        "(c) State two consequences of acid rain on living organisms. [2]",
      ],
      marking: "worked",
      answer:
        "(a) Volcanoes, power stations and factories burning sulfur-containing fossil fuels, and vehicle exhaust emissions. (b) 2SO₂ + O₂ → 2SO₃ and SO₃ + H₂O → H₂SO₄. (c) Acidified lakes and rivers kill fish and aquatic life; soil acidification damages plant roots and leaches nutrients, damaging forests and crops.",
      markScheme: [
        { text: "(a) First source, e.g. volcanic emissions", marks: 1 },
        { text: "(a) Second source, e.g. industry / power stations burning fossil fuels", marks: 1 },
        { text: "(a) Third source, e.g. vehicle exhaust gases", marks: 1 },
        { text: "(b) 2SO₂ + O₂ → 2SO₃", marks: 1 },
        { text: "(b) SO₃ + H₂O → H₂SO₄", marks: 1 },
        { text: "(c) One valid consequence for living organisms", marks: 1 },
        { text: "(c) A second, different valid consequence", marks: 1 },
      ],
      hint: "Part (b) wants the two-step industrial route: oxidise SO₂ to SO₃ first, then hydrate it. Writing SO₂ + H₂O in one step gives sulfurous, not sulfuric, acid.",
    },
    {
      id: "ch-q29",
      number: 29,
      marks: 10,
      topic: "Qualitative Analysis",
      difficulty: "stretch",
      prompt:
        "Metals can be ordered in a reactivity series using the results of various chemical reactions.",
      parts: [
        "(a)(i) Using the reactivity series, suggest one metal that reacts with water under ordinary conditions and write the balanced equation. [1]",
        "(a)(ii) Suggest one metal that reacts with dilute sulfuric acid and write the balanced equation. [1]",
        "(b)(i) Explain why alloys rather than pure metals are widely used in engineering. [2]",
        "(b)(ii) Iron and carbon form two alloys, cast iron and steel. Complete a table of their composition and properties. [2]",
        "(b)(iii) Give two examples of the use of cast iron. [1]",
        "(c) Calculate the volume (at STP) of carbon monoxide used to reduce 11.2 g of iron from iron(III) oxide, if the practical yield is 80 % of the theoretical. [3]",
      ],
      marking: "worked",
      answer:
        "(a)(i) e.g. 2Na + 2H₂O → 2NaOH + H₂. (a)(ii) e.g. Zn + H₂SO₄ → ZnSO₄ + H₂. (b)(i) Alloys are harder and stronger and more corrosion-resistant, because atoms of different size disrupt the regular lattice and stop layers sliding. (b)(ii) Cast iron contains over 2 % carbon and is hard but brittle; steel contains under 2 % carbon and is strong, tough and malleable. (b)(iii) Engine blocks, radiators, pipes, cookware. (c) n(Fe) = 11.2/56 = 0.2 mol; Fe₂O₃ + 3CO → 2Fe + 3CO₂ gives n(CO) = 0.3 mol theoretically; correcting for 80 % yield, n(CO) = 0.3/0.8 = 0.375 mol, so V = 0.375 × 22.4 = 8.4 dm³.",
      markScheme: [
        { text: "(a)(i) A suitably reactive metal with a correctly balanced equation", marks: 1 },
        { text: "(a)(ii) A metal above hydrogen with a correctly balanced equation", marks: 1 },
        { text: "(b)(i) Alloys are harder / stronger / more corrosion-resistant", marks: 1 },
        { text: "(b)(i) Explanation in terms of differently sized atoms disrupting the lattice", marks: 1 },
        { text: "(b)(ii) Composition: cast iron over 2 % carbon, steel under 2 %", marks: 1 },
        { text: "(b)(ii) Properties: cast iron hard and brittle, steel strong and malleable", marks: 1 },
        { text: "(b)(iii) Two valid uses of cast iron", marks: 1 },
        { text: "(c) n(Fe) = 11.2 / 56 = 0.2 mol and equation Fe₂O₃ + 3CO → 2Fe + 3CO₂", marks: 1 },
        { text: "(c) Theoretical n(CO) = 0.3 mol, adjusted for 80 % yield to 0.375 mol", marks: 1 },
        { text: "(c) V = 0.375 × 22.4 = 8.4 dm³", marks: 1 },
      ],
      hint: "In part (c) the yield is on the iron actually obtained, so you need MORE carbon monoxide than theory — divide by 0.8, do not multiply.",
    },
    {
      id: "ch-q30",
      number: 30,
      marks: 7,
      topic: "Redox & Electrolysis",
      difficulty: "standard",
      prompt: "Nickel is used as an electroplating coating for metals.",
      parts: [
        "(a) Draw a labelled diagram of the apparatus that could be used in the laboratory to coat an iron plate with a layer of nickel, and indicate the direction of ion movement. [4]",
        "(b) Give one reason why electroplating is used for steel objects. [1]",
        "(c) Explain why nickel is used as a coating for a steel object. [1]",
        "(d) Name one metal other than nickel that could be used as a protective coating. [1]",
      ],
      marking: "worked",
      answer:
        "(a) Electrolytic cell: nickel anode (positive), iron object as cathode (negative), electrolyte of nickel(II) sulfate solution, connected to a DC supply; Ni²⁺ ions travel through the solution to the cathode. (b) To prevent corrosion and to improve appearance. (c) Nickel is less reactive than iron and forms a protective adherent layer, so it does not corrode. (d) Chromium (or zinc, tin, silver).",
      markScheme: [
        { text: "(a) Nickel used as the anode, connected to the positive terminal", marks: 1 },
        { text: "(a) Iron object used as the cathode, connected to the negative terminal", marks: 1 },
        { text: "(a) Electrolyte containing nickel ions, e.g. NiSO₄ solution, correctly labelled", marks: 1 },
        { text: "(a) Ni²⁺ movement shown from anode through solution to cathode", marks: 1 },
        { text: "(b) Corrosion protection (or improved appearance)", marks: 1 },
        { text: "(c) Nickel is less reactive than iron and resists corrosion", marks: 1 },
        { text: "(d) Any valid protective metal named", marks: 1 },
      ],
      hint: "The object being plated is always the cathode — metal ions are positive, so they must travel toward the negative electrode to be deposited.",
    },
    {
      id: "ch-q31",
      number: 31,
      marks: 8,
      topic: "Bonding & Structure",
      difficulty: "standard",
      prompt:
        "Aluminium is a metal that conducts electricity well, which is why electrical wires are made from it.",
      parts: [
        "(a) Draw the structure of the crystal lattice and state the type of bonding in aluminium. [3]",
        "(b) Explain the ability of aluminium to conduct an electric current. [1]",
        "(c) Explain the ability of aluminium to be rolled into foil. [1]",
        "(d)(i) Complete and balance the equation for aluminium reacting with sodium hydroxide solution: Al + NaOH + H₂O → … [1]",
        "(d)(ii) Write the balanced equation for aluminium reacting with dilute sulfuric acid. [1]",
        "(e) Explain why reduction with carbon is not used to obtain aluminium from its oxide. [1]",
      ],
      marking: "worked",
      answer:
        "(a) A giant metallic lattice of Al³⁺ ions in a sea of delocalised electrons; the bonding is metallic. (b) The delocalised electrons are free to move through the lattice and carry charge. (c) Layers of identical ions slide over one another without breaking the metallic bonding, so it is malleable. (d)(i) 2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂. (d)(ii) 2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂. (e) Aluminium is more reactive than carbon, so carbon cannot reduce its oxide — electrolysis of molten Al₂O₃ is used instead.",
      markScheme: [
        { text: "(a) Diagram showing a regular lattice of positive ions", marks: 1 },
        { text: "(a) Delocalised electrons shown between the ions", marks: 1 },
        { text: "(a) Bonding named as metallic", marks: 1 },
        { text: "(b) Delocalised electrons are mobile and carry charge", marks: 1 },
        { text: "(c) Layers of ions slide over each other without breaking the bonding", marks: 1 },
        { text: "(d)(i) 2Al + 2NaOH + 6H₂O → 2Na[Al(OH)₄] + 3H₂", marks: 1 },
        { text: "(d)(ii) 2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂", marks: 1 },
        { text: "(e) Aluminium is above carbon in the reactivity series, so electrolysis is required", marks: 1 },
      ],
      hint: "Both malleability and conductivity come from the same picture: a lattice of positive ions in a sea of delocalised electrons. Describe that once and both parts follow.",
    },
  ],
};
