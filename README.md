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
230 across three, plus a combined "Papers 1 & 3" row. Grade 11 examines only
English and the second language.

Whether A* exists at component level also varies by year: Grade 10 and 11
component tables stop at A, while Grade 12 component tables carry an A* band.
The data records whatever the published table shows and the grading code walks
whatever bands exist, rather than assuming a fixed ladder.

These are **not** percentage approximations. A C in Grade 10 Mathematics Paper 1
starts at 36/80 (45%); a C in Grade 12 Mathematics Component 2 starts at 39/90
(43%). `npm run check` asserts every band is contiguous and that a mark on a
band floor earns that band while one mark below does not.

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

Three papers, and the difference between them matters:

| Paper | Grade | Provenance |
|---|---|---|
| Mathematics Paper 1 — 5 March 2021 | 10 | **Transcribed** from the source `.docx` |
| Mathematics Paper 1 — 16 April 2021 | 10 | **Transcribed** from the source `.docx` |
| Chemistry Paper 1 — May 2021 | 10 | **Transcribed** from the source PDF |
| Mathematics Paper 1 — Pure | 12 | **Authored** to A-Level standard |

The Grade 10 papers are transcribed question by question, with English stems,
the original Kazakh or Russian alongside, worked answers and step-by-step mark
schemes. Chemistry Paper 1 carries all 25 Part A multiple-choice questions plus
Part B questions 26–31 (75 of the paper's 90 marks); questions 32–33 depend on
an apparatus diagram and a rate graph that are not yet extracted.

The Grade 12 paper is **not a past paper** — no Grade 12 paper was supplied, so
its 15 questions are written to the A-Level pure mathematics standard a profile
candidate sits: calculus as the spine (differentiation, integration,
differential equations) plus the series, complex number, vector and parametric
work that travels with it. Every answer is exact, so it stays non-calculator and
fully auto-markable. `Paper.provenance` carries this distinction and the UI
labels every paper `PAST PAPER` or `PRACTICE` wherever it is offered — the app
never implies an authored paper is a real sitting.

Questions are marked one of two ways, mirroring how the real paper is graded:

- **auto** — a determinate answer (number, coordinate pair, expression), marked
  by the machine. The normaliser in `lib/exam-types.ts` accepts `(-16, -9)`,
  `-16;-9` and `(−16; −9)` as the same answer.
- **worked** — proofs, constructions and diagram questions. The student marks
  their own working against the published scheme, step by step. This is how the
  paper actually awards method marks, and self-marking against a scheme is
  itself an exam skill.

Only questions whose answer is unambiguous are set to `auto`. Diagram-dependent
questions carry the original figure from the paper (`public/exams/`).

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

The app is a stock Next.js App Router project — import the repository and it
builds with no configuration. The one thing to set is the key:

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
