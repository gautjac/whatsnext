import type { Brief, BriefSet, Profile, Tryout } from "./types";
import {
  budgetLabel,
  cadenceLabel,
  cravingLabel,
  engagementLabel,
  seasonLabel,
  settingLabel,
  socialLabel,
} from "./profile";

/** The portrait rendered to human-readable labels for the model. */
interface ProfileWire {
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
  noGo: string[];
}

const clean = (xs: string[]) => xs.map((s) => s.trim()).filter(Boolean);

function toWire(p: Profile): ProfileWire {
  return {
    name: p.name.trim(),
    portrait: p.portrait.trim(),
    season: p.season.map((s) => seasonLabel(s)),
    seasonNote: p.seasonNote.trim(),
    loves: clean(p.loves),
    pastLoves: clean(p.pastLoves),
    curious: clean(p.curious),
    cravings: p.cravings.map((c) => cravingLabel(c)),
    engagement: engagementLabel(p.engagement),
    social: socialLabel(p.social),
    setting: settingLabel(p.setting),
    cadence: cadenceLabel(p.cadence),
    budget: budgetLabel(p.budget),
    notes: p.notes.trim(),
    noGo: clean(p.avoid),
  };
}

/** A stable, de-dupe-friendly id from a hobby name. */
export function slugifyHobby(hobby: string): string {
  return (
    hobby
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "hobby"
  );
}

/**
 * Functions stream NDJSON: keepalive heartbeats (bare newlines) hold the
 * connection open during the long Opus generation, then a final JSON line
 * carries the payload or { error }. We read to end-of-stream and parse the last
 * non-empty line. Plain-JSON validation errors are a single line and parse the
 * same way.
 */
async function readResult<T>(res: Response): Promise<T> {
  const raw = await res.text();
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const last = lines[lines.length - 1] ?? "";
  let parsed: { result?: T; error?: string } | null = null;
  try {
    parsed = last ? (JSON.parse(last) as { result?: T; error?: string }) : null;
  } catch {
    parsed = null;
  }
  if (!res.ok) throw new Error(parsed?.error || `Error ${res.status}`);
  if (!parsed) throw new Error("Invalid response from the server.");
  if (parsed.error) throw new Error(parsed.error);
  if (parsed.result === undefined) throw new Error("Empty response from the server.");
  return parsed.result;
}

async function post<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readResult<T>(res);
}

interface ArgueWire {
  intro: string;
  briefs: Omit<Brief, "id">[];
}

/** Make the case: a set of persuasive briefs argued for this person. */
export async function fetchArgument(
  profile: Profile,
  opts: { avoid?: string[]; pushback?: string } = {},
): Promise<BriefSet> {
  const data = await post<ArgueWire>("/api/argue", {
    kind: "argue",
    profile: toWire(profile),
    avoid: opts.avoid ?? [],
    pushback: opts.pushback,
  });
  const seen = new Set<string>();
  const briefs: Brief[] = data.briefs.map((b) => {
    let id = slugifyHobby(b.hobby);
    while (seen.has(id)) id = `${id}-x`;
    seen.add(id);
    return { ...b, id };
  });
  return { intro: data.intro, briefs };
}

/** Turn a "yes" into a concrete 30-day on-ramp. */
export async function fetchTryout(profile: Profile, hobby: string, context?: string): Promise<Tryout> {
  return post<Tryout>("/api/tryout", {
    kind: "tryout",
    profile: toWire(profile),
    hobby,
    context,
  });
}
