import type { ReactNode } from "react";

// ── Wordmark ──────────────────────────────────────────────────────────────────
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-sans tracking-tight ${className}`}>
      <span className="font-bold text-ink/85">what&apos;s</span>
      <span className="foil font-bold">next</span>
    </span>
  );
}

// ── The rising-sun mark (a horizon with the next thing coming up) ──────────────
export function SunMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <clipPath id="wn-clip">
          <rect x="6" y="6" width="52" height="52" rx="9" />
        </clipPath>
      </defs>
      <g clipPath="url(#wn-clip)">
        <circle cx="32" cy="35" r="12" fill="#eab14f" />
        <circle cx="32" cy="35" r="12" fill="none" stroke="#c9842b" strokeWidth="1.3" />
        <path d="M6 45 C 17 39, 26 47, 32 45 C 41 41, 49 50, 58 44 L58 58 L6 58 Z" fill="#13564f" />
        <path
          d="M6 30 C 15 26, 24 31, 32 28 C 42 24, 50 31, 58 27"
          fill="none"
          stroke="#2c857a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}

// ── A small marigold pin (decorative) ─────────────────────────────────────────
export function Pin({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 rounded-full bg-marigold shadow-[0_0_0_2px_rgba(201,132,43,0.25)] ${className}`}
    />
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────
type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  title?: string;
};

export function PrimaryBtn({ children, onClick, disabled, type = "button", className = "", title }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`ring-pine group inline-flex items-center justify-center gap-2 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-paper shadow-pine transition hover:bg-pine-deep active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, disabled, type = "button", className = "", title }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`ring-pine inline-flex items-center justify-center gap-2 rounded-full border border-paper-edge bg-paper-warm/60 px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-pine/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

// ── A drawn horizon rule (animated) ───────────────────────────────────────────
export function HorizonRule({ className = "" }: { className?: string }) {
  return <div className={`horizon-rule animate-drawLine ${className}`} aria-hidden />;
}

// ── The "thinking" indicator — three suns warming up ──────────────────────────
export function Thinking({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-ink-soft">
      <span className="flex items-end gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-marigold animate-pulse3"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </span>
      {label && <span className="text-sm italic font-display">{label}</span>}
    </div>
  );
}

// ── A small facet tag ─────────────────────────────────────────────────────────
export function Facet({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-paper-edge bg-paper/60 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
      {children}
    </span>
  );
}

// ── An error notice ───────────────────────────────────────────────────────────
export function Notice({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-coral/30 bg-coral/[0.06] px-4 py-3 text-sm text-ink-soft">
      <p>{children}</p>
      {onRetry && (
        <button onClick={onRetry} className="ring-pine mt-2 font-semibold text-coral-deep underline-offset-2 hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}
