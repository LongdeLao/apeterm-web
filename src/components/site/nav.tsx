import { Link } from "@tanstack/react-router";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <span className="grid h-7 w-7 place-items-center rounded-md border border-border-strong bg-card font-mono text-[13px] leading-none">
        <span className="translate-y-[1px]">≡</span>
      </span>
      <span className="font-mono text-[15px] tracking-tight">apeterm</span>
    </Link>
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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            className="hidden rounded-md border border-border px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-secondary sm:inline-flex"
          >
            GitHub · 2.4k
          </a>
          <a
            href="#download"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
