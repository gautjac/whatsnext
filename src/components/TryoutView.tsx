import type { Tryout } from "../types";
import { HorizonRule, Pin, Thinking } from "./bits";

export function TryoutView({
  hobby,
  tryout,
  loading,
  error,
  onClose,
  onRetry,
}: {
  hobby: string;
  tryout?: Tryout;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/35 p-4 backdrop-blur-sm animate-fadeIn sm:p-8">
      <div
        className="case-fill relative my-auto w-full max-w-2xl rounded-2xl border border-paper-edge shadow-lift animate-scaleIn"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="ring-pine absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-paper-edge bg-paper/70 text-ink-soft transition hover:bg-pine hover:text-paper"
          aria-label="Close"
        >
          ×
        </button>

        <div className="p-6 sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pine">The on-ramp</p>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            30 days into {hobby}
          </h2>
          <HorizonRule className="mt-4" />

          {loading && (
            <div className="py-14">
              <Thinking label="Charting your first month…" />
            </div>
          )}

          {error && !loading && (
            <div className="py-10">
              <p className="text-sm text-ink-soft">The plan couldn&apos;t be drafted. {error}</p>
              <button
                onClick={onRetry}
                className="ring-pine mt-3 font-semibold text-coral-deep underline-offset-2 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {tryout && !loading && (
            <div className="mt-6 space-y-8">
              {tryout.promise && (
                <p className="font-display text-lg italic leading-relaxed text-pine-deep">{tryout.promise}</p>
              )}

              {/* The one thing to buy */}
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  The one thing to buy
                </p>
                <div className="mt-2 flex items-start gap-3 rounded-xl border border-marigold/30 bg-marigold/[0.08] p-4">
                  <Pin className="mt-1.5" />
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      {tryout.buy.item}
                      {tryout.buy.price && (
                        <span className="ml-2 text-sm font-medium text-marigold-deep">{tryout.buy.price}</span>
                      )}
                    </p>
                    {tryout.buy.why && <p className="mt-1 text-sm text-ink-soft">{tryout.buy.why}</p>}
                  </div>
                </div>
              </section>

              {/* First session */}
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                  The very first session
                </p>
                <div className="mt-2 rounded-xl border border-paper-edge bg-paper/50 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-ink">{tryout.firstSession.title}</h3>
                    {tryout.firstSession.minutes > 0 && (
                      <span className="shrink-0 rounded-full bg-pine/10 px-2.5 py-0.5 text-xs font-medium text-pine">
                        {tryout.firstSession.minutes} min
                      </span>
                    )}
                  </div>
                  <ol className="mt-3 space-y-2">
                    {tryout.firstSession.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-ink">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pine text-[11px] font-bold text-paper">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              {/* Four weeks */}
              <section>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Four weeks</p>
                <div className="mt-3 space-y-3">
                  {tryout.weeks.map((w, i) => (
                    <div key={i} className="flex gap-4 rounded-xl border border-paper-edge bg-paper/40 p-4">
                      <div className="shrink-0 text-center">
                        <div className="font-display text-2xl font-semibold leading-none text-pine">{i + 1}</div>
                        <div className="text-[10px] uppercase tracking-wide text-ink-faint">wk</div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-ink">{w.focus}</p>
                        <ul className="mt-1.5 space-y-1">
                          {w.moves.map((m, j) => (
                            <li key={j} className="flex gap-2 text-[14px] leading-relaxed text-ink-soft">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-pine/60" aria-hidden />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {tryout.signal && (
                <section className="rounded-xl border border-sage/40 bg-sage/[0.08] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sage">
                    You&apos;ll know it&apos;s taking hold when…
                  </p>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink">{tryout.signal}</p>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
