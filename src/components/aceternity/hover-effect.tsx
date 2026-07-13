import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function HoverEffect({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      className={cn("group relative h-full", className)}
    >
      <motion.div
        variants={{
          rest: { opacity: 0.4, scale: 0.96 },
          hover: { opacity: 1, scale: 1 },
        }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-lg bg-[linear-gradient(135deg,oklch(1_0_0),oklch(0.97_0.006_90))] shadow-[0_20px_60px_-34px_oklch(0.3_0.04_55/0.32)]"
      />
      <motion.div
        variants={{
          rest: { y: 0 },
          hover: { y: -4 },
        }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative h-full rounded-lg border border-border/80 bg-white/82 backdrop-blur-sm"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
