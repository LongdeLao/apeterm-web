import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

type ChartSettings = { range: string; interval: string };
type YahooQuoteValue = { raw?: number; fmt?: string };
type YahooModule = Record<string, YahooQuoteValue | string | number | null | undefined>;

const chartSettings: Record<string, ChartSettings> = {
  "1d": { range: "1d", interval: "1m" },
  "1w": { range: "5d", interval: "15m" },
  "1m": { range: "1mo", interval: "1h" },
  "3m": { range: "3mo", interval: "1d" },
  "6m": { range: "6mo", interval: "1d" },
  "1y": { range: "1y", interval: "1d" },
  "5y": { range: "5y", interval: "1d" },
  max: { range: "max", interval: "1mo" },
};

function number(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function raw(module: YahooModule | undefined, key: string): number | null {
  const value = module?.[key];
  if (typeof value === "object" && value && "raw" in value) return number(value.raw);
  return number(value);
}

function text(module: YahooModule | undefined, key: string): string | null {
  const value = module?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = number(value);
    if (parsed != null) return parsed;
  }
  return 0;
}

function twoSentenceSummary(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  return value
    .trim()
    .split(/(?<=[.!?])\s+/)
    .slice(0, 2)
    .join(" ");
}

function daysUntil(timestamp: number | null) {
  if (timestamp == null) return null;
  const days = Math.round((timestamp * 1000 - Date.now()) / 86_400_000);
  return days >= 0 ? days : null;
}

export const Route = createFileRoute("/api/instrument")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = url.searchParams.get("symbol")?.trim().toUpperCase() ?? "";
        const timeframe = url.searchParams.get("timeframe") ?? "3m";
        const settings = chartSettings[timeframe] ?? chartSettings["3m"];
        if (!/^[A-Z0-9.^=-]{1,20}$/.test(symbol)) {
          return Response.json({ error: "Invalid symbol" }, { status: 400 });
        }
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${settings.interval}&range=${settings.range}&includePrePost=true&events=div%2Csplits`,
          {
            signal: AbortSignal.timeout(8_000),
            headers: { "User-Agent": "Mozilla/5.0 ApeTerm/0.1" },
          },
        );
        if (!response.ok)
          return Response.json({ error: `Yahoo ${response.status}` }, { status: 502 });
        const payload = await response.json();
        const result = payload.chart?.result?.[0];
        const meta = result?.meta;
        if (!meta?.regularMarketPrice)
          return Response.json({ error: "Quote unavailable" }, { status: 404 });
        const fundamentalsResponse = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=summaryDetail,defaultKeyStatistics,financialData,assetProfile,calendarEvents`,
          {
            signal: AbortSignal.timeout(8_000),
            headers: { "User-Agent": "Mozilla/5.0 ApeTerm/0.1" },
          },
        ).catch(() => null);
        const fundamentalsPayload = fundamentalsResponse?.ok
          ? await fundamentalsResponse.json().catch(() => null)
          : null;
        const fundamentals = fundamentalsPayload?.quoteSummary?.result?.[0] as
          | {
              summaryDetail?: YahooModule;
              defaultKeyStatistics?: YahooModule;
              financialData?: YahooModule;
              assetProfile?: YahooModule;
              calendarEvents?: { earnings?: { earningsDate?: YahooQuoteValue[] } };
            }
          | undefined;
        const closes = (result.indicators?.quote?.[0]?.close ?? []).filter(
          (value: unknown): value is number => typeof value === "number" && value > 0,
        );
        const current = Number(meta.regularMarketPrice);
        const previousClose = firstNumber(
          meta.chartPreviousClose,
          meta.previousClose,
          closes.at(-2),
          current,
        );
        const changePercent = Number.isFinite(Number(meta.regularMarketChangePercent))
          ? Number(meta.regularMarketChangePercent)
          : previousClose
            ? ((current - previousClose) / previousClose) * 100
            : 0;
        const extendedPrice = firstNumber(
          meta.postMarketPrice,
          meta.preMarketPrice,
          raw(fundamentals?.summaryDetail, "postMarketPrice"),
          raw(fundamentals?.summaryDetail, "preMarketPrice"),
        );
        const earningsDate = fundamentals?.calendarEvents?.earnings?.earningsDate?.[0]?.raw;
        const summary = twoSentenceSummary(text(fundamentals?.assetProfile, "longBusinessSummary"));
        return Response.json(
          {
            symbol,
            name: meta.longName ?? meta.shortName ?? symbol,
            exchange: meta.fullExchangeName ?? meta.exchangeName ?? "—",
            currency: meta.currency ?? "USD",
            price: current,
            previousClose,
            change: current - previousClose,
            changePercent,
            volume: firstNumber(
              meta.regularMarketVolume,
              raw(fundamentals?.summaryDetail, "volume"),
            ),
            averageVolume: firstNumber(
              meta.averageDailyVolume3Month,
              raw(fundamentals?.summaryDetail, "averageVolume"),
            ),
            open: firstNumber(meta.regularMarketOpen, raw(fundamentals?.summaryDetail, "open")),
            marketCap: firstNumber(meta.marketCap, raw(fundamentals?.summaryDetail, "marketCap")),
            extendedPrice,
            extendedChangePercent:
              extendedPrice && current ? ((extendedPrice - current) / current) * 100 : null,
            trailingPE: firstNumber(raw(fundamentals?.summaryDetail, "trailingPE")),
            forwardPE: firstNumber(raw(fundamentals?.summaryDetail, "forwardPE")),
            priceToBook: firstNumber(raw(fundamentals?.defaultKeyStatistics, "priceToBook")),
            dividendYield: firstNumber(raw(fundamentals?.summaryDetail, "dividendYield")),
            beta: firstNumber(raw(fundamentals?.summaryDetail, "beta")),
            epsTrailingTwelveMonths: firstNumber(
              raw(fundamentals?.defaultKeyStatistics, "trailingEps"),
            ),
            nextEarningsDays: daysUntil(number(earningsDate)),
            dayHigh: firstNumber(
              meta.regularMarketDayHigh,
              raw(fundamentals?.summaryDetail, "dayHigh"),
            ),
            dayLow: firstNumber(
              meta.regularMarketDayLow,
              raw(fundamentals?.summaryDetail, "dayLow"),
            ),
            week52High: firstNumber(
              meta.fiftyTwoWeekHigh,
              raw(fundamentals?.summaryDetail, "fiftyTwoWeekHigh"),
            ),
            week52Low: firstNumber(
              meta.fiftyTwoWeekLow,
              raw(fundamentals?.summaryDetail, "fiftyTwoWeekLow"),
            ),
            marketTime: Number(meta.regularMarketTime ?? 0),
            summary,
            city: text(fundamentals?.assetProfile, "city"),
            state: text(fundamentals?.assetProfile, "state"),
            country: text(fundamentals?.assetProfile, "country"),
            website: text(fundamentals?.assetProfile, "website"),
            fullTimeEmployees: firstNumber(raw(fundamentals?.assetProfile, "fullTimeEmployees")),
            history: (result.timestamp ?? []).flatMap((timestamp: number, index: number) => {
              const close = result.indicators?.quote?.[0]?.close?.[index];
              const volume = result.indicators?.quote?.[0]?.volume?.[index];
              return typeof close === "number" && Number.isFinite(close)
                ? [{ ts: timestamp, close, volume: Number(volume ?? 0) }]
                : [];
            }),
          },
          { headers: { "Cache-Control": "public, max-age=5, stale-while-revalidate=15" } },
        );
      },
    },
  },
});
