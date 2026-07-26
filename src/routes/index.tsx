import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Github, Monitor, SquareTerminal } from "lucide-react";
import { motion } from "motion/react";
import { PromoLayout } from "@/components/site/promo-layout";
import { RevealBlock, TerminalStage } from "@/components/site/promo-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApeTerm — market research for terminal and web" },
      {
        name: "description",
        content:
          "ApeTerm brings prices, filings, news, notes, and research into a keyboard-driven desktop terminal and web app.",
      },
    ],
  }),
  component: Index,
});

const pathways = [
  {
    to: "/desktop" as const,
    index: "01",
    icon: SquareTerminal,
    title: "Desktop terminal",
    eyebrow: "Rust / local-first",
    body: "A fast TUI with local SQLite storage, keyboard navigation, and direct control over providers and configuration.",
    action: "Explore desktop",
    facts: ["macOS, Linux, Windows", "Local watchlists and notes", "Open-source Rust client"],
  },
  {
    to: "/web" as const,
    index: "02",
    icon: Monitor,
    title: "Web workspace",
    eyebrow: "Browser / account-backed",
    body: "The same market workflow in a browser: live watchlists, filings, news, charts, and an optional research agent.",
    action: "Explore web",
    facts: ["No installation", "Account-backed watchlists", "Desktop-style workspace"],
  },
] as const;

function Index() {
  return (
    <PromoLayout>
      <main>
        <section className="overflow-hidden border-b border-[#171714]/20">
          <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24">
            <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#69645b]"
                >
                  Desktop terminal + web workspace
                </motion.p>
                <h1 className="mt-7 max-w-5xl text-[clamp(3.6rem,8.2vw,7.8rem)] font-semibold leading-[0.86] tracking-[-0.07em]">
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, y: 38 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  >
                    One market
                  </motion.span>
                  <motion.span
                    className="block text-[#777168]"
                    initial={{ opacity: 0, y: 38 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    workspace.
                  </motion.span>
                  <motion.span
                    className="block"
                    initial={{ opacity: 0, y: 38 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Two ways in.
                  </motion.span>
                </h1>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, delay: 0.25 }}
                className="border-l border-[#171714]/25 pl-6 lg:mb-2"
              >
                <p className="max-w-xl text-lg leading-8 text-[#524e47]">
                  Follow prices, read filings, scan news, and keep research notes without rebuilding
                  your workflow around a broker or a collection of tabs.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <Link
                    to="/product"
                    className="inline-flex items-center gap-2 border border-[#171714] bg-[#171714] px-5 py-3 text-sm font-medium text-[#f2efe7] transition-colors hover:bg-transparent hover:text-[#171714]"
                  >
                    See how it works <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="https://app.apeterm.com"
                    className="text-sm font-medium underline decoration-[#171714]/35 underline-offset-4 hover:decoration-[#171714]"
                  >
                    Sign in to web
                  </a>
                </div>
              </motion.div>
            </div>
            <div className="mt-16 md:mt-24">
              <TerminalStage />
            </div>
          </div>
        </section>

        <section className="border-b border-[#171714]/20 px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto max-w-[1320px]">
            <RevealBlock>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#69645b]">
                    Choose your workspace
                  </p>
                  <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] md:text-6xl">
                    Install it locally, or open it in a browser.
                  </h2>
                </div>
                <p className="max-w-lg self-end text-base leading-7 text-[#5d5850] md:justify-self-end">
                  Desktop is the local-first Rust application. Web is the hosted workspace for
                  access from any modern browser. They share a product philosophy, not a false claim
                  of identical storage or runtime.
                </p>
              </div>
            </RevealBlock>

            <div className="mt-16 grid border-l border-t border-[#171714] lg:grid-cols-2">
              {pathways.map((path, pathIndex) => (
                <RevealBlock key={path.to} delay={pathIndex * 0.08}>
                  <article className="flex min-h-[480px] flex-col border-b border-r border-[#171714] p-6 sm:p-9">
                    <div className="flex items-start justify-between">
                      <path.icon className="h-6 w-6" strokeWidth={1.5} />
                      <span className="font-mono text-xs text-[#777168]">{path.index}</span>
                    </div>
                    <p className="mt-16 font-mono text-[10px] uppercase tracking-[0.14em] text-[#777168]">
                      {path.eyebrow}
                    </p>
                    <h3 className="mt-4 text-4xl font-semibold tracking-[-0.045em]">
                      {path.title}
                    </h3>
                    <p className="mt-5 max-w-lg leading-7 text-[#57534b]">{path.body}</p>
                    <ul className="mt-8 space-y-2 border-t border-[#171714]/20 pt-5 font-mono text-[11px] text-[#69645b]">
                      {path.facts.map((fact) => (
                        <li key={fact}>— {fact}</li>
                      ))}
                    </ul>
                    <Link
                      to={path.to}
                      className="mt-auto inline-flex items-center gap-2 pt-10 text-sm font-medium underline underline-offset-4"
                    >
                      {path.action} <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </article>
                </RevealBlock>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#171714] px-5 py-20 text-[#f2efe7] sm:px-8 md:py-28">
          <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <RevealBlock>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
                Built for research
              </p>
              <h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.96] tracking-[-0.05em] md:text-6xl">
                Context first. Execution stays elsewhere.
              </h2>
              <p className="mt-6 max-w-lg leading-7 text-white/58">
                ApeTerm does not pretend to be a broker. It organizes public market information and
                your own notes so you can inspect what changed and decide what deserves attention.
              </p>
            </RevealBlock>
            <div className="border-t border-white/30">
              {[
                ["Prices", "Track the instruments you care about, without a wall of widgets."],
                ["Filings", "Move from a headline to the underlying SEC record."],
                ["News", "Keep market and ticker context beside the watchlist."],
                ["Notes", "Write down the thesis before the market tests it."],
              ].map(([title, body], index) => (
                <RevealBlock key={title} delay={index * 0.06}>
                  <div className="grid grid-cols-[42px_1fr] gap-4 border-b border-white/20 py-6">
                    <span className="font-mono text-xs text-white/35">0{index + 1}</span>
                    <div className="grid gap-2 sm:grid-cols-[150px_1fr]">
                      <h3 className="font-medium">{title}</h3>
                      <p className="text-sm leading-6 text-white/55">{body}</p>
                    </div>
                  </div>
                </RevealBlock>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#171714]/20 px-5 py-20 sm:px-8 md:py-28">
          <RevealBlock>
            <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-10 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#69645b]">
                  Start where you are
                </p>
                <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.055em] md:text-7xl">
                  Browser now. Terminal when you want full local control.
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <a
                  href="https://app.apeterm.com"
                  className="border border-[#171714] bg-[#171714] px-5 py-3 text-sm font-medium text-[#f2efe7]"
                >
                  Sign in
                </a>
                <a
                  href="https://github.com/LongdeLao/apeterm"
                  className="inline-flex items-center gap-2 border border-[#171714] px-5 py-3 text-sm font-medium"
                >
                  <Github className="h-4 w-4" /> View source
                </a>
              </div>
            </div>
          </RevealBlock>
        </section>
      </main>
    </PromoLayout>
  );
}
