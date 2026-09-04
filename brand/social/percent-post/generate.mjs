/**
 * Instagram carousel #2 — "46 % — это какая оценка?"
 *
 *   node brand/social/percent-post/generate.mjs
 *
 * A reference post rather than an ad: the official Grade 10 subject-level
 * boundaries, which is the one thing Talap has that a Telegram channel does
 * not. A student saves it; the product claim proves itself on the way.
 *
 * The boundaries are PARSED from data/grade-boundaries.ts at build time, never
 * retyped — a post asserting "we use the official tables" cannot afford a
 * transcription error, and this way it cannot drift when the data changes.
 *
 * Charts follow the dataviz rules: one accent for the marks with the extremes
 * emphasised and the rest in a de-emphasis gray (validated ≥3:1 on this
 * surface), bars capped at 24px with a 4px rounded data-end, no gridlines
 * because every row is labelled, and text in text tokens — never in the data
 * colour.
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

/* ------------------------------------------------- boundaries, from the data */

/** Display names — the official nameRu runs too long for a phone-width row. */
const SHORT = {
  "Математика": "Математика",
  "История Казахстана": "История Казахстана",
  "Казахский язык и литература Я1": "Қазақ тілі Я1",
  "Казахский язык и литература Я2": "Қазақ тілі Я2",
  "Русский язык и литература Я1": "Русский Я1",
  "Русский язык и литература Я2": "Русский Я2",
  "Физика": "Физика",
  "Биология": "Биология",
  "Химия": "Химия",
  "Информатика": "Информатика",
};

const src = fs.readFileSync(path.join(REPO, "data/grade-boundaries.ts"), "utf8");
const g10 = src.slice(src.indexOf("const GRADE_10"), src.indexOf("const GRADE_11"));

const SUBJECTS = [];
const block = /nameRu:\s*"([^"]+)",\s*subject:\s*\{\s*maxMark:\s*(\d+),\s*bands:\s*bands\(\[([\s\S]*?)\]\),/g;
for (const [, nameRu, max, body] of g10.matchAll(block)) {
  const bands = [...body.matchAll(/\["([^"]+)",\s*(\d+),\s*(\d+)\]/g)]
    .map(([, g, min, hi]) => ({ g, min: +min, max: +hi }));
  SUBJECTS.push({ name: SHORT[nameRu] ?? nameRu, max: +max, bands });
}
if (SUBJECTS.length !== 10) throw new Error(`expected 10 Grade 10 subjects, parsed ${SUBJECTS.length}`);

const floorFor = (s, grade) => s.bands.find((b) => b.g === grade)?.min ?? null;
const pct = (mark, max) => Math.round((mark / max) * 100);
const gradeAt = (s, mark) => s.bands.find((b) => mark >= b.min && mark <= b.max)?.g ?? "U";

/** Subjects ranked by the percentage that grade costs, cheapest first. */
const ranked = (grade) =>
  SUBJECTS.map((s) => {
    const mark = floorFor(s, grade);
    return mark == null ? null : { name: s.name, mark, max: s.max, p: pct(mark, s.max) };
  })
    .filter(Boolean)
    .sort((a, b) => a.p - b.p || a.name.localeCompare(b.name, "ru"));

/** What 46 % buys, worst grade first — the whole point of the post. */
const AT = 46;
const ORDER = ["U", "E", "D", "C", "B", "A", "A*"];
const atPercent = SUBJECTS.map((s) => {
  const mark = Math.round((s.max * AT) / 100);
  return { name: s.name, mark, max: s.max, grade: gradeAt(s, mark) };
});
const spread = [...new Set(atPercent.map((r) => r.grade))].sort(
  (a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

/* Every grade 46 % can land on, best first, with how many subjects sit there
   and the two that name it most recognisably. */
const showcase = [...spread]
  .sort((a, b) => ORDER.indexOf(b) - ORDER.indexOf(a))
  .map((grade) => {
    const rows = atPercent.filter((r) => r.grade === grade);
    return { grade, count: rows.length, examples: rows.slice(0, 2) };
  });

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

/** One ranked chart: bar rows, extremes emphasised, every row labelled. */
const chart = (rows) => {
  const lo = rows[0].p;
  const hi = rows[rows.length - 1].p;
  return `<div class="chart">${rows.map((r) => {
    const edge = r.p === lo || r.p === hi;
    return `<div class="row${edge ? " edge" : ""}">
      <span class="sub">${r.name}</span>
      <span class="track"><i style="width:${r.p}%"></i></span>
      <span class="val">${r.p}<span class="u"> %</span></span>
      <span class="raw">${r.mark}/${r.max}</span>
    </div>`;
  }).join("")}</div>`;
};

const slides = [
  /* 01 — hook ------------------------------------------------------------ */
  slide(1, "cover", `
    <header class="s-head"><span class="label">МЭСК · 10 КЛАСС</span></header>
    <div class="stack">
      <h1 class="display">${AT} %<br>— это<br>какая<br><span class="struck">оценка?</span></h1>
      <p class="lede">Смотря какой предмет. На одном это ${spread[spread.length - 1]},
        на другом — ${spread[0]}.</p>
    </div>
    <footer class="s-foot"><span class="swipe">ЛИСТАЙ →</span><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 02 — one percentage, four grades -------------------------------------- */
  slide(2, "dark", `
    <header class="s-head"><span class="label">ОДИН ПРОЦЕНТ</span></header>
    <div class="stack">
      <h2 class="heading inv">${AT} % — это<br><span class="struck">${spread.length} разные</span><br>оценки</h2>
      <div class="grades">${showcase.map((r) => `
        <div class="grow">
          <span class="g">${r.grade}</span>
          <span class="gs">
            <b>${plural(r.count, "предмет", "предмета", "предметов")}</b>
            <span>${r.examples.map((e) => `${e.name} — ${e.mark} из ${e.max}`).join(" · ")}</span>
          </span>
        </div>`).join("")}
      </div>
    </div>
    <footer class="s-foot inv"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 03 — the C threshold -------------------------------------------------- */
  slide(3, "", `
    <header class="s-head"><span class="label">ПОРОГ C · 10 КЛАСС</span></header>
    <div class="stack">
      <h2 class="heading">Сколько нужно<br>на <span class="struck">C</span></h2>
      ${chart(ranked("C"))}
      <p class="note">На уровне предмета · официальные таблицы границ</p>
    </div>
    <footer class="s-foot"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 04 — the A threshold -------------------------------------------------- */
  slide(4, "", `
    <header class="s-head"><span class="label">ПОРОГ A · 10 КЛАСС</span></header>
    <div class="stack">
      <h2 class="heading">И сколько<br>на <span class="struck">A</span></h2>
      ${chart(ranked("A"))}
      <p class="note">На уровне предмета · официальные таблицы границ</p>
    </div>
    <footer class="s-foot"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 05 — takeaway + CTA --------------------------------------------------- */
  slide(5, "cta", `
    <header class="s-head"><span class="label">ВЫВОД</span></header>
    <div class="stack">
      <h2 class="heading inv">Процент<br>не говорит<br>тебе <span class="struck">ничего</span></h2>
      <p class="lede inv">Считай в баллах и сверяйся с официальной таблицей своего
        предмета. Это единственный способ узнать оценку до экзамена.</p>
      <p class="save">Сохрани, чтобы не пересчитывать →</p>
    </div>
    <footer class="s-foot inv"><span class="dom big">TALAP.ONLINE</span></footer>`),
];

/* --------------------------------------------------------------------- css */

const css = `
${WEIGHTS.map(face).join("\n")}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#777;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}

:root{
  --ink:#151515; --paper:#f3f3f3; --hl:#fff824;
  --t2:#c9c9c4;          /* secondary text */
  --t3:#8f8f8a;          /* muted text */
  --bar-off:#6b6b66;     /* de-emphasis mark — validated >=3:1 on #151515 */
  --line-d:#333330; --line-l:#d6d6d2; --track:#e4e4e0;
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

.display{font-size:128px;line-height:.92;font-weight:900;letter-spacing:-.045em;text-transform:uppercase}
.heading{font-size:88px;line-height:.96;font-weight:900;letter-spacing:-.04em}
.heading.inv{color:var(--paper)}
.lede{margin-top:44px;font-size:31px;line-height:1.4;font-weight:600;max-width:26ch}
.lede.inv{color:var(--t2);font-weight:400}
.note{margin-top:44px;font-size:18px;font-weight:600;letter-spacing:.09em;
  text-transform:uppercase;color:var(--t3)}
.save{margin-top:52px;font-size:27px;font-weight:700;color:var(--hl)}

/* the one gesture allowed to cross the grid */
.struck{position:relative;display:inline-block;z-index:1;padding:0 .06em;line-height:.98;margin-right:.16em}
.struck::before{content:"";position:absolute;z-index:-1;background:var(--hl);
  left:-.09em;right:-.15em;top:0;bottom:0}
.display .struck{line-height:1.14}
.slide.cover .struck::before{background:var(--ink)}
.slide.cover .struck{color:var(--hl)}
.slide.dark .struck,.slide.cta .struck{color:var(--ink)}

/* 02 — one percentage, several grades */
.grades{margin-top:56px;display:flex;flex-direction:column}
.grow{display:flex;align-items:center;gap:34px;padding:34px 0;border-bottom:2px solid var(--line-d)}
.grow:first-child{border-top:2px solid var(--line-d)}
.g{flex:none;width:104px;height:104px;display:grid;place-items:center;
  background:var(--hl);color:var(--ink);font-size:52px;font-weight:900;letter-spacing:-.04em}
.gs b{display:block;font-size:34px;font-weight:800;letter-spacing:-.02em}
.gs span{display:block;margin-top:10px;font-size:23px;line-height:1.35;font-weight:500;color:var(--t3)}

/* 03 / 04 — ranked bar rows. Every row is labelled, so no gridlines and no axis. */
.chart{margin-top:56px;display:flex;flex-direction:column;gap:34px}
.row{display:grid;grid-template-columns:252px 1fr 104px 92px;align-items:center;gap:16px}
.sub{font-size:25px;font-weight:600;line-height:1.15}
.track{height:24px;background:var(--track)}
.track i{display:block;height:100%;background:var(--bar-off);border-radius:0 4px 4px 0}
.row.edge .track i{background:var(--hl)}
.row.edge .sub{font-weight:800}
.val{text-align:right;font-size:34px;font-weight:800;font-variant-numeric:tabular-nums}
.val .u{font-size:21px;font-weight:600;color:var(--t3)}
.raw{text-align:right;font-size:21px;font-weight:600;color:var(--t3);font-variant-numeric:tabular-nums}
`;

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.join("\n")}</body></html>`;
const file = path.join(CACHE, "post.html");
fs.writeFileSync(file, html);

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto("file://" + file, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const over = await page.evaluate(() =>
  [...document.querySelectorAll(".slide")]
    .map((s, i) => ({ n: i + 1, over: s.scrollHeight - s.clientHeight }))
    .filter((r) => r.over > 1));
if (over.length) console.error("SLIDES OVERFLOW:", over.map((r) => `s${r.n} +${r.over}px`).join(", "));

for (let i = 1; i <= slides.length; i++) {
  await (await page.$(`#s${i}`)).screenshot({
    path: path.join(OUT, `talap-pct-${String(i).padStart(2, "0")}.png`) });
}
await browser.close();

console.log(`46 % даёт оценки: ${spread.join(", ")}`);
console.log(`порог C: ${ranked("C")[0].p}–${ranked("C").at(-1).p} %`);
console.log(`порог A: ${ranked("A")[0].p}–${ranked("A").at(-1).p} %`);
console.log(`rendered ${slides.length} slides → ${OUT}`);
