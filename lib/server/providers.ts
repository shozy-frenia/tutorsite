import Anthropic from "@anthropic-ai/sdk";

/**
 * Model provider layer.
 *
 * The app supports three backends and picks whichever is configured:
 *
 *   anthropic  — ANTHROPIC_API_KEY (or ANTHROPIC_AUTH_TOKEN). Uses the
 *                official SDK with claude-opus-5 and adaptive thinking.
 *   groq       — GROQ_API_KEY. OpenAI-compatible, running gpt-oss-120b.
 *                This is what the project runs on now.
 *   freetheai  — FREETHEAI_API_KEY or GEMINI_API_KEY. OpenAI-compatible,
 *                fronting Gemini. Kept as a fallback.
 *
 * With no key set the routes fall back to offline mode, which answers from the
 * question's own mark scheme rather than failing.
 *
 * Groq and FreeTheAI speak the same wire format, so they are two rows in one
 * table rather than two copies of the same fetch-and-parse code. The only
 * things that genuinely differ are the URL, the model name, and whether the
 * backend needs extra body parameters — which is what `extras` is for.
 *
 * Keys are read from the environment on the server only — locally from
 * `.env.local`, in production from the Vercel project's environment variables.
 * Never inline a key in source: this file is committed, `.env.local` is not.
 */

export type Provider = "anthropic" | "groq" | "freetheai" | "offline";

export const ANTHROPIC_MODEL = "claude-opus-5";

/** An OpenAI-compatible backend, as far as this app needs to know one. */
interface CompatBackend {
  name: "groq" | "freetheai";
  key: string;
  base: string;
  model: string;
  /** Extra body parameters this backend needs on every request. */
  extras: Record<string, unknown>;
  /**
   * Whether the backend can bind the reply to a JSON schema.
   *
   * This is not a nicety. Groq *validates* the model's JSON and rejects the
   * whole generation with a 400 `json_validate_failed` when it is malformed —
   * and gpt-oss does malform it, emitting a broken escape inside a nested
   * array often enough that the question generator failed intermittently in
   * testing. A bound schema removes the failure mode rather than retrying
   * into it.
   */
  structured: boolean;
  /**
   * Tokens to add to the caller's budget before sending.
   *
   * On a reasoning model, `max_tokens` caps reasoning *and* answer together,
   * and reasoning is spent first. gpt-oss-120b asked for 700 tokens spent 698
   * of them thinking and returned an empty string — which is indistinguishable
   * from the tutor being broken, and is exactly the fault five of twenty-six
   * pilots reported. The callers' budgets describe the answer they want, so
   * the reasoning allowance is added here rather than in four routes.
   */
  headroom: number;
}

function compatBackend(): CompatBackend | null {
  const groq = process.env.GROQ_API_KEY;
  if (groq) {
    return {
      name: "groq",
      key: groq,
      base: process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
      /**
       * Low, not off. gpt-oss reasons before answering whatever you ask, and
       * at the default effort it will happily spend a four-figure budget on
       * it. Low keeps the step-by-step quality that makes it a good tutor —
       * measured at roughly 200 reasoning tokens for a marking question —
       * without the answer being crowded out.
       */
      extras: { reasoning_effort: process.env.GROQ_REASONING_EFFORT ?? "low" },
      headroom: 1_024,
      structured: true,
    };
  }

  /**
   * The FreeTheAI credential. Two names are accepted because the same key is
   * often already deployed as GEMINI_API_KEY — the endpoint fronts Gemini, so
   * that is what people call it. FREETHEAI_API_KEY wins if both are set.
   */
  const freeTheAi = process.env.FREETHEAI_API_KEY || process.env.GEMINI_API_KEY;
  if (freeTheAi) {
    return {
      name: "freetheai",
      key: freeTheAi,
      base: process.env.FREETHEAI_BASE_URL ?? "https://api.freetheai.xyz/v1",
      model: process.env.FREETHEAI_MODEL ?? "bbl/gemini-3.5-flash",
      headroom: 0,
      extras: {},
      // Gemini-fronting endpoints vary in what they accept here, and a
      // rejected request is worse than unbound JSON that `extractJson`
      // already knows how to salvage.
      structured: false,
    };
  }

  return null;
}

export function resolveProvider(): Provider {
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) {
    return "anthropic";
  }
  return compatBackend()?.name ?? "offline";
}

/** Human-readable label for the X-Tutor-Mode response header. */
export const providerLabel = (provider: Provider): string => provider;

export const anthropic = (): Anthropic =>
  new Anthropic({ maxRetries: 2, timeout: 60_000 });

export interface ChatTurn {
  role: "system" | "user" | "assistant";
  content: string;
}

/* ========================================================================
   OpenAI-compatible backends (Groq, FreeTheAI)
   ======================================================================== */

export interface CompatOptions {
  messages: ChatTurn[];
  /**
   * Room for the answer, in tokens. The backend's reasoning allowance is
   * added on top of this — see CompatBackend.headroom.
   */
  maxTokens?: number;
  temperature?: number;
  /** Ask the endpoint for a JSON object back. */
  json?: boolean;
  /**
   * A JSON schema to bind the reply to. Used in preference to plain JSON mode
   * on backends that support it; ignored elsewhere, where `json` still asks
   * for an object and `extractJson` salvages what comes back.
   */
  schema?: { name: string; schema: Record<string, unknown> };
  signal?: AbortSignal;
}

async function callCompat(options: CompatOptions, stream: boolean) {
  const backend = compatBackend();
  if (!backend) throw new Error("No OpenAI-compatible key is set (GROQ_API_KEY or FREETHEAI_API_KEY)");

  const response = await fetch(`${backend.base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${backend.key}`,
    },
    signal: options.signal ?? AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model: backend.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: (options.maxTokens ?? 1_200) + backend.headroom,
      ...backend.extras,
      ...(stream ? { stream: true } : {}),
      ...(options.schema && backend.structured
        ? {
            response_format: {
              type: "json_schema",
              json_schema: { name: options.schema.name, strict: true, schema: options.schema.schema },
            },
          }
        : options.json
          ? { response_format: { type: "json_object" } }
          : {}),
    }),
  });

  if (!response.ok) {
    // Read the body for the server log, but never return it to the browser —
    // upstream errors can echo request detail.
    const detail = await response.text().catch(() => "");
    console.error(`${backend.name} error`, response.status, detail.slice(0, 500));
    const error = new Error(`${backend.name} responded ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response;
}

/** Single-shot completion. Returns the assistant text. */
export async function compatComplete(options: CompatOptions): Promise<string> {
  const response = await callCompat(options, false);
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
 *
 * Reading only `delta.content` also does something load-bearing on a
 * reasoning model: gpt-oss streams its chain of thought as `delta.reasoning`
 * in the same frames. Ignoring that field is what keeps the model's working
 * out of a student's chat window.
 */
export async function compatStream(
  options: CompatOptions
): Promise<ReadableStream<Uint8Array>> {
  const response = await callCompat(options, true);
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
  if (!reader) throw new Error("The tutor backend returned no body");

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
