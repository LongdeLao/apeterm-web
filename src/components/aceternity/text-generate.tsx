import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  words: string;
  className?: string;
  delay?: number;
}

/** Aceternity-style word-by-word reveal, kept subtle. */
export function TextGenerate({ words, className, delay = 0 }: Props) {
  const arr = words.split(" ");
  return (
    <span className={cn("inline", className)}>
      {arr.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.055,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
        >
          {w}
          {i < arr.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}
