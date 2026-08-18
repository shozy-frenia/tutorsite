/**
 * tutor-api-example.js
 * The server route the landing page talks to. Two versions below.
 *
 * The point of this file: the browser must never see your API key.
 * The page posts to /api/tutor, this route adds the key and calls the model.
 *
 * Checklist covered here
 *   key stays server side, read from an environment variable
 *   input validated for type, length and message count
 *   simple in-memory rate limit per IP (swap for Redis or Upstash in production)
 *   request timeout so a hung upstream call cannot hold a connection open
 *   system prompt pins the assistant to the MESK syllabus
 *   no user input is ever interpolated into a shell command or a SQL string
 *
 * Still yours to do
 *   auth, so only signed-in students can call this
 *   a real rate limiter that survives a restart and works across instances
 *   logging without storing the full text of student answers
 *   security headers and forced HTTPS at the edge or in next.config
 */

// ===========================================================================
// VERSION A. Next.js App Router. Put this at app/api/tutor/route.js
// ===========================================================================

const MODEL = "claude-sonnet-4-6";
const MAX_CHARS = 600;
const MAX_MESSAGES = 20;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

const SYSTEM_PROMPT = [
  "You are a tutor for the Cambridge International Examination sat at Nazarbayev",
  "Intellectual Schools in Kazakhstan, known locally as MESK, for grades 10 and 12.",
  "Subjects: Mathematics, English, First Language, Second Language, Sciences.",
  "",
  "Rules:",
  "1. Start from the single step the student missed. Do not give the full solution",
  "   unless they ask for it twice.",
  "2. Quote the mark scheme wording that earns each mark when marking written work.",
  "3. Always finish with one similar question for them to try.",
  "4. Answer in the language the student wrote in: Kazakh, Russian or English.",
  "5. If a question is outside the syllabus, say so in one line and redirect.",
  "6. Never write a full essay for the student to submit as their own."
].join("\n");

const hits = new Map(); // ip -> array of timestamps. Replace in production.

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function validate(body) {
  if (!body || !Array.isArray(body.messages)) return "messages must be an array";
  if (body.messages.length === 0) return "messages is empty";
  if (body.messages.length > MAX_MESSAGES) return "too many messages";
  for (const m of body.messages) {
    if (m.role !== "user" && m.role !== "assistant") return "bad role";
    if (typeof m.content !== "string") return "content must be a string";
    if (m.content.length > MAX_CHARS * 4) return "message too long";
  }
  return null;
}

export async function POST(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

  if (rateLimited(ip)) {
    return Response.json(
      { error: "Too many questions in a short time. Wait a minute." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const problem = validate(body);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  const subject = typeof body.subject === "string" ? body.subject.slice(0, 40) : "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The key lives in the environment, never in the client bundle.
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: subject
          ? `${SYSTEM_PROMPT}\n\nCurrent subject context: ${subject}.`
          : SYSTEM_PROMPT,
        messages: body.messages.map((m) => ({
          role: m.role,
          content: m.content.slice(0, MAX_CHARS * 4)
        }))
      }),
      signal: controller.signal
    });

    if (!upstream.ok) {
      // Log the detail server side, return something generic to the browser.
      console.error("tutor upstream error", upstream.status);
      return Response.json(
        { error: "The tutor is unavailable. Try again shortly." },
        { status: 502 }
      );
    }

    const data = await upstream.json();
    const reply = (data.content || [])
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!reply) {
      return Response.json({ error: "Empty reply from the model" }, { status: 502 });
    }

    // The landing page reads data.reply.
    return Response.json({ reply });
  } catch (err) {
    const timedOut = err.name === "AbortError";
    console.error("tutor route error", err);
    return Response.json(
      { error: timedOut ? "The tutor timed out." : "Request failed." },
      { status: timedOut ? 504 : 500 }
    );
  } finally {
    clearTimeout(timer);
  }
}

// ===========================================================================
// VERSION B. Plain Express, if you are not on Next.js.
// Run with: ANTHROPIC_API_KEY=sk-... node tutor-api-example.js
// ===========================================================================
/*
import express from "express";
const app = express();
app.use(express.json({ limit: "32kb" }));

app.post("/api/tutor", async (req, res) => {
  const ip = req.ip;
  if (rateLimited(ip)) return res.status(429).json({ error: "Slow down." });

  const problem = validate(req.body);
  if (problem) return res.status(400).json({ error: problem });

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: SYSTEM_PROMPT,
        messages: req.body.messages
      })
    });
    const data = await upstream.json();
    const reply = (data.content || []).map((b) => b.text || "").join("\n").trim();
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Request failed." });
  }
});

app.listen(3000);
*/
