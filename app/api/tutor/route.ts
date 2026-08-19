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
  validateMessages,
  type ChatMessage,
} from "@/lib/server/guard";
import { TUTOR_SYSTEM, explainRequest, questionContext } from "@/lib/tutor-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/tutor
 *
 * Streams a tutor reply as plain text. Accepts either:
 *   { paperId, questionId, studentAnswer }        — an explanation request
 *   { paperId, questionId, messages: [...] }      — a follow-up conversation
 *
 * Without a configured key the route answers offline from the question's own
 * mark scheme, so the workspace still teaches something on a bare checkout.
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

  if (!hasApiKey()) {
    return new Response(offlineExplanation(question, studentAnswer), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Tutor-Mode": "offline",
      },
    });
  }

  const messages: ChatMessage[] =
    history.length > 0
      ? [
          // Re-establish the question context as the first turn so a follow-up
          // never arrives without it, then replay the conversation.
          { role: "user", content: `Context for this conversation:\n\n${questionContext(question)}` },
          {
            role: "assistant",
            content: "Understood — I have the question and its mark scheme. What would you like to work on?",
          },
          ...history,
        ]
      : [{ role: "user", content: explainRequest(question, studentAnswer) }];

  try {
    const client = anthropic();
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 2_000,
      // Adaptive thinking with low effort: these are short pedagogical replies,
      // not long-horizon reasoning, and latency is what the student feels.
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: TUTOR_SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
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

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Tutor-Mode": "live",
      },
    });
  } catch (error) {
    const { status, message } = describeError(error);
    return jsonError(message, status);
  }
}

/**
 * Offline explanation: the mark scheme, staged.
 *
 * This is deliberately not a fake AI reply — it is the real mark scheme, which
 * is the thing the tutor would be quoting anyway.
 */
function offlineExplanation(
  question: NonNullable<ReturnType<typeof paperById>>["questions"][number],
  studentAnswer: string
): string {
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
      `You wrote: ${studentAnswer.trim()} — compare it against step by step above and find the first line that differs.`
    );
  }

  lines.push("");
  lines.push(
    "(Offline mode: set ANTHROPIC_API_KEY to get a tutor that responds to your specific working.)"
  );

  return lines.join("\n");
}
