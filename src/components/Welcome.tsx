import { HorizonRule, PrimaryBtn, SunMark, Wordmark } from "./bits";

export function Welcome({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/30 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="case-fill relative my-auto w-full max-w-lg rounded-2xl border border-paper-edge p-7 shadow-lift animate-scaleIn sm:p-10">
        <div className="flex items-center gap-3">
          <SunMark className="h-9 w-9 shrink-0" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-pine">
            A guide to your next chapter
          </p>
        </div>

        <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink">
          <Wordmark className="text-5xl" />
        </h1>
        <p className="mt-3 font-display text-lg italic leading-snug text-ink-soft">
          Your next thing, argued just for you.
        </p>

        <HorizonRule className="mt-5" />

        <div className="mt-5 space-y-3.5 text-[15px] leading-relaxed text-ink">
          <p>
            Most lists of hobbies are for nobody in particular. This isn&apos;t a list. We ask you a handful of real
            questions, listen closely — and then make the <em>case</em> for three or four pursuits that would genuinely
            take root in your life, right now.
          </p>
          <p>
            Each one comes as a short brief: why it fits you, what it honestly costs, and the smallest first step you
            could take this week. Like one was written for an audience of one.
          </p>
          <p className="text-sm text-ink-faint">
            Everything stays on your device. No account; nothing leaves except to write your briefs.
          </p>
        </div>

        <div className="mt-7">
          <PrimaryBtn onClick={onBegin} className="w-full sm:w-auto">
            Let&apos;s begin
            <span aria-hidden>→</span>
          </PrimaryBtn>
          <p className="mt-3 text-[13px] text-ink-faint">A handful of short questions. Two minutes, give or take.</p>
        </div>
      </div>
    </div>
  );
}
