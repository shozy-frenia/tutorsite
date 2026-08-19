import {
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
  freeTheAiComplete,
  providerLabel,
  resolveProvider,
  type ChatTurn,
} from "@/lib/server/providers";
import { offlineAnswer } from "@/lib/server/knowledge";
import { ASSISTANT_SYSTEM } from "@/lib/tutor-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chat
 *
 * Body:    { messages: [{ role, content }, ...] }
 * Returns: { reply, mode }
 *
 * The site-wide assistant, as opposed to /api/tutor which is bound to one
 * exam question. Same provider layer: Anthropic if ANTHROPIC_API_KEY is set,
 * otherwise FreeTheAI if FREETHEAI_API_KEY (or GEMINI_API_KEY) is, otherwise
 * an offline answer built from the boundary tables and curriculum in this
 * repository.
 *
 * The key stays on the server — the browser only ever talks to this route.
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

  const invalid = validateMessages(body.messages);
  if (invalid) return jsonError(invalid, 400);

  const messages = body.messages as ChatMessage[];
  const latest = [...messages].reverse().find((m) => m.role === "user");
  if (!latest) return jsonError("No question to answer.", 400);

  const provider = resolveProvider();

  if (provider === "offline") {
    return Response.json(
      { reply: offlineAnswer(latest.content), mode: "offline" as const },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const reply =
      provider === "anthropic"
        ? await askAnthropic(messages)
        : await freeTheAiComplete({
            messages: [
              { role: "system", content: ASSISTANT_SYSTEM },
              ...messages,
            ] as ChatTurn[],
            maxTokens: 1_000,
            temperature: 0.7,
          });

    // An empty completion is a failure, not an answer — fall back to the data
    // rather than rendering a blank bubble.
    if (!reply.trim()) {
      return Response.json(
        { reply: offlineAnswer(latest.content), mode: "offline" as const },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(
      { reply, mode: providerLabel(provider) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const { status, message } = describeError(error);
    return jsonError(message, status);
  }
}

/** Claude, non-streaming: these replies are short by design. */
async function askAnthropic(messages: ChatMessage[]): Promise<string> {
  const client = anthropic();
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1_400,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system: [
      { type: "text", text: ASSISTANT_SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    messages,
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
