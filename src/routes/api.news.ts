import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const queries: Record<string, string> = {
  all: "stock market OR economy when:1d",
  watchlist: "NVDA OR AAPL OR MSFT OR AMZN OR META OR GOOGL OR TSLA stock when:2d",
  macro: "Federal Reserve OR inflation OR jobs OR economy when:2d",
  reddit: "site:reddit.com/r/stocks OR site:reddit.com/r/investing when:2d",
  crypto: "Bitcoin OR Ethereum OR Solana crypto when:2d",
};

function decodeXml(value: string) {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function tag(block: string, name: string) {
  return decodeXml(
    block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"))?.[1]?.trim() ?? "",
  );
}

function age(dateValue: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(dateValue).getTime()) / 60_000));
  return minutes < 60
    ? `${minutes}m`
    : minutes < 1_440
      ? `${Math.floor(minutes / 60)}h`
      : `${Math.floor(minutes / 1_440)}d`;
}

function inferSymbol(title: string, category: string) {
  const symbols = [
    "NVDA",
    "AAPL",
    "MSFT",
    "AMZN",
    "META",
    "GOOGL",
    "TSLA",
    "SPY",
    "QQQ",
    "BTC",
    "ETH",
    "SOL",
    "XRP",
  ];
  const upper = title.toUpperCase();
  const aliases: Record<string, string> = {
    NVIDIA: "NVDA",
    APPLE: "AAPL",
    MICROSOFT: "MSFT",
    TESLA: "TSLA",
    BITCOIN: "BTC",
    ETHEREUM: "ETH",
    SOLANA: "SOL",
  };
  return (
    symbols.find((symbol) => upper.includes(symbol)) ??
    Object.entries(aliases).find(([name]) => upper.includes(name))?.[1] ??
    (category === "macro" ? "MACRO" : "MKT")
  );
}

export const Route = createFileRoute("/api/news")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const category = params.get("category") ?? "all";
        // A symbol overrides the category, so the instrument page and the agent can
        // both ask for headlines about one company.
        const symbol = params.get("symbol")?.trim().toUpperCase() ?? "";
        const name = params.get("name")?.trim() ?? "";
        const query = /^[A-Z]{1,6}(?:-[A-Z]{1,4})?$/.test(symbol)
          ? `${name ? `"${name.slice(0, 60)}" OR ` : ""}${symbol} stock when:7d`
          : (queries[category] ?? queries.all);
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10_000),
          headers: { "User-Agent": "ApeTerm/0.1" },
        });
        if (!response.ok)
          return Response.json(
            { items: [], error: `News upstream ${response.status}` },
            { status: 502 },
          );
        const xml = await response.text();
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 12).map((match) => {
          const rawTitle = tag(match[1], "title");
          const split = rawTitle.lastIndexOf(" - ");
          const title = split > 0 ? rawTitle.slice(0, split) : rawTitle;
          const source =
            tag(match[1], "source") || (split > 0 ? rawTitle.slice(split + 3) : "Google News");
          const publishedAt = tag(match[1], "pubDate");
          return {
            id: tag(match[1], "guid") || tag(match[1], "link"),
            age: age(publishedAt),
            source,
            symbol: symbol || inferSymbol(title, category),
            title,
            url: tag(match[1], "link"),
            publishedAt,
          };
        });
        return Response.json(
          { items, category, updatedAt: new Date().toISOString() },
          { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" } },
        );
      },
    },
  },
});
