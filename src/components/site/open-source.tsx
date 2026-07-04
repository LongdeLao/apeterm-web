import { GitFork, Star, CircleDot, Code2 } from "lucide-react";
import { formatCount, useGitHubStats } from "@/hooks/use-github-stats";

const stack = [
  { k: "Language", v: "Rust, ratatui + crossterm for the TUI" },
  { k: "Storage", v: "Local SQLite — nothing leaves your machine" },
  { k: "Market data", v: "yfinance stream · Binance websocket" },
  { k: "Filings", v: "SEC EDGAR — 13F, Form 4, congressional" },
  { k: "Agent", v: "Bring your own key via OpenRouter" },
  { k: "Telemetry", v: "None by default" },
];

function RepoStats() {
  const { data } = useGitHubStats();
  if (!data) return null;
  const items = [
    { icon: Star, label: "stars", value: data.stars },
    { icon: GitFork, label: "forks", value: data.forks },
    { icon: CircleDot, label: "open issues", value: data.openIssues },
  ];
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {items.map((s) => (
        <span
          key={s.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-[12px] tabular-nums text-muted-foreground"
        >
          <s.icon className="h-3.5 w-3.5" />
          {formatCount(s.value)} {s.label}
        </span>
      ))}
    </div>
  );
}

export function OpenSource() {
  return (
    <section id="open-source" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-14 md:grid-cols-2">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            04 · Open source
          </div>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
            The source is the whole pitch.
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            No paywalls, no seat-based upsell, no telemetry phoning home unless you turn it on. Read
            the code, file an issue, or fork it and make it yours — it's a young project, so PRs
            matter more than praise.
          </p>
          <RepoStats />
          <a
            href="https://github.com/LongdeLao/apeterm"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-secondary"
          >
            <span className="font-mono">{"</>"}</span> Browse the repo
          </a>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-8 md:border-t-0 md:border-l md:pl-10 md:pt-0">
          {stack.map((s) => (
            <div key={s.k}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {s.k}
              </dt>
              <dd className="mt-1.5 text-[15px] leading-snug text-foreground/90">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
