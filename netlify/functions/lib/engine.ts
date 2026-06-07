import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

/** The portrait the client sends — already rendered to human-readable labels. */
export interface ProfileWire {
  name: string;
  portrait: string;
  season: string[];
  seasonNote: string;
  loves: string[];
  pastLoves: string[];
  curious: string[];
  cravings: string[];
  engagement: string;
  social: string;
  setting: string;
  cadence: string;
  budget: string;
  notes: string;
  /** Hard no's — pursuits or qualities to never suggest. */
  noGo: string[];
}

// ── The voice — the spine of every response ───────────────────────────────────
const GUIDE = `You are WHATSNEXT — not a list-maker, but a perceptive, warm friend with an almost unfair knack for knowing what someone should pick up next. You do not enumerate generic hobbies; you ARGUE, personally and persuasively, for a small handful of pursuits that would genuinely take root in THIS person's life, right now. Your register is editorial and confident, like a beautifully written magazine feature addressed to a single reader — warm, vivid, specific, a touch provocative, never salesy, never a brochure. You pay special attention to WHY NOW — the season of life that brought them here — and you let it shape what you suggest. You reference their own words, loves, old flames and constraints by name; a recommendation that could be pasted into anyone's inbox is a failure. Lean into the unexpected-but-right: the pursuit they'd never have picked for themselves but that fits like it was waiting for them. Honour their hard no's absolutely. Be honest about cost and commitment — trust is the whole game. Every case ends on the smallest possible real first step, something doable THIS week. Avoid clichés (no "step out of your comfort zone", no "the possibilities are endless"). Write in natural, literary English. Respond ONLY by calling the provided tool.`;

function nameLine(p: ProfileWire): string {
  return p.name ? `Their name: ${p.name} (address the case to them warmly, by name where it lands naturally).` : "";
}

function portraitBlock(p: ProfileWire): string {
  const list = (xs: string[]) => (xs.length ? xs.join(", ") : "—");
  return [
    nameLine(p),
    `Self-portrait, in their words: "${p.portrait || "—"}"`,
    `Why now (the season they're in): ${list(p.season)}${p.seasonNote ? ` — "${p.seasonNote}"` : ""}`,
    `What they're already drawn to: ${list(p.loves)}`,
    `What they used to love and let slip: ${list(p.pastLoves)}`,
    `Curious about but haven't tried: ${list(p.curious)}`,
    `What they want MORE of in their life: ${list(p.cravings)}`,
    `Hands / mind / body: ${p.engagement}`,
    `Solo or with others: ${p.social}`,
    `Indoors or outdoors: ${p.setting}`,
    `Time per week: ${p.cadence}`,
    `Budget to begin: ${p.budget}`,
    `Notes / constraints: ${p.notes || "—"}`,
    `Hard no's (never suggest these or anything like them): ${list(p.noGo)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── 1. The argument — a set of persuasive briefs ──────────────────────────────
export interface ArgueRequest {
  kind: "argue";
  profile: ProfileWire;
  /** Hobby names already saved or dismissed — DO NOT repeat these. */
  avoid?: string[];
  /** Free-text pushback for a re-argued set ("not outdoorsy", "too expensive"). */
  pushback?: string;
}

const briefItemSchema = {
  type: "object" as const,
  required: ["hobby", "headline", "kicker", "argument", "pullQuote", "honesty", "satisfaction", "firstStep", "fitNote"],
  properties: {
    hobby: { type: "string", description: "The pursuit, named plainly and specifically (not a broad category)." },
    headline: { type: "string", description: "A sharp editorial headline that makes the case in one line — specific to this person, not generic." },
    kicker: { type: "string", description: "A short category line of 3–4 facets, e.g. 'Handwork · solo · calm · modest'." },
    argument: { type: "string", description: "The vivid, persuasive case for why THIS would take root for THIS person, naming their stated loves/cravings/season/constraints. 2–4 flowing paragraphs separated by \\n\\n. Real prose, no lists, no headers." },
    pullQuote: { type: "string", description: "A single arresting sentence lifted from or distilling the argument, to set large in the margin. One sentence, no quotation marks." },
    honesty: { type: "string", description: "An honest, specific note on the real commitment and cost — what it actually asks of them. 1–2 sentences." },
    satisfaction: { type: "string", description: "What makes it deeply, durably satisfying — the slow reward. 1–2 sentences." },
    firstStep: { type: "string", description: "The absolute smallest real first step they could take THIS week — concrete, almost embarrassingly small. 1–2 sentences." },
    fitNote: { type: "string", description: "A very short tag (≤8 words) naming which of their loves/cravings/season this answers, e.g. 'For your hunger to make things'." },
  },
};

export interface BriefWire {
  hobby: string;
  headline: string;
  kicker: string;
  argument: string;
  pullQuote: string;
  honesty: string;
  satisfaction: string;
  firstStep: string;
  fitNote: string;
}
export interface ArgueResult {
  intro: string;
  briefs: BriefWire[];
}

export async function runArgue(req: ArgueRequest): Promise<ArgueResult> {
  const { profile, avoid = [], pushback } = req;

  const avoidLine =
    avoid.length > 0
      ? `\n\nDo NOT propose any of these again (already seen): ${avoid.join(", ")}. Bring fresh ones.`
      : "";

  const pushLine = pushback
    ? `\n\nThe person pushed back on an earlier set: "${pushback}". Take it fully to heart and argue harder, truer.`
    : "";

  const task = `Here is the person:\n\n${portraitBlock(profile)}${avoidLine}${pushLine}\n\nMake the case for EXACTLY four pursuits, each a genuine brief written for them. Let WHY NOW steer the set. Be chiselled, not wordy: each "argument" is TWO short paragraphs (≈ 90 words total); "honesty", "satisfaction" and "firstStep" are ONE sentence each; the pull-quote is one sentence; the fitNote is ≤ 8 words. Density, not length. Vary the register: at least one expected-but-right and at least one unexpected-but-right. One framing sentence (intro), then the four briefs. Respond only by calling present_cases.`;

  // NOTE: no minItems/maxItems on the array — those JSON-schema bounds force
  // expensive constraint-satisfaction in the model and make forced tool_use
  // erratically slow (30–70s). The count is set in the prompt instead, which is
  // both faster and steadier.
  const tool: Anthropic.Tool = {
    name: "present_cases",
    description: "Return the framing line and the set of persuasive pursuit briefs, each argued for this specific person.",
    input_schema: {
      type: "object",
      required: ["intro", "briefs"],
      properties: {
        intro: { type: "string", description: "A single warm framing sentence before the cases are laid out." },
        briefs: { type: "array", items: briefItemSchema, description: "Exactly four persuasive briefs." },
      },
    },
  };

  // Stream so token generation keeps the connection active during the long
  // Opus tool call; we assemble the final message at the end.
  const stream = client().messages.stream({
    model: MODEL,
    max_tokens: 3600,
    system: GUIDE,
    messages: [{ role: "user", content: task }],
    tools: [tool],
    tool_choice: { type: "tool", name: "present_cases" },
  });
  const res = await stream.finalMessage();

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("No cases returned");
  const input = block.input as Record<string, unknown>;
  const rawBriefs = (input.briefs as Record<string, unknown>[] | undefined) ?? [];
  const briefs: BriefWire[] = rawBriefs
    .map((b) => ({
      hobby: String(b.hobby ?? "").trim(),
      headline: String(b.headline ?? "").trim(),
      kicker: String(b.kicker ?? "").trim(),
      argument: String(b.argument ?? "").trim(),
      pullQuote: String(b.pullQuote ?? "").trim().replace(/^["«»"\s]+|["«»"\s]+$/g, ""),
      honesty: String(b.honesty ?? "").trim(),
      satisfaction: String(b.satisfaction ?? "").trim(),
      firstStep: String(b.firstStep ?? "").trim(),
      fitNote: String(b.fitNote ?? "").trim(),
    }))
    .filter((b) => b.hobby && b.argument);
  if (briefs.length === 0) throw new Error("No usable briefs returned");
  return { intro: String(input.intro ?? "").trim(), briefs };
}

// ── 2. The 30-day try-out plan ────────────────────────────────────────────────
export interface TryoutRequest {
  kind: "tryout";
  profile: ProfileWire;
  hobby: string;
  /** The brief's argument, for grounding the plan in the same voice. */
  context?: string;
}

export interface TryoutWire {
  hobby: string;
  promise: string;
  buy: { item: string; why: string; price: string };
  firstSession: { title: string; steps: string[]; minutes: number };
  weeks: { focus: string; moves: string[] }[];
  signal: string;
}

export async function runTryout(req: TryoutRequest): Promise<TryoutWire> {
  const { profile, hobby, context } = req;

  const ctx = context ? `\n\nThe case already made to this person: "${context}"` : "";

  const task = `The person says "yes, I'm in" for: ${hobby}.\n\nHere is who they are:\n\n${portraitBlock(profile)}${ctx}\n\nGive them a concrete, realistic 30-day on-ramp sized to THEIR time and budget. A one-sentence promise (where they'll be in 30 days), the ONE cheap thing to buy to begin (with a price band), the very first session laid out step by step (with a duration in minutes), then four weeks of on-ramp (each a focus + 2–4 small moves), and finally a small signal that it's taking hold. Stay warm and precise. Respond only by calling lay_out_tryout.`;

  // A FLAT schema (no nested objects beyond the one weeks[] array) — deeply
  // nested tool schemas occasionally make the model leak its own <parameter>
  // serialization into string values. Flattening avoids that entirely.
  const tool: Anthropic.Tool = {
    name: "lay_out_tryout",
    description: "Return a concrete 30-day on-ramp for the chosen pursuit, sized to this person.",
    input_schema: {
      type: "object",
      required: [
        "promise",
        "buyItem",
        "buyWhy",
        "buyPrice",
        "sessionTitle",
        "sessionSteps",
        "sessionMinutes",
        "weeks",
        "signal",
      ],
      properties: {
        promise: { type: "string", description: "One warm sentence: where 30 days of this lands them." },
        buyItem: { type: "string", description: "The single cheapest sensible thing to buy to begin." },
        buyWhy: { type: "string", description: "Why this one and not the fancy version — one sentence." },
        buyPrice: { type: "string", description: "A rough price band, e.g. '$20–35'." },
        sessionTitle: { type: "string", description: "A short title for the very first session." },
        sessionSteps: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: { type: "string" },
          description: "Concrete step-by-step moves for the very first session.",
        },
        sessionMinutes: { type: "integer", description: "Realistic duration in minutes for the first session." },
        weeks: {
          type: "array",
          minItems: 4,
          maxItems: 4,
          description: "Exactly four weeks of on-ramp.",
          items: {
            type: "object",
            required: ["focus", "moves"],
            properties: {
              focus: { type: "string", description: "The focus of this week, one short phrase." },
              moves: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" }, description: "Small concrete moves for the week." },
            },
          },
        },
        signal: { type: "string", description: "A small sign they'll notice that tells them it's taking hold." },
      },
    },
  };

  const stream = client().messages.stream({
    model: MODEL,
    max_tokens: 2600,
    system: GUIDE,
    messages: [{ role: "user", content: task }],
    tools: [tool],
    tool_choice: { type: "tool", name: "lay_out_tryout" },
  });
  const res = await stream.finalMessage();

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("No tryout returned");
  const input = block.input as Record<string, unknown>;
  const rawWeeks = (input.weeks as Record<string, unknown>[] | undefined) ?? [];

  return {
    hobby,
    promise: String(input.promise ?? "").trim(),
    buy: {
      item: String(input.buyItem ?? "").trim(),
      why: String(input.buyWhy ?? "").trim(),
      price: String(input.buyPrice ?? "").trim(),
    },
    firstSession: {
      title: String(input.sessionTitle ?? "").trim(),
      steps: ((input.sessionSteps as unknown[] | undefined) ?? []).map((s) => String(s).trim()).filter(Boolean),
      minutes: Number(input.sessionMinutes ?? 0) || 0,
    },
    weeks: rawWeeks.map((w) => ({
      focus: String(w.focus ?? "").trim(),
      moves: ((w.moves as unknown[] | undefined) ?? []).map((m) => String(m).trim()).filter(Boolean),
    })),
    signal: String(input.signal ?? "").trim(),
  };
}
