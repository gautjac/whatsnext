import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Profile, SavedRecord, Tryout } from "../types";
import { fetchTryout } from "../api";
import { attachTryout, db, setReflection, undismissBrief, unsaveBrief } from "../db";
import { TryoutView } from "./TryoutView";
import { Facet, GhostBtn, HorizonRule, PrimaryBtn } from "./bits";

// ── A saved brief, with its reflection and (optional) plan ────────────────────
function SavedItem({
  rec,
  onOpenTryout,
}: {
  rec: SavedRecord;
  onOpenTryout: (rec: SavedRecord) => void;
}) {
  const [refl, setRefl] = useState(rec.reflection);
  const [dirty, setDirty] = useState(false);

  const save = async () => {
    await setReflection(rec.briefId, refl);
    setDirty(false);
  };

  return (
    <article className="case-fill overflow-hidden rounded-2xl border border-paper-edge shadow-card">
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold leading-tight text-ink">{rec.hobby}</h3>
            {rec.brief.headline && (
              <p className="mt-1 font-display text-[15px] italic text-ink-soft">{rec.brief.headline}</p>
            )}
          </div>
          <button
            onClick={() => unsaveBrief(rec.briefId)}
            className="ring-pine shrink-0 text-[13px] text-ink-faint underline-offset-2 transition hover:text-coral-deep hover:underline"
          >
            Remove
          </button>
        </div>

        {rec.brief.firstStep && (
          <div className="mt-4 rounded-xl border border-paper-edge bg-paper/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">The first step</p>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">{rec.brief.firstStep}</p>
          </div>
        )}

        {/* What I took from it */}
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pine">What I took from it</p>
          <textarea
            value={refl}
            onChange={(e) => {
              setRefl(e.target.value);
              setDirty(true);
            }}
            onBlur={save}
            rows={2}
            placeholder="A note to self: why it spoke to you, what you mean to do…"
            className="ring-pine mt-1.5 w-full resize-y rounded-xl border border-paper-edge bg-paper/70 px-4 py-2.5 font-display text-[15px] leading-relaxed text-ink placeholder:text-ink-faint"
          />
          {dirty && (
            <button onClick={save} className="ring-pine mt-1.5 text-[13px] font-semibold text-pine hover:underline">
              Save note
            </button>
          )}
        </div>

        <HorizonRule className="mt-5" />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {rec.tryout ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pine/40 bg-pine/10 px-3 py-1.5 text-sm font-medium text-pine-deep">
                <span aria-hidden>✓</span>
                30-day plan ready
              </span>
              <GhostBtn onClick={() => onOpenTryout(rec)}>See the plan</GhostBtn>
            </>
          ) : (
            <PrimaryBtn onClick={() => onOpenTryout(rec)}>Build a 30-day plan</PrimaryBtn>
          )}
        </div>
      </div>
    </article>
  );
}

export function Carnet({ profile, onBrowse }: { profile: Profile; onBrowse: () => void }) {
  const saved = useLiveQuery(() => db.saved.orderBy("savedAt").reverse().toArray(), [], undefined);
  const dismissed = useLiveQuery(() => db.dismissed.orderBy("dismissedAt").reverse().toArray(), [], undefined);

  const [openRec, setOpenRec] = useState<SavedRecord | null>(null);
  const [tryout, setTryout] = useState<Tryout | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const openTryout = async (rec: SavedRecord) => {
    setOpenRec(rec);
    setError(undefined);
    if (rec.tryout) {
      setTryout(rec.tryout);
      return;
    }
    setTryout(undefined);
    await generate(rec);
  };

  const generate = async (rec: SavedRecord) => {
    setLoading(true);
    setError(undefined);
    try {
      const plan = await fetchTryout(profile, rec.hobby, rec.brief.argument);
      setTryout(plan);
      await attachTryout(rec.briefId, plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadingState = saved === undefined || dismissed === undefined;
  const empty = !loadingState && (saved?.length ?? 0) === 0 && (dismissed?.length ?? 0) === 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-6">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pine">The shortlist</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">What I&apos;m keeping</h1>
        </div>
        <GhostBtn onClick={onBrowse}>See the cases</GhostBtn>
      </div>
      <HorizonRule className="mt-4" />

      {empty && (
        <div className="mt-12 rounded-2xl border border-dashed border-paper-edge bg-paper/40 p-10 text-center">
          <p className="font-display text-xl italic text-ink-soft">Nothing kept yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-faint">
            When a case convinces you, say &ldquo;I&apos;m in&rdquo;: it lands here, ready for its 30-day plan.
          </p>
          <div className="mt-5 flex justify-center">
            <PrimaryBtn onClick={onBrowse}>Make me a case</PrimaryBtn>
          </div>
        </div>
      )}

      {/* Saved */}
      {(saved?.length ?? 0) > 0 && (
        <section className="mt-7">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-soft">I&apos;m in · {saved!.length}</p>
          <div className="mt-3 space-y-6">
            {saved!.map((rec) => (
              <SavedItem key={rec.briefId} rec={rec} onOpenTryout={openTryout} />
            ))}
          </div>
        </section>
      )}

      {/* Dismissed */}
      {(dismissed?.length ?? 0) > 0 && (
        <section className="mt-10">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-faint">Set aside · {dismissed!.length}</p>
          <p className="mt-1 text-[13px] text-ink-faint">
            These won&apos;t come back in your cases — unless you call them back.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {dismissed!.map((d) => (
              <span
                key={d.briefId}
                className="inline-flex items-center gap-2 rounded-full border border-paper-edge bg-paper/50 py-1 pl-3.5 pr-1.5 text-sm text-ink-soft"
              >
                {d.hobby}
                <button
                  onClick={() => undismissBrief(d.briefId)}
                  title="Call it back"
                  className="ring-pine flex h-5 w-5 items-center justify-center rounded-full text-ink-faint transition hover:bg-pine hover:text-paper"
                  aria-label="Call it back"
                >
                  ↺
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      {!empty && !loadingState && (
        <div className="mt-12 flex flex-wrap gap-1.5">
          <Facet>local &amp; private</Facet>
          <Facet>kept on this device</Facet>
        </div>
      )}

      {openRec && (
        <TryoutView
          hobby={openRec.hobby}
          tryout={tryout}
          loading={loading}
          error={error}
          onClose={() => {
            setOpenRec(null);
            setTryout(undefined);
            setError(undefined);
          }}
          onRetry={() => generate(openRec)}
        />
      )}
    </div>
  );
}
