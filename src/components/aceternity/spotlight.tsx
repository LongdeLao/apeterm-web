import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A subtle radial "paper light" spotlight — muted for light theme.
 * Aceternity-inspired but toned down (no glowing neon).
 */
export function Spotlight({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        className,
      )}
      style={{
        background:
          "radial-gradient(60% 45% at 50% 0%, oklch(0.98 0.02 75 / 0.9), transparent 70%)",
      }}
    />
  );
}
