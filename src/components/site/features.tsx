import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useI18n, copy } from "@/lib/i18n";
import { Reveal } from "./reveal";

type SiteCopy = typeof copy.en;

interface Cell {
  eyebrow: string;
  title: string;
  body: string;
  visual: (t: SiteCopy) => ReactNode;
  className?: string;
}

function Sparkline() {
  const pts = [4, 8, 6, 12, 9, 14, 11, 18, 15, 22, 19, 26, 24, 30];
  const w = 220,
    h = 60,
    max = 32;
  const d = pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * w} ${h - (v / max) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full">
      <path d={d} fill="none" stroke="oklch(0.22 0.01 265)" strokeWidth="1.5" />
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill="oklch(0.22 0.01 265 / 0.06)" />
    </svg>
  );
}

const cells: Cell[] = [
  {
    eyebrow: "Market data",
    title: "Prices that keep up.",
    body: "Streaming stock quotes and a live Binance feed for crypto, right in the terminal. Bring your own Finnhub or FMP key for deeper fundamentals.",
    visual: () => (
      <div className="mt-5 font-mono text-[12px] leading-relaxed text-muted-foreground">
        <div className="flex items-baseline justify-between">
          <span className="text-foreground">NVDA</span>
          <span className="tabular-nums text-foreground">146.02</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-muted-foreground">
          <span>NVIDIA Corp</span>
          <span className="text-[oklch(0.55_0.14_145)]">+3.11%</span>
        </div>
        <Sparkline />
      </div>
    ),
    className: "md:col-span-6",
  },
  {
    eyebrow: "Institutional & insider",
    title: "See who's actually buying.",
    body: "13F holding changes, Form 4 insider trades and congressional disclosures, pulled straight from SEC EDGAR.",
    visual: () => (
      <div className="mt-5 space-y-1.5 font-mono text-[12px] leading-relaxed">
        {[
          "13F   Buy    NVDA   +2.1M sh",
          "F4    Sell   TSLA   180K sh",
          "13F   Cut    AAPL   -640K sh",
          "F4    Buy    AMD    40K sh",
        ].map((r) => (
          <div key={r} className="flex justify-between text-muted-foreground">
            <span>{r.split(/\s+/).slice(0, 3).join("  ")}</span>
            <span>{r.split(/\s+/).slice(3).join(" ")}</span>
          </div>
        ))}
      </div>
    ),
    className: "md:col-span-6",
  },
  {
    eyebrow: "News",
    title: "Signal, not noise.",
    body: "Per-ticker feeds pulled from RSS wires and deduplicated across sources.",
    visual: (t) => (
      <div className="mt-5 space-y-3 text-sm">
        <div className="border-l-2 border-foreground pl-3">
          <div className="leading-snug">{t.features.news[0][0]}</div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {t.features.news[0][1]}
          </div>
        </div>
        <div className="border-l-2 border-border-strong pl-3">
          <div className="leading-snug">{t.features.news[1][0]}</div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {t.features.news[1][1]}
          </div>
        </div>
      </div>
    ),
    className: "md:col-span-4",
  },
  {
    eyebrow: "Agent",
    title: "An assistant that can act.",
    body: "Ask it to build a watchlist or open a ticker and it calls real tools against your app state — grounded in what's on screen, not guessing. Bring your own OpenRouter-compatible key.",
    visual: (t) => (
      <div className="mt-5 space-y-2 font-mono text-[12px] leading-relaxed">
        <div className="text-muted-foreground">{t.features.agent[0]}</div>
        <div>{t.features.agent[1]}</div>
        <div className="text-muted-foreground">{t.features.agent[2]}</div>
      </div>
    ),
    className: "md:col-span-8",
  },
  {
    eyebrow: "Watchlists",
    title: "Named lists, stocks and crypto.",
    body: "As many watchlists as you want, stored locally in a single config file — no account, nothing synced anywhere.",
    visual: () => (
      <pre className="mt-5 whitespace-pre font-mono text-[12px] leading-relaxed text-muted-foreground">
        {`ai (active)
  NVDA  AMD  AVGO  TSM
crypto
  BTC  ETH  SOL`}
      </pre>
    ),
    className: "md:col-span-4",
  },
  {
    eyebrow: "Keyboard first",
    title: "Vim motions, no mouse required.",
    body: "j/k to move, h/v to split views, / to search, a to ask the agent, g to switch language.",
    visual: (t) => (
      <div className="mt-5 flex flex-wrap gap-2 font-mono text-[12px]">
        {t.features.keys.map((k) => (
          <span key={k} className="border-b border-border-strong pb-0.5 text-muted-foreground">
            {k}
          </span>
        ))}
      </div>
    ),
    className: "md:col-span-8",
  },
];

export function Features() {
  const { t } = useI18n();

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="max-w-2xl">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {t.features.eyebrow}
        </div>
        <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
          {t.features.headingA}
          <br />
          <span className="italic text-muted-foreground/80">{t.features.headingB}</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 border-t border-border md:grid-cols-12">
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              "border-b border-border py-8 md:min-h-[260px] md:px-8 md:first:pl-0 md:[&:nth-child(2)]:pr-0",
              i % 2 === 1 && "md:border-l",
              c.className,
            )}
          >
            <div className="flex h-full flex-col">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {t.features.cells[i][0]}
                </div>
                <h3 className="mt-3 font-display text-2xl leading-tight">
                  {t.features.cells[i][1]}
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  {t.features.cells[i][2]}
                </p>
              </div>
              <div className="mt-auto">{c.visual(t)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
