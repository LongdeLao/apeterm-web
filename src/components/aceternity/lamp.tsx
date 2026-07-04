import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Lamp({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_50%_0%,oklch(0.96_0.05_75/0.95),transparent_42%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,oklch(0.9_0.04_75/0.55),transparent_28%,transparent_72%,oklch(0.9_0.04_75/0.55))] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-px w-[34rem] -translate-x-1/2 bg-gradient-to-r from-transparent via-[oklch(0.82_0.09_70)] to-transparent"
      />
      {children}
    </div>
  );
}
