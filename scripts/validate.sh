#!/usr/bin/env bash
# Drop validation for The Useless Agents Lab.
# Philosophy: hard-fail ONLY on things that would break or mis-wire the live
# site. Everything else is a warning, so a launch is never blocked by a nit.
set -uo pipefail

cd "$(cd "$(dirname "$0")/.." && pwd)"

fail=0
warns=0
S="${GITHUB_STEP_SUMMARY:-/dev/null}"
note(){ printf '%s\n' "$*"; printf '%s\n' "$*" >> "$S"; }
err(){  printf '::error::%s\n' "$*"; printf -- '- ERROR: %s\n' "$*" >> "$S"; fail=1; }
warn(){ printf '::warning::%s\n' "$*"; printf -- '- WARN: %s\n' "$*" >> "$S"; warns=$((warns+1)); }

note "## Drop validation"

# 1) Entry point must render.
if [ -s index.html ]; then
  note "- ok: index.html present ($(wc -c < index.html | tr -d ' ') bytes)"
else
  err "index.html is missing or empty; the site would not render."
fi

# 2) SITE config VALUES must be wired. The codebase sentinel for an unwired
#    value is the literal YOUR_USERNAME, so flag it only when it appears as a
#    quoted value (key: "...YOUR_USERNAME..."), never in guard code or comments.
ph_pat=$': *["\x27][^"\x27]*YOUR_USERNAME'
if grep -nE "$ph_pat" index.html > /tmp/ph 2>/dev/null; then
  err "index.html has SITE config value(s) left as the YOUR_USERNAME placeholder:"
  while IFS= read -r l; do printf '::error::  %s\n' "$l"; done < /tmp/ph
else
  note "- ok: SITE config values are wired (no YOUR_USERNAME placeholders)"
fi

# 3) Each agent folder that has real content should carry a prompt.md.
for d in agents/*/; do
  [ -d "$d" ] || continue
  slug="$(basename "$d")"
  if [ -f "${d}prompt.md" ]; then
    note "- ok: agent '$slug' has prompt.md"
  else
    warn "agent '$slug' has no prompt.md yet (scaffold incomplete)."
  fi
done

# 4) Copy-ready prompts should not ship em dashes (users paste these verbatim).
for f in agents/*/prompt.md; do
  [ -f "$f" ] || continue
  if grep -q '—' "$f"; then
    warn "$f contains an em dash; it ships when users copy the prompt (see CONTRIBUTING scrubDashes rule)."
  fi
done

note ""
if [ "$fail" -ne 0 ]; then
  note "**Result: FAILED** - fix the errors above before this can deploy."
  exit 1
fi
note "**Result: PASSED** with ${warns} warning(s)."
