import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowClassName?: string;
  id?: string;
}

export function GlowCard({ children, className, glowClassName, id }: GlowCardProps) {
  return (
    <motion.div
      id={id}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className={cn(
        "group relative overflow-hidden rounded-[28px] border border-border/80 bg-white/85 shadow-[0_20px_60px_-38px_oklch(0.32_0.04_55/0.28)] backdrop-blur-sm",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-10 top-0 h-20 bg-gradient-to-r from-transparent via-[oklch(0.86_0.08_70/0.55)] to-transparent blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          glowClassName,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,oklch(1_0_0/0.82),transparent_42%,oklch(0.985_0.01_90/0.92))]"
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
