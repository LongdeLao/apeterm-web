const stats = [
  { k: "2,412", v: "GitHub stars" },
  { k: "128", v: "Contributors" },
  { k: "MIT", v: "License" },
  { k: "0", v: "Trackers" },
];

const quotes = [
  {
    q: "Finally a terminal that treats retail investors like adults. My whole research workflow lives here now.",
    n: "Maya Chen",
    r: "Independent analyst",
  },
  {
    q: "It's what Bloomberg would build if Bloomberg were founded in a coffee shop in 2025.",
    n: "Jonas Weber",
    r: "CS student, ETH Zürich",
  },
  {
    q: "The 10-K diff view alone is worth switching for. Everything else is a bonus.",
    n: "Priya Iyer",
    r: "Software engineer",
  },
];

export function OpenSource() {
  return (
    <section id="open-source" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-14 md:grid-cols-2">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            04 · Open source
          </div>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
            Built in the open, owned by nobody.
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            ApeTerm is MIT-licensed and community-run. No paywalls, no analytics
            phoning home, no seat-based enterprise upsell. Read the source, file
            an issue, ship a PR.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-y-6 border-t border-border pt-8">
            {stats.map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl">{s.k}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-4">
          {quotes.map((q) => (
            <figure
              key={q.n}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-border-strong"
            >
              <blockquote className="text-[15px] leading-relaxed text-foreground/90">
                "{q.q}"
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3 text-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-border font-mono text-[11px]">
                  {q.n.split(" ").map((p) => p[0]).join("")}
                </span>
                <span>
                  <span className="text-foreground">{q.n}</span>{" "}
                  <span className="text-muted-foreground">· {q.r}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
