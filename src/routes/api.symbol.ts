import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Company profile and recent filings for one ticker, straight from EDGAR.
 *
 * Yahoo's quoteSummary profile endpoint now requires a crumb, and a filings-first
 * product should be reading the primary source anyway.
 */

const secHeaders = () => ({
  "User-Agent": "ApeTerm/0.1 (research@apeterm.com)",
  Accept: "application/json",
});

// SEC asks for no more than 10 requests/second; serialise with a small gap.
type SecRateState = { queue: Promise<unknown>; nextAt: number };
const rateGlobal = globalThis as typeof globalThis & { __apeSymbolRate?: SecRateState };
const secRate = (rateGlobal.__apeSymbolRate ??= { queue: Promise.resolve(), nextAt: 0 });

function secFetch(url: string) {
  const request = secRate.queue.then(async () => {
    const delay = Math.max(0, secRate.nextAt - Date.now());
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    secRate.nextAt = Date.now() + 120;
    return fetch(url, { headers: secHeaders(), signal: AbortSignal.timeout(12_000) });
  });
  secRate.queue = request.catch(() => undefined);
  return request;
}

const tickerGlobal = globalThis as typeof globalThis & {
  __apeTickerMap?: Promise<Map<string, { cik: string; title: string }>>;
};
function tickerMap() {
  return (tickerGlobal.__apeTickerMap ??= (async () => {
    const map = new Map<string, { cik: string; title: string }>();
    const response = await secFetch("https://www.sec.gov/files/company_tickers.json").catch(
      () => null,
    );
    if (!response?.ok) return map;
    const payload = (await response.json().catch(() => ({}))) as Record<
      string,
      { cik_str?: number; ticker?: string; title?: string }
    >;
    for (const row of Object.values(payload)) {
      if (!row?.ticker || typeof row.cik_str !== "number") continue;
      map.set(row.ticker.toUpperCase(), {
        cik: String(row.cik_str).padStart(10, "0"),
        title: row.title ?? row.ticker,
      });
    }
    return map;
  })());
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (character) => character.toUpperCase())
    .replace(/\bAnd\b/g, "and")
    .replace(/\bOf\b/g, "of");
}

export const Route = createFileRoute("/api/symbol")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const symbol = new URL(request.url).searchParams.get("symbol")?.trim().toUpperCase() ?? "";
        if (!/^[A-Z]{1,6}(?:-[A-Z]{1,4})?$/.test(symbol)) {
          return Response.json({ error: "Invalid symbol" }, { status: 400 });
        }
        const entry = (await tickerMap()).get(symbol);
        if (!entry) {
          return Response.json(
            { symbol, profile: null, filings: [], note: "No SEC filer maps to this ticker." },
            { headers: { "Cache-Control": "public, max-age=3600" } },
          );
        }
        const response = await secFetch(
          `https://data.sec.gov/submissions/CIK${entry.cik}.json`,
        ).catch(() => null);
        if (!response?.ok) {
          return Response.json({ error: "SEC submissions unavailable" }, { status: 502 });
        }
        const payload = (await response.json()) as {
          name?: string;
          sic?: string;
          sicDescription?: string;
          category?: string;
          entityType?: string;
          stateOfIncorporation?: string;
          fiscalYearEnd?: string;
          exchanges?: string[];
          website?: string;
          addresses?: { business?: { city?: string; stateOrCountry?: string } };
          filings?: { recent?: Record<string, unknown[]> };
        };
        const recent = payload.filings?.recent ?? {};
        const forms = (recent.form as string[] | undefined) ?? [];
        const accessions = (recent.accessionNumber as string[] | undefined) ?? [];
        const documents = (recent.primaryDocument as string[] | undefined) ?? [];
        const filings = forms.slice(0, 14).map((form, index) => {
          const accession = (accessions[index] ?? "").replaceAll("-", "");
          return {
            form,
            filedAt: (recent.filingDate as string[] | undefined)?.[index] ?? "",
            reportDate: (recent.reportDate as string[] | undefined)?.[index] ?? "",
            description: (recent.primaryDocDescription as string[] | undefined)?.[index] ?? "",
            url:
              accession && documents[index]
                ? `https://www.sec.gov/Archives/edgar/data/${Number(entry.cik)}/${accession}/${documents[index]}`
                : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${entry.cik}`,
          };
        });
        const city = payload.addresses?.business?.city;
        const state = payload.addresses?.business?.stateOrCountry;
        return Response.json(
          {
            symbol,
            profile: {
              name: payload.name ?? entry.title,
              cik: entry.cik,
              industry: payload.sicDescription ? titleCase(payload.sicDescription) : "—",
              sic: payload.sic ?? "",
              filerCategory: payload.category?.replace(/^0*/, "") || "—",
              entityType: payload.entityType ?? "—",
              stateOfIncorporation: payload.stateOfIncorporation ?? "—",
              fiscalYearEnd: payload.fiscalYearEnd ?? "",
              exchanges: payload.exchanges ?? [],
              website: payload.website ?? "",
              location: [city ? titleCase(city) : "", state].filter(Boolean).join(", ") || "—",
              edgarUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${entry.cik}&type=&dateb=&owner=include&count=40`,
            },
            filings,
          },
          { headers: { "Cache-Control": "public, max-age=900, stale-while-revalidate=3600" } },
        );
      },
    },
  },
});
