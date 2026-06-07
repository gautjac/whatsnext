import Dexie, { type Table } from "dexie";
import type { Brief, DismissedRecord, Profile, ProfileRecord, SavedRecord, Tryout } from "./types";
import { EMPTY_PROFILE } from "./profile";

class WhatsNextDB extends Dexie {
  profile!: Table<ProfileRecord, number>;
  saved!: Table<SavedRecord, number>;
  dismissed!: Table<DismissedRecord, number>;

  constructor() {
    super("whatsnext");
    this.version(1).stores({
      profile: "++id",
      saved: "++id, &briefId, savedAt",
      dismissed: "++id, &briefId, dismissedAt",
    });
  }
}

export const db = new WhatsNextDB();

// ── Profile ───────────────────────────────────────────────────────────────────
const DEFAULT_RECORD = (): ProfileRecord => ({
  profile: { ...EMPTY_PROFILE },
  onboarded: false,
  updatedAt: Date.now(),
});

/** Read-only — safe inside useLiveQuery. Returns the row or a blank default. */
export async function readProfileRecord(): Promise<ProfileRecord> {
  const existing = await db.profile.toCollection().first();
  return existing ?? DEFAULT_RECORD();
}

/** Write — call once at app boot, never inside a live query. */
export async function ensureProfile(): Promise<ProfileRecord> {
  const existing = await db.profile.toCollection().first();
  if (existing) return existing;
  const rec = DEFAULT_RECORD();
  const id = await db.profile.add(rec);
  return { ...rec, id };
}

export async function saveProfile(profile: Profile, onboarded?: boolean): Promise<void> {
  const rec = await ensureProfile();
  await db.profile.update(rec.id!, {
    profile,
    updatedAt: Date.now(),
    ...(onboarded === undefined ? {} : { onboarded }),
  });
}

export async function setOnboarded(onboarded: boolean): Promise<void> {
  const rec = await ensureProfile();
  await db.profile.update(rec.id!, { onboarded });
}

// ── Saved briefs ("I'm in") ───────────────────────────────────────────────────
export async function saveBrief(brief: Brief): Promise<void> {
  const existing = await db.saved.where("briefId").equals(brief.id).first();
  if (existing) {
    await db.saved.update(existing.id!, { brief, hobby: brief.hobby });
    return;
  }
  await db.saved.add({
    briefId: brief.id,
    hobby: brief.hobby,
    brief,
    reflection: "",
    savedAt: Date.now(),
  });
  // If it had been dismissed, un-dismiss it.
  const dis = await db.dismissed.where("briefId").equals(brief.id).first();
  if (dis) await db.dismissed.delete(dis.id!);
}

export async function unsaveBrief(briefId: string): Promise<void> {
  const existing = await db.saved.where("briefId").equals(briefId).first();
  if (existing) await db.saved.delete(existing.id!);
}

export async function isSaved(briefId: string): Promise<boolean> {
  return !!(await db.saved.where("briefId").equals(briefId).first());
}

export async function setReflection(briefId: string, reflection: string): Promise<void> {
  const existing = await db.saved.where("briefId").equals(briefId).first();
  if (existing) await db.saved.update(existing.id!, { reflection });
}

export async function attachTryout(briefId: string, tryout: Tryout): Promise<void> {
  const existing = await db.saved.where("briefId").equals(briefId).first();
  if (existing) await db.saved.update(existing.id!, { tryout });
}

// ── Dismissed briefs (so re-runs don't repeat them) ───────────────────────────
export async function dismissBrief(brief: Brief): Promise<void> {
  const existing = await db.dismissed.where("briefId").equals(brief.id).first();
  if (existing) return;
  await db.dismissed.add({ briefId: brief.id, hobby: brief.hobby, dismissedAt: Date.now() });
}

export async function undismissBrief(briefId: string): Promise<void> {
  const existing = await db.dismissed.where("briefId").equals(briefId).first();
  if (existing) await db.dismissed.delete(existing.id!);
}

export async function listAvoid(): Promise<string[]> {
  const [saved, dismissed] = await Promise.all([db.saved.toArray(), db.dismissed.toArray()]);
  const names = new Set<string>();
  for (const s of saved) names.add(s.hobby);
  for (const d of dismissed) names.add(d.hobby);
  return [...names];
}
