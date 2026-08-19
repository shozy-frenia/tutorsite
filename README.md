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

## Curriculum architecture

- **Grade 10** — core Maths and Sciences. Two transcribed mock papers live here.
- **Grade 11** — Cambridge English as a Second Language, plus the two compulsory
  national subjects (History of Kazakhstan, Kazakh / Russian language).
- **Grade 12** — two profile subjects taken to A-Level standard.

Defined in `data/curriculum.ts`. Mathematics carries its Grade 10 strands and
its A-Level strands separately (`topics` and `topicsAdvanced`) so a Grade 10
view never advertises calculus the student has not met yet.

## Grading

`data/grade-boundaries.ts` carries the published А*–U boundary tables for all
ten subjects, transcribed verbatim: subject level plus both components. These
are **not** percentage approximations. A C in Mathematics Paper 1 starts at
36/80 (45%); a C in Chemistry Paper 1 starts at 44/90 (49%). `npm run check`
asserts every band is contiguous and that a mark on a band floor earns that
band while one mark below does not.

A* is awarded at subject level only, so component tables stop at A. When the
workspace shows a subject-level projection it is flagged as projected, never as
an awarded grade.

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
| Mathematics Paper 1 — Pure | 12 | **Authored** to A-Level standard |

The two Grade 10 papers are transcribed question by question, with English
stems, the original Kazakh alongside, worked answers and step-by-step mark
schemes.

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

Two surfaces, both in the workspace drawer:

- **Explain this** — streams a reply that starts from the step your working
  diverged at and quotes the mark scheme wording that earns each mark. Answers
  in the language you wrote in (Kazakh, Russian or English).
- **Give me another** — generates a new question on the same topic, worth the
  same marks, with the same number of reasoning steps.

Both use `claude-opus-5` with adaptive thinking. Generation uses structured
outputs so the question, answer and mark scheme come back typed; the route then
re-checks that the scheme actually sums to the tariff, because a schema
guarantees well-formed JSON, not correct arithmetic.

### Running without a key

With no `ANTHROPIC_API_KEY` set, both routes degrade rather than fail:

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

To enable the live tutor:

```bash
cp .env.example .env.local
# then set ANTHROPIC_API_KEY in .env.local
```

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
