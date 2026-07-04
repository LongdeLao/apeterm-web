import { cn } from "@/lib/utils";

const items = [
  ["AAPL", "232.14", "+1.24%", true],
  ["NVDA", "146.02", "+3.11%", true],
  ["TSLA", "281.55", "-0.42%", false],
  ["MSFT", "509.88", "+0.87%", true],
  ["SPY", "601.12", "+0.18%", true],
  ["QQQ", "512.44", "+0.32%", true],
  ["GOOG", "204.66", "+0.71%", true],
  ["META", "740.19", "-0.24%", false],
  ["AMZN", "238.90", "+0.44%", true],
  ["BTC", "108,214", "-0.91%", false],
  ["ETH", "4,022", "+0.55%", true],
] as const;

export function Ticker() {
  const track = [...items, ...items];
  return (
    <div className="group relative overflow-hidden border-y border-border bg-surface/60">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center gap-2 bg-gradient-to-r from-background via-background/95 to-transparent px-5 py-3">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.14_145)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          sample
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-ticker gap-12 py-3 pl-32 font-mono text-[12px] group-hover:[animation-play-state:paused]">
        {track.map(([sym, px, chg, up], i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-foreground">{sym}</span>
            <span className="tabular-nums text-muted-foreground">{px}</span>
            <span
              className={cn(
                "tabular-nums",
                up ? "text-[oklch(0.55_0.14_145)]" : "text-[oklch(0.58_0.18_25)]",
              )}
            >
              {chg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
