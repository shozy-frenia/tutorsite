import type { Criterion, Paper, SourceMaterial } from "@/lib/exam-types";

/**
 * NIS History of Kazakhstan, Grade 10 — the 2025–2026 external summative
 * assessment, built from the published test specification (Kazakh edition).
 *
 * The specification defines one paper of 130 minutes: Section A carries three
 * compulsory source-based questions worth 12, 15 and 18 marks, and Section B
 * one essay of 25 chosen from three. 70 marks in total. The sample questions
 * and the four sources below are the ones printed in §7 of the specification.
 *
 * Every question here is `assessed`: there is no answer to compare against,
 * only a rubric. The specification is explicit about what earns credit — a
 * candidate has to show contextual knowledge across *at least three* of the
 * sources and reach a judgement, which is why the sources travel with the
 * question into the marking request and why the marked script comes back
 * saying which sources the answer actually used.
 *
 * Source C is a photograph. The specification prints the image; we hold its
 * caption and provenance, so the question can still be answered and marked on
 * what the source is and when it dates from, and the fact that the picture
 * itself is not reproduced is stated rather than hidden.
 */

const SOURCES: SourceMaterial[] = [
  {
    ref: "A",
    kind: "text",
    title: "On Stalin and the term “enemy of the people”",
    content:
      "Analysing this question properly matters so that what happened under J. Stalin is never repeated.\n\n… J. Stalin introduced the concept of “enemy of the people”. This concept made it possible to subject any person to the cruellest repression while breaking the norms of law. “Enemy of the people” denied a person any possibility of expressing their own opinion.",
    attribution:
      "Adapted from material in the journal «Известия ЦК КПСС», № 3, 1989.",
  },
  {
    ref: "B",
    kind: "text",
    title: "Extract from a decree of the Presidium of the USSR Supreme Soviet",
    content:
      "Considering that the restrictions on the legal status of the Chechens, Ingush and Karachai and their families deported from the North Caucasus during the years of the Great Patriotic War are no longer necessary, the Supreme Soviet of the USSR resolves:\n\n1. That the Chechens, Ingush, Karachai and members of their families deported to special settlements during the Great Patriotic War be removed from the register of special settlements and released from the administrative supervision of the organs of the Ministry of Internal Affairs of the USSR.\n\n2. That it be confirmed that the lifting of the restrictions on special settlement for the peoples named in Article 1 of this Decree does not carry the right to the return of property confiscated at the time of deportation, nor the right to return to their home areas.",
    attribution:
      "Chairman of the Presidium of the Supreme Soviet of the USSR, K. Voroshilov. The Kremlin, 16 July 1956.",
  },
  {
    ref: "C",
    kind: "image",
    title: "Photograph depicting the collapse of the Stalinist system",
    content:
      "A photograph dated 1956, held by the Museum of Contemporary Art, Hungary, captioned as depicting the collapse of the Stalinist system. The image itself is printed on the paper and is not reproduced here — treat it as a photographic source of 1956, contemporary with the events, and evaluate it as such: what a photograph of that date can and cannot tell a historian.",
    attribution: "1956. Museum of Contemporary Art, Hungary.",
  },
  {
    ref: "D",
    kind: "text",
    title: "The courage of Zhumabek Tashenev",
    content:
      "Zhumabek Tashenev describes his answer to the plan to create a “Virgin Lands region” and attach it to Russia:\n\nI told Nikita Sergeyevich that I was against this question being decided at all — indeed against it even being placed on the agenda.\n\nN. Khrushchev said: “Who are you to go against the agreement of the Politburo? We trusted you, we raised you to head the republic's government, and this is what you are saying. We will decide this question without you. The Soviet country is one state, and which land is given to which republic is the will of the Supreme Soviet of the USSR.”\n\nI then said: “Nikita Sergeyevich, if the Supreme Soviet is going to decide the lands of each republic without its local organs, then the Constitution of the USSR and of the national republics must be abolished. Those Constitutions contain articles giving each national republic the right to use its historic land and the wealth in it as its own property. Nobody has the right to change that.” I went on: “If a situation arises in which these laws are not respected, then we will not shrink from complaining even to international legal institutions — we have that right.”",
    attribution:
      "From an article by the Russian sociologist A. Roshchin, published on the «Новые известия» portal, 2018.",
  },
];

/** The three-band general scheme the specification applies to Section A. */
const thirds = (max: number, subject: string): Criterion["bands"] => {
  const high = Math.ceil((max * 2) / 3) + 1;
  const mid = Math.ceil(max / 3) + 1;
  return [
    {
      range: `${high}-${max}`,
      max,
      descriptor: `High. ${subject} is developed across at least three sources, with contextual knowledge that is accurate and relevant throughout, and the answer reaches a supported conclusion rather than stopping at description.`,
    },
    {
      range: `${mid}-${high - 1}`,
      max: high - 1,
      descriptor: `Middle. ${subject} is developed across two or more sources with correct contextual knowledge, but the answer may not be carried through confidently or completely.`,
    },
    {
      range: `1-${mid - 1}`,
      max: mid - 1,
      descriptor: `Low. ${subject} rests on a single source, or the contextual knowledge is superficial, or the sources are evaluated insufficiently.`,
    },
    { range: "0", max: 0, descriptor: "Nothing creditworthy." },
  ];
};

/** Section B is marked against the specification's A / C / E grade descriptors. */
const ESSAY_BANDS: Criterion["bands"] = [
  {
    range: "20-25",
    max: 25,
    descriptor:
      "Grade A standard: knowledge of history is recalled and selected to strengthen a thorough, logical argument; communication is clear and uses concepts coherently; knowledge of past societies and individuals is shown; many historical facts are cited and used as evidence; the limits of particular evidence are clearly identified; evidence is compared to reach one firm, reasoned conclusion.",
  },
  {
    range: "13-19",
    max: 19,
    descriptor:
      "Grade C standard: reasonably good historical knowledge supports a logical argument; communication is clear using broadly coherent concepts; historical facts are cited and used as evidence; the limits of evidence are identified; evidence is compared to reach an understandable conclusion.",
  },
  {
    range: "6-12",
    max: 12,
    descriptor:
      "Grade E standard: historical knowledge is present in support of the argument; concepts are used to make relevant connections; awareness of other people's viewpoints is shown with specific examples; the use of historical facts as evidence is limited; evidence is compared without a conclusion being drawn.",
  },
  {
    range: "1-5",
    max: 5,
    descriptor:
      "Below E: assertion with little historical knowledge, no use of evidence, and no comparison.",
  },
  { range: "0", max: 0, descriptor: "Nothing creditworthy." },
];

export const HISTORY_10_2025: Paper = {
  id: "history-10-2025",
  subjectId: "history-kazakhstan",
  componentIndex: 0,
  title: "History of Kazakhstan Component 1",
  gradeYear: 10,
  sitting: "Specification 2025–2026",
  durationMinutes: 130,
  totalMarks: 70,
  calculator: false,
  provenance: "transcribed",
  provenanceNote:
    "Sample questions and sources transcribed from the published NIS test specification for Grade 10 History of Kazakhstan, 2025–2026 (Kazakh edition). Source C is a photograph printed on the paper; its caption and provenance are carried here, the image is not.",
  instructions: [
    "Section A: answer all three questions, using the sources and your own knowledge.",
    "Section B: answer one essay question of the three offered.",
    "Marks for each question are shown in brackets [ ].",
    "Credit depends on using the sources as evidence, not on naming them.",
    "Total for this paper: 70 marks. Time: 130 minutes.",
  ],
  questions: [
    {
      id: "hist10-1a",
      number: 1,
      marks: 12,
      topic: "Development of the State",
      difficulty: "standard",
      prompt:
        "Section A. Using the sources and your own knowledge, evaluate the value of these sources for a historian studying the “Thaw” period in Kazakhstan.",
      promptKk:
        "Дереккөздер мен өз біліміңізді пайдалана отырып, Қазақстандағы «жылымық» кезеңін зерттейтін тарихшы үшін берілген дереккөздердің құндылығын бағалаңыз.",
      marking: "assessed",
      answer:
        "A strong answer identifies what kind of source each one is — B a primary official document of the period, A and C material exposing the cult of personality, D a later recollection published in 2018 — and judges each for what it can tell a historian. It weighs the contradiction inside state policy visible across A and B (restrictions lifted, but property and return refused), reads D for the survival of the command-administrative system in national policy, treats C as a contemporary photograph with the limits that carries, and connects the whole to knowledge of the period, such as the Temirtau protests.",
      markScheme: [
        { text: "AO1 — contextual knowledge across at least three sources.", marks: 6 },
        { text: "AO3 — reasoned judgement on the value of at least three sources.", marks: 6 },
      ],
      sources: SOURCES,
      answerLanguage: "kk",
      criteria: [
        {
          id: "ao1",
          name: "AO1 — Knowledge and understanding",
          maxMarks: 6,
          focus:
            "Correct, in-context knowledge shown across at least three of the sources, connected to what the candidate knows of the period.",
          bands: [
            {
              range: "5-6",
              max: 6,
              descriptor:
                "Correct contextual knowledge across at least three sources: official documents of the Thaw identified as primary (B), the exposure of the cult of personality (A, C), the survival of the command-administrative system and its methods (B, D), the shortcomings of national policy and the disregard of national interest (D), and awareness that social groups opposed Soviet policy (C, D), linked to the candidate's own knowledge such as the Temirtau protests.",
            },
            {
              range: "3-4",
              max: 4,
              descriptor:
                "Correct contextual knowledge across two or more sources, but not carried through confidently or completely.",
            },
            {
              range: "1-2",
              max: 2,
              descriptor:
                "Superficial contextual knowledge relevant to only one source, or an insufficient evaluation of the evidence.",
            },
            { range: "0", max: 0, descriptor: "Nothing creditworthy." },
          ],
        },
        {
          id: "ao3",
          name: "AO3 — Judgement and evaluation of sources",
          maxMarks: 6,
          focus:
            "A reasoned judgement on the value of at least three sources, distinguishing primary evidence from later interpretation.",
          bands: [
            {
              range: "5-6",
              max: 6,
              descriptor:
                "A reasoned judgement on the value of at least three sources for the historian, distinguishing primary sources from interpreted ones and relating official document, scholarly article, photograph and memoir to one another; uses A and B to analyse the contradictions in state policy and to analyse the Thaw itself, and recognises what D's date of publication does to its value.",
            },
            {
              range: "3-4",
              max: 4,
              descriptor:
                "A judgement on two or more sources with some evaluation of their type, but not sustained across the set.",
            },
            {
              range: "1-2",
              max: 2,
              descriptor:
                "Assertion about one source, or description of content in place of evaluation of value.",
            },
            { range: "0", max: 0, descriptor: "Nothing creditworthy." },
          ],
        },
      ],
      hint: "Value is not the same as content. For each source ask who made it, when, for whom — and what that lets a historian claim. A 1956 decree and a 2018 memoir are worth different things even when they describe the same policy.",
    },
    {
      id: "hist10-1b",
      number: 2,
      marks: 15,
      topic: "Development of the State",
      difficulty: "standard",
      prompt:
        "Using the sources and your own knowledge, explain the distinctive features of the social and political life of Kazakhstan during the “Thaw” period.",
      promptKk:
        "Дереккөздер мен өз біліміңізді пайдалана отырып, «жылымық» кезеңіндегі Қазақстанның қоғамдық-саяси өмірінің ерекшелігін түсіндіріңіз.",
      marking: "assessed",
      answer:
        "A strong answer explains the Thaw as a partial liberalisation that left the command-administrative system intact: the cult of personality condemned (A), deported peoples released from special settlement but denied their property and their return (B), and national interest still overridden from the centre (D). It uses at least three sources as evidence rather than illustration, and supports the explanation with knowledge of the period.",
      markScheme: [
        { text: "Explanation developed across the sources and own knowledge.", marks: 15 },
      ],
      sources: SOURCES,
      answerLanguage: "kk",
      criteria: [
        {
          id: "explain",
          name: "Explanation from sources and own knowledge",
          maxMarks: 15,
          focus:
            "Features of social and political life explained with the sources used as evidence, not as illustration.",
          bands: thirds(15, "The explanation"),
        },
      ],
      hint: "The question asks what was distinctive, which means holding two things together: what genuinely changed after 1956, and what did not. Source B does both at once — read its two articles against each other.",
    },
    {
      id: "hist10-1c",
      number: 3,
      marks: 18,
      topic: "Development of the State",
      difficulty: "stretch",
      prompt:
        "Assess the role of Zhumabek Tashenev in defending national interests. Explain your answer using the sources and your own knowledge.",
      promptKk:
        "Жұмабек Ташеневтің ұлттық мүдделерді қорғаудағы рөліне баға беріңіз. Дереккөздер мен өз біліміңізді пайдалана отырып жауабыңызды түсіндіріңіз.",
      marking: "assessed",
      answer:
        "A strong answer assesses rather than narrates: it uses D as the central evidence, weighs Tashenev's constitutional argument against the political cost of making it, sets his stand in the context the other sources establish, and takes a position on how far one official could defend national interest inside that system — noting that D is a recollection published decades later.",
      markScheme: [
        { text: "Assessment developed across the sources and own knowledge.", marks: 18 },
      ],
      sources: SOURCES,
      answerLanguage: "kk",
      criteria: [
        {
          id: "assess",
          name: "Assessment, argument and use of sources",
          maxMarks: 18,
          focus:
            "A supported judgement on Tashenev's role, built from at least three sources and the candidate's own knowledge.",
          bands: thirds(18, "The assessment"),
        },
      ],
      hint: "“Assess” wants a verdict with a weight behind it. Narrating what Tashenev said earns little; judging what his stand achieved, and what it cost, against the system the other sources describe is the question.",
    },
    {
      id: "hist10-2",
      number: 4,
      marks: 25,
      topic: "Development of the State",
      difficulty: "stretch",
      prompt:
        "Section B. Answer ONE of the three essay questions. State which one you are answering at the top of your answer.",
      parts: [
        "1. “During the years of stagnation the economy of Kazakhstan achieved great successes.” How far do you agree with this view? Explain your answer.",
        "2. Evaluate the importance of the Constitution in the stable development of the Republic of Kazakhstan. Justify your answer.",
        "3. “Amre Kashaubayev was a promoter of Kazakh culture on the world stage.” How far do you agree with this view? Explain your answer.",
      ],
      promptKk:
        "Берілген үш эссе сұрағының біреуіне жауап беріңіз. [25]",
      marking: "assessed",
      answer:
        "A strong essay takes a position on the claim in its opening, argues it through with specific historical facts used as evidence rather than as decoration, acknowledges the limits of that evidence and the existence of other views, and closes with one firm reasoned conclusion rather than a summary.",
      markScheme: [
        { text: "Essay marked against the A / C / E grade descriptors.", marks: 25 },
      ],
      answerLanguage: "kk",
      criteria: [
        {
          id: "essay",
          name: "Historical argument",
          maxMarks: 25,
          focus:
            "Selected knowledge, evidence used as evidence, awareness of the limits of that evidence, and one reasoned conclusion.",
          bands: ESSAY_BANDS,
        },
      ],
      hint: "“How far do you agree” is not an invitation to agree. The mark is for the argument's structure: a position, evidence that is cited and weighed, the counter-view met, and a conclusion that follows from what came before.",
    },
  ],
};
