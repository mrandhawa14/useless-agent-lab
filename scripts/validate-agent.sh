#!/usr/bin/env bash
# Deep, manifest-driven validation for ONE agent.
# Usage: validate-agent.sh <slug>
# Hard-fails only on deterministic, network-free breakage; everything else warns.
set -uo pipefail

slug="${1:?usage: validate-agent.sh <slug>}"
cd "$(cd "$(dirname "$0")/.." && pwd)"
dir="agents/$slug"

fail=0
warns=0
S="${GITHUB_STEP_SUMMARY:-/dev/null}"
note(){ printf '%s\n' "$*"; printf '%s\n' "$*" >> "$S"; }
err(){  printf '::error::%s\n' "$*"; printf -- '- ERROR: %s\n' "$*" >> "$S"; fail=1; }
warn(){ printf '::warning::%s\n' "$*"; printf -- '- WARN: %s\n' "$*" >> "$S"; warns=$((warns+1)); }

note "## Agent: $slug"

if [ ! -d "$dir" ]; then err "no such agent directory: $dir"; exit 1; fi

man="$dir/agent.json"

# --- Back-compat: no manifest -> lightweight, never fails ---
if [ ! -f "$man" ]; then
  if [ -f "$dir/prompt.md" ]; then
    note "- ok: no manifest; prompt-only agent (basic check passed)"
  else
    warn "no agent.json and no prompt.md yet (stub / scaffold incomplete)"
  fi
  note ""
  note "**Result: PASSED** (no manifest) with ${warns} warning(s)."
  exit 0
fi

# --- Manifest present -> deep validation (needs jq) ---
if ! command -v jq >/dev/null 2>&1; then
  warn "jq not available; skipping deep manifest validation for $slug"
  exit 0
fi
if ! jq -e . "$man" >/dev/null 2>&1; then
  err "agent.json is not valid JSON"
  note ""
  note "**Result: FAILED**"
  exit 1
fi

kind=$(jq -r '.kind // "prompt"' "$man")
version=$(jq -r '.version // ""' "$man")
note "- kind: ${kind}${version:+, version ${version}}"

exists(){ # <label> <relpath>  -> ok note, or err (returns 1)
  if [ -f "$dir/$2" ]; then note "- ok: $1 -> $2"; return 0; fi
  err "declared $1 '$2' is missing"; return 1
}

# prompt
promptf=$(jq -r '.components.prompt // empty' "$man")
if [ -n "$promptf" ]; then exists "prompt" "$promptf" || true; fi

# artifact + parse-check (esbuild transform, no bundle -> catches syntax errors)
artifactf=$(jq -r '.components.artifact // empty' "$man")
if [ -n "$artifactf" ] && exists "artifact" "$artifactf"; then
  if command -v esbuild >/dev/null 2>&1; then
    if esbuild "$dir/$artifactf" --outfile=/dev/null >"/tmp/es.$$" 2>&1; then
      note "- ok: artifact parses (esbuild)"
    else
      err "artifact '$artifactf' failed to parse:"
      head -20 "/tmp/es.$$" | while IFS= read -r l; do printf '::error::    %s\n' "$l"; done
    fi
    rm -f "/tmp/es.$$"
  else
    warn "esbuild not available; skipped artifact parse-check for $artifactf"
  fi
fi

# worker (entry + config sanity)
workerentry=$(jq -r '.components.worker.entry // empty' "$man")
if [ -n "$workerentry" ]; then
  exists "worker entry" "$workerentry" || true
  wconf=$(jq -r '.components.worker.config // empty' "$man")
  if [ -n "$wconf" ] && exists "worker config" "$wconf"; then
    grep -qE '^[[:space:]]*name[[:space:]]*=' "$dir/$wconf" || warn "$wconf has no 'name ='"
    grep -qE '^[[:space:]]*main[[:space:]]*=' "$dir/$wconf" || warn "$wconf has no 'main ='"
  fi
fi

# extra configs
while IFS= read -r c; do
  [ -z "$c" ] && continue
  if [ -f "$dir/$c" ]; then note "- ok: config -> $c"; else warn "declared config '$c' missing"; fi
done < <(jq -r '.components.configs[]? // empty' "$man")

# compound pipeline: referenced sub-agents must exist
while IFS= read -r sub; do
  [ -z "$sub" ] && continue
  if [ -d "agents/$sub" ]; then note "- ok: pipeline step -> $sub"; else err "pipeline references missing agent '$sub'"; fi
done < <(jq -r '.pipeline[]? // empty' "$man")

# version drift (warn only)
if [ -n "$version" ]; then
  [ -n "$promptf" ]   && [ -f "$dir/$promptf" ]   && { grep -qF "$version" "$dir/$promptf"   || warn "version '$version' not found in $promptf (possible drift)"; }
  [ -n "$artifactf" ] && [ -f "$dir/$artifactf" ] && { grep -qF "$version" "$dir/$artifactf" || warn "version '$version' not found in $artifactf (possible drift)"; }
fi

# em dash in copy-ready prompt (warn only)
if [ -n "$promptf" ] && [ -f "$dir/$promptf" ] && grep -q '—' "$dir/$promptf"; then
  warn "$promptf contains an em dash (ships when users copy the prompt)"
fi

note ""
if [ "$fail" -ne 0 ]; then
  note "**Result: FAILED** for $slug"
  exit 1
fi
note "**Result: PASSED** for $slug with ${warns} warning(s)."
