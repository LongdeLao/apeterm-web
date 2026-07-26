import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Github } from "lucide-react";
import { TerminalMock } from "@/components/site/terminal-mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApeTerm — open-source investment terminal" },
      {
        name: "description",
        content:
          "A fast, keyboard-driven terminal for market prices, SEC filings, news, notes, and research.",
      },
    ],
  }),
  component: Index,
});

const installCommand =
  "curl -fsSL https://github.com/LongdeLao/apeterm/raw/master/install.sh | bash";

const capabilities = [
  {
    number: "01",
    title: "Markets",
    body: "Track stocks, ETFs, and crypto from one keyboard-driven watchlist.",
    detail: "Live quotes · volume · relative volume",
  },
  {
    number: "02",
    title: "Filings",
    body: "Read institutional holdings, insider trades, and congressional disclosures.",
    detail: "13F · Form 4 · SEC EDGAR",
  },
  {
    number: "03",
    title: "News",
    body: "Keep ticker news, macro headlines, and market feeds in the same workspace.",
    detail: "RSS · Google News · per-ticker feeds",
  },
  {
    number: "04",
    title: "Research",
    body: "Search instruments, keep notes, and optionally ask an agent about what is on screen.",
    detail: "Local notes · search · optional LLM",
  },
] as const;

function Index() {
  return (
    <div className="min-h-screen bg-[#f2efe7] text-[#171714]">
      <header className="border-b border-[#171714]/20">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-mono text-sm font-semibold">
            <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
            APETERM
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Main navigation">
            <a href="#product" className="hover:underline hover:underline-offset-4">
              Product
            </a>
            <a href="#principles" className="hover:underline hover:underline-offset-4">
              Principles
            </a>
            <Link to="/docs" className="hover:underline hover:underline-offset-4">
              Docs
            </Link>
            <a
              href="https://github.com/LongdeLao/apeterm"
              className="hover:underline hover:underline-offset-4"
            >
              GitHub
            </a>
          </nav>
          <Link
            to="/app"
            className="border border-[#171714] bg-[#171714] px-4 py-2 text-sm font-medium text-[#f2efe7] hover:bg-transparent hover:text-[#171714]"
          >
            Open web app
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-[#171714]/20">
          <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#656158]">
                  Open source · Rust · Local first
                </p>
                <h1 className="mt-6 max-w-4xl text-[clamp(3.4rem,8vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
                  The market,
                  <br />
                  in your terminal.
                </h1>
              </div>
              <div className="border-l border-[#171714]/25 pl-6 lg:mb-2">
                <p className="max-w-md text-lg leading-7 text-[#4e4b44]">
                  Prices, filings, news, and notes in one fast workspace. Built for people who would
                  rather use a keyboard than manage another dashboard.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <a
                    href="#install"
                    className="border border-[#171714] bg-[#171714] px-5 py-3 text-sm font-medium text-[#f2efe7] hover:bg-transparent hover:text-[#171714]"
                  >
                    Install ApeTerm
                  </a>
                  <a
                    href="https://github.com/LongdeLao/apeterm"
                    className="inline-flex items-center gap-2 text-sm font-medium underline decoration-[#171714]/35 underline-offset-4 hover:decoration-[#171714]"
                  >
                    <Github className="h-4 w-4" /> Read the source
                  </a>
                </div>
              </div>
            </div>

            <div id="product" className="mt-16 border border-[#171714] bg-[#0c0c0c] md:mt-24">
              <div className="flex items-center justify-between border-b border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">
                <span>ApeTerm / workspace</span>
                <span>Keyboard driven</span>
              </div>
              <TerminalMock className="border-0 shadow-none" />
            </div>
          </div>
        </section>

        <section className="border-b border-[#171714]/20">
          <div className="mx-auto grid max-w-[1280px] grid-cols-2 divide-x divide-y divide-[#171714]/20 border-x border-[#171714]/20 md:grid-cols-4 md:divide-y-0">
            {[
              ["Local storage", "SQLite on your machine"],
              ["Market data", "Stocks, ETFs, crypto"],
              ["Public records", "SEC EDGAR filings"],
              ["Telemetry", "None by default"],
            ].map(([title, detail]) => (
              <div key={title} className="px-5 py-6 sm:px-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#6c685f]">
                  {title}
                </p>
                <p className="mt-2 text-sm font-medium">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-[#171714]/20 px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#656158]">
                  What it does
                </p>
                <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.98] tracking-[-0.045em] md:text-6xl">
                  The useful parts of a market desk. Nothing ornamental.
                </h2>
              </div>
              <p className="max-w-lg self-end text-base leading-7 text-[#57534b] md:justify-self-end">
                ApeTerm keeps research close to the shell and makes every primary action available
                from the keyboard. Use the defaults, add your own data keys, or fork the project.
              </p>
            </div>

            <div className="mt-16 border-t border-[#171714]">
              {capabilities.map((item) => (
                <article
                  key={item.number}
                  className="grid gap-4 border-b border-[#171714]/25 py-7 md:grid-cols-[80px_220px_1fr_280px] md:items-baseline"
                >
                  <span className="font-mono text-xs text-[#777168]">{item.number}</span>
                  <h3 className="text-xl font-semibold tracking-[-0.02em]">{item.title}</h3>
                  <p className="max-w-xl text-[#4f4b44]">{item.body}</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#777168] md:text-right">
                    {item.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="principles"
          className="bg-[#171714] px-5 py-20 text-[#f2efe7] sm:px-8 md:py-28"
        >
          <div className="mx-auto grid max-w-[1280px] gap-14 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#a7a298]">
                Why open source
              </p>
              <h2 className="mt-5 text-4xl font-semibold leading-none tracking-[-0.045em] md:text-6xl">
                Your research setup should belong to you.
              </h2>
            </div>
            <div className="border-t border-white/35">
              {[
                [
                  "Local by default",
                  "Watchlists, notes, and settings stay in a local SQLite database.",
                ],
                [
                  "Inspectable",
                  "The source, data adapters, and agent actions are available to audit.",
                ],
                [
                  "Replaceable",
                  "Bring your own providers and model keys without changing the workflow.",
                ],
              ].map(([title, body], index) => (
                <div
                  key={title}
                  className="grid grid-cols-[42px_1fr] gap-4 border-b border-white/25 py-7"
                >
                  <span className="font-mono text-xs text-white/45">0{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className="mt-2 max-w-xl leading-7 text-white/60">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="install" className="border-b border-[#171714]/20 px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#656158]">
                  Install
                </p>
                <h2 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
                  Start with one command.
                </h2>
                <p className="mt-6 max-w-lg text-[#57534b]">
                  Prebuilt for macOS Apple Silicon, Linux x86_64, and Windows x86_64. No account
                  required for the desktop terminal.
                </p>
              </div>
              <div>
                <div className="overflow-x-auto border border-[#171714] bg-[#e8e4da] px-4 py-4 font-mono text-xs sm:text-sm">
                  <span className="mr-3 text-[#777168]">$</span>
                  {installCommand}
                </div>
                <div className="mt-5 flex flex-wrap gap-5 text-sm">
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-1.5 underline underline-offset-4"
                  >
                    Read installation docs <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/app"
                    className="inline-flex items-center gap-1.5 underline underline-offset-4"
                  >
                    Use the web app <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-xs">APETERM / 2026</div>
          <div className="flex flex-wrap gap-6 text-[#57534b]">
            <a href="https://github.com/LongdeLao/apeterm">Source</a>
            <a href="https://github.com/LongdeLao/apeterm/issues">Issues</a>
            <Link to="/docs">Documentation</Link>
            <span>Not investment advice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
