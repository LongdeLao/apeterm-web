import { Activity, Bot, FileSearch, Newspaper } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Reveal } from "./reveal";

const icons = [Activity, FileSearch, Newspaper, Bot] as const;

export function Features() {
  const { t } = useI18n();

  return (
    <section id="features" className="border-b border-border bg-white/55">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[0.9fr_1.1fr] md:py-28">
        <Reveal>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t.features.eyebrow}
          </div>
          <h2 className="mt-4 max-w-lg font-display text-4xl leading-[1.03] md:text-6xl">
            {t.features.headingA}
            <br />
            <span className="italic text-muted-foreground/75">{t.features.headingB}</span>
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted-foreground">
            {t.features.body}
          </p>
          <div className="mt-8 inline-flex max-w-full items-center gap-3 rounded-full border border-border bg-background px-4 py-2 font-mono text-[12px] text-muted-foreground shadow-sm">
            <span className="text-foreground">$</span>
            <span className="truncate">{t.features.command}</span>
          </div>
        </Reveal>

        <Reveal className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {t.features.items.map(([label, title, body], i) => {
            const Icon = icons[i];
            return (
              <div key={label} className="min-h-[210px] bg-background p-6">
                <Icon className="h-4 w-4 text-foreground/70" />
                <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </div>
                <h3 className="mt-3 font-display text-[26px] leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            );
          })}
        </Reveal>

        <div className="md:col-span-2">
          <Reveal className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {t.features.metrics.map(([value, label]) => (
              <div key={label} className="bg-surface/80 px-6 py-5">
                <div className="font-mono text-xl text-foreground">{value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
