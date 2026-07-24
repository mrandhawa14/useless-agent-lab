# Contributing to The Useless Agents Lab

House rules for building specimens. Small lab, strong conventions.

## Voice department
- **Voice packs are the single source of truth for judge/language voices.** They live in
  [`voice/`](voice/) (judges) and [`voice/langs/`](voice/langs/) (languages).
- A specimen embeds **only the compact PROMPT-READY BLOCK** from a pack into its prompt —
  **never the whole file.** The full pack is the reference; the block is what ships.
- **When a voice pack updates, re-sync the block in every live specimen** that uses it.
  (Right now only Specimen 001 does — `agents/am-i-the-drama/`.)
- **Update the freshness tiers** in a voice pack before shipping each new specimen, so the
  slang doesn't age into cringe.

## Em dashes never ship
Users don't type em dashes, so our agents don't either. Every specimen must run the
**`scrubDashes()` post-processing pattern** (see `agents/am-i-the-drama/artifact.jsx`) over
its model output before display. The prompt *bans* dashes to steer the model; the code
*guarantees* it. Prompt bans steer, code guarantees — always ship both.

## Prompt versioning
- Each agent's prompt has a version (`v2.7`, etc.), shown on the site card and in
  `prompt.md`. Bump it when the prompt changes.
- `artifact.jsx` is the runnable source of truth; `prompt.md` is the readable mirror. If
  they drift, `artifact.jsx` wins — re-sync the mirror.
- A prompt exists in more than one body (artifact, hosted worker, GPT/Gem). When you bump a
  version, update **every** body that embeds it, or they drift.

## Where limits live
- **Rate limits, `max_tokens` caps, and spend guards belong ONLY in the hosted Worker
  proxy** (the site "Try it" tier that spends the lab's key).
- **Self-hosted and artifact builds ship uncapped** — they run on the *viewer's* own key,
  so caps are the key-holder's business, not ours to impose.

## The point
Every specimen ships with its prompt, its pipeline, and the story of what broke.
We hide nothing. We solve nothing. Proudly.
