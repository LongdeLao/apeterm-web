import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

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

const newsTimes = [
  { t: "4m", src: "wire" },
  { t: "22m", src: "wire" },
  { t: "38m", src: "rss" },
  { t: "1h", src: "wire" },
  { t: "2h", src: "rss" },
];

/** Random-walk hook: nudges one price every ~1.6s. */
function useLivePrices() {
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) => {
        const i = Math.floor(Math.random() * prev.length);
        return prev.map((r, j) => {
          if (j !== i) return r;
          const delta = r.px * (Math.random() - 0.48) * 0.0015;
          return { ...r, px: r.px + delta, chg: r.chg + (delta / r.px) * 100 };
        });
      });
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return rows;
}

export function TerminalMock({ className }: { className?: string }) {
  const { t } = useI18n();
  const rows = useLivePrices();
  const containerRef = useRef<HTMLDivElement>(null);

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
        "relative overflow-hidden rounded-md border border-white/20 bg-[#2d2d2b] text-[#e8e6df] shadow-[0_24px_70px_-42px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/14 bg-[#393937] px-3 py-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6159]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-4 flex h-5 w-56 items-center rounded bg-white/8 px-3 font-mono text-[10px] text-white/38">
          Search sessions, agents, files...
        </div>
        <div className="ml-auto font-mono text-[10px] tabular-nums text-white/48">
          +119 <span className="text-[#63e087]">+29</span> · {clock}
        </div>
      </div>

      <div className="grid min-h-[390px] grid-cols-12 font-mono text-[11px] leading-tight">
        <section className="col-span-5 grid grid-rows-2 border-r border-white/20">
          <div className="border-b border-white/20 p-4">
            <PanelTitle title="Nachrichten" tabs={["ALL", "WATCHLIST", "MACRO", "REDDIT", "CRYPTO"]} />
            <div className="mt-3 grid grid-cols-[42px_42px_1fr] gap-x-3 text-white/84">
              {newsTimes.map((n, i) => (
                <div key={i} className="contents">
                  <span className="text-white/48">{n.t}</span>
                  <span className="text-white/48">{n.src.toUpperCase()}</span>
                  <span className="truncate font-semibold">{t.terminal.news[i]}</span>
                </div>
              ))}
              {[
                "Apple supplier checks point to a stronger cycle",
                "Stock futures drift before the open",
                "Congress tracker: new NVDA disclosures",
                "Oil slips as OPEC+ weighs output increase",
              ].map((item, i) => (
                <div key={item} className="contents">
                  <span className="text-white/48">{i + 1}h</span>
                  <span className="text-white/48">YF</span>
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <PanelTitle title="SEC" tabs={["INSTITUTIONAL", "CEOS", "CONGRESS"]} />
            <div className="mt-3 grid grid-cols-[150px_1fr] gap-4">
              <div className="space-y-1 text-white/78">
                {["Berkshire Hathaway", "BlackRock", "Bridgewater Associates", "Citadel Advisors", "Vanguard"].map((name) => (
                  <div key={name}>
                    <span className="text-[#62df86]">▲</span> {name}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-semibold">Berkshire Hathaway</div>
                <div className="mt-1 text-white/45">13F value $48.2T · Positions 29</div>
                <div className="mt-4 grid grid-cols-4 gap-x-3 text-white/76">
                  {["OCCIDENTAL P", "CHUBB LTD", "KRAFT HEINZ", "DELTA AIR"].map((name, i) => (
                    <div key={name} className="contents">
                      <span className="col-span-2">{name}</span>
                      <span>{["264.9M", "34.2M", "325.6M", "39.8M"][i]}</span>
                      <span className={i === 3 ? "text-[#62df86]" : "text-white/54"}>
                        {i === 3 ? "New" : ["35.7%", "23.1%", "15.2%"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-5 border-r border-white/20 p-4">
          <PanelTitle title="Watchlist" tabs={["MAIN", "CRYPTO", "+"]} activeTitle />
          <div className="mt-4 grid grid-cols-[76px_18px_80px_72px_62px_54px] gap-x-3 border-t border-white/28 pt-2 text-white/88">
            {rows.concat([
              { sym: "GOOGL", name: "Alphabet", px: 359.91, chg: -0.36 },
              { sym: "JPM", name: "JPMorgan", px: 334.47, chg: 0.12 },
              { sym: "META", name: "Meta", px: 582.90, chg: -4.90 },
            ]).map((r) => (
              <div key={r.sym} className="contents">
                <span>{r.sym}</span>
                <span className="text-white/48">•</span>
                <span className="tabular-nums">{r.px.toFixed(2)}</span>
                <span className={r.chg >= 0 ? "text-[#62df86]" : "text-[#ff5f57]"}>
                  {r.chg >= 0 ? "▲" : "▼"} {r.chg >= 0 ? "+" : ""}
                  {r.chg.toFixed(2)}%
                </span>
                <span className="text-white/58">VOL</span>
                <span className="text-white/58">{Math.abs(r.chg * 12).toFixed(1)}M</span>
              </div>
            ))}
          </div>
          <div className="mt-24 text-right text-[#bd5cff]">ↄ nachbörslich</div>
        </section>

        <aside className="col-span-2 p-4">
          <div className="font-semibold">
            Agent <span className="ml-2 text-[#62df86]">●</span>{" "}
            <span className="text-white/48">openrouter/free</span>
          </div>
          <div className="mt-5 font-semibold">Frag was, ich schau drauf.</div>
          <ul className="mt-6 space-y-4 text-white/45">
            <li>Add or remove from watchlist</li>
            <li>Create a new watchlist</li>
            <li>Open a stock's details</li>
            <li>What's on my watchlists?</li>
          </ul>
          <div className="mt-32 border-t border-white/50 pt-2 text-white/58">
            <span className="text-[#63a4ff]">›</span> frag einfach...
            <br />
            ↵ send&nbsp;&nbsp; esc close
          </div>
        </aside>
      </div>
    </div>
  );
}

function PanelTitle({
  title,
  tabs,
  activeTitle = false,
}: {
  title: string;
  tabs: string[];
  activeTitle?: boolean;
}) {
  return (
    <div>
      <div className={cn("font-bold", activeTitle && "inline bg-white px-1 text-[#222]")}>
        {title}
      </div>
      <div className="mt-1 flex gap-5 border-b border-white/35 pb-1 text-[10px] font-bold tracking-wide text-white/48">
        {tabs.map((tab, i) => (
          <span key={tab} className={i === 0 ? "border-b-2 border-white text-white" : ""}>
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
}
