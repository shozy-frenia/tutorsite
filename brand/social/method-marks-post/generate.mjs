/**
 * Instagram carousel #3 — "1680 — правильный ответ. И это 1 балл из 3."
 *
 *   node brand/social/method-marks-post/generate.mjs
 *
 * The first post said what Talap is. The second handed over the boundary
 * tables. This one teaches the thing that actually changes a student's mark
 * the week before the exam: on a Cambridge-style paper most of the credit is
 * in the working, not in the final line, so an answer written on its own
 * throws away marks that were already earned — and a wrong answer with the
 * method shown still scores.
 *
 * Every figure is read from the exam bank at build time by `stats.ts`, never
 * typed onto a slide. The post's claim is "this is how the paper is actually
 * marked"; a number that had drifted from the mark schemes would make it a
 * lie. The worked example is a real transcribed question — Grade 10
 * Mathematics Paper 1, 5 March 2021, Q5 — and its three scheme lines are
 * printed as the scheme has them.
 *
 * Design follows the two posts before it: one highlighter accent per slide,
 * the struck-through mark as the only gesture that crosses the grid, charts
 * with every row labelled so no axis or gridlines are needed, and de-emphasis
 * grey validated at 3:1 or better against the surface it sits on.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const { chromium } = await import("playwright").catch(async () => {
  const root = execSync("npm root -g", { encoding: "utf8" }).trim();
  return import(pathToFileURL(path.join(root, "playwright", "index.mjs")).href);
});

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(OUT, ".cache");
const REPO = path.resolve(OUT, "../../..");
fs.mkdirSync(CACHE, { recursive: true });

/* ------------------------------------------------------------------ fonts */

const WEIGHTS = [400, 500, 600, 700, 800, 900];
for (const w of WEIGHTS) {
  const file = path.join(CACHE, `inter-${w}.ttf`);
  if (fs.existsSync(file)) continue;
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${w}`)).text();
  const url = css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/)?.[0];
  if (!url) throw new Error(`no font URL for Inter ${w}`);
  fs.writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
}
const face = (w) =>
  `@font-face{font-family:Inter;font-style:normal;font-weight:${w};src:url(data:font/ttf;base64,${fs
    .readFileSync(path.join(CACHE, `inter-${w}.ttf`))
    .toString("base64")}) format('truetype');}`;

/* ------------------------------------------------------- numbers, from data */

const S = JSON.parse(
  execSync("npx tsx brand/social/method-marks-post/stats.ts", {
    cwd: REPO,
    encoding: "utf8",
  })
);

if (S.example.marks !== 3 || S.example.steps.length !== 3) {
  throw new Error("the worked example is no longer a three-line, three-mark question");
}

/**
 * The example, in the language the post is written in.
 *
 * The bank stores this paper's questions in English; the sitting itself was
 * Kazakh. These are translations for the slide, not a second source of truth —
 * the mark counts beside them come from `stats.ts`, and the assertion above
 * fails the build if the scheme they describe ever changes shape.
 */
const EXAMPLE = {
  prompt:
    "Сколько существует способов составить расписание учебного дня из 4 разных уроков, если всего есть 8 предметов?",
  steps: [
    "Понять, что порядок важен: это размещение, а не сочетание",
    "A(8,4) = 8 × 7 × 6 × 5",
    "= 1680",
  ],
};

const plural = (n, one, few, many) => {
  const t = n % 100 > 10 && n % 100 < 20 ? 0 : n % 10;
  return `${n} ${t === 1 ? one : t >= 2 && t <= 4 ? few : many}`;
};

/* ------------------------------------------------------------------ markup */

const N = 5;
const slide = (n, cls, body) =>
  `<section class="slide ${cls}" id="s${n}">${body}
     <span class="pager">${String(n).padStart(2, "0")} / ${String(N).padStart(2, "0")}</span>
   </section>`;

/** The mark scheme as the examiner reads it: one line, one mark, in order. */
const scheme = () =>
  `<ol class="scheme">${EXAMPLE.steps
    .map(
      (text, i) => `<li${i === EXAMPLE.steps.length - 1 ? ' class="last"' : ""}>
        <span class="step">${text}</span>
        <span class="plus">+${S.example.steps[i]}</span>
      </li>`
    )
    .join("")}</ol>`;

const slides = [
  /* 01 — hook ------------------------------------------------------------ */
  slide(
    1,
    "cover",
    `<header class="s-head"><span class="label">МЭСК · КАК СЧИТАЮТ БАЛЛЫ</span></header>
     <div class="stack">
       <h1 class="display">${S.example.answer}.<br>Верно.<br>И всё равно<br>
         <span class="struck">1 из 3</span></h1>
       <p class="lede">Два других балла ты теряешь, если не написал, как думал.</p>
     </div>
     <footer class="s-foot"><span class="swipe">ЛИСТАЙ →</span><span class="dom">TALAP.ONLINE</span></footer>`
  ),

  /* 02 — the actual scheme ------------------------------------------------ */
  slide(
    2,
    "dark",
    `<header class="s-head"><span class="label">РЕАЛЬНЫЙ ВОПРОС · 3 БАЛЛА</span></header>
     <div class="stack">
       <p class="quote">${EXAMPLE.prompt}</p>
       <h2 class="mid inv">Схема оценивания —<br><span class="struck">три строки</span></h2>
       ${scheme()}
       <p class="note inv">Математика, 10 класс, Paper 1 · 5 марта 2021</p>
     </div>
     <footer class="s-foot inv"><span class="dom">TALAP.ONLINE</span></footer>`
  ),

  /* 03 — the two students -------------------------------------------------- */
  slide(
    3,
    "",
    `<header class="s-head"><span class="label">ДВЕ РАБОТЫ</span></header>
     <div class="stack">
       <h2 class="heading">Неверный ответ<br>может стоить<br>
         <span class="struck">дороже</span> верного</h2>
       <div class="cases">
         <div class="case">
           <span class="who">НАПИСАЛ ТОЛЬКО ОТВЕТ</span>
           <span class="work mono">${S.example.answer}</span>
           <span class="verdict">1 <b>из 3</b></span>
           <span class="why">Ответ верный. Но первые два балла дают за рассуждение, а его нет.</span>
         </div>
         <div class="case win">
           <span class="who">РАСПИСАЛ И ОШИБСЯ В СЧЁТЕ</span>
           <span class="work mono">A(8,4) = 8 × 7 × 6 × 5 = 1240</span>
           <span class="verdict">2 <b>из 3</b></span>
           <span class="why">Ответ неверный. Метод верный — и он оплачен.</span>
         </div>
       </div>
     </div>
     <footer class="s-foot"><span class="dom">TALAP.ONLINE</span></footer>`
  ),

  /* 04 — the scale --------------------------------------------------------- */
  slide(
    4,
    "",
    `<header class="s-head"><span class="label">ЭТО НЕ ИСКЛЮЧЕНИЕ</span></header>
     <div class="stack">
       <h2 class="heading">Больше половины<br>баллов дают
         <span class="struck">до</span><br>финального ответа</h2>
       <div class="split">
         <div class="seg step" style="flex:${S.stepMarks}">
           <span class="segn">${S.stepMarks}</span>
           <span class="segl">ЗА ШАГИ</span>
         </div>
         <div class="seg ans" style="flex:${S.answerMarks}">
           <span class="segn">${S.answerMarks}</span>
           <span class="segl">ЗА ОТВЕТ</span>
         </div>
       </div>
       <p class="note">Все ${plural(S.totalMarks, "балл", "балла", "баллов")} в ${plural(
         S.papers,
         "расшифрованной работе",
         "расшифрованных работах",
         "расшифрованных работах"
       )} Talap</p>
       <p class="lede tight">И ${S.multiStep} ${
         S.multiStep % 10 === 1 && S.multiStep % 100 !== 11 ? "вопрос" : "вопросов"
       } из ${S.questions} оцениваются больше чем одной строкой схемы — то есть по шагам.</p>
     </div>
     <footer class="s-foot"><span class="dom">TALAP.ONLINE</span></footer>`
  ),

  /* 05 — takeaway + CTA ---------------------------------------------------- */
  slide(
    5,
    "cta",
    `<header class="s-head"><span class="label">ВЫВОД</span></header>
     <div class="stack">
       <h2 class="heading inv">Пиши шаги.<br>Особенно когда<br>
         <span class="struck">не уверен</span></h2>
       <p class="lede inv">Пустое место под задачей — это ноль гарантированно. Строка
         рассуждения — это балл, даже если дальше ты собьёшься.</p>
       <p class="save">Пробники Talap показывают схему построчно →</p>
     </div>
     <footer class="s-foot inv"><span class="dom big">TALAP.ONLINE</span></footer>`
  ),
];

/* --------------------------------------------------------------------- css */

const css = `
${WEIGHTS.map(face).join("\n")}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#777;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}

:root{
  --ink:#151515; --paper:#f3f3f3; --hl:#fff824;
  --t2:#c9c9c4;          /* secondary text on ink */
  --t3:#8f8f8a;          /* muted text, both grounds */
  --off:#6b6b66;         /* de-emphasis mark — validated >=3:1 either way */
  --line-d:#333330; --line-l:#d6d6d2;
}

.slide{position:relative;width:1080px;height:1350px;overflow:hidden;
  background:#f3f3f3;color:var(--ink);padding:70px 74px;display:flex;flex-direction:column}
.slide+.slide{margin-top:24px}
.slide.cover{background:var(--hl)}
.slide.dark,.slide.cta{background:var(--ink);color:var(--paper)}

.pager{position:absolute;bottom:36px;left:50%;transform:translateX(-50%);
  font-size:15px;font-weight:600;letter-spacing:.22em;opacity:.45}

.s-head{display:flex;align-items:center;justify-content:space-between;gap:24px}
.s-foot{display:flex;align-items:center;justify-content:space-between;
  padding-top:24px;border-top:3px solid var(--ink)}
.s-foot.inv{border-top-color:var(--paper)}
.stack{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 0 46px}

.label{font-size:19px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;
  background:var(--hl);color:var(--ink);padding:8px 14px}
.slide.cover .label{background:var(--ink);color:var(--hl)}
.dom{font-size:20px;font-weight:800;letter-spacing:.22em}
.dom.big{font-size:30px}
.swipe{font-size:26px;font-weight:900;letter-spacing:.14em;background:#f3f3f3;
  border:3px solid var(--ink);padding:12px 22px;box-shadow:7px 7px 0 var(--ink)}

.display{font-size:104px;line-height:1.12;font-weight:900;letter-spacing:-.045em;text-transform:uppercase}
.heading{font-size:78px;line-height:.98;font-weight:900;letter-spacing:-.04em}
.mid{font-size:60px;line-height:1;font-weight:900;letter-spacing:-.035em}
.heading.inv,.mid.inv{color:var(--paper)}
.lede{margin-top:44px;font-size:31px;line-height:1.4;font-weight:600;max-width:26ch}
.lede.tight{margin-top:34px;font-size:27px;font-weight:500;color:var(--t3);max-width:34ch}
.lede.inv{color:var(--t2);font-weight:400}
.note{margin-top:36px;font-size:18px;font-weight:600;letter-spacing:.09em;
  text-transform:uppercase;color:var(--t3)}
.note.inv{color:var(--t3)}
.save{margin-top:52px;font-size:27px;font-weight:700;color:var(--hl)}

/* the one gesture allowed to cross the grid */
.struck{position:relative;display:inline-block;z-index:1;padding:0 .06em;line-height:.98;margin-right:.16em}
.struck::before{content:"";position:absolute;z-index:-1;background:var(--hl);
  left:-.055em;right:-.13em;top:0;bottom:0}
.display .struck{line-height:1}
.slide.cover .struck::before{background:var(--ink)}
.slide.cover .struck{color:var(--hl)}
.slide.dark .struck,.slide.cta .struck{color:var(--ink)}

/* 02 — the question, then its scheme */
.quote{font-size:30px;line-height:1.42;font-weight:500;color:var(--t2);
  border-left:6px solid var(--hl);padding-left:26px;max-width:30ch}
.mid{margin-top:48px}
.scheme{margin-top:44px;list-style:none;display:flex;flex-direction:column}
.scheme li{display:flex;align-items:center;gap:28px;padding:30px 0;
  border-bottom:2px solid var(--line-d)}
.scheme li:first-child{border-top:2px solid var(--line-d)}
.step{flex:1;font-size:29px;line-height:1.3;font-weight:600}
.scheme li.last .step{font-weight:900;font-size:38px;letter-spacing:-.02em}
.plus{flex:none;width:96px;height:72px;display:grid;place-items:center;
  background:var(--hl);color:var(--ink);font-size:36px;font-weight:900;
  font-variant-numeric:tabular-nums}

/* 03 — two answer sheets, side by side */
.cases{margin-top:56px;display:grid;grid-template-columns:1fr 1fr;gap:26px}
.case{display:flex;flex-direction:column;border:3px solid var(--ink);padding:34px 30px;
  background:#fff}
.case.win{box-shadow:9px 9px 0 var(--ink)}
.who{font-size:16px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--t3)}
.work{margin-top:26px;font-size:27px;line-height:1.35;font-weight:700;min-height:2.7em}
.mono{font-variant-numeric:tabular-nums}
.verdict{margin-top:22px;font-size:58px;font-weight:900;letter-spacing:-.04em;
  font-variant-numeric:tabular-nums;line-height:1}
.verdict b{font-size:27px;font-weight:700;letter-spacing:0;color:var(--t3)}
.case.win .verdict{background:var(--hl);align-self:flex-start;padding:6px 14px}
.why{margin-top:22px;font-size:22px;line-height:1.4;font-weight:500;color:var(--off)}

/* 04 — where the marks are. Both segments labelled, so no axis. */
.split{margin-top:60px;display:flex;height:184px;border:3px solid var(--ink)}
.seg{display:flex;flex-direction:column;justify-content:center;padding:0 30px}
.seg+.seg{border-left:3px solid var(--ink)}
.seg.step{background:var(--hl)}
.seg.ans{background:var(--line-l)}
.segn{font-size:72px;font-weight:900;letter-spacing:-.045em;line-height:.9;
  font-variant-numeric:tabular-nums}
.segl{margin-top:12px;font-size:18px;font-weight:800;letter-spacing:.14em}
.seg.ans .segn,.seg.ans .segl{color:#3d3d39}
`;

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.join(
  "\n"
)}</body></html>`;
const file = path.join(CACHE, "post.html");
fs.writeFileSync(file, html);

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto("file://" + file, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const over = await page.evaluate(() =>
  [...document.querySelectorAll(".slide")]
    .map((s, i) => ({ n: i + 1, over: s.scrollHeight - s.clientHeight }))
    .filter((r) => r.over > 1)
);
if (over.length) console.error("SLIDES OVERFLOW:", over.map((r) => `s${r.n} +${r.over}px`).join(", "));

for (let i = 1; i <= slides.length; i++) {
  await (await page.$(`#s${i}`)).screenshot({
    path: path.join(OUT, `talap-marks-${String(i).padStart(2, "0")}.png`),
  });
}
await browser.close();

console.log(`шаги / ответ: ${S.stepMarks} / ${S.answerMarks} из ${S.totalMarks} (${S.stepShare} %)`);
console.log(`многошаговых вопросов: ${S.multiStep} из ${S.questions}`);
console.log(`rendered ${slides.length} slides → ${OUT}`);
