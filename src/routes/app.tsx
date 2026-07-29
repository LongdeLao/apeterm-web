import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AuthGate } from "@/components/auth-gate";
import { useApeAuth } from "@/lib/auth-context";
import { autoStartTour, resetTour, startTour } from "@/onboarding/tour";
import {
  InstrumentChart,
  chartTimeframes,
  type ChartDetail,
  type ChartTimeframe,
  type CompanyProfile,
  type SymbolFiling,
  type SymbolHeadline,
} from "@/components/instrument-chart";
import type { ClientAction } from "@/lib/agent-tools";
import {
  cancelAlert,
  deleteGroup,
  deleteNote,
  insertAlert,
  insertGroup,
  insertNote,
  listAlerts,
  listGroups,
  listLayouts,
  listNotes,
  updateGroup,
  updateNote,
  upsertLayout,
  type Alert,
  type Layout,
  type Note,
  type WatchlistGroup,
} from "@/lib/workspace-store";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "ApeTerm" }, { name: "description", content: "ApeTerm in your browser." }],
  }),
  component: AuthenticatedApeTerm,
});

type Panel = "news" | "watchlist" | "sec" | "notes";
type PanelLayout = Record<Panel, number>;
type Overlay = "search" | "spotlight" | "help" | null;
type AppPage = "workspace" | "settings";
type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  relativeVolume: number | null;
  marketState?: string;
  receivedAt?: string;
  source?: "websocket" | "snapshot";
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
type Experience = "simple" | "pro";
type Density = "comfortable" | "compact";
type AgentTone = "concise" | "normal" | "detailed";
type ExplanationLevel = "beginner" | "experienced";
type WebPreferences = {
  experience: Experience;
  density: Density;
  agentTone: AgentTone;
  explanations: ExplanationLevel;
  highContrast: boolean;
};
type AgentMessage = { role: "user" | "assistant"; content: string };
type SymbolExtras = { profile: CompanyProfile | null; filings: SymbolFiling[] };
type StockStreamEvent = Quote & { type?: string; status?: string };
/** One reversible step, pushed before the agent mutates anything. */
type UndoStep = { label: string; revert: () => void | Promise<void> };

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
const cryptoWatchlistStorageKey = "apeterm:crypto-watchlist";
const preferencesStorageKey = "apeterm:web-preferences";
const defaultPreferences: WebPreferences = {
  experience: "pro",
  density: "compact",
  agentTone: "normal",
  explanations: "experienced",
  highContrast: false,
};
const defaultPanelLayout: PanelLayout = { news: 0, watchlist: 1, sec: 2, notes: 3 };
const cryptoOrder = ["BTC", "ETH", "SOL", "XRP", "BNB", "DOGE", "ADA", "AVAX"];
const cryptoAliases = new Map([
  ["BITCOIN", "BTC"],
  ["ETHEREUM", "ETH"],
  ["SOLANA", "SOL"],
  ["TRON", "TRX"],
  ["CARDANO", "ADA"],
  ["DOGECOIN", "DOGE"],
]);
const commonSearchResults: SearchResult[] = [
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
    const streamQuote = streamed[symbol];
    const fallbackQuote = fallback.get(symbol);
    const quote = streamQuote
      ? {
          ...fallbackQuote,
          ...streamQuote,
          relativeVolume: streamQuote.relativeVolume ?? fallbackQuote?.relativeVolume ?? null,
        }
      : fallbackQuote;
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
  slot,
  onFocus,
  onMove,
  tour,
  children,
}: {
  id: Panel;
  slot: number;
  onFocus: (panel: Panel) => void;
  onMove: (from: Panel, to: Panel) => void;
  tour?: string;
  children: React.ReactNode;
}) {
  const position =
    slot === 0
      ? "col-start-1 row-start-1"
      : slot === 1
        ? "col-start-3 row-start-1"
        : slot === 2
          ? "col-start-1 row-start-3"
          : "col-start-3 row-start-3";
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
      data-tour={tour}
      draggable
      onDragStart={(event) => event.dataTransfer.setData("text/plain", id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const from = event.dataTransfer.getData("text/plain") as Panel;
        if (from && from !== id) onMove(from, id);
      }}
      onMouseDown={() => onFocus(id)}
      className={`min-h-0 overflow-hidden border-[#555] px-3 py-2.5 sm:px-4 sm:py-3 ${position} ${divider}`}
    >
      {children}
    </section>
  );
}

function AgentText({ content }: { content: string }) {
  return (
    <div className="mt-1 space-y-1">
      {content.split("\n").map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;
        const bullet = /^[-*]\s+/.test(trimmed);
        const numbered = /^\d+\.\s+/.test(trimmed);
        return (
          <p
            key={index}
            className={`${bullet || numbered ? "pl-3" : ""} ${trimmed.startsWith("```") ? "text-[#909090]" : ""}`}
          >
            {trimmed.replace(/^[-*]\s+/, "• ")}
          </p>
        );
      })}
    </div>
  );
}

function SettingChoices<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`border px-2 py-1 capitalize ${
            value === option
              ? "border-[#e8e8e8] bg-[#e8e8e8] text-[#0c0c0c]"
              : "border-[#555] text-[#a8a8a8] hover:border-[#909090] hover:text-[#e8e8e8]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function SettingsPage({
  preferences,
  authEmail,
  onChange,
  onReset,
  onClose,
}: {
  preferences: WebPreferences;
  authEmail?: string;
  onChange: (patch: Partial<WebPreferences>) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <main className="h-[calc(100vh-22px)] min-h-[438px] overflow-y-auto px-4 py-3">
      <div className="mx-auto flex min-h-full w-full max-w-[980px] flex-col">
        <div className="flex items-center justify-between border-b border-[#555] pb-2">
          <div>
            <p className="font-bold">settings</p>
            <p className="mt-1 text-[#777]">Saved automatically in this browser.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#555] px-2 py-1 text-[#a8a8a8] hover:border-[#909090] hover:text-[#e8e8e8]"
          >
            back
          </button>
        </div>
        <div className="divide-y divide-[#303030]">
          <section className="grid gap-4 py-6 sm:grid-cols-[minmax(180px,1fr)_2fr]">
            <div>
              <p className="font-bold">Interface</p>
              <p className="mt-1 text-[#777]">Layout and visual density.</p>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[#a8a8a8]">Experience</span>
                <SettingChoices
                  value={preferences.experience}
                  options={["simple", "pro"] as const}
                  onChange={(experience) => onChange({ experience })}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[#a8a8a8]">Density</span>
                <SettingChoices
                  value={preferences.density}
                  options={["comfortable", "compact"] as const}
                  onChange={(density) => onChange({ density })}
                />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <span className="block text-[#a8a8a8]">High contrast</span>
                  <span className="text-[#777]">Increase terminal contrast.</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences.highContrast}
                  onClick={() => onChange({ highContrast: !preferences.highContrast })}
                  className={`min-w-[44px] border px-2 py-1 ${
                    preferences.highContrast
                      ? "border-[#34d399] text-[#34d399]"
                      : "border-[#555] text-[#777]"
                  }`}
                >
                  {preferences.highContrast ? "on" : "off"}
                </button>
              </label>
            </div>
          </section>
          <section className="grid gap-4 py-6 sm:grid-cols-[minmax(180px,1fr)_2fr]">
            <div>
              <p className="font-bold">Agent</p>
              <p className="mt-1 text-[#777]">How answers are written.</p>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-[#a8a8a8]">Tone</span>
                <SettingChoices
                  value={preferences.agentTone}
                  options={["concise", "normal", "detailed"] as const}
                  onChange={(agentTone) => onChange({ agentTone })}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[#a8a8a8]">Explanations</span>
                <SettingChoices
                  value={preferences.explanations}
                  options={["beginner", "experienced"] as const}
                  onChange={(explanations) => onChange({ explanations })}
                />
              </label>
            </div>
          </section>
          <section className="grid gap-4 py-6 sm:grid-cols-[minmax(180px,1fr)_2fr]">
            <div>
              <p className="font-bold">Account</p>
              <p className="mt-1 text-[#777]">Browser-specific settings.</p>
            </div>
            <div>
              <p className="text-[#a8a8a8]">{authEmail ?? "Local session"}</p>
              <button
                type="button"
                onClick={onReset}
                className="mt-3 border border-[#555] px-2 py-1 text-[#a8a8a8] hover:border-[#909090] hover:text-[#e8e8e8]"
              >
                Reset settings
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export function ApeTermWeb() {
  const auth = useApeAuth();
  const authenticatedSymbols = auth?.initialSymbols;
  const saveWatchlist = auth?.saveWatchlist;
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
  const [appPage, setAppPage] = useState<AppPage>("workspace");
  const [agentInput, setAgentInput] = useState("");
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [stockOrder, setStockOrder] = useState(auth?.initialSymbols ?? defaultStockOrder);
  const [cryptoSymbols, setCryptoSymbols] = useState(cryptoOrder);
  const [watchlistLoaded, setWatchlistLoaded] = useState(false);
  const [cryptoWatchlistLoaded, setCryptoWatchlistLoaded] = useState(false);
  const [spotlightRow, setSpotlightRow] = useState(0);
  const [stockStream, setStockStream] = useState<Record<string, Quote>>({});
  const [stockStreamStatus, setStockStreamStatus] = useState("connecting");
  const [cryptoStream, setCryptoStream] = useState<Record<string, Quote>>({});
  const [cryptoStreamStatus, setCryptoStreamStatus] = useState("connecting");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchRow, setSearchRow] = useState(0);
  const [selectedInstrument, setSelectedInstrument] = useState<SearchResult | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<ChartTimeframe>("3m");
  const [preferences, setPreferences] = useState<WebPreferences>(defaultPreferences);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [groups, setGroups] = useState<WatchlistGroup[]>([]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [agentToast, setAgentToast] = useState("");
  const [split, setSplit] = useState({ x: 50, y: 50, agent: 32 });
  const [panelLayout, setPanelLayout] = useState<PanelLayout>(defaultPanelLayout);
  const undoStack = useRef<UndoStep[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const agentScrollRef = useRef<HTMLDivElement>(null);

  const updatePreferences = (patch: Partial<WebPreferences>) =>
    setPreferences((current) => ({ ...current, ...patch }));

  const market = useQuery({
    queryKey: ["market", stockOrder.join(",")],
    queryFn: () =>
      getJson<MarketData>(`/api/market?symbols=${encodeURIComponent(stockOrder.join(","))}`),
    enabled: typeof window !== "undefined",
    refetchInterval: 60_000,
    retry: 1,
  });

  useEffect(() => {
    if (authenticatedSymbols) {
      setStockOrder(authenticatedSymbols);
      setWatchlistLoaded(true);
      return;
    }
    try {
      const saved = JSON.parse(window.localStorage.getItem(watchlistStorageKey) ?? "null");
      if (Array.isArray(saved)) {
        const symbols = saved
          .filter(
            (symbol): symbol is string =>
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
  }, [authenticatedSymbols]);

  useEffect(() => {
    if (watchlistLoaded) {
      window.localStorage.setItem(watchlistStorageKey, JSON.stringify(stockOrder));
      void saveWatchlist?.(stockOrder);
    }
  }, [saveWatchlist, stockOrder, watchlistLoaded]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(cryptoWatchlistStorageKey) ?? "null");
      if (Array.isArray(saved)) {
        const symbols = saved
          .map((symbol) =>
            typeof symbol === "string"
              ? (cryptoAliases.get(symbol.trim().toUpperCase()) ?? symbol.trim().toUpperCase())
              : "",
          )
          .filter(
            (symbol, index, all) => /^[A-Z]{2,10}$/.test(symbol) && all.indexOf(symbol) === index,
          )
          .slice(0, 30);
        if (symbols.length) setCryptoSymbols(symbols);
      }
    } catch {
      // Ignore corrupt local crypto state.
    } finally {
      setCryptoWatchlistLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (cryptoWatchlistLoaded) {
      window.localStorage.setItem(cryptoWatchlistStorageKey, JSON.stringify(cryptoSymbols));
    }
  }, [cryptoSymbols, cryptoWatchlistLoaded]);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(preferencesStorageKey) ?? "null",
      ) as Partial<WebPreferences> | null;
      if (saved) setPreferences((current) => ({ ...current, ...saved }));
    } catch {
      // Ignore corrupt local settings.
    } finally {
      setPreferencesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (preferencesLoaded) {
      window.localStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
    }
  }, [preferences, preferencesLoaded]);

  useEffect(() => {
    const handleTourAction = (event: WindowEventMap["apeterm:tour-action"]) => {
      if (event.detail === "open-search") {
        setAppPage("workspace");
        setSelectedInstrument(null);
        setOverlay("search");
      } else if (event.detail === "open-agent") {
        setAppPage("workspace");
        setOverlay(null);
        setAgentOpen(true);
      } else if (event.detail === "close-overlays") {
        setAppPage("workspace");
        setOverlay(null);
      }
    };
    window.addEventListener("apeterm:tour-action", handleTourAction);
    return () => window.removeEventListener("apeterm:tour-action", handleTourAction);
  }, []);

  useEffect(() => {
    window.startTour = startTour;
    window.resetTour = resetTour;
    autoStartTour();
  }, []);

  useEffect(() => {
    setStockStream({});
    setStockStreamStatus("connecting");
    const source = new EventSource(
      `/api/yahoo-stream?symbols=${encodeURIComponent(stockOrder.join(","))}`,
    );
    source.onopen = () => setStockStreamStatus("live · 5s");
    source.onmessage = (event) => {
      const quote = JSON.parse(event.data) as StockStreamEvent;
      if (quote.type === "status") {
        setStockStreamStatus(
          quote.status === "websocket-live"
            ? "websocket"
            : quote.status === "websocket-error" || quote.status === "websocket-closed"
              ? "snapshot fallback"
              : "connecting",
        );
        return;
      }
      setStockStream((current) => ({ ...current, [quote.symbol]: quote }));
      setStockStreamStatus(quote.source === "websocket" ? "websocket" : "snapshot fallback");
    };
    source.onerror = () => setStockStreamStatus("reconnecting");
    return () => source.close();
  }, [stockOrder]);

  useEffect(() => {
    let socket: WebSocket | undefined;
    let reconnect: ReturnType<typeof setTimeout> | undefined;
    let closed = false;
    const streams = cryptoSymbols.map((symbol) => `${symbol.toLowerCase()}usdt@ticker`).join("/");
    if (!streams) return undefined;

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
  }, [cryptoSymbols]);
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
  // Company profile and EDGAR filings for the open instrument. Separate from the
  // chart query so a slow SEC round-trip never delays the price.
  const symbolExtras = useQuery({
    queryKey: ["symbol-extras", selectedInstrument?.symbol],
    queryFn: () =>
      getJson<SymbolExtras>(
        `/api/symbol?symbol=${encodeURIComponent(selectedInstrument?.symbol ?? "")}`,
      ),
    enabled: typeof window !== "undefined" && Boolean(selectedInstrument),
    staleTime: 900_000,
    retry: 1,
  });
  const symbolNews = useQuery({
    queryKey: ["symbol-news", selectedInstrument?.symbol],
    queryFn: () =>
      getJson<NewsData>(
        `/api/news?symbol=${encodeURIComponent(selectedInstrument?.symbol ?? "")}&name=${encodeURIComponent(
          selectedInstrument?.name ?? "",
        )}`,
      ),
    enabled: typeof window !== "undefined" && Boolean(selectedInstrument),
    staleTime: 300_000,
    retry: 1,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Stored workspace data. All four reads are fail-soft: if the migration has not
  // been applied they resolve to empty arrays and the panels stay usable.
  const userId = auth?.userId;
  useEffect(() => {
    if (!userId) return;
    let current = true;
    void Promise.all([
      listNotes(userId),
      listGroups(userId),
      listLayouts(userId),
      listAlerts(userId),
    ]).then(([notesRows, groupRows, layoutRows, alertRows]) => {
      if (!current) return;
      setUserNotes(notesRows);
      setGroups(groupRows);
      setLayouts(layoutRows);
      setAlerts(alertRows);
    });
    return () => {
      current = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!agentToast) return;
    const timer = window.setTimeout(() => setAgentToast(""), 6_000);
    return () => window.clearTimeout(timer);
  }, [agentToast]);

  useEffect(() => {
    agentScrollRef.current?.scrollTo({ top: agentScrollRef.current.scrollHeight });
  }, [agentMessages, agentLoading]);

  // Price alerts are evaluated against each market refresh while the tab is open.
  // Filing alerts and scheduled digests need a server-side job and stay dormant.
  const quotes = market.data?.stocks;
  useEffect(() => {
    if (!quotes?.length || !alerts.length) return;
    for (const alert of alerts) {
      if (alert.triggered_at || !alert.symbol || alert.threshold === null) continue;
      const quote = quotes.find((row) => row.symbol === alert.symbol);
      if (!quote) continue;
      const hit =
        alert.kind === "price_above"
          ? quote.price >= alert.threshold
          : alert.kind === "price_below"
            ? quote.price <= alert.threshold
            : alert.kind === "percent_move"
              ? Math.abs(quote.changePercent) >= alert.threshold
              : false;
      if (!hit) continue;
      setAgentToast(
        `${alert.symbol} ${alert.kind.replace("_", " ")} ${alert.threshold} — now ${quote.price}`,
      );
      setAlerts((current) =>
        current.map((row) =>
          row.id === alert.id ? { ...row, triggered_at: new Date().toISOString() } : row,
        ),
      );
      void cancelAlert(alert.id);
      break;
    }
  }, [quotes, alerts]);

  const panels: Panel[] = useMemo(() => ["news", "watchlist", "sec", "notes"], []);
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toUpperCase();
    if (!query) return [];
    const local = commonSearchResults.filter(
      (result) => result.symbol.includes(query) || result.name.toUpperCase().includes(query),
    );
    return [...local, ...(instrumentSearch.data?.results ?? [])].filter(
      (result, index, all) =>
        all.findIndex((candidate) => candidate.symbol === result.symbol) === index,
    );
  }, [instrumentSearch.data?.results, searchQuery]);
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
      : orderedQuotes(cryptoSymbols, market.data?.crypto, cryptoStream);
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
  // Real notes once the user has any; the seeded rows stay as placeholder content
  // until then so the panel is never blank.
  const noteRows: readonly (readonly [string, string, string, string])[] = userNotes.length
    ? userNotes.map(
        (note) =>
          [
            note.starred ? "★" : " ",
            new Date(note.created_at)
              .toLocaleDateString("en-US", { month: "short", day: "numeric" })
              .toUpperCase(),
            note.symbol || "—",
            note.body,
          ] as const,
      )
    : notes;
  const activeNotes = noteRows.filter((row) => {
    if (notesTab === 1) return row[2] !== "—";
    if (notesTab === 2) return row[2] === "—";
    if (notesTab === 3) return row[0] === "★";
    return true;
  });

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if ((event.metaKey || event.ctrlKey) && event.key === ",") {
        event.preventDefault();
        event.stopPropagation();
        setOverlay(null);
        setAppPage("settings");
        return;
      }
      if (event.key === "Escape") {
        if (appPage === "settings") setAppPage("workspace");
        else if (selectedInstrument) setSelectedInstrument(null);
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
      } else if (event.key === ",") {
        event.preventDefault();
        setOverlay(null);
        setAppPage("settings");
      } else if (event.key === "?") setOverlay("help");
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
    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true });
  }, [
    activeHeadlines.length,
    activeNotes.length,
    activeQuotes.length,
    activeSecFeed.length,
    appPage,
    chartTimeframe,
    focused,
    overlay,
    panels,
    selectedInstrument,
  ]);

  useEffect(() => {
    if (overlay === "search" && !selectedInstrument) searchRef.current?.focus();
  }, [overlay, selectedInstrument]);

  const validSymbol = (value: unknown) => {
    const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
    const symbol = cryptoAliases.get(raw) ?? raw;
    return /^[A-Z]{1,6}(?:-[A-Z]{1,4})?$/.test(symbol) ? symbol : "";
  };
  const wantsCryptoList = (action: { list?: string }, symbols: string[]) =>
    action.list?.toLowerCase() === "crypto" ||
    (watchTab === 1 && action.list?.toLowerCase() !== "main") ||
    symbols.some((symbol) => cryptoSymbols.includes(symbol) || cryptoOrder.includes(symbol));
  const pushUndo = (label: string, revert: UndoStep["revert"]) => {
    undoStack.current = [...undoStack.current.slice(-9), { label, revert }];
  };
  /** Snapshot of the watchlist, so any mutation can be reverted as one step. */
  const snapshotWatchlist = (label: string) => {
    const previous = stockOrder;
    pushUndo(label, () => setStockOrder(previous));
  };
  const movePanel = (from: Panel, to: Panel) => {
    setPanelLayout((current) => ({
      ...current,
      [from]: current[to],
      [to]: current[from],
    }));
  };

  /** Applies one agent tool call to the workspace. */
  const applyAgentAction = async (action: ClientAction) => {
    switch (action.type) {
      case "add_to_watchlist": {
        const symbol = validSymbol(action.symbol);
        if (!symbol) return;
        if (wantsCryptoList(action, [symbol])) {
          const previous = cryptoSymbols;
          pushUndo(`add ${symbol}`, () => setCryptoSymbols(previous));
          setCryptoSymbols((current) =>
            current.includes(symbol) || current.length >= 30 ? current : [...current, symbol],
          );
          setWatchTab(1);
          return;
        }
        snapshotWatchlist(`add ${symbol}`);
        setStockOrder((current) =>
          current.includes(symbol) || current.length >= 25 ? current : [...current, symbol],
        );
        return;
      }
      case "remove_from_watchlist": {
        const symbol = validSymbol(action.symbol);
        if (!symbol) return;
        if (wantsCryptoList(action, [symbol])) {
          const previous = cryptoSymbols;
          pushUndo(`remove ${symbol}`, () => setCryptoSymbols(previous));
          setCryptoSymbols((current) => current.filter((item) => item !== symbol));
          setWatchTab(1);
          return;
        }
        snapshotWatchlist(`remove ${symbol}`);
        setStockOrder((current) => current.filter((item) => item !== symbol));
        return;
      }
      case "add_symbols": {
        const symbols = (action.symbols ?? []).map(validSymbol).filter(Boolean).slice(0, 20);
        if (!symbols.length) return;
        if (wantsCryptoList(action, symbols)) {
          const previous = cryptoSymbols;
          pushUndo(`add ${symbols.length} crypto symbols`, () => setCryptoSymbols(previous));
          setCryptoSymbols((current) => {
            const merged = [...current];
            for (const symbol of symbols)
              if (!merged.includes(symbol) && merged.length < 30) merged.push(symbol);
            return merged;
          });
          setWatchTab(1);
          return;
        }
        snapshotWatchlist(`add ${symbols.length} symbols`);
        setStockOrder((current) => {
          const merged = [...current];
          for (const symbol of symbols)
            if (!merged.includes(symbol) && merged.length < 25) merged.push(symbol);
          return merged;
        });
        return;
      }
      case "sort_watchlist": {
        snapshotWatchlist("sort watchlist");
        const descending = action.descending ?? true;
        const quoteFor = (symbol: string) =>
          market.data?.stocks.find((quote) => quote.symbol === symbol);
        setStockOrder((current) =>
          [...current].sort((left, right) => {
            const a = quoteFor(left);
            const b = quoteFor(right);
            let delta = 0;
            if (action.by === "symbol") delta = left.localeCompare(right);
            else if (action.by === "price") delta = (a?.price ?? 0) - (b?.price ?? 0);
            else if (action.by === "volume") delta = (a?.volume ?? 0) - (b?.volume ?? 0);
            else delta = (a?.changePercent ?? 0) - (b?.changePercent ?? 0);
            return descending && action.by !== "symbol" ? -delta : delta;
          }),
        );
        return;
      }
      case "pin_symbol": {
        const symbol = validSymbol(action.symbol);
        if (!symbol) return;
        snapshotWatchlist(`pin ${symbol}`);
        setStockOrder((current) => [symbol, ...current.filter((item) => item !== symbol)]);
        return;
      }
      case "create_watchlist": {
        if (!userId || !action.name) return;
        const symbols = (action.symbols ?? []).map(validSymbol).filter(Boolean).slice(0, 50);
        const created = await insertGroup(userId, action.name, symbols, groups.length);
        if (!created.length) {
          setAgentToast("Named watchlists need the pending database migration.");
          return;
        }
        setGroups((current) => [...current, ...created]);
        pushUndo(`create list ${action.name}`, async () => {
          await deleteGroup(created[0].id);
          setGroups((current) => current.filter((group) => group.id !== created[0].id));
        });
        return;
      }
      case "switch_watchlist": {
        const group = groups.find((item) => item.name.toLowerCase() === action.name?.toLowerCase());
        if (!group) {
          setAgentToast(`No watchlist named "${action.name}".`);
          return;
        }
        snapshotWatchlist("switch list");
        const previousGroup = activeGroup;
        setActiveGroup(group.id);
        setStockOrder(group.symbols);
        pushUndo(`switch from ${group.name}`, () => setActiveGroup(previousGroup));
        return;
      }
      case "rename_watchlist": {
        const group = groups.find((item) => item.name.toLowerCase() === action.name?.toLowerCase());
        if (!group || !action.to) return;
        await updateGroup(group.id, { name: action.to });
        setGroups((current) =>
          current.map((item) => (item.id === group.id ? { ...item, name: action.to } : item)),
        );
        return;
      }
      case "delete_watchlist": {
        const group = groups.find((item) => item.name.toLowerCase() === action.name?.toLowerCase());
        if (!group) return;
        await deleteGroup(group.id);
        setGroups((current) => current.filter((item) => item.id !== group.id));
        if (activeGroup === group.id) setActiveGroup(null);
        return;
      }

      case "open_instrument": {
        const symbol = validSymbol(action.symbol);
        if (!symbol) return;
        const known = commonSearchResults.find((result) => result.symbol === symbol);
        setSelectedInstrument(known ?? { symbol, name: symbol, type: "EQUITY", exchange: "—" });
        return;
      }
      case "set_timeframe": {
        if (chartTimeframes.includes(action.timeframe)) setChartTimeframe(action.timeframe);
        return;
      }
      case "focus_panel": {
        if (panels.includes(action.panel)) setFocused(action.panel);
        return;
      }
      case "set_news_category": {
        const index = newsCategories.indexOf(action.category);
        if (index >= 0) {
          setNewsTab(index);
          setNewsRow(0);
        }
        return;
      }
      case "set_sec_feed": {
        const index = ["institutions", "executives", "congress"].indexOf(action.feed);
        if (index >= 0) {
          setSecTab(index);
          setSecRow(0);
        }
        return;
      }
      case "open_overlay": {
        setOverlay(action.overlay === "none" ? null : (action.overlay as Overlay));
        return;
      }

      case "create_note": {
        if (!userId || !action.body?.trim()) return;
        const created = await insertNote(userId, {
          body: action.body,
          symbol: validSymbol(action.symbol) || selectedInstrument?.symbol || "—",
          starred: action.starred,
        });
        if (!created.length) {
          setAgentToast("Notes need the pending database migration.");
          return;
        }
        setUserNotes((current) => [...created, ...current]);
        pushUndo("write note", async () => {
          await deleteNote(created[0].id);
          setUserNotes((current) => current.filter((note) => note.id !== created[0].id));
        });
        return;
      }
      case "star_note": {
        const starred = action.starred ?? true;
        const updated = await updateNote(action.id, { starred });
        if (updated.length)
          setUserNotes((current) =>
            current.map((note) => (note.id === action.id ? { ...note, starred } : note)),
          );
        return;
      }
      case "edit_note": {
        const previous = userNotes.find((note) => note.id === action.id);
        const updated = await updateNote(action.id, { body: action.body });
        if (!updated.length) return;
        setUserNotes((current) =>
          current.map((note) => (note.id === action.id ? { ...note, body: action.body } : note)),
        );
        if (previous)
          pushUndo("edit note", async () => {
            await updateNote(previous.id, { body: previous.body });
            setUserNotes((current) =>
              current.map((note) => (note.id === previous.id ? previous : note)),
            );
          });
        return;
      }
      case "delete_note": {
        const previous = userNotes.find((note) => note.id === action.id);
        await deleteNote(action.id);
        setUserNotes((current) => current.filter((note) => note.id !== action.id));
        if (previous)
          pushUndo("delete note", async () => {
            const restored = await insertNote(userId ?? "", {
              body: previous.body,
              symbol: previous.symbol,
              starred: previous.starred,
            });
            if (restored.length) setUserNotes((current) => [...restored, ...current]);
          });
        return;
      }

      case "set_preference": {
        const previous = preferences;
        const value =
          action.key === "highContrast"
            ? action.value === true || action.value === "true"
            : String(action.value);
        updatePreferences({ [action.key]: value } as Partial<WebPreferences>);
        pushUndo(`preference ${action.key}`, () => setPreferences(previous));
        return;
      }
      case "save_layout": {
        if (!userId || !action.name) return;
        const state = {
          stockOrder,
          newsTab,
          watchTab,
          secTab,
          notesTab,
          focused,
          agentOpen,
          chartTimeframe,
          panelLayout,
        };
        const saved = await upsertLayout(userId, action.name, state);
        if (!saved.length) {
          setAgentToast("Saved layouts need the pending database migration.");
          return;
        }
        setLayouts((current) => [
          ...current.filter((layout) => layout.name !== action.name),
          ...saved,
        ]);
        return;
      }
      case "load_layout": {
        const layout = layouts.find(
          (item) => item.name.toLowerCase() === action.name?.toLowerCase(),
        );
        if (!layout) {
          setAgentToast(`No layout named "${action.name}".`);
          return;
        }
        const state = layout.state as Record<string, unknown>;
        snapshotWatchlist(`load layout ${layout.name}`);
        if (Array.isArray(state.stockOrder)) setStockOrder(state.stockOrder as string[]);
        if (typeof state.newsTab === "number") setNewsTab(state.newsTab);
        if (typeof state.watchTab === "number") setWatchTab(state.watchTab);
        if (typeof state.secTab === "number") setSecTab(state.secTab);
        if (typeof state.notesTab === "number") setNotesTab(state.notesTab);
        if (typeof state.focused === "string") setFocused(state.focused as Panel);
        if (typeof state.agentOpen === "boolean") setAgentOpen(state.agentOpen);
        if (typeof state.chartTimeframe === "string")
          setChartTimeframe(state.chartTimeframe as ChartTimeframe);
        if (state.panelLayout && typeof state.panelLayout === "object")
          setPanelLayout({ ...defaultPanelLayout, ...(state.panelLayout as Partial<PanelLayout>) });
        return;
      }
      case "undo_last_action": {
        const step = undoStack.current.pop();
        if (!step) {
          setAgentToast("Nothing to undo.");
          return;
        }
        await step.revert();
        setAgentToast(`Undid: ${step.label}`);
        return;
      }

      case "create_alert": {
        if (!userId) return;
        const created = await insertAlert(userId, {
          kind: action.kind,
          symbol: validSymbol(action.symbol) || undefined,
          filer: action.filer,
          threshold: action.threshold,
          schedule: action.schedule,
          note: action.note,
        });
        if (!created.length) {
          setAgentToast("Alerts need the pending database migration.");
          return;
        }
        setAlerts((current) => [...current, ...created]);
        pushUndo("create alert", async () => {
          await cancelAlert(created[0].id);
          setAlerts((current) => current.filter((alert) => alert.id !== created[0].id));
        });
        return;
      }
      case "cancel_alert": {
        await cancelAlert(action.id);
        setAlerts((current) => current.filter((alert) => alert.id !== action.id));
        return;
      }
      default:
        return;
    }
  };

  const startPaneDrag = (axis: "x" | "y" | "agent") => (event: React.PointerEvent) => {
    event.preventDefault();
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const move = (moveEvent: PointerEvent) => {
      const rect = workspace.getBoundingClientRect();
      setSplit((current) => {
        if (axis === "x") {
          const x = ((moveEvent.clientX - rect.left) / Math.max(1, rect.width)) * 100;
          return { ...current, x: Math.min(72, Math.max(28, x)) };
        }
        if (axis === "y") {
          const y = ((moveEvent.clientY - rect.top) / Math.max(1, rect.height)) * 100;
          return { ...current, y: Math.min(72, Math.max(28, y)) };
        }
        const agent = ((rect.right - moveEvent.clientX) / Math.max(1, rect.width)) * 100;
        return { ...current, agent: Math.min(45, Math.max(22, agent)) };
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

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
        `Response preference: ${preferences.agentTone} tone, ${preferences.explanations} explanations`,
        `Watchlist symbols: ${stockOrder.join(", ")}`,
        `Watchlist quotes: ${activeQuotes.map((quote) => `${quote[0]} ${quote[1]} ${quote[2]}`).join(", ")}`,
        `Latest news: ${activeHeadlines
          .slice(0, 8)
          .map((item) => `${item[2]}: ${item[3]}`)
          .join(" | ")}`,
        `SEC focus: ${activeSecFeed[safeSecRow]?.[0] ?? "none"}`,
        `Focused panel: ${focused}. News filter: ${newsCategories[newsTab]}. SEC feed: ${["institutions", "executives", "congress"][secTab]}.`,
        `Open instrument: ${selectedInstrument?.symbol ?? "none"} (timeframe ${chartTimeframe})`,
        `Focused row — news: ${activeHeadlines[newsRow % Math.max(1, activeHeadlines.length)]?.[3] ?? "none"}`,
        `Saved watchlists: ${groups.length ? groups.map((group) => group.name).join(", ") : "none"}`,
        `Saved layouts: ${layouts.length ? layouts.map((layout) => layout.name).join(", ") : "none"}`,
        `Active alerts: ${alerts.length}`,
        `Notes stored: ${userNotes.length}${
          userNotes.length
            ? ` — most recent: ${userNotes
                .slice(0, 3)
                .map((note) => `[${note.id}] ${note.symbol}: ${note.body.slice(0, 80)}`)
                .join(" | ")}`
            : ""
        }`,
        `Undo available: ${undoStack.current.length ? undoStack.current.at(-1)?.label : "nothing"}`,
      ].join("\n");
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth?.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
        },
        body: JSON.stringify({ messages: nextMessages, context, stream: true }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Agent ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Agent stream unavailable");
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantIndex = -1;
      let actions: ClientAction[] = [];
      const appendAssistant = (text: string) => {
        setAgentMessages((messages) => {
          if (assistantIndex < 0) {
            assistantIndex = messages.length;
            return [...messages, { role: "assistant", content: text }];
          }
          return messages.map((message, index) =>
            index === assistantIndex ? { ...message, content: message.content + text } : message,
          );
        });
      };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            type?: string;
            text?: string;
            actions?: ClientAction[];
          };
          if (event.type === "meta") actions = event.actions ?? [];
          if (event.type === "delta" && event.text) appendAssistant(event.text);
        }
      }
      for (const action of actions) await applyAgentAction(action);
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
        profile={symbolExtras.data?.profile ?? null}
        filings={symbolExtras.data?.filings ?? []}
        headlines={(symbolNews.data?.items ?? []) as SymbolHeadline[]}
        notes={userNotes.filter((note) => note.symbol === selectedInstrument.symbol)}
        extrasLoading={symbolExtras.isPending || symbolNews.isPending}
      />
    );
  }

  return (
    <div
      className={`h-screen min-h-[460px] overflow-hidden bg-[#0c0c0c] font-mono leading-[1.36] text-[#e8e8e8] selection:bg-[#e8e8e8] selection:text-[#0c0c0c] ${
        preferences.density === "compact" ? "text-[12px]" : "text-[13px]"
      } ${preferences.highContrast ? "contrast-125" : ""}`}
    >
      {appPage === "settings" ? (
        <SettingsPage
          preferences={preferences}
          authEmail={auth?.userEmail}
          onChange={updatePreferences}
          onReset={() => setPreferences(defaultPreferences)}
          onClose={() => setAppPage("workspace")}
        />
      ) : (
        <div ref={workspaceRef} className="flex h-[calc(100vh-22px)] min-h-[438px]">
          <main
            data-tour="editor-canvas"
            className={`relative grid min-w-0 flex-1 ${agentOpen ? "border-r border-[#3a3a3a]" : ""}`}
            style={{
              gridTemplateColumns: `${split.x}% 4px minmax(0, 1fr)`,
              gridTemplateRows: `${split.y}% 4px minmax(0, 1fr)`,
            }}
          >
            <Window
              id="news"
              slot={panelLayout.news}
              onFocus={setFocused}
              onMove={movePanel}
              tour="news"
            >
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
                    key={`${item[1]}-${item[0]}-${item[3]}-${index}`}
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

            <Window
              id="watchlist"
              slot={panelLayout.watchlist}
              onFocus={setFocused}
              onMove={movePanel}
              tour="watchlist"
            >
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
                    : watchTab === 1
                      ? `● binance · ${cryptoStreamStatus}`
                      : `● yahoo · ${stockStreamStatus}`}
              </p>
            </Window>

            <Window
              id="sec"
              slot={panelLayout.sec}
              onFocus={setFocused}
              onMove={movePanel}
              tour="sec"
            >
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
                  {secTab === 0 && selectedSecEntity && (
                    <a
                      href={selectedSecEntity.filing.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[#34d399] hover:underline"
                    >
                      {selectedSecEntity.filing.form} filing ↗
                    </a>
                  )}
                  <div className="mt-4 grid grid-cols-[1fr_64px_48px] gap-x-2">
                    {secTab === 0 && selectedSecEntity ? (
                      selectedSecEntity.holdings.slice(0, 7).map((holding, index) => (
                        <div
                          key={`${holding.cusip}-${index}`}
                          className="col-span-3 grid grid-cols-subgrid"
                        >
                          <span className="truncate" title={holding.issuer}>
                            {holding.symbol || holding.issuer}
                          </span>
                          <span className="text-right">
                            {compactNumber(holding.valueUsd, true)}
                          </span>
                          <span className="text-right text-[#909090]">
                            {holding.weight.toFixed(1)}%
                          </span>
                        </div>
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
                            : null}
                    </p>
                  )}
                </div>
              </div>
            </Window>

            <Window
              id="notes"
              slot={panelLayout.notes}
              onFocus={setFocused}
              onMove={movePanel}
              tour="notes"
            >
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
                    <span
                      className={row[2] === "—" ? "text-[#909090]" : "font-bold text-[#34d399]"}
                    >
                      {row[2]}
                    </span>
                    <span className="truncate">{row[3]}</span>
                  </button>
                ))}
              </div>
            </Window>
            <button
              type="button"
              aria-label="Resize columns"
              onPointerDown={startPaneDrag("x")}
              className="col-start-2 row-span-3 cursor-col-resize bg-[#242424] hover:bg-[#777]"
            />
            <button
              type="button"
              aria-label="Resize rows"
              onPointerDown={startPaneDrag("y")}
              className="col-span-3 row-start-2 cursor-row-resize bg-[#242424] hover:bg-[#777]"
            />
          </main>

          {agentOpen && (
            <aside
              data-tour="agent-panel"
              className="relative flex min-w-[300px] max-w-[520px] flex-col px-4 py-3"
              style={{ width: `${split.agent}%` }}
            >
              <button
                type="button"
                aria-label="Resize agent"
                onPointerDown={startPaneDrag("agent")}
                className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#777]"
              />
              <div className="flex h-[25px] items-start gap-3 font-bold">
                <span>agent</span>
                <span className="text-[#34d399]">●</span>
                <span className="font-normal text-[#909090]">openrouter/free</span>
              </div>
              <div ref={agentScrollRef} className="flex-1 overflow-y-auto pt-3">
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
                      <AgentText content={message.content} />
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
      )}

      <footer className="h-[22px] overflow-x-auto overflow-y-hidden whitespace-nowrap bg-[#0c0c0c] px-1 text-[11px] leading-[22px] text-[#777]">
        {agentToast && (
          <span className="mr-3 bg-[#e8b13a] px-1 font-bold text-[#0c0c0c]">{agentToast}</span>
        )}
        <button
          type="button"
          data-tour="search"
          onClick={() => {
            setSelectedInstrument(null);
            setOverlay("search");
          }}
          className="mr-3 hover:text-[#e8e8e8]"
        >
          search
        </button>
        <button
          type="button"
          data-tour="agent-toggle"
          onClick={() => setAgentOpen((open) => !open)}
          className="mr-3 hover:text-[#e8e8e8]"
        >
          agent
        </button>
        <button
          type="button"
          data-tour="new-project"
          onClick={() => setOverlay("search")}
          className="mr-3 bg-[#e8e8e8] px-1 font-bold text-[#0c0c0c] hover:bg-[#d0d0d0]"
        >
          new project
        </button>
        <button
          type="button"
          data-tour="share"
          onClick={() =>
            setAgentToast("Sharing is not connected yet. Default permission: view-only.")
          }
          aria-label="Share workspace"
          className="mr-3 hover:text-[#e8e8e8]"
        >
          share
        </button>
        <button
          type="button"
          data-tour="settings"
          onClick={() => {
            setOverlay(null);
            setAppPage("settings");
          }}
          aria-label="Open settings"
          className="mr-3 hover:text-[#e8e8e8]"
        >
          ⚙
        </button>
        <button
          type="button"
          onClick={() => void startTour()}
          className="mr-3 hover:text-[#e8e8e8]"
        >
          replay tour
        </button>
        <button type="button" onClick={() => resetTour()} className="mr-3 hover:text-[#e8e8e8]">
          reset tour
        </button>
        [/] search&nbsp;&nbsp; [,] settings&nbsp;&nbsp; [E] {preferences.experience}&nbsp;&nbsp;
        [ctrl+p] spotlight&nbsp;&nbsp; [?] help&nbsp;&nbsp; [q] quit
        {focused === "news" && (
          <span>
            &nbsp;&nbsp; [←/→] filter&nbsp;&nbsp; [j/k] move&nbsp;&nbsp; [enter]
            open/toggle&nbsp;&nbsp; [o] browser&nbsp;&nbsp; [r] refresh
          </span>
        )}
        {auth && (
          <button
            type="button"
            onClick={() => void auth.signOut()}
            className="float-right hover:text-[#e8e8e8]"
          >
            {auth.userEmail} · sign out
          </button>
        )}
      </footer>

      {overlay && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOverlay(null);
          }}
        >
          <div className="h-[min(520px,calc(100vh-48px))] w-[min(620px,calc(100vw-32px))] border border-[#d0d0d0] bg-[#0c0c0c] p-1 text-[12px] shadow-[0_0_0_1px_#0c0c0c]">
            {overlay === "search" && (
              <div data-tour="search-panel" className="flex h-full flex-col overflow-hidden">
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
                  <div className="min-h-0 flex-1 overflow-y-auto py-1">
                    {!searchQuery.trim() ? (
                      <p className="px-2 py-5 text-center text-[#909090]">
                        Search standard U.S. stocks and ETFs
                      </p>
                    ) : searchResults.length ? (
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
                    ) : instrumentSearch.isPending ? (
                      <p className="px-2 py-5 text-center text-[#909090]">○ searching…</p>
                    ) : instrumentSearch.isError ? (
                      <p className="px-2 py-5 text-center text-[#f87171]">! search unavailable</p>
                    ) : (
                      <p className="px-2 py-5 text-center text-[#909090]">no instruments found</p>
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
                      if (index === 7) {
                        setOverlay(null);
                        setAppPage("settings");
                        return;
                      }
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
                  <span>, / ctrl+,</span>
                  <span>settings</span>
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

export function AuthenticatedApeTerm() {
  return (
    <AuthGate>
      <ApeTermWeb />
    </AuthGate>
  );
}
