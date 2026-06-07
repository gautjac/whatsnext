import { useMemo, useState } from "react";
import type { Craving, Profile, Season } from "../types";
import {
  BUDGET_OPTS,
  CADENCE_OPTS,
  CRAVING_OPTS,
  ENGAGEMENT_OPTS,
  LOVE_SUGGESTIONS,
  SEASON_OPTS,
  SETTING_OPTS,
  SETTING_ORDER,
  SOCIAL_OPTS,
  SOCIAL_ORDER,
} from "../profile";
import { Facet, GhostBtn, HorizonRule, PrimaryBtn, SunMark } from "./bits";

type Opt<T extends string> = { value: T; label: string; hint?: string };

// ── Single-choice pills ───────────────────────────────────────────────────────
function ChoiceRow<T extends string>({
  opts,
  value,
  onChange,
}: {
  opts: Opt<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`ring-pine rounded-full border px-3.5 py-1.5 text-sm transition ${
              active
                ? "border-pine bg-pine text-paper shadow-pine"
                : "border-paper-edge bg-paper/60 text-ink-soft hover:border-pine/40 hover:text-ink"
            }`}
            aria-pressed={active}
          >
            {o.label}
            {o.hint && (
              <span className={`ml-1.5 text-[11px] ${active ? "text-paper/70" : "text-ink-faint"}`}>{o.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Multi-select pills ────────────────────────────────────────────────────────
function MultiPills<T extends string>({
  opts,
  values,
  onToggle,
  accent = "pine",
}: {
  opts: Opt<T>[];
  values: T[];
  onToggle: (v: T) => void;
  accent?: "pine" | "marigold";
}) {
  const onCls =
    accent === "marigold"
      ? "border-marigold bg-marigold/15 text-ink shadow-sun"
      : "border-pine bg-pine/10 text-pine-deep shadow-pine";
  const hoverCls = accent === "marigold" ? "hover:border-marigold/50" : "hover:border-pine/40";
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const active = values.includes(o.value);
        return (
          <button
            key={o.value}
            onClick={() => onToggle(o.value)}
            className={`ring-pine rounded-full border px-3.5 py-1.5 text-left text-sm transition ${
              active ? onCls : `border-paper-edge bg-paper/60 text-ink-soft ${hoverCls} hover:text-ink`
            }`}
            aria-pressed={active}
          >
            {o.label}
            {o.hint && (
              <span className={`ml-1.5 text-[11px] ${active ? "opacity-70" : "text-ink-faint"}`}>{o.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── A surveyor's dial (Social / Setting) ──────────────────────────────────────
function DialSlider<T extends string>({
  order,
  opts,
  value,
  onChange,
}: {
  order: T[];
  opts: Opt<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const idx = Math.max(0, order.indexOf(value));
  const fill = (idx / (order.length - 1)) * 100;
  const labelFor = (v: T) => opts.find((x) => x.value === v)?.label ?? v;
  return (
    <div>
      <input
        type="range"
        min={0}
        max={order.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(order[Number(e.target.value)])}
        className="dial ring-pine"
        style={{ ["--fill" as string]: `${fill}%` }}
        aria-label={labelFor(value)}
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-ink-faint">
        <span>{labelFor(order[0])}</span>
        <span className="font-semibold text-pine">{labelFor(value)}</span>
        <span>{labelFor(order[order.length - 1])}</span>
      </div>
    </div>
  );
}

// ── A chip editor with optional suggestions ───────────────────────────────────
function ChipEditor({
  items,
  onChange,
  placeholder,
  suggestions,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (raw?: string) => {
    const v = (raw ?? draft).trim();
    if (!v) return;
    if (!items.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...items, v]);
    setDraft("");
  };
  const remaining = (suggestions ?? []).filter(
    (s) => !items.some((x) => x.toLowerCase() === s.toLowerCase()),
  );
  return (
    <div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <span
              key={`${it}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-pine/30 bg-pine/[0.07] py-1 pl-3 pr-1.5 text-sm text-ink"
            >
              {it}
              <button
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="ring-pine flex h-4 w-4 items-center justify-center rounded-full text-ink-faint transition hover:bg-pine hover:text-paper"
                aria-label="remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className={`flex gap-2 ${items.length > 0 ? "mt-2" : ""}`}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="ring-pine min-w-0 flex-1 rounded-full border border-paper-edge bg-paper/70 px-4 py-2 text-sm text-ink placeholder:text-ink-faint"
        />
        <GhostBtn onClick={() => add()} className="shrink-0">
          +
        </GhostBtn>
      </div>
      {remaining.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              onClick={() => add(s)}
              className="ring-pine rounded-full border border-dashed border-paper-edge bg-paper/40 px-2.5 py-1 text-[13px] text-ink-soft transition hover:border-pine/40 hover:text-ink"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── The questionnaire ─────────────────────────────────────────────────────────
export function Questionnaire({
  initial,
  onComplete,
  onCancel,
  mode = "first",
}: {
  initial: Profile;
  onComplete: (p: Profile) => void;
  onCancel?: () => void;
  mode?: "first" | "edit";
}) {
  const [p, setP] = useState<Profile>(initial);
  const [step, setStep] = useState(0);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((prev) => ({ ...prev, [k]: v }));
  const toggleCraving = (c: Craving) =>
    set("cravings", p.cravings.includes(c) ? p.cravings.filter((x) => x !== c) : [...p.cravings, c]);
  const toggleSeason = (s: Season) =>
    set("season", p.season.includes(s) ? p.season.filter((x) => x !== s) : [...p.season, s]);

  // Each panel: a kicker, a serif question, optional blurb, and the body.
  const panels = useMemo(
    () => [
      {
        kicker: "First things first",
        title: "Who are you these days?",
        blurb: "However you'd describe yourself to a curious stranger. A name helps too — but only if you feel like it.",
        body: (
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                What should I call you?
              </label>
              <input
                value={p.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="a name, a nickname… or leave it blank"
                className="ring-pine mt-1.5 w-full rounded-full border border-paper-edge bg-paper/70 px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-faint"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                A few lines about you
              </label>
              <textarea
                value={p.portrait}
                onChange={(e) => set("portrait", e.target.value)}
                rows={5}
                placeholder="What you do, where you are in life, what lights you up, what a good day looks like…"
                className="ring-pine mt-1.5 w-full resize-y rounded-xl border border-paper-edge bg-paper/70 px-4 py-3 font-display text-[15px] leading-relaxed text-ink placeholder:text-ink-faint"
              />
            </div>
          </div>
        ),
      },
      {
        kicker: "Why now",
        title: "What's got you thinking about this?",
        blurb: "Pick whatever rings true — this matters more than you'd guess. The right thing depends on the season you're in.",
        body: (
          <div className="space-y-4">
            <MultiPills opts={SEASON_OPTS} values={p.season} onToggle={toggleSeason} accent="pine" />
            <textarea
              value={p.seasonNote}
              onChange={(e) => set("seasonNote", e.target.value)}
              rows={2}
              placeholder="Anything more on the 'why now'? (optional)"
              className="ring-pine w-full resize-y rounded-xl border border-paper-edge bg-paper/70 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint"
            />
          </div>
        ),
      },
      {
        kicker: "What pulls you",
        title: "What are you drawn to?",
        blurb: "Tap any that fit, or add your own. Don't overthink it — first instincts are good data.",
        body: (
          <ChipEditor
            items={p.loves}
            onChange={(v) => set("loves", v)}
            placeholder="add something you love…"
            suggestions={LOVE_SUGGESTIONS}
          />
        ),
      },
      {
        kicker: "Roads not taken",
        title: "Old flames and untried curiosities",
        blurb: "Two of the richest clues: what you used to love and drifted from, and what you've always meant to try.",
        body: (
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coral-deep">
                Used to love, and let slip
              </p>
              <div className="mt-2">
                <ChipEditor
                  items={p.pastLoves}
                  onChange={(v) => set("pastLoves", v)}
                  placeholder="something you've drifted away from…"
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pine">
                Curious about, never tried
              </p>
              <div className="mt-2">
                <ChipEditor
                  items={p.curious}
                  onChange={(v) => set("curious", v)}
                  placeholder="something you've always wondered about…"
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        kicker: "The hunger",
        title: "What do you want more of?",
        blurb: "Not the activity — the feeling underneath it. Pick as many as ring true.",
        body: <MultiPills opts={CRAVING_OPTS} values={p.cravings} onToggle={toggleCraving} accent="marigold" />,
      },
      {
        kicker: "Your grain",
        title: "How do you like to spend yourself?",
        blurb: "Hands, mind, or body — and whether you'd rather be alone or among people, inside or out.",
        body: (
          <div className="space-y-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Hands, mind, or body?</p>
              <div className="mt-2.5">
                <ChoiceRow opts={ENGAGEMENT_OPTS} value={p.engagement} onChange={(v) => set("engagement", v)} />
              </div>
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Solo, or with people?</p>
                <div className="mt-3">
                  <DialSlider order={SOCIAL_ORDER} opts={SOCIAL_OPTS} value={p.social} onChange={(v) => set("social", v)} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Indoors, or out?</p>
                <div className="mt-3">
                  <DialSlider order={SETTING_ORDER} opts={SETTING_OPTS} value={p.setting} onChange={(v) => set("setting", v)} />
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        kicker: "The practical",
        title: "Time and money, honestly",
        blurb: "No judgement — a true answer gets you a plan that actually survives contact with your week.",
        body: (
          <div className="space-y-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                How much time, in a real week?
              </p>
              <div className="mt-2.5">
                <ChoiceRow opts={CADENCE_OPTS} value={p.cadence} onChange={(v) => set("cadence", v)} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                What can you spend to start?
              </p>
              <div className="mt-2.5">
                <ChoiceRow opts={BUDGET_OPTS} value={p.budget} onChange={(v) => set("budget", v)} />
              </div>
            </div>
          </div>
        ),
      },
      {
        kicker: "The fine print",
        title: "Anything I should know?",
        blurb: "Constraints to design around, and hard no's I should never even raise.",
        body: (
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                Constraints worth knowing
              </p>
              <textarea
                value={p.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                placeholder="A bad knee, a small apartment, night shifts, kids underfoot, no car…"
                className="ring-pine mt-1.5 w-full resize-y rounded-xl border border-paper-edge bg-paper/70 px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-ink-faint"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-coral-deep">
                Hard no&apos;s — never suggest these
              </p>
              <div className="mt-2">
                <ChipEditor
                  items={p.avoid}
                  onChange={(v) => set("avoid", v)}
                  placeholder="e.g. nothing with screens, no team sports…"
                />
              </div>
            </div>
          </div>
        ),
      },
    ],
    [p],
  );

  const reviewIdx = panels.length; // the final review panel
  const total = panels.length + 1;
  const onReview = step === reviewIdx;
  const pct = Math.round(((step + 1) / total) * 100);

  const next = () => setStep((s) => Math.min(reviewIdx, s + 1));
  const back = () => {
    if (step === 0) {
      onCancel?.();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-24 pt-6 sm:pt-10">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[12px] font-medium text-ink-faint">
          <span className="inline-flex items-center gap-2">
            <SunMark className="h-5 w-5" />
            {onReview ? "Your portrait" : `Question ${step + 1} of ${panels.length}`}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pine to-pine-glow transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="case-fill rounded-2xl border border-paper-edge p-6 shadow-card sm:p-9">
        {!onReview ? (
          <section key={step} className="animate-riseIn">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pine">{panels[step].kicker}</p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-ink sm:text-[28px]">
              {panels[step].title}
            </h2>
            {panels[step].blurb && (
              <p className="mt-2 font-display text-[15px] italic leading-relaxed text-ink-soft">{panels[step].blurb}</p>
            )}
            <HorizonRule className="mt-4" />
            <div className="mt-6">{panels[step].body}</div>
          </section>
        ) : (
          <Review p={p} onJump={setStep} />
        )}

        <HorizonRule className="mt-8" />
        <div className="mt-6 flex items-center justify-between gap-3">
          <GhostBtn onClick={back}>
            {step === 0 ? (mode === "edit" ? "Cancel" : "Back") : "← Back"}
          </GhostBtn>

          {!onReview ? (
            <PrimaryBtn onClick={next}>
              Continue
              <span aria-hidden>→</span>
            </PrimaryBtn>
          ) : (
            <PrimaryBtn onClick={() => onComplete(p)}>
              {mode === "edit" ? "Re-argue my case" : "Make my case"}
              <span aria-hidden>→</span>
            </PrimaryBtn>
          )}
        </div>
      </div>

      {!onReview && (
        <p className="mt-4 text-center text-[13px] text-ink-faint">
          Every question is optional — but the more you tell me, the sharper the case.
        </p>
      )}
    </div>
  );
}

// ── The review panel ──────────────────────────────────────────────────────────
function Review({ p, onJump }: { p: Profile; onJump: (step: number) => void }) {
  const rows: { label: string; value: string; step: number }[] = [
    { label: "You", value: [p.name, p.portrait].filter(Boolean).join(" — ") || "—", step: 0 },
    { label: "Why now", value: p.season.map((s) => SEASON_OPTS.find((o) => o.value === s)?.label ?? s).join(", ") || "—", step: 1 },
    { label: "Drawn to", value: p.loves.join(" · ") || "—", step: 2 },
    { label: "Old flames", value: [...p.pastLoves, ...p.curious].join(" · ") || "—", step: 3 },
    { label: "Wants more", value: p.cravings.map((c) => CRAVING_OPTS.find((o) => o.value === c)?.label ?? c).join(", ") || "—", step: 4 },
    {
      label: "Grain",
      value: [
        ENGAGEMENT_OPTS.find((o) => o.value === p.engagement)?.label,
        SOCIAL_OPTS.find((o) => o.value === p.social)?.label,
        SETTING_OPTS.find((o) => o.value === p.setting)?.label,
      ]
        .filter(Boolean)
        .join(" · "),
      step: 5,
    },
    {
      label: "Practical",
      value: [CADENCE_OPTS.find((o) => o.value === p.cadence)?.label, BUDGET_OPTS.find((o) => o.value === p.budget)?.label]
        .filter(Boolean)
        .join(" · "),
      step: 6,
    },
    { label: "No's", value: p.avoid.join(" · ") || "—", step: 7 },
  ];

  return (
    <section className="animate-riseIn">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pine">Almost there</p>
      <h2 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-ink sm:text-[28px]">
        Here&apos;s what I&apos;ve got
      </h2>
      <p className="mt-2 font-display text-[15px] italic leading-relaxed text-ink-soft">
        A quick read of your portrait. Tap any line to fix it — otherwise, let&apos;s make your case.
      </p>
      <HorizonRule className="mt-4" />

      <dl className="mt-5 divide-y divide-paper-edge/70">
        {rows.map((r) => (
          <button
            key={r.label}
            onClick={() => onJump(r.step)}
            className="ring-pine group flex w-full items-baseline gap-4 py-3 text-left transition hover:bg-paper/40"
          >
            <dt className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {r.label}
            </dt>
            <dd className="min-w-0 flex-1 text-[15px] leading-relaxed text-ink">
              <span className="line-clamp-2">{r.value}</span>
            </dd>
            <span className="shrink-0 text-[13px] font-medium text-pine opacity-0 transition group-hover:opacity-100">
              edit
            </span>
          </button>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-1.5">
        <Facet>local &amp; private</Facet>
        <Facet>no account</Facet>
        <Facet>kept on this device</Facet>
      </div>
    </section>
  );
}
