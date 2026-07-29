import { useEffect, useRef } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const chartTimeframes = ["1d", "1w", "1m", "3m", "6m", "1y", "5y", "max"] as const;
export type ChartTimeframe = (typeof chartTimeframes)[number];

export type ChartInstrument = {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
};

export type ChartDetail = {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  averageVolume: number;
  open: number;
  marketCap: number;
  extendedPrice: number | null;
  extendedChangePercent: number | null;
  trailingPE: number;
  forwardPE: number;
  priceToBook: number;
  dividendYield: number;
  beta: number;
  epsTrailingTwelveMonths: number;
  nextEarningsDays: number | null;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  marketTime: number;
  summary: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  fullTimeEmployees: number;
  history: { ts: number; close: number; volume: number }[];
};

export type CompanyProfile = {
  name: string;
  cik: string;
  industry: string;
  filerCategory: string;
  entityType: string;
  stateOfIncorporation: string;
  exchanges: string[];
  location: string;
  edgarUrl: string;
};

export type SymbolFiling = {
  form: string;
  filedAt: string;
  reportDate: string;
  description: string;
  url: string;
};

export type SymbolHeadline = { id: string; age: string; title: string; url: string };

export type SymbolNote = { id: string; body: string; starred: boolean; created_at: string };

function number(value: number, compact = false) {
  if (!Number.isFinite(value) || value === 0) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : value < 10 ? 3 : 2,
  }).format(value);
}

function PriceCanvas({ detail }: { detail: ChartDetail }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const width = rect.width;
      const height = rect.height;
      context.clearRect(0, 0, width, height);
      const points = detail.history;
      if (points.length < 2) return;

      const labelWidth = width < 650 ? 62 : 76;
      const top = 24;
      const bottom = 30;
      const plotLeft = labelWidth;
      const plotRight = width - 14;
      const plotBottom = height - bottom;
      const values = points.map((point) => point.close);
      if (detail.previousClose) values.push(detail.previousClose);
      const rawMin = Math.min(...values);
      const rawMax = Math.max(...values);
      const padding = Math.max((rawMax - rawMin) * 0.09, rawMax * 0.002);
      const min = rawMin - padding;
      const max = rawMax + padding;
      const x = (index: number) =>
        plotLeft + (index / Math.max(1, points.length - 1)) * (plotRight - plotLeft);
      const y = (price: number) =>
        top + ((max - price) / Math.max(0.0001, max - min)) * (plotBottom - top);

      context.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.lineWidth = 1;
      for (let index = 0; index < 7; index += 1) {
        const price = max - (index / 6) * (max - min);
        const rowY = y(price);
        context.strokeStyle = "#2c2c2c";
        context.setLineDash([2, 4]);
        context.beginPath();
        context.moveTo(plotLeft, rowY);
        context.lineTo(plotRight, rowY);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = "#777";
        context.textAlign = "right";
        context.fillText(number(price), plotLeft - 8, rowY + 4);
      }
      for (let index = 0; index < 6; index += 1) {
        const pointIndex = Math.round((index / 5) * (points.length - 1));
        const columnX = x(pointIndex);
        context.strokeStyle = "#202020";
        context.beginPath();
        context.moveTo(columnX, top);
        context.lineTo(columnX, plotBottom);
        context.stroke();
        const date = new Date(points[pointIndex].ts * 1000);
        const intraday = points.at(-1)!.ts - points[0].ts < 172_800;
        const label = intraday
          ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        context.fillStyle = "#777";
        context.textAlign = index === 0 ? "left" : index === 5 ? "right" : "center";
        context.fillText(label, columnX, height - 8);
      }

      if (detail.previousClose) {
        context.strokeStyle = "#777";
        context.setLineDash([5, 5]);
        context.beginPath();
        context.moveTo(plotLeft, y(detail.previousClose));
        context.lineTo(plotRight, y(detail.previousClose));
        context.stroke();
        context.setLineDash([]);
      }

      const positive = points.at(-1)!.close >= points[0].close;
      const color = positive ? "#34d399" : "#f87171";
      const gradient = context.createLinearGradient(0, top, 0, plotBottom);
      gradient.addColorStop(0, positive ? "rgba(52,211,153,.25)" : "rgba(248,113,113,.23)");
      gradient.addColorStop(1, "rgba(12,12,12,0)");
      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(x(index), y(point.close));
        else context.lineTo(x(index), y(point.close));
      });
      context.lineTo(plotRight, plotBottom);
      context.lineTo(plotLeft, plotBottom);
      context.closePath();
      context.fillStyle = gradient;
      context.fill();
      context.beginPath();
      points.forEach((point, index) => {
        if (index === 0) context.moveTo(x(index), y(point.close));
        else context.lineTo(x(index), y(point.close));
      });
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.stroke();

      const markerY = y(detail.price);
      context.fillStyle = color;
      context.fillRect(plotRight - 1, markerY - 9, 1, 18);
      context.textAlign = "right";
      context.fillStyle = color;
      context.fillText(number(detail.price), plotRight - 5, markerY - 5);
    };
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    draw();
    return () => observer.disconnect();
  }, [detail]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-label="Price chart" />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center gap-2 font-bold uppercase">
        <span>{title}</span>
        <span className="h-px flex-1 bg-[#3a3a3a]" />
      </div>
      {children}
    </section>
  );
}

export function InstrumentChart({
  instrument,
  detail,
  loading,
  error,
  timeframe,
  onTimeframe,
  onClose,
  profile,
  filings = [],
  headlines = [],
  notes = [],
  extrasLoading = false,
}: {
  instrument: ChartInstrument;
  detail?: ChartDetail;
  loading: boolean;
  error: boolean;
  timeframe: ChartTimeframe;
  onTimeframe: (timeframe: ChartTimeframe) => void;
  onClose: () => void;
  profile?: CompanyProfile | null;
  filings?: SymbolFiling[];
  headlines?: SymbolHeadline[];
  notes?: SymbolNote[];
  extrasLoading?: boolean;
}) {
  const first = detail?.history[0]?.close ?? 0;
  const last = detail?.history.at(-1)?.close ?? 0;
  const periodReturn = first ? ((last - first) / first) * 100 : 0;
  const periodHigh = detail ? Math.max(...detail.history.map((point) => point.close)) : 0;
  const periodLow = detail ? Math.min(...detail.history.map((point) => point.close)) : 0;

  /** Derived read of where the price sits, rather than restating the raw quote. */
  const context: [string, string, "up" | "down" | "flat"][] = [];
  if (detail) {
    const belowHigh = detail.week52High
      ? ((detail.week52High - detail.price) / detail.week52High) * 100
      : 0;
    const aboveLow = detail.week52Low
      ? ((detail.price - detail.week52Low) / detail.week52Low) * 100
      : 0;
    const range = detail.week52High - detail.week52Low;
    const position = range > 0 ? ((detail.price - detail.week52Low) / range) * 100 : 0;
    const relativeVolume = detail.averageVolume > 0 ? detail.volume / detail.averageVolume : 0;
    const dayRange = detail.dayHigh - detail.dayLow;
    const dayPosition = dayRange > 0 ? ((detail.price - detail.dayLow) / dayRange) * 100 : 0;
    if (detail.week52High)
      context.push(["Off 52W high", `−${belowHigh.toFixed(1)}%`, belowHigh > 20 ? "down" : "flat"]);
    if (detail.week52Low)
      context.push(["Above 52W low", `+${aboveLow.toFixed(1)}%`, aboveLow > 0 ? "up" : "flat"]);
    if (range > 0)
      context.push([
        "52W position",
        `${position.toFixed(0)}% of range`,
        position > 70 ? "up" : position < 30 ? "down" : "flat",
      ]);
    if (dayRange > 0) context.push(["Day position", `${dayPosition.toFixed(0)}% of range`, "flat"]);
    if (relativeVolume)
      context.push([
        "Relative volume",
        `${relativeVolume.toFixed(2)}×`,
        relativeVolume > 1.5 ? "up" : relativeVolume < 0.6 ? "down" : "flat",
      ]);
    if (detail.history.length > 1)
      context.push([
        `${timeframe.toUpperCase()} return`,
        `${periodReturn >= 0 ? "+" : ""}${periodReturn.toFixed(1)}%`,
        periodReturn >= 0 ? "up" : "down",
      ]);
    if (detail.marketTime)
      context.push([
        "Last tick",
        new Date(detail.marketTime * 1000).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        "flat",
      ]);
  }
  const stats = detail
    ? [
        ["Prev Close", number(detail.previousClose)],
        ["Open", number(detail.open)],
        ["Vol", number(detail.volume, true)],
        ["Avg Vol", number(detail.averageVolume, true)],
        ["Day Range", `${number(detail.dayLow)}–${number(detail.dayHigh)}`],
        ["Mkt Cap", number(detail.marketCap, true)],
        ["P/E", number(detail.trailingPE)],
        ["Fwd P/E", number(detail.forwardPE)],
        ["P/B", number(detail.priceToBook)],
        ["EPS TTM", number(detail.epsTrailingTwelveMonths)],
        ["Div Yield", detail.dividendYield ? `${(detail.dividendYield * 100).toFixed(2)}%` : "—"],
        ["Beta", number(detail.beta)],
        ["Earnings", detail.nextEarningsDays == null ? "—" : `${detail.nextEarningsDays}d`],
        ["52W High", number(detail.week52High)],
        ["52W Low", number(detail.week52Low)],
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0c0c0c] font-mono text-[12px] leading-[1.36] text-[#e8e8e8]">
      <main className="grid min-h-0 flex-1 grid-cols-[68%_2px_1fr]">
        <section className="flex min-h-0 flex-col p-2">
          <header className="flex min-h-[24px] items-start gap-4 whitespace-nowrap">
            <span className="font-bold">PRICE CHART</span>
            <div className="flex gap-3">
              {chartTimeframes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onTimeframe(item)}
                  className={
                    timeframe === item
                      ? "bg-[#e8e8e8] px-1 font-bold text-[#0c0c0c]"
                      : "text-[#777] hover:text-[#d0d0d0]"
                  }
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            {detail && detail.history.length > 1 && (
              <p className="ml-auto text-[#777]">
                {timeframe.toUpperCase()}:{" "}
                <span
                  className={
                    periodReturn >= 0 ? "font-bold text-[#34d399]" : "font-bold text-[#f87171]"
                  }
                >
                  {periodReturn >= 0 ? "+" : ""}
                  {periodReturn.toFixed(1)}%
                </span>{" "}
                · H {number(periodHigh)} · L {number(periodLow)}
              </p>
            )}
          </header>
          <div className="min-h-0 flex-1">
            {loading ? (
              <p className="pt-[35vh] text-center text-[#777]">○ loading live details...</p>
            ) : error || !detail || detail.history.length < 2 ? (
              <p className="pt-[35vh] text-center text-[#777]">No chart data available</p>
            ) : (
              <PriceCanvas detail={detail} />
            )}
          </div>
        </section>
        <div className="bg-[#3a3a3a]" />
        <aside className="min-h-0 overflow-y-auto px-4 py-2">
          <Section title="Quote">
            <p className="text-base font-bold">{instrument.symbol}</p>
            <p className="truncate text-[#777]">
              {detail?.name ?? instrument.name} {detail?.exchange ?? instrument.exchange}{" "}
              {detail?.currency ?? ""}
            </p>
            {detail && (
              <>
                <p className="mt-2 text-xl font-bold">{number(detail.price)}</p>
                <p
                  className={`mt-1 inline-block px-1 font-bold text-[#0c0c0c] ${detail.change >= 0 ? "bg-[#34d399]" : "bg-[#f87171]"}`}
                >
                  {detail.change >= 0 ? "▲ +" : "▼ "}
                  {detail.change.toFixed(2)} ({detail.changePercent >= 0 ? "+" : ""}
                  {detail.changePercent.toFixed(2)}%)
                </p>
                {detail.extendedPrice && (
                  <p className="mt-1 text-[#777]">
                    After-hours {number(detail.extendedPrice)}{" "}
                    {detail.extendedChangePercent == null
                      ? ""
                      : `(${detail.extendedChangePercent >= 0 ? "+" : ""}${detail.extendedChangePercent.toFixed(2)}%)`}
                  </p>
                )}
              </>
            )}
          </Section>
          <Section title="Key Stats">
            <div className="grid grid-cols-2 gap-x-5 gap-y-1">
              {stats.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-[#777]">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Profile">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-[#777]">Exchange</span>
                <span>{instrument.exchange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Type</span>
                <span>{instrument.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#777]">Currency</span>
                <span>{detail?.currency ?? "—"}</span>
              </div>
            </div>
          </Section>
          <Section title="Company">
            {detail?.summary || detail?.website || detail?.city || detail?.country ? (
              <div className="space-y-2">
                {detail.summary && <p className="text-[#d0d0d0]">{detail.summary}</p>}
                <div className="space-y-1">
                  {[
                    ["HQ", [detail.city, detail.state, detail.country].filter(Boolean).join(", ")],
                    ["Employees", number(detail.fullTimeEmployees, true)],
                    ["Website", detail.website ?? ""],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <span className="shrink-0 text-[#777]">{label}</span>
                      {label === "Website" && value ? (
                        <a
                          href={String(value)}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-right text-[#34d399] hover:underline"
                          title={String(value)}
                        >
                          {String(value).replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="truncate text-right" title={String(value)}>
                          {value || "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : profile ? (
              <div className="space-y-1">
                <p className="truncate font-bold" title={profile.name}>
                  {profile.name}
                </p>
                {[
                  ["Industry", profile.industry],
                  ["Location", profile.location],
                  ["Incorporated", profile.stateOfIncorporation],
                  ["Filer", profile.filerCategory],
                  ["CIK", profile.cik.replace(/^0+/, "")],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="shrink-0 text-[#777]">{label}</span>
                    <span className="truncate text-right" title={value}>
                      {value || "—"}
                    </span>
                  </div>
                ))}
                <a
                  href={profile.edgarUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-[#34d399] hover:underline"
                >
                  EDGAR filings ↗
                </a>
              </div>
            ) : (
              <p className="text-[#777]">
                {extrasLoading ? "○ loading..." : "No SEC filer mapped"}
              </p>
            )}
          </Section>
          <Section title="Market Context">
            {context.length ? (
              <div className="space-y-1">
                {context.map(([label, value, tone]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-[#777]">{label}</span>
                    <span
                      className={
                        tone === "up" ? "text-[#34d399]" : tone === "down" ? "text-[#f87171]" : ""
                      }
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#777]">Waiting for price history</p>
            )}
          </Section>
          <Section title="Filings">
            {filings.length ? (
              <div className="space-y-1">
                {filings.slice(0, 6).map((filing) => (
                  <a
                    key={`${filing.form}-${filing.filedAt}-${filing.url}`}
                    href={filing.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-2 hover:bg-[#1a1a1a]"
                  >
                    <span className="w-12 shrink-0 font-bold text-[#d0d0d0]">{filing.form}</span>
                    <span className="w-16 shrink-0 text-[#777]">{filing.filedAt}</span>
                    <span className="truncate text-[#909090]" title={filing.description}>
                      {filing.description || "—"}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[#777]">{extrasLoading ? "○ loading..." : "No recent filings"}</p>
            )}
          </Section>
          <Section title="Headlines">
            {headlines.length ? (
              <div className="space-y-1">
                {headlines.slice(0, 6).map((item) => (
                  <a
                    key={item.id || item.title}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-2 hover:bg-[#1a1a1a]"
                  >
                    <span className="w-8 shrink-0 text-[#777]">{item.age}</span>
                    <span className="line-clamp-2 text-[#d0d0d0]">{item.title}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[#777]">
                {extrasLoading ? "○ loading..." : "No related headlines"}
              </p>
            )}
          </Section>
          <Section title="Notes">
            {notes.length ? (
              <div className="space-y-1">
                {notes.slice(0, 6).map((note) => (
                  <div key={note.id} className="flex gap-2">
                    <span className="w-3 shrink-0 text-[#e8b13a]">{note.starred ? "★" : " "}</span>
                    <span className="w-16 shrink-0 text-[#777]">
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-[#d0d0d0]">{note.body}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#777]">
                No notes on {instrument.symbol} — ask the agent to write one
              </p>
            )}
          </Section>
        </aside>
      </main>
      <footer className="h-[22px] shrink-0 text-center leading-[22px] text-[#777]">
        [←/→ or t/T] timeframe&nbsp;&nbsp; [1-8] jump&nbsp;&nbsp; [j/k] sidebar&nbsp;&nbsp; [,]
        settings&nbsp;&nbsp; [?] help&nbsp;&nbsp; [esc]
      </footer>
      <button type="button" onClick={onClose} className="sr-only">
        Close chart
      </button>
    </div>
  );
}
