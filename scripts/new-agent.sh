#!/usr/bin/env bash
# Scaffold a new specimen folder from the repo conventions.
# Usage: new-agent.sh <slug> <name> <kind:prompt|app|compound> <blurb>
set -euo pipefail

slug="${1:?slug required}"
name="${2:?name required}"
kind="${3:-prompt}"
blurb="${4:-A new specimen.}"

cd "$(cd "$(dirname "$0")/.." && pwd)"
dir="agents/$slug"

if [ -e "$dir/agent.json" ]; then
  echo "refusing to overwrite existing $dir/agent.json" >&2
  exit 1
fi
mkdir -p "$dir"

case "$kind" in
  app)      runs="runs here as an app (artifact + optional worker)";;
  compound) runs="a pipeline of other specimens";;
  *)        kind="prompt"; runs="runs in the user's own AI";;
esac

# ---- prompt.md ----
cat > "$dir/prompt.md" <<EOF
# $name - PROMPT v0.1

- **Kind:** $kind ($runs)
- **Status:** draft, not yet dropped
- **Blurb:** $blurb

## SYSTEM_PROMPT
> Rabbit-hole this until it genuinely lands. The tuned version is the product,
> not the one-liner. Easy to copy, not worth rebuilding.

TODO: write the system prompt.

## PROMPT-READY BLOCK
Paste-ready copy for the site's "Copy prompt" button. No em dashes here; they
ship verbatim when a user copies the block.

\`\`\`
TODO: paste-ready prompt goes here.
\`\`\`

## Changelog
- v0.1 - scaffolded.
EOF

# ---- README.md ----
cat > "$dir/README.md" <<EOF
# $name

$blurb

Claude + this prompt + this pipeline. We hide nothing. We solve nothing.

- Prompt: see \`prompt.md\` (source of truth is the paste-ready block).
- Kind: $kind
EOF

# ---- kind-specific components + manifest fragment ----
components='"prompt": "prompt.md"'

if [ "$kind" = "app" ]; then
  # artifact stub (quoted heredoc: keep JSX literal, no shell expansion)
  cat > "$dir/artifact.jsx" <<'EOF'
import React, { useState } from "react";

// 🧪 TODO: build the artifact UI. This stub exists so CI's parse-check passes.
export default function App() {
  const [state] = useState(null);
  return <div>TODO: artifact goes here.</div>;
}
EOF
  # worker stub (quoted heredoc)
  cat > "$dir/worker.js" <<'EOF'
// 🧪 TODO: Cloudflare Worker backend for "Try it here".
// All rate limits / max_tokens / spend caps live ONLY here (the key-holder).
// The API key is a wrangler secret, never committed.
export default {
  async fetch(request, env) {
    return new Response("TODO: worker not implemented", { status: 501 });
  },
};
EOF
  # wrangler config (unquoted heredoc so $slug expands)
  cat > "$dir/wrangler.toml" <<EOF
name = "$slug"
main = "worker.js"
compatibility_date = "2024-11-01"

# Public, non-secret config. Set the API key once with:
#   wrangler secret put ANTHROPIC_API_KEY
[vars]
MODEL = "claude-haiku-4-5"
MAX_TOKENS = "600"
ALLOWED_ORIGIN = "https://mrandhawa14.github.io"
EOF
  components='"prompt": "prompt.md",
    "artifact": "artifact.jsx",
    "worker": { "entry": "worker.js", "config": "wrangler.toml", "deploy": false }'
fi

# ---- agent.json manifest ----
cat > "$dir/agent.json" <<EOF
{
  "slug": "$slug",
  "name": "$name",
  "kind": "$kind",
  "version": "0.1",
  "components": {
    $components
  },
  "pipeline": []
}
EOF

touch "$dir/.gitkeep"
echo "scaffolded $dir ($kind)"
