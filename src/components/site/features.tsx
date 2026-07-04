import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HoverEffect } from "@/components/aceternity/hover-effect";
import { Reveal } from "./reveal";

interface Cell {
  eyebrow: string;
  title: string;
  body: string;
  visual: ReactNode;
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
    visual: (
      <div className="mt-6 rounded-lg border border-border bg-card p-4 font-mono text-[12px]">
        <div className="flex items-baseline justify-between">
          <span>NVDA</span>
          <span className="tabular-nums">146.02</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between text-muted-foreground">
          <span>NVIDIA Corp</span>
          <span className="text-[oklch(0.55_0.14_145)]">+3.11%</span>
        </div>
        <Sparkline />
      </div>
    ),
    className: "md:col-span-2",
  },
  {
    eyebrow: "Institutional & insider",
    title: "See who's actually buying.",
    body: "13F holding changes, Form 4 insider trades and congressional disclosures, pulled straight from SEC EDGAR.",
    visual: (
      <div className="mt-6 space-y-1.5 rounded-lg border border-border bg-card p-4 font-mono text-[12px]">
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
  },
  {
    eyebrow: "News",
    title: "Signal, not noise.",
    body: "Per-ticker feeds pulled from RSS wires and deduplicated across sources.",
    visual: (
      <ul className="mt-6 space-y-3 text-sm">
        <li className="border-l-2 border-foreground pl-3">
          <div>Fed holds rates steady, signals two cuts in 2026</div>
          <div className="mt-0.5 text-xs text-muted-foreground">wire · 4m ago</div>
        </li>
        <li className="border-l-2 border-border pl-3">
          <div>NVIDIA reports record data-center revenue</div>
          <div className="mt-0.5 text-xs text-muted-foreground">wire · 22m ago</div>
        </li>
      </ul>
    ),
  },
  {
    eyebrow: "Agent",
    title: "An assistant that can act.",
    body: "Ask it to build a watchlist or open a ticker and it calls real tools against your app state — grounded in what's on screen, not guessing. Bring your own OpenRouter-compatible key.",
    visual: (
      <div className="mt-6 space-y-2 rounded-lg border border-border bg-card p-4 font-mono text-[12px]">
        <div className="text-muted-foreground">› add UBER, DASH to a new "delivery" list</div>
        <div>
          adding UBER, DASH <span className="rounded bg-secondary px-1">tool_call</span>
        </div>
        <div className="text-muted-foreground">Done — created "delivery" with 2 symbols.</div>
      </div>
    ),
    className: "md:col-span-2",
  },
  {
    eyebrow: "Watchlists",
    title: "Named lists, stocks and crypto.",
    body: "As many watchlists as you want, stored locally in a single config file — no account, nothing synced anywhere.",
    visual: (
      <pre className="mt-6 rounded-lg border border-border bg-card p-4 font-mono text-[12px] text-muted-foreground">
        {`ai (active)
  NVDA  AMD  AVGO  TSM
crypto
  BTC  ETH  SOL`}
      </pre>
    ),
  },
  {
    eyebrow: "Keyboard first",
    title: "Vim motions, no mouse required.",
    body: "j/k to move, h/v to split panels, / to search, a to ask the agent, g to switch language.",
    visual: (
      <div className="mt-6 flex flex-wrap gap-2 font-mono text-[12px]">
        {["j/k move", "h/v split", "a agent", "/ search", ", settings", "g locale"].map((k) => (
          <span key={k} className="rounded border border-border bg-card px-2 py-1">
            {k}
          </span>
        ))}
      </div>
    ),
    className: "md:col-span-2",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="max-w-2xl">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          02 · Capabilities
        </div>
        <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
          Everything a serious retail investor needs, in one calm window.
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cells.map((c, i) => (
          <HoverEffect key={i} className={cn("min-h-full", c.className)}>
            <div className="flex h-full flex-col p-8">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {c.eyebrow}
              </div>
              <h3 className="mt-3 font-display text-2xl leading-tight">{c.title}</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{c.body}</p>
              <div className="mt-auto">{c.visual}</div>
            </div>
          </HoverEffect>
        ))}
      </div>
    </section>
  );
}
