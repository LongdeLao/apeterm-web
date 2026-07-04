import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

const ape = `      / ≡ ヽ
    (6(  ·  ·|)
     |    ( ⊥ )`;

type Panel = "watchlist" | "news" | "sec" | "agent";

const panels: { id: Panel; label: string; key: string }[] = [
  { id: "watchlist", label: "watchlist", key: "1" },
  { id: "news", label: "news", key: "2" },
  { id: "sec", label: "sec", key: "3" },
  { id: "agent", label: "agent", key: "a" },
];

interface Row {
  sym: string;
  name: string;
  px: number;
  chg: number;
}

const initialRows: Row[] = [
  { sym: "AAPL", name: "Apple Inc.", px: 232.14, chg: 1.24 },
  { sym: "NVDA", name: "NVIDIA", px: 146.02, chg: 3.11 },
  { sym: "TSLA", name: "Tesla", px: 281.55, chg: -0.42 },
  { sym: "MSFT", name: "Microsoft", px: 509.88, chg: 0.87 },
  { sym: "SPY", name: "S&P 500", px: 601.12, chg: 0.18 },
];

const newsItems = [
  { t: "4m", src: "wire", head: "Fed holds rates steady, signals two cuts in 2026" },
  { t: "22m", src: "wire", head: "NVIDIA reports record data-center revenue" },
  { t: "38m", src: "rss", head: "Apple supplier checks point to strong iPhone cycle" },
  { t: "1h", src: "wire", head: "Oil slips as OPEC+ weighs output increase" },
  { t: "2h", src: "rss", head: "Congress trading tracker: 3 new NVDA disclosures" },
];

const secItems = [
  { form: "13F", act: "Buy", sym: "NVDA", qty: "+2.1M sh", up: true },
  { form: "F4", act: "Sell", sym: "TSLA", qty: "-180K sh", up: false },
  { form: "13F", act: "Cut", sym: "AAPL", qty: "-640K sh", up: false },
  { form: "F4", act: "Buy", sym: "AMD", qty: "+40K sh", up: true },
  { form: "13F", act: "New", sym: "AVGO", qty: "+890K sh", up: true },
];

const agentScript = [
  { who: "you" as const, text: 'add UBER and DASH to a new "delivery" list' },
  { who: "tool" as const, text: 'create_watchlist(name="delivery")' },
  { who: "tool" as const, text: "add_symbols([UBER, DASH] → delivery)" },
  {
    who: "ape" as const,
    text: 'Done — created "delivery" with 2 symbols. UBER is up 1.8% today; DASH reports earnings Thursday.',
  },
];

/** Random-walk hook: nudges one price every ~1.6s and reports flash direction. */
function useLivePrices() {
  const [rows, setRows] = useState(initialRows);
  const [flash, setFlash] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) => {
        const i = Math.floor(Math.random() * prev.length);
        const sym = prev[i].sym;
        const next = prev.map((r, j) => {
          if (j !== i) return r;
          const delta = r.px * (Math.random() - 0.48) * 0.0015;
          return { ...r, px: r.px + delta, chg: r.chg + (delta / r.px) * 100 };
        });
        const dir: "up" | "down" = next[i].px >= prev[i].px ? "up" : "down";
        setFlash((f) => ({ ...f, [sym]: dir }));
        setTimeout(
          () =>
            setFlash((f) => {
              const { [sym]: _, ...rest } = f;
              return rest;
            }),
          600,
        );
        return next;
      });
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return { rows, flash };
}

/** Types out agentScript line by line, looping while the panel is active. */
function useAgentScript(active: boolean) {
  const [lines, setLines] = useState<{ who: "you" | "tool" | "ape"; text: string }[]>([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((r) => (timer = setTimeout(r, ms)));

    const run = async () => {
      while (!cancelled) {
        setLines([]);
        await wait(600);
        for (const line of agentScript) {
          if (cancelled) return;
          if (line.who === "you") {
            for (let i = 1; i <= line.text.length; i++) {
              if (cancelled) return;
              setTyping(line.text.slice(0, i));
              await wait(28);
            }
            setTyping("");
            setLines((l) => [...l, line]);
          } else {
            await wait(line.who === "tool" ? 550 : 850);
            if (cancelled) return;
            setLines((l) => [...l, line]);
          }
        }
        await wait(4500);
      }
    };
    run();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setTyping("");
      setLines([]);
    };
  }, [active]);

  return { lines, typing };
}

export function TerminalMock({ className }: { className?: string }) {
  const [panel, setPanel] = useState<Panel>("watchlist");
  const { rows, flash } = useLivePrices();
  const { lines, typing } = useAgentScript(panel === "agent");
  const containerRef = useRef<HTMLDivElement>(null);

  // The product is keyboard-driven, so the demo is too: while the mock is
  // hovered, 1/2/3/a switch panels like in the real app.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let hovered = false;
    const enter = () => (hovered = true);
    const leave = () => (hovered = false);
    const onKey = (e: KeyboardEvent) => {
      if (!hovered || e.metaKey || e.ctrlKey || e.altKey) return;
      const hit = panels.find((p) => p.key === e.key);
      if (hit) {
        e.preventDefault();
        setPanel(hit.id);
      }
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const [clock, setClock] = useState("--:--");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={containerRef}
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
        <div className="font-mono text-[11px] tabular-nums text-terminal-muted">{clock}</div>
      </div>

      <div className="grid grid-cols-12 gap-0 font-mono text-[13px]">
        {/* sidebar */}
        <aside className="col-span-4 border-r border-white/5 p-4 text-terminal-muted sm:col-span-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Panels</div>
          <ul className="mt-3 space-y-1">
            {panels.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setPanel(p.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-1.5 py-0.5 text-left transition-colors",
                    panel === p.id
                      ? "bg-white/8 text-terminal-fg"
                      : "hover:bg-white/4 hover:text-terminal-fg/80",
                  )}
                >
                  <span>
                    {panel === p.id ? "▸ " : "· "}
                    {p.label}
                  </span>
                  <kbd className="rounded border border-white/10 px-1 text-[10px] text-white/35">
                    {p.key}
                  </kbd>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-[10px] uppercase tracking-[0.18em] text-white/40">Keys</div>
          <ul className="mt-3 space-y-1.5 text-[12px]">
            <li>a — ask agent</li>
            <li>/ — search</li>
            <li>h/v — split</li>
            <li>j/k — move</li>
          </ul>
          <div className="mt-6 hidden text-[10px] leading-relaxed text-white/25 sm:block">
            this demo is live — click a panel, or hover and press 1 / 2 / 3 / a
          </div>
        </aside>

        {/* main */}
        <section className="col-span-8 min-h-[380px] p-5 sm:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={panel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
            >
              {panel === "watchlist" && <WatchlistPanel rows={rows} flash={flash} />}
              {panel === "news" && <NewsPanel />}
              {panel === "sec" && <SecPanel />}
              {panel === "agent" && <AgentPanel lines={lines} typing={typing} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

function WatchlistPanel({ rows, flash }: { rows: Row[]; flash: Record<string, "up" | "down"> }) {
  return (
    <div>
      <pre className="whitespace-pre leading-[1.15] text-terminal-fg">{ape}</pre>
      <div className="mt-2 text-terminal-muted">
        apeterm · press <kbd className="rounded border border-white/10 px-1.5 text-[11px]">a</kbd>{" "}
        to ask the agent, <kbd className="rounded border border-white/10 px-1.5 text-[11px]">/</kbd>{" "}
        to search
      </div>

      <div className="mt-6 grid grid-cols-12 gap-x-3 border-b border-white/5 pb-1 text-[11px] uppercase tracking-wider text-white/40">
        <span className="col-span-2">Sym</span>
        <span className="col-span-5">Name</span>
        <span className="col-span-3 text-right">Last</span>
        <span className="col-span-2 text-right">Chg</span>
      </div>

      {rows.map((r) => (
        <div
          key={r.sym}
          className={cn(
            "grid grid-cols-12 gap-x-3 border-b border-white/5 py-1.5 transition-colors duration-500",
            flash[r.sym] === "up" && "bg-[oklch(0.78_0.16_145/0.08)]",
            flash[r.sym] === "down" && "bg-[oklch(0.72_0.19_25/0.08)]",
          )}
        >
          <span className="col-span-2 text-terminal-fg">{r.sym}</span>
          <span className="col-span-5 text-terminal-muted">{r.name}</span>
          <span className="col-span-3 text-right tabular-nums">{r.px.toFixed(2)}</span>
          <span
            className={cn(
              "col-span-2 text-right tabular-nums",
              r.chg >= 0 ? "text-terminal-green" : "text-terminal-red",
            )}
          >
            {r.chg >= 0 ? "+" : ""}
            {r.chg.toFixed(2)}%
          </span>
        </div>
      ))}

      <div className="mt-6 flex items-center gap-2 text-terminal-fg">
        <span className="text-terminal-amber">›</span>
        <span className="text-terminal-muted">streaming · yfinance + binance ws</span>
        <span className="ml-0.5 inline-block h-4 w-[7px] bg-terminal-fg align-middle animate-caret" />
      </div>
    </div>
  );
}

function NewsPanel() {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/40">News — all tickers</div>
      <ul className="mt-4 space-y-3.5">
        {newsItems.map((n, i) => (
          <motion.li
            key={n.head}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="border-l-2 border-white/10 pl-3"
          >
            <div className="text-terminal-fg">{n.head}</div>
            <div className="mt-0.5 text-[11px] text-terminal-muted">
              {n.src} · {n.t} ago
            </div>
          </motion.li>
        ))}
      </ul>
      <div className="mt-6 text-[11px] text-terminal-muted">deduplicated across RSS wires</div>
    </div>
  );
}

function SecPanel() {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/40">
        SEC EDGAR — recent filings
      </div>
      <div className="mt-4 grid grid-cols-12 gap-x-3 border-b border-white/5 pb-1 text-[11px] uppercase tracking-wider text-white/40">
        <span className="col-span-2">Form</span>
        <span className="col-span-3">Action</span>
        <span className="col-span-3">Sym</span>
        <span className="col-span-4 text-right">Size</span>
      </div>
      {secItems.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="grid grid-cols-12 gap-x-3 border-b border-white/5 py-1.5"
        >
          <span className="col-span-2 text-terminal-amber">{s.form}</span>
          <span className="col-span-3 text-terminal-muted">{s.act}</span>
          <span className="col-span-3 text-terminal-fg">{s.sym}</span>
          <span
            className={cn(
              "col-span-4 text-right tabular-nums",
              s.up ? "text-terminal-green" : "text-terminal-red",
            )}
          >
            {s.qty}
          </span>
        </motion.div>
      ))}
      <div className="mt-6 text-[11px] text-terminal-muted">
        13F · Form 4 · congressional disclosures — free, no key needed
      </div>
    </div>
  );
}

function AgentPanel({
  lines,
  typing,
}: {
  lines: { who: "you" | "tool" | "ape"; text: string }[];
  typing: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-white/40">
        Agent — grounded in screen state
      </div>
      <div className="mt-4 space-y-2.5">
        {lines.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            {l.who === "you" && (
              <div className="flex gap-2">
                <span className="text-terminal-amber">›</span>
                <span className="text-terminal-fg">{l.text}</span>
              </div>
            )}
            {l.who === "tool" && (
              <div className="flex items-center gap-2 pl-4 text-[12px]">
                <span className="rounded bg-white/8 px-1.5 py-0.5 text-terminal-blue">tool</span>
                <span className="text-terminal-muted">{l.text}</span>
              </div>
            )}
            {l.who === "ape" && <div className="max-w-md pl-4 text-terminal-fg/90">{l.text}</div>}
          </motion.div>
        ))}
        <div className="flex gap-2">
          <span className="text-terminal-amber">›</span>
          {typing !== "" && <span className="text-terminal-fg">{typing}</span>}
          <span className="inline-block h-4 w-[7px] self-center bg-terminal-fg animate-caret" />
        </div>
      </div>
    </div>
  );
}
