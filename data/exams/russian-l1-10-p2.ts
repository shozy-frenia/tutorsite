import type { Paper } from "@/lib/exam-types";

/**
 * NIS Russian Language and Literature Я1, Grade 10 — Component 2, Writing.
 *
 * Transcribed from the 2025 collection of graded student answers published by
 * the Centre for Pedagogical Measurement. That document sets out the paper
 * precisely: 45 minutes, one question chosen from three, 200–240 words, and
 * 20 marks split ten for content and organisation and ten for range and
 * accuracy of language. Each question fixes a genre, a purpose and an
 * audience, and the examiner's reports are explicit that missing any of the
 * three costs content marks however well the piece is written.
 *
 * The paper is modelled the way it is sat: one question worth 20 marks with
 * three prompts to choose between, not three questions worth 60. The choice
 * is the candidate's; the tariff is not.
 *
 * The third prompt is not carried here — it is not in the text layer of the
 * source document. Its absence changes nothing about the marking, since the
 * candidate answers one prompt in any case.
 */
export const RUSSIAN_L1_10_P2: Paper = {
  id: "russian-l1-10-p2",
  subjectId: "russian-l1",
  componentIndex: 1,
  title: "Russian Language & Literature Я1 Component 2",
  gradeYear: 10,
  sitting: "2025",
  durationMinutes: 45,
  totalMarks: 20,
  calculator: false,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed from the 2025 NIS collection of graded student answers for Grade 10 Russian Я1. Two of the three prompts are carried; the third is not in the source document's text layer.",
  instructions: [
    "Choose ONE question and write 200–240 words.",
    "Your answer must be written in the appropriate register.",
    "Each question fixes a genre, a purpose and an audience — all three are marked.",
    "Dictionaries may not be used.",
    "Content and organisation: 10 marks. Range and accuracy of language: 10 marks.",
  ],
  questions: [
    {
      id: "rusl1-p2-q1",
      number: 1,
      marks: 20,
      topic: "Writing & Composition",
      difficulty: "stretch",
      prompt:
        "Choose ONE of the questions below and write an answer of 200–240 words. State which one you are answering. Your answer must be sustained in the appropriate register.",
      parts: [
        "Вопрос 1. Илон Маск сказал, что мы находимся на заре новой эры в освоении космоса. Напишите статью для школьного журнала, в которой отразите положительные и отрицательные последствия освоения космоса для человечества.",
        "Вопрос 2. Вы журналист и взяли интервью для городского сайта «Путь к мечте» у местного бизнесмена, который, не имея материального достатка, прошёл непростой путь и стал влиятельным человеком. Напишите текст своего интервью.",
      ],
      marking: "assessed",
      answer:
        "Content and organisation credit the three things the question fixes: the genre (an article carries a headline, a lead and an argument; an interview carries questions and answers in a journalist's voice), the purpose, and the audience it is written for. The examiner's reports single out two failures repeatedly — substituting your own theme for the one set, and writing fluently in the wrong genre. Language credit rewards a wide, precise vocabulary and complex constructions that are actually controlled; agreement errors, preposition errors and misused set phrases pull the second half of the mark down even where the argument is sound.",
      markScheme: [
        { text: "Content and organisation — genre, purpose, audience, structure.", marks: 10 },
        { text: "Range and accuracy of language.", marks: 10 },
      ],
      answerLanguage: "ru",
      minWords: 200,
      maxWords: 240,
      criteria: [
        {
          id: "content",
          name: "Содержание и организация",
          maxMarks: 10,
          focus:
            "Genre, purpose and audience all met; a structure that develops the idea rather than listing; the set theme answered and not replaced by the candidate's own.",
          bands: [
            {
              range: "9-10",
              max: 10,
              descriptor:
                "The genre is fully realised and the purpose met; the audience is addressed consistently and convincingly. The structure develops the idea logically from a clear opening to a conclusion that follows from it. Everything on the page serves the task that was set.",
            },
            {
              range: "7-8",
              max: 8,
              descriptor:
                "The genre and purpose are met and the audience is felt. The structure is sound, with at most a minor lapse of sequence. The set theme is answered throughout.",
            },
            {
              range: "5-6",
              max: 6,
              descriptor:
                "The genre is recognisable and the theme addressed, but the audience is only intermittently in view or part of the task is thinly covered. The structure is present but at times unsystematic.",
            },
            {
              range: "3-4",
              max: 4,
              descriptor:
                "The form is unclear or partly substituted — for example, an article written as a personal essay — or the candidate has drifted onto a theme of their own. The structure deviates and ideas are conveyed only in outline.",
            },
            {
              range: "1-2",
              max: 2,
              descriptor:
                "The task is barely met: the genre is not established, the audience is absent, and the writing is disorganised.",
            },
            { range: "0", max: 0, descriptor: "Nothing creditworthy." },
          ],
        },
        {
          id: "language",
          name: "Разнообразие и точность языковых средств",
          maxMarks: 10,
          focus:
            "Range and precision of vocabulary, control of complex constructions, and accuracy of agreement, prepositions, spelling and punctuation.",
          bands: [
            {
              range: "9-10",
              max: 10,
              descriptor:
                "A wide and precise vocabulary used with a sure sense of register; complex constructions are built and punctuated correctly; errors are rare and never obstruct meaning.",
            },
            {
              range: "7-8",
              max: 8,
              descriptor:
                "A good vocabulary with some precision; complex constructions are attempted and mostly controlled; occasional errors of agreement, prepositions or punctuation do not obstruct meaning.",
            },
            {
              range: "5-6",
              max: 6,
              descriptor:
                "An adequate but uniform vocabulary; sentence structures are clear but repetitive; noticeable errors of agreement and punctuation reduce the effect without preventing understanding.",
            },
            {
              range: "3-4",
              max: 4,
              descriptor:
                "A limited vocabulary with frequent imprecision; attempts at complex constructions are built illogically or punctuated wrongly; frequent agreement, preposition and spelling errors.",
            },
            {
              range: "1-2",
              max: 2,
              descriptor:
                "A very limited vocabulary; repeated errors make meaning difficult to follow.",
            },
            { range: "0", max: 0, descriptor: "Nothing creditworthy." },
          ],
        },
      ],
      hint: "Before you write a sentence, name the three things the question fixed: genre, purpose, audience. Half the content marks are lost by candidates who write well about the topic in the wrong form — an interview needs questions on the page, an article needs a headline and a line of argument.",
    },
  ],
};
