import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const markets = [
  ["BTCUSDT", "BTC"],
  ["ETHUSDT", "ETH"],
  ["SOLUSDT", "SOL"],
  ["BNBUSDT", "BNB"],
  ["XRPUSDT", "XRP"],
  ["DOGEUSDT", "DOGE"],
  ["ADAUSDT", "ADA"],
  ["AVAXUSDT", "AVAX"],
  ["LINKUSDT", "LINK"],
] as const;

type TickerRow = {
  symbol: string;
  price: number;
  change: number;
};

type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
};

function useLiveCryptoTicker() {
  const [rows, setRows] = useState<TickerRow[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      const symbols = encodeURIComponent(JSON.stringify(markets.map(([symbol]) => symbol)));
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`);
      if (!response.ok) throw new Error(`Binance ticker failed: ${response.status}`);
      const data = (await response.json()) as BinanceTicker[];
      if (!active) return;
      setRows(
        data
          .map((item) => {
            const match = markets.find(([symbol]) => symbol === item.symbol);
            if (!match) return null;
            return {
              symbol: match[1],
              price: Number(item.lastPrice),
              change: Number(item.priceChangePercent),
            };
          })
          .filter((item): item is TickerRow => item != null && Number.isFinite(item.price)),
      );
    }

    load().catch(() => setRows([]));
    const id = window.setInterval(() => {
      load().catch(() => setRows([]));
    }, 20_000);

    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return rows;
}

function formatPrice(value: number) {
  if (value >= 1000) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return value.toLocaleString("en-US", { maximumSignificantDigits: 4 });
}

export function Ticker() {
  const { t } = useI18n();
  const rows = useLiveCryptoTicker();
  if (rows.length === 0) return null;

  const track = [...rows, ...rows];
  return (
    <div data-live-ticker className="group relative overflow-hidden border-y border-border bg-surface/60">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center gap-2 bg-gradient-to-r from-background via-background/95 to-transparent px-5 py-3">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.14_145)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t.ticker.label}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-ticker gap-12 py-3 pl-32 font-mono text-[12px] group-hover:[animation-play-state:paused]">
        {track.map((item, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="text-foreground">{item.symbol}</span>
            <span className="tabular-nums text-muted-foreground">{formatPrice(item.price)}</span>
            <span
              className={cn(
                "tabular-nums",
                item.change >= 0
                  ? "text-[oklch(0.55_0.14_145)]"
                  : "text-[oklch(0.58_0.18_25)]",
              )}
            >
              {item.change >= 0 ? "+" : ""}
              {item.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
