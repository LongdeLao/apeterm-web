import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FlipWordsProps {
  words: string[];
  className?: string;
  interval?: number;
}

export function FlipWords({ words, className, interval = 1800 }: FlipWordsProps) {
  const [index, setIndex] = useState(0);
  const width = `${Math.max(...words.map((word) => word.length), 1) + 1}ch`;

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, words.length]);

  return (
    <span
      className={cn(
        "relative inline-grid overflow-hidden align-baseline text-foreground",
        className,
      )}
      style={{ width }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: 18, opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -18, opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="col-start-1 row-start-1 whitespace-nowrap italic text-muted-foreground"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
