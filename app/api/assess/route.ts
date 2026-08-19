import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { paperById } from "@/data/exams";
import type { Question } from "@/lib/exam-types";
import { clamp, clientIp, describeError, jsonError, rateLimited } from "@/lib/server/guard";
import {
  ANTHROPIC_MODEL,
  anthropic,
  extractJson,
  freeTheAiComplete,
  resolveProvider,
} from "@/lib/server/providers";
import { ASSESSOR_SYSTEM, assessRequest, wordCount } from "@/lib/tutor-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ANSWER_CHARS = 12_000;

/**
 * Shape of a marked script. The model chooses a mark per criterion and has to
 * say what earned it; everything is re-checked here, because a schema can
 * guarantee a number is a number but not that it is inside the criterion's
 * range or that the marks add up.
 */
const Assessment = z.object({
  criteria: z.array(
    z.object({
      id: z.string(),
      awarded: z.number(),
      band: z.string(),
      /** The descriptor phrase that decided the band. */
      reason: z.string(),
      /** What the student actually wrote that supports it. */
      evidence: z.string(),
      /** What would move this criterion up one band. */
      next: z.string(),
    })
  ),
  sourcesUsed: z.array(z.string()),
  sourcesIgnored: z.array(z.string()),
  summary: z.string(),
});

type Assessment = z.infer<typeof Assessment>;

/**
 * POST /api/assess
 *
 * Body:    { paperId, questionId, answer }
 * Returns: { criteria: [...], total, max, sourcesUsed, sourcesIgnored, summary, mode }
 *
 * Marks one extended written answer against the question's published rubric.
 * Language Я1 papers are marked on content, organisation and language; History
 * is marked partly on how much of the supplied source material the answer
 * actually used, which is why the sources travel with the request.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return jsonError("Too many answers submitted in a short time. Wait a minute.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const paper = paperById(clamp(body.paperId, 120));
  const question = paper?.questions.find((q) => q.id === clamp(body.questionId, 120));
  if (!paper || !question) return jsonError("Unknown paper or question.", 404);
  if (question.marking !== "assessed" || !question.criteria?.length) {
    return jsonError("That question is not marked against a rubric.", 400);
  }

  const answer = clamp(body.answer, MAX_ANSWER_CHARS);
  if (wordCount(answer) < 20) {
    return jsonError("Write a fuller answer before asking for it to be marked.", 400);
  }

  const provider = resolveProvider();

  if (provider === "offline") {
    return Response.json(
      { ...selfMarkGuide(question, answer), mode: "offline" as const },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const raw =
      provider === "anthropic"
        ? await assessWithAnthropic(question, answer)
        : await assessWithFreeTheAi(question, answer);

    if (!raw) {
      return jsonError("The examiner returned an unusable result. Try again.", 502);
    }

    return Response.json(
      { ...reconcile(question, answer, raw), mode: provider },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = describeError(error);
    return jsonError(message, status);
  }
}

/**
 * Bring the model's marks back inside the rubric.
 *
 * A criterion it invented is dropped, a criterion it skipped comes back
 * unmarked, and a mark above the maximum is clamped. The total is computed
 * here rather than taken from the model — a marked script whose parts do not
 * add up to its total is worse than no mark at all.
 */
function reconcile(question: Question, answer: string, raw: Assessment) {
  const criteria = (question.criteria ?? []).map((criterion) => {
    const marked = raw.criteria.find((c) => c.id === criterion.id);
    const awarded = marked
      ? Math.max(0, Math.min(criterion.maxMarks, Math.round(marked.awarded)))
      : 0;

    return {
      id: criterion.id,
      name: criterion.name,
      max: criterion.maxMarks,
      awarded,
      marked: Boolean(marked),
      band: marked?.band ?? "",
      reason: marked?.reason ?? "This criterion was not marked. Ask again.",
      evidence: marked?.evidence ?? "",
      next: marked?.next ?? "",
    };
  });

  // The model refers to a source however the prompt read most naturally to it
  // — "B", "Source B", "Источник B", "дереккөз B". Match on the reference
  // itself rather than on the phrasing wrapped around it.
  const sources = question.sources ?? [];
  const resolve = (list: string[]): string[] => {
    const found = new Set<string>();
    for (const entry of list) {
      const text = entry.trim().toUpperCase();
      for (const source of sources) {
        const ref = source.ref.toUpperCase();
        if (text === ref || new RegExp(`(^|[^\\p{L}])${ref}([^\\p{L}]|$)`, "u").test(text)) {
          found.add(source.ref);
        }
      }
    }
    return sources.filter((s) => found.has(s.ref)).map((s) => s.ref);
  };

  const used = resolve(raw.sourcesUsed ?? []);

  return {
    criteria,
    total: criteria.reduce((sum, c) => sum + c.awarded, 0),
    max: question.marks,
    sourcesUsed: used,
    // Whatever the model did not credit as used is ignored, by definition.
    // Taking its own "ignored" list instead would let a source fall out of
    // both lists and quietly disappear from the count the scheme cares about.
    sourcesIgnored: sources.map((s) => s.ref).filter((ref) => !used.includes(ref)),
    summary: raw.summary,
    words: wordCount(answer),
  };
}

async function assessWithAnthropic(
  question: Question,
  answer: string
): Promise<Assessment | null> {
  const client = anthropic();
  const response = await client.messages.parse({
    model: ANTHROPIC_MODEL,
    max_tokens: 6_000,
    // Marking is the one place where thinking earns its keep: the model has to
    // hold the whole script against several band descriptors at once.
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: zodOutputFormat(Assessment) },
    system: [{ type: "text", text: ASSESSOR_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: assessRequest(question, answer) }],
  });

  if (response.stop_reason === "refusal") return null;
  return response.parsed_output ?? null;
}

async function assessWithFreeTheAi(
  question: Question,
  answer: string
): Promise<Assessment | null> {
  const ids = (question.criteria ?? []).map((c) => `"${c.id}"`).join(", ");
  const shape = [
    "Reply with a single JSON object and nothing else, in exactly this shape:",
    "{",
    '  "criteria": [{ "id": string, "awarded": number, "band": string,',
    '                 "reason": string, "evidence": string, "next": string }],',
    '  "sourcesUsed": string[],',
    '  "sourcesIgnored": string[],',
    '  "summary": string',
    "}",
    `Return one entry per criterion, using exactly these ids: ${ids}.`,
    "sourcesUsed lists the references of the sources the answer genuinely used as evidence,",
    "as bare references exactly as printed (for example \"A\", not \"Source A\"). sourcesIgnored",
    "lists the rest. Both are [] when the question supplies no sources.",
  ].join("\n");

  const text = await freeTheAiComplete({
    messages: [
      { role: "system", content: `${ASSESSOR_SYSTEM}\n\n${shape}` },
      { role: "user", content: assessRequest(question, answer) },
    ],
    maxTokens: 2_400,
    // Marking should be reproducible: the same script twice should not swing a band.
    temperature: 0.2,
    json: true,
  });

  const parsed = Assessment.safeParse(extractJson(text));
  return parsed.success ? parsed.data : null;
}

/**
 * Offline: the rubric, staged for self-marking.
 *
 * No marks are invented. Awarding a number without reading the script would be
 * worse than useless on a paper whose whole point is the quality of writing,
 * so this returns the bands and the checks the student can make themselves.
 */
function selfMarkGuide(question: Question, answer: string) {
  const words = wordCount(answer);
  const criteria = (question.criteria ?? []).map((criterion) => ({
    id: criterion.id,
    name: criterion.name,
    max: criterion.maxMarks,
    awarded: 0,
    marked: false,
    band: "",
    reason: criterion.focus,
    evidence: criterion.bands
      .map((band) => `[${band.range}] ${band.descriptor}`)
      .join("\n"),
    next: "",
  }));

  const notes: string[] = [];
  if (question.minWords && words < question.minWords) {
    notes.push(
      `Your answer is ${words} words; the paper asks for at least ${question.minWords}. Length alone caps the organisation band.`
    );
  } else if (question.maxWords && words > question.maxWords) {
    notes.push(
      `Your answer is ${words} words; the paper asks for about ${question.minWords ?? 0}–${question.maxWords}.`
    );
  } else if (question.minWords || question.maxWords) {
    notes.push(`Your answer is ${words} words, which is within the length the paper asks for.`);
  }

  if (question.sources?.length) {
    const mentioned = question.sources
      .filter((source) => new RegExp(`\\b${source.ref}\\b`).test(answer))
      .map((source) => source.ref);
    notes.push(
      mentioned.length
        ? `You referred to source${mentioned.length > 1 ? "s" : ""} ${mentioned.join(", ")} by name. Naming is not using — check each one is doing evidential work.`
        : "You did not refer to any source by its reference. The mark scheme expects several to be used as evidence."
    );
  }

  notes.push(
    "Offline mode: set FREETHEAI_API_KEY or ANTHROPIC_API_KEY and the examiner marks this against the bands above."
  );

  return {
    criteria,
    total: 0,
    max: question.marks,
    sourcesUsed: [] as string[],
    sourcesIgnored: [] as string[],
    summary: notes.join(" "),
    words,
  };
}
