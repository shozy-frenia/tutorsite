import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared hardening for the AI routes.
 *
 * The API key never leaves the server: the browser posts here, this module
 * adds the credential. Everything below is the minimum an MVP should ship
 * with — see the caveats at the bottom for what production still needs.
 */

export const MODEL = "claude-opus-5";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const MAX_MESSAGE_CHARS = 2_400;
const MAX_MESSAGES = 20;

/**
 * In-memory sliding window, keyed by IP.
 * Single-instance only and resets on restart — swap for Redis/Upstash before
 * running this on more than one node.
 */
const hits = new Map<string, number[]>();

export function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so the map cannot grow without bound.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Validate an incoming conversation. Returns an error string, or null if fine. */
export function validateMessages(value: unknown): string | null {
  if (!Array.isArray(value)) return "messages must be an array";
  if (value.length === 0) return "messages is empty";
  if (value.length > MAX_MESSAGES) return "too many messages";

  for (const message of value) {
    if (typeof message !== "object" || message === null) return "message must be an object";
    const { role, content } = message as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return "invalid role";
    if (typeof content !== "string") return "content must be a string";
    if (content.length > MAX_MESSAGE_CHARS) return "message too long";
  }
  return null;
}

/** Trim a free-text field to a safe length. */
export const clamp = (value: unknown, max: number): string =>
  typeof value === "string" ? value.slice(0, max) : "";

/** Is a credential configured? Routes degrade to offline mode when not. */
export const hasApiKey = (): boolean =>
  Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

/**
 * Build a client. The SDK resolves the credential from the environment, so
 * nothing here reads or logs the key itself.
 */
export const anthropic = (): Anthropic =>
  new Anthropic({ maxRetries: 2, timeout: 60_000 });

/** Map SDK errors onto a status + safe message. Never leaks upstream detail. */
export function describeError(error: unknown): { status: number; message: string } {
  if (error instanceof Anthropic.AuthenticationError) {
    return { status: 503, message: "The tutor is not configured. Set ANTHROPIC_API_KEY." };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return { status: 429, message: "The tutor is busy right now. Try again in a moment." };
  }
  if (error instanceof Anthropic.BadRequestError) {
    return { status: 400, message: "That request could not be processed." };
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { status: 504, message: "Could not reach the tutor. Check your connection." };
  }
  if (error instanceof Anthropic.APIError) {
    return { status: 502, message: "The tutor failed to answer. Try again." };
  }
  return { status: 500, message: "Something went wrong." };
}

export const jsonError = (message: string, status: number) =>
  Response.json({ error: message }, { status });

/*
 * Still to do before production:
 *   - authentication, so only signed-in students can call these routes
 *   - a rate limiter that survives restarts and works across instances
 *   - request logging that records outcomes without storing answer text
 *   - forced HTTPS and CSP at the edge
 */
