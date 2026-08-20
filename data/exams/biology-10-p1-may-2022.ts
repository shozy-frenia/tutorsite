import type { Criterion, Paper, Question } from "@/lib/exam-types";

/**
 * NIS Biology, Grade 10, Component 1 — sitting of May 2022 (10BIOK/01).
 *
 * Transcribed from the original question paper (Kazakh edition). 90 marks in
 * 90 minutes: Part A is 25 one-mark multiple-choice questions with 30 minutes
 * recommended, Part B is structured with an hour recommended. A calculator and
 * ruler are permitted.
 *
 * Coverage note: 30 questions are seeded, worth 43 of the 90 marks — 11 of the
 * 25 Part A questions and 19 of Part B's parts. Everything left out depends on
 * a printed figure that is not in the document's text layer: a photograph of a
 * stem cross-section, four leaf diagrams, a placenta diagram, a hormone graph,
 * a lung pressure-volume graph, a digestive-system diagram, an arm bone, four
 * transpiration graphs, a population pyramid, a neuroglia diagram, an alveolus,
 * a karyotype, a pedigree chart and an amino-acid structure. Restating any of
 * them would mean inventing the picture.
 *
 * Part B is where this paper earns its place on the site. Its open questions
 * are marked by the examiner against the scheme's own credit points — "name
 * two features", "explain", "justify" — which is point marking, not the band
 * marking the language papers use. The student writes an answer and the marker
 * works through the points one at a time, awarding each only if the idea is
 * actually there.
 */

/** Part A: one mark, four options, marked by the machine. */
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

/** Part B: written answer, marked by the examiner against the scheme's points. */
const open = (
  id: string,
  number: number,
  marks: number,
  topic: string,
  difficulty: Question["difficulty"],
  prompt: string,
  promptKk: string,
  answer: string,
  points: Array<[string, number]>,
  focus: string,
  hint: string
): Question => {
  const scheme = points.map(([text, m]) => ({ text, marks: m }));
  const criterion: Criterion = {
    id: "content",
    name: "Biological content",
    maxMarks: marks,
    focus,
    points: scheme,
  };
  return {
    id,
    number,
    marks,
    topic,
    difficulty,
    prompt,
    promptKk,
    marking: "assessed",
    answer,
    markScheme: scheme,
    criteria: [criterion],
    answerLanguage: "kk",
    hint,
  };
};

export const BIOLOGY_10_P1_MAY_2022: Paper = {
  id: "biology-10-p1-2022-05",
  subjectId: "biology",
  componentIndex: 0,
  title: "Biology Component 1",
  gradeYear: 10,
  sitting: "May 2022",
  durationMinutes: 90,
  totalMarks: 90,
  calculator: true,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed from the original NIS question paper (10BIOK/01). 30 questions seeded — 11 of Part A's 25 and 19 of Part B's parts; the rest depend on printed figures.",
  instructions: [
    "Part A: choose one answer. About 30 minutes is recommended.",
    "Part B: write your answers. About one hour is recommended.",
    "A calculator is permitted.",
    "Part B answers are marked by the examiner against the scheme's credit points.",
    "Marks for each question are shown in brackets [ ].",
    "The full paper is 90 marks; the questions seeded here carry 43.",
  ],
  questions: [
    /* ------------------------------------------------------------- Part A */
    mcq(
      "bio10p1-q6",
      6,
      "Reproduction",
      "Identify the correct order of the stages of human embryogenesis.",
      "Адам эмбриогенезі сатыларының дұрыс реттілігін анықтаңыз.",
      [
        "A — gastrula, blastula, cleavage, neurula, zygote",
        "B — blastula, cleavage, zygote, gastrula, neurula",
        "C — zygote, cleavage, blastula, gastrula, neurula",
        "D — cleavage, zygote, blastula, gastrula, neurula",
      ],
      "C — zygote, cleavage, blastula, gastrula, neurula",
      "Development begins at fertilisation with the zygote, which cleaves to a blastula, invaginates to a gastrula, then forms the neural tube at the neurula stage.",
      "Whatever else is true, development starts at fertilisation. Two options do not even begin there."
    ),
    mcq(
      "bio10p1-q9",
      9,
      "Homeostasis",
      "Which of the following take part in controlling human body temperature?",
      "Төмендегілердің қайсысы адам денесінің температурасын бақылауға қатысады?",
      [
        "A — skin blood vessels, cerebellum and sweat glands",
        "B — skin blood vessels, hypothalamus and skeletal muscles",
        "C — kidneys, hypothalamus and skeletal muscles",
        "D — kidneys, cerebellum and sweat glands",
      ],
      "B — skin blood vessels, hypothalamus and skeletal muscles",
      "The hypothalamus is the control centre; skin blood vessels dilate or constrict as effectors, and skeletal muscles shiver to generate heat.",
      "A control system needs a centre and effectors. Find the option whose centre is the one that actually monitors blood temperature."
    ),
    mcq(
      "bio10p1-q12",
      12,
      "Nutrition",
      "A deficiency of vitamin A in the body leads to which disease?",
      "Ағзада А дәрумені жетіспеушілігі қандай ауруға әкеледі?",
      [
        "A — night blindness",
        "B — diabetes mellitus",
        "C — scurvy",
        "D — rickets",
      ],
      "A — night blindness",
      "Vitamin A is needed to make rhodopsin in the rod cells, so a deficiency shows first as poor vision in dim light.",
      "Three of these have well-known causes of their own: vitamin C, vitamin D, and insulin. That leaves one."
    ),
    mcq(
      "bio10p1-q15",
      15,
      "Transport",
      "What is the essence of blood clotting?",
      "Қан ұюының мәні неде?",
      [
        "A — sticking red blood cells together",
        "B — sticking white blood cells together",
        "C — converting fibrinogen into fibrin",
        "D — converting thrombin into prothrombin",
      ],
      "C — converting fibrinogen into fibrin",
      "Thrombin converts soluble fibrinogen into insoluble fibrin, whose threads form the mesh of the clot.",
      "One option has the conversion the right way round and one has it backwards. Which molecule is the soluble precursor?"
    ),
    mcq(
      "bio10p1-q17",
      17,
      "Genetics",
      "Which row of the table gives the chromosome sets of human cells correctly?",
      "Кестенің қай жолында адам жасушаларының хромосомалар жиынтығы дұрыс көрсетілген?",
      [
        "A — egg cell in ovary: diploid, sperm: diploid, zygote: haploid, embryo cell: haploid",
        "B — egg cell in ovary: diploid, sperm: haploid, zygote: diploid, embryo cell: diploid",
        "C — egg cell in ovary: diploid, sperm: haploid, zygote: haploid, embryo cell: diploid",
        "D — egg cell in ovary: haploid, sperm: haploid, zygote: diploid, embryo cell: diploid",
      ],
      "B — egg cell in ovary: diploid, sperm: haploid, zygote: diploid, embryo cell: diploid",
      "The cell in the ovary is still an oocyte and diploid; the sperm is a completed gamete and haploid; fertilisation restores the diploid number, which mitosis then keeps.",
      "Fertilisation restores the diploid number and mitosis preserves it, so the last two entries must match. That alone rules out two options."
    ),
    mcq(
      "bio10p1-q18",
      18,
      "Genetics",
      "The body cells of a mammal contain 48 000 genes. How many of them are inherited from its mother?",
      "Сүтқоректілердің дене жасушаларында 48 000 ген бар. Олардың қаншасы анасынан тұқым қуалайды?",
      ["A — 6 000", "B — 12 000", "C — 24 000", "D — 48 000"],
      "C — 24 000",
      "A body cell is diploid: one chromosome of each pair comes from each parent, so half the genes come from the mother.",
      "A body cell carries two of every chromosome, and each parent supplied one of the pair."
    ),
    mcq(
      "bio10p1-q19",
      19,
      "Cell Biology",
      "Which stage of mitosis is described correctly?",
      "Митоздың қай кезеңі дұрыс сипатталған?",
      [
        "A — in metaphase the centrosomes duplicate",
        "B — in anaphase the chromosomes line up along the equator",
        "C — in prophase the chromatids move to opposite poles",
        "D — in telophase the chromosomes unwind and form chromatin",
      ],
      "D — in telophase the chromosomes unwind and form chromatin",
      "Telophase reverses prophase: the nuclear envelopes re-form and the chromosomes decondense back to chromatin. Centrosomes duplicate in interphase, alignment is metaphase, and separation is anaphase.",
      "Three of these describe a real event but attach it to the wrong stage. Work through the sequence in order and see which name is out of place."
    ),
    mcq(
      "bio10p1-q20",
      20,
      "Molecular Biology",
      "A section of polypeptide reads: … histidine – proline – aspartic acid – leucine … The DNA triplets are: aspartic acid CTA/CTG, histidine GTA/GTG, leucine GAT/GAC, proline GGA/GGG. Which sequence of mRNA codons is correct for this section?",
      "Полипептидтің осы бөлімі үшін мРНҚ кодондарының қай реттілігі дұрыс?",
      [
        "A — …CAC CCC GAA CUG…",
        "B — …CAU CCU GAC CUA…",
        "C — …GTA CCA CTG GAT…",
        "D — …GUA GGA CUG GAU…",
      ],
      "B — …CAU CCU GAC CUA…",
      "The mRNA codon is complementary to the DNA triplet with U in place of T: GTA→CAU, GGA→CCU, CTG→GAC, GAT→CUA.",
      "Transcribe each DNA triplet to its complement and remember which base replaces thymine. One option is not even mRNA."
    ),
    mcq(
      "bio10p1-q21",
      21,
      "Genetics",
      "A plant with red flowers was crossed with a plant with white flowers. All the offspring had red flowers. Identify the type of inheritance of the character.",
      "Белгінің тұқымқуалау түрін анықтаңыз.",
      [
        "A — codominance",
        "B — complete dominance",
        "C — incomplete dominance",
        "D — multiple alleles",
      ],
      "B — complete dominance",
      "The whole F1 shows one parental phenotype unchanged, so the red allele completely masks the white one. Incomplete dominance would give pink; codominance would give both colours in the same flower.",
      "Ask what the offspring would look like under each option. Two of them predict a flower that is not simply red."
    ),
    mcq(
      "bio10p1-q24",
      24,
      "Microbiology",
      "Identify the correct order of the stages of a bacteriophage life cycle. (1) The phage DNA enters the cell and integrates with the bacterium's circular DNA. (2) The phage attaches to the bacterial cell wall. (3) The bacterial cell synthesises phage DNA and proteins. (4) The wall bursts, the phages are released and infect new bacterial cells. (5) New phages are assembled.",
      "Бактериофагтың тіршілік циклы кезеңдерінің дұрыс реттілігін анықтаңыз.",
      ["A — 2, 1, 3, 5, 4", "B — 4, 3, 1, 2, 5", "C — 3, 2, 1, 4, 5", "D — 1, 4, 2, 5, 3"],
      "A — 2, 1, 3, 5, 4",
      "Attachment must come first and lysis last; between them the DNA enters, the host synthesises phage components, and the new phages are assembled.",
      "Two events can only be at the ends of the cycle: the phage cannot inject before it lands, and it cannot burst out before it exists."
    ),
    mcq(
      "bio10p1-q25",
      25,
      "Biotechnology",
      "Genetically modified bacteria are used to produce human insulin. Before this method, the only insulin available was from cattle or pigs, extracted from the animals' pancreas. Which statements about the two methods are correct? W — large volumes of bacteria can be grown in a small space. X — bacteria reproduce very quickly and produce insulin quickly. Y — people sometimes become ill from cattle or pig insulin. Z — the insulin bacteria produce differs from the insulin a human pancreas produces.",
      "Екі әдіске қатысты қай тұжырымдар дұрыс?",
      ["A — W, X and Y", "B — W, X and Z", "C — W, Y and Z", "D — X, Y and Z"],
      "A — W, X and Y",
      "W, X and Y are all true. Z is false: the point of inserting the human gene is that the bacteria make insulin identical to the human hormone.",
      "One of the four statements contradicts the whole reason for using genetic modification. Find it, and the answer is the option that leaves it out."
    ),

    /* ------------------------------------------------------------- Part B */
    open(
      "bio10p1-q26aii",
      26,
      2,
      "Coordination",
      "standard",
      "Nervous tissue consists of neurons and neuroglia. Describe the role of oligodendrocytes in the transmission of nerve impulses.",
      "Олигодендроциттердің жүйке импульстерін берудегі рөлін сипаттаңыз.",
      "Oligodendrocytes wrap their processes around axons in the central nervous system and form the myelin sheath. Myelin insulates the axon so that the impulse jumps between the nodes of Ranvier — saltatory conduction — which makes transmission much faster than in an unmyelinated fibre.",
      [
        ["Oligodendrocytes form the myelin sheath around axons in the CNS.", 1],
        [
          "Myelin insulates the axon so the impulse jumps between the nodes of Ranvier (saltatory conduction), speeding transmission.",
          1,
        ],
      ],
      "What the cell makes, and what that structure does to the speed of the impulse.",
      "Two marks means two distinct ideas: what the cell builds, and what that structure does for the impulse. Naming the sheath alone earns one."
    ),
    open(
      "bio10p1-q26bii",
      27,
      2,
      "Coordination",
      "foundation",
      "The diameter of the pupil changes with the level of light intensity. Describe the role of this reflex in human life.",
      "Бұл рефлекстің адам өміріндегі рөлін сипаттаңыз.",
      "The reflex regulates how much light reaches the retina: the pupil constricts in bright light and dilates in dim light. This protects the retina and its photoreceptors from damage by intense light, and allows enough light in to see when it is dim.",
      [
        ["Controls the amount of light entering the eye and reaching the retina.", 1],
        [
          "Protects the retina from damage in bright light, and allows vision in dim light.",
          1,
        ],
      ],
      "What the reflex regulates, and why regulating it matters in both directions.",
      "The reflex works both ways, and each direction has a purpose. An answer that only explains bright light is halfway there."
    ),
    open(
      "bio10p1-q26c",
      28,
      3,
      "Coordination",
      "stretch",
      "There are many products that replace smoking, and electronic cigarettes are now common among young people. They cannot, however, be called safe. Explain the harmful effect of using electronic cigarettes on the nervous system.",
      "Электронды темекіні қолданудың жүйке жүйесіне жағымсыз әсерін түсіндіріңіз.",
      "E-cigarette vapour delivers nicotine, which binds to nicotinic acetylcholine receptors in the brain. It stimulates dopamine release in the reward pathway, so dependence and addiction develop. In adolescents the brain is still developing, so nicotine disrupts the formation of synapses and impairs attention, memory and learning; withdrawal brings irritability, anxiety and difficulty concentrating.",
      [
        ["Names nicotine as the active substance acting on the nervous system.", 1],
        [
          "Explains its action on the brain — binds acetylcholine receptors and raises dopamine in the reward pathway, causing dependence.",
          1,
        ],
        [
          "Gives a consequence for the adolescent nervous system: disrupted synapse formation, impaired attention, memory or learning, or withdrawal symptoms.",
          1,
        ],
      ],
      "The substance, its mechanism in the brain, and a specific consequence — three separate steps.",
      "“Explain” wants a chain, not a verdict. Name the substance, say what it does at the synapse, then say what that costs the person."
    ),
    open(
      "bio10p1-q27a",
      29,
      1,
      "Transport",
      "foundation",
      "Define the term diffusion.",
      "Диффузия терминіне анықтама беріңіз.",
      "Diffusion is the net movement of particles from a region of higher concentration to a region of lower concentration, down a concentration gradient, until the concentrations are equal. It is passive and requires no energy from the cell.",
      [
        [
          "Net movement of particles from higher to lower concentration, down a concentration gradient (passive, no energy required).",
          1,
        ],
      ],
      "A definition that names the direction of movement relative to the gradient.",
      "A one-mark definition still has to say which way the particles go and relative to what. “Movement of particles” on its own is not enough."
    ),
    open(
      "bio10p1-q27ci",
      30,
      2,
      "Microbiology",
      "foundation",
      "One cause of disrupted gas exchange in the lungs is tuberculosis, whose agent is the bacterium Koch's bacillus. State two features of the structure of a bacterial cell.",
      "Бактериялық жасуша құрылымының екі ерекшелігін көрсетіңіз.",
      "Any two of: no true nucleus — the DNA is a single circular molecule in the nucleoid; a cell wall made of peptidoglycan (murein); no membrane-bound organelles such as mitochondria; 70S ribosomes; plasmids; a flagellum or capsule.",
      [
        ["One correct structural feature of a prokaryotic cell.", 1],
        ["A second, genuinely different structural feature.", 1],
      ],
      "Two distinct features of prokaryotic cell structure, not the same feature restated.",
      "The marks are for structure, not for what the bacterium does. Think about what a prokaryotic cell has that a human cell does not — and what it lacks."
    ),
    open(
      "bio10p1-q27cii",
      31,
      1,
      "Immunity",
      "foundation",
      "One effective measure for preventing tuberculosis is vaccination. What type of immunity forms in a person as a result of vaccination?",
      "Вакцинация нәтижесінде адамда иммунитеттің қандай түрі қалыптасады?",
      "Artificially acquired active immunity — the body makes its own antibodies and memory cells in response to the antigen in the vaccine.",
      [
        ["Artificial (artificially acquired) active immunity.", 1],
      ],
      "Both halves of the name: how it was acquired, and whether the body did the work.",
      "The name has two parts. One says where the antigen came from; the other says whether the body made the antibodies itself."
    ),
    open(
      "bio10p1-q28a",
      32,
      1,
      "Genetics",
      "foundation",
      "Define the term karyotype.",
      "Кариотип терминіне анықтама беріңіз.",
      "A karyotype is the full set of chromosomes of a cell or organism, described by their number, size and shape — the characteristic chromosome complement of a species, usually shown arranged in pairs.",
      [
        [
          "The complete set of chromosomes of a cell or organism, characterised by their number, size and shape.",
          1,
        ],
      ],
      "The definition must cover both the count and the visible characteristics.",
      "A karyotype is more than “the chromosomes”. What is recorded about them?"
    ),
    open(
      "bio10p1-q28biii",
      33,
      2,
      "Genetics",
      "standard",
      "Name two reasons for the difficulties in studying hereditary characteristics in humans.",
      "Адамдағы тұқымқуалаушылық белгілерін зерттеудегі қиындықтардың екі себебін атаңыз.",
      "Any two of: experimental crosses cannot be arranged for ethical reasons; humans have few offspring per family, so the samples are too small for ratios; the generation time is long, about 20–25 years; the karyotype is large, with many chromosomes and linkage groups; environmental conditions cannot be controlled.",
      [
        ["One valid reason.", 1],
        ["A second, genuinely different reason.", 1],
      ],
      "Two distinct obstacles — ethical, statistical, temporal or genetic.",
      "Think about what a geneticist can do with fruit flies and cannot do with people. There are at least four differences worth a mark."
    ),
    open(
      "bio10p1-q29aii",
      34,
      1,
      "Molecular Biology",
      "foundation",
      "Proteins are important organic substances synthesised in the cell from 20 amino acids. Name the groups that take part in forming a peptide bond.",
      "Пептидтік байланыс түзуге қатысатын топтарды атаңыз.",
      "The carboxyl group (–COOH) of one amino acid and the amino group (–NH₂) of the next; water is released as the bond forms.",
      [
        ["The carboxyl group (–COOH) and the amino group (–NH₂).", 1],
      ],
      "Both groups named correctly.",
      "The bond joins one end of one amino acid to the opposite end of the next. Name both ends."
    ),
    open(
      "bio10p1-q29aiii",
      35,
      1,
      "Molecular Biology",
      "foundation",
      "Describe the primary structure of proteins.",
      "Нәруыздардың бірінші реттік құрылымын сипаттаңыз.",
      "The primary structure is the linear sequence of amino acids in the polypeptide chain, joined by peptide bonds — the order in which the residues occur.",
      [
        [
          "The sequence or order of amino acids in the polypeptide chain, linked by peptide bonds.",
          1,
        ],
      ],
      "Sequence and bond type, not shape.",
      "Primary structure says nothing about folding. It is one property of the chain, and only one."
    ),
    open(
      "bio10p1-q29aiv",
      36,
      2,
      "Molecular Biology",
      "standard",
      "Complete the table of the main stages of protein biosynthesis in the cell. Row 1: stage ?, location in cell — nucleus, reaction product ?. Row 2: stage ?, location ?, reaction product — protein.",
      "Жасушадағы нәруыз биосинтезінің негізгі кезеңдерін кестеге толтырыңыз.",
      "Row 1: transcription, in the nucleus, product mRNA. Row 2: translation, on the ribosomes in the cytoplasm (on the rough endoplasmic reticulum), product protein (polypeptide).",
      [
        ["Transcription named, taking place in the nucleus, with mRNA as its product.", 1],
        [
          "Translation named, taking place on the ribosomes in the cytoplasm, giving the protein.",
          1,
        ],
      ],
      "Both stages named with the location and product that belong to each.",
      "Two stages, and the table gives you one cell of each row. Work out which stage happens where the given location is."
    ),
    open(
      "bio10p1-q29bi",
      37,
      1,
      "Ecology",
      "foundation",
      "Nodule bacteria live in the roots of leguminous plants. Name the type of relationship between the nodule bacteria and the roots of the legume.",
      "Түйнек бактериялары мен бұршақ тұқымдас өсімдік тамырлары арасындағы қарым-қатынас түрін атаңыз.",
      "Symbiosis — specifically mutualism, since both partners benefit.",
      [["Symbiosis (mutualism).", 1]],
      "The relationship named correctly.",
      "Ask who benefits. If the answer is “both”, the term follows."
    ),
    open(
      "bio10p1-q29bii",
      38,
      2,
      "Ecology",
      "standard",
      "Farmers make wide use of leguminous plants to increase the yield of cultivated crops. Justify the reason for using leguminous plants.",
      "Бұршақ тұқымдас өсімдіктерді пайдалану себебін негіздеңіз.",
      "The nodule bacteria fix atmospheric nitrogen, converting N₂ into compounds the plant can use. When the legume is ploughed in or its roots decay, the soil is enriched with nitrogen compounds, so the next crop grows better and less nitrogen fertiliser is needed.",
      [
        ["Nodule bacteria fix atmospheric nitrogen into compounds plants can absorb.", 1],
        [
          "The soil is enriched with nitrogen, raising the yield of the following crop and reducing the need for fertiliser.",
          1,
        ],
      ],
      "The biological process, and the agricultural consequence that follows from it.",
      "“Justify” asks for the chain, not the fact. What do the bacteria do, and what does that leave behind in the soil?"
    ),
    open(
      "bio10p1-q29ci",
      39,
      1,
      "Biotechnology",
      "foundation",
      "Suggest one modern agricultural technology aimed at increasing the yield of cultivated plants.",
      "Мәдени өсімдіктердің өнімділігін арттыруға бағытталған заманауи ауылшаруашылық технологияларының бірін ұсыныңыз.",
      "Any one of: genetic modification of crops; micropropagation or tissue culture; hydroponics; drip irrigation; precision agriculture; selective breeding with marker-assisted selection; greenhouse cultivation.",
      [["A relevant modern technology named.", 1]],
      "One named technology that plausibly raises yield.",
      "One named technology is enough for this mark — but it has to be a technology, not a wish."
    ),
    open(
      "bio10p1-q29cii",
      40,
      2,
      "Biotechnology",
      "stretch",
      "Evaluate the effectiveness of using the technology you suggested.",
      "Оны қолданудың тиімділігін бағалаңыз.",
      "An evaluation weighs both sides. For genetic modification, for example: yields rise and resistance to pests, disease or drought can be built in, reducing pesticide use and losses; against that, the seed is expensive, biodiversity may narrow, there are regulatory and public-acceptance barriers, and long-term ecological effects are still debated. The mark is for the balance, not for the enthusiasm.",
      [
        ["One clear advantage, tied to yield or resource use.", 1],
        ["One limitation, cost or risk — the answer weighs both sides.", 1],
      ],
      "A judgement with both sides present; an answer that only praises the technology has not evaluated it.",
      "“Evaluate” is not “describe”. An answer with only good things in it cannot reach both marks however true they are."
    ),
    open(
      "bio10p1-q30a",
      41,
      1,
      "Evolution",
      "standard",
      "Cultivated grape varieties descend from the wild Eurasian species Vitis silvestris. Put the evolutionary processes that led to the cultivated grape in order. A — conflict between unlimited reproduction and limited resources; B — appearance of different ways of adapting to environmental conditions; C — struggle for existence; D — natural selection; E — appearance of new forms. Position 4 is given as D.",
      "Мәдени жүзім түрінің пайда болуына әкелген эволюциялық үдерістердің реттілігін орнатыңыз.",
      "1 — B, 2 — A, 3 — C, 4 — D, 5 — E. Variation appears first, the conflict between reproductive potential and limited resources follows, that conflict is the struggle for existence, natural selection acts on the variation, and new forms result.",
      [["The order B, A, C, D, E, with D in the position given.", 1]],
      "The full sequence correct, consistent with the position already filled in.",
      "You are given position 4. Work outward from it: selection needs something to select from, and something must follow it."
    ),
    open(
      "bio10p1-q30bi",
      42,
      1,
      "Evolution",
      "foundation",
      "Determine which species criterion the following description belongs to: “Grape flowers are small, gathered into compound racemes or panicles. The fruits are berries, spherical or egg-shaped, gathered in more or less loose, rarely dense clusters. The colour of the berries depends on the variety.”",
      "Келесі сипаттамалардың қай түр критерийіне жататынын анықтаңыз.",
      "The morphological criterion.",
      [["Morphological criterion named.", 1]],
      "The criterion named correctly.",
      "Read what the description actually records. Nothing about habitat, physiology or chromosomes appears in it."
    ),
    open(
      "bio10p1-q30bii",
      43,
      1,
      "Evolution",
      "standard",
      "Explain the reason for your choice of species criterion.",
      "Таңдауыңыздың себебін түсіндіріңіз.",
      "Because the description records only external structural features — the form of the inflorescence, and the shape, arrangement and colour of the fruits. These are features of appearance and structure, which is exactly what the morphological criterion covers.",
      [
        [
          "Justifies it by the content of the description: it lists external structural features — flower and fruit shape, arrangement and colour.",
          1,
        ],
      ],
      "The justification must point at what the description contains, not restate the criterion's name.",
      "Do not define the criterion — point at the description and say which words in it are morphological."
    ),
    open(
      "bio10p1-q30ci",
      44,
      3,
      "Biochemistry",
      "stretch",
      "Describe a method for detecting glucose in grapes.",
      "Жүзімдегі глюкозаны анықтау әдісін сипаттаңыз.",
      "Crush the grapes and filter to obtain the juice. Add Benedict's (or Fehling's) reagent to a sample of the juice in a test tube. Heat the tube in a water bath at about 80–90 °C for a few minutes. A brick-red precipitate of copper(I) oxide shows that a reducing sugar such as glucose is present; the solution staying blue means none is present.",
      [
        ["Prepares the sample: crushes the grapes and obtains the juice or extract.", 1],
        ["Adds Benedict's or Fehling's reagent and heats in a water bath.", 1],
        [
          "States the positive result: a brick-red (orange-red) precipitate indicates a reducing sugar, and blue indicates its absence.",
          1,
        ],
      ],
      "A method in steps — sample, reagent and heat, observed result — not just the name of the test.",
      "Three marks means three stages. Naming the reagent is one of them; the other two are what you do before it and what you look for after."
    ),
    open(
      "bio10p1-q30cii",
      45,
      2,
      "Biochemistry",
      "stretch",
      "Describe the structural feature of starch that enables it to carry out a storage function.",
      "Крахмалдың қорға жинау қызметін қамтамасыз ететін құрылымдық ерекшелігін сипаттаңыз.",
      "Starch is a branched, coiled polymer of α-glucose — amylose is a helix and amylopectin is branched. Because it is a large, compact molecule it is insoluble in water, so it exerts no osmotic effect on the cell and does not diffuse out; the branching also gives many ends at which enzymes can release glucose quickly when it is needed.",
      [
        [
          "Describes the structure: a large branched or coiled polymer of α-glucose (amylose helix, amylopectin branched).",
          1,
        ],
        [
          "Links it to the function: compact and insoluble, so it is osmotically inactive and stays in the cell, yet is readily hydrolysed back to glucose.",
          1,
        ],
      ],
      "Structure and the storage consequence that follows from it, both present.",
      "The question asks for a feature *that enables* the function — so a description of the molecule alone earns one mark, not two."
    ),
  ],
};
