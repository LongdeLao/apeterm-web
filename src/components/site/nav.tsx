import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github, Star } from "lucide-react";
import { FloatingNav } from "@/components/aceternity/floating-nav";
import { formatCount, useGitHubStats } from "@/hooks/use-github-stats";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3.5 group">
      <img
        src="/logo.png"
        alt="ApeTerm logo"
        className="h-14 w-14 rounded-[20px] border border-border-strong bg-card object-cover p-1.5 shadow-[0_18px_40px_-24px_oklch(0.24_0.03_265/0.38)]"
      />
      <div className="leading-none">
        <div className="font-mono text-[22px] tracking-tight text-foreground">apeterm</div>
        <div className="font-mono text-[12px] uppercase tracking-[0.26em] text-muted-foreground">
          terminal alpha
        </div>
      </div>
    </Link>
  );
}

function GitHubStars() {
  const { data } = useGitHubStats();
  if (!data || data.stars === 0) return null;
  return (
    <span className="ml-0.5 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
      <Star className="h-3 w-3 fill-current" />
      {formatCount(data.stars)}
    </span>
  );
}

const links = [
  { href: "#features", label: "Features" },
  { href: "#terminal", label: "Terminal" },
  { href: "#workflow", label: "Workflow" },
  { href: "#open-source", label: "Open source" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6">
      <FloatingNav className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
        <div className="relative flex items-center justify-between gap-4">
          <Logo />
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center rounded-full border border-border/80 bg-white/82 p-1.5 text-[15px] shadow-[0_12px_30px_-24px_oklch(0.24_0.03_265/0.35)] xl:flex">
            <Link
              to="/docs"
              className="rounded-full px-4 py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Docs
            </Link>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <a
              href="https://github.com/LongdeLao/apeterm"
              className="hidden items-center gap-2 rounded-full border border-border/80 bg-white/84 px-4 py-2.5 text-sm text-foreground/80 transition-all hover:-translate-y-0.5 hover:bg-white lg:inline-flex"
            >
              <Github className="h-4 w-4" />
              GitHub
              <GitHubStars />
            </a>
            <a
              href="#download"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_16px_36px_-20px_oklch(0.18_0.01_265)] transition-all hover:-translate-y-0.5 hover:opacity-95"
            >
              Install
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </FloatingNav>
    </header>
  );
}
