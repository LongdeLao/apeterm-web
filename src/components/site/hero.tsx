import { motion } from "motion/react";
import { ArrowUpRight, Github } from "lucide-react";
import { Lamp } from "@/components/aceternity/lamp";
import { Spotlight } from "@/components/aceternity/spotlight";
import { TextGenerate } from "@/components/aceternity/text-generate";
import { AppleIcon, LinuxIcon } from "@/components/icons/platform";
import { TerminalMock } from "./terminal-mock";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Lamp className="absolute inset-0 -z-10">
        <Spotlight />
      </Lamp>
      <div aria-hidden className="absolute inset-0 -z-10 bg-paper-grid opacity-55" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background"
      />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/75 px-3 py-1 font-mono text-[11px] text-muted-foreground shadow-sm backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.6_0.14_145)]" />
            written in Rust · runs in your shell
          </motion.div>

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
            Live prices, institutional &amp; insider filings, news and a watchlist agent — in one
            fast, keyboard-driven terminal. Free and local-first: your data stays in a SQLite file
            on your machine.
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
              Install ApeTerm
            </a>
            <a
              href="https://github.com/LongdeLao/apeterm"
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/85 px-4 py-2.5 text-sm text-foreground/90 shadow-[0_14px_36px_-28px_oklch(0.22_0.02_265)] transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              <Github className="h-4 w-4" />
              Read the repo
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </motion.div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
            {["macOS (Apple Silicon)", "Linux (x86_64)", "local-first", "open-source"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-border/70 bg-white/65 px-2.5 py-1 font-mono"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: "easeOut" }}
            id="terminal"
            className="relative"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 -top-6 h-10 rounded-full bg-[oklch(0.88_0.08_70/0.55)] blur-3xl"
            />
            <TerminalMock />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-8 -bottom-6 h-16 rounded-full bg-black/5 blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
