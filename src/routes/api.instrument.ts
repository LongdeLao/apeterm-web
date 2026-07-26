import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/api/instrument")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const symbol = url.searchParams.get("symbol")?.trim().toUpperCase() ?? "";
        const timeframe = url.searchParams.get("timeframe") ?? "3m";
        const chartSettings: Record<string, { range: string; interval: string }> = {
          "1d": { range: "1d", interval: "1m" },
          "1w": { range: "5d", interval: "15m" },
          "1m": { range: "1mo", interval: "1h" },
          "3m": { range: "3mo", interval: "1d" },
          "6m": { range: "6mo", interval: "1d" },
          "1y": { range: "1y", interval: "1d" },
          "5y": { range: "5y", interval: "1wk" },
          max: { range: "max", interval: "1mo" },
        };
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
        const closes = (result.indicators?.quote?.[0]?.close ?? []).filter(
          (value: unknown): value is number => typeof value === "number" && value > 0,
        );
        const current = Number(meta.regularMarketPrice);
        const lastClose = closes.at(-1);
        const previous =
          lastClose && Math.abs(lastClose - current) < lastClose * 0.001
            ? (closes.at(-2) ?? lastClose)
            : (lastClose ?? meta.chartPreviousClose ?? current);
        const previousClose = Number(meta.previousClose ?? previous);
        return Response.json(
          {
            symbol,
            name: meta.longName ?? meta.shortName ?? symbol,
            exchange: meta.fullExchangeName ?? meta.exchangeName ?? "—",
            currency: meta.currency ?? "USD",
            price: current,
            previousClose,
            change: current - previousClose,
            changePercent: previousClose ? ((current - previousClose) / previousClose) * 100 : 0,
            volume: Number(meta.regularMarketVolume ?? 0),
            averageVolume: Number(meta.averageDailyVolume3Month ?? 0),
            open: Number(meta.regularMarketOpen ?? 0),
            marketCap: Number(meta.marketCap ?? 0),
            dayHigh: Number(meta.regularMarketDayHigh ?? 0),
            dayLow: Number(meta.regularMarketDayLow ?? 0),
            week52High: Number(meta.fiftyTwoWeekHigh ?? 0),
            week52Low: Number(meta.fiftyTwoWeekLow ?? 0),
            marketTime: Number(meta.regularMarketTime ?? 0),
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
