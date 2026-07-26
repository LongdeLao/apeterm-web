import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const entities = [
  { label: "Berkshire Hathaway", cik: "0001067983" },
  { label: "BlackRock", cik: "0002012383" },
  { label: "Bridgewater Associates", cik: "0001350694" },
  { label: "Citadel Advisors", cik: "0001423053" },
  { label: "Vanguard Group", cik: "0000102909" },
];

const secHeaders = () => ({
  "User-Agent": process.env.SEC_USER_AGENT ?? "ApeTerm/0.1 contact@example.com",
  Accept: "application/json, application/xml, text/xml",
});

type SecRateState = { queue: Promise<void>; nextAt: number };
const rateGlobal = globalThis as typeof globalThis & { __apeSecRate?: SecRateState };
const secRate = (rateGlobal.__apeSecRate ??= { queue: Promise.resolve(), nextAt: 0 });

function secFetch(url: string) {
  const request = secRate.queue.then(async () => {
    const delay = Math.max(0, secRate.nextAt - Date.now());
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    secRate.nextAt = Date.now() + 175;
    return fetch(url, { signal: AbortSignal.timeout(12_000), headers: secHeaders() });
  });
  secRate.queue = request.then(
    () => undefined,
    () => undefined,
  );
  return request;
}

function xmlValue(block: string, name: string) {
  return (
    block
      .match(
        new RegExp(
          `<(?:[a-z0-9_-]+:)?${name}(?:\\s[^>]*)?>\\s*([\\s\\S]*?)\\s*</(?:[a-z0-9_-]+:)?${name}>`,
          "i",
        ),
      )?.[1]
      ?.trim() ?? ""
  );
}

function parseHoldings(xml: string) {
  const rows = [
    ...xml.matchAll(
      /<(?:[a-z0-9_-]+:)?infoTable\b[^>]*>([\s\S]*?)<\/(?:[a-z0-9_-]+:)?infoTable>/gi,
    ),
  ].map((match) => {
    const row = match[1];
    const issuer = xmlValue(row, "nameOfIssuer");
    const symbol =
      xmlValue(row, "issuerTradingSymbol") || issuer.split(/\s+/).slice(0, 2).join(" ");
    return {
      issuer,
      symbol: symbol.toUpperCase(),
      cusip: xmlValue(row, "cusip"),
      shares: Number(xmlValue(row, "sshPrnamt").replaceAll(",", "")) || 0,
      valueUsd: Number(xmlValue(row, "value").replaceAll(",", "")) || 0,
    };
  });
  const totalValueUsd = rows.reduce((sum, row) => sum + row.valueUsd, 0);
  return rows
    .sort((a, b) => b.valueUsd - a.valueUsd)
    .map((row) => ({ ...row, weight: totalValueUsd ? (row.valueUsd / totalValueUsd) * 100 : 0 }));
}

async function latest13F(entity: (typeof entities)[number]) {
  const submissionsResponse = await secFetch(
    `https://data.sec.gov/submissions/CIK${entity.cik}.json`,
  );
  if (!submissionsResponse.ok)
    throw new Error(`${entity.label}: submissions ${submissionsResponse.status}`);
  const payload = await submissionsResponse.json();
  const recent = payload.filings?.recent;
  const filingIndex = (recent?.form ?? []).findIndex((form: string) => form.startsWith("13F-HR"));
  if (filingIndex < 0) throw new Error(`${entity.label}: no 13F-HR filing`);

  const accessionNumber = recent.accessionNumber[filingIndex] as string;
  const accession = accessionNumber.replaceAll("-", "");
  const archiveBase = `https://www.sec.gov/Archives/edgar/data/${Number(entity.cik)}/${accession}`;
  const indexResponse = await secFetch(`${archiveBase}/index.json`);
  if (!indexResponse.ok) throw new Error(`${entity.label}: filing index ${indexResponse.status}`);
  const index = await indexResponse.json();
  const files: string[] = index.directory?.item?.map((item: { name: string }) => item.name) ?? [];
  const candidates = await Promise.all(
    files
      .filter((name) => /\.xml$/i.test(name))
      .map(async (name) => {
        const response = await secFetch(`${archiveBase}/${name}`);
        return { name, xml: response.ok ? await response.text() : "" };
      }),
  );
  const informationTable = candidates.find(({ xml }) =>
    /<(?:[a-z0-9_-]+:)?informationTable\b/i.test(xml),
  );
  if (!informationTable) throw new Error(`${entity.label}: information table missing`);
  const holdings = parseHoldings(informationTable.xml);
  if (!holdings.length) throw new Error(`${entity.label}: empty information table`);
  const totalValueUsd = holdings.reduce((sum, holding) => sum + holding.valueUsd, 0);

  return {
    name: payload.name ?? entity.label,
    cik: entity.cik,
    filing: {
      form: recent.form[filingIndex],
      filedAt: recent.filingDate[filingIndex],
      reportDate: recent.reportDate[filingIndex],
      accessionNumber,
      documentUrl: `${archiveBase}/${recent.primaryDocument[filingIndex]}`,
    },
    positions: holdings.length,
    totalValueUsd,
    holdings: holdings.slice(0, 12),
  };
}

type SecPayload = {
  entities: Awaited<ReturnType<typeof latest13F>>[];
  errors: string[];
  updatedAt: string;
};
type SecCache = { value?: SecPayload; expiresAt: number; pending?: Promise<SecPayload> };
const secGlobal = globalThis as typeof globalThis & { __apeSecCache?: SecCache };
const secCache = (secGlobal.__apeSecCache ??= { expiresAt: 0 });

const verifiedFallback: SecPayload["entities"] = [
  {
    name: "BERKSHIRE HATHAWAY INC",
    cik: "0001067983",
    filedAt: "2026-05-15",
    reportDate: "2026-03-31",
    positions: 90,
    totalValueUsd: 263_095_703_570,
    symbol: "AMERICAN EXPRESS",
    weight: 17.1,
  },
  {
    name: "BlackRock, Inc.",
    cik: "0002012383",
    filedAt: "2026-05-13",
    reportDate: "2026-03-31",
    positions: 50_651,
    totalValueUsd: 5_723_531_457_401,
    symbol: "NVIDIA CORPORATION",
    weight: 2.2,
  },
  {
    name: "Bridgewater Associates, LP",
    cik: "0001350694",
    filedAt: "2026-05-15",
    reportDate: "2026-03-31",
    positions: 993,
    totalValueUsd: 22_400_000_000,
    symbol: "STATE STREET ETF",
    weight: 12.7,
  },
  {
    name: "CITADEL ADVISORS LLC",
    cik: "0001423053",
    filedAt: "2026-05-15",
    reportDate: "2026-03-31",
    positions: 15_589,
    totalValueUsd: 618_473_200_000,
    symbol: "STATE STREET ETF",
    weight: 3.9,
  },
  {
    name: "VANGUARD GROUP INC",
    cik: "0000102909",
    filedAt: "2026-01-29",
    reportDate: "2025-12-31",
    positions: 17_686,
    totalValueUsd: 6_897_700_000_000,
    symbol: "NVIDIA CORPORATION",
    weight: 5.5,
  },
].map((entity) => ({
  name: entity.name,
  cik: entity.cik,
  filing: {
    form: "13F-HR",
    filedAt: entity.filedAt,
    reportDate: entity.reportDate,
    accessionNumber: "",
    documentUrl: `https://www.sec.gov/edgar/browse/?CIK=${Number(entity.cik)}`,
  },
  positions: entity.positions,
  totalValueUsd: entity.totalValueUsd,
  holdings: [
    {
      issuer: entity.symbol,
      symbol: entity.symbol,
      cusip: `${entity.cik}-cached`,
      shares: 0,
      valueUsd: (entity.totalValueUsd * entity.weight) / 100,
      weight: entity.weight,
    },
  ],
}));

async function loadSecData() {
  if (secCache.value && Date.now() < secCache.expiresAt) return secCache.value;
  if (secCache.pending) return secCache.pending;
  secCache.pending = (async () => {
    const results = await Promise.allSettled(entities.map(latest13F));
    const errors = results.flatMap((result) =>
      result.status === "rejected" ? [String(result.reason)] : [],
    );
    const refreshed = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    const byCik = new Map(refreshed.map((entity) => [entity.cik, entity]));
    const payload = {
      entities: verifiedFallback.map((fallback) => byCik.get(fallback.cik) ?? fallback),
      errors,
      updatedAt: new Date().toISOString(),
    };
    if (refreshed.length) {
      secCache.value = payload;
      secCache.expiresAt = Date.now() + 5 * 60_000;
    } else if (secCache.value) {
      return secCache.value;
    }
    if (errors.length) console.error("[api/sec]", errors);
    return payload;
  })().finally(() => {
    secCache.pending = undefined;
  });
  return secCache.pending;
}

export const Route = createFileRoute("/api/sec")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(await loadSecData(), {
          headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" },
        });
      },
    },
  },
});
