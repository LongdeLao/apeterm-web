import { useI18n } from "@/lib/i18n";
import { Reveal } from "./reveal";

const steps = [
  {
    k: "01",
    cmd: "curl -fsSL .../install.sh | bash",
    title: "Install in one line.",
    body: "Puts apeterm on your PATH and sets up its local SQLite database and Python runtime. No accounts, no signup.",
  },
  {
    k: "02",
    cmd: "apeterm",
    title: "Open the dashboard.",
    body: "Press w in the watchlist view to add a ticker, h/v to split views, j/k to move — no mouse needed.",
  },
  {
    k: "03",
    cmd: '› add UBER, DASH to a new "delivery" list',
    title: "Press a, and just ask.",
    body: "The agent reads your current watchlists and screen state, then calls real tools to make the change.",
  },
  {
    k: "04",
    cmd: "› press , for settings, g for de/en",
    title: "Bring your own keys.",
    body: "Plug in Finnhub, FMP or an OpenRouter model — or run entirely on the free SEC EDGAR fallback.",
  },
];

export function Workflow() {
  const { t } = useI18n();

  return (
    <section id="workflow" className="border-y border-border bg-surface/60">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {t.workflow.eyebrow}
            </div>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
              {t.workflow.title}
            </h2>
            <p className="mt-6 max-w-sm text-muted-foreground">{t.workflow.body}</p>
          </Reveal>

          <ol className="relative">
            <span aria-hidden className="absolute left-[13px] top-2 bottom-2 w-px bg-border" />
            {steps.map((s) => (
              <li key={s.k} className="relative pl-12 pb-10 last:pb-0">
                <span className="absolute left-0 top-1 grid h-7 w-7 place-items-center rounded-full border border-border-strong bg-background font-mono text-[11px]">
                  {s.k}
                </span>
                <code className="inline-block rounded-md border border-border bg-card px-2.5 py-1 font-mono text-[13px]">
                  {s.cmd}
                </code>
                <h3 className="mt-3 font-display text-2xl">
                  {t.workflow.steps[Number(s.k) - 1][0]}
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {t.workflow.steps[Number(s.k) - 1][1]}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
