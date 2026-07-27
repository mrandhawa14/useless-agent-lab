#!/usr/bin/env bash
# Scaffold a new specimen folder from the repo conventions.
# Usage: new-agent.sh <slug> <name> <kind:prompt|app> <blurb>
set -euo pipefail

slug="${1:?slug required}"
name="${2:?name required}"
kind="${3:-prompt}"
blurb="${4:-A new specimen.}"

cd "$(cd "$(dirname "$0")/.." && pwd)"
dir="agents/$slug"

if [ -e "$dir/prompt.md" ]; then
  echo "refusing to overwrite existing $dir/prompt.md" >&2
  exit 1
fi
mkdir -p "$dir"

if [ "$kind" = "app" ]; then runs="runs here as an app"; else runs="runs in the user's own AI"; fi

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

cat > "$dir/README.md" <<EOF
# $name

$blurb

Claude + this prompt + this pipeline. We hide nothing. We solve nothing.

- Prompt: see \`prompt.md\` (source of truth is the paste-ready block).
- Kind: $kind
EOF

touch "$dir/.gitkeep"
echo "scaffolded $dir"
