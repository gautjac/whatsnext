import type {
  Budget,
  Cadence,
  Craving,
  Engagement,
  Profile,
  Season,
  Setting,
  Social,
} from "./types";

/** A blank portrait — the questionnaire fills it in. Nothing is presumed. */
export const EMPTY_PROFILE: Profile = {
  name: "",
  portrait: "",
  season: [],
  seasonNote: "",
  loves: [],
  pastLoves: [],
  curious: [],
  cravings: [],
  engagement: "mixed",
  social: "either",
  setting: "either",
  cadence: "evening",
  budget: "modest",
  notes: "",
  avoid: [],
};

// ── Options for the questionnaire controls ────────────────────────────────────

type Opt<T extends string> = { value: T; label: string; hint?: string };

export const SEASON_OPTS: Opt<Season>[] = [
  { value: "time", label: "More time on my hands", hint: "space has opened up" },
  { value: "rut", label: "Stuck in a rut", hint: "the days blur together" },
  { value: "change", label: "A big life change", hint: "move, job, kids grown, retirement" },
  { value: "healing", label: "Rebuilding myself", hint: "after a hard stretch" },
  { value: "curious", label: "Just plain curious", hint: "no crisis, just itch" },
  { value: "connect", label: "Want to meet people", hint: "fewer evenings alone" },
  { value: "create", label: "Need to make something", hint: "with my own hands" },
  { value: "challenge", label: "Hungry for a challenge", hint: "something to get good at" },
];

export const CADENCE_OPTS: Opt<Cadence>[] = [
  { value: "trickle", label: "A trickle", hint: "under an hour a week" },
  { value: "evening", label: "A few evenings", hint: "2–4 h a week" },
  { value: "halfday", label: "A half-day", hint: "5–8 h a week" },
  { value: "immersive", label: "I dive in", hint: "10 h and up" },
];

export const BUDGET_OPTS: Opt<Budget>[] = [
  { value: "shoestring", label: "Next to nothing", hint: "under $50" },
  { value: "modest", label: "Modest", hint: "$50–200 to start" },
  { value: "comfortable", label: "Comfortable", hint: "up to ~$500" },
  { value: "noobject", label: "No object", hint: "price isn't the limit" },
];

export const SOCIAL_OPTS: Opt<Social>[] = [
  { value: "solo", label: "Fully solo" },
  { value: "leansolo", label: "Lean solo" },
  { value: "either", label: "Either way" },
  { value: "leanpeople", label: "Lean people" },
  { value: "people", label: "With people" },
];

export const SETTING_OPTS: Opt<Setting>[] = [
  { value: "indoor", label: "Indoors" },
  { value: "leanindoor", label: "Lean indoors" },
  { value: "either", label: "Either way" },
  { value: "leanoutdoor", label: "Lean outdoors" },
  { value: "outdoor", label: "Outdoors" },
];

export const ENGAGEMENT_OPTS: Opt<Engagement>[] = [
  { value: "hands", label: "Hands", hint: "make, build, mend" },
  { value: "mind", label: "Mind", hint: "think, solve, learn" },
  { value: "body", label: "Body", hint: "move, feel" },
  { value: "mixed", label: "A mix" },
];

export const CRAVING_OPTS: Opt<Craving>[] = [
  { value: "calm", label: "Calm" },
  { value: "mastery", label: "Mastery" },
  { value: "people", label: "People" },
  { value: "making", label: "Making things" },
  { value: "wonder", label: "Wonder" },
  { value: "movement", label: "Movement" },
  { value: "beauty", label: "Beauty" },
  { value: "play", label: "Play" },
  { value: "purpose", label: "Purpose" },
  { value: "adventure", label: "Adventure" },
];

/** Gentle prompts to get a stranger started on "what pulls you". */
export const LOVE_SUGGESTIONS: string[] = [
  "music",
  "reading & words",
  "cooking & food",
  "the outdoors",
  "making & building",
  "fixing & restoring",
  "art & drawing",
  "photography",
  "games & puzzles",
  "sport & movement",
  "gardening",
  "tech & tinkering",
  "history",
  "science & nature",
  "performing",
  "writing",
  "collecting",
  "animals",
  "travel",
  "community & helping",
];

// ── Helpers to render the chosen values for the model & UI ─────────────────────

function label<T extends string>(opts: Opt<T>[], v: T): string {
  const o = opts.find((x) => x.value === v);
  return o ? o.label : v;
}

export const cadenceLabel = (v: Cadence) => label(CADENCE_OPTS, v);
export const budgetLabel = (v: Budget) => label(BUDGET_OPTS, v);
export const socialLabel = (v: Social) => label(SOCIAL_OPTS, v);
export const settingLabel = (v: Setting) => label(SETTING_OPTS, v);
export const engagementLabel = (v: Engagement) => label(ENGAGEMENT_OPTS, v);
export const cravingLabel = (v: Craving) => label(CRAVING_OPTS, v);
export const seasonLabel = (v: Season) => label(SEASON_OPTS, v);

/** Index helpers for the dial sliders (Social / Setting). */
export const SOCIAL_ORDER: Social[] = ["solo", "leansolo", "either", "leanpeople", "people"];
export const SETTING_ORDER: Setting[] = ["indoor", "leanindoor", "either", "leanoutdoor", "outdoor"];
