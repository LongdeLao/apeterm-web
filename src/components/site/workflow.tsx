const steps = [
  {
    k: "01",
    cmd: "brew install apeterm",
    title: "Install in one line.",
    body: "Native builds for macOS, Linux and Windows. No accounts, no signup.",
  },
  {
    k: "02",
    cmd: "apeterm watch AAPL NVDA TSLA",
    title: "Track what matters.",
    body: "Prices, filings and news stream into a workspace you own.",
  },
  {
    k: "03",
    cmd: "› ask why did the market sell off today?",
    title: "Ask, and get a cited answer.",
    body: "The built-in analyst reasons over filings, macro data and your notes.",
  },
  {
    k: "04",
    cmd: "git commit -m 'update ai watchlist'",
    title: "Version-control your research.",
    body: "Everything is plain text — commit, branch and share like code.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="border-y border-border bg-surface/60">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              03 · Workflow
            </div>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
              From install to insight in four commands.
            </h2>
            <p className="mt-6 max-w-sm text-muted-foreground">
              ApeTerm is built for the way you already work — a shell, a keyboard,
              a repo. No dashboards to learn.
            </p>
          </div>

          <ol className="relative">
            <span
              aria-hidden
              className="absolute left-[13px] top-2 bottom-2 w-px bg-border"
            />
            {steps.map((s) => (
              <li key={s.k} className="relative pl-12 pb-10 last:pb-0">
                <span className="absolute left-0 top-1 grid h-7 w-7 place-items-center rounded-full border border-border-strong bg-background font-mono text-[11px]">
                  {s.k}
                </span>
                <code className="inline-block rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[13px]">
                  {s.cmd}
                </code>
                <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
