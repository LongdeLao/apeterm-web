import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  InstrumentChart,
  chartTimeframes,
  type ChartDetail,
  type ChartTimeframe,
} from "@/components/instrument-chart";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "ApeTerm" }, { name: "description", content: "ApeTerm in your browser." }],
  }),
  component: ApeTermWeb,
});

type Panel = "news" | "watchlist" | "sec" | "notes";
type Overlay = "search" | "spotlight" | "settings" | "help" | null;
type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  relativeVolume: number | null;
  marketState?: string;
};
type MarketData = { stocks: Quote[]; crypto: Quote[]; errors: number; updatedAt: string };
type NewsItem = {
  id: string;
  age: string;
  source: string;
  symbol: string;
  title: string;
  url: string;
};
type NewsData = { items: NewsItem[]; updatedAt: string };
type Holding = {
  issuer: string;
  symbol: string;
  cusip: string;
  shares: number;
  valueUsd: number;
  weight: number;
};
type SecEntity = {
  name: string;
  cik: string;
  filing: {
    form: string;
    filedAt: string;
    reportDate: string;
    accessionNumber: string;
    documentUrl: string;
  };
  positions: number;
  totalValueUsd: number;
  holdings: Holding[];
};
type SecData = { entities: SecEntity[]; errors: string[]; updatedAt: string };
type SearchResult = { symbol: string; name: string; type: string; exchange: string };
type SearchData = { results: SearchResult[]; error?: string };
type InstrumentDetail = ChartDetail;
type AgentMessage = { role: "user" | "assistant"; content: string };
type AgentAction = {
  type: "add_to_watchlist" | "remove_from_watchlist";
  symbol: string;
};
type AgentData = { reply: string; model: string; actions?: AgentAction[] };

const newsCategories = ["all", "watchlist", "macro", "reddit", "crypto"];
const defaultStockOrder = [
  "SPY",
  "QQQ",
  "NVDA",
  "AAPL",
  "MSFT",
  "AMZN",
  "META",
  "GOOGL",
  "TSLA",
  "JPM",
  "NFLX",
];
const watchlistStorageKey = "apeterm:watchlist";
const cryptoOrder = ["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE", "ADA", "AVAX"];

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json() as Promise<T>;
}

function compactNumber(value: number, currency = false) {
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
  return currency ? `$${formatted}` : formatted;
}

function formatQuoteRow(quote: Quote, crypto: boolean) {
  const decimals = quote.price < 1 ? 4 : quote.price < 10 ? 2 : quote.price < 1_000 ? 2 : 0;
  return [
    quote.symbol,
    quote.price.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
    `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%`,
    compactNumber(quote.volume, crypto),
    quote.relativeVolume == null ? "—" : `${quote.relativeVolume.toFixed(1)}x`,
  ] as const;
}

function orderedQuotes(
  order: string[],
  seed: Quote[] | undefined,
  streamed: Record<string, Quote>,
) {
  const fallback = new Map(seed?.map((quote) => [quote.symbol, quote]));
  return order.flatMap((symbol) => {
    const quote = streamed[symbol] ?? fallback.get(symbol);
    return quote ? [quote] : [];
  });
}

const allHeadlines = [
  ["2m", "REUTERS", "NVDA", "Nvidia supplier outlook signals sustained AI demand"],
  ["11m", "BLOOMBERG", "AAPL", "Apple expands on-device intelligence in Europe"],
  ["24m", "SEC", "MSFT", "Microsoft files 8-K after cloud segment update"],
  ["38m", "COINDESK", "BTC", "Bitcoin liquidity deepens as inflows resume"],
  ["1h", "CNBC", "TSLA", "Tesla prepares investors for quarterly results"],
  ["2h", "REUTERS", "SPY", "Wall Street opens higher as chip shares rally"],
] as const;

const newsFeeds = [
  allHeadlines,
  [
    ["2m", "REUTERS", "NVDA", "Nvidia supplier outlook signals sustained AI demand"],
    ["11m", "BLOOMBERG", "AAPL", "Apple expands on-device intelligence in Europe"],
    ["24m", "SEC", "MSFT", "Microsoft files 8-K after cloud segment update"],
    ["1h", "CNBC", "TSLA", "Tesla prepares investors for quarterly results"],
  ],
  [
    ["6m", "REUTERS", "MACRO", "Dollar eases as markets weigh the next Fed move"],
    ["19m", "BLS", "US", "Jobless claims hold near recent range"],
    ["43m", "ECB", "EUR", "ECB survey shows inflation expectations stabilizing"],
    ["2h", "BEA", "US", "New home sales beat consensus estimates"],
  ],
  [
    ["3m", "REDDIT", "NVDA", "r/stocks: semiconductor strength discussion"],
    ["17m", "REDDIT", "TSLA", "r/investing: Tesla earnings expectations thread"],
    ["31m", "REDDIT", "SPY", "r/wallstreetbets: daily market discussion"],
    ["1h", "REDDIT", "AAPL", "r/apple: intelligence rollout megathread"],
  ],
  [
    ["1m", "COINDESK", "BTC", "Bitcoin holds above $118K as spot demand grows"],
    ["8m", "THE BLOCK", "ETH", "Ethereum staking deposits reach monthly high"],
    ["22m", "DECRYPT", "SOL", "Solana activity rises with renewed DeFi volumes"],
    ["47m", "COINTELE", "XRP", "XRP volatility expands after regulatory update"],
    ["1h", "COINDESK", "DOGE", "Major tokens advance during US session"],
  ],
] as const;

const mainQuotes = [
  ["SPY", "637.48", "+0.42%", "48.2M", "0.8x"],
  ["QQQ", "572.19", "+0.77%", "39.1M", "1.1x"],
  ["NVDA", "173.62", "+2.84%", "182.4M", "1.8x"],
  ["AAPL", "213.88", "+0.71%", "54.8M", "0.9x"],
  ["MSFT", "495.94", "-0.34%", "21.1M", "0.7x"],
  ["AMZN", "231.44", "+1.08%", "36.7M", "1.2x"],
  ["META", "712.05", "-0.62%", "18.9M", "0.8x"],
  ["GOOGL", "192.76", "+0.29%", "22.4M", "0.7x"],
  ["TSLA", "321.67", "-1.26%", "92.7M", "1.4x"],
  ["JPM", "289.62", "+0.18%", "8.4M", "0.6x"],
] as const;

const cryptoQuotes = [
  ["BTC", "118,420", "+1.92%", "$48.2B", "1.3x"],
  ["ETH", "3,782.4", "+2.41%", "$24.8B", "1.5x"],
  ["SOL", "191.83", "+4.08%", "$6.7B", "1.8x"],
  ["XRP", "3.18", "-0.71%", "$4.9B", "0.9x"],
  ["BNB", "782.60", "+0.86%", "$2.1B", "0.7x"],
  ["DOGE", "0.2431", "+3.17%", "$3.8B", "1.6x"],
  ["ADA", "0.8462", "-1.04%", "$1.4B", "0.8x"],
  ["AVAX", "25.91", "+1.48%", "$612M", "1.1x"],
] as const;

const institutions = [
  ["Berkshire Hathaway", "13F", "$267.1B", "41"],
  ["BlackRock", "13F", "$4.9T", "5,112"],
  ["Bridgewater", "13F", "$21.8B", "746"],
  ["Citadel Advisors", "13F", "$578.3B", "15,422"],
  ["Vanguard Group", "13F", "$5.8T", "4,912"],
] as const;

const executives = [
  ["Tim Cook", "AAPL", "$24.2M", "Form 4"],
  ["Satya Nadella", "MSFT", "$14.7M", "Form 4"],
  ["Jensen Huang", "NVDA", "$13.5M", "Form 4"],
  ["Mark Zuckerberg", "META", "$8.9M", "Form 4"],
  ["Andy Jassy", "AMZN", "$6.3M", "Form 4"],
] as const;

const congress = [
  ["Nancy Pelosi", "CA-11", "$1M–$5M", "45 days"],
  ["Tommy Tuberville", "AL", "$250K–$500K", "32 days"],
  ["Dan Crenshaw", "TX-02", "$100K–$250K", "28 days"],
  ["Josh Gottheimer", "NJ-05", "$50K–$100K", "19 days"],
  ["Ro Khanna", "CA-17", "$15K–$50K", "12 days"],
] as const;

const secFeeds = [institutions, executives, congress] as const;

const notes = [
  ["★", "09:41", "NVDA", "Watch $175 resistance after earnings call"],
  [" ", "YDAY", "MSFT", "Cloud growth still above consensus"],
  [" ", "JUL24", "—", "Review portfolio exposure before FOMC"],
  ["★", "JUL22", "BTC", "Institutional flows back above 30d mean"],
] as const;

function PanelTitle({ title, active }: { title: string; active: boolean }) {
  return (
    <div className="h-[22px] text-[13px] font-bold leading-[22px]">
      <span className={active ? "bg-[#e8e8e8] px-1 text-[#0c0c0c]" : "px-1 text-[#d0d0d0]"}>
        {title}
      </span>
    </div>
  );
}

function Tabs({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex h-[25px] items-start gap-5 border-b border-[#5b5b5b] text-[10px] font-bold text-[#8f8f8f]">
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(index)}
          className={`h-[25px] px-1 ${selected === index ? "border-b-2 border-[#e8e8e8] text-[#e8e8e8]" : "hover:text-[#d0d0d0]"}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Window({
  id,
  onFocus,
  children,
}: {
  id: Panel;
  onFocus: (panel: Panel) => void;
  children: React.ReactNode;
}) {
  const divider =
    id === "news"
      ? "border-b border-r"
      : id === "watchlist"
        ? "border-b"
        : id === "sec"
          ? "border-r"
          : "";
  return (
    <section
      onMouseDown={() => onFocus(id)}
      className={`min-h-0 overflow-hidden border-[#555] px-3 py-2.5 sm:px-4 sm:py-3 ${divider}`}
    >
      {children}
    </section>
  );
}

export function ApeTermWeb() {
  const [focused, setFocused] = useState<Panel>("news");
  const [newsTab, setNewsTab] = useState(0);
  const [watchTab, setWatchTab] = useState(0);
  const [secTab, setSecTab] = useState(0);
  const [notesTab, setNotesTab] = useState(0);
  const [newsRow, setNewsRow] = useState(0);
  const [quoteRow, setQuoteRow] = useState(2);
  const [secRow, setSecRow] = useState(0);
  const [noteRow, setNoteRow] = useState(0);
  const [agentOpen, setAgentOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [stockOrder, setStockOrder] = useState(defaultStockOrder);
  const [watchlistLoaded, setWatchlistLoaded] = useState(false);
  const [spotlightRow, setSpotlightRow] = useState(0);
  const [stockStream, setStockStream] = useState<Record<string, Quote>>({});
  const [cryptoStream, setCryptoStream] = useState<Record<string, Quote>>({});
  const [stockStreamStatus, setStockStreamStatus] = useState("connecting");
  const [cryptoStreamStatus, setCryptoStreamStatus] = useState("connecting");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchRow, setSearchRow] = useState(0);
  const [selectedInstrument, setSelectedInstrument] = useState<SearchResult | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>("3m");
  const searchRef = useRef<HTMLInputElement>(null);

  const market = useQuery({
    queryKey: ["market", stockOrder.join(",")],
    queryFn: () =>
      getJson<MarketData>(`/api/market?symbols=${encodeURIComponent(stockOrder.join(","))}`),
    enabled: typeof window !== "undefined",
    refetchInterval: 60_000,
    retry: 1,
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(watchlistStorageKey) ?? "null");
      if (Array.isArray(saved)) {
        const symbols = saved
          .filter((symbol): symbol is string =>
            typeof symbol === "string" && /^[A-Z]{1,6}(?:-[A-Z])?$/.test(symbol),
          )
          .filter((symbol, index, all) => all.indexOf(symbol) === index)
          .slice(0, 25);
        if (symbols.length) setStockOrder(symbols);
      }
    } catch {
      // Ignore corrupt local state and retain the default list.
    } finally {
      setWatchlistLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (watchlistLoaded) {
      window.localStorage.setItem(watchlistStorageKey, JSON.stringify(stockOrder));
    }
  }, [stockOrder, watchlistLoaded]);

  useEffect(() => {
    const source = new EventSource("/api/yahoo-stream");
    source.onopen = () => setStockStreamStatus("live");
    source.onmessage = (event) => {
      const quote = JSON.parse(event.data) as Quote;
      setStockStream((current) => ({ ...current, [quote.symbol]: quote }));
      setStockStreamStatus(quote.marketState ?? "live");
    };
    source.onerror = () => setStockStreamStatus("reconnecting");
    return () => source.close();
  }, []);

  useEffect(() => {
    let socket: WebSocket | undefined;
    let reconnect: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    const streams = cryptoOrder.map((symbol) => `${symbol.toLowerCase()}usdt@ticker`).join("/");

    const connect = () => {
      setCryptoStreamStatus("connecting");
      socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      socket.onopen = () => setCryptoStreamStatus("live · 1s");
      socket.onmessage = (event) => {
        const ticker = JSON.parse(event.data).data;
        const symbol = String(ticker.s).replace(/USDT$/, "");
        setCryptoStream((current) => ({
          ...current,
          [symbol]: {
            symbol,
            price: Number(ticker.c),
            changePercent: Number(ticker.P),
            volume: Number(ticker.q),
            relativeVolume: null,
          },
        }));
      };
      socket.onerror = () => setCryptoStreamStatus("reconnecting");
      socket.onclose = () => {
        if (!closed) reconnect = setTimeout(connect, 1_500);
      };
    };

    connect();
    return () => {
      closed = true;
      if (reconnect) clearTimeout(reconnect);
      socket?.close();
    };
  }, []);
  const liveNews = useQuery({
    queryKey: ["news", newsCategories[newsTab]],
    queryFn: () => getJson<NewsData>(`/api/news?category=${newsCategories[newsTab]}`),
    enabled: typeof window !== "undefined",
    refetchInterval: 120_000,
    staleTime: 60_000,
    retry: 1,
  });
  const sec = useQuery({
    queryKey: ["sec-13f-v3"],
    queryFn: () => getJson<SecData>("/api/sec?view=13f-v3"),
    enabled: typeof window !== "undefined",
    refetchInterval: 300_000,
    staleTime: 300_000,
    retry: 1,
  });
  const instrumentSearch = useQuery({
    queryKey: ["instrument-search", debouncedSearch],
    queryFn: () => getJson<SearchData>(`/api/search?q=${encodeURIComponent(debouncedSearch)}`),
    enabled: typeof window !== "undefined" && debouncedSearch.length > 0,
    staleTime: 60_000,
    retry: 1,
  });
  const instrumentDetail = useQuery({
    queryKey: ["instrument", selectedInstrument?.symbol, chartTimeframe],
    queryFn: () =>
      getJson<InstrumentDetail>(
        `/api/instrument?symbol=${encodeURIComponent(selectedInstrument?.symbol ?? "")}&timeframe=${chartTimeframe}`,
      ),
    enabled: typeof window !== "undefined" && Boolean(selectedInstrument),
    staleTime: 5_000,
    refetchInterval: 15_000,
    retry: 1,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const panels: Panel[] = useMemo(() => ["news", "watchlist", "sec", "notes"], []);
  const searchResults = instrumentSearch.data?.results ?? [];
  const safeSearchRow = searchResults.length ? searchRow % searchResults.length : 0;
  const activeNewsItems = liveNews.data?.items.length ? liveNews.data.items : null;
  const activeHeadlines = activeNewsItems
    ? activeNewsItems.map(
        (item) => [item.age, item.source.toUpperCase(), item.symbol, item.title] as const,
      )
    : newsFeeds[newsTab];
  const liveQuotes =
    watchTab === 0
      ? orderedQuotes(stockOrder, market.data?.stocks, stockStream)
      : orderedQuotes(cryptoOrder, market.data?.crypto, cryptoStream);
  const activeQuotes = liveQuotes?.length
    ? liveQuotes.map((quote) => formatQuoteRow(quote, watchTab === 1))
    : watchTab === 0
      ? mainQuotes
      : cryptoQuotes;
  const liveInstitutions = sec.data?.entities.length
    ? sec.data.entities.map((entity) => {
        return [
          entity.name,
          entity.filing.form,
          compactNumber(entity.totalValueUsd, true),
          `${entity.positions}`,
        ] as const;
      })
    : null;
  const activeSecFeed = secTab === 0 && liveInstitutions ? liveInstitutions : secFeeds[secTab];
  const safeSecRow = secRow % activeSecFeed.length;
  const selectedSecEntity = secTab === 0 ? sec.data?.entities[safeSecRow] : undefined;
  const activeNotes = notes.filter((row) => {
    if (notesTab === 1) return row[2] !== "—";
    if (notesTab === 2) return row[2] === "—";
    if (notesTab === 3) return row[0] === "★";
    return true;
  });

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (event.key === "Escape") {
        if (selectedInstrument) setSelectedInstrument(null);
        else setOverlay(null);
        return;
      }
      if (typing) return;
      if (selectedInstrument) {
        const current = chartTimeframes.indexOf(chartTimeframe);
        if (event.key === "ArrowRight" || event.key === "t") {
          event.preventDefault();
          setChartTimeframe(chartTimeframes[(current + 1) % chartTimeframes.length]);
        } else if (event.key === "ArrowLeft" || event.key === "T") {
          event.preventDefault();
          setChartTimeframe(
            chartTimeframes[(current - 1 + chartTimeframes.length) % chartTimeframes.length],
          );
        } else if (/^[1-8]$/.test(event.key)) {
          setChartTimeframe(chartTimeframes[Number(event.key) - 1]);
        }
        return;
      }
      if (event.ctrlKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setOverlay("spotlight");
        return;
      }
      if (event.key === "Tab") {
        event.preventDefault();
        setFocused((current) => {
          const index = panels.indexOf(current);
          return panels[(index + (event.shiftKey ? 3 : 1)) % panels.length];
        });
      } else if (event.key === "a") setAgentOpen((open) => !open);
      else if (event.key === "/") {
        setSelectedInstrument(null);
        setOverlay("search");
      } else if (event.key === ",") setOverlay("settings");
      else if (event.key === "?") setOverlay("help");
      else if (event.key === "ArrowRight") {
        if (focused === "news") setNewsTab((value) => (value + 1) % 5);
        if (focused === "watchlist") setWatchTab((value) => (value + 1) % 2);
        if (focused === "sec") setSecTab((value) => (value + 1) % 3);
        if (focused === "notes") setNotesTab((value) => (value + 1) % 4);
      } else if (event.key === "ArrowDown" || event.key === "j") {
        if (focused === "news") setNewsRow((value) => (value + 1) % activeHeadlines.length);
        if (focused === "watchlist") setQuoteRow((value) => (value + 1) % activeQuotes.length);
        if (focused === "sec") setSecRow((value) => (value + 1) % activeSecFeed.length);
        if (focused === "notes") setNoteRow((value) => (value + 1) % activeNotes.length);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [
    activeHeadlines.length,
    activeNotes.length,
    activeQuotes.length,
    activeSecFeed.length,
    chartTimeframe,
    focused,
    overlay,
    panels,
    selectedInstrument,
  ]);

  useEffect(() => {
    if (overlay === "search" && !selectedInstrument) searchRef.current?.focus();
  }, [overlay, selectedInstrument]);

  const submitAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = agentInput.trim();
    if (!content || agentLoading) return;
    const nextMessages = [...agentMessages, { role: "user", content } satisfies AgentMessage];
    setAgentMessages(nextMessages);
    setAgentInput("");
    setAgentError("");
    setAgentLoading(true);
    try {
      const context = [
        `Watchlist symbols: ${stockOrder.join(", ")}`,
        `Watchlist quotes: ${activeQuotes.map((quote) => `${quote[0]} ${quote[1]} ${quote[2]}`).join(", ")}`,
        `Latest news: ${activeHeadlines
          .slice(0, 8)
          .map((item) => `${item[2]}: ${item[3]}`)
          .join(" | ")}`,
        `SEC focus: ${activeSecFeed[safeSecRow]?.[0] ?? "none"}`,
      ].join("\n");
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, context }),
      });
      const data = (await response.json()) as AgentData & { error?: string };
      if (!response.ok) throw new Error(data.error ?? `Agent ${response.status}`);
      for (const action of data.actions ?? []) {
        const symbol = action.symbol.trim().toUpperCase();
        if (!/^[A-Z]{1,6}(?:-[A-Z])?$/.test(symbol)) continue;
        if (action.type === "add_to_watchlist") {
          setStockOrder((current) =>
            current.includes(symbol) || current.length >= 25 ? current : [...current, symbol],
          );
        } else {
          setStockOrder((current) => current.filter((item) => item !== symbol));
        }
      }
      setAgentMessages((messages) => [...messages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setAgentError(error instanceof Error ? error.message : "Agent unavailable");
    } finally {
      setAgentLoading(false);
    }
  };

  if (selectedInstrument) {
    return (
      <InstrumentChart
        instrument={selectedInstrument}
        detail={instrumentDetail.data}
        loading={instrumentDetail.isPending}
        error={instrumentDetail.isError}
        timeframe={chartTimeframe}
        onTimeframe={setChartTimeframe}
        onClose={() => setSelectedInstrument(null)}
      />
    );
  }

  return (
    <div className="h-screen min-h-[460px] overflow-hidden bg-[#0c0c0c] font-mono text-[12px] leading-[1.36] text-[#e8e8e8] selection:bg-[#e8e8e8] selection:text-[#0c0c0c]">
      <div className="flex h-[calc(100vh-22px)] min-h-[438px]">
        <main
          className={`grid min-w-0 flex-1 grid-cols-2 grid-rows-2 ${agentOpen ? "border-r border-[#3a3a3a]" : ""}`}
        >
          <Window id="news" onFocus={setFocused}>
            <PanelTitle title=" news " active={focused === "news"} />
            <Tabs
              items={["ALL", "WATCHLIST", "MACRO", "REDDIT", "CRYPTO"]}
              selected={newsTab}
              onSelect={(index) => {
                setNewsTab(index);
                setNewsRow(0);
              }}
            />
            <div className="mt-2.5 space-y-[3px] overflow-hidden">
              {activeHeadlines.map((item, index) => (
                <button
                  key={item[1] + item[0]}
                  type="button"
                  onClick={() => setNewsRow(index)}
                  onDoubleClick={() => {
                    const url = activeNewsItems?.[index]?.url;
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className={`grid w-full grid-cols-[38px_84px_48px_minmax(0,1fr)] gap-2 whitespace-nowrap text-left ${newsRow === index ? "bg-[#181818]" : ""}`}
                >
                  <span className="text-[#909090]">{item[0]}</span>
                  <span className="truncate text-[#909090]">{item[1]}</span>
                  <span className="font-bold text-[#34d399]">{item[2]}</span>
                  <span className="truncate">{item[3]}</span>
                </button>
              ))}
            </div>
            <p
              className={`mt-2 text-right ${liveNews.isError ? "text-[#f87171]" : "text-[#909090]"}`}
            >
              {liveNews.isPending
                ? "○ loading feed"
                : liveNews.isError
                  ? "! feed unavailable · cached sample"
                  : `● live · ${activeNewsItems?.length ?? 0} stories`}
            </p>
          </Window>

          <Window id="watchlist" onFocus={setFocused}>
            <PanelTitle title=" watchlist " active={focused === "watchlist"} />
            <Tabs
              items={["MAIN", "CRYPTO"]}
              selected={watchTab}
              onSelect={(index) => {
                setWatchTab(index);
                setQuoteRow(0);
              }}
            />
            <div className="mt-2.5 grid grid-cols-[68px_80px_80px_68px_42px] gap-x-2 text-[#8f8f8f]">
              <span>symbol</span>
              <span className="text-right">price</span>
              <span className="text-right">change</span>
              <span className="text-right">volume</span>
              <span className="text-right">rvol</span>
            </div>
            <div className="mt-1 space-y-[2px]">
              {activeQuotes.map((row, index) => (
                <button
                  key={row[0]}
                  type="button"
                  onClick={() => setQuoteRow(index)}
                  className={`grid w-full grid-cols-[68px_80px_80px_68px_42px] gap-x-2 text-left ${quoteRow === index ? "bg-[#181818]" : ""}`}
                >
                  <span className="font-bold">
                    {row[0]}
                    {index === quoteRow ? <span className="ml-1 text-[#d0d0d0]">•</span> : null}
                  </span>
                  <span className="text-right">{row[1]}</span>
                  <span
                    className={`text-right ${row[2].startsWith("+") ? "text-[#34d399]" : "text-[#f87171]"}`}
                  >
                    {row[2].startsWith("+") ? "▲ " : "▼ "}
                    {row[2]}
                  </span>
                  <span className="text-right text-[#909090]">{row[3]}</span>
                  <span className="text-right text-[#909090]">{row[4]}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-right text-[#909090]">
              {market.isPending
                ? "○ loading market"
                : market.isError
                  ? "! market unavailable · cached sample"
                  : watchTab === 0
                    ? `● yfinance · ${stockStreamStatus.replaceAll("_", " ")} · 1s`
                    : `● binance · ${cryptoStreamStatus}`}
            </p>
          </Window>

          <Window id="sec" onFocus={setFocused}>
            <PanelTitle title=" sec " active={focused === "sec"} />
            <Tabs
              items={["INSTITUTIONAL", "CEOS", "CONGRESS"]}
              selected={secTab}
              onSelect={(index) => {
                setSecTab(index);
                setSecRow(0);
              }}
            />
            <div className="mt-2.5 grid h-[calc(100%-55px)] grid-cols-[42%_1fr] gap-3 overflow-hidden">
              <div className="space-y-[3px] border-r border-[#3a3a3a] pr-3">
                {activeSecFeed.map((row, index) => (
                  <button
                    key={row[0]}
                    type="button"
                    onClick={() => setSecRow(index)}
                    className={`block w-full truncate text-left ${safeSecRow === index ? "bg-[#181818] font-bold" : ""}`}
                  >
                    <span className="mr-2 text-[#34d399]">▲</span>
                    {row[0]}
                  </button>
                ))}
              </div>
              <div>
                <p className="font-bold">{activeSecFeed[safeSecRow][0]}</p>
                <p className="mt-1 text-[#909090]">
                  {secTab === 0 && selectedSecEntity
                    ? `13F value ${compactNumber(selectedSecEntity.totalValueUsd, true)} · Positions ${selectedSecEntity.positions} · ${selectedSecEntity.filing.reportDate}`
                    : secTab === 0
                      ? `${activeSecFeed[safeSecRow][1]} value ${activeSecFeed[safeSecRow][2]} · Positions ${activeSecFeed[safeSecRow][3]}`
                      : secTab === 1
                        ? `${activeSecFeed[safeSecRow][1]} · disclosed ${activeSecFeed[safeSecRow][2]} · ${activeSecFeed[safeSecRow][3]}`
                        : `${activeSecFeed[safeSecRow][1]} · range ${activeSecFeed[safeSecRow][2]} · filed ${activeSecFeed[safeSecRow][3]} ago`}
                </p>
                <div className="mt-4 grid grid-cols-[1fr_64px_48px] gap-x-2">
                  {secTab === 0 && selectedSecEntity ? (
                    selectedSecEntity.holdings.slice(0, 7).map((holding, index) => (
                      <button
                        key={`${holding.cusip}-${index}`}
                        type="button"
                        onClick={() =>
                          window.open(
                            selectedSecEntity.filing.documentUrl,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                        className="col-span-3 grid grid-cols-subgrid text-left hover:bg-[#181818]"
                      >
                        <span className="truncate" title={holding.issuer}>
                          {holding.symbol}
                        </span>
                        <span className="text-right">{compactNumber(holding.valueUsd, true)}</span>
                        <span className="text-right text-[#909090]">
                          {holding.weight.toFixed(1)}%
                        </span>
                      </button>
                    ))
                  ) : secTab === 0 ? (
                    <>
                      <span>APPLE INC</span>
                      <span className="text-right">300.0M</span>
                      <span className="text-right text-[#909090]">28.1%</span>
                      <span>AMERICAN EXPRESS</span>
                      <span className="text-right">151.6M</span>
                      <span className="text-right text-[#909090]">15.4%</span>
                      <span>COCA COLA CO</span>
                      <span className="text-right">400.0M</span>
                      <span className="text-right text-[#909090]">9.8%</span>
                      <span>OCCIDENTAL PET</span>
                      <span className="text-right">264.9M</span>
                      <span className="text-right text-[#34d399]">New</span>
                    </>
                  ) : secTab === 1 ? (
                    <>
                      <span>FORM 4</span>
                      <span className="text-right">SELL</span>
                      <span className="text-right text-[#f87171]">filed</span>
                      <span>COMMON STOCK</span>
                      <span className="text-right">50,000</span>
                      <span className="text-right text-[#909090]">shares</span>
                      <span>AVG PRICE</span>
                      <span className="text-right">$242.12</span>
                      <span className="text-right text-[#909090]">USD</span>
                    </>
                  ) : (
                    <>
                      <span>NVDA</span>
                      <span className="text-right">BUY</span>
                      <span className="text-right text-[#34d399]">$1M–5M</span>
                      <span>AVGO</span>
                      <span className="text-right">BUY</span>
                      <span className="text-right text-[#34d399]">$250K</span>
                      <span>V</span>
                      <span className="text-right">SELL</span>
                      <span className="text-right text-[#f87171]">$100K</span>
                    </>
                  )}
                </div>
                {secTab === 0 && (
                  <p
                    className={`mt-3 text-right ${sec.isError ? "text-[#f87171]" : "text-[#909090]"}`}
                  >
                    {sec.isPending
                      ? "○ loading EDGAR"
                      : sec.isError
                        ? "! EDGAR unavailable · cached sample"
                        : sec.data?.errors.length
                          ? "◐ cached 13F · EDGAR retrying"
                          : `● 13F holdings · filed ${selectedSecEntity?.filing.filedAt ?? "—"}`}
                  </p>
                )}
              </div>
            </div>
          </Window>

          <Window id="notes" onFocus={setFocused}>
            <PanelTitle title=" notes " active={focused === "notes"} />
            <Tabs
              items={["ALL", "TICKERS", "JOURNAL", "PINNED"]}
              selected={notesTab}
              onSelect={(index) => {
                setNotesTab(index);
                setNoteRow(0);
              }}
            />
            <div className="mt-2.5 space-y-[3px]">
              {activeNotes.map((row, index) => (
                <button
                  key={row[1] + row[2]}
                  type="button"
                  onClick={() => setNoteRow(index)}
                  className={`grid w-full grid-cols-[18px_48px_52px_minmax(0,1fr)] gap-2 whitespace-nowrap text-left ${noteRow === index ? "bg-[#181818]" : ""}`}
                >
                  <span>{row[0]}</span>
                  <span className="text-right text-[#909090]">{row[1]}</span>
                  <span className={row[2] === "—" ? "text-[#909090]" : "font-bold text-[#34d399]"}>
                    {row[2]}
                  </span>
                  <span className="truncate">{row[3]}</span>
                </button>
              ))}
            </div>
          </Window>
        </main>

        {agentOpen && (
          <aside className="flex w-[32%] min-w-[300px] max-w-[440px] flex-col px-4 py-3">
            <div className="flex h-[25px] items-start gap-3 font-bold">
              <span>agent</span>
              <span className="text-[#34d399]">●</span>
              <span className="font-normal text-[#909090]">openrouter/free</span>
            </div>
            <div className="flex-1 overflow-y-auto pt-3">
              {agentMessages.length === 0 ? (
                <>
                  <p className="font-bold">Ask something and I'll take a look.</p>
                  <div className="mt-5 space-y-3 text-[#909090]">
                    <p>What's moving in my watchlist?</p>
                    <p>Summarize the latest NVDA news.</p>
                    <p>Compare AAPL and MSFT fundamentals.</p>
                  </div>
                </>
              ) : (
                agentMessages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className="mb-4">
                    <p className="text-[#909090]">{message.role === "user" ? "you" : "ape"}</p>
                    <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))
              )}
              {agentLoading && (
                <p className="mb-4 text-[#909090]">
                  ape
                  <br />○ thinking...
                </p>
              )}
              {agentError && <p className="mb-4 text-[#f87171]">! {agentError}</p>}
            </div>
            <form onSubmit={submitAgent} className="border-t border-[#909090] pt-1">
              <label htmlFor="agent" className="sr-only">
                Ask agent
              </label>
              <div className="flex">
                <span className="mr-2 text-[#d0d0d0]">❯</span>
                <input
                  id="agent"
                  value={agentInput}
                  disabled={agentLoading}
                  onChange={(event) => setAgentInput(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#909090]"
                  placeholder="Ask anything..."
                />
              </div>
              <p className="mt-1 text-[#909090]">⏎ send esc close</p>
            </form>
          </aside>
        )}
      </div>

      <footer className="h-[22px] overflow-hidden whitespace-nowrap bg-[#0c0c0c] px-1 text-[11px] leading-[22px] text-[#777]">
        [a] agent&nbsp;&nbsp; [/] search&nbsp;&nbsp; [,] settings&nbsp;&nbsp; [E]
        simple/pro&nbsp;&nbsp; [ctrl+p] spotlight&nbsp;&nbsp; [?] help&nbsp;&nbsp; [q] quit
        {focused === "news" && (
          <span>
            &nbsp;&nbsp; [←/→] filter&nbsp;&nbsp; [j/k] move&nbsp;&nbsp; [enter]
            open/toggle&nbsp;&nbsp; [o] browser&nbsp;&nbsp; [r] refresh
          </span>
        )}
      </footer>

      {overlay && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOverlay(null);
          }}
        >
          <div className="w-full max-w-[620px] border border-[#d0d0d0] bg-[#0c0c0c] p-1 text-[12px] shadow-[0_0_0_1px_#0c0c0c]">
            {overlay === "search" && (
              <div>
                <p className="bg-[#e8e8e8] px-1 font-bold text-[#0c0c0c]">search instruments</p>
                <>
                  <div className="flex border-b border-[#3a3a3a] px-2 py-3">
                    <span className="mr-2">❯</span>
                    <input
                      ref={searchRef}
                      aria-label="Search instruments"
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setSearchRow(0);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown" && searchResults.length) {
                          event.preventDefault();
                          setSearchRow((row) => (row + 1) % searchResults.length);
                        } else if (event.key === "ArrowUp" && searchResults.length) {
                          event.preventDefault();
                          setSearchRow(
                            (row) => (row - 1 + searchResults.length) % searchResults.length,
                          );
                        } else if (event.key === "Enter" && searchResults[safeSearchRow]) {
                          event.preventDefault();
                          setChartTimeframe("3m");
                          setSelectedInstrument(searchResults[safeSearchRow]);
                        }
                      }}
                      className="min-w-0 flex-1 bg-transparent outline-none"
                      placeholder="symbol or company name"
                    />
                  </div>
                  <div className="min-h-[120px] max-h-[310px] overflow-y-auto py-1">
                    {!searchQuery.trim() ? (
                      <p className="px-2 py-5 text-center text-[#909090]">
                        Search standard U.S. stocks and ETFs
                      </p>
                    ) : instrumentSearch.isPending ? (
                      <p className="px-2 py-5 text-center text-[#909090]">○ searching Yahoo</p>
                    ) : instrumentSearch.isError ? (
                      <p className="px-2 py-5 text-center text-[#f87171]">! search unavailable</p>
                    ) : searchResults.length === 0 ? (
                      <p className="px-2 py-5 text-center text-[#909090]">no instruments found</p>
                    ) : (
                      searchResults.map((result, index) => (
                        <button
                          key={`${result.symbol}-${result.exchange}`}
                          type="button"
                          onMouseEnter={() => setSearchRow(index)}
                          onClick={() => {
                            setChartTimeframe("3m");
                            setSelectedInstrument(result);
                          }}
                          className={`grid w-full grid-cols-[90px_minmax(0,1fr)_90px_80px] gap-2 px-2 py-1 text-left ${safeSearchRow === index ? "bg-[#181818]" : ""}`}
                        >
                          <span className="font-bold text-[#34d399]">{result.symbol}</span>
                          <span className="truncate">{result.name}</span>
                          <span className="truncate text-[#909090]">{result.type}</span>
                          <span className="truncate text-right text-[#909090]">
                            {result.exchange}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  <p className="border-t border-[#3a3a3a] px-2 py-2 text-[#909090]">
                    ↑↓ select · enter open · esc close
                  </p>
                </>
              </div>
            )}
            {overlay === "spotlight" && (
              <div>
                <p className="bg-[#e8e8e8] px-1 font-bold text-[#0c0c0c]"> Spotlight </p>
                {[
                  "Search instruments",
                  "Open AI Agent Panel",
                  "Portfolio",
                  "Alerts",
                  "Screener",
                  "Compare",
                  "Calendar",
                  "Settings",
                ].map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    onMouseEnter={() => setSpotlightRow(index)}
                    onClick={() => {
                      if (index === 0) {
                        setSelectedInstrument(null);
                        setOverlay("search");
                        return;
                      }
                      if (index === 1) setAgentOpen(true);
                      setOverlay(null);
                    }}
                    className={`block w-full px-2 py-1 text-left ${spotlightRow === index ? "bg-[#181818] font-bold" : ""}`}
                  >
                    {spotlightRow === index ? "> " : "  "}
                    {item}
                  </button>
                ))}
                <p className="mt-2 px-2 text-[#909090]">↑↓ navigate [enter] open [esc] close</p>
              </div>
            )}
            {overlay === "settings" && (
              <div>
                <p className="bg-[#e8e8e8] px-1 font-bold text-[#0c0c0c]"> Settings </p>
                <div className="grid grid-cols-2 gap-y-2 px-3 py-4">
                  <span>Experience</span>
                  <span>Pro</span>
                  <span>Tone</span>
                  <span>Normal</span>
                  <span>Explanations</span>
                  <span>beginner</span>
                  <span>Agent style</span>
                  <span>Chat</span>
                  <span>Language</span>
                  <span>English</span>
                  <span>Theme</span>
                  <span>Dark</span>
                </div>
                <p className="px-2 pb-2 text-[#909090]">[j/k] move [enter] change [esc] back</p>
              </div>
            )}
            {overlay === "help" && (
              <div>
                <p className="bg-[#e8e8e8] px-1 font-bold text-[#0c0c0c]"> keys </p>
                <div className="grid grid-cols-[180px_1fr] gap-y-1 px-3 py-4">
                  <span>tab / shift+tab</span>
                  <span>focus next / previous</span>
                  <span>h j k l</span>
                  <span>move focus</span>
                  <span>ctrl+h/j/k/l</span>
                  <span>resize focused pane</span>
                  <span>ctrl+c</span>
                  <span>change focused pane</span>
                  <span>/</span>
                  <span>search instruments</span>
                  <span>a</span>
                  <span>agent</span>
                  <span>esc</span>
                  <span>close help</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
