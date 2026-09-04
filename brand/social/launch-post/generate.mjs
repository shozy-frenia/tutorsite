/**
 * Instagram launch carousel — 7 slides, 1080×1350.
 *
 *   node brand/social/launch-post/generate.mjs
 *
 * Writes the PNGs next to this file. Text and figures live in `slides` below;
 * everything on slide 03 and 04 is quoted from `data/` and must stay quoted —
 * the whole claim of the post is that the numbers are the real published ones.
 * See CAPTION.md for the caption and the pre-publication checklist.
 *
 * Inter is fetched from Google Fonts on first run and cached in `.fonts/`
 * (gitignored) — the faces are embedded as data URIs so the render never
 * depends on a font being installed on the machine.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

// Playwright is a rendering tool for this script, not an app dependency, so it
// is not in package.json — resolve it from the project or from the global
// install, whichever this machine has.
const { chromium } = await import("playwright").catch(async () => {
  const root = execSync("npm root -g", { encoding: "utf8" }).trim();
  return import(pathToFileURL(path.join(root, "playwright", "index.mjs")).href);
});

const OUT = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.join(OUT, ".fonts");
fs.mkdirSync(FONTS, { recursive: true });

/* Weights the slides actually use: body, labels, card titles, display. */
const WEIGHTS = [400, 600, 800, 900];

for (const w of WEIGHTS) {
  const file = path.join(FONTS, `inter-${w}.ttf`);
  if (fs.existsSync(file)) continue;
  // The default (non-browser) UA gets one unsubsetted TTF per weight, which is
  // what we want — the browser-targeted CSS splits Cyrillic into its own
  // unicode-range face and would need every subset downloaded separately.
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${w}`)).text();
  const url = css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/)?.[0];
  if (!url) throw new Error(`no font URL for Inter ${w}`);
  fs.writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
}

const b64 = (w) => fs.readFileSync(path.join(FONTS, `inter-${w}.ttf`)).toString("base64");
const face = (w) => `@font-face{font-family:Inter;font-style:normal;font-weight:${w};src:url(data:font/ttf;base64,${b64(w)}) format('truetype');}`;

/* ---- brand mark, geometry lifted verbatim from components/BrandMark.tsx ---- */
const GLYPH = {
  T: "M66 1202V1490H1320V1202H869V0H517V1202Z",
  A: "M47 0 544 1490H1017L1529 0H1133L926 651Q876 814 829.5 997.5Q783 1181 736 1378H815Q770 1180 728.0 996.5Q686 813 639 651L439 0ZM385 317V587H1192V317Z",
  L: "M116 0V1490H469V288H1092V0Z",
  P: "M116 0V1490H726Q894 1490 1016.0 1425.0Q1138 1360 1203.5 1244.0Q1269 1128 1269 975Q1269 821 1202.0 707.0Q1135 593 1011.0 529.0Q887 465 716 465H338V744H652Q735 744 791.0 773.0Q847 802 875.0 854.0Q903 906 903 975Q903 1045 875.0 1096.5Q847 1148 790.5 1176.0Q734 1204 651 1204H469V0Z",
};
const WORD = [["T", 0], ["A", 1119.08], ["L", 2613.16], ["A", 3689.24], ["P", 5183.32]];

const mark = ({ h = 60, field = "#fff824", letter = "#151515", word = "#151515" } = {}) => `
<svg height="${h}" width="${(h * 606.47) / 130}" viewBox="0 0 606.47 130" style="display:block">
  <g transform="scale(1.3)">
    <rect x="0" y="0" width="100" height="100" fill="${field}"/>
    <g transform="translate(23.954,76.5) scale(0.037584,-0.037584)" fill="${letter}"><path d="${GLYPH.T}"/></g>
  </g>
  <g transform="translate(169,115) scale(0.067114,-0.067114)" fill="${word}">
    ${WORD.map(([g, x]) => `<path d="${GLYPH[g]}" transform="translate(${x},0)"/>`).join("")}
  </g>
</svg>`;

const icon = ({ h = 84, field = "#fff824", letter = "#151515" } = {}) => `
<svg height="${h}" width="${h}" viewBox="0 0 100 100" style="display:block">
  <rect x="0" y="0" width="100" height="100" fill="${field}"/>
  <g transform="translate(23.954,76.5) scale(0.037584,-0.037584)" fill="${letter}"><path d="${GLYPH.T}"/></g>
</svg>`;

/* ------------------------------------------------------------------ slides */

const slide = (n, cls, body) =>
  `<section class="slide ${cls}" id="s${n}">${body}<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div><span class="pager">${String(n).padStart(2, "0")} / 07</span></section>`;

const slides = [
  /* 1 — cover ------------------------------------------------------------ */
  slide(1, "cover", `
    <div class="rule-field"></div>
    <header class="s-head">${mark({ h: 46, field: "#151515", letter: "#fff824" })}<span class="label">МЭСК · NIS · CAMBRIDGE</span></header>
    <div class="stack">
      <h1 class="display">ТВОЙ<br>ПРОБНИК<br>МЭСК ТЕПЕРЬ<br><span class="struck">ОНЛАЙН</span></h1>
      <p class="lede">Настоящие экзаменационные работы NIS. Официальные пороги оценок. ИИ-репетитор, который читает твоё решение.</p>
    </div>
    <footer class="s-foot"><span class="swipe">ЛИСТАЙ →</span><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 2 — problem ---------------------------------------------------------- */
  slide(2, "dark", `
    <header class="s-head"><span class="label">ПРОБЛЕМА</span>${icon({ h: 38 })}</header>
    <div class="stack">
      <h2 class="heading inv">Как готовятся<br>к МЭСК<br><span class="struck">сегодня</span></h2>
      <ul class="pains">
        <li><span class="x">✕</span><span>PDF-ки без ответов, пересланные в групповом чате</span></li>
        <li><span class="x">✕</span><span>Проценты вместо настоящих порогов оценок</span></li>
        <li><span class="x">✕</span><span>«Правильно / неправильно» — но где именно ошибся, непонятно</span></li>
        <li><span class="x">✕</span><span>Репетитор, до которого ещё нужно доехать</span></li>
      </ul>
    </div>
    <footer class="s-foot inv"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 3 — real papers ------------------------------------------------------ */
  slide(3, "", `
    <header class="s-head"><span class="label">01 — НАСТОЯЩИЕ РАБОТЫ</span>${icon({ h: 38 })}</header>
    <div class="stack">
      <h2 class="heading">Не «похожие<br>задания».<br><span class="struck">Настоящие.</span></h2>
      <p class="body">Каждый вопрос расшифрован с той самой схемой оценивания, по которой ставят баллы на реальном экзамене.</p>
      <div class="stats">
        <div class="stat"><b>11</b><span>полных пробников</span></div>
        <div class="stat"><b>8</b><span>предметов</span></div>
        <div class="stat"><b>120+</b><span>вопросов</span></div>
      </div>
      <div class="chips">
        <span class="chip">МАТЕМАТИКА</span><span class="chip">ФИЗИКА</span><span class="chip">ХИМИЯ</span>
        <span class="chip">БИОЛОГИЯ</span><span class="chip">ИНФОРМАТИКА</span><span class="chip">ИСТОРИЯ</span>
        <span class="chip">ҚАЗАҚ ТІЛІ</span><span class="chip">РУССКИЙ ЯЗЫК</span>
      </div>
    </div>
    <footer class="s-foot"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 4 — boundaries ------------------------------------------------------- */
  slide(4, "", `
    <header class="s-head"><span class="label">02 — ОФИЦИАЛЬНАЯ ШКАЛА</span>${icon({ h: 38 })}</header>
    <div class="stack">
      <h2 class="heading">C по матема&shy;тике —<br>это <span class="struck">36 из 80</span></h2>
      <p class="body">Не 60 %. Не «примерно». Мы считаем по опубликованным таблицам порогов — тем, что действуют на самом экзамене.</p>
      <!-- bands verbatim from data/grade-boundaries.ts, GRADE_10 mathematics
           Component 1; bar width = band's upper bound / 80 -->
      <table class="bands">
        <tr><td class="g">A</td><td class="bar"><i style="width:100%"></i></td><td class="n">56–80</td></tr>
        <tr><td class="g">B</td><td class="bar"><i style="width:69%"></i></td><td class="n">46–55</td></tr>
        <tr class="hit"><td class="g">C</td><td class="bar"><i style="width:56%"></i></td><td class="n">36–45</td></tr>
        <tr><td class="g">D</td><td class="bar"><i style="width:44%"></i></td><td class="n">26–35</td></tr>
        <tr><td class="g">E</td><td class="bar"><i style="width:31%"></i></td><td class="n">16–25</td></tr>
      </table>
      <p class="note">Математика, 10 класс, Компонент 1 · из 80 баллов</p>
    </div>
    <footer class="s-foot"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 5 — AI tutor --------------------------------------------------------- */
  slide(5, "", `
    <header class="s-head"><span class="label">03 — ИИ-РЕПЕТИТОР</span>${icon({ h: 38 })}</header>
    <div class="stack">
      <h2 class="heading">Читает твоё<br><span class="struck">решение,</span><br>а не ответ</h2>
      <div class="chat">
        <div class="bubble you"><span class="who">ТЫ НАПИСАЛ</span>x² − 5x + 6 = 0 → x = 2</div>
        <div class="bubble ai"><span class="who">TALAP</span>Корень найден верно, но схема даёт 2 балла: один за оба корня, один за метод. Ты потерял x = 3 — проверь второй множитель.</div>
      </div>
      <div class="langs"><span class="chip">ҚАЗАҚША</span><span class="chip">РУССКИЙ</span><span class="chip">ENGLISH</span></div>
      <p class="body sm">Отвечает на том языке, на котором ты пишешь.</p>
    </div>
    <footer class="s-foot"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 6 — practice + progress ---------------------------------------------- */
  slide(6, "dark", `
    <header class="s-head"><span class="label">04 — ПРАКТИКА И ПРОГРЕСС</span>${icon({ h: 38 })}</header>
    <div class="stack">
      <h2 class="heading inv">Ещё один<br>вопрос —<br><span class="struck">того же</span> уровня</h2>
      <div class="twoup">
        <div class="cardi"><b>Бесконечный дрилл</b><span>Та же тема, тот же балл, столько же шагов — новые числа. Пока не станет автоматизмом.</span></div>
        <div class="cardi"><b>Каждая попытка — на графике</b><span>Освоение по темам, прогноз оценки от U до A* и серия дней, ради которой ты откроешь приложение завтра.</span></div>
      </div>
    </div>
    <footer class="s-foot inv"><span class="dom">TALAP.ONLINE</span></footer>`),

  /* 7 — CTA -------------------------------------------------------------- */
  slide(7, "cta", `
    <div class="rule-field"></div>
    <header class="s-head">${mark({ h: 58, word: "#f3f3f3" })}</header>
    <div class="stack">
      <h2 class="heading inv cta-h">Открой первый<br>пробник —<br><span class="struck">бесплатно</span></h2>
      <div class="url">TALAP.ONLINE</div>
      <p class="body">Ссылка в шапке профиля. Пиши в директ, если хочешь протестировать раньше всех и подсказать, чего не хватает.</p>
    </div>
    <footer class="s-foot inv"><span class="label">СОЗДАНО ДЛЯ УЧЕНИКОВ NIS</span></footer>`),
];

/* --------------------------------------------------------------------- css */

const css = `
${WEIGHTS.map(face).join("\n")}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#777;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}

.slide{
  position:relative;width:1080px;height:1350px;overflow:hidden;
  background:#f3f3f3;color:#151515;
  padding:72px 76px;display:flex;flex-direction:column;
}
.slide+.slide{margin-top:24px}
.slide.dark{background:#151515;color:#f3f3f3}
.slide.cover{background:#fff824}
.slide.cta{background:#151515;color:#f3f3f3}

/* the lattice: a regular interval laid down first */
.rule-field{position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(to bottom,transparent 0 89px,rgba(21,21,21,.10) 89px 92px)}
.slide.cta .rule-field{background:repeating-linear-gradient(to bottom,transparent 0 89px,rgba(243,243,243,.08) 89px 92px)}

/* clinical corner registration */
.corner{position:absolute;width:26px;height:26px;border:3px solid #151515}
.slide.dark .corner,.slide.cta .corner{border-color:#f3f3f3}
.tl{top:34px;left:34px;border-right:0;border-bottom:0}
.tr{top:34px;right:34px;border-left:0;border-bottom:0}
.bl{bottom:34px;left:34px;border-right:0;border-top:0}
.br{bottom:34px;right:34px;border-left:0;border-top:0}

.pager{position:absolute;bottom:38px;left:50%;transform:translateX(-50%);
  font-size:15px;font-weight:600;letter-spacing:.22em;opacity:.5}

.s-head{display:flex;align-items:center;justify-content:space-between;gap:24px;position:relative;z-index:2}
.s-foot{display:flex;align-items:center;justify-content:space-between;
  padding-top:26px;border-top:3px solid #151515;position:relative;z-index:2}
.s-foot.inv{border-top-color:#f3f3f3}

/* the free height between header and footer is cut deliberately, not left over */
.stack{flex:1;display:flex;flex-direction:column;justify-content:center;
  padding:44px 0 54px;position:relative;z-index:2}

.label{font-size:19px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;
  background:#fff824;color:#151515;padding:8px 14px;display:inline-block}
.slide.cover .label{background:#151515;color:#fff824}
.dom{font-size:20px;font-weight:800;letter-spacing:.22em}
.swipe{font-size:26px;font-weight:900;letter-spacing:.14em;
  border:3px solid #151515;padding:12px 22px;box-shadow:7px 7px 0 #151515;background:#f3f3f3}

/* monumental register */
.display{font-size:126px;line-height:.88;font-weight:900;letter-spacing:-.045em;text-transform:uppercase}
.heading{font-size:92px;line-height:.94;font-weight:900;letter-spacing:-.04em;hyphens:manual}
.heading.inv{color:#f3f3f3}

/* the one gesture allowed to cross the grid — and to overshoot it.
   line-height on the inline-block, not a hand-tuned inset, is what makes the
   field clear Cyrillic caps and descenders at every size it is used at. */
/* margin-right keeps the overshoot from eating the word that follows it */
.struck{position:relative;display:inline-block;z-index:1;padding:0 .06em;line-height:.98;margin-right:.16em}
/* uppercase display carries Й/Ё diacritics above cap height — the field has to
   clear them or the breve reads as a chipped corner */
.display .struck{line-height:1.14}
.struck::before{content:"";position:absolute;z-index:-1;background:#fff824;
  left:-.09em;right:-.15em;top:0;bottom:0}
.slide.cover .struck::before{background:#151515}
.slide.cover .struck{color:#fff824}
.slide.dark .struck,.slide.cta .struck{color:#151515}

.lede{margin-top:52px;font-size:31px;line-height:1.4;font-weight:600;max-width:28ch}
.body{margin-top:36px;font-size:27px;line-height:1.45;font-weight:400;max-width:34ch}
.body.sm{font-size:23px;margin-top:26px;opacity:.75}
.note{margin-top:22px;font-size:19px;font-weight:600;letter-spacing:.1em;opacity:.55;text-transform:uppercase}

.cta-h{font-size:86px}
.url{align-self:flex-start;margin-top:50px;font-size:52px;font-weight:900;letter-spacing:.02em;
  background:#fff824;color:#151515;padding:16px 26px;box-shadow:10px 10px 0 #f3f3f3}

/* problem list */
.pains{list-style:none;margin-top:60px;display:flex;flex-direction:column;gap:26px}
.pains li{display:flex;gap:22px;align-items:flex-start;border-bottom:2px solid rgba(243,243,243,.22);padding-bottom:26px;
  font-size:29px;line-height:1.32;font-weight:600}
.x{color:#ff4b26;font-size:34px;font-weight:900;line-height:1;flex:none;width:34px}

/* stats */
.stats{margin-top:54px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.stat{border:3px solid #151515;box-shadow:7px 7px 0 #151515;background:#f3f3f3;padding:24px 20px}
.stat b{display:block;font-size:74px;font-weight:900;line-height:.9;letter-spacing:-.04em}
.stat span{display:block;margin-top:12px;font-size:18px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7}

.chips{margin-top:38px;display:flex;flex-wrap:wrap;gap:12px}
.chip{border:3px solid #151515;padding:9px 15px;font-size:18px;font-weight:800;letter-spacing:.12em}
.slide.dark .chip{border-color:#f3f3f3}

/* boundary table */
.bands{margin-top:46px;width:100%;border-collapse:collapse}
.bands td{padding:15px 0;border-bottom:2px solid rgba(21,21,21,.16);vertical-align:middle}
.bands .g{width:78px;font-size:38px;font-weight:900}
.bands .n{width:170px;text-align:right;font-size:30px;font-weight:800;font-variant-numeric:tabular-nums}
.bands .bar{padding-right:26px}
.bands .bar i{display:block;height:26px;background:#151515}
.bands .hit .bar i{background:#fff824;outline:3px solid #151515}
.bands .hit .g,.bands .hit .n{color:#151515}
.bands .hit td{border-bottom-color:#151515;border-top:3px solid #151515}

/* chat */
.chat{margin-top:48px;display:flex;flex-direction:column;gap:20px}
.bubble{border:3px solid #151515;padding:22px 24px;font-size:25px;line-height:1.4;font-weight:500;background:#fff}
.bubble .who{display:block;font-size:16px;font-weight:800;letter-spacing:.18em;margin-bottom:12px;opacity:.6}
.bubble.you{align-self:flex-start;max-width:74%;font-family:Inter;font-weight:700}
.bubble.ai{align-self:flex-end;max-width:88%;background:#fff824;box-shadow:8px 8px 0 #151515}
.langs{margin-top:38px;display:flex;gap:12px}

/* two-up cards */
.twoup{margin-top:56px;display:flex;flex-direction:column;gap:22px}
.cardi{border:3px solid #f3f3f3;padding:28px 26px}
.cardi b{display:block;font-size:31px;font-weight:900;letter-spacing:-.02em}
.cardi span{display:block;margin-top:14px;font-size:24px;line-height:1.4;opacity:.8}
`;

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.join("\n")}</body></html>`;
const file = path.join(FONTS, "carousel.html");
fs.writeFileSync(file, html);

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto("file://" + file, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

for (let i = 1; i <= slides.length; i++) {
  const el = await page.$(`#s${i}`);
  await el.screenshot({ path: path.join(OUT, `talap-ig-${String(i).padStart(2, "0")}.png`) });
}
await browser.close();
console.log("done →", OUT);
