import type { Brief } from "../types";
import { Facet, GhostBtn, PrimaryBtn } from "./bits";

function Paras({ text, dropcap }: { text: string; dropcap?: boolean }) {
  const paras = text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  return (
    <div className="case-prose font-display text-[16.5px] leading-[1.7] text-ink">
      {paras.map((para, i) => (
        <p key={i} className={dropcap && i === 0 ? "dropcap" : undefined}>
          {para}
        </p>
      ))}
    </div>
  );
}

function Block({ label, children, accent }: { label: string; children: React.ReactNode; accent?: "pine" | "marigold" | "coral" }) {
  const dot = accent === "marigold" ? "bg-marigold" : accent === "coral" ? "bg-coral" : "bg-pine";
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}

export function CaseCard({
  brief,
  index,
  saved,
  dismissed,
  onSave,
  onDismiss,
  onTryout,
  hasTryout,
}: {
  brief: Brief;
  index: number;
  saved: boolean;
  dismissed: boolean;
  onSave: () => void;
  onDismiss: () => void;
  onTryout: () => void;
  hasTryout?: boolean;
}) {
  return (
    <article
      className={`case-fill relative overflow-hidden rounded-2xl border border-paper-edge shadow-card transition animate-layIn ${
        dismissed ? "opacity-55 saturate-[0.7]" : ""
      }`}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* spine / case number in the margin */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-pine-glow to-pine" aria-hidden />

      <div className="p-6 pl-7 sm:p-9 sm:pl-11">
        <header>
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-sm italic text-ink-faint">
              Case N{"º"} {String(index + 1).padStart(2, "0")}
            </span>
            {brief.fitNote && (
              <span className="rounded-full bg-marigold/12 px-2.5 py-0.5 text-[11px] font-medium text-marigold-deep">
                {brief.fitNote}
              </span>
            )}
          </div>
          <h2 className="mt-2 font-display text-[27px] font-semibold leading-[1.12] tracking-tight text-ink sm:text-[31px]">
            {brief.headline}
          </h2>
          <p className="mt-2 font-sans text-sm font-semibold text-coral-deep">{brief.hobby}</p>
          {brief.kicker && <p className="mt-1.5 text-[12px] uppercase tracking-wide text-ink-faint">{brief.kicker}</p>}
        </header>

        {/* The case, with a pull-quote set in the margin on wide screens */}
        <div className="mt-6 sm:grid sm:grid-cols-[1fr_auto] sm:gap-8">
          <Paras text={brief.argument} dropcap />
          {brief.pullQuote && (
            <aside className="mt-6 sm:mt-1 sm:w-52 sm:shrink-0">
              <div className="flex gap-3 sm:flex-col">
                <div className="quote-bar w-1 shrink-0 rounded-full sm:h-1 sm:w-16" aria-hidden />
                <p className="font-display text-[19px] font-medium italic leading-snug text-pine-deep">
                  {"“"}
                  {brief.pullQuote}
                  {"”"}
                </p>
              </div>
            </aside>
          )}
        </div>

        {/* The honest ledger */}
        <div className="mt-7 grid gap-5 rounded-xl border border-paper-edge bg-paper/50 p-5 sm:grid-cols-3">
          <Block label="What it costs" accent="coral">
            {brief.honesty}
          </Block>
          <Block label="Why it satisfies" accent="pine">
            {brief.satisfaction}
          </Block>
          <Block label="The first step" accent="marigold">
            {brief.firstStep}
          </Block>
        </div>

        {/* Actions */}
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          {saved ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pine/40 bg-pine/10 px-3.5 py-2 text-sm font-medium text-pine-deep">
                <span aria-hidden>✓</span>
                On my shortlist
              </span>
              <PrimaryBtn onClick={onTryout}>
                {hasTryout ? "See the 30-day plan" : "Build a 30-day plan"}
              </PrimaryBtn>
            </>
          ) : (
            <>
              <PrimaryBtn onClick={onSave}>I&apos;m in</PrimaryBtn>
              <PrimaryBtn
                onClick={onTryout}
                className="!bg-paper-warm !text-ink !shadow-none border border-paper-edge hover:!bg-paper-deep"
              >
                See a 30-day plan
              </PrimaryBtn>
              {!dismissed ? (
                <GhostBtn onClick={onDismiss} title="Don't suggest it again">
                  Not for me
                </GhostBtn>
              ) : (
                <span className="text-sm italic text-ink-faint">Set aside</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-paper-edge bg-paper/40 px-6 py-3 pl-7 sm:px-9 sm:pl-11">
        <Facet>argued for you</Facet>
        <Facet>{brief.hobby}</Facet>
      </div>
    </article>
  );
}
