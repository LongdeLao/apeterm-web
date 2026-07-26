import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

type SearchResult = { symbol: string; name: string; type: "EQUITY" | "ETF"; exchange: string };

const commonInstruments: SearchResult[] = [
  { symbol: "AAPL", name: "Apple Inc.", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "EQUITY", exchange: "NYSE" },
  { symbol: "META", name: "Meta Platforms, Inc.", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix, Inc.", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", type: "ETF", exchange: "NASDAQ" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", type: "ETF", exchange: "NYSE Arca" },
  { symbol: "TSLA", name: "Tesla, Inc.", type: "EQUITY", exchange: "NASDAQ" },
];

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
        const normalizedQuery = query.toUpperCase();
        const localResults = commonInstruments.filter(
          (instrument) =>
            instrument.symbol.includes(normalizedQuery) ||
            instrument.name.toUpperCase().includes(normalizedQuery),
        );
        const response = await fetch(
          `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=true`,
          {
            signal: AbortSignal.timeout(8_000),
            headers: { "User-Agent": "Mozilla/5.0 ApeTerm/0.1" },
          },
        );
        if (!response.ok) {
          console.error("[api/search] Yahoo", response.status);
          return Response.json({ results: localResults });
        }
        const payload = await response.json();
        const remoteResults: SearchResult[] = (payload.quotes ?? [])
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
          .sort(
            (left: { symbol: string }, right: { symbol: string }) =>
              Number(right.symbol === normalizedQuery) - Number(left.symbol === normalizedQuery),
          );
        const results = [...localResults, ...remoteResults]
          .filter(
            (result, index, all) =>
              all.findIndex((candidate) => candidate.symbol === result.symbol) === index,
          )
          .sort(
            (left, right) =>
              Number(right.symbol === normalizedQuery) - Number(left.symbol === normalizedQuery),
          )
          .slice(0, 10);
        return Response.json(
          { results },
          { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
        );
      },
    },
  },
});
