import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { paperById } from "@/data/exams";
import {
  clamp,
  clientIp,
  describeError,
  jsonError,
  rateLimited,
} from "@/lib/server/guard";
import {
  ANTHROPIC_MODEL,
  anthropic,
  extractJson,
  freeTheAiComplete,
  resolveProvider,
} from "@/lib/server/providers";
import { GENERATOR_SYSTEM, generateRequest } from "@/lib/tutor-prompt";
import { variantFor } from "@/lib/offline-variants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shape of a generated question. Enforced by the model through structured
 * outputs where the provider supports them, then re-checked here — a schema
 * guarantees well-formed JSON, not a mark scheme that actually adds up.
 */
const GeneratedQuestion = z.object({
  prompt: z.string(),
  topic: z.string(),
  marks: z.number(),
  answer: z.string(),
  markScheme: z.array(z.object({ text: z.string(), marks: z.number() })),
  hint: z.string(),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestion>;

/**
 * POST /api/generate
 *
 * Body: { paperId, questionId }
 * Returns one new question pitched at the same level as the source question:
 * same topic, same mark tariff, same number of reasoning steps.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return jsonError("Too many generations in a short time. Wait a minute.", 429);
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

  const provider = resolveProvider();

  if (provider === "offline") {
    return Response.json(
      { question: variantFor(question), mode: "offline" as const },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const generated =
      provider === "anthropic"
        ? await generateWithAnthropic(question, paper.title)
        : await generateWithFreeTheAi(question, paper.title);

    if (!generated) {
      return jsonError("The generator returned an unusable question. Try again.", 502);
    }

    // The schema cannot enforce arithmetic. Check the tariff ourselves and
    // report it rather than serving a question whose marks do not add up.
    const schemeTotal = generated.markScheme.reduce((sum, step) => sum + step.marks, 0);

    return Response.json(
      {
        question: {
          ...generated,
          // The tariff and topic are the point of level matching — pin them to
          // the source question rather than trusting the model to echo them.
          marks: question.marks,
          topic: question.topic,
        },
        marksConsistent: schemeTotal === question.marks,
        schemeTotal,
        mode: provider,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = describeError(error);
    return jsonError(message, status);
  }
}

async function generateWithAnthropic(
  question: NonNullable<ReturnType<typeof paperById>>["questions"][number],
  paperTitle: string
): Promise<GeneratedQuestion | null> {
  const client = anthropic();
  const response = await client.messages.parse({
    model: ANTHROPIC_MODEL,
    max_tokens: 4_000,
    // Generation is the one place worth thinking: the model has to invent
    // numbers that resolve cleanly without a calculator, then verify them.
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: zodOutputFormat(GeneratedQuestion),
    },
    system: [
      { type: "text", text: GENERATOR_SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: generateRequest(question, paperTitle) }],
  });

  if (response.stop_reason === "refusal") return null;
  return response.parsed_output ?? null;
}

async function generateWithFreeTheAi(
  question: NonNullable<ReturnType<typeof paperById>>["questions"][number],
  paperTitle: string
): Promise<GeneratedQuestion | null> {
  // The OpenAI-compatible endpoint has no typed schema binding, so the shape
  // is requested in the prompt and validated on the way back.
  const shape = [
    "Reply with a single JSON object and nothing else, in exactly this shape:",
    "{",
    '  "prompt": string,',
    '  "topic": string,',
    '  "marks": number,',
    '  "answer": string,',
    '  "markScheme": [{ "text": string, "marks": number }],',
    '  "hint": string',
    "}",
    "The markScheme marks must sum to the total marks.",
  ].join("\n");

  const text = await freeTheAiComplete({
    messages: [
      { role: "system", content: `${GENERATOR_SYSTEM}\n\n${shape}` },
      { role: "user", content: generateRequest(question, paperTitle) },
    ],
    maxTokens: 1_600,
    temperature: 0.8,
    json: true,
  });

  const parsed = GeneratedQuestion.safeParse(extractJson(text));
  return parsed.success ? parsed.data : null;
}
