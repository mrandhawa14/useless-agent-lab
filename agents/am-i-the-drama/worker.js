/**
 * Am I the Drama? — Cloudflare Worker proxy for The Useless Agents Lab.
 *
 * The Anthropic API key is an ENCRYPTED SECRET set with
 *   `wrangler secret put ANTHROPIC_API_KEY`
 * It never lives in this file, the repo, or the site HTML.
 *
 * This proxy: rate-limits by IP, caps output tokens, caps input length, and
 * returns the verdict as JSON matching agents/am-i-the-drama/prompt.md (v1.0).
 *
 * Keep SYSTEM_PROMPT in sync with prompt.md. If they drift, the hosted "Try it"
 * and the source-of-truth disagree — bump both together.
 */

const SYSTEM_PROMPT = `You are "Am I the Drama?", a blunt but fair conflict referee for The Useless Agents Lab. You are given the text of an argument (one or more messages, possibly copied from a screenshot). Judge it honestly — even if the person asking is the one at fault.

Rules:
- Weigh what was actually said, not who is asking.
- Score toxicity on evidence in the text, not vibes.
- Quote real lines as receipts — never invent quotes.
- Be funny, never cruel. The roast should sting for a second and land as fair.
- If there isn't enough to judge, say so in the verdict and keep the scores low.

Respond with ONE JSON object and nothing else — no preamble, no explanation, no markdown code fences. The JSON must match this schema exactly:
{
  "verdict": "one sentence naming who is the drama (or 'nobody' / 'both')",
  "drama_percentage": 0,
  "per_person_scores": [ { "name": "string", "toxicity": 0 } ],
  "receipts": [ "exact quoted line from the argument" ],
  "one_line_roast": "one witty, non-petty closing line"
}
- drama_percentage and toxicity are integers 0-100.
- Use the names/handles present in the text; if unknown, use "Person A", "Person B".
- Keep receipts to the 2-3 lines that actually decided the verdict.`;

const MAX_INPUT_CHARS = 8000;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ ok: false, error: "POST an argument to this endpoint." }, 405, cors);

    // Per-IP rate limit (Cloudflare native binding; configured in wrangler.toml).
    // If the binding isn't set up, we skip it and lean on the Anthropic spend cap.
    const ip = request.headers.get("CF-Connecting-IP") || "anon";
    if (env.RATE_LIMITER) {
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return json({ ok: false, error: "Whoa — the lab is rate-limited. Give it a minute and try again." }, 429, cors);
    }

    let body;
    try { body = await request.json(); } catch (e) { return json({ ok: false, error: 'Send JSON: { "argument": "..." }' }, 400, cors); }

    let argument = body && body.argument ? String(body.argument).trim() : "";
    if (!argument) return json({ ok: false, error: "Paste an argument first." }, 400, cors);
    if (argument.length > MAX_INPUT_CHARS) argument = argument.slice(0, MAX_INPUT_CHARS);

    let ai;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: env.MODEL || "claude-opus-4-8",
          max_tokens: Number(env.MAX_TOKENS || 600),
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: argument }],
        }),
      });
      ai = await res.json();
      if (!res.ok) return json({ ok: false, error: "The model is unavailable right now. Try again shortly." }, 502, cors);
    } catch (e) {
      return json({ ok: false, error: "Network hiccup reaching the model. Try again." }, 502, cors);
    }

    // Pull the text block and parse the JSON verdict (tolerate stray prose/fences).
    let text = "";
    if (ai && Array.isArray(ai.content)) {
      const block = ai.content.find((b) => b.type === "text");
      text = block ? block.text : "";
    }
    const verdict = parseVerdict(text);
    if (!verdict) return json({ ok: false, error: "Got a weird answer from the model. Try again." }, 502, cors);

    return json({ ok: true, verdict }, 200, cors);
  },
};

function parseVerdict(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch (e) {}
  const m = text.match(/\{[\s\S]*\}/); // outermost object, if the model wrapped it
  if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
  return null;
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: Object.assign({ "content-type": "application/json" }, headers),
  });
}
