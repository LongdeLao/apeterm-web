import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const ape = `      / ≡ ヽ
    (6(  ·  ·|)
     |    ( ⊥ )`;

const rows = [
  { sym: "AAPL", name: "Apple Inc.", px: "232.14", chg: "+1.24%", up: true },
  { sym: "NVDA", name: "NVIDIA",     px: "146.02", chg: "+3.11%", up: true },
  { sym: "TSLA", name: "Tesla",      px: "281.55", chg: "-0.42%", up: false },
  { sym: "MSFT", name: "Microsoft",  px: "509.88", chg: "+0.87%", up: true },
  { sym: "SPY",  name: "S&P 500",    px: "601.12", chg: "+0.18%", up: true },
];

export function TerminalMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border-strong bg-terminal-bg text-terminal-fg shadow-[0_30px_80px_-40px_oklch(0.2_0.03_265/0.35)]",
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[oklch(0.72_0.16_28)]" />
        <span className="h-3 w-3 rounded-full bg-[oklch(0.83_0.15_85)]" />
        <span className="h-3 w-3 rounded-full bg-[oklch(0.78_0.14_145)]" />
        <div className="ml-3 flex-1 text-center font-mono text-[11px] tracking-wide text-terminal-muted">
          apeterm — ~/portfolio — 120×36
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0 font-mono text-[13px]">
        {/* sidebar */}
        <aside className="col-span-3 border-r border-white/5 p-4 text-terminal-muted">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Sessions</div>
          <ul className="mt-3 space-y-1.5">
            <li className="text-terminal-fg">▸ portfolio</li>
            <li>· watchlist</li>
            <li>· filings/AAPL</li>
            <li>· news/feed</li>
            <li>· ai/chat</li>
          </ul>
          <div className="mt-6 text-[10px] uppercase tracking-[0.18em] text-white/40">Agents</div>
          <ul className="mt-3 space-y-1.5">
            <li>· earnings-summarizer</li>
            <li>· 10-K reader</li>
            <li>· macro-watcher</li>
          </ul>
        </aside>

        {/* main */}
        <section className="col-span-9 p-5">
          <pre className="whitespace-pre text-terminal-fg leading-[1.15]">{ape}</pre>
          <div className="mt-2 text-terminal-muted">
            apeterm <span className="text-terminal-fg">v0.4.1</span> · press{" "}
            <kbd className="rounded border border-white/10 px-1.5 text-[11px]">⌘K</kbd> for command palette
          </div>

          <div className="mt-6 grid grid-cols-12 gap-x-3 border-b border-white/5 pb-1 text-[11px] uppercase tracking-wider text-white/40">
            <span className="col-span-2">Sym</span>
            <span className="col-span-5">Name</span>
            <span className="col-span-3 text-right">Last</span>
            <span className="col-span-2 text-right">Chg</span>
          </div>

          {rows.map((r, i) => (
            <motion.div
              key={r.sym}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4 }}
              className="grid grid-cols-12 gap-x-3 border-b border-white/5 py-1.5"
            >
              <span className="col-span-2 text-terminal-fg">{r.sym}</span>
              <span className="col-span-5 text-terminal-muted">{r.name}</span>
              <span className="col-span-3 text-right tabular-nums">{r.px}</span>
              <span
                className={cn(
                  "col-span-2 text-right tabular-nums",
                  r.up ? "text-terminal-green" : "text-terminal-red",
                )}
              >
                {r.chg}
              </span>
            </motion.div>
          ))}

          <div className="mt-6 flex items-center gap-2 text-terminal-fg">
            <span className="text-terminal-amber">›</span>
            <span>ask</span>
            <span className="text-terminal-muted">
              "why did NVDA move today?"
            </span>
            <span className="ml-0.5 inline-block h-4 w-[7px] bg-terminal-fg align-middle animate-caret" />
          </div>
        </section>
      </div>
    </div>
  );
}
