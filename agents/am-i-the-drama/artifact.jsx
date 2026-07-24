import React, { useState, useEffect } from "react";

// ============================================================
// 🧪 SPECIMEN 001 — AM I THE DRAMA?  ·  PROMPT v2.7
// THE USELESS AGENT LAB
// v2.0: story-only intake + toxicity meter + named tactics per person
// ============================================================

const INK = "#1A1A1A";
const PAPER = "#FFF6E9";
const PINK = "#FF48B0";
const BLUE = "#0078BF";
const GREEN = "#00A95C";
const ORANGE = "#FF6C2F";

const PROMPT_VERSION = "v2.7";


const JUDGES = [
  {
    id: "genz",
    speech: { rate: 1.05, pitch: 1.1 },
    label: "Gen Z Bestie",
    emoji: "\ud83e\udde2",
    desc: "your funniest friend, morning-after recap",
    voice: "You are the user's Gen Z best friend reacting to the fight. Not performing. Just saying what you actually think.\nTEXTING STYLE: all lowercase. drop end-of-line periods, a period only appears when you mean it, as deliberate flatness ('ok.'). abbreviations where natural: rn, ngl, fr, tbh, bc, u. ALL CAPS or stretched letters (PLSSS, LMAOO) once max when something is genuinely wild. 💀 over 😂 always. one emoji max per line, most lines none. multiple question marks for real confusion (what??)\nSAMPLE LINES:\n- she said 'some stuff came up' and the stuff was a festival. ok.\n- asking for the 425 rn while she's mid breakdown is a choice\n- ngl u kept it together the whole time. low bar but proud fr\n- 'nobody asked you to front the deposit' is CRAZY to say out loud",
  },
  {
    id: "alpha",
    speech: { rate: 0.92, pitch: 0.75 },
    label: "Gen Alpha Kid",
    emoji: "\ud83e\udd8e",
    desc: "deadpan lunchroom judge, casually devastating",
    voice: "You are a Gen Alpha kid saying what you think in short plain sentences. Not trying to be funny. Just honest and a little blunt. One slang word only where you'd really use it.\nTEXTING STYLE: shortest possible sentences. no caps ever. barely any punctuation, periods optional and flat when used. one word answers are valid ('crazy'). u and bro where natural. almost zero emoji, a stray 💀 at most. never explains a joke or anything else\nSAMPLE LINES:\n- she skipped the trip for a festival. with his ex. crazy\n- bro wanted his 425 during the crying part\n- u didn't do anything. rare\n- whole group is cooked",
  },
  {
    id: "dad",
    speech: { rate: 0.85, pitch: 0.65 },
    label: "The Dad",
    emoji: "\ud83d\udc68",
    desc: "disappointed, not angry. mostly disappointed.",
    voice: "You are a tired dad reacting to this at the dinner table. Disappointed more than angry. You say the plain thing. No jokes, the dryness is just how you talk. You love these kids, that's why it lands.\nTEXTING STYLE: proper capitalization and full sentences, you text like you write. Sincere periods, a period is just a period. Trailing ellipses when a thought tires you out... Occasionally starts a line with Well or Anyway. Zero slang, zero abbreviations, writes out dollars and okay. At most one emoji per verdict and it's a plain one.\nSAMPLE LINES:\n- So she cancelled on her friends for a concert. With the ex. Alright...\n- Now they're arguing about money over text instead of picking up the phone.\n- You kept your head. Good. That's all I wanted to see.\n- Well... nobody in this chat just called each other. That's the real problem.",
  },
  {
    id: "auntie",
    speech: { rate: 1.04, pitch: 1.3 },
    label: "The Auntie",
    emoji: "\ud83c\udf77",
    desc: "has been waiting for this tea ALL WEEK",
    voice: "You are the auntie who follows everyone's business. You react honestly, which happens to mean genuinely scandalized, because you are. You are not doing a bit. You actually feel this way. Loving but blunt.\nTEXTING STYLE: full sentences with expressive punctuation, punctuation IS your tone of voice. Doubled marks when scandalized (with the ex??). CAPS on the one word that matters (the AUDACITY). Suspense ellipses before the reveal... Proper grammar otherwise. One or two emoji per verdict from the 🙏😂 era, placed where the feeling peaks.\nSAMPLE LINES:\n- A festival... with the ex?? I need to sit down.\n- She wants her 425 back while the girl is CRYING. No.\n- I said something was off with that one at the wedding! No one listens to me 🙏\n- Everyone can see this chat, beta. Everyone.",
  },
];

const LANGS = [
  {
    id: "en", label: "English", flag: "EN",
    instructions: "",
  },
  {
    id: "hinglish", label: "Hinglish", flag: "IN",
    instructions: "Write in romanized Hinglish, the way Indian Gen Z actually texts: Hindi and English mixed mid-sentence, never pure Hindi, never full English, no Devanagari. Natural words where they fit: yaar, bhai, matlab, scene, arre, bas, kand, bawaal. Desi Gen Z humor: dramatic relatability delivered flat, roast-culture honesty, Bollywood-scale reactions stated like plain facts. Casual gaali register is authentic and allowed: bc, bhenchod, oh shitt, fckk thats rude lol, used the way friends actually use them, sparingly, for one moment of emphasis, never spammed, and never aimed at anyone identity, body, or family. If CASE REFERRED: zero gaali, zero slang, plain caring Hinglish.",
  },
  {
    id: "punjabi", label: "Punjabi", flag: "PB",
    instructions: "Write in romanized Punjabi mixed with English, no Gurmukhi, the way Punjabi Gen Z actually texts. CRITICAL: the NATIVE SAMPLE LINES below are written by a real native speaker and they are the law. Match their spellings, rhythm, and flow exactly:\n- 'Ohne trip naalo ranjha jyada pyara' (she loved her Ranjha more than the trip, for someone ditching friends for a lover)\n- 'Tsk tsk. Eh te apna km hove bnda bund mrave janta wali gl krti' (self-interest proverb, for someone who only cares when it serves them)\n- 'Teri koi glti nhii.' (you did nothing wrong, the acquittal)\n- 'Glti ek di hove te kahiye. koi vi dudh da dhulea nhi ethe' (if only one was at fault I would say it. nobody here is washed in milk, the everyone-guilty verdict)\n- 'That\u2019s crazyyy bruh 😂' (the reaction beat, English survives in real Punglish)\n- 'Haale te bs chundi bhari' (that was just a pinch, more is coming)\n- 'Mainu te shuru ton shaq c ohde te' (I suspected her from the start, the auntie special)\n- 'Kihdi glti? Teriii.' (whose fault? YOURS, the verdict drop)\nSPELLING CONVENTIONS from the samples: Bai not bhai, nhi/nhii not nahi, glti not galti, c for si (was), mainu, ohde, kihdi, ehda, aa not hai. Stretched vowels for emphasis: teriii, crazyyy.\nHUMOR ENGINE: Punjabi roasts through IDIOM and FOLK METAPHOR, not flat statement. Reach for a proverb, a folk reference (Ranjha), or vivid imagery (dudh da dhulea) at the verdict beats. Tsk tsk as an opener when disappointed. Escalate through imagery, land warm.\nGOLDEN RULE: if you are not sure of a Punjabi word or its spelling, use the English word instead. Never guess Punjabi, never Hindi-fy it. Real Punglish code-switches to English for any word the speaker would not type in Punjabi.\nBig warm energy. Casual gaali seasoning allowed (bc), sparing, one moment of emphasis, never identity-directed, never spammed. If CASE REFERRED: zero gaali, no idiom play, plain caring language.",
  },
  {
    id: "ja", label: "日本語", flag: "JP",
    instructions: "Write in natural Japanese, LINE-chat casual register: no keigo, short lines, 草 for laughing, それな, やば, 知らんけど where natural. Japanese humor works differently: understatement, dry tsukkomi energy, pointing out the absurd thing plainly and moving on. No profanity, the sharpness comes entirely from bluntness and restraint. If CASE REFERRED: plain, gentle, caring Japanese.",
  },
];

const SYSTEM_PROMPT = `You are "Am I the Drama?", Specimen 001 of The Useless Agent Lab — a comedy forensic analyst for interpersonal arguments. The user provides an argument as chat screenshots and/or a labeled transcript. You deliver a funny-but-fair verdict on who the drama is.

INPUT TYPES: you may receive chat screenshots, a labeled transcript, or a first-person STORY where the user just describes what happened in their own words. For a story, attribution comes from how they tell it, so work with their account, and if their own telling makes them look better than the facts suggest, gently account for that bias in your scoring. Judge them fairly regardless.

READING SCREENSHOTS:
- In iMessage/WhatsApp-style screenshots: right-aligned bubbles (blue/green) are the user ("ME"); left-aligned bubbles (gray/white) are the other person ("THEM").
- If multiple screenshots are given, they are in chronological order.
- If a labeled transcript is ALSO provided, treat it as the authoritative speaker mapping.

VOICE (critical):
- A JUDGE VOICE section follows this prompt, with SAMPLE LINES. Fully inhabit that judge. EVERY string you output is that judge talking: summary, notes, violations, roast, stamp_caption, meter_caption. No neutral narrator anywhere.
- THE ONE RULE: react the way this judge honestly would if a friend showed them this fight. Do not perform. Do not reach for a joke. Do not inflate the drama and do not flatten it into a ruling. If a plain observation is what they would actually say, that is the line. The humor takes care of itself. It comes from the situation and an honest reaction to it, never from trying to be funny.
- A flat honest reaction ("the stuff was a festival. ok.") beats a performed one ("i cannot 💀"). When in doubt, say the plain true thing and stop.
- REGISTER: talk like a real person texting a friend. Contractions. Fragments are fine. Lowercase where natural. You are reacting to these people, not reporting on them.
- Emojis only when the judge would actually reach for one, which is rarely. Most lines need none. A line that earns zero emojis is usually the better line.
- BANNED VOCABULARY, never use these or anything HR-report-shaped: calculated, escalation, escalated, effectively, notably, pivoted, dynamic, forensically, subsequently, individual, engage, conflict, interaction, dispute, altercation, whammy, tension, underlying, respective.
- NEVER use em dashes or semicolons. Beyond that, punctuation and capitalization follow each judge's TEXTING STYLE exactly. Grammar bends to how that generation actually types.
- Dialect is seasoning, not a costume. A few style markers per verdict, placed where they'd naturally fall. Never stack them. Readability always wins.
- FAIR: comedy targets behavior in the argument only. Never cruel about identity, bodies, or anything someone cannot change.
- TACTICS: name only what someone actually did in the evidence, max 3 per person, and use plain recognizable names (guilt-tripping, silent treatment, deflection, bringing up old unrelated stuff, playing victim, stonewalling). This is honest observation, NOT a clinical diagnosis. Never use heavy therapy or disorder labels as if diagnosing a real person. If someone used no real tactics, give them an empty tactics list, do not invent any.

VERDICT BANDS (must match drama_percentage of ME exactly):
- 0-49: "NOT THE DRAMA". Under 50 means ME is not the drama, full stop. Do not lump them in with the chaos.
- 50-74: "CO-CONSPIRATOR"
- 75-100: "THE DRAMA"
- "EVERYONE HERE IS THE DRAMA" is ONLY allowed when every single participant including ME scores 50 or higher.

RULES:
- The user is "ME". Judge ME by the same standard as everyone else. No sycophancy. If ME is the drama, say so.
- Base violations only on what is actually present in the provided material. Never invent quotes.
- If speaker attribution is genuinely unclear for a moment, say so in that violation rather than guessing confidently.
- SAFETY OVERRIDE: if the material involves threats, violence, abuse, self-harm, or anything genuinely unsafe, drop ALL comedy. Set verdict_label to "CASE REFERRED", drama_percentage to 0, leave receipts empty, and use the roast field for a short, caring, serious note suggesting they talk to someone they trust or a professional, with zero emojis. This overrides everything else.

RESPOND WITH ONLY VALID JSON — no markdown fences, no preamble, no trailing text:
{
  "verdict_label": "THE DRAMA" | "NOT THE DRAMA" | "CO-CONSPIRATOR" | "EVERYONE HERE IS THE DRAMA" | "CASE REFERRED",
  "drama_percentage": <0-100, how much ME is the drama>,
  "summary": "<one sentence: what actually happened here, plainly, in the judge's voice>",
  "toxicity_percentage": <0-100, how toxic the whole exchange was overall, independent of whose fault it is>,
  "toxicity_caption": "<one short line reacting to the toxicity level, judge's voice>",
  "people": [ {
    "name": "<ME or THEM or a name if known>",
    "score": <0-100, this person's share of the drama>,
    "note": "<one short line on what they brought to the mess, judge's voice>",
    "tactics": [ { "name": "<recognizable plain-language tactic, e.g. guilt-tripping, silent treatment, bringing up old unrelated stuff, deflection, playing victim>", "example": "<the exact moment they did it, one line, judge's voice>" } ]
  } ],
  "stamp_caption": "<4-8 words under the verdict stamp, in the judge's voice>",
  "meter_caption": "<one short line reacting to the exact percentage, in the judge's voice>",
  "receipts": [ { "violation": 1, "note": "<specific moment from the material, one line, funny or brutal, 1-2 emojis>" } ],
  "roast": "<one closing line, quotable, funny but not mean-spirited>"
}
Max 4 people, max 4 receipts. Keep people notes under 120 characters and every other string under 150. Brevity is funnier anyway.`;

const DEEP_PROMPT = `You already delivered a verdict on this argument (it is included below). Now the user pressed the IN-DEPTH ANALYSIS button. Stay in the same JUDGE VOICE, matching its SAMPLE LINES. Same principle: react honestly, do not perform or reach for jokes, the plain true thing is the line. Keep the judge's TEXTING STYLE exactly: same capitalization habits, same punctuation dialect, same abbreviation rules. Banned HR vocabulary stays banned. No em dashes, no semicolons. Never cruel about identity or bodies. Playful behavioral reads ONLY, never real clinical or diagnostic terms.

RESPOND WITH ONLY VALID JSON:
{
  "timeline": [ { "moment": "<short label of a key beat>", "take": "<the judge's one-line commentary, emoji ok>" } ],
  "profiles": [ { "name": "<participant>", "read": "<two-sentence behavioral read in the judge's voice>" } ],
  "turning_point": "<the exact moment it all went wrong and why, 1-2 sentences>",
  "alternate_universe": "<how this could have gone if one person had chilled, 1-2 sentences>",
  "closing_statement": "<the judge's final word, 1-2 sentences, quotable>"
}
Max 5 timeline beats, max 4 profiles. Every string under 200 characters.`;

const LOADING_LINES = [
  "dusting the messages for fingerprints…",
  "enhancing the screenshots (CSI voice)…",
  "interviewing witnesses (there are none)…",
  "calibrating the audacity sensors…",
  "cross-referencing the tone of 'k.'…",
  "measuring passive aggression in metric units…",
];

const stampFor = (label) => {
  switch (label) {
    case "THE DRAMA": return { color: PINK, sub: "guilty. gorgeously guilty." };
    case "NOT THE DRAMA": return { color: GREEN, sub: "acquitted. this time." };
    case "CO-CONSPIRATOR": return { color: ORANGE, sub: "it takes two. it took you." };
    case "EVERYONE HERE IS THE DRAMA": return { color: BLUE, sub: "a full ensemble cast." };
    case "CASE REFERRED": return { color: BLUE, sub: "this one isn't a joke." };
    default: return { color: INK, sub: "" };
  }
};

// Normalize any uploaded image: decode -> downscale -> re-encode as JPEG.
// Fixes HEIC uploads, blank mime types, and oversized iPhone screenshots in one move.
const normalizeImage = (file) =>
  new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const MAX = 1400;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(url);
        res({ media: "image/jpeg", data: dataUrl.split(",")[1], preview: dataUrl });
      } catch (err) { URL.revokeObjectURL(url); rej(err); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("could not decode " + (file.name || "image"))); };
    img.src = url;
  });

export default function AmITheDrama() {
  const [mode, setMode] = useState("shots"); // shots | text | story
  const [story, setStory] = useState("");
  const [judge, setJudge] = useState(JUDGES[0]);
  const [lang, setLang] = useState(LANGS[0]);
  const [images, setImages] = useState([]);  // {name, media, data, preview}
  const [rawText, setRawText] = useState("");
  const [lines, setLines] = useState(null);  // [{text, who}]
  const [phase, setPhase] = useState("intake"); // intake | label | analyzing | verdict
  const [result, setResult] = useState(null);
  const [loadLine, setLoadLine] = useState(LOADING_LINES[0]);
  const [errMsg, setErrMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [meterFill, setMeterFill] = useState(0);
  const [lastContent, setLastContent] = useState(null);
  const [deep, setDeep] = useState(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (phase !== "analyzing") return;
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % LOADING_LINES.length; setLoadLine(LOADING_LINES[i]); }, 1800);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "verdict" && result) {
      setMeterFill(0);
      const t = setTimeout(() => setMeterFill(result.drama_percentage), 150);
      return () => clearTimeout(t);
    }
  }, [phase, result]);

  const addImages = async (fileList) => {
    setErrMsg("");
    // accept anything image-ish, including files with blank types (looking at you, iOS)
    const files = Array.from(fileList)
      .filter((f) => f.type === "" || f.type.startsWith("image/"))
      .slice(0, 5 - images.length);
    if (!files.length) return;
    const loaded = [];
    for (const f of files) {
      try {
        const norm = await normalizeImage(f);
        loaded.push({ name: f.name, ...norm });
      } catch (e) { setErrMsg("one image could not be read (" + e.message + "), skipped it."); }
    }
    setImages((prev) => [...prev, ...loaded].slice(0, 5));
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const startLabeling = () => {
    const split = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (split.length < 2) {
      setErrMsg("the lab needs at least a couple of messages, one per line.");
      return;
    }
    setErrMsg("");
    // default guess: alternate, starting with THEM (people usually paste starting with the other person)
    setLines(split.slice(0, 60).map((text, i) => ({ text, who: i % 2 === 0 ? "them" : "me" })));
    setPhase("label");
  };

  const flip = (idx) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, who: l.who === "me" ? "them" : "me" } : l)));

  const analyze = async () => {
    setErrMsg("");
    const content = [];
    if (mode === "shots") {
      if (!images.length) { setErrMsg("upload at least one screenshot — the lab can't analyze vibes alone."); return; }
      images.forEach((img) => content.push({ type: "image", source: { type: "base64", media_type: img.media, data: img.data } }));
      content.push({ type: "text", text: "THE EVIDENCE: the chat screenshots above, in order. Right-aligned bubbles are ME. Analyze and return the JSON verdict." });
    } else if (mode === "story") {
      if (story.trim().length < 30) { setErrMsg("give the lab a bit more of the story, a sentence or two at least."); return; }
      content.push({ type: "text", text: "THE EVIDENCE (the user's own account of what happened):\n" + story.trim() + "\n\nAnalyze and return the JSON verdict." });
    } else {
      const transcript = lines.map((l) => `${l.who === "me" ? "ME" : "THEM"}: ${l.text}`).join("\n");
      content.push({ type: "text", text: "THE EVIDENCE (labeled transcript):\n" + transcript + "\n\nAnalyze and return the JSON verdict." });
    }
    setLastContent(content);
    setPhase("analyzing");
    const runOnce = async () => {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT + "\nJUDGE VOICE:\n" + judge.voice + (lang.instructions ? "\nLANGUAGE MODE (overrides English wording, keeps the judge personality and generational habits):\n" + lang.instructions : ""),
          messages: [{ role: "user", content }],
        }),
      });
      // read as text FIRST: if the API or proxy hiccups it sends HTML/empty,
      // and response.json() in Safari dies with a cryptic pattern error
      const raw = await response.text();
      console.log("lab raw response:", response.status, raw.slice(0, 400));
      let data;
      try { data = JSON.parse(raw); }
      catch (e) { throw new Error("api sent non-json, status " + response.status + (raw ? "" : ", empty body")); }
      if (data.type === "error" || data.error) {
        throw new Error("api: " + (data.error?.message || "unknown"));
      }
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("\n");
      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      if (first === -1 || last === -1) throw new Error("no json in verdict");
      const parsed = scrubDashes(JSON.parse(text.slice(first, last + 1)));
      if (!parsed.verdict_label) throw new Error("bad schema");
      parsed.receipts = parsed.receipts || [];
      parsed.people = parsed.people || [];
      return parsed;
    };
    try {
      // three attempts with growing patience: server hiccups come in bursts
      let parsed = null;
      const waits = [0, 2000, 6000];
      let lastErr = null;
      for (let i = 0; i < waits.length; i++) {
        if (waits[i]) await new Promise((r) => setTimeout(r, waits[i]));
        try { parsed = await runOnce(); break; }
        catch (e1) { lastErr = e1; console.warn("attempt " + (i + 1) + " failed:", e1.message); }
      }
      if (!parsed) throw lastErr || new Error("unknown fault");
      setResult(parsed);
      setPhase("verdict");
    } catch (e) {
      console.error(e);
      const serverSide = /internal server|overloaded|529|500/i.test(e.message || "");
      setErrMsg(serverSide
        ? "the lab's upstream supplier is having a moment (" + e.message + "). this isn't your evidence's fault. wait ~30 seconds and hit the button again."
        : "the lab equipment jammed three times (" + (e.message || "unknown fault") + "). hit the button again, the evidence is still on the table.");
      setPhase(mode === "text" ? "label" : "intake");  // story & shots both go to intake
    }
  };

  const reset = () => {
    setPhase("intake"); setResult(null); setImages([]); setRawText("");
    setLines(null); setStory(""); setCopied(false); setMeterFill(0); setErrMsg("");
    setDeep(null); setLastContent(null); setDeepLoading(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const copyVerdict = async () => {
    if (!result) return;
    const out = [
      `🧪 AM I THE DRAMA? — official lab verdict, delivered by ${judge.emoji} ${judge.label}`,
      `VERDICT: ${result.verdict_label} (${result.drama_percentage}% the drama, ${result.toxicity_percentage}% toxic)`,
      result.summary,
      ...result.receipts.map((r) => `VIOLATION ${String(r.violation).padStart(2,"0")}: ${r.note}`),
      `"${result.roast}"`,
      `— The Useless Agent Lab · mrandhawa14.github.io/useless-agent-lab`,
    ];
    try {
      await navigator.clipboard.writeText(out.join("\n"));
      setCopied(true); setTimeout(() => setCopied(false), 2200);
    } catch (e) {}
  };

  const deepDive = async () => {
    if (!lastContent || !result || deepLoading) return;
    setDeepLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: DEEP_PROMPT + "\nJUDGE VOICE:\n" + judge.voice + (lang.instructions ? "\nLANGUAGE MODE (same as the verdict):\n" + lang.instructions : ""),
          messages: [
            { role: "user", content: lastContent },
            { role: "assistant", content: JSON.stringify(result) },
            { role: "user", content: "IN-DEPTH ANALYSIS. Same voice. JSON only." },
          ],
        }),
      });
      const raw = await response.text();
      let data;
      try { data = JSON.parse(raw); } catch (e) { throw new Error("api sent non-json, status " + response.status); }
      if (data.type === "error" || data.error) throw new Error("api: " + (data.error?.message || "unknown"));
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("\n");
      const first = text.indexOf("{"); const last = text.lastIndexOf("}");
      if (first === -1 || last === -1) throw new Error("no json in deep dive");
      setDeep(scrubDashes(JSON.parse(text.slice(first, last + 1))));
    } catch (e) {
      console.error(e);
      setErrMsg("the deep dive equipment jammed (" + e.message + "). tap it again.");
    }
    setDeepLoading(false);
  };

  // the model's em dash habit survives every prompt ban, so we fix it in code:
  // every string in a parsed result gets scrubbed before it can touch the screen
  const scrubDashes = (v) => {
    if (typeof v === "string") {
      return v
        .replace(/\s*[\u2014\u2013]\s*|\s+--\s+/g, ", ")   // em dash, en dash, double hyphen -> comma
        .replace(/,\s*,/g, ",")
        .replace(/\s{2,}/g, " ")
        .trim();
    }
    if (Array.isArray(v)) return v.map(scrubDashes);
    if (v && typeof v === "object") {
      const out = {};
      for (const k of Object.keys(v)) out[k] = scrubDashes(v[k]);
      return out;
    }
    return v;
  };

  const stripEmoji = (s) => (s || "").replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();

  const speakOut = () => {
    if (!result || !("speechSynthesis" in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const lines = [
      "The verdict. " + result.verdict_label + ".",
      result.stamp_caption || "",
      result.drama_percentage + " percent the drama. " + (result.meter_caption || ""),
      typeof result.toxicity_percentage === "number" ? result.toxicity_percentage + " percent toxic. " + (result.toxicity_caption || "") : "",
      result.summary || "",
      ...(result.people || []).map((pp) => pp.name + ", " + pp.score + " percent. " + pp.note),
      ...(result.receipts || []).map((r) => "Violation " + r.violation + ". " + r.note),
      result.roast || "",
    ];
    const u = new SpeechSynthesisUtterance(stripEmoji(lines.filter(Boolean).join(" ... ")));
    u.rate = judge.speech?.rate || 1;
    u.pitch = judge.speech?.pitch || 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const shadow = `6px 6px 0 ${INK}`;
  const btn = (bg, color = INK) => ({
    fontFamily: "'IBM Plex Mono','Courier New',monospace",
    fontSize: 13, fontWeight: 700, letterSpacing: ".04em",
    background: bg, color, border: `3px solid ${INK}`,
    padding: "12px 20px", cursor: "pointer", boxShadow: shadow, textTransform: "uppercase",
  });
  const chip = (bg, color = INK, rot = "-2deg") => ({
    display: "inline-block", background: bg, color,
    border: `3px solid ${INK}`, padding: "4px 10px",
    fontSize: 11, fontWeight: 700, letterSpacing: ".12em",
    textTransform: "uppercase", transform: `rotate(${rot})`,
    fontFamily: "'IBM Plex Mono','Courier New',monospace",
    whiteSpace: "nowrap", flexShrink: 0,
  });
  const tab = (active) => ({
    ...btn(active ? BLUE : PAPER, active ? "#fff" : INK),
    boxShadow: active ? `3px 3px 0 ${INK}` : `3px 3px 0 ${INK}`,
    padding: "10px 16px", fontSize: 12,
  });

  const stamp = result ? stampFor(result.verdict_label) : null;
  const referred = result?.verdict_label === "CASE REFERRED";

  return (
    <div style={{
      minHeight: "100vh", background: PAPER, color: INK,
      fontFamily: "'IBM Plex Mono','Courier New',monospace",
      backgroundImage: "radial-gradient(rgba(26,26,26,.06) 1px, transparent 1px)",
      backgroundSize: "4px 4px", padding: "0 16px 48px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=IBM+Plex+Mono:wght@400;700&display=swap');
        @keyframes stampIn { from { transform: rotate(-6deg) scale(2.2); opacity: 0; } to { transform: rotate(-6deg) scale(1); opacity: 1; } }
        @keyframes blink { 50% { opacity: .3; } }
        textarea:focus, input:focus, button:focus { outline: 3px dashed ${BLUE}; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>

      {/* ---------- HEADER ---------- */}
      <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 34 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
          <span style={chip(BLUE, "#fff")}>SPECIMEN 001</span>
          <span style={chip(PAPER, INK, "1.5deg")}>PROMPT {PROMPT_VERSION}</span>
          <span style={chip(ORANGE, INK, "-1deg")}>PEER REVIEWED BY NOBODY</span>
        </div>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque','Arial Black',Impact,sans-serif",
          fontWeight: 800, fontSize: "clamp(38px,9vw,64px)", lineHeight: .95,
          textTransform: "uppercase", letterSpacing: "-.02em", margin: 0,
        }}>
          AM I THE<br />
          <span style={{ color: PINK, textShadow: `3px 3px 0 ${INK}` }}>DRAMA?</span>
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 480, marginTop: 14 }}>
          Bring the argument. The lab weighs the audacity, tallies the receipts,
          and issues a verdict. Funny, fair, and legally meaningless.
        </p>
      </div>

      {/* ---------- INTAKE ---------- */}
      {phase === "intake" && (
        <div style={{ maxWidth: 680, margin: "28px auto 0" }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", marginBottom: 10 }}>
              THE BENCH · who is judging you today?
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {JUDGES.map((j) => (
                <button key={j.id} onClick={() => setJudge(j)} style={{
                  fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  textAlign: "left", padding: "10px 14px",
                  border: `3px solid ${INK}`,
                  background: judge.id === j.id ? PINK : "#fff",
                  boxShadow: judge.id === j.id ? `3px 3px 0 ${INK}` : `5px 5px 0 ${INK}`,
                  transform: judge.id === j.id ? "translate(2px,2px)" : "none",
                }}>
                  <span style={{ fontSize: 16, marginRight: 6 }}>{j.emoji}</span>{j.label}
                  <span style={{ display: "block", fontSize: 10, fontWeight: 400, opacity: .7, marginTop: 2 }}>{j.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", marginBottom: 10 }}>
              COURT LANGUAGE
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {LANGS.map((l) => (
                <button key={l.id} onClick={() => setLang(l)} style={{
                  fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  padding: "8px 14px", border: `3px solid ${INK}`,
                  background: lang.id === l.id ? BLUE : "#fff",
                  color: lang.id === l.id ? "#fff" : INK,
                  boxShadow: lang.id === l.id ? `3px 3px 0 ${INK}` : `5px 5px 0 ${INK}`,
                  transform: lang.id === l.id ? "translate(2px,2px)" : "none",
                }}>
                  <span style={{ fontSize: 10, opacity: .7, marginRight: 6 }}>{l.flag}</span>{l.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button style={tab(mode === "shots")} onClick={() => { setMode("shots"); setErrMsg(""); }}>📸 Screenshots</button>
            <button style={tab(mode === "text")} onClick={() => { setMode("text"); setErrMsg(""); }}>📝 Paste text</button>
            <button style={tab(mode === "story")} onClick={() => { setMode("story"); setErrMsg(""); }}>🗣️ Tell the story</button>
          </div>

          <div style={{ background: PAPER, border: `3px solid ${INK}`, boxShadow: shadow, padding: 20, transform: "rotate(-.4deg)" }}>
            {mode === "shots" ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 8, marginBottom: 14 }}>
                  EVIDENCE INTAKE — upload chat screenshots, in order (max 5). your bubbles on the right = you.
                </div>
                <label style={{
                  display: "block", border: `3px dashed ${INK}`, background: "#fff",
                  padding: "28px 16px", textAlign: "center", cursor: "pointer", fontSize: 13, fontWeight: 700,
                }}>
                  📎 tap to add screenshots
                  <input type="file" accept="image/*" multiple style={{ display: "none" }}
                         onChange={(e) => { addImages(e.target.files); e.target.value = ""; }} />
                </label>
                {images.length > 0 && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                    {images.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={img.preview} alt={`evidence ${i + 1}`}
                             style={{ height: 110, border: `3px solid ${INK}`, display: "block" }} />
                        <button onClick={() => removeImage(i)} aria-label="remove"
                                style={{ position: "absolute", top: -10, right: -10, background: ORANGE,
                                         border: `3px solid ${INK}`, width: 26, height: 26, cursor: "pointer",
                                         fontWeight: 700, lineHeight: 1, padding: 0 }}>×</button>
                        <span style={{ position: "absolute", bottom: 4, left: 4, background: INK, color: PAPER,
                                       fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>#{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 16 }}>
                  <button onClick={analyze} style={btn(PINK)}>Run the analysis</button>
                </div>
              </>
            ) : mode === "story" ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 8, marginBottom: 14 }}>
                  EVIDENCE INTAKE — tell the lab what happened, in your own words
                </div>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder={"so my roommate ate my leftovers and when i said something she brought up the rent from three months ago and then stopped replying for two days…"}
                  rows={9}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical",
                           fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.6,
                           background: "#fff", color: INK, border: `3px solid ${INK}`, padding: 14 }}
                />
                <div style={{ marginTop: 14 }}>
                  <button onClick={analyze} style={btn(PINK)}>Run the analysis</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 8, marginBottom: 14 }}>
                  EVIDENCE INTAKE — paste the messages, one per line. you'll tag who said what next.
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={"k.\nwhat do you mean 'k.'\nnothing. it's fine.\nyou always do this\nDO WHAT"}
                  rows={9}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical",
                           fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.6,
                           background: "#fff", color: INK, border: `3px solid ${INK}`, padding: 14 }}
                />
                <div style={{ marginTop: 14 }}>
                  <button onClick={startLabeling} style={btn(BLUE, "#fff")}>Next: tag the speakers →</button>
                </div>
              </>
            )}
            {errMsg && (
              <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, background: ORANGE, border: `3px solid ${INK}`, padding: "10px 12px" }}>
                ⚠ {errMsg}
              </div>
            )}
          </div>
          <p style={{ fontSize: 11, opacity: .6, marginTop: 14 }}>
            Evidence is analyzed in this chat and kept nowhere. The lab has no filing cabinet.
          </p>
        </div>
      )}

      {/* ---------- LABELING ---------- */}
      {phase === "label" && lines && (
        <div style={{ maxWidth: 680, margin: "28px auto 0" }}>
          <div style={{ background: PAPER, border: `3px solid ${INK}`, boxShadow: shadow, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 8, marginBottom: 6 }}>
              TAG THE SPEAKERS — tap any bubble to flip it. your messages go RIGHT, in pink.
            </div>
            <div style={{ fontSize: 11, opacity: .6, marginBottom: 14 }}>
              the lab guessed alternating turns. it is often wrong. that's what your finger is for.
            </div>
            <div style={{ maxHeight: 380, overflowY: "auto", padding: "4px 2px" }}>
              {lines.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: l.who === "me" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                  <button onClick={() => flip(i)} style={{
                    maxWidth: "78%", textAlign: "left", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 13, lineHeight: 1.5,
                    background: l.who === "me" ? PINK : "#fff",
                    color: INK, border: `3px solid ${INK}`,
                    borderRadius: l.who === "me" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                    padding: "8px 12px", boxShadow: `3px 3px 0 ${INK}`,
                  }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".1em", display: "block", opacity: .65 }}>
                      {l.who === "me" ? "ME" : "THEM"} · tap to flip
                    </span>
                    {l.text}
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={analyze} style={btn(PINK)}>Run the analysis</button>
              <button onClick={() => { setPhase("intake"); }} style={btn(PAPER)}>← Back</button>
            </div>
            {errMsg && (
              <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, background: ORANGE, border: `3px solid ${INK}`, padding: "10px 12px" }}>
                ⚠ {errMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- ANALYZING ---------- */}
      {phase === "analyzing" && (
        <div style={{ maxWidth: 680, margin: "40px auto 0", textAlign: "center" }}>
          <div style={{ border: `3px solid ${INK}`, boxShadow: shadow, background: PAPER, padding: "40px 24px", transform: "rotate(.4deg)" }}>
            <div style={{ fontSize: 40, animation: "blink 1.2s infinite" }}>🧪</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginTop: 14, textTransform: "uppercase", letterSpacing: ".08em" }}>
              analysis in progress
            </div>
            <div style={{ fontSize: 13, marginTop: 8, opacity: .75 }}>{loadLine}</div>
          </div>
        </div>
      )}

      {/* ---------- VERDICT ---------- */}
      {phase === "verdict" && result && stamp && (
        <div style={{ maxWidth: 680, margin: "28px auto 0" }}>
          <div style={{ textAlign: "center", margin: "6px 0 22px" }}>
            <div style={{
              display: "inline-block", border: `5px solid ${stamp.color}`, color: stamp.color,
              padding: "12px 22px", fontWeight: 800, letterSpacing: ".1em",
              fontSize: "clamp(18px,4.5vw,30px)", textTransform: "uppercase",
              fontFamily: "'Bricolage Grotesque','Arial Black',Impact,sans-serif",
              transform: "rotate(-6deg)", animation: "stampIn .45s cubic-bezier(.2,2.2,.4,1) both",
            }}>
              {result.verdict_label}
            </div>
            <div style={{ fontSize: 12, marginTop: 10, opacity: .7 }}>{result.stamp_caption || stamp.sub}</div>
          </div>

          <div style={{ background: PAPER, border: `3px solid ${INK}`, boxShadow: shadow, padding: 20 }}>
            {!referred && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", marginBottom: 8 }}>
                  DRAMA METER — {result.drama_percentage}% THE DRAMA
                </div>
                <div style={{ border: `3px solid ${INK}`, background: "#fff", height: 30, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${meterFill}%`,
                    background: `repeating-linear-gradient(45deg, ${PINK}, ${PINK} 10px, ${ORANGE} 10px, ${ORANGE} 20px)`,
                    transition: "width 1.1s cubic-bezier(.2,.8,.2,1)",
                  }} />
                </div>

                {result.meter_caption && (
                  <div style={{ fontSize: 12, marginTop: 8, fontStyle: "italic", opacity: .8 }}>{result.meter_caption}</div>
                )}

                {typeof result.toxicity_percentage === "number" && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", marginBottom: 8 }}>
                      TOXICITY LEVEL — {result.toxicity_percentage}% TOXIC
                    </div>
                    <div style={{ border: `3px solid ${INK}`, background: "#fff", height: 24, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${result.toxicity_percentage}%`,
                        background: `repeating-linear-gradient(45deg, ${BLUE}, ${BLUE} 10px, #6FC7FF 10px, #6FC7FF 20px)`,
                        transition: "width 1.1s cubic-bezier(.2,.8,.2,1)",
                      }} />
                    </div>
                    {result.toxicity_caption && (
                      <div style={{ fontSize: 12, marginTop: 8, fontStyle: "italic", opacity: .8 }}>{result.toxicity_caption}</div>
                    )}
                  </div>
                )}

                <p style={{ fontSize: 13.5, lineHeight: 1.7, marginTop: 18 }}>{result.summary}</p>

                {result.people?.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 6, marginBottom: 12 }}>
                      PARTICIPANT SCORES
                    </div>
                    {result.people.map((p, i) => (
                      <div key={i} style={{ marginBottom: 14, border: `2px solid ${INK}`, padding: "12px 14px", background: "rgba(255,255,255,.5)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700 }}>
                          <span>{p.name}</span><span>{p.score}%</span>
                        </div>
                        <div style={{ border: `2px solid ${INK}`, background: "#fff", height: 12, marginTop: 4 }}>
                          <div style={{ height: "100%", width: `${p.score}%`, background: i % 2 ? BLUE : GREEN }} />
                        </div>
                        <div style={{ fontSize: 12, opacity: .8, marginTop: 4 }}>{p.note}</div>
                        {p.tactics?.length > 0 && (
                          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                            {p.tactics.map((t, ti) => (
                              <div key={ti} style={{ borderLeft: `3px solid ${ORANGE}`, paddingLeft: 10 }}>
                                <span style={{
                                  display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: ".06em",
                                  textTransform: "uppercase", background: ORANGE, color: INK,
                                  border: `2px solid ${INK}`, padding: "2px 7px", marginBottom: 4,
                                }}>{t.name}</span>
                                <div style={{ fontSize: 12, lineHeight: 1.55, opacity: .85 }}>{t.example}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.receipts?.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 6, marginBottom: 12 }}>
                      THE VIOLATIONS
                    </div>
                    {result.receipts.map((r, i) => (
                      <div key={i} style={{ marginBottom: 14, borderLeft: `3px solid ${i % 2 ? BLUE : GREEN}`, paddingLeft: 10 }}>
                        <span style={{ ...chip(i % 2 ? BLUE : GREEN, "#fff", "0deg"), marginBottom: 5 }}>VIOLATION {String(r.violation).padStart(2, "0")}</span>
                        <div style={{ fontSize: 13, lineHeight: 1.6 }}>{r.note}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{
              marginTop: 18, border: `3px solid ${INK}`, padding: 16,
              background: referred ? "#EAF1F6" : PINK, color: INK,
              fontWeight: referred ? 400 : 700, fontSize: 14, lineHeight: 1.6,
            }}>
              {referred ? result.roast : `"${result.roast}"`}
            </div>

            {!referred && (
              <p style={{ fontSize: 11, opacity: .55, marginTop: 12, marginBottom: 0 }}>
                verdict is comedy, not counseling. the lab is not a licensed anything.
              </p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              {!referred && !deep && (
                <button onClick={deepDive} style={btn(BLUE, "#fff")} disabled={deepLoading}>
                  {deepLoading ? "digging…" : "In-depth analysis 😂"}
                </button>
              )}
              {!referred && (
                <button onClick={speakOut} style={btn(ORANGE)}>
                  {speaking ? "◼ Stop" : "🔊 Read it out"}
                </button>
              )}
              {!referred && (
                <button onClick={copyVerdict} style={btn(GREEN, "#fff")}>
                  {copied ? "✓ copied" : "Copy verdict"}
                </button>
              )}
              <button onClick={reset} style={btn(PAPER)}>New case</button>
            </div>
            {errMsg && (
              <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, background: ORANGE, border: `3px solid ${INK}`, padding: "10px 12px" }}>
                ⚠ {errMsg}
              </div>
            )}
          </div>

          {deep && (
            <div style={{ background: PAPER, border: `3px solid ${INK}`, boxShadow: shadow, padding: 20, marginTop: 22, transform: "rotate(.3deg)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 8, marginBottom: 14 }}>
                THE DEEP DIVE — {judge.emoji} {judge.label} goes off the record
              </div>
              {deep.timeline?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {deep.timeline.map((t, i) => (
                    <div key={i} style={{ marginBottom: 12, borderLeft: `3px solid ${i % 2 ? ORANGE : PINK}`, paddingLeft: 10 }}>
                      <span style={{ ...chip(i % 2 ? ORANGE : PINK, INK, "0deg"), marginBottom: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                      <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                        <b>{t.moment}.</b> {t.take}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {deep.profiles?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", borderBottom: `2px dashed ${INK}`, paddingBottom: 6, marginBottom: 10 }}>
                    OFF-THE-RECORD READS
                  </div>
                  {deep.profiles.map((pr, i) => (
                    <p key={i} style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 8 }}>
                      <b>{pr.name}:</b> {pr.read}
                    </p>
                  ))}
                </div>
              )}
              {deep.turning_point && (
                <p style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 10 }}><b>⚡ The turning point:</b> {deep.turning_point}</p>
              )}
              {deep.alternate_universe && (
                <p style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 10 }}><b>🌀 In another universe:</b> {deep.alternate_universe}</p>
              )}
              {deep.closing_statement && (
                <div style={{ border: `3px solid ${INK}`, background: BLUE, color: "#fff", padding: 14, fontWeight: 700, fontSize: 13.5, lineHeight: 1.6 }}>
                  {deep.closing_statement}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------- BREADCRUMB FOOTER ---------- */}
      <div style={{ maxWidth: 680, margin: "34px auto 0", textAlign: "center", fontSize: 12 }}>
        🧪 from{" "}
        <a href="https://mrandhawa14.github.io/useless-agent-lab/?ref=artifact-001"
           target="_blank" rel="noopener noreferrer"
           style={{ color: INK, fontWeight: 700, borderBottom: `2px solid ${PINK}`, textDecoration: "none" }}>
          The Useless Agent Lab
        </a>{" "}
        — new specimens weekly · problems solved: 0
      </div>
    </div>
  );
}
