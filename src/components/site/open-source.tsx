import { ArrowUpRight, GitFork, Star, CircleDot } from "lucide-react";
import { formatCount, useGitHubStats } from "@/hooks/use-github-stats";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "./reveal";

function RepoStats() {
  const { data } = useGitHubStats();
  const { t } = useI18n();
  if (!data) return null;
  const items = [
    { icon: Star, label: t.openSource.stats[0], value: data.stars },
    { icon: GitFork, label: t.openSource.stats[1], value: data.forks },
    { icon: CircleDot, label: t.openSource.stats[2], value: data.openIssues },
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
  const { t } = useI18n();

  return (
    <section id="open-source" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t.openSource.eyebrow}
          </div>
          <h2 className="mt-4 max-w-xl font-display text-4xl leading-[1.03] md:text-6xl">
            {t.openSource.title}
          </h2>
          <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-muted-foreground">
            {t.openSource.body}
          </p>
          <RepoStats />
        </Reveal>

        <Reveal className="grid gap-px overflow-hidden rounded-lg border border-border bg-border">
          <div className="grid gap-px bg-border sm:grid-cols-3">
            {t.openSource.principles.map(([label, body]) => (
              <div key={label} className="bg-background px-6 py-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/88">{body}</p>
              </div>
            ))}
          </div>
          <div className="bg-surface/70 px-6 py-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {t.openSource.stackTitle}
            </div>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              {t.openSource.stack.map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-1.5 text-[15px] leading-snug text-foreground/90">{v}</dd>
                </div>
              ))}
            </dl>
            <a
              href="https://github.com/LongdeLao/apeterm"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-secondary"
            >
              {t.openSource.button}
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
