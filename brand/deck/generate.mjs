/**
 * Talap pitch deck — 8 slides, 1920×1080, rendered to PNG and assembled to PDF.
 *
 *   node brand/deck/generate.mjs
 *
 * Rebuilt from the Canva version after investor feedback: "глаз режет и не
 * хочется читать", the boundary table on slide 02 unreadable, raw app
 * screenshots pasted in, and the T square eating the top-left of every slide.
 * The rules that answer that feedback, and that any edit has to keep:
 *
 *   1. Sentence case, never ALL CAPS with tracking. Caps + letterspacing in
 *      Cyrillic at body size is what "режет глаз" actually means.
 *   2. Left-aligned. Centred paragraphs give the eye no edge to return to.
 *   3. One idea per slide, under ~40 words. What is spoken is not on the slide.
 *   4. Yellow selects, it never decorates — one accent per slide, on the thing
 *      that matters. No third colour (the orange page pills are gone).
 *   5. No screenshots. A screenshot at projector distance is a grey rectangle;
 *      the number or the claim inside it is what the room can actually read.
 *   6. The mark appears twice — cover and close — not on all eight slides.
 *
 * Every figure is quoted, not invented. The boundary numbers on slide 02 come
 * from data/grade-boundaries.ts (Grade 10 Mathematics Component 1: C = 36–45
 * of 80; Chemistry Component 1: C = 44–51 of 90). See README.md for the two
 * traction figures the author still has to confirm.
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
fs.mkdirSync(CACHE, { recursive: true });

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

const QR = fs.readFileSync(path.join(OUT, "qr-talap-online.png")).toString("base64");

/* ---- brand mark, geometry lifted verbatim from components/BrandMark.tsx ---- */
const GLYPH = {
  T: "M66 1202V1490H1320V1202H869V0H517V1202Z",
  A: "M47 0 544 1490H1017L1529 0H1133L926 651Q876 814 829.5 997.5Q783 1181 736 1378H815Q770 1180 728.0 996.5Q686 813 639 651L439 0ZM385 317V587H1192V317Z",
  L: "M116 0V1490H469V288H1092V0Z",
  P: "M116 0V1490H726Q894 1490 1016.0 1425.0Q1138 1360 1203.5 1244.0Q1269 1128 1269 975Q1269 821 1202.0 707.0Q1135 593 1011.0 529.0Q887 465 716 465H338V744H652Q735 744 791.0 773.0Q847 802 875.0 854.0Q903 906 903 975Q903 1045 875.0 1096.5Q847 1148 790.5 1176.0Q734 1204 651 1204H469V0Z",
};
const WORD = [["T", 0], ["A", 1119.08], ["L", 2613.16], ["A", 3689.24], ["P", 5183.32]];

const mark = (h = 54) => `
<svg height="${h}" width="${(h * 606.47) / 130}" viewBox="0 0 606.47 130" style="display:block">
  <g transform="scale(1.3)">
    <rect x="0" y="0" width="100" height="100" fill="#fff824"/>
    <g transform="translate(23.954,76.5) scale(0.037584,-0.037584)" fill="#151515"><path d="${GLYPH.T}"/></g>
  </g>
  <g transform="translate(169,115) scale(0.067114,-0.067114)" fill="#f2f2f0">
    ${WORD.map(([g, x]) => `<path d="${GLYPH[g]}" transform="translate(${x},0)"/>`).join("")}
  </g>
</svg>`;

/* ------------------------------------------------------------------ slides */

const N = 8;
const slide = (n, body, cls = "") =>
  `<section class="slide ${cls}" id="s${n}">${body}
     <span class="pn">${String(n).padStart(2, "0")} / ${String(N).padStart(2, "0")}</span>
   </section>`;

const slides = [
  /* 01 — cover ----------------------------------------------------------- */
  slide(1, `
    <div class="cover-top">
      ${mark(50)}
      <div class="cover-r">
        <img class="qr" src="data:image/png;base64,${QR}" alt="">
        <span class="qr-cap">Открыть продукт</span>
      </div>
    </div>
    <div class="cover-mid">
      <h1 class="wordmark">Talap</h1>
      <p class="tagline">Тренажёр МЭСК с настоящими работами NIS и ИИ&#8209;экзаменатором,
        который проверяет открытые ответы по официальной схеме оценивания.</p>
    </div>
    <div class="cover-foot">
      <span><span class="site">talap.online</span><span class="dot">·</span>NIS Наурызбай</span>
      <span>Кыдырбек Козыкорпеш · Алматы, Казахстан</span>
    </div>`, "cover-slide"),

  /* 02 — problem --------------------------------------------------------- */
  slide(2, `
    <span class="eyebrow">Проблема</span>
    <h2>Ученик не знает свою оценку,<br>пока не сдаст</h2>
    <p class="lede">Балл — это не процент. Граница оценки своя у каждого предмета
      и каждого компонента.</p>
    <div class="duo">
      <div class="panel">
        <span class="panel-cap">Математика · Компонент 1</span>
        <div class="fig"><b>36</b><span>из 80</span></div>
        <div class="panel-foot"><span class="grade">= C</span><span class="pct">45 %</span></div>
      </div>
      <div class="panel">
        <span class="panel-cap">Химия · Компонент 1</span>
        <div class="fig"><b>44</b><span>из 90</span></div>
        <div class="panel-foot"><span class="grade">= C</span><span class="pct">49 %</span></div>
      </div>
      <p class="kicker">Одна и та же оценка.<br>Разный процент.<br><em>Ученик считает
        в процентах и промахивается мимо своей реальной оценки.</em></p>
    </div>`),

  /* 03 — what it does ---------------------------------------------------- */
  slide(3, `
    <span class="eyebrow">Решение</span>
    <h2>Talap отвечает на один вопрос:<br><em>какая у тебя оценка прямо сейчас</em></h2>
    <div class="tri">
      <div class="col">
        <span class="num">01</span>
        <b>Настоящие работы NIS</b>
        <p>Расшифрованы по вопросам — вместе со схемой оценивания, по которой
          ставят баллы.</p>
      </div>
      <div class="col">
        <span class="num">02</span>
        <b>Официальная таблица границ</b>
        <p>На выходе оценка от U до A*, а не процент правильных ответов.</p>
      </div>
      <div class="col">
        <span class="num">03</span>
        <b>ИИ&#8209;экзаменатор</b>
        <p>Проверяет открытый ответ по схеме и называет, какой пункт ты
          не написал.</p>
      </div>
    </div>`),

  /* 04 — how it works ---------------------------------------------------- */
  slide(4, `
    <span class="eyebrow">Как это работает</span>
    <h2>Четыре шага</h2>
    <ol class="steps">
      <li><span class="sn">1</span><b>Выбираешь работу</b><span>11 полных пробников, 7 предметов</span></li>
      <li><span class="sn">2</span><b>Решаешь на время</b><span>90 минут, как на настоящем экзамене</span></li>
      <li><span class="sn">3</span><b>ИИ проверяет</b><span>Закрытые вопросы сразу, открытые — по схеме оценивания</span></li>
      <li><span class="sn">4</span><b>Получаешь оценку</b><span>По официальной таблице, плюс разбор ошибок по темам</span></li>
    </ol>`),

  /* 05 — competition ----------------------------------------------------- */
  slide(5, `
    <span class="eyebrow">Альтернативы</span>
    <h2>Почему не ChatGPT и не репетитор</h2>
    <table class="cmp">
      <thead><tr><th>Вариант</th><th>Чего не хватает</th></tr></thead>
      <tbody>
        <tr><td>ChatGPT</td><td>Не знает границ МЭСК и не проверяет по схеме NIS</td></tr>
        <tr><td>Репетитор</td><td>Дорого, не каждый день, нет разбора между занятиями</td></tr>
        <tr><td>Телеграм-каналы</td><td>Фото заданий без схемы оценивания</td></tr>
        <tr class="us"><td>Talap</td><td>Настоящая работа + схема + официальная оценка</td></tr>
      </tbody>
    </table>`),

  /* 06 — traction -------------------------------------------------------- */
  slide(6, `
    <span class="eyebrow">Что уже сделано</span>
    <h2>Продукт работает.<br><em>Не идея на бумаге.</em></h2>
    <div class="kpis">
      <div class="kpi"><b>11</b><span>полных работ</span></div>
      <div class="kpi"><b>163</b><span>вопроса</span></div>
      <div class="kpi"><b>552</b><span>балла</span></div>
    </div>
    <ul class="facts">
      <li>7 предметов: математика, физика, химия, биология, информатика, история, языки</li>
      <li>Сайт открыт — <span class="hl">talap.online</span></li>
      <li>Работает: ИИ-проверка открытых ответов, дашборд, калькулятор для компонента 2</li>
    </ul>`),

  /* 07 — business model -------------------------------------------------- */
  slide(7, `
    <span class="eyebrow">Модель</span>
    <h2>Кто платит и сколько их</h2>
    <div class="plans">
      <div class="panel">
        <span class="panel-cap">Бесплатно</span>
        <ul class="plan-list">
          <li>Часть работ</li>
          <li>Автопроверка закрытых вопросов</li>
        </ul>
      </div>
      <div class="panel accent">
        <span class="panel-cap">Подписка</span>
        <ul class="plan-list">
          <li>Все работы, все предметы</li>
          <li>ИИ-проверка открытых ответов по схеме</li>
          <li>Дашборд и разбор ошибок по темам</li>
        </ul>
      </div>
    </div>
    <div class="who-band">
      <p><span class="who-k">Кто платит</span>Ученики NIS, 10–12 класс</p>
      <p><span class="who-k">Сейчас</span>NIS Наурызбай, Алматы</p>
      <p><span class="who-k">Дальше</span>Другие филиалы НИШ Казахстана</p>
    </div>`),

  /* 08 — ask ------------------------------------------------------------- */
  slide(8, `
    <span class="eyebrow">Что дальше</span>
    <h2>Ближайшие три шага</h2>
    <ol class="steps tight">
      <li><span class="sn">1</span><b>Пилот на 20–30 учениках</b><span>И сбор обратной связи</span></li>
      <li><span class="sn">2</span><b>Официальное разрешение</b><span>На использование материалов прошлых работ</span></li>
      <li><span class="sn">3</span><b>Остальные предметы</b><span>Загрузить и запустить подписку</span></li>
    </ol>
    <div class="close">
      <div class="close-l">${mark(44)}<span class="close-site">talap.online</span></div>
      <div class="contacts">
        <p><span>Телеграм</span>@curseisbroken</p>
        <p><span>Почта</span>koutlikefrvr4@gmail.com</p>
        <p><span>Телефон</span>+7 747 426 5409</p>
      </div>
    </div>`),
];

/* --------------------------------------------------------------------- css */

const css = `
${WEIGHTS.map(face).join("\n")}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#555;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}

:root{
  --ink:#151515;        /* ground */
  --paper:#f2f2f0;      /* text on ground */
  --mute:#8f8f8a;       /* labels, secondary */
  --line:#333330;       /* rules */
  --hl:#fff824;         /* the one chromatic voice — it selects, never decorates */
}

.slide{position:relative;width:1920px;height:1080px;overflow:hidden;
  background:var(--ink);color:var(--paper);padding:96px 120px 84px;
  display:flex;flex-direction:column}
.slide+.slide{margin-top:28px}

/* the cover carries its own credit line in that corner */
.cover-slide .pn{display:none}
.pn{position:absolute;right:120px;bottom:60px;font-size:20px;font-weight:600;
  letter-spacing:.16em;color:var(--mute)}

/* label / heading / body — three registers, nothing in between */
.eyebrow{display:inline-block;align-self:flex-start;font-size:20px;font-weight:700;
  letter-spacing:.2em;text-transform:uppercase;color:var(--ink);background:var(--hl);
  padding:9px 16px;margin-bottom:44px}
h2{font-size:74px;line-height:1.08;font-weight:800;letter-spacing:-.03em;max-width:24ch}
h2 em{font-style:normal;color:var(--hl)}
.lede{margin-top:30px;font-size:31px;line-height:1.45;font-weight:400;
  color:var(--paper);max-width:52ch}

/* 01 — cover: identity / thesis / credits, filling the frame top to bottom */
.cover-top{display:flex;align-items:flex-start;justify-content:space-between}
.cover-mid{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 0}
.wordmark{font-size:186px;line-height:.9;font-weight:900;letter-spacing:-.055em}
.tagline{margin-top:44px;font-size:36px;line-height:1.4;font-weight:400;max-width:33ch}
.cover-r{display:flex;flex-direction:column;align-items:center;gap:18px}
.qr{width:250px;height:250px;display:block;background:#fff;padding:14px}
.qr-cap{font-size:19px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--mute)}
.cover-foot{padding-top:32px;border-top:2px solid var(--line);
  display:flex;justify-content:space-between;gap:40px;
  font-size:25px;font-weight:500;color:var(--mute)}
.cover-foot .site{color:var(--hl);font-weight:700}
.cover-foot .dot{color:var(--line);margin:0 14px}

/* 02 / 07 — two panels and a kicker */
.duo{margin-top:64px;flex:1;display:grid;grid-template-columns:1fr 1fr 1.06fr;gap:36px;align-items:start}
.panel{border:2px solid var(--line);padding:38px 36px 34px}
.panel.accent{border-color:var(--hl)}
.panel-cap{display:block;font-size:21px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:var(--mute)}
.fig{margin-top:30px;display:flex;align-items:baseline;gap:16px}
.fig b{font-size:128px;line-height:.86;font-weight:900;letter-spacing:-.05em;color:var(--hl)}
.fig span{font-size:32px;font-weight:600;color:var(--mute)}
.panel-foot{margin-top:34px;padding-top:24px;border-top:2px solid var(--line);
  display:flex;align-items:baseline;justify-content:space-between}
.grade{font-size:40px;font-weight:800}
.pct{font-size:32px;font-weight:700;color:var(--mute);font-variant-numeric:tabular-nums}
.kicker{font-size:31px;line-height:1.42;font-weight:600;padding-left:36px;
  border-left:4px solid var(--hl)}
.kicker em{display:block;margin-top:22px;font-style:normal;font-weight:400;color:var(--mute)}

/* 03 — three columns */
.tri{margin-top:64px;flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:56px;align-content:start}
.col{padding-top:28px;border-top:3px solid var(--hl)}
.col .num{display:block;font-size:21px;font-weight:700;letter-spacing:.16em;color:var(--mute)}
.col b{display:block;margin-top:22px;font-size:38px;line-height:1.15;font-weight:800;letter-spacing:-.02em}
.col p{margin-top:20px;font-size:27px;line-height:1.46;font-weight:400;color:#c9c9c4}

/* 04 / 08 — numbered steps */
.steps{list-style:none;margin-top:58px;display:flex;flex-direction:column;gap:0}
/* the ask slide's labels run longer than the how-it-works ones and would wrap
   into two lines against a 460px column */
.steps.tight li{grid-template-columns:96px 560px 1fr}
.steps li{display:grid;grid-template-columns:96px 460px 1fr;align-items:baseline;gap:32px;
  padding:34px 0;border-bottom:2px solid var(--line)}
.steps li:first-child{border-top:2px solid var(--line)}
.sn{font-size:44px;font-weight:900;color:var(--hl);letter-spacing:-.03em}
.steps b{font-size:38px;font-weight:800;letter-spacing:-.02em}
.steps li>span:last-child{font-size:29px;font-weight:400;line-height:1.4;color:#c9c9c4}

/* 05 — comparison */
.cmp{margin-top:66px;width:100%;border-collapse:collapse}
.cmp th{text-align:left;padding:0 0 22px;font-size:21px;font-weight:700;
  letter-spacing:.16em;text-transform:uppercase;color:var(--mute);border-bottom:2px solid var(--line)}
.cmp td{padding:34px 0;font-size:34px;font-weight:500;border-bottom:2px solid var(--line);
  vertical-align:baseline}
.cmp td:first-child{width:440px;font-weight:800}
.cmp tr.us td{color:var(--hl);border-bottom-color:var(--hl)}
.cmp tr.us td:first-child{font-weight:900}

/* 06 — traction */
.kpis{margin-top:70px;display:flex;gap:96px}
.kpi b{display:block;font-size:132px;line-height:.86;font-weight:900;letter-spacing:-.05em;color:var(--hl)}
.kpi span{display:block;margin-top:16px;font-size:26px;font-weight:600;
  letter-spacing:.1em;text-transform:uppercase;color:var(--mute)}
.facts{list-style:none;margin-top:74px;display:flex;flex-direction:column;gap:18px;
  padding-top:44px;border-top:2px solid var(--line)}
.facts li{font-size:29px;line-height:1.4;font-weight:400;color:#c9c9c4;padding-left:34px;position:relative}
.facts li::before{content:"";position:absolute;left:0;top:.6em;width:14px;height:3px;background:var(--hl)}
.hl{color:var(--hl);font-weight:600}

/* 07 — plans */
.plans{margin-top:64px;display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:stretch}
.plans .panel{display:flex;flex-direction:column;min-height:400px}
.plan-list{list-style:none;margin-top:34px;display:flex;flex-direction:column;gap:22px}
.plan-list li{font-size:30px;line-height:1.35;font-weight:500;color:#c9c9c4;
  padding-left:34px;position:relative}
.plan-list li::before{content:"";position:absolute;left:0;top:.58em;width:14px;height:3px;background:var(--hl)}
.panel.accent .plan-list li{color:var(--paper)}
.who-band{margin-top:auto;padding-top:44px;padding-bottom:36px;border-top:2px solid var(--line);
  display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.who-band p{font-size:30px;line-height:1.32;font-weight:600}
.who-k{display:block;font-size:20px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:var(--mute);margin-bottom:14px}

/* 08 — close */
.close{margin-top:auto;padding-top:44px;padding-bottom:44px;border-top:2px solid var(--line);
  display:flex;align-items:flex-end;justify-content:space-between;gap:60px}
.close-l{display:flex;flex-direction:column;gap:20px}
.close-site{font-size:29px;font-weight:700;color:var(--hl)}
.contacts{display:flex;gap:72px}
.contacts p{font-size:26px;font-weight:600}

/* One slide per page, no gaps, no white gutters. */
@page{size:1920px 1080px;margin:0}
@media print{
  body{background:var(--ink)}
  .slide+.slide{margin-top:0}
  .slide{break-after:page}
  .slide:last-child{break-after:auto}
}
.contacts span{display:block;font-size:19px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:var(--mute);margin-bottom:7px}
`;

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.join("\n")}</body></html>`;
const file = path.join(CACHE, "deck.html");
fs.writeFileSync(file, html);

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto("file://" + file, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// Overflow is silent in a screenshot — a slide that runs past 1080px just gets
// cropped — so fail loudly instead of shipping a clipped slide.
const overflow = await page.evaluate(() =>
  [...document.querySelectorAll(".slide")]
    .map((s, i) => ({ n: i + 1, over: s.scrollHeight - s.clientHeight }))
    .filter((r) => r.over > 1));
if (overflow.length) {
  console.error("SLIDES OVERFLOW:", overflow.map((r) => `s${r.n} +${r.over}px`).join(", "));
}

const pngs = [];
for (let i = 1; i <= slides.length; i++) {
  const out = path.join(OUT, `talap-deck-${String(i).padStart(2, "0")}.png`);
  await (await page.$(`#s${i}`)).screenshot({ path: out });
  pngs.push(out);
}
// The PDF is what actually gets sent, so print it from the same markup rather
// than stitching the PNGs — text stays selectable and the file stays small.
const pdf = path.join(OUT, "Talap-pitch-deck.pdf");
await page.pdf({ path: pdf, width: "1920px", height: "1080px", printBackground: true });

await browser.close();
console.log(`rendered ${pngs.length} slides + ${path.basename(pdf)} → ${OUT}`);
