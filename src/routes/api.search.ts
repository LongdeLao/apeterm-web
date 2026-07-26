import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const majorEtfs = new Set([
  "ARKK",
  "BIL",
  "BND",
  "DIA",
  "EEM",
  "EFA",
  "GLD",
  "HYG",
  "IEF",
  "IJH",
  "IJR",
  "IWM",
  "IVV",
  "IYR",
  "JEPI",
  "LQD",
  "QQQ",
  "SCHD",
  "SHY",
  "SLV",
  "SMH",
  "SOXX",
  "SPY",
  "TLT",
  "UNG",
  "USO",
  "VEA",
  "VGT",
  "VNQ",
  "VOO",
  "VTI",
  "VTV",
  "VUG",
  "VXUS",
  "XLB",
  "XLC",
  "XLE",
  "XLF",
  "XLI",
  "XLK",
  "XLP",
  "XLRE",
  "XLU",
  "XLV",
  "XLY",
]);

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
        if (!query) return Response.json({ results: [] });
        const response = await fetch(
          `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`,
          {
            signal: AbortSignal.timeout(8_000),
            headers: { "User-Agent": "Mozilla/5.0 ApeTerm/0.1" },
          },
        );
        if (!response.ok) {
          console.error("[api/search] Yahoo", response.status);
          return Response.json({ results: [], error: `Yahoo ${response.status}` }, { status: 502 });
        }
        const payload = await response.json();
        const results = (payload.quotes ?? [])
          .filter((quote: { symbol?: string; quoteType?: string; exchange?: string }) =>
            Boolean(
              quote.symbol &&
              ["EQUITY", "ETF"].includes(quote.quoteType ?? "") &&
              ["NMS", "NGM", "NCM", "NYQ", "ASE", "PCX", "BTS"].includes(quote.exchange ?? "") &&
              (quote.quoteType === "EQUITY" || majorEtfs.has(quote.symbol)) &&
              /^[A-Z]{1,6}(?:-[A-Z])?$/.test(quote.symbol),
            ),
          )
          .map(
            (quote: {
              symbol: string;
              shortname?: string;
              longname?: string;
              quoteType?: string;
              exchDisp?: string;
              exchange?: string;
            }) => ({
              symbol: quote.symbol,
              name: quote.longname ?? quote.shortname ?? quote.symbol,
              type: quote.quoteType ?? "UNKNOWN",
              exchange: quote.exchDisp ?? quote.exchange ?? "—",
            }),
          )
          .sort((left: { symbol: string }, right: { symbol: string }) => {
            const normalized = query.toUpperCase();
            return Number(right.symbol === normalized) - Number(left.symbol === normalized);
          });
        return Response.json(
          { results },
          { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
        );
      },
    },
  },
});
