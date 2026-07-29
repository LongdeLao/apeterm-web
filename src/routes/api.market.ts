import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const STOCKS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "TSLA", "JPM"];
const CRYPTO = ["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE", "ADA", "AVAX"];

type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  relativeVolume: number | null;
  marketState: "pre_market" | "regular" | "after_hours";
};

function normalizeMarketState(value: unknown): Quote["marketState"] {
  const state = String(value ?? "").toUpperCase();
  if (state === "PRE" || state === "PREPRE" || state === "PRE_MARKET") return "pre_market";
  if (state === "REGULAR" || state === "REGULAR_MARKET") return "regular";
  return "after_hours";
}

async function stockQuote(symbol: string): Promise<Quote> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`,
    { signal: AbortSignal.timeout(8_000), headers: { "User-Agent": "ApeTerm/0.1" } },
  );
  if (!response.ok) throw new Error(`${symbol}: upstream ${response.status}`);
  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`${symbol}: quote unavailable`);
  const volumes = (result.indicators?.quote?.[0]?.volume ?? []).filter(
    (value: unknown): value is number => typeof value === "number" && value > 0,
  );
  const closes = (result.indicators?.quote?.[0]?.close ?? []).filter(
    (value: unknown): value is number => typeof value === "number" && value > 0,
  );
  const volume = Number(meta.regularMarketVolume ?? volumes.at(-1) ?? 0);
  const average = volumes.length
    ? volumes.slice(-30).reduce((sum: number, value: number) => sum + value, 0) /
      Math.min(30, volumes.length)
    : 0;
  const price = Number(meta.regularMarketPrice);
  const previous = Number(meta.chartPreviousClose ?? meta.previousClose ?? closes.at(-2) ?? price);
  const changePercent = Number.isFinite(Number(meta.regularMarketChangePercent))
    ? Number(meta.regularMarketChangePercent)
    : previous
      ? ((price - previous) / previous) * 100
      : 0;
  return {
    symbol,
    price,
    changePercent,
    volume,
    relativeVolume: average ? volume / average : null,
    marketState: normalizeMarketState(meta.marketState),
  };
}

async function cryptoQuote(symbol: string): Promise<Quote> {
  const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`, {
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`${symbol}: upstream ${response.status}`);
  const payload = await response.json();
  return {
    symbol,
    price: Number(payload.lastPrice),
    changePercent: Number(payload.priceChangePercent),
    volume: Number(payload.quoteVolume),
    relativeVolume: null,
    marketState: "regular",
  };
}

export const Route = createFileRoute("/api/market")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestedStocks = (new URL(request.url).searchParams.get("symbols") ?? "")
          .split(",")
          .map((symbol) => symbol.trim().toUpperCase())
          .filter((symbol) => /^[A-Z]{1,6}(?:-[A-Z])?$/.test(symbol))
          .filter((symbol, index, all) => all.indexOf(symbol) === index)
          .slice(0, 25);
        const stockSymbols = requestedStocks.length ? requestedStocks : STOCKS;
        const [stocks, crypto] = await Promise.all([
          Promise.allSettled(stockSymbols.map(stockQuote)),
          Promise.allSettled(CRYPTO.map(cryptoQuote)),
        ]);
        const fulfilled = (results: PromiseSettledResult<Quote>[]) =>
          results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
        return Response.json(
          {
            stocks: fulfilled(stocks),
            crypto: fulfilled(crypto),
            errors: [...stocks, ...crypto].filter((result) => result.status === "rejected").length,
            updatedAt: new Date().toISOString(),
          },
          { headers: { "Cache-Control": "public, max-age=5, stale-while-revalidate=10" } },
        );
      },
    },
  },
});
