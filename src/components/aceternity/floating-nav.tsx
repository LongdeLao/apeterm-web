import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function FloatingNav({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "relative rounded-full border border-white/70 bg-background/78 shadow-[0_18px_50px_-32px_oklch(0.25_0.03_265/0.35)] backdrop-blur-xl",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.85_0.05_70)] to-transparent"
      />
      {children}
    </motion.div>
  );
}
