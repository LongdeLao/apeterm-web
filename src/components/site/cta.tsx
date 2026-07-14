import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { AppleIcon, LinuxIcon, WindowsIcon } from "@/components/icons/platform";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const INSTALL_CMD = "curl -fsSL https://github.com/LongdeLao/apeterm/raw/master/install.sh | bash";
const WINDOWS_DOWNLOAD_URL =
  "https://github.com/LongdeLao/apeterm/releases/latest/download/apeterm-x86_64-pc-windows-msvc.zip";

function detectPlatform(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/Mac/i.test(ua)) return "macOS (Apple Silicon)";
  if (/Windows/i.test(ua)) return "Windows (x86_64)";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "Linux (x86_64)";
  return null;
}

export function CTA() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState<string | null>(null);
  const displayedCommand = platform?.startsWith("Windows") ? WINDOWS_DOWNLOAD_URL : INSTALL_CMD;

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(displayedCommand);
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
          {t.cta.title}
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-muted-foreground">{t.cta.body}</p>

        <button
          onClick={copy}
          className="group mx-auto mt-10 inline-flex max-w-full cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-3 text-left font-mono text-[13px] transition-colors hover:border-foreground/25"
          aria-label={t.cta.copyLabel}
        >
          <span className="shrink-0 text-muted-foreground">$</span>
          <span className="truncate">{displayedCommand.replace("https://", "")}</span>
          <span
            className={cn(
              "ml-1 inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] transition-colors",
              copied
                ? "border-transparent bg-[oklch(0.78_0.16_145/0.15)] text-[oklch(0.45_0.12_145)]"
                : "text-muted-foreground group-hover:bg-secondary",
            )}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? t.cta.copied : t.cta.copy}
          </span>
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          {platform ? (
            <span className="inline-flex items-center gap-1.5">
              {platform.startsWith("mac") ? (
                <AppleIcon className="h-3.5 w-3.5" />
              ) : platform.startsWith("Windows") ? (
                <WindowsIcon className="h-3.5 w-3.5" />
              ) : (
                <LinuxIcon className="h-3.5 w-3.5" />
              )}
              {t.cta.detected} <span className="text-foreground/80">{platform}</span> —{" "}
              {t.cta.supported}
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5">
                <AppleIcon className="h-3.5 w-3.5" /> macOS · Apple Silicon
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <LinuxIcon className="h-3.5 w-3.5" /> Linux · x86_64
              </span>
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5">
                <WindowsIcon className="h-3.5 w-3.5" /> Windows · x86_64
              </span>
            </>
          )}
          <span className="text-border">·</span>
          <a
            href="https://github.com/LongdeLao/apeterm"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {t.cta.source}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
