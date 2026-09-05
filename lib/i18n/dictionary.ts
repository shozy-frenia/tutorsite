/**
 * UI copy in three locales.
 *
 * Why three: 21 of the 26 pilots study in the Kazakh parallel, and one wrote
 * that the Grade 10 maths papers were shown in English while the original sat
 * in Kazakh, "and on some questions the wording is impossible to follow". That
 * is not a polish issue — it is a student unable to attempt a question because
 * of the interface language. Kazakh is therefore a first-class locale here,
 * not an afterthought.
 *
 * `kk` is the default for the Kazakh parallel, `ru` for the Russian parallel,
 * `en` for anyone who asks for it. See lib/i18n/index.ts for the resolution
 * order.
 *
 * Conventions:
 *   · Keys are namespaced by surface: nav.*, auth.*, exam.*, ...
 *   · {placeholders} are substituted by t(key, vars).
 *   · Kazakh and Russian run roughly 15% longer than English for the same
 *     string. Nothing here is written to a pixel width — layouts use ch-based
 *     measures so the long locales do not overflow.
 */

export const LOCALES = ["kk", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABEL: Record<Locale, string> = {
  kk: "Қазақша",
  ru: "Русский",
  en: "English",
};

/** Short label for the switcher in the header, where room is tight. */
export const LOCALE_SHORT: Record<Locale, string> = {
  kk: "ҚАЗ",
  ru: "РУС",
  en: "ENG",
};

/** BCP-47 tags for <html lang> and for Intl date/number formatting. */
export const LOCALE_TAG: Record<Locale, string> = {
  kk: "kk-KZ",
  ru: "ru-KZ",
  en: "en",
};

type Dict = Record<string, string>;

const en: Dict = {
  // ---- common ----------------------------------------------------------
  "common.back": "Back",
  "common.next": "Next",
  "common.previous": "Previous",
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.retry": "Try again",
  "common.loading": "Loading",
  "common.marks": "marks",
  "common.minutes": "min",
  "common.questions": "questions",
  "common.of": "of",
  "common.grade": "Grade",
  "common.subject": "Subject",
  "common.optional": "optional",
  "common.soon": "Coming soon",

  // ---- nav -------------------------------------------------------------
  "nav.library": "Mock papers",
  "nav.dashboard": "Dashboard",
  "nav.start": "Start a mock",
  "nav.menu": "Menu",
  "nav.language": "Language",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",
  "nav.account": "Account",

  // ---- landing ---------------------------------------------------------
  "landing.eyebrow": "МЭСК · NIS · Cambridge",
  "landing.title.a": "Ace Cambridge exams",
  "landing.title.b": "without the burnout",
  "landing.sub":
    "Mock papers taken from the real thing, marked against the real boundary table, with a tutor that explains the one step you actually got wrong.",
  "landing.builtFor":
    "Built for students sitting the Cambridge International Examination at Nazarbayev Intellectual Schools. Grades 10, 11 and 12.",
  "landing.cta.primary": "Sit a mock exam",
  "landing.cta.secondary": "See the dashboard",
  "landing.noAccount": "No account needed for the first paper.",
  "landing.ladder.title": "The grade ladder",
  "landing.ladder.hint": "Drag · hover · click",
  "landing.ladder.scale": "A* down to U",
  "landing.does.title": "What it actually does",
  "landing.does.eyebrow": "Five things, done properly",
  "landing.architecture.title": "Three years, three different exams",
  "landing.architecture.eyebrow": "The architecture",
  "landing.boundaries.title": "The boundaries we grade against",
  "landing.boundaries.eyebrow": "Minimum mark per grade",
  "landing.boundaries.subjectLevel": "Subject level",
  "landing.boundaries.byComponent": "By component",
  "landing.boundaries.note":
    "A dash means the published table has no band there. A* is awarded at subject level in every year, but only Grade 12 component tables carry an A* band.",
  "landing.tutor.title": "It answers in the language you asked in",
  "landing.tutor.eyebrow": "Kazakh · Russian · English",
  "landing.final.title": "Start with one paper",
  "landing.final.sub":
    "You will know your grade the second you submit.",

  // ---- library ---------------------------------------------------------
  "library.title": "Every paper we have",
  "library.hint": "Click a card · arrow keys work",
  "library.filter.all": "All subjects",
  "library.filter.year": "Grade year",
  "library.sit": "Sit this paper",
  "library.bringToFront": "Bring to front",
  "library.pastPaper": "Past paper",
  "library.practice": "Practice",
  "library.calculator": "Calculator",
  "library.noCalculator": "No calculator",
  "library.gradedOn": "Graded on {component} / {max}",
  "library.empty.title": "No papers for your setup yet",
  "library.empty.body":
    "We have no papers matching Grade {year} yet. You can still open any paper from another year to practise — the boundary table used will be the one that paper is graded on.",
  "library.empty.browseAll": "Browse every paper",

  // ---- registration / profile -----------------------------------------
  "profile.title": "Set up your papers",
  "profile.sub":
    "Three answers decide which exams you will actually sit. Nothing else is asked.",
  "profile.name": "First name",
  "profile.namePlaceholder": "What should we call you?",
  "profile.nameHint": "First name only. We never ask for your full name or school.",
  "profile.year": "Which grade are you in?",
  "profile.parallel": "Which parallel?",
  "profile.parallel.kazakh": "Kazakh",
  "profile.parallel.russian": "Russian",
  "profile.parallelHint":
    "This decides which language is Я1 and which is Я2, so it decides which language papers you will ever sit.",
  "profile.profileSubjects": "Profile subjects",
  "profile.profileSubjectsOne": "Choose one profile subject",
  "profile.profileSubjectsTwo": "Choose two profile subjects",
  "profile.profileSubjectsNone": "Grade 11 has no profile subjects.",
  "profile.target": "Target grade",
  "profile.submit": "Save and see my papers",
  "profile.edit": "Edit setup",

  // ---- auth ------------------------------------------------------------
  "auth.title": "Save your progress",
  "auth.sub":
    "Your attempts are saved on this device already. Sign in and they follow you to your phone, and stay put if you clear your browser.",
  "auth.google": "Continue with Google",
  "auth.emailLabel": "Or use your email",
  "auth.emailPlaceholder": "you@example.com",
  "auth.sendLink": "Send me a sign-in link",
  "auth.linkSent": "Check your inbox — we sent a sign-in link to {email}.",
  "auth.linkError": "That did not send. Check the address and try again.",
  "auth.invalidEmail": "That email does not look right yet.",
  "auth.later": "Not now",
  "auth.guestNotice": "You are working as a guest. Progress is on this device only.",
  "auth.signedInAs": "Signed in as {name}",
  "auth.merged": "{count} attempts from this device were added to your account.",
  "auth.privacy":
    "We store your first name, grade year, parallel and your attempts. Nothing else.",
  "auth.syncing": "Syncing",
  "auth.syncFailed": "Could not sync. Your work is safe on this device.",

  // ---- exam ------------------------------------------------------------
  "exam.question": "Question {n} of {total}",
  "exam.yourAnswer": "Your answer",
  "exam.answerPart": "Part {part}",
  "exam.addAnswerRow": "Add another line",
  "exam.submitAnswer": "Check",
  "exam.submitPaper": "Finish and see my grade",
  "exam.correct": "Correct",
  "exam.incorrect": "Not this time",
  "exam.partial": "{awarded} of {marks} marks",
  "exam.markScheme": "Mark scheme",
  "exam.explain": "Explain this step",
  "exam.anotherLikeThis": "Another like this",
  "exam.timeLeft": "Time left",
  "exam.noCalculator": "No calculator on this paper",
  "exam.result.title": "You scored {raw} out of {max}",
  "exam.result.grade": "That is a {grade}",
  "exam.result.toNext": "{marks} marks from a {grade}",
  "exam.result.review": "Review my answers",
  "exam.result.again": "Sit another paper",
  "exam.confirmLeave": "Leave this paper? Your answers on this page are kept.",

  // ---- tutor -----------------------------------------------------------
  "tutor.title": "Ask Talap",
  "tutor.placeholder": "Ask about the exam…",
  "tutor.send": "Send",
  "tutor.thinking": "Reading the mark scheme",
  "tutor.slow": "Still working — this one is taking longer than usual.",
  "tutor.failed": "The tutor did not answer. Here is the published mark scheme instead.",
  "tutor.offline":
    "The tutor is unavailable right now, but the mark scheme and boundary tables below are the real ones.",
  "tutor.langNote": "Answers come back in the language you asked in.",

  // ---- dashboard -------------------------------------------------------
  "dash.title": "Your progress",
  "dash.streak": "Day streak",
  "dash.attempts": "Papers sat",
  "dash.projection": "Projected grade",
  "dash.mastery": "Mastery by topic",
  "dash.weakest": "Weakest topics",
  "dash.trend": "Grade trend",
  "dash.history": "History",
  "dash.empty.title": "Nothing here yet",
  "dash.empty.body": "Sit one paper and this page fills up.",
  "dash.empty.cta": "Choose a paper",

  // ---- errors ----------------------------------------------------------
  "error.generic": "Something went wrong.",
  "error.offline": "You are offline. Your answers are saved on this device.",
  "error.notFound": "We could not find that paper.",
};

const ru: Dict = {
  "common.back": "Назад",
  "common.next": "Дальше",
  "common.previous": "Назад",
  "common.close": "Закрыть",
  "common.cancel": "Отмена",
  "common.save": "Сохранить",
  "common.retry": "Попробовать снова",
  "common.loading": "Загрузка",
  "common.marks": "баллов",
  "common.minutes": "мин",
  "common.questions": "вопросов",
  "common.of": "из",
  "common.grade": "Класс",
  "common.subject": "Предмет",
  "common.optional": "необязательно",
  "common.soon": "Скоро",

  "nav.library": "Пробники",
  "nav.dashboard": "Прогресс",
  "nav.start": "Начать пробник",
  "nav.menu": "Меню",
  "nav.language": "Язык",
  "nav.signIn": "Войти",
  "nav.signOut": "Выйти",
  "nav.account": "Аккаунт",

  "landing.eyebrow": "МЭСК · NIS · Cambridge",
  "landing.title.a": "Сдай МЭСК",
  "landing.title.b": "без выгорания",
  "landing.sub":
    "Пробники собраны из настоящих работ, оцениваются по настоящей таблице границ, а репетитор объясняет тот самый шаг, на котором ты потерял балл.",
  "landing.builtFor":
    "Для тех, кто сдаёт Cambridge International Examination в Назарбаев Интеллектуальных школах. 10, 11 и 12 классы.",
  "landing.cta.primary": "Решить пробник",
  "landing.cta.secondary": "Посмотреть прогресс",
  "landing.noAccount": "Для первой работы аккаунт не нужен.",
  "landing.ladder.title": "Шкала оценок",
  "landing.ladder.hint": "Тяни · наводи · нажимай",
  "landing.ladder.scale": "От A* до U",
  "landing.does.title": "Что сайт реально делает",
  "landing.does.eyebrow": "Пять вещей, сделанных как надо",
  "landing.architecture.title": "Три года — три разных экзамена",
  "landing.architecture.eyebrow": "Как устроен экзамен",
  "landing.boundaries.title": "Таблица границ, по которой мы оцениваем",
  "landing.boundaries.eyebrow": "Минимальный балл на оценку",
  "landing.boundaries.subjectLevel": "По предмету",
  "landing.boundaries.byComponent": "По компонентам",
  "landing.boundaries.note":
    "Прочерк означает, что в опубликованной таблице этой полосы нет. A* выставляется на уровне предмета во всех классах, но в таблицах компонентов A* есть только у 12 класса.",
  "landing.tutor.title": "Отвечает на том языке, на котором ты спросил",
  "landing.tutor.eyebrow": "Қазақша · Русский · English",
  "landing.final.title": "Начни с одной работы",
  "landing.final.sub": "Оценку увидишь сразу после сдачи.",

  "library.title": "Все работы, что у нас есть",
  "library.hint": "Нажми на карточку · стрелки работают",
  "library.filter.all": "Все предметы",
  "library.filter.year": "Класс",
  "library.sit": "Решать эту работу",
  "library.bringToFront": "Вывести вперёд",
  "library.pastPaper": "Прошлый экзамен",
  "library.practice": "Тренировка",
  "library.calculator": "С калькулятором",
  "library.noCalculator": "Без калькулятора",
  "library.gradedOn": "Оценивается по {component} / {max}",
  "library.empty.title": "Для твоего класса работ пока нет",
  "library.empty.body":
    "Работ для {year} класса у нас пока нет. Можно открыть работу другого класса и потренироваться — оценка будет по той таблице, по которой эта работа считается.",
  "library.empty.browseAll": "Показать все работы",

  "profile.title": "Настрой свои работы",
  "profile.sub":
    "Три ответа решают, какие экзамены ты реально сдаёшь. Больше ничего не спрашиваем.",
  "profile.name": "Имя",
  "profile.namePlaceholder": "Как к тебе обращаться?",
  "profile.nameHint": "Только имя. Фамилию и школу мы не спрашиваем.",
  "profile.year": "В каком ты классе?",
  "profile.parallel": "Какая у тебя параллель?",
  "profile.parallel.kazakh": "Казахская",
  "profile.parallel.russian": "Русская",
  "profile.parallelHint":
    "Параллель решает, какой язык у тебя Я1, а какой Я2 — а значит, какие языковые работы тебе вообще предстоят.",
  "profile.profileSubjects": "Профильные предметы",
  "profile.profileSubjectsOne": "Выбери один профильный предмет",
  "profile.profileSubjectsTwo": "Выбери два профильных предмета",
  "profile.profileSubjectsNone": "В 11 классе профильных предметов нет.",
  "profile.target": "Цель по оценке",
  "profile.submit": "Сохранить и открыть работы",
  "profile.edit": "Изменить настройки",

  "auth.title": "Сохрани прогресс",
  "auth.sub":
    "Твои попытки уже сохранены на этом устройстве. Войди — и они переедут на телефон и не пропадут, если почистишь браузер.",
  "auth.google": "Продолжить через Google",
  "auth.emailLabel": "Или по почте",
  "auth.emailPlaceholder": "you@example.com",
  "auth.sendLink": "Прислать ссылку для входа",
  "auth.linkSent": "Проверь почту — ссылка для входа отправлена на {email}.",
  "auth.linkError": "Не отправилось. Проверь адрес и попробуй ещё раз.",
  "auth.invalidEmail": "Адрес выглядит неправильно.",
  "auth.later": "Не сейчас",
  "auth.guestNotice": "Ты занимаешься как гость. Прогресс только на этом устройстве.",
  "auth.signedInAs": "Вошёл как {name}",
  "auth.merged": "{count} попыток с этого устройства добавлены в аккаунт.",
  "auth.privacy":
    "Мы храним имя, класс, параллель и твои попытки. Больше ничего.",
  "auth.syncing": "Синхронизация",
  "auth.syncFailed": "Синхронизировать не вышло. Твои работы целы на этом устройстве.",

  "exam.question": "Вопрос {n} из {total}",
  "exam.yourAnswer": "Твой ответ",
  "exam.answerPart": "Часть {part}",
  "exam.addAnswerRow": "Добавить строку",
  "exam.submitAnswer": "Проверить",
  "exam.submitPaper": "Завершить и узнать оценку",
  "exam.correct": "Верно",
  "exam.incorrect": "Не в этот раз",
  "exam.partial": "{awarded} из {marks} баллов",
  "exam.markScheme": "Схема оценивания",
  "exam.explain": "Объясни этот шаг",
  "exam.anotherLikeThis": "Ещё такую же",
  "exam.timeLeft": "Осталось",
  "exam.noCalculator": "В этой работе калькулятор запрещён",
  "exam.result.title": "Ты набрал {raw} из {max}",
  "exam.result.grade": "Это {grade}",
  "exam.result.toNext": "До {grade} не хватает {marks} баллов",
  "exam.result.review": "Разобрать ответы",
  "exam.result.again": "Решить ещё работу",
  "exam.confirmLeave": "Выйти из работы? Ответы на этой странице сохранятся.",

  "tutor.title": "Спроси Talap",
  "tutor.placeholder": "Спроси про экзамен…",
  "tutor.send": "Отправить",
  "tutor.thinking": "Читаю схему оценивания",
  "tutor.slow": "Всё ещё думаю — этот вопрос дольше обычного.",
  "tutor.failed": "Репетитор не ответил. Вот официальная схема оценивания.",
  "tutor.offline":
    "Репетитор сейчас недоступен, но схема оценивания и таблицы границ ниже — настоящие.",
  "tutor.langNote": "Ответ придёт на том языке, на котором ты спросил.",

  "dash.title": "Твой прогресс",
  "dash.streak": "Дней подряд",
  "dash.attempts": "Работ решено",
  "dash.projection": "Прогноз оценки",
  "dash.mastery": "Освоение по темам",
  "dash.weakest": "Слабые темы",
  "dash.trend": "Динамика оценок",
  "dash.history": "История",
  "dash.empty.title": "Здесь пока пусто",
  "dash.empty.body": "Реши одну работу — и страница заполнится.",
  "dash.empty.cta": "Выбрать работу",

  "error.generic": "Что-то пошло не так.",
  "error.offline": "Ты офлайн. Ответы сохранены на этом устройстве.",
  "error.notFound": "Такую работу мы не нашли.",
};

const kk: Dict = {
  "common.back": "Артқа",
  "common.next": "Келесі",
  "common.previous": "Алдыңғы",
  "common.close": "Жабу",
  "common.cancel": "Бас тарту",
  "common.save": "Сақтау",
  "common.retry": "Қайта көру",
  "common.loading": "Жүктелуде",
  "common.marks": "балл",
  "common.minutes": "мин",
  "common.questions": "сұрақ",
  "common.of": "ішінен",
  "common.grade": "Сынып",
  "common.subject": "Пән",
  "common.optional": "міндетті емес",
  "common.soon": "Жақында",

  "nav.library": "Сынақ жұмыстары",
  "nav.dashboard": "Прогресс",
  "nav.start": "Сынақты бастау",
  "nav.menu": "Мәзір",
  "nav.language": "Тіл",
  "nav.signIn": "Кіру",
  "nav.signOut": "Шығу",
  "nav.account": "Аккаунт",

  "landing.eyebrow": "МЭСК · NIS · Cambridge",
  "landing.title.a": "МЭСК-ті тапсыр",
  "landing.title.b": "шаршамай",
  "landing.sub":
    "Сынақ жұмыстары нағыз емтихан жұмыстарынан алынған, нағыз шекара кестесі бойынша бағаланады, ал репетитор нақ сен балл жоғалтқан қадамды түсіндіреді.",
  "landing.builtFor":
    "Назарбаев Зияткерлік мектептерінде Cambridge International Examination тапсыратындарға арналған. 10, 11 және 12 сыныптар.",
  "landing.cta.primary": "Сынақ жұмысын шешу",
  "landing.cta.secondary": "Прогресті көру",
  "landing.noAccount": "Бірінші жұмысқа аккаунт қажет емес.",
  "landing.ladder.title": "Баға шкаласы",
  "landing.ladder.hint": "Тарт · меңзе · бас",
  "landing.ladder.scale": "A*-дан U-ға дейін",
  "landing.does.title": "Сайт нақты не істейді",
  "landing.does.eyebrow": "Бес нәрсе, дұрыс жасалған",
  "landing.architecture.title": "Үш жыл — үш түрлі емтихан",
  "landing.architecture.eyebrow": "Емтихан құрылымы",
  "landing.boundaries.title": "Біз бағалайтын шекара кестесі",
  "landing.boundaries.eyebrow": "Әр бағаға ең төменгі балл",
  "landing.boundaries.subjectLevel": "Пән бойынша",
  "landing.boundaries.byComponent": "Компонент бойынша",
  "landing.boundaries.note":
    "Сызықша — жарияланған кестеде бұл жолақтың жоқтығын білдіреді. A* барлық сыныпта пән деңгейінде қойылады, бірақ компонент кестелерінде A* тек 12 сыныпта бар.",
  "landing.tutor.title": "Сен сұраған тілде жауап береді",
  "landing.tutor.eyebrow": "Қазақша · Русский · English",
  "landing.final.title": "Бір жұмыстан баста",
  "landing.final.sub": "Бағаңды тапсырған бойда көресің.",

  "library.title": "Бізде бар барлық жұмыс",
  "library.hint": "Картаны бас · көрсеткі пернелер жұмыс істейді",
  "library.filter.all": "Барлық пән",
  "library.filter.year": "Сынып",
  "library.sit": "Осы жұмысты шешу",
  "library.bringToFront": "Алдыға шығару",
  "library.pastPaper": "Өткен емтихан",
  "library.practice": "Жаттығу",
  "library.calculator": "Калькулятормен",
  "library.noCalculator": "Калькуляторсыз",
  "library.gradedOn": "{component} бойынша бағаланады / {max}",
  "library.empty.title": "Сенің сыныбыңа жұмыс әзірге жоқ",
  "library.empty.body":
    "{year} сыныпқа арналған жұмыс әзірге жоқ. Басқа сыныптың жұмысын ашып жаттығуға болады — баға сол жұмыс есептелетін кесте бойынша қойылады.",
  "library.empty.browseAll": "Барлық жұмысты көрсету",

  "profile.title": "Жұмыстарыңды баптап ал",
  "profile.sub":
    "Үш жауап сенің қай емтихан тапсыратыныңды шешеді. Басқа ештеңе сұрамаймыз.",
  "profile.name": "Аты",
  "profile.namePlaceholder": "Саған қалай жүгінейік?",
  "profile.nameHint": "Тек аты. Тегіңді де, мектебіңді де сұрамаймыз.",
  "profile.year": "Нешінші сыныпсың?",
  "profile.parallel": "Параллелің қандай?",
  "profile.parallel.kazakh": "Қазақ",
  "profile.parallel.russian": "Орыс",
  "profile.parallelHint":
    "Параллель қай тіл Я1, қай тіл Я2 екенін шешеді — демек, қай тілдік жұмыстарды тапсыратыныңды да.",
  "profile.profileSubjects": "Бейіндік пәндер",
  "profile.profileSubjectsOne": "Бір бейіндік пән таңда",
  "profile.profileSubjectsTwo": "Екі бейіндік пән таңда",
  "profile.profileSubjectsNone": "11 сыныпта бейіндік пән жоқ.",
  "profile.target": "Мақсатты баға",
  "profile.submit": "Сақтап, жұмыстарды ашу",
  "profile.edit": "Баптауды өзгерту",

  "auth.title": "Прогресіңді сақта",
  "auth.sub":
    "Талпыныстарың осы құрылғыда сақталып тұр. Кірсең — телефоныңа көшеді және браузерді тазаласаң да жоғалмайды.",
  "auth.google": "Google арқылы жалғастыру",
  "auth.emailLabel": "Немесе поштамен",
  "auth.emailPlaceholder": "you@example.com",
  "auth.sendLink": "Кіру сілтемесін жіберу",
  "auth.linkSent": "Поштаңды тексер — кіру сілтемесі {email} мекенжайына жіберілді.",
  "auth.linkError": "Жіберілмеді. Мекенжайды тексеріп, қайта көр.",
  "auth.invalidEmail": "Пошта мекенжайы дұрыс емес сияқты.",
  "auth.later": "Қазір емес",
  "auth.guestNotice": "Сен қонақ ретінде жұмыс істеп жатырсың. Прогресс тек осы құрылғыда.",
  "auth.signedInAs": "{name} ретінде кірдің",
  "auth.merged": "Осы құрылғыдағы {count} талпыныс аккаунтқа қосылды.",
  "auth.privacy":
    "Біз сенің атыңды, сыныбыңды, параллеліңді және талпыныстарыңды сақтаймыз. Басқа ештеңе емес.",
  "auth.syncing": "Синхрондау",
  "auth.syncFailed": "Синхрондау болмады. Жұмыстарың осы құрылғыда аман.",

  "exam.question": "{total} сұрақтың {n}-шісі",
  "exam.yourAnswer": "Сенің жауабың",
  "exam.answerPart": "{part} бөлігі",
  "exam.addAnswerRow": "Тағы жол қосу",
  "exam.submitAnswer": "Тексеру",
  "exam.submitPaper": "Аяқтап, бағаны көру",
  "exam.correct": "Дұрыс",
  "exam.incorrect": "Бұл жолы емес",
  "exam.partial": "{marks} балдың {awarded}-і",
  "exam.markScheme": "Бағалау схемасы",
  "exam.explain": "Осы қадамды түсіндір",
  "exam.anotherLikeThis": "Тағы осындай",
  "exam.timeLeft": "Қалды",
  "exam.noCalculator": "Бұл жұмыста калькулятор рұқсат етілмейді",
  "exam.result.title": "Сен {max} балдың {raw}-ін жинадың",
  "exam.result.grade": "Бұл — {grade}",
  "exam.result.toNext": "{grade} үшін {marks} балл жетпейді",
  "exam.result.review": "Жауаптарды талдау",
  "exam.result.again": "Тағы жұмыс шешу",
  "exam.confirmLeave": "Жұмыстан шығасың ба? Бұл беттегі жауаптар сақталады.",

  "tutor.title": "Talap-тан сұра",
  "tutor.placeholder": "Емтихан туралы сұра…",
  "tutor.send": "Жіберу",
  "tutor.thinking": "Бағалау схемасын оқып жатырмын",
  "tutor.slow": "Әлі ойланып жатырмын — бұл сұрақ әдеттегіден ұзақ.",
  "tutor.failed": "Репетитор жауап бермеді. Мінеки, ресми бағалау схемасы.",
  "tutor.offline":
    "Репетитор қазір қолжетімсіз, бірақ төмендегі бағалау схемасы мен шекара кестелері нағыз.",
  "tutor.langNote": "Жауап сен сұраған тілде келеді.",

  "dash.title": "Сенің прогресің",
  "dash.streak": "Қатарынан күн",
  "dash.attempts": "Шешілген жұмыс",
  "dash.projection": "Болжамды баға",
  "dash.mastery": "Тақырып бойынша меңгеру",
  "dash.weakest": "Әлсіз тақырыптар",
  "dash.trend": "Баға динамикасы",
  "dash.history": "Тарих",
  "dash.empty.title": "Мұнда әзірге бос",
  "dash.empty.body": "Бір жұмыс шеш — бет толады.",
  "dash.empty.cta": "Жұмыс таңдау",

  "error.generic": "Бірдеңе дұрыс болмады.",
  "error.offline": "Сен офлайнсың. Жауаптар осы құрылғыда сақталды.",
  "error.notFound": "Ондай жұмысты таппадық.",
};

export const DICTIONARIES: Record<Locale, Dict> = { kk, ru, en };

/**
 * English is the fallback chain terminus: every key exists in `en`, so a
 * missing Kazakh or Russian string degrades to English rather than to a raw
 * key on screen. `npm run check` can assert key parity across all three.
 */
export const FALLBACK_LOCALE: Locale = "en";
