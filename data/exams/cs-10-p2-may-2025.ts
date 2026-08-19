import type { Paper } from "@/lib/exam-types";

/**
 * NIS Computer Science, Grade 10, Component 2 — sitting of May 2025 (10CSCI/02).
 *
 * Transcribed from the original question paper (Russian edition). The paper is
 * 60 marks in 90 minutes, built entirely around one scenario: the delivery
 * company «Алтын», its twenty warehouses and the information system it wants
 * built. Every answer has to be given in the context of that scenario, which
 * is why the scenario is carried on each question rather than assumed.
 *
 * Coverage note: 16 of the 18 questions are seeded, worth 53 of the 60 marks.
 * Question 3(c) requires the two printed internet-provider tariff tables and
 * question 6(h) requires the printed C++ listing to trace; neither is in the
 * document's text layer, and inventing the numbers would mean inventing exam
 * content. The workspace scales whatever is answered onto the official 60-mark
 * Component 2 scale, so the grade stays honest either way.
 *
 * Every question is self-marked. This paper awards marks for justification and
 * for code that a machine cannot check by string comparison — "предложите и
 * обоснуйте" has no single right answer, only a mark scheme. Marking your own
 * work against that scheme is the skill the paper is testing.
 */
export const CS_10_P2_MAY_2025: Paper = {
  id: "cs-10-p2-2025-05",
  subjectId: "computer-science",
  componentIndex: 1,
  title: "Computer Science Component 2",
  gradeYear: 10,
  sitting: "May 2025",
  durationMinutes: 90,
  totalMarks: 60,
  calculator: false,
  provenance: "transcribed",
  provenanceNote:
    "Transcribed from the original NIS question paper (10CSCI/02). 16 of 18 questions seeded — 3(c) needs the printed tariff tables and 6(h) the printed code listing.",
  instructions: [
    "Answer all questions.",
    "All answers must be given clearly in the context of the scenario.",
    "You may lose marks if you do not show your calculations or omit units.",
    "No marks are awarded for naming specific application software or hardware.",
    "Marks for each question are shown in brackets [ ].",
    "Total for this paper: 60 marks.",
  ],
  questions: [
    {
      id: "cs10p2-q1",
      number: 1,
      marks: 3,
      topic: "Programming",
      difficulty: "foundation",
      prompt:
        "Scenario: the company «Алтын» delivers goods across Kazakhstan from twenty warehouses and wants to automate the work with an information system. To deliver the project the company must work through the stages of software development. Write in the missing stages: 1 Analysis, 2 ?, 3 Implementation, 4 ?, 5 ?",
      promptKk:
        "Для успешной реализации проекта по автоматизации доставки товаров компания «Алтын» должна выполнить определённые этапы разработки ПО. Допишите недостающие этапы разработки ПО. 1 Анализ · 2 · 3 Реализация · 4 · 5",
      marking: "worked",
      answer:
        "2 — Design; 4 — Testing; 5 — Maintenance (evaluation and support after release).",
      markScheme: [
        { text: "Stage 2 given as design.", marks: 1 },
        { text: "Stage 4 given as testing.", marks: 1 },
        { text: "Stage 5 given as maintenance, evaluation or support.", marks: 1 },
      ],
      hint: "The classic five-stage life cycle. You are given stages 1 and 3 — the two either side of implementation are what surrounds writing the code.",
    },
    {
      id: "cs10p2-q2",
      number: 2,
      marks: 2,
      topic: "Networks",
      difficulty: "standard",
      prompt:
        "At the analysis stage the company has to choose a computer system to process order information. Suggest a type of computer system and justify your choice.",
      promptKk:
        "На этапе анализа компании необходимо выбрать компьютерную систему для обработки информации о заказах. Предложите тип компьютерной системы и обоснуйте свой ответ.",
      marking: "worked",
      answer:
        "A server-based (client–server) system, because twenty warehouses must all read and write to one shared database at the same time and the data has to stay consistent and centrally backed up.",
      markScheme: [
        { text: "A suitable type named — server / client–server / distributed system.", marks: 1 },
        {
          text: "Justification tied to the scenario: many warehouses sharing one database, centralised storage, concurrent access or reliability.",
          marks: 1,
        },
      ],
      hint: "Twenty sites, one database. Which arrangement lets all of them work on the same data at once?",
    },
    {
      id: "cs10p2-q3a",
      number: 3,
      marks: 2,
      topic: "Networks",
      difficulty: "standard",
      prompt:
        "(a) Warehouse staff scan the track code when goods arrive and the information goes into the database. Suggest a type of computer network (wired / wireless) and justify your answer.",
      promptKk:
        "Сотрудники склада при получении товаров сканируют трек-код, и информация о товаре поступает в базу данных. Предложите тип компьютерной сети (проводная / беспроводная) и обоснуйте свой ответ.",
      marking: "worked",
      answer:
        "Wireless, because scanners are carried around the warehouse floor and staff must move freely between goods rather than stand at a cabled point.",
      markScheme: [
        { text: "A type chosen — wired or wireless.", marks: 1 },
        {
          text: "Justification that fits the scenario: mobility of the scanner across the warehouse (wireless), or stability and speed at a fixed station (wired).",
          marks: 1,
        },
      ],
      hint: "Either answer can earn both marks. The mark is for the reason, and the reason has to be about scanning goods in a warehouse.",
    },
    {
      id: "cs10p2-q3b",
      number: 4,
      marks: 2,
      topic: "Networks",
      difficulty: "standard",
      prompt:
        "(b) Each warehouse's local network must be connected through the internet to the company's overall network. Suggest a network device for this connection and describe its purpose.",
      promptKk:
        "Локальная сеть каждого склада должна быть подключена через Интернет к общей сети компании. Предложите сетевое устройство для подключения и опишите его назначение.",
      marking: "worked",
      answer:
        "A router. It connects the warehouse LAN to the wider network and forwards packets between the two, choosing the route to the destination address.",
      markScheme: [
        { text: "A suitable device named — router (or gateway / modem-router).", marks: 1 },
        {
          text: "Purpose described: joins two networks and directs or forwards data between them.",
          marks: 1,
        },
      ],
      hint: "Naming the device alone is one mark. The second mark is for saying what it does with the data.",
    },
    {
      id: "cs10p2-q3d",
      number: 5,
      marks: 2,
      topic: "Networks",
      difficulty: "standard",
      prompt:
        "(d) Connecting to a network, particularly a public one, can carry risks to data and devices. Give two security measures the network administrator should take when connecting company staff to the network.",
      promptKk:
        "Подключение к сети, особенно к общедоступным сетям, может включать в себя риски для безопасности данных и устройств. Приведите две меры безопасности, которые следует принимать администратору сети при подключении сотрудников компании к сети.",
      marking: "worked",
      answer:
        "Any two of: a firewall on the connection; encryption of traffic (VPN / HTTPS); strong authentication with individual accounts and passwords; up-to-date antivirus; restricting access rights to what each role needs.",
      markScheme: [
        { text: "One valid security measure.", marks: 1 },
        { text: "A second, genuinely different security measure.", marks: 1 },
      ],
      hint: "Two measures, not one measure described twice. Naming a product earns nothing — name the control.",
    },
    {
      id: "cs10p2-q4",
      number: 6,
      marks: 2,
      topic: "Programming",
      difficulty: "standard",
      prompt:
        "To design the user interface, the results of interviews held with most of the company's staff three years ago were used. Assess whether those interview results are still relevant (relevant / not relevant) and justify your answer.",
      promptKk:
        "Для разработки пользовательского интерфейса были взяты результаты интервью с большинством сотрудников компании, проведённого три года назад. Оцените актуальность результатов интервью (актуальны / неактуальны) и обоснуйте свой ответ.",
      marking: "worked",
      answer:
        "Not relevant. Three years is long enough for staff, work processes and the volume of orders to have changed, so the requirements gathered then may no longer describe the work the interface has to support.",
      markScheme: [
        { text: "A judgement stated — relevant or not relevant.", marks: 1 },
        {
          text: "Justification: requirements, staff or processes change over three years, so the data must be re-gathered.",
          marks: 1,
        },
      ],
      hint: "The judgement on its own is one mark. Say what changes in three years to earn the second.",
    },
    {
      id: "cs10p2-q5",
      number: 7,
      marks: 5,
      topic: "Programming",
      difficulty: "standard",
      prompt:
        "Every employee has to register in the system. Registration records full name, telephone, position, sex and password. Design a registration form for company staff and label the components you use.",
      promptKk:
        "Каждый сотрудник компании должен зарегистрироваться в системе. При регистрации указываются: ФИО, телефон, должность, пол, пароль. Разработайте форму для регистрации сотрудников компании и подпишите названия используемых компонентов.",
      marking: "worked",
      answer:
        "A form carrying: text box for full name; text box (masked input) for telephone; drop-down list or combo box for position; radio buttons for sex; password box for the password; plus labels for each field and a submit button.",
      markScheme: [
        { text: "Text box used for full name, with a label.", marks: 1 },
        { text: "Text box used for telephone, with a label.", marks: 1 },
        { text: "Drop-down list or combo box used for position.", marks: 1 },
        { text: "Radio buttons (or equivalent single-choice control) used for sex.", marks: 1 },
        { text: "Password field, plus a submit button and named components throughout.", marks: 1 },
      ],
      hint: "The marks are for choosing the right control for each kind of data. Sex is one choice from a fixed short list; position is one choice from a longer list — those are different controls.",
    },
    {
      id: "cs10p2-q6a",
      number: 8,
      marks: 1,
      topic: "Data Structures",
      difficulty: "foundation",
      prompt:
        "Distances between the twenty warehouses are held in a table: row Warehouse1 reads 0, 270, …, 1200; row Warehouse2 reads 270, 0, …, 832, and so on, with zeros down the diagonal. (a) Name the kind of data structure that will be used to store these distances.",
      promptKk:
        "Назовите вид структуры данных, который будет использоваться для хранения расстояний между складами.",
      marking: "worked",
      answer: "A two-dimensional array (a 20 × 20 matrix).",
      markScheme: [
        { text: "Two-dimensional array / matrix named.", marks: 1 },
      ],
      hint: "Distance from one warehouse to another needs two indices to address it, not one.",
    },
    {
      id: "cs10p2-q6b",
      number: 9,
      marks: 2,
      topic: "Data Structures",
      difficulty: "standard",
      prompt: "(b) Write the code to declare the data structure from part (a).",
      promptKk: "Напишите код для объявления структуры данных в задании (a).",
      marking: "worked",
      answer: "int distance[20][20];",
      markScheme: [
        { text: "A two-dimensional array declared with a numeric element type.", marks: 1 },
        { text: "Both dimensions sized 20 (or 21 if indexing from 1), with a sensible identifier.", marks: 1 },
      ],
      hint: "One declaration line. The second mark is for the sizes matching the twenty warehouses.",
    },
    {
      id: "cs10p2-q6c",
      number: 10,
      marks: 3,
      topic: "Data Structures",
      difficulty: "standard",
      prompt:
        "(c) The distance from warehouse 7 to warehouse 15 is 675 km. Write the command that stores this value in the structure declared in part (b).",
      promptKk:
        "Расстояние от склада 7 до склада 15 составляет 675 км. Напишите команду для записи этого значения в структуру, объявленную в задании (b).",
      marking: "worked",
      answer:
        "distance[6][14] = 675;  and, because the table is symmetric, distance[14][6] = 675;",
      markScheme: [
        { text: "Correct element addressed with two indices.", marks: 1 },
        { text: "Indices match warehouses 7 and 15 under the chosen indexing (6 and 14 when counting from 0).", marks: 1 },
        { text: "Value 675 assigned; the symmetric element is set too.", marks: 1 },
      ],
      hint: "Watch the off-by-one: if the array starts at index 0, warehouse 7 is not index 7. And the distance table is symmetric.",
    },
    {
      id: "cs10p2-q6d",
      number: 11,
      marks: 7,
      topic: "Programming",
      difficulty: "stretch",
      prompt:
        "(d) The distances are entered interactively — \"Enter the distance between warehouse 1 and 2: 270\", \"Enter the distance between warehouse 1 and 3: 310\", … , \"Enter the distance between warehouse 20 and 19: 150\". Write C++ code to input the distances between the warehouses.",
      promptKk:
        "Расстояния между складами вводятся в таблицу в интерактивном режиме. Напишите код на языке программирования C++ для ввода расстояний между складами.",
      marking: "worked",
      answer:
        "for (int i = 0; i < 20; i++)\n  for (int j = 0; j < 20; j++) {\n    if (i == j) { distance[i][j] = 0; continue; }\n    cout << \"Enter the distance between warehouse \" << i + 1 << \" and \" << j + 1 << \": \";\n    cin >> distance[i][j];\n  }",
      markScheme: [
        { text: "Outer loop over the warehouses.", marks: 1 },
        { text: "Nested inner loop over the warehouses.", marks: 1 },
        { text: "Both loops bounded correctly at 20.", marks: 1 },
        { text: "Prompt printed before each input.", marks: 1 },
        { text: "Prompt shows the two warehouse numbers, counting from 1.", marks: 1 },
        { text: "Value read into the correct element of the two-dimensional array.", marks: 1 },
        { text: "The diagonal handled — a warehouse's distance to itself is 0, not asked for.", marks: 1 },
      ],
      hint: "Two nested loops. Every mark after the loops is about what the user sees and where the value lands.",
    },
    {
      id: "cs10p2-q6e",
      number: 12,
      marks: 6,
      topic: "Algorithms",
      difficulty: "stretch",
      prompt:
        "(e) The largest distance between warehouses has to be found. Write C++ code that finds the largest distance and outputs the numbers of those two warehouses.",
      promptKk:
        "В таблице расстояний необходимо найти наибольшее расстояние между складами. Напишите код на языке программирования C++, который находит наибольшее расстояние и выводит номера этих складов.",
      marking: "worked",
      answer:
        "int max = distance[0][1], a = 0, b = 1;\nfor (int i = 0; i < 20; i++)\n  for (int j = 0; j < 20; j++)\n    if (distance[i][j] > max) { max = distance[i][j]; a = i; b = j; }\ncout << \"Warehouses \" << a + 1 << \" and \" << b + 1 << \", distance \" << max;",
      markScheme: [
        { text: "A maximum variable initialised before the search.", marks: 1 },
        { text: "Nested loops traversing the array.", marks: 1 },
        { text: "Each element compared against the current maximum.", marks: 1 },
        { text: "Maximum updated when a larger value is found.", marks: 1 },
        { text: "The two indices stored alongside the maximum.", marks: 1 },
        { text: "Both warehouse numbers output, counting from 1.", marks: 1 },
      ],
      hint: "Finding the value is only half of it — the question asks which two warehouses, so you must remember where the maximum was found.",
    },
    {
      id: "cs10p2-q6f",
      number: 13,
      marks: 5,
      topic: "Algorithms",
      difficulty: "standard",
      prompt:
        "(f) When loading at the warehouse, each box's type is decided (oversized / standard). A box counts as oversized if its weight is more than 50 kg or any one of its dimensions (length, height, width) is greater than or equal to 100 cm. Draw a flowchart to determine the type of a box.",
      promptKk:
        "Коробка считается габаритной, если её вес более 50 кг или одно из измерений (длина, высота, ширина) больше либо равно 100 см. Нарисуйте блок-схему для определения типа коробки.",
      marking: "worked",
      answer:
        "Start → input weight, length, height, width → decision: weight > 50 OR length >= 100 OR height >= 100 OR width >= 100? → yes: output \"oversized\"; no: output \"standard\" → End.",
      markScheme: [
        { text: "Start and end terminators present.", marks: 1 },
        { text: "Input box for weight and the three dimensions.", marks: 1 },
        { text: "Decision diamond containing the condition.", marks: 1 },
        { text: "Condition correct: weight > 50 OR any dimension >= 100 — strict on weight, inclusive on the dimensions.", marks: 1 },
        { text: "Both branches labelled and each producing the right output.", marks: 1 },
      ],
      hint: "Read the two comparisons carefully — one is \"more than\" and the other is \"greater than or equal to\". Getting them the same way round loses a mark.",
    },
    {
      id: "cs10p2-q6g",
      number: 14,
      marks: 5,
      topic: "Programming",
      difficulty: "stretch",
      prompt:
        "(g) Write C++ code to determine the type of a box using a subprogram. The subprogram must take the weight and the dimensions of the box as parameters.",
      promptKk:
        "Напишите код на языке программирования C++ для определения типа коробки с использованием подпрограммы. Оформите подпрограмму, используя параметры веса и габаритов коробки.",
      marking: "worked",
      answer:
        "string boxType(double w, double l, double h, double d) {\n  if (w > 50 || l >= 100 || h >= 100 || d >= 100) return \"oversized\";\n  return \"standard\";\n}\n\nint main() {\n  double w, l, h, d;\n  cin >> w >> l >> h >> d;\n  cout << boxType(w, l, h, d);\n  return 0;\n}",
      markScheme: [
        { text: "A subprogram defined with a return type or output parameter.", marks: 1 },
        { text: "Weight and all three dimensions passed as parameters.", marks: 1 },
        { text: "Condition inside the subprogram matches part (f).", marks: 1 },
        { text: "Both outcomes returned or output.", marks: 1 },
        { text: "Subprogram actually called from main with the input values.", marks: 1 },
      ],
      hint: "The marks are for the subprogram being a subprogram: parameters in, result out, called from main. Code that does the test inline earns very little here.",
    },
    {
      id: "cs10p2-q7a",
      number: 15,
      marks: 3,
      topic: "Programming",
      difficulty: "foundation",
      prompt: "(a) When testing the program, test data is used. List the types of test data.",
      promptKk:
        "При тестировании программы используются тестовые данные. Перечислите типы тестовых данных.",
      marking: "worked",
      answer: "Normal (valid) data, boundary (extreme) data, and abnormal (erroneous / invalid) data.",
      markScheme: [
        { text: "Normal or valid data.", marks: 1 },
        { text: "Boundary or extreme data.", marks: 1 },
        { text: "Abnormal, erroneous or invalid data.", marks: 1 },
      ],
      hint: "Three types. One is data that should work, one sits exactly on the edge of what is allowed, one should be rejected.",
    },
    {
      id: "cs10p2-q7b",
      number: 16,
      marks: 3,
      topic: "Programming",
      difficulty: "standard",
      prompt:
        "(b) When goods are distributed, a warehouse number is entered into the program. Give an example of each type of test data for this input.",
      promptKk:
        "При распределении груза в программу вводится номер склада. Приведите примеры для каждого типа тестовых данных.",
      marking: "worked",
      answer:
        "Normal: 7. Boundary: 1 or 20 (and 0 or 21 as the values just outside). Abnormal: −5, 35, or a letter such as \"A\".",
      markScheme: [
        { text: "Normal example inside 1–20.", marks: 1 },
        { text: "Boundary example at 1 or 20 — the ends of the valid range.", marks: 1 },
        { text: "Abnormal example: out of range, negative, or not a number.", marks: 1 },
      ],
      hint: "There are twenty warehouses, so the valid range is fixed. The boundary examples are the two ends of that range, not any number near them.",
    },
  ],
};
