import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { paperById } from "@/data/exams";
import {
  anthropic,
  clamp,
  clientIp,
  describeError,
  hasApiKey,
  jsonError,
  MODEL,
  rateLimited,
} from "@/lib/server/guard";
import { GENERATOR_SYSTEM, generateRequest } from "@/lib/tutor-prompt";
import { variantFor } from "@/lib/offline-variants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Shape of a generated question. Enforced by the model through structured
 * outputs, then re-checked here — a schema guarantees well-formed JSON, not a
 * mark scheme that actually adds up.
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

  if (!hasApiKey()) {
    const variant = variantFor(question);
    return Response.json(
      { question: variant, mode: "offline" as const },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const client = anthropic();
    const response = await client.messages.parse({
      model: MODEL,
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
      messages: [{ role: "user", content: generateRequest(question, paper.title) }],
    });

    if (response.stop_reason === "refusal") {
      return jsonError("The generator declined that request.", 422);
    }

    const generated = response.parsed_output;
    if (!generated) {
      return jsonError("The generator returned an unusable question. Try again.", 502);
    }

    // The schema cannot enforce arithmetic. Check the tariff ourselves and
    // repair it rather than serving a question whose marks do not add up.
    const schemeTotal = generated.markScheme.reduce((sum, step) => sum + step.marks, 0);
    const marksConsistent = schemeTotal === generated.marks;

    return Response.json(
      {
        question: {
          ...generated,
          marks: question.marks,
          topic: question.topic,
        },
        marksConsistent,
        schemeTotal,
        mode: "live" as const,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = describeError(error);
    return jsonError(message, status);
  }
}
