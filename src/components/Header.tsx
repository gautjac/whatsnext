import { SunMark, Wordmark } from "./bits";

export function Header({
  route,
  onHome,
  onCarnet,
  carnetCount,
}: {
  route: "cases" | "carnet";
  onHome: () => void;
  onCarnet: () => void;
  carnetCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-paper-edge/80 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
        <button onClick={onHome} className="ring-pine flex items-center gap-2.5 rounded-full" aria-label="whatsnext">
          <SunMark className="h-7 w-7 shrink-0" />
          <Wordmark className="text-lg" />
        </button>

        <div className="flex items-center gap-2">
          <nav className="flex items-center rounded-full border border-paper-edge bg-paper-warm/60 p-0.5 text-sm shadow-inset">
            <button
              onClick={onHome}
              className={`ring-pine rounded-full px-3 py-1.5 font-medium transition ${
                route === "cases" ? "bg-pine text-paper shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
              aria-pressed={route === "cases"}
            >
              The cases
            </button>
            <button
              onClick={onCarnet}
              className={`ring-pine flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition ${
                route === "carnet" ? "bg-pine text-paper shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
              aria-pressed={route === "carnet"}
            >
              Shortlist
              {carnetCount > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                    route === "carnet" ? "bg-paper/25 text-paper" : "bg-pine text-paper"
                  }`}
                >
                  {carnetCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
