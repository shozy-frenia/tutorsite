import Anthropic from "@anthropic-ai/sdk";

/**
 * Model provider layer.
 *
 * The app supports two backends and picks whichever is configured:
 *
 *   anthropic  — ANTHROPIC_API_KEY (or ANTHROPIC_AUTH_TOKEN). Uses the
 *                official SDK with claude-opus-5 and adaptive thinking.
 *   freetheai  — FREETHEAI_API_KEY. An OpenAI-compatible endpoint fronting
 *                Gemini, which is what this project was set up with.
 *
 * With neither key set the routes fall back to offline mode, which answers
 * from the question's own mark scheme rather than failing.
 *
 * Keys are read from the environment on the server only. Never inline a key
 * in source — this file is committed, `.env.local` is not.
 */

export type Provider = "anthropic" | "freetheai" | "offline";

export const ANTHROPIC_MODEL = "claude-opus-5";

const FREETHEAI_BASE =
  process.env.FREETHEAI_BASE_URL ?? "https://api.freetheai.xyz/v1";
const FREETHEAI_MODEL = process.env.FREETHEAI_MODEL ?? "bbl/gemini-3.5-flash";

export function resolveProvider(): Provider {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
    return "anthropic";
  }
  if (process.env.FREETHEAI_API_KEY) return "freetheai";
  return "offline";
}

/** Human-readable label for the X-Tutor-Mode response header. */
export const providerLabel = (provider: Provider): string =>
  provider === "offline" ? "offline" : provider;

export const anthropic = (): Anthropic =>
  new Anthropic({ maxRetries: 2, timeout: 60_000 });

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

/* ========================================================================
   FreeTheAI (OpenAI-compatible)
   ======================================================================== */

interface FreeTheAiOptions {
  messages: ChatTurn[];
  maxTokens?: number;
  temperature?: number;
  /** Ask the endpoint for a JSON object back. */
  json?: boolean;
  signal?: AbortSignal;
}

async function callFreeTheAi(options: FreeTheAiOptions, stream: boolean) {
  const key = process.env.FREETHEAI_API_KEY;
  if (!key) throw new Error("FREETHEAI_API_KEY is not set");

  const response = await fetch(`${FREETHEAI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    signal: options.signal ?? AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model: FREETHEAI_MODEL,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1_200,
      ...(stream ? { stream: true } : {}),
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    // Read the body for the server log, but never return it to the browser —
    // upstream errors can echo request detail.
    const detail = await response.text().catch(() => "");
    console.error("FreeTheAI error", response.status, detail.slice(0, 500));
    const error = new Error(`FreeTheAI responded ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response;
}

/** Single-shot completion. Returns the assistant text. */
export async function freeTheAiComplete(options: FreeTheAiOptions): Promise<string> {
  const response = await callFreeTheAi(options, false);
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * Streaming completion as a stream of text chunks.
 *
 * The endpoint is OpenAI-compatible, so a streamed response is server-sent
 * events carrying `choices[].delta.content`. Some deployments ignore
 * `stream: true` and answer with a plain JSON body instead, so this checks
 * the content type and handles both rather than assuming.
 */
export async function freeTheAiStream(
  options: FreeTheAiOptions
): Promise<ReadableStream<Uint8Array>> {
  const response = await callFreeTheAi(options, true);
  const encoder = new TextEncoder();
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("event-stream")) {
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("FreeTheAI returned no body");

  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE frames are separated by a blank line; a frame may span reads.
          const frames = buffer.split("\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // A partial frame — the next read completes it.
            }
          }
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
      void reader.cancel();
    },
  });
}

/**
 * Extract a JSON object from a model reply that may be wrapped in prose or a
 * fenced code block. Returns null rather than throwing on unusable output.
 */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the outermost brace pair.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
