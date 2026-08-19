import type { Criterion, Paper } from "@/lib/exam-types";

/**
 * NIS Kazakh Language and Literature Я1, Grade 10 — reading and writing.
 *
 * Transcribed from the sample paper: two reading-analysis questions, each
 * built on texts printed in full, and one piece of writing chosen from two.
 *
 * The paper is marked entirely against banded descriptors, which the source
 * document prints out of 10 for each task. It does not print a paper total,
 * so the total here is the sum of the three tasks the candidate does; the
 * workspace scales that onto the official Component 1 scale before reading
 * the boundary table.
 *
 * The band descriptors below are the published ones, translated, and question
 * 1 and 2 additionally carry the specific mark scheme — what the examiner
 * expects the candidate to notice about form, audience, purpose, content,
 * style and language in each text. That specific scheme is what makes AI
 * marking of a language answer defensible: without it the model would be
 * grading prose it liked rather than the analysis the paper asked for.
 */

/** The published reading band scale, out of 10. */
const READING_BANDS: Criterion["bands"] = [
  {
    range: "9-10",
    max: 10,
    descriptor:
      "Understands and analyses very well the text type, the intended audience, form, genre, purpose, content, and the characteristic features of style and language; covers the specific mark scheme for the task. Uses a very wide vocabulary and figurative resources aptly and confidently.",
  },
  {
    range: "7-8",
    max: 8,
    descriptor:
      "Understands and analyses well the text type, audience, form, genre, purpose, content, style and language; covers the specific mark scheme. Uses a wide vocabulary and figurative resources aptly.",
  },
  {
    range: "5-6",
    max: 6,
    descriptor:
      "Understands and analyses these at a satisfactory level; covers some of the responses in the specific mark scheme. Vocabulary and figurative resources are satisfactory and broadly apt.",
  },
  {
    range: "3-4",
    max: 4,
    descriptor:
      "Limited understanding with an attempt at analysis; covers a limited set of the responses in the mark scheme. Limited vocabulary, used inaptly.",
  },
  {
    range: "1-2",
    max: 2,
    descriptor:
      "Very limited understanding; covers very few of the responses in the mark scheme. Very limited vocabulary.",
  },
  {
    range: "0",
    max: 0,
    descriptor: "Does not understand the text; covers nothing in the mark scheme.",
  },
];

/** The published writing band scale, out of 10. */
const WRITING_BANDS: Criterion["bands"] = [
  {
    range: "9-10",
    max: 10,
    descriptor:
      "Uses the creative approach very well, engages the audience fully, and justifies the chosen form of the text. Structure is appropriate and strictly maintained. Figurative resources are used very well for effect on the reader. Free, expressive, considered exposition achieving complex effects. Accuracy is of a high level.",
  },
  {
    range: "7-8",
    max: 8,
    descriptor:
      "Uses the creative approach aptly, engages the audience, and applies the form of the text consistently. Structure is appropriate and maintained. Creative use of language for effect is clear and definite. Clear and uninterrupted exposition helps achieve the intended effect. Occasional errors do not obstruct meaning.",
  },
  {
    range: "5-6",
    max: 6,
    descriptor:
      "Structure and creative ability are evident, the audience is sensed, ideas are conveyed in outline. Structure is correct but at times unsystematic, with departures from it or uneven structures. An attempt at language use; description and narration are at the level required. Word structures are clear but uniform. Disagreement of tenses and of subject and verb, spelling errors and missing punctuation reduce the intended effect.",
  },
  {
    range: "3-4",
    max: 4,
    descriptor:
      "The required stance and content are present and a sense of audience is noticeable. Structure deviates and is imprecise; description and the narration of contrasts are present but pale. Ideas are conveyed only in outline. Errors of tense, agreement, spelling and punctuation are frequent.",
  },
  {
    range: "1-2",
    max: 2,
    descriptor:
      "Meaning and the issue are addressed but the creative approach does not fit and the form is not established — for example, a descriptive task answered by narration. Structure is weak and disorganised, with frequent deviations. Structural errors make the meaning hard to follow.",
  },
  {
    range: "0",
    max: 0,
    descriptor:
      "The work does not meet the set purpose, is unclear, and its structure and content do not fit.",
  },
];

export const KAZAKH_L1_10_P1: Paper = {
  id: "kazakh-l1-10-p1",
  subjectId: "kazakh-l1",
  componentIndex: 0,
  title: "Kazakh Language & Literature Я1 Component 1",
  gradeYear: 10,
  sitting: "Sample paper",
  durationMinutes: 120,
  totalMarks: 30,
  calculator: false,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed from the NIS sample paper for Kazakh Я1, Grade 10, with its published band descriptors and the specific mark schemes for questions 1 and 2. The source document prints bands out of 10 per task and no paper total.",
  instructions: [
    "Reading: answer both questions, analysing the texts printed with them.",
    "Writing: choose one of the two tasks and write 250–300 words.",
    "Answer in Kazakh.",
    "Every answer is marked against the published band descriptors.",
    "Total for the tasks you complete: 30 marks.",
  ],
  questions: [
    {
      id: "kazl1-q1",
      number: 1,
      marks: 10,
      topic: "Reading & Comprehension",
      difficulty: "standard",
      prompt:
        "Reading. One of the two texts below is an article by a Kazinform correspondent; the other is Y. Altynsarin's story “Garden trees”. Compare the two texts and analyse their language and style, their form, and their similarities and differences.",
      promptKk:
        "Екі мәтінді салыстырып, олардың тілі мен стилін, формасын, ұқсастығын және айырмашылығын сараптаңыз.",
      marking: "assessed",
      answer:
        "Similarity: both texts concern the upbringing of children. Difference — Text A: informational with elements of reasoning, since the head teacher reasons about problems of upbringing and reports on a seminar; audience is news-followers and parents who care about upbringing; purpose is to inform that an event took place; style is publicistic; language uses proper nouns (Astana, «Ақ қайың», Ләйлә Рақымжанова, «Қазақпарат»), ordinal and cardinal numerals, international terms (семинар, эталон, интеллект), paired words, and phraseology («азық болады», «көлеңкеде қалады»); sentences are declarative, complete and extended, with the head teacher's direct speech used to support the argument; four logically linked paragraphs, third person, present tense. Text Ә: narration, since events are given as a story; audience is small children, since the language is easy and the text short; purpose is to teach through an example; style is literary; language uses the antonyms “straight” and “crooked”, the address form «шырағым», the metaphor «жас ағашсың», the simile «ағаштай», the intensified form «тіп-тік»; mostly declarative sentences with an interrogative in the dialogue; two paragraphs, with person shifting between third, first and second.",
      markScheme: [{ text: "Marked against the published reading band scale.", marks: 10 }],
      answerLanguage: "kk",
      sources: [
        {
          ref: "A",
          kind: "text",
          title: "Kazinform report on a seminar at kindergarten №29 «Ақ қайың»",
          content:
            "Астанадағы №29 «Ақ қайың» балабақшасында «Тұлғаны адамгершілікке тәрбиелеу – заман талабы» тақырыбында семинар өтті деп хабарлайды ҚазАқпарат тілшісі. Онда адамгершілік-рухани, патриоттық білім беру бағдарламасын бірыңғай білім беру кеңістігіне енгізудегі жұмыс тәжірибесі талқыланды.\n\nБалабақша меңгерушісі Ләйлә Рақымжанованың айтуынша, өскелең ұрпақты адамгершілік-рухани тәрбиелеу мәселесі қашан да өзекті болып келді.\n\nДәл осы мектепке дейінгі аралық – балаға рухани-адамгершілік тәрбие беру үшін өте ыңғайлы кезең, себебі бұл кезеңде бала айналаны аса сезімталдықпен, үлкен әсермен қабылдайды. Жалпыадамзаттық құндылықтар, рухани эталондар мен мінез-құлық ережесін қалыптастыру үшін бұл аралықты өткізіп алмау керек деп есептейді балабақша мамандары.\n\n«Бала өмірінің алғашқы 7 жылында жинақталған көзқарас оның тұтас өміріне азық болады. Бірақ қазіргі ата-аналар балалардың рухани дамуына мүмкіндік бермей, ерте жастан бүлдіршіндерінің интеллектісін дамытуға басымдық беріп жүр. Оларға баласының мектепке барғанша әріптерді білуі, ағылшын тілінде сөйлеуі, жаза білуі маңызды. Өй-өрені қуып жүргенде, кішкентай адамның рухани-адамгершілік дамуы көлеңкеде қалады. Онсыз барлық сатып алынған білім түкке аспай қалады, баланың эмоционалды-рухани жетілмеу мәселесі туындайды», – дейді меңгеруші.",
          attribution: "inform.kz (151 words)",
        },
        {
          ref: "Ә",
          kind: "text",
          title: "Y. Altynsarin, “Garden trees” (Бақша ағаштары)",
          content:
            "Жаздың әдемі бір күнінде, таңертең бір төре өзінің баласымен бақшаға барып, екеуі де егілген ағаштары мен гүл жапырақтарын көріп жүрді.\n\n– Мынау ағаш неліктен тіп-тік, ана біреуі неге қисық біткен? – деп сұрады баласы.\n\n– Оның себебі, балам, анау ағашты бағу-қағумен өсірген, қисық бұтақтары болса, кесіп отырған. Мынау ағаш бағусыз, өз шығу қалыбымен өскен, – деді атасы.\n\n– Олай болса, бағу-қағуда көп мағына бар екен ғой, – деді баласы.\n\n– Бағу-қағуда көп мағына барында шек жоқ, шырағым, мұнан сен де өзіңе әбірет алсаң болады: сен жас ағашсың, саған да күтім керек. Мен сенің қате істеріңді түзеп, пайдалы іске үйретсем, сен менің айтқанымды ұғып, орнына келтірсең, жақсы, түзік кісі болып өсерсің. Бағусыз бетіңмен кетсең, сен де мынау қисық біткен ағаштай қисық өсерсің, – деді.",
          attribution: "zkoipk.kz (120 words)",
        },
      ],
      criteria: [
        {
          id: "reading",
          name: "Analysis of text type, audience, purpose, style and language",
          maxMarks: 10,
          focus:
            "Both texts analysed on every dimension the task names — form, genre, audience, purpose, content, style, language — with the similarity and the differences drawn explicitly.",
          bands: READING_BANDS,
        },
      ],
      hint: "The task names six things to compare. An answer that discusses only style and language cannot reach the top band however well it discusses them — work through form, audience, purpose and content too, and say what the two texts share before you separate them.",
    },
    {
      id: "kazl1-q2",
      number: 2,
      marks: 10,
      topic: "Reading & Comprehension",
      difficulty: "stretch",
      prompt:
        "Reading. The text below is an extract from a speech given at the “Era, personality, society” seminar-training by Amirkhan Rakhymzhanov, deputy director of the Library of the First President. Transcription conventions: (.) and (..) mark a short and a longer pause; italicised words such as “імм..” are hesitation fillers; WORDS IN CAPITALS mark intonational stress. Analyse the features of the language and style of this text.",
      promptKk: "Мәтіннің тілі мен стилінің ерекшеліктерін сараптаңыздар.",
      marking: "assessed",
      answer:
        "Type: narration, since it answers “what did he do?”. Audience: participants in the training, and those interested in the President's Address. Form: a transcript of spoken delivery. Genre: a platform speech, since the speaker addresses an audience from a podium. Purpose: to introduce the content of the Address and connect it to the seminar theme. Style: not formal — an emotional, expressive, conversational register, as a transcript. Language: proper nouns for precision; the ordering words «біріншіден, екіншіден…» to hold the argument together; the address «армысыздар… қатысушылары!» to make contact with the audience; the hesitation before “12 сәуір” shows he cannot recall the date exactly; the stress on «ЕҢ АЛДЫМЕН» marks what matters; international terms (формула, семинар-тренинг, реалист); the repetition «ұсынған болатын» / «ұсынған еді» suggests nervousness or scattered thought. Sentences: the inversion of «Мен ойлаймын» suggests unprepared delivery; sentences are complex and compound as befits a formal occasion; an exclamatory sentence opens the speech. Text: an extract, so structure is not maintained and it is one paragraph; person moves between second and third; past-tense forms dominate; the speaker's viewpoint is clear, but the language makes the exposition somewhat hard to follow.",
      markScheme: [{ text: "Marked against the published reading band scale.", marks: 10 }],
      answerLanguage: "kk",
      sources: [
        {
          ref: "A",
          kind: "text",
          title: "Transcript of a platform speech (extract)",
          content:
            "Армысыздар (.), «Дәуір, тұлға, қоғам» семинар-тренингіне қатысушылар!\n\nӨткен жылдың ім-імм-м 12 сәуірінде ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ПРЕЗИДЕНТІ Нұрсұлтан Әбішұлы Назарбаев саяси және экономикалық жаңғыруды (..) толықтырып қана қоймай, сондай-ақ оның негізіне айналған ҚОҒАМДЫҚ САНАНЫ ЖАҢҒЫРТУДЫҢ озық міндеттерін ұсынған болатын,імм, мм... ұсынған еді. Мемлекет басшысы өзінің бағдарламалық мақаласында, ЕҢ АЛДЫМЕН, болашақ қазақстандықтың бейнесін айқындап берді. «Біріншіден, ол – әлемдік БӘСЕКЕГЕ ҚАБІЛЕТТІ жасампаз тұлға. Екіншіден, алдына нақты мақсаттар қойып, соған ұмтылатын прагматик әрі реалист. Үшіншіден, ұлттық бірегейлігін нығайтып, ұлтының дамуын тежейтін БАРЛЫҚ НӘРСЕЛЕРДЕН бас тартатын адам. Төртіншіден, білімнің салтанат құруын (..) ең маңызды іс санайтын, ЖАҺАНДЫҚ БІЛІМНІҢ шыңына шыққан жан. Бесіншіден, тек эволюциялық даму ғана халқының өсіп-өркендеуіне мүмкіндік беретінін жақсы түсінетін саналы-ы-ы азамат. Алтыншыдан, ол – түрлі тілдерді игерген, ӘЛЕМНІҢ үздік тәжірибелерін алуға және заман талаптарына сай өзгеруге қабілетті, сана-сезімі ашық жан», – деді Мемлекет басшысы.\n\nМен ойлаймын... Нұрсұлтан Әбішұлы Назарбаевтың дәл осы пайымдаулары болашақ табысты, яғни Сіздердің қалыптасуларыңыздың формуласына айналуы тиіс.",
          attribution: "presidentlibrary.kz, edited (146 words)",
        },
      ],
      criteria: [
        {
          id: "reading",
          name: "Analysis of the language and style of a spoken transcript",
          maxMarks: 10,
          focus:
            "Features read as a transcript of speech — pauses, hesitation, stress and repetition treated as evidence about the speaker, alongside form, audience, purpose and register.",
          bands: READING_BANDS,
        },
      ],
      hint: "The transcription marks are part of the text, not noise around it. A pause before a date, a repeated verb, a stressed phrase — each tells you something about the speaker that an edited article would have hidden. Say what.",
    },
    {
      id: "kazl1-q3",
      number: 3,
      marks: 10,
      topic: "Writing & Composition",
      difficulty: "stretch",
      prompt:
        "Writing. Choose ONE of the two tasks and write 250–300 words. State which task you have chosen at the top of your answer.",
      parts: [
        "1. Creative writing — your school is holding a literary evening for the anniversary of a well-known poet or writer, and you have been asked to write the script for a staged piece about that figure. Write a short script for the performance.",
        "2. Writing for a defined audience — you are to deliver a report at an inter-school conference on spiritual and moral values, titled “Problems of spiritual and moral values in the upbringing of a generation”. Write the theses of your report.",
      ],
      promptKk:
        "Берілген 2 сұрақтың бірін таңдап, 250-300 сөзден тұратын жазба жұмысын жазыңыз.",
      marking: "assessed",
      answer:
        "The two tasks are marked on different scales for a reason: the creative task rewards a justified choice of form and figurative language working on a reader, while the report rewards a firm stance, a structure that develops the issue logically, and confident address to a defined audience. Either way the piece must do what its form requires — a script that reads as a report, or theses that read as a story, cannot reach the upper bands however fluent the sentences are.",
      markScheme: [{ text: "Marked against the published writing band scale.", marks: 10 }],
      answerLanguage: "kk",
      minWords: 250,
      maxWords: 300,
      criteria: [
        {
          id: "writing",
          name: "Form, structure, audience and accuracy",
          maxMarks: 10,
          focus:
            "The chosen form sustained, structure maintained, audience engaged, figurative resources used for effect, and accuracy.",
          bands: WRITING_BANDS,
        },
      ],
      hint: "Say which task you chose before you start — the examiner marks against that task's expectations. Then commit to the form: a script needs voices and staging, theses need a claim per paragraph.",
    },
  ],
};
