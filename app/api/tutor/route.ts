import { paperById } from "@/data/exams";
import {
  clamp,
  clientIp,
  describeError,
  jsonError,
  rateLimited,
  validateMessages,
  type ChatMessage,
} from "@/lib/server/guard";
import {
  ANTHROPIC_MODEL,
  anthropic,
  freeTheAiStream,
  providerLabel,
  resolveProvider,
  type ChatTurn,
} from "@/lib/server/providers";
import { TUTOR_SYSTEM, explainRequest, questionContext } from "@/lib/tutor-prompt";
import type { Question } from "@/lib/exam-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/tutor
 *
 * Streams a tutor reply as plain text. Accepts either:
 *   { paperId, questionId, studentAnswer }        — an explanation request
 *   { paperId, questionId, messages: [...] }      — a follow-up conversation
 *
 * Uses whichever model provider is configured. With none, it answers offline
 * from the question's own mark scheme, so the workspace still teaches
 * something on a bare checkout.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return jsonError("Too many questions in a short time. Wait a minute.", 429);
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

  const studentAnswer = clamp(body.studentAnswer, 600);

  // Follow-up turns are optional; when present they must validate.
  let history: ChatMessage[] = [];
  if (body.messages !== undefined) {
    const invalid = validateMessages(body.messages);
    if (invalid) return jsonError(invalid, 400);
    history = body.messages as ChatMessage[];
  }

  const provider = resolveProvider();

  if (provider === "offline") {
    return new Response(offlineExplanation(question, studentAnswer), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Tutor-Mode": "offline",
      },
    });
  }

  const opening = explainRequest(question, studentAnswer);

  const conversation: ChatMessage[] =
    history.length > 0
      ? [
          // Re-establish the question context as the first turn so a follow-up
          // never arrives without it, then replay the conversation.
          {
            role: "user",
            content: `Context for this conversation:\n\n${questionContext(question)}`,
          },
          {
            role: "assistant",
            content:
              "Understood — I have the question and its mark scheme. What would you like to work on?",
          },
          ...history,
        ]
      : [{ role: "user", content: opening }];

  try {
    const stream =
      provider === "anthropic"
        ? await anthropicStream(conversation)
        : await freeTheAiStream({
            messages: [
              { role: "system", content: TUTOR_SYSTEM },
              ...conversation,
            ] as ChatTurn[],
            maxTokens: 1_200,
            temperature: 0.6,
          });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Tutor-Mode": providerLabel(provider),
      },
    });
  } catch (error) {
    const { status, message } = describeError(error);
    return jsonError(message, status);
  }
}

/** Claude stream, adapted to a plain-text ReadableStream. */
async function anthropicStream(
  conversation: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const client = anthropic();
  const stream = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: 2_000,
    // Adaptive thinking at low effort: these are short pedagogical replies,
    // not long-horizon reasoning, and latency is what the student feels.
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system: [
      { type: "text", text: TUTOR_SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    messages: conversation,
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "\n\nI can't help with that one. Try rephrasing it as a question about the syllabus."
            )
          );
        }
      } catch {
        controller.enqueue(
          encoder.encode("\n\n[The tutor was interrupted. Please try again.]")
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
}

/**
 * Offline explanation: the mark scheme, staged.
 *
 * This is deliberately not a fake AI reply — it is the real mark scheme, which
 * is the thing the tutor would be quoting anyway.
 */
function offlineExplanation(question: Question, studentAnswer: string): string {
  const lines: string[] = [];

  lines.push(`Question ${question.number} — ${question.topic} [${question.marks} marks]`);
  lines.push("");
  lines.push(`Where to start: ${question.hint}`);
  lines.push("");
  lines.push("How the marks are earned:");
  question.markScheme.forEach((step, i) => {
    lines.push(`  ${i + 1}. [${step.marks} mark${step.marks === 1 ? "" : "s"}] ${step.text}`);
  });
  lines.push("");
  lines.push(`Answer: ${question.answer}`);

  if (studentAnswer.trim()) {
    lines.push("");
    lines.push(
      `You wrote: ${studentAnswer.trim()} — compare it against the steps above and find the first line that differs.`
    );
  }

  lines.push("");
  lines.push(
    "(Offline mode: set ANTHROPIC_API_KEY or FREETHEAI_API_KEY to get a tutor that responds to your specific working.)"
  );

  return lines.join("\n");
}
