# Talap

MVP web platform for students sitting the Cambridge International Examination
(МЭСК) at Nazarbayev Intellectual Schools — mock papers taken from real NIS
question papers, graded against the published boundary tables, with an AI tutor
that explains the step you missed and generates new questions at the same level.

```bash
npm install
npm run dev          # http://localhost:3000
npm run check        # data integrity checks
npm run build        # production build
```

The app runs fully without any API key — see [AI tutor](#ai-tutor) below.

---

## What is here

| Route | What it is |
|---|---|
| `/` | Landing page. Neo-brutalist, with an interactive 3D grade ladder (React Three Fiber). |
| `/library` | Paper library and curriculum coverage, labelled by provenance. |
| `/exam/[paperId]` | The test sheet: one question at a time, live scoring, AI tutor drawer. |
| `/dashboard` | Personal tracking: topic mastery radar, grade trend, streak, history. |
| `/api/tutor` | Streams a tutor explanation for one question. |
| `/api/generate` | Returns a new question at the same topic and mark tariff. |
| `/api/chat` | The site-wide assistant behind the **ASK TALAP** panel. |
| `/api/assess` | Marks one extended written answer against the published rubric. |

## Curriculum architecture

What a student sits depends on three things: grade year, language parallel, and
their profile choices.

| Year | Subjects |
|---|---|
| **10** | Mathematics · History of Kazakhstan · Я1 · Я2 · **1 profile** of four |
| **11** | English · Я2 — two exams, nothing else |
| **12** | Mathematics · History of Kazakhstan · Я1 · **2 profiles** of five |

The **parallel** decides which language is Я1 and which is Я2: a Kazakh-parallel
student sits Kazakh as Я1 and Russian as Я2, and vice versa. This is why
registration asks for it — showing a Kazakh-parallel student the Russian Я1
papers would be offering an exam they will never sit. Profile options are
Biology, Chemistry, Physics and Computer Science, with Geography added at
Grade 12.

`examSubjectsFor({ gradeYear, parallel, profileSubjectIds })` in
`data/curriculum.ts` is the single source of truth, and the library filters to
exactly its result. Mathematics carries its Grade 10 strands and its A-Level
strands separately (`topics` and `topicsAdvanced`) so a Grade 10 view never
advertises calculus the student has not met yet.

## Grading

`data/grade-boundaries.ts` carries the published А*–U boundary tables for all
three grade years, transcribed verbatim: subject level plus every component.
**72 boundary sets in total** — Grade 10 (10 subjects), Grade 11 (3), Grade 12 (9).

The years use genuinely different tables, not one table scaled. Grade 10
Mathematics is out of 160 across two components; Grade 12 Mathematics is out of
230 across three, plus a combined "Components 1 & 3" row. Grade 11 examines only
English and the second language.

Whether A* exists at component level also varies by year: Grade 10 and 11
component tables stop at A, while Grade 12 component tables carry an A* band.
The data records whatever the published table shows and the grading code walks
whatever bands exist, rather than assuming a fixed ladder.

These are **not** percentage approximations. A C in Grade 10 Mathematics
Component 1 starts at 36/80 (45%); a C in Grade 12 Mathematics Component 2 starts at 39/90
(43%). `npm run check` asserts every band is contiguous and that a mark on a
band floor earns that band while one mark below does not.

Components carry the label the published table uses — `Component 1`,
`Component 2`, and Grade 12 Mathematics' combined `Components 1 & 3` — so a
paper is always named with the component it is graded on. The library card for
Computer Science Component 2 reads `GRADED ON COMPONENT 2 / 60`, not the
subject's 150.

The landing page carries `BoundaryExplorer`, which switches the whole table
between Grade 10, 11 and 12 and between subject level and component level. That
switch is the fastest way to see that the years are not one table rescaled:
Grade 10 has 10 subjects across 20 components, Grade 11 has 3 across 6, Grade 12
has 9 across 24.

A* is awarded at subject level only in Grades 10 and 11. When the workspace
shows a subject-level projection it is flagged as projected, never as an
awarded grade.

### Mark scaling

Both source papers declare a total of 80 marks, but the per-question `[n]` tags
printed on them add up to **67** (March) and **63** (April). The shortfall sits
in sub-part mark cells the source documents do not break down, so it cannot be
attributed to specific questions without inventing marks.

Rather than pad the papers, the app scores what is actually there and scales
that result onto the official 80-mark component scale before reading the
boundary table (`scaleToComponent` in `lib/grading.ts`). Both figures are shown
in the workspace so the number is never silently massaged.

## Mock papers

Ten papers, and the difference between them matters:

| Paper | Grade | Provenance |
|---|---|---|
| Mathematics Paper 1 — 5 March 2021 | 10 | **Transcribed** from the source `.docx` |
| Mathematics Paper 1 — 16 April 2021 | 10 | **Transcribed** from the source `.docx` |
| Chemistry Paper 1 — May 2021 | 10 | **Transcribed** from the source PDF |
| Computer Science Component 2 — May 2025 | 10 | **Transcribed** from the source PDF |
| Mathematics Component 2 — May 2024 | 10 | **Transcribed** from the source PDF — **calculator paper** |
| Physics Component 1 | 10 | **Transcribed** from the sample paper |
| History of Kazakhstan Component 1 | 10 | **Transcribed** from the published test specification |
| Kazakh Я1 Component 1 | 10 | **Transcribed** from the sample paper |
| Russian Я1 Component 2 — 2025 | 10 | **Transcribed** from the graded-answers collection |
| Mathematics Paper 1 — Pure | 12 | **Authored** to A-Level standard |

The Grade 10 papers are transcribed question by question, with English stems,
the original Kazakh or Russian alongside, worked answers and step-by-step mark
schemes. Chemistry Paper 1 carries all 25 Part A multiple-choice questions plus
Part B questions 26–31 (75 of the paper's 90 marks); questions 32–33 depend on
an apparatus diagram and a rate graph that are not yet extracted.

Computer Science Component 2 (10CSCI/02) carries 16 of its 18 questions, 53 of
60 marks, all built on the paper's single scenario — the delivery company
«Алтын» and its twenty warehouses. Question 3(c) needs the printed
internet-provider tariff tables and 6(h) the printed C++ listing to trace;
neither is in the document's text layer, and inventing those numbers would mean
inventing exam content. Every question on this paper is self-marked: it awards
marks for justification and for code no string comparison can check.

The Grade 12 paper is **not a past paper** — no Grade 12 paper was supplied, so
its 15 questions are written to the A-Level pure mathematics standard a profile
candidate sits: calculus as the spine (differentiation, integration,
differential equations) plus the series, complex number, vector and parametric
work that travels with it. Every answer is exact, so it stays non-calculator and
fully auto-markable. `Paper.provenance` carries this distinction and the UI
labels every paper `PAST PAPER` or `PRACTICE` wherever it is offered — the app
never implies an authored paper is a real sitting.

Questions are marked one of three ways, mirroring how the real paper is graded:

- **auto** — a determinate answer (number, coordinate pair, expression), marked
  by the machine. The normaliser in `lib/exam-types.ts` accepts `(-16, -9)`,
  `-16;-9` and `(−16; −9)` as the same answer.
- **worked** — proofs, constructions and diagram questions. The student marks
  their own working against the published scheme, step by step. This is how the
  paper actually awards method marks, and self-marking against a scheme is
  itself an exam skill.

- **assessed** — extended writing: the Я1 language papers and History. There is
  no answer key, only a banded rubric, so these go to `/api/assess`. See
  [Marking extended answers](#marking-extended-answers).

Only questions whose answer is unambiguous are set to `auto`. Diagram-dependent
questions carry the original figure from the paper (`public/exams/`).

## The calculator

Some papers permit a calculator and some do not, and the difference is on the
paper itself: Mathematics **Component 1** is non-calculator, **Component 2**
lists a calculator among its additional materials. `Paper.calculator` records
which, and the workspace shows an on-screen scientific calculator only on the
papers that allow one — offering it on a non-calculator paper would train the
wrong habit.

It takes a whole expression rather than one keypress at a time, because that is
how the paper is actually sat: `acos(11/sqrt(143))` is one keying, not nine. It
handles the implicit multiplication people write (`2π`, `3(4+1)`), unary minus
that binds correctly (`2*-3` is −6, `-3^2` is −9), a DEG/RAD switch, and an
`Ans` key.

`lib/calculator.ts` is a hand-written tokeniser and shunting-yard parser, not
`eval`. `eval` on a string the page collected would execute whatever was typed;
a calculator is not worth an arbitrary-code-execution hole. `npm run check`
evaluates eleven expressions — including the arithmetic of the 2024 Component 2
paper — and asserts that malformed input is rejected rather than quietly
returning a number.

The 2024 rubric asks for inexact answers to 3 significant figures and angles to
0.1°, so the panel shows the 3 s.f. rounding beside the full value rather than
leaving a candidate to copy sixteen digits the mark scheme does not want.

## Marking extended answers

Three subjects cannot be marked by comparison. Kazakh Я1 and Russian Я1 ask for
analysis and composition; History of Kazakhstan asks for an argument built from
printed sources. All three are marked the way the real paper marks them —
against banded descriptors — so `Question.criteria` carries the published bands
verbatim and `/api/assess` marks the script against them.

What makes this defensible rather than a model grading prose it happens to
like:

- **The rubric is the published one.** Russian Я1 Component 2 splits twenty
  marks into content and organisation (10) and range and accuracy of language
  (10), because that is what the mark scheme does. Kazakh Я1 uses the paper's
  own 0–10 band scale, and questions 1 and 2 additionally carry the specific
  scheme — what the examiner expects a candidate to notice about form,
  audience, purpose, content, style and language in each text.
- **Every judgement has to cite the script.** The model returns, per criterion,
  the band it applied, the descriptor phrase that decided it, the evidence in
  the student's own words, and what would move it up one band.
- **Marks are reconciled server-side.** A criterion the model invented is
  dropped, one it skipped comes back unmarked, a mark above the maximum is
  clamped, and the total is computed here rather than taken from the model.
  `npm run check` asserts the criteria sum to the tariff and that every
  criterion has a zero band and a top band equal to its maximum.

### Source use, counted

History marks depend on using the sources, and the specification is explicit:
credit needs contextual knowledge across **at least three** of them. So the four
sources travel with the request, and the marked script comes back naming which
ones the answer actually used as evidence. Naming a source is not using it, and
the two answers below are the same length:

| Answer | Mark | Sources used |
|---|---|---|
| Lists all four sources, then generalises about the Thaw | **1 / 12** | none |
| Reads B against its own two articles, dates D to 2018, weighs A as a 1989 publication | **10 / 12** | A, B, D |

The reference the model reports is matched back to the paper's own references,
so "B", "Source B" and "Источник B" all resolve to the same source, and anything
it did not credit as used is reported as ignored rather than quietly dropped.

### Without a key

`/api/assess` never invents a mark offline. It returns the bands for
self-marking, the word count against what the paper asked for, and — where the
question has sources — which references appear in the script at all, with the
warning that appearing is not using.

## AI tutor

Three surfaces, on two scopes.

Inside a question, in the workspace drawer:

- **Explain this** — streams a reply that starts from the step your working
  diverged at and quotes the mark scheme wording that earns each mark. Answers
  in the language you wrote in (Kazakh, Russian or English).
- **Give me another** — generates a new question on the same topic, worth the
  same marks, with the same number of reasoning steps.

Everywhere else, in the floating **ASK TALAP** panel (`components/AskTalap.tsx`):

- **Ask Talap** — the site-wide assistant. What you sit this year, what a grade
  actually needs, how to revise, or straight syllabus teaching. It knows the
  curriculum architecture above, and it is told to point at the library rather
  than guess a boundary it is unsure of. The panel hides itself on `/exam/*`,
  where the question-bound drawer is the right surface.

### Providers

`lib/server/providers.ts` supports two backends and uses whichever is configured:

| Env var | Backend |
|---|---|
| `FREETHEAI_API_KEY` | FreeTheAI, an OpenAI-compatible endpoint fronting Gemini (`bbl/gemini-3.5-flash`). This is what the deployed site runs on. |
| `GEMINI_API_KEY` | Accepted as an alias for the above, for deployments where the same key already exists under that name. |
| `ANTHROPIC_API_KEY` | Anthropic, `claude-opus-5` with adaptive thinking and structured outputs. Takes precedence when both are set. |

Anthropic uses typed structured outputs. The OpenAI-compatible path has no
schema binding, so the shape is requested in the prompt and validated with Zod
on the way back. Either way the route re-checks that the mark scheme sums to the
tariff, and pins the topic and mark count to the source question — a schema
guarantees well-formed JSON, not correct arithmetic, and level matching is the
whole point.

### Deploying on Vercel

The app is a stock Next.js App Router project. `package.json` sits at the
repository root and `vercel.json` pins the framework preset, so an import needs
no further build configuration. The one thing to set is the key:

1. **Project → Settings → Environment Variables**
2. Add `FREETHEAI_API_KEY` (or `GEMINI_API_KEY`) with the key as its value.
3. Tick **Production**, **Preview** and **Development** so previews are not
   silently stuck in offline mode.
4. **Redeploy.** Environment variables are read at request time by the route
   handlers, but a running deployment does not pick up a new variable until it
   is redeployed.

Optional overrides, if the endpoint or model ever moves: `FREETHEAI_BASE_URL`
(default `https://api.freetheai.xyz/v1`) and `FREETHEAI_MODEL` (default
`bbl/gemini-3.5-flash`).

Never prefix the key with `NEXT_PUBLIC_`. That prefix inlines a value into the
client bundle, which would publish the key to every visitor. The three API
routes are `runtime = "nodejs"`, so the credential is only ever read on the
server.

To check which mode a deployment is in without reading the logs: the tutor
drawer and the assistant panel both show an `OFFLINE` badge when no key is
resolving, and `/api/tutor` returns an `X-Tutor-Mode` header.

#### “No Next.js version detected”

Vercel raises this when it cannot find a `package.json` with `next` in it at
the directory it is building. Two causes, in order of likelihood:

1. **The branch being built genuinely has no `package.json`.** A revert branch
   that undoes the initial commit is empty, so its preview build fails exactly
   this way. That is a fact about the branch, not about the app — check what
   `git ls-tree --name-only <branch>` actually contains before changing any
   Vercel setting.
2. **Root Directory is pointing somewhere else.** Project → Settings → Build
   and Deployment → Root Directory must be empty (the repository root), since
   that is where `package.json` lives.

### Running without a key

With no key set, all three routes degrade rather than fail:

- **Ask Talap** answers from `lib/server/knowledge.ts`, which reads the real
  boundary tables, the curriculum and the seeded papers — so an offline answer
  about a grade boundary is the published table, not generated prose. A question
  it cannot answer from data gets an honest "here is what I can do" rather than
  a guess.
- **Explain** returns the question's real mark scheme, staged step by step.
- **Generate** uses the deterministic generators in `lib/offline-variants.ts`,
  which re-parameterise a real question type and compute the answer
  arithmetically — correct by construction, and non-calculator by design
  (Pythagorean triples, exact surds, common angles). Twenty topics have a true
  generator, spanning both levels: the Grade 10 strands and the A-Level ones
  (differentiation, integration, differential equations, binomial series,
  complex numbers, 3D vectors, parametric equations, exponentials and logs).
  Anything uncovered falls back to a same-tariff question on another topic and
  says so.

  Level matching is the point: ask for another question on a Grade 12 calculus
  question and you get calculus at the same mark tariff, not a Grade 10
  substitute.

To enable the live tutor locally:

```bash
cp .env.example .env.local
# then set FREETHEAI_API_KEY (or ANTHROPIC_API_KEY) in .env.local
npm run dev
```

`.env.local` is gitignored. Never put a real key in `.env.example`, in source,
or in a commit — rotate any key that has been pasted into a chat, an issue or a
diff.

### Security

The key is server-side only — the browser posts to `/api/*` and the route adds
the credential. `lib/server/guard.ts` handles input validation, per-IP rate
limiting, request timeouts and error mapping that never leaks upstream detail.

Before production you still need: authentication, a rate limiter that survives
restarts and works across instances, request logging that does not store answer
text, and forced HTTPS at the edge.

## Design system

Hybrid, as specified: **Neo-Brutalism** on the landing page, **Swiss Bento
Minimalism** in the workspace. Tokens are in `app/globals.css`.

The palette, type scale and "the border is the card" grammar come from
`DESIGN.md` (Swiss broadsheet behind a highlighter pen): canvas `#f3f3f3`, ink
`#151515`, highlighter `#fff824`, everything at 0px radius except the pill
button. Two deliberate extensions:

1. **Hard offset shadows.** `DESIGN.md` is shadowless. The landing page uses
   `5px 5px 0` offsets — flat black rectangles, not soft elevation, so the
   "printed, not screen" rule survives.
2. **A second chromatic mark** (`--color-acid-lime`). `DESIGN.md` forbids a
   second accent *decoratively*; here lime is strictly semantic — it only ever
   means "correct" or "A*". Yellow remains the sole highlighter.

The 3D hero follows the same logic: basic materials, no gradients, no
environment maps, hard black edge lines on every solid — printed shapes that
happen to have depth. Grade letters are drawn into a `CanvasTexture` rather than
loaded as a 3D font, so the scene has no external asset dependency. WebGL loads
browser-only; devices that cannot run it get a static grade ladder in the same
visual language.

## Persistence

Everything is `localStorage`, namespaced under `talap.v1` (`lib/storage.ts`).
Registration is a name, a grade year and a target grade — no email, no password,
because the app cannot yet protect credentials. The dashboard renders only real
attempts; with none recorded it says so rather than showing placeholder numbers.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
React Three Fiber / three.js · Recharts · Anthropic SDK · Zod

## Layout

```
app/            routes (landing, library, exam, dashboard, api)
components/     Hero3D, GradeBadge, Nav, exam/, dashboard/
data/           curriculum, grade boundaries, seeded papers
lib/            grading, exam types, storage, prompts, offline generators
lib/server/     API hardening
scripts/        check-data.ts
public/exams/   original figures from the papers
```

---

Question content is transcribed from NIS past papers for study use. Grade
boundaries are from the published МЭСК table.
