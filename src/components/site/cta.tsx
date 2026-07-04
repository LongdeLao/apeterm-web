import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { AppleIcon, LinuxIcon } from "@/components/icons/platform";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const INSTALL_CMD = "curl -fsSL https://github.com/LongdeLao/apeterm/raw/master/install.sh | bash";

function detectPlatform(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/Mac/i.test(ua)) return "macOS (Apple Silicon)";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "Linux (x86_64)";
  return null;
}

export function CTA() {
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — leave the button as-is
    }
  };

  return (
    <section id="download" className="border-t border-border bg-surface/60">
      <Reveal className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <pre className="mx-auto font-mono text-[12px] leading-[1.15] text-muted-foreground">
          {`      / ≡ ヽ
    (6(  ·  ·|)
     |    ( ⊥ )`}
        </pre>
        <h2 className="mx-auto mt-8 max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">
          The market opens at 9:30. So does your terminal.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-muted-foreground">
          Install ApeTerm and spend the morning reading, not clicking.
        </p>

        <button
          onClick={copy}
          className="group mx-auto mt-10 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-3 text-left font-mono text-[13px] transition-colors hover:border-foreground/25"
          aria-label="Copy install command"
        >
          <span className="shrink-0 text-muted-foreground">$</span>
          <span className="truncate">
            curl -fsSL github.com/LongdeLao/apeterm/raw/master/install.sh | bash
          </span>
          <span
            className={cn(
              "ml-1 inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] transition-colors",
              copied
                ? "border-transparent bg-[oklch(0.78_0.16_145/0.15)] text-[oklch(0.45_0.12_145)]"
                : "text-muted-foreground group-hover:bg-secondary",
            )}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </span>
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {platform ? (
            <span>
              detected: <span className="text-foreground/80">{platform}</span> — supported ✓
            </span>
          ) : (
            <>
              <span>macOS (Apple Silicon)</span>
              <span>·</span>
              <span>Linux (x86_64)</span>
            </>
          )}
          <span>·</span>
          <a
            href="https://github.com/LongdeLao/apeterm"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Source
          </a>
        </div>
      </Reveal>
    </section>
  );
}
