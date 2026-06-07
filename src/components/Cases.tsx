import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Brief, Profile, Tryout } from "../types";
import { fetchArgument, fetchTryout } from "../api";
import { attachTryout, db, dismissBrief, listAvoid, saveBrief, saveProfile } from "../db";
import {
  budgetLabel,
  cadenceLabel,
  cravingLabel,
  engagementLabel,
  settingLabel,
  socialLabel,
} from "../profile";
import { CaseCard } from "./CaseCard";
import { Questionnaire } from "./Questionnaire";
import { TryoutView } from "./TryoutView";
import { GhostBtn, HorizonRule, Notice, PrimaryBtn, Thinking } from "./bits";

// A compact, glanceable read of the current portrait.
function PortraitBar({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  const facets = [
    cadenceLabel(profile.cadence),
    budgetLabel(profile.budget),
    socialLabel(profile.social),
    settingLabel(profile.setting),
    engagementLabel(profile.engagement),
    ...profile.cravings.map((c) => cravingLabel(c)),
  ];
  return (
    <div className="paper-fill rounded-2xl border border-paper-edge p-5 shadow-paper">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pine">
          {profile.name ? `${profile.name}’s portrait` : "Your portrait"}
        </p>
        <button
          onClick={onEdit}
          className="ring-pine shrink-0 text-sm font-semibold text-pine underline-offset-2 hover:underline"
        >
          Adjust
        </button>
      </div>
      {profile.portrait && (
        <p className="mt-2 line-clamp-3 font-display text-[15px] italic leading-relaxed text-ink-soft">
          {profile.portrait}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {facets.map((f, i) => (
          <span
            key={`${f}-${i}`}
            className="rounded-sm border border-paper-edge bg-paper/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-soft"
          >
            {f}
          </span>
        ))}
      </div>
      {profile.loves.length > 0 && (
        <p className="mt-2.5 text-[13px] text-ink-faint">
          <span className="font-semibold text-ink-soft">Loves:</span> {profile.loves.join(" · ")}
        </p>
      )}
    </div>
  );
}

export function Cases({
  profile,
  onProfileChange,
}: {
  profile: Profile;
  onProfileChange: (p: Profile) => void;
}) {
  const [intro, setIntro] = useState("");
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [editing, setEditing] = useState(false);

  // Pushback ("argue harder")
  const [pushOpen, setPushOpen] = useState(false);
  const [pushText, setPushText] = useState("");

  // Tryout modal state
  const [tryoutFor, setTryoutFor] = useState<Brief | null>(null);
  const [tryout, setTryout] = useState<Tryout | undefined>();
  const [tryoutLoading, setTryoutLoading] = useState(false);
  const [tryoutError, setTryoutError] = useState<string | undefined>();

  const ranOnce = useRef(false);

  // Live view of saved/dismissed for badge state on cards.
  const savedRows = useLiveQuery(() => db.saved.toArray(), [], []);
  const dismissedRows = useLiveQuery(() => db.dismissed.toArray(), [], []);
  const savedIds = useMemo(() => new Set((savedRows ?? []).map((r) => r.briefId)), [savedRows]);
  const dismissedIds = useMemo(() => new Set((dismissedRows ?? []).map((r) => r.briefId)), [dismissedRows]);
  const tryoutByBrief = useMemo(() => {
    const m = new Map<string, Tryout>();
    for (const r of savedRows ?? []) if (r.tryout) m.set(r.briefId, r.tryout);
    return m;
  }, [savedRows]);

  const runArgument = async (opts: { pushback?: string } = {}) => {
    setLoading(true);
    setError(undefined);
    setPushOpen(false);
    try {
      const avoid = await listAvoid();
      const set = await fetchArgument(profile, { avoid, pushback: opts.pushback });
      setIntro(set.intro);
      setBriefs(set.briefs);
      setPushText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  // Auto-run once on first mount (the questionnaire has just produced a profile).
  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    void runArgument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveProfile = async (p: Profile) => {
    setEditing(false);
    onProfileChange(p);
    await saveProfile(p);
    // A fresh portrait deserves a fresh argument.
    setBriefs([]);
    setIntro("");
    await runArgument();
  };

  const openTryout = async (brief: Brief) => {
    setTryoutFor(brief);
    setTryoutError(undefined);
    const existing = tryoutByBrief.get(brief.id);
    if (existing) {
      setTryout(existing);
      return;
    }
    setTryout(undefined);
    await generateTryout(brief);
  };

  const generateTryout = async (brief: Brief) => {
    setTryoutLoading(true);
    setTryoutError(undefined);
    try {
      const plan = await fetchTryout(profile, brief.hobby, brief.argument);
      setTryout(plan);
      // If this brief is saved, persist the plan onto it.
      if (savedIds.has(brief.id)) await attachTryout(brief.id, plan);
    } catch (e) {
      setTryoutError(e instanceof Error ? e.message : String(e));
    } finally {
      setTryoutLoading(false);
    }
  };

  if (editing) {
    return (
      <Questionnaire
        initial={profile}
        mode="edit"
        onComplete={onSaveProfile}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-6">
      <PortraitBar profile={profile} onEdit={() => setEditing(true)} />

      {/* Intro framing line */}
      {intro && !loading && (
        <div className="mt-7 animate-fadeIn">
          <p className="font-display text-xl italic leading-snug text-pine-deep sm:text-2xl">{intro}</p>
          <HorizonRule className="mt-3" />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-12 flex flex-col items-center gap-4 py-10 text-center">
          <Thinking label="Reading you closely, then making the case…" />
          <p className="max-w-sm text-sm text-ink-faint">
            Weighing three or four pursuits against who you are. A few seconds.
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-8">
          <Notice onRetry={() => runArgument()}>The case couldn&apos;t be written. {error}</Notice>
        </div>
      )}

      {/* The cases */}
      {!loading && briefs.length > 0 && (
        <div className="mt-7 space-y-7">
          {briefs.map((brief, i) => (
            <CaseCard
              key={brief.id}
              brief={brief}
              index={i}
              saved={savedIds.has(brief.id)}
              dismissed={dismissedIds.has(brief.id)}
              hasTryout={tryoutByBrief.has(brief.id)}
              onSave={() => saveBrief(brief)}
              onDismiss={() => dismissBrief(brief)}
              onTryout={() => openTryout(brief)}
            />
          ))}
        </div>
      )}

      {/* Re-argue controls */}
      {!loading && briefs.length > 0 && (
        <div className="mt-10">
          <HorizonRule />
          {!pushOpen ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-[15px] italic text-ink-soft">Not convinced yet?</p>
              <div className="flex flex-wrap gap-2">
                <GhostBtn onClick={() => setPushOpen(true)}>Argue harder</GhostBtn>
                <PrimaryBtn onClick={() => runArgument()}>Other cases</PrimaryBtn>
              </div>
            </div>
          ) : (
            <div className="mt-5 animate-riseIn">
              <p className="font-display text-[15px] italic text-ink-soft">
                Tell me what&apos;s off — I&apos;ll re-argue accordingly.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["not outdoorsy", "too expensive", "I want people", "too slow", "more creative"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setPushText((p) => (p ? `${p}, ${q}` : q))}
                    className="ring-pine rounded-full border border-paper-edge bg-paper/60 px-3 py-1 text-[13px] text-ink-soft transition hover:border-pine/40 hover:text-ink"
                  >
                    + {q}
                  </button>
                ))}
              </div>
              <textarea
                value={pushText}
                onChange={(e) => setPushText(e.target.value)}
                rows={3}
                placeholder="e.g. too solitary, I'd like something that gets me out of the house…"
                className="ring-pine mt-3 w-full resize-y rounded-xl border border-paper-edge bg-paper/70 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <PrimaryBtn
                  onClick={() => runArgument({ pushback: pushText.trim() || undefined })}
                  disabled={!pushText.trim()}
                >
                  Re-argue
                </PrimaryBtn>
                <GhostBtn
                  onClick={() => {
                    setPushOpen(false);
                    setPushText("");
                  }}
                >
                  Never mind
                </GhostBtn>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tryout modal */}
      {tryoutFor && (
        <TryoutView
          hobby={tryoutFor.hobby}
          tryout={tryout}
          loading={tryoutLoading}
          error={tryoutError}
          onClose={() => {
            setTryoutFor(null);
            setTryout(undefined);
            setTryoutError(undefined);
          }}
          onRetry={() => generateTryout(tryoutFor)}
        />
      )}
    </div>
  );
}
