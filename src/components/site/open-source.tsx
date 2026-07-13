import { GitFork, Star, CircleDot, Code2 } from "lucide-react";
import { formatCount, useGitHubStats } from "@/hooks/use-github-stats";
import { useI18n } from "@/lib/i18n";

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
      <div className="grid gap-14 md:grid-cols-2">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t.openSource.eyebrow}
          </div>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
            {t.openSource.title}
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">{t.openSource.body}</p>
          <RepoStats />
          <a
            href="https://github.com/LongdeLao/apeterm"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-secondary"
          >
            <Code2 className="h-4 w-4" /> {t.openSource.button}
          </a>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-8 md:border-t-0 md:border-l md:pl-10 md:pt-0">
          {t.openSource.stack.map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {k}
              </dt>
              <dd className="mt-1.5 text-[15px] leading-snug text-foreground/90">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
