import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Cell {
  eyebrow: string;
  title: string;
  body: string;
  visual: ReactNode;
  className?: string;
}

function Sparkline() {
  const pts = [4, 8, 6, 12, 9, 14, 11, 18, 15, 22, 19, 26, 24, 30];
  const w = 220, h = 60, max = 32;
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
    body: "Real-time quotes, historicals and fundamentals for equities, ETFs and crypto — streamed straight into your terminal.",
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
    eyebrow: "SEC filings",
    title: "10-Ks, without the scroll.",
    body: "Full-text filings, red-lined diffs and AI summaries for every 10-K, 10-Q and 8-K.",
    visual: (
      <div className="mt-6 space-y-1.5 rounded-lg border border-border bg-card p-4 font-mono text-[12px]">
        {["10-K   AAPL   Nov 01", "10-Q   MSFT   Oct 24", "8-K    NVDA   Oct 22", "10-K   TSLA   Oct 18"].map((r) => (
          <div key={r} className="flex justify-between text-muted-foreground">
            <span>{r.split(/\s+/).slice(0, 2).join("  ")}</span>
            <span>{r.split(/\s+/).slice(2).join(" ")}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    eyebrow: "News",
    title: "Signal, not noise.",
    body: "Curated feeds per ticker, deduplicated across sources, ranked by impact.",
    visual: (
      <ul className="mt-6 space-y-3 text-sm">
        <li className="border-l-2 border-foreground pl-3">
          <div>Fed holds rates steady, signals two cuts in 2026</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Reuters · 4m ago</div>
        </li>
        <li className="border-l-2 border-border pl-3">
          <div>NVIDIA reports record data-center revenue</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Bloomberg · 22m ago</div>
        </li>
      </ul>
    ),
  },
  {
    eyebrow: "AI",
    title: "An analyst at the prompt.",
    body: "Ask questions in plain English. Get answers backed by filings, prices and your own notes — cited, not hallucinated.",
    visual: (
      <div className="mt-6 space-y-2 rounded-lg border border-border bg-card p-4 font-mono text-[12px]">
        <div className="text-muted-foreground">› why did NVDA move today?</div>
        <div>
          Data-center revenue grew{" "}
          <span className="rounded bg-secondary px-1">+94% YoY</span>, beating consensus
          by 6.2%. See{" "}
          <span className="underline underline-offset-2">10-Q p. 14</span>.
        </div>
      </div>
    ),
    className: "md:col-span-2",
  },
  {
    eyebrow: "Watchlists",
    title: "Yours, in plain text.",
    body: "Watchlists live as files — versioned, portable, syncable with git.",
    visual: (
      <pre className="mt-6 rounded-lg border border-border bg-card p-4 font-mono text-[12px] text-muted-foreground">
{`# ~/apeterm/watchlists/ai.txt
NVDA
AMD
AVGO
TSM
SMCI`}
      </pre>
    ),
  },
  {
    eyebrow: "Keyboard first",
    title: "Every command, one keystroke away.",
    body: "A command palette that gets out of the way. Vim-style motions built in.",
    visual: (
      <div className="mt-6 flex flex-wrap gap-2 font-mono text-[12px]">
        {["⌘K palette", "gq quote", "gf filings", "gn news", "ga ask", "/ search"].map((k) => (
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
      <div className="max-w-2xl">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          02 · Capabilities
        </div>
        <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
          Everything a serious retail investor needs, in one calm window.
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col bg-background p-8 transition-colors hover:bg-surface",
              c.className,
            )}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {c.eyebrow}
            </div>
            <h3 className="mt-3 font-display text-2xl leading-tight">{c.title}</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{c.body}</p>
            <div className="mt-auto">{c.visual}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
