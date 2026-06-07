// ── The portrait (what the questionnaire builds) ─────────────────────────────

export type Cadence = "trickle" | "evening" | "halfday" | "immersive";
export type Budget = "shoestring" | "modest" | "comfortable" | "noobject";
export type Social = "solo" | "leansolo" | "either" | "leanpeople" | "people";
export type Setting = "indoor" | "leanindoor" | "either" | "leanoutdoor" | "outdoor";
export type Engagement = "hands" | "mind" | "body" | "mixed";

/** What the person wants MORE of — the deeper why. Multi-select. */
export type Craving =
  | "calm"
  | "mastery"
  | "people"
  | "making"
  | "wonder"
  | "movement"
  | "beauty"
  | "play"
  | "purpose"
  | "adventure";

/** Why now — the season of life prompting the search. Multi-select. */
export type Season =
  | "time"
  | "rut"
  | "change"
  | "healing"
  | "curious"
  | "connect"
  | "create"
  | "challenge";

/** The full portrait, assembled by the questionnaire. Starts empty. */
export interface Profile {
  /** What to call them (optional). */
  name: string;
  /** A free, warm self-description in their own words. */
  portrait: string;
  /** Why they're thinking about this now — the season they're in. */
  season: Season[];
  /** An optional free note on the "why now". */
  seasonNote: string;
  /** Things they're already drawn to (chips + free text). */
  loves: string[];
  /** Things they used to love and drifted from. */
  pastLoves: string[];
  /** Things they're curious about but haven't tried. */
  curious: string[];
  /** What they want MORE of in their life. */
  cravings: Craving[];
  /** Hands / mind / body / mixed. */
  engagement: Engagement;
  /** Solo ↔ social leaning. */
  social: Social;
  /** Indoor ↔ outdoor leaning. */
  setting: Setting;
  /** Roughly how much time per week, as a cadence band. */
  cadence: Cadence;
  /** What they can comfortably spend to begin. */
  budget: Budget;
  /** Constraints or anything else worth knowing. */
  notes: string;
  /** Hard no's — things to never suggest. */
  avoid: string[];
}

// ── The argument (a persuasive brief, written for THIS person) ────────────────

export interface Brief {
  /** Stable id derived from the pursuit name (for de-dupe across re-runs). */
  id: string;
  /** The pursuit, named plainly (e.g. "Hand bookbinding"). */
  hobby: string;
  /** A sharp editorial headline making the case. */
  headline: string;
  /** A short kicker/category line (e.g. "Handwork · solo · calm · modest"). */
  kicker: string;
  /** The vivid, specific case — why it would hook THEM. 2–4 paragraphs. */
  argument: string;
  /** A real pull-quote lifted from the case, set large in the margin. */
  pullQuote: string;
  /** An honest note on commitment and cost. */
  honesty: string;
  /** What makes it deeply, durably satisfying. */
  satisfaction: string;
  /** The absolute smallest first step they could take THIS week. */
  firstStep: string;
  /** A tiny tag of why it fits (echoes a stated love/craving). */
  fitNote: string;
}

export interface BriefSet {
  /** A one-line framing before the cases are laid out. */
  intro: string;
  briefs: Brief[];
}

// ── The 30-day try-out plan ───────────────────────────────────────────────────

export interface TryoutWeek {
  /** "Week 1" style label is built client-side; this is the focus. */
  focus: string;
  /** 2–4 concrete little moves for the week. */
  moves: string[];
}

export interface Tryout {
  hobby: string;
  /** A warm one-line promise of where 30 days lands them. */
  promise: string;
  /** The ONE cheap thing to buy to begin, with a rough price band. */
  buy: { item: string; why: string; price: string };
  /** The very first session, laid out step by step. */
  firstSession: { title: string; steps: string[]; minutes: number };
  /** Four weeks of on-ramp. */
  weeks: TryoutWeek[];
  /** A small sign that it's taking hold — how they'll know it's working. */
  signal: string;
}

// ── Persistence (Dexie) ───────────────────────────────────────────────────────

/** A saved brief the user said "I'm in" to. */
export interface SavedRecord {
  id?: number;
  briefId: string;
  hobby: string;
  brief: Brief;
  /** "what I took from it" — the user's own reflection. */
  reflection: string;
  /** A try-out plan, once generated. */
  tryout?: Tryout;
  savedAt: number;
}

/** A brief the user dismissed — so re-runs don't repeat it. */
export interface DismissedRecord {
  id?: number;
  briefId: string;
  hobby: string;
  dismissedAt: number;
}

export interface ProfileRecord {
  id?: number;
  profile: Profile;
  onboarded: boolean;
  updatedAt: number;
}
