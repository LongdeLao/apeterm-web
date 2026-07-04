import { Check, Minus } from "lucide-react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const rows = [
  { what: "Live stock & crypto quotes", ape: true, bb: true, web: true },
  { what: "13F / Form 4 / congressional filings", ape: true, bb: true, web: false },
  { what: "AI agent that acts on your workspace", ape: true, bb: false, web: false },
  { what: "Keyboard-driven, runs in your shell", ape: true, bb: false, web: false },
  { what: "Your data stays on your machine", ape: true, bb: false, web: false },
  { what: "Source code you can read and fork", ape: true, bb: false, web: false },
];

function Mark({ yes }: { yes: boolean }) {
  return yes ? (
    <Check className="mx-auto h-4 w-4 text-[oklch(0.55_0.14_145)]" />
  ) : (
    <Minus className="mx-auto h-4 w-4 text-border-strong" />
  );
}

export function Compare() {
  return (
    <section id="compare" className="border-t border-border bg-surface/60">
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <Reveal className="max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            05 · The alternative
          </div>
          <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
            A Bloomberg seat costs $30,000 a year. This costs a git clone.
          </h2>
          <p className="mt-6 max-w-xl text-muted-foreground">
            ApeTerm won't replace an institutional desk — it's not trying to. It covers what a
            serious retail investor actually uses, without the seat license or the browser-tab
            sprawl.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-strong text-left">
                <th className="py-3 pr-4 font-normal text-muted-foreground" />
                <th className="w-32 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">
                  ApeTerm
                  <div className="mt-0.5 font-sans text-[11px] font-normal normal-case tracking-normal text-muted-foreground">
                    free
                  </div>
                </th>
                <th className="w-32 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Terminal seat
                  <div className="mt-0.5 font-sans text-[11px] font-normal normal-case tracking-normal">
                    ~$30k/yr
                  </div>
                </th>
                <th className="w-32 py-3 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Web dashboards
                  <div className="mt-0.5 font-sans text-[11px] font-normal normal-case tracking-normal">
                    freemium
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.what}
                  className={cn("border-b border-border", i === rows.length - 1 && "border-b-0")}
                >
                  <td className="py-3.5 pr-4 text-foreground/90">{r.what}</td>
                  <td className="bg-card py-3.5 text-center">
                    <Mark yes={r.ape} />
                  </td>
                  <td className="py-3.5 text-center">
                    <Mark yes={r.bb} />
                  </td>
                  <td className="py-3.5 text-center">
                    <Mark yes={r.web} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
