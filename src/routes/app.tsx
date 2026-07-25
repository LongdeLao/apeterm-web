import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Command,
  FileText,
  Gauge,
  LayoutDashboard,
  LineChart,
  Menu,
  MessageSquareText,
  Moon,
  Newspaper,
  PanelLeftClose,
  Plus,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "ApeTerm Web — Investment terminal" },
      {
        name: "description",
        content: "A browser-based ApeTerm workspace for markets, news, notes, and AI research.",
      },
    ],
  }),
  component: ApeTermApp,
});

type SymbolKey = "NVDA" | "AAPL" | "MSFT" | "BTC" | "TSLA";
type RangeKey = "1D" | "1W" | "1M" | "3M" | "1Y";
type WorkspaceKey = "overview" | "markets" | "news" | "portfolio" | "calendar";
type AgentMessage = { role: "ape" | "you"; body: string };

const instruments: Record<
  SymbolKey,
  { name: string; price: number; change: number; volume: string; high: number; low: number }
> = {
  NVDA: {
    name: "NVIDIA",
    price: 173.62,
    change: 2.84,
    volume: "182.4M",
    high: 174.91,
    low: 168.48,
  },
  AAPL: { name: "Apple", price: 213.88, change: 0.71, volume: "54.8M", high: 215.24, low: 210.86 },
  MSFT: {
    name: "Microsoft",
    price: 495.94,
    change: -0.34,
    volume: "21.1M",
    high: 500.02,
    low: 492.11,
  },
  BTC: {
    name: "Bitcoin USD",
    price: 118_420.12,
    change: 1.92,
    volume: "$48.2B",
    high: 119_820,
    low: 115_940,
  },
  TSLA: { name: "Tesla", price: 321.67, change: -1.26, volume: "92.7M", high: 328.44, low: 318.04 },
};

const watchlist = [
  { symbol: "NVDA" as const, price: "173.62", change: 2.84 },
  { symbol: "AAPL" as const, price: "213.88", change: 0.71 },
  { symbol: "MSFT" as const, price: "495.94", change: -0.34 },
  { symbol: "BTC" as const, price: "118,420", change: 1.92 },
  { symbol: "TSLA" as const, price: "321.67", change: -1.26 },
];

const news = [
  {
    id: 1,
    time: "12m",
    source: "Reuters",
    symbol: "NVDA",
    title: "Nvidia supplier outlook points to sustained AI infrastructure demand",
    priority: "High",
  },
  {
    id: 2,
    time: "31m",
    source: "Bloomberg",
    symbol: "AAPL",
    title: "Apple expands on-device intelligence rollout across Europe",
    priority: "Medium",
  },
  {
    id: 3,
    time: "48m",
    source: "SEC",
    symbol: "MSFT",
    title: "Microsoft files 8-K following quarterly cloud segment update",
    priority: "High",
  },
  {
    id: 4,
    time: "1h",
    source: "CoinDesk",
    symbol: "BTC",
    title: "Bitcoin liquidity deepens as institutional inflows resume",
    priority: "Medium",
  },
];

const chartSeed: Record<RangeKey, number[]> = {
  "1D": [168.8, 169.4, 168.9, 170.2, 169.7, 171.4, 170.8, 172.1, 171.7, 173.2, 172.8, 173.62],
  "1W": [165.2, 166.8, 164.9, 168.1, 169.6, 168.7, 170.9, 173.62],
  "1M": [158.1, 160.4, 157.8, 162.6, 165.1, 163.9, 168.2, 166.7, 171.8, 173.62],
  "3M": [142.2, 146.8, 151.4, 148.1, 155.7, 160.2, 157.4, 165.9, 169.1, 173.62],
  "1Y": [112.4, 119.8, 126.3, 122.1, 138.8, 145.2, 152.7, 149.4, 160.8, 173.62],
};

const navItems = [
  { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
  { id: "markets" as const, label: "Markets", icon: LineChart },
  { id: "news" as const, label: "News", icon: Newspaper },
  { id: "portfolio" as const, label: "Portfolio", icon: WalletCards },
  { id: "calendar" as const, label: "Calendar", icon: CalendarDays },
];

function formatPrice(value: number, symbol: SymbolKey) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: symbol === "BTC" ? 0 : 2,
  }).format(value);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#636b78]">{label}</p>
      <p className="mt-1 font-mono text-xs text-[#c7ccd4]">{value}</p>
    </div>
  );
}

function ApeTermApp() {
  const [symbol, setSymbol] = useState<SymbolKey>("NVDA");
  const [range, setRange] = useState<RangeKey>("1D");
  const [workspace, setWorkspace] = useState<WorkspaceKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [newsFilter, setNewsFilter] = useState<"All" | "Watchlist" | "Filings">("All");
  const [starred, setStarred] = useState<SymbolKey[]>(["NVDA", "AAPL", "BTC"]);
  const [agentInput, setAgentInput] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      role: "ape",
      body: "NVDA is up 2.84% on above-average volume. Momentum is positive, but the price is approaching today's high at $174.91.",
    },
  ]);

  const instrument = instruments[symbol];
  const chartData = useMemo(() => {
    const ratio = instrument.price / instruments.NVDA.price;
    return chartSeed[range].map((value, index, all) => ({
      label: index === all.length - 1 ? "Now" : `${index + 1}`,
      price: Number((value * ratio).toFixed(2)),
    }));
  }, [instrument.price, range]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleStar = (nextSymbol: SymbolKey) => {
    setStarred((current) =>
      current.includes(nextSymbol)
        ? current.filter((item) => item !== nextSymbol)
        : [...current, nextSymbol],
    );
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = agentInput.trim();
    if (!question) return;
    setMessages((current) => [
      ...current,
      { role: "you", body: question },
      {
        role: "ape",
        body: `${symbol} is trading at ${formatPrice(instrument.price, symbol)} (${instrument.change >= 0 ? "+" : ""}${instrument.change.toFixed(2)}%). The strongest near-term signal is price holding above the session midpoint with ${instrument.volume} in volume. Watch ${formatPrice(instrument.high, symbol)} for confirmation.`,
      },
    ]);
    setAgentInput("");
  };

  const filteredNews = news.filter((item) => {
    if (newsFilter === "Filings") return item.source === "SEC";
    if (newsFilter === "Watchlist") return starred.includes(item.symbol as SymbolKey);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080b0f] font-sans text-[#dce1e8] selection:bg-[#f2b84b] selection:text-black">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-white/[0.08] bg-[#0a0d12]/95 px-3 backdrop-blur-xl sm:px-4">
        <button
          type="button"
          className="mr-2 rounded-md p-2 text-[#87909d] hover:bg-white/[0.06] hover:text-white lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <Link to="/" className="flex items-center gap-2.5" aria-label="ApeTerm home">
          <img src="/logo.png" alt="" className="h-7 w-7 rounded-lg object-cover" />
          <span className="font-mono text-sm font-semibold tracking-tight text-white">apeterm</span>
          <span className="rounded border border-[#f2b84b]/20 bg-[#f2b84b]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#f2b84b]">
            web
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-left text-xs text-[#697381] transition hover:border-white/[0.14] hover:bg-white/[0.05] md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search markets, commands, and workspaces</span>
          <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px]">
            ⌘ K
          </span>
        </button>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1.5 font-mono text-[10px] text-[#77808c] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#68d391] shadow-[0_0_8px_#68d391]" />
            MARKET OPEN
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-[#7b8592] hover:bg-white/[0.06] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-md p-2 text-[#7b8592] hover:bg-white/[0.06] hover:text-white"
            aria-label="Appearance"
          >
            <Moon className="h-4 w-4" />
          </button>
          <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#272d35] font-mono text-[10px] text-[#d9dee5]">
            LD
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <aside
          className={`${sidebarOpen ? "w-52" : "w-[58px]"} hidden shrink-0 border-r border-white/[0.08] bg-[#090c10] transition-[width] duration-200 lg:flex lg:flex-col`}
        >
          <nav className="flex-1 space-y-1 p-2" aria-label="Workspace navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = workspace === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorkspace(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs transition ${active ? "bg-[#f2b84b]/10 text-[#f2b84b]" : "text-[#7b8592] hover:bg-white/[0.045] hover:text-[#d8dde4]"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
          <div className="space-y-1 border-t border-white/[0.08] p-2">
            {[
              { label: "Settings", icon: Settings },
              { label: "Shortcuts", icon: CircleHelp },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs text-[#6f7884] hover:bg-white/[0.045] hover:text-white"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs text-[#6f7884] hover:bg-white/[0.045] hover:text-white"
            >
              <PanelLeftClose
                className={`h-4 w-4 shrink-0 transition ${sidebarOpen ? "" : "rotate-180"}`}
              />
              {sidebarOpen && "Collapse"}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          <section className="border-b border-white/[0.08] bg-[#0b0e13] px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleStar(symbol)}
                  aria-label={`${starred.includes(symbol) ? "Remove" : "Add"} ${symbol} ${starred.includes(symbol) ? "from" : "to"} watchlist`}
                >
                  <Star
                    className={`h-4 w-4 ${starred.includes(symbol) ? "fill-[#f2b84b] text-[#f2b84b]" : "text-[#56606d]"}`}
                  />
                </button>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h1 className="font-mono text-base font-semibold text-white">{symbol}</h1>
                    <span className="text-xs text-[#697380]">{instrument.name}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-[#505965]">
                    NASDAQ · USD · Real-time
                  </p>
                </div>
              </div>
              <div className="ml-auto flex items-baseline gap-2">
                <span className="font-mono text-xl font-medium tabular-nums text-[#f3f5f7]">
                  {formatPrice(instrument.price, symbol)}
                </span>
                <span
                  className={`font-mono text-xs ${instrument.change >= 0 ? "text-[#68d391]" : "text-[#f47b7b]"}`}
                >
                  {instrument.change >= 0 ? "+" : ""}
                  {instrument.change.toFixed(2)}%
                </span>
              </div>
            </div>
          </section>

          <div
            className={`grid min-h-[calc(100vh-7.6rem)] ${agentOpen ? "xl:grid-cols-[minmax(0,1fr)_310px]" : "grid-cols-1"}`}
          >
            <div className="min-w-0">
              <div className="grid border-b border-white/[0.08] md:grid-cols-[minmax(0,1fr)_220px]">
                <section
                  className="min-w-0 border-b border-white/[0.08] p-4 md:border-b-0 md:border-r sm:p-5"
                  aria-label={`${symbol} price chart`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#596370]">
                        Price performance
                      </p>
                      <div className="mt-1 flex items-center gap-2 font-mono text-xs text-[#7b8592]">
                        {instrument.change >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-[#68d391]" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-[#f47b7b]" />
                        )}
                        <span
                          className={instrument.change >= 0 ? "text-[#68d391]" : "text-[#f47b7b]"}
                        >
                          {instrument.change >= 0 ? "+" : ""}
                          {instrument.change.toFixed(2)}%
                        </span>
                        <span>selected range</span>
                      </div>
                    </div>
                    <div className="flex rounded-md bg-white/[0.035] p-0.5">
                      {(["1D", "1W", "1M", "3M", "1Y"] as RangeKey[]).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setRange(item)}
                          className={`rounded px-2 py-1 font-mono text-[10px] transition ${range === item ? "bg-[#272d35] text-white" : "text-[#626c78] hover:text-white"}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 h-[260px] w-full sm:h-[310px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 8, right: 4, left: -14, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="apetermChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f2b84b" stopOpacity={0.22} />
                            <stop offset="100%" stopColor="#f2b84b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#596370", fontSize: 10, fontFamily: "JetBrains Mono" }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={["dataMin - 2", "dataMax + 2"]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#596370", fontSize: 10, fontFamily: "JetBrains Mono" }}
                          width={54}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#12171d",
                            border: "1px solid rgba(255,255,255,.1)",
                            borderRadius: 6,
                            fontSize: 11,
                          }}
                          labelStyle={{ color: "#7b8592" }}
                          formatter={(value) => [formatPrice(Number(value), symbol), symbol]}
                        />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#f2b84b"
                          strokeWidth={1.6}
                          fill="url(#apetermChart)"
                          activeDot={{ r: 3, fill: "#f2b84b", stroke: "#080b0f" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-4 gap-3 border-t border-white/[0.07] pt-4">
                    <Metric
                      label="Open"
                      value={formatPrice(instrument.price / (1 + instrument.change / 100), symbol)}
                    />
                    <Metric label="High" value={formatPrice(instrument.high, symbol)} />
                    <Metric label="Low" value={formatPrice(instrument.low, symbol)} />
                    <Metric label="Volume" value={instrument.volume} />
                  </div>
                </section>

                <section className="bg-[#090c11] p-3" aria-labelledby="watchlist-title">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h2
                      id="watchlist-title"
                      className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#727c88]"
                    >
                      Watchlist
                    </h2>
                    <button
                      type="button"
                      className="rounded p-1 text-[#5d6773] hover:bg-white/[0.06] hover:text-white"
                      aria-label="Add symbol"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {watchlist.map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => setSymbol(item.symbol)}
                        className={`grid w-full grid-cols-[1fr_auto] rounded-md px-2.5 py-2 text-left transition ${symbol === item.symbol ? "bg-[#f2b84b]/10" : "hover:bg-white/[0.04]"}`}
                      >
                        <span className="font-mono text-xs font-medium text-[#d9dee4]">
                          {item.symbol}
                        </span>
                        <span className="font-mono text-[11px] tabular-nums text-[#aab1bb]">
                          {item.price}
                        </span>
                        <span className="mt-0.5 text-[10px] text-[#57616e]">
                          {instruments[item.symbol].name}
                        </span>
                        <span
                          className={`mt-0.5 font-mono text-[10px] ${item.change >= 0 ? "text-[#68d391]" : "text-[#f47b7b]"}`}
                        >
                          {item.change >= 0 ? "+" : ""}
                          {item.change.toFixed(2)}%
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-center gap-1 border-t border-white/[0.06] pt-3 text-[10px] text-[#626c78] hover:text-white"
                  >
                    All instruments <ChevronDown className="h-3 w-3" />
                  </button>
                </section>
              </div>

              <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
                <section
                  className="border-b border-white/[0.08] p-4 lg:border-b-0 lg:border-r sm:p-5"
                  aria-labelledby="news-title"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 id="news-title" className="text-xs font-semibold text-[#dce1e8]">
                        Market intelligence
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#5e6875]">
                        Ranked by relevance to your watchlist
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {(["All", "Watchlist", "Filings"] as const).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setNewsFilter(filter)}
                          className={`rounded px-2 py-1 text-[10px] ${newsFilter === filter ? "bg-[#272d35] text-white" : "text-[#697380] hover:text-white"}`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-white/[0.06]">
                    {filteredNews.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSymbol(item.symbol as SymbolKey)}
                        className="grid w-full grid-cols-[52px_1fr_auto] gap-3 py-3 text-left group"
                      >
                        <span className="font-mono text-[10px] text-[#596370]">{item.time}</span>
                        <span>
                          <span className="block text-xs leading-relaxed text-[#bdc4cd] transition group-hover:text-white">
                            {item.title}
                          </span>
                          <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-[#56606d]">
                            {item.source} · {item.symbol}
                          </span>
                        </span>
                        <span
                          className={`mt-0.5 h-fit rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase ${item.priority === "High" ? "bg-[#f2b84b]/10 text-[#f2b84b]" : "bg-white/[0.04] text-[#697380]"}`}
                        >
                          {item.priority}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="p-4 sm:p-5" aria-labelledby="brief-title">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 id="brief-title" className="text-xs font-semibold text-[#dce1e8]">
                        Today
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#5e6875]">Sunday, July 26</p>
                    </div>
                    <CalendarDays className="h-4 w-4 text-[#68727e]" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { time: "14:00", label: "US new home sales", type: "MACRO" },
                      { time: "AFT", label: "Tesla earnings call", type: "TSLA" },
                      { time: "AFT", label: "Microsoft earnings", type: "MSFT" },
                    ].map((event) => (
                      <div
                        key={`${event.time}-${event.label}`}
                        className="grid grid-cols-[38px_1fr] gap-3"
                      >
                        <span className="font-mono text-[9px] text-[#5f6975]">{event.time}</span>
                        <div className="border-l border-white/[0.09] pl-3">
                          <p className="text-[11px] text-[#b9c0ca]">{event.label}</p>
                          <p className="mt-1 font-mono text-[8px] text-[#f2b84b]">{event.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-white/[0.07] pt-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#707a86]" />
                      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#707a86]">
                        Quick note
                      </h3>
                    </div>
                    <textarea
                      className="mt-2 min-h-20 w-full resize-none rounded-md border border-white/[0.07] bg-white/[0.025] p-2.5 text-[11px] leading-relaxed text-[#b7bec7] outline-none placeholder:text-[#4e5763] focus:border-[#f2b84b]/40"
                      placeholder={`Write a note about ${symbol}…`}
                    />
                  </div>
                </section>
              </div>
            </div>

            {agentOpen && (
              <aside
                className="border-l border-white/[0.08] bg-[#0a0d12]"
                aria-labelledby="agent-title"
              >
                <div className="flex h-12 items-center border-b border-white/[0.08] px-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#f2b84b]" />
                    <h2 id="agent-title" className="text-xs font-semibold text-[#dce1e8]">
                      Ape analyst
                    </h2>
                  </div>
                  <span className="ml-2 h-1.5 w-1.5 rounded-full bg-[#68d391]" />
                  <button
                    type="button"
                    onClick={() => setAgentOpen(false)}
                    className="ml-auto rounded p-1 text-[#5f6975] hover:bg-white/[0.06] hover:text-white"
                    aria-label="Close analyst panel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex h-[calc(100vh-10.6rem)] min-h-[520px] flex-col">
                  <div className="flex-1 space-y-4 overflow-y-auto p-4">
                    <div className="rounded-md border border-[#f2b84b]/10 bg-[#f2b84b]/[0.035] p-3">
                      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-[#f2b84b]">
                        <Gauge className="h-3 w-3" /> Context
                      </div>
                      <p className="mt-2 text-[10px] leading-relaxed text-[#76808c]">
                        Reading {symbol} price action, 4 related headlines, and today’s market
                        calendar.
                      </p>
                    </div>
                    {messages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={message.role === "you" ? "pl-6" : "pr-2"}
                      >
                        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-[#5e6875]">
                          {message.role}
                        </p>
                        <div
                          className={`rounded-md p-3 text-[11px] leading-[1.65] ${message.role === "you" ? "bg-[#242a32] text-[#d9dee5]" : "border border-white/[0.07] bg-white/[0.025] text-[#aeb6c0]"}`}
                        >
                          {message.body}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendMessage} className="border-t border-white/[0.08] p-3">
                    <label htmlFor="agent-input" className="sr-only">
                      Ask Ape analyst
                    </label>
                    <div className="rounded-md border border-white/[0.09] bg-white/[0.025] p-2 focus-within:border-[#f2b84b]/40">
                      <textarea
                        id="agent-input"
                        value={agentInput}
                        onChange={(event) => setAgentInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey)
                            event.currentTarget.form?.requestSubmit();
                        }}
                        rows={3}
                        className="w-full resize-none bg-transparent text-[11px] leading-relaxed text-[#d7dce3] outline-none placeholder:text-[#4f5864]"
                        placeholder={`Ask about ${symbol}…`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[8px] text-[#4f5864]">
                          ↵ send · ⇧↵ newline
                        </span>
                        <button
                          type="submit"
                          className="rounded bg-[#f2b84b] p-1.5 text-[#15100a] transition hover:bg-[#ffd176]"
                          aria-label="Send message"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-center text-[8px] text-[#48515d]">
                      Research assistance only · verify before trading
                    </p>
                  </form>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>

      {!agentOpen && (
        <button
          type="button"
          onClick={() => setAgentOpen(true)}
          className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-[#f2b84b] px-4 py-2.5 text-xs font-medium text-[#15100a] shadow-2xl hover:bg-[#ffd176]"
        >
          <Bot className="h-4 w-4" /> Ask Ape
        </button>
      )}

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 lg:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setMobileNavOpen(false);
          }}
        >
          <aside
            className="h-full w-72 border-r border-white/10 bg-[#0a0d12] p-3"
            aria-label="Mobile navigation"
          >
            <div className="mb-4 flex items-center justify-between px-2 py-1">
              <span className="font-mono text-sm text-white">workspaces</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded p-2 text-[#78818d]"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setWorkspace(item.id);
                  setMobileNavOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-xs ${workspace === item.id ? "bg-[#f2b84b]/10 text-[#f2b84b]" : "text-[#84909c]"}`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </aside>
        </div>
      )}

      {paletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setPaletteOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="palette-title"
            className="w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.12] bg-[#11151b] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
              <Search className="h-4 w-4 text-[#f2b84b]" />
              <label id="palette-title" htmlFor="palette-search" className="sr-only">
                Command palette
              </label>
              <input
                id="palette-search"
                autoFocus
                className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#56606c]"
                placeholder="Search a ticker or run a command…"
              />
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#66707c]">
                ESC
              </kbd>
            </div>
            <div className="p-2">
              <p className="px-2 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#56606c]">
                Quick actions
              </p>
              {[
                {
                  label: "Open market overview",
                  detail: "Workspace",
                  icon: LayoutDashboard,
                  action: () => setWorkspace("overview"),
                },
                {
                  label: "Ask Ape analyst",
                  detail: "AI research",
                  icon: MessageSquareText,
                  action: () => setAgentOpen(true),
                },
                {
                  label: "Search instruments",
                  detail: "Stocks & ETFs",
                  icon: Search,
                  action: () => setWorkspace("markets"),
                },
                {
                  label: "Read SEC filings",
                  detail: "Primary sources",
                  icon: BookOpen,
                  action: () => setNewsFilter("Filings"),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setPaletteOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-white/[0.05]"
                >
                  <item.icon className="h-4 w-4 text-[#737d89]" />
                  <span className="text-xs text-[#d2d7de]">{item.label}</span>
                  <span className="ml-auto text-[10px] text-[#59636f]">{item.detail}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-white/[0.07] px-4 py-2 font-mono text-[8px] text-[#525c68]">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto flex items-center gap-1">
                <Command className="h-2.5 w-2.5" /> K anytime
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
