# Deploy — Am I the Drama? Worker

The Worker is the backend that runs the agent with your Anthropic key. The key
lives ONLY as a Cloudflare secret — never in this repo or the site HTML.

## Files
- `prompt.md` — the source-of-truth system prompt (v1.0)
- `worker.js` — the Cloudflare Worker proxy (rate-limit + token cap + JSON verdict)
- `wrangler.toml` — Worker config (model, limits, allowed origin). No secrets.
- `test.html` — a browser page to try the deployed Worker end-to-end

## One-time setup
```bash
npm install -g wrangler          # or use `npx wrangler ...` below
cd agents/am-i-the-drama
wrangler login                   # opens your Cloudflare account in the browser
```

## Deploy
```bash
# 1. Store your Anthropic key as an encrypted secret (paste it when prompted).
#    Get one at console.anthropic.com. It is stored on Cloudflare, not in git.
wrangler secret put ANTHROPIC_API_KEY

# 2. Ship it.
wrangler deploy
# → prints a URL like  https://am-i-the-drama.<your-subdomain>.workers.dev
```

## Then
1. **Set a hard spend cap** at console.anthropic.com → Billing → this is your real
   safety net against a runaway bill. Do this before sharing the link.
2. **Pick your model / cost** in `wrangler.toml` → `MODEL`. It defaults to
   `claude-opus-4-8` (best, priciest). For a public free tier, switch to
   `claude-haiku-4-5` (cheapest) or `claude-sonnet-5` (near-Opus, mid price),
   then `wrangler deploy` again.
3. **Try it in the browser:** open `test.html`, paste your `workers.dev` URL into
   the `WORKER_URL` line near the bottom, reload, hit **Judge it**. It's
   pre-loaded with the Cabo fixture. This is the real end-to-end test.
4. **Wire the site** (later): drop the Worker URL into the site so the in-card
   "Try it" flow can call it. (Body-2 hosted UI — next build.)

## Guardrails already in place
- API key is a Cloudflare secret, never exposed.
- Per-IP rate limit (12 req / 60s — tune in `wrangler.toml`).
- `MAX_TOKENS` caps output; input is truncated at 8,000 chars.
- CORS locked to `ALLOWED_ORIGIN` (your github.io site) — update it when you add
  a custom domain so only your site can spend your key.

## Notes
- Keep `worker.js` SYSTEM_PROMPT in sync with `prompt.md`. If you bump the prompt
  version, update both.
- If `wrangler deploy` rejects the `[[unsafe.bindings]]` rate-limit block on your
  plan, delete that block — the Worker skips rate-limiting gracefully and the
  spend cap remains your backstop.
