import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { ReactNode } from "react";

const quotes = [
  ["AAPL", "213.88", "+0.71%"],
  ["NVDA", "173.62", "+2.84%"],
  ["MSFT", "495.94", "-0.34%"],
  ["SPY", "637.48", "+0.42%"],
  ["BTC", "118,420", "+1.92%"],
  ["META", "712.05", "-0.62%"],
] as const;

export function SignalRail() {
  return (
    <div className="overflow-hidden border-y border-[#171714]/20 bg-[#e9e5db] py-3 font-mono text-[11px] uppercase tracking-[0.08em]">
      <div className="promo-signal-track flex w-max gap-12 pr-12 motion-reduce:translate-x-0 motion-reduce:animate-none">
        {[...quotes, ...quotes].map(([symbol, price, change], index) => (
          <span key={`${symbol}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
            <strong>{symbol}</strong>
            <span className="text-[#676259]">{price}</span>
            <span className={change.startsWith("+") ? "text-[#168653]" : "text-[#b43c33]"}>
              {change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function MarketRows() {
  return (
    <div className="space-y-1.5">
      {quotes.slice(0, 5).map(([symbol, price, change], index) => (
        <motion.div
          key={symbol}
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 + index * 0.08, duration: 0.45 }}
          className="grid grid-cols-[54px_1fr_68px] border-b border-white/8 pb-1 font-mono text-[10px]"
        >
          <span className="font-semibold">{symbol}</span>
          <span className="text-right text-white/62">{price}</span>
          <span
            className={`text-right ${change.startsWith("+") ? "text-[#42d68b]" : "text-[#f07168]"}`}
          >
            {change}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function TerminalStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.35, 0.75],
    [reducedMotion ? 0 : 7, 0, reducedMotion ? 0 : -3],
  );
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [reducedMotion ? 0 : 48, reducedMotion ? 0 : -28],
  );

  return (
    <div ref={ref} className="relative [perspective:1400px]">
      <motion.div
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.965 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ rotateX, y, transformOrigin: "50% 50%" }}
        className="relative overflow-hidden border border-[#171714] bg-[#0b0b0b] text-[#ece9e1] shadow-[0_35px_90px_-55px_rgba(0,0,0,0.8)]"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-20 h-px bg-[#42d68b]/45"
          animate={reducedMotion ? undefined : { top: ["0%", "100%", "0%"] }}
          transition={{ duration: 9, ease: "linear", repeat: Infinity }}
        />
        <div className="flex items-center justify-between border-b border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/45">
          <span>apeterm / live workspace</span>
          <span>⌘ / search · a / agent</span>
        </div>
        <div className="grid min-h-[390px] grid-cols-1 md:grid-cols-2">
          <section className="border-b border-white/15 p-4 md:border-b-0 md:border-r">
            <div className="flex justify-between font-mono text-[10px] uppercase text-white/45">
              <span className="bg-white px-1 text-black">news</span>
              <span>12 stories</span>
            </div>
            <div className="mt-5 space-y-2.5 font-mono text-[10px]">
              {[
                ["4m", "AAPL", "Supplier outlook points to steady device demand"],
                ["9m", "MKT", "Futures hold range before the opening bell"],
                ["21m", "NVDA", "Data-center orders remain above consensus"],
                ["38m", "MKT", "Treasury curve steepens after auction"],
                ["1h", "MSFT", "Cloud backlog expands into next quarter"],
              ].map(([time, symbol, headline], index) => (
                <motion.div
                  key={headline}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + index * 0.07 }}
                  className="grid grid-cols-[28px_42px_1fr] gap-2"
                >
                  <span className="text-white/35">{time}</span>
                  <span className="text-[#42d68b]">{symbol}</span>
                  <span className="truncate text-white/72">{headline}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 border-t border-white/15 pt-4">
              <div className="font-mono text-[10px] uppercase text-white/45">research note</div>
              <p className="mt-3 max-w-md font-mono text-[11px] leading-5 text-white/72">
                Watch AAPL relative strength into the close. Review supplier commentary before
                adding exposure.
              </p>
            </div>
          </section>
          <section className="grid grid-rows-[1fr_auto]">
            <div className="p-4">
              <div className="mb-5 flex justify-between font-mono text-[10px] uppercase text-white/45">
                <span className="bg-white px-1 text-black">watchlist</span>
                <span>main</span>
              </div>
              <MarketRows />
              <div className="mt-8 grid grid-cols-3 gap-px bg-white/15 font-mono text-[9px] uppercase">
                {[
                  ["Breadth", "62%"],
                  ["Volume", "1.2x"],
                  ["Session", "Open"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-[#0b0b0b] p-3">
                    <div className="text-white/35">{k}</div>
                    <div className="mt-2 text-white/80">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/15 p-4 font-mono text-[10px] text-white/42">
              <motion.span
                animate={reducedMotion ? undefined : { opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="mr-2 text-[#42d68b]"
              >
                ❯
              </motion.span>
              search symbols, filings, news
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}

export function RevealBlock({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
