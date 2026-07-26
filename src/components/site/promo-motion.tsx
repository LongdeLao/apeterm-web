import { motion } from "motion/react";
import type { ReactNode } from "react";
import { TerminalMock } from "@/components/site/terminal-mock";

export function TerminalStage() {
  return (
    <div className="overflow-hidden border border-[#171714] bg-[#0c0c0c] shadow-[0_35px_90px_-55px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between border-b border-white/20 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/55">
        <span>ApeTerm / workspace</span>
        <span>Keyboard driven</span>
      </div>
      <TerminalMock className="border-0 shadow-none" />
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
