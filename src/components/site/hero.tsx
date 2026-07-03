import { motion } from "motion/react";
import { Spotlight } from "@/components/aceternity/spotlight";
import { TextGenerate } from "@/components/aceternity/text-generate";
import { TerminalMock } from "./terminal-mock";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Spotlight />
      <div aria-hidden className="absolute inset-0 -z-10 bg-paper-grid opacity-60" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background" />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.a
            href="#open-source"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.14_145)]" />
            v0.4 — SEC filings + AI notes shipped
            <span className="text-foreground/60 transition-transform group-hover:translate-x-0.5">→</span>
          </motion.a>

          <h1 className="mt-8 font-display text-[52px] leading-[0.98] tracking-[-0.02em] text-balance md:text-[88px]">
            <TextGenerate words="The open-source" />
            <br />
            <span className="italic text-muted-foreground/80">
              <TextGenerate words="investment terminal." delay={0.3} />
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-7 max-w-xl text-[17px] leading-relaxed text-muted-foreground text-balance"
          >
            Market data, filings, news and an AI analyst — bound together by a
            fast, keyboard-driven terminal. Free, local-first, and built in the
            open.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#download"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Download for macOS
              <span className="font-mono text-[11px] opacity-70">⌘</span>
            </a>
            <a
              href="https://github.com"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-secondary"
            >
              <span className="font-mono">★</span> Star on GitHub
              <span className="text-muted-foreground">2.4k</span>
            </a>
          </motion.div>

          <div className="mt-6 font-mono text-[11px] text-muted-foreground">
            macOS · Linux · Windows · MIT licensed
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
          id="terminal"
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <TerminalMock />
          <div aria-hidden className="pointer-events-none absolute -inset-x-8 -bottom-6 h-16 rounded-full bg-black/5 blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
