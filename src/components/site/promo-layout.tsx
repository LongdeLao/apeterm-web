import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import type { ReactNode } from "react";

const navigation = [
  ["/product", "Product"],
  ["/desktop", "Desktop"],
  ["/web", "Web"],
  ["/open-source", "Open source"],
  ["/docs", "Docs"],
] as const;

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[#20b66f]"
      style={{ scaleX }}
    />
  );
}

export function PromoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2efe7] text-[#171714]">
      <ScrollProgress />
      <header className="sticky top-0 z-50 border-b border-[#171714]/20 bg-[#f2efe7]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-[1320px] flex-wrap items-center px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 font-mono text-sm font-semibold">
            <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
            APETERM
          </Link>
          <nav
            className="order-3 flex w-full gap-6 overflow-x-auto border-t border-[#171714]/15 py-3 text-sm md:order-none md:ml-12 md:w-auto md:border-0 md:py-0"
            aria-label="Main navigation"
          >
            {navigation.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="shrink-0 text-[#625e55] transition-colors hover:text-[#171714]"
                activeProps={{ className: "shrink-0 text-[#171714] underline underline-offset-8" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <a
            href="https://app.apeterm.com"
            className="ml-auto inline-flex items-center gap-2 border border-[#171714] bg-[#171714] px-4 py-2 text-sm font-medium text-[#f2efe7] transition-colors hover:bg-[#f2efe7] hover:text-[#171714]"
          >
            Open workspace <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>
      {children}
      <footer className="border-t border-[#171714]/20 px-5 py-10 sm:px-8">
        <div className="mx-auto grid max-w-[1320px] gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="font-mono text-xs">APETERM / 2026</div>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#625e55]">
              Market research for the terminal and the browser. Open source, keyboard-first, and
              built for inspection rather than execution.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#625e55]">
            <a href="https://github.com/LongdeLao/apeterm" className="hover:text-[#171714]">
              GitHub
            </a>
            <a href="https://github.com/LongdeLao/apeterm/issues" className="hover:text-[#171714]">
              Issues
            </a>
            <Link to="/docs" className="hover:text-[#171714]">
              Documentation
            </Link>
            <span>Not investment advice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageIntro({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <section className="border-b border-[#171714]/20 px-5 py-16 sm:px-8 md:py-24">
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#6a665e]">
            {label}
          </p>
          <h1 className="mt-6 max-w-4xl text-[clamp(3.2rem,7vw,6.7rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
            {title}
          </h1>
        </div>
        <p className="max-w-xl border-l border-[#171714]/25 pl-6 text-lg leading-8 text-[#56524a]">
          {body}
        </p>
      </div>
    </section>
  );
}
