# 🧪 Specimen 001 — Am I the Drama?

A comedy forensic analyst for interpersonal arguments. Show it a fight, get a
funny-but-fair verdict on who the drama is.

**Prompt version:** v2.7 · **Model:** Claude Sonnet

## What it does
- **3 intake modes** — paste chat **screenshots**, a **labeled transcript**, or just tell it the **story** in your own words.
- **4 judges** — Gen Z Bestie 🧢, Gen Alpha Kid 🦎, The Dad 👨, The Auntie 🍷 (each with its own texting style and read).
- **4 languages** — English, Hinglish, Punjabi, Japanese (Punjabi uses real native-speaker data).
- **Two meters** — a drama % (how much *you're* the drama) and a toxicity % (how toxic the whole thing was).
- **Named tactics** — plain-language reads (guilt-tripping, silent treatment, playing victim…), never clinical labels.
- **Deep dive** — an in-depth breakdown: timeline, per-person profiles, the turning point, an alternate universe, and a closing statement.
- **Speak-out** — hear the verdict read aloud in each judge's voice.

## Files
- `artifact.jsx` — the runnable build (React). **Source of truth.**
- `prompt.md` — the documentation mirror of the prompt (SYSTEM_PROMPT, DEEP_PROMPT, judge voices, language modes). Keep in sync with `artifact.jsx`.

## How it works
> Claude Sonnet + this prompt + this pipeline. **We hide nothing. We solve nothing.**

The judge voices and language modes are assembled from the [voice department](../../voice/)
and appended to the system prompt at runtime. Output is strict JSON, then `scrubDashes()`
strips every em dash before anything reaches you — because no self-respecting texter has
ever typed an em dash.
