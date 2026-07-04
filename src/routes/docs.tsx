import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { AppleIcon, LinuxIcon } from "@/components/icons/platform";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
  head: () => ({
    meta: [
      { title: "ApeTerm · Docs" },
      {
        name: "description",
        content:
          "Install ApeTerm, learn the keys, and configure providers. The complete operator handbook.",
      },
    ],
  }),
});

const sections = [
  { id: "install", label: "Install" },
  { id: "first-run", label: "First run" },
  { id: "cli", label: "CLI" },
  { id: "keys", label: "Keys" },
  { id: "config", label: "Config" },
  { id: "providers", label: "Providers" },
  { id: "faq", label: "FAQ" },
];

function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Slim top bar */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-border" />
          <span className="text-sm text-foreground">Docs</span>
          <a
            href="https://github.com/LongdeLao/apeterm"
            className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Repository
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-6 py-20 md:grid-cols-[200px_1fr] md:gap-20">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1 font-mono text-[13px]">
            <div className="mb-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Contents
            </div>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Article */}
        <article className="max-w-3xl">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Documentation
          </div>
          <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-[-0.02em] text-balance md:text-6xl">
            Install it. Run it.
            <br />
            <span className="italic text-muted-foreground/80">Learn the keys.</span>
          </h1>
          <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            ApeTerm is a terminal app, not a web dashboard. There's no account. Everything below
            is what you'll actually type or press.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-2.5 py-1 font-mono">
              <AppleIcon className="h-3 w-3" /> macOS · Apple Silicon
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/65 px-2.5 py-1 font-mono">
              <LinuxIcon className="h-3 w-3" /> Linux · x86_64
            </span>
          </div>

          <Divider />

          <Section id="install" number="01" title="Install">
            <p>
              One script puts <Mono>apeterm</Mono> on your <Mono>PATH</Mono>, installs the
              runtime under <Mono>~/.local/share/apeterm</Mono>, and sets up the private Python
              runtime used for streaming quotes.
            </p>
            <Code>
              curl -fsSL https://github.com/LongdeLao/apeterm/raw/master/install.sh | bash
            </Code>
          </Section>

          <Section id="first-run" number="02" title="First run">
            <p>
              Launch it. If your shell hasn't picked up the new <Mono>PATH</Mono>, open a fresh
              terminal window. You land on the dashboard with News, Watchlist, Calendar and Notes.
            </p>
            <Code>apeterm</Code>
          </Section>

          <Section id="cli" number="03" title="CLI">
            <p>Beyond the interactive terminal, a few subcommands run outside the TUI.</p>
            <dl className="mt-6 divide-y divide-border/70 border-y border-border/70">
              {[
                {
                  cmd: "apeterm sec-sync",
                  desc: "Sync SEC EDGAR entities (13F, Form 4, congress) into the local DB.",
                },
                {
                  cmd: "apeterm update",
                  desc: "Pull the latest release and replace the installed binary.",
                },
                {
                  cmd: "apeterm --check-locales",
                  desc: "Validate the bundled en / de translation files.",
                },
              ].map((row) => (
                <div
                  key={row.cmd}
                  className="grid grid-cols-1 gap-2 py-4 md:grid-cols-[240px_1fr] md:gap-8"
                >
                  <dt className="font-mono text-[13px] text-foreground">{row.cmd}</dt>
                  <dd className="text-sm leading-6 text-muted-foreground">{row.desc}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="keys" number="04" title="Keys">
            <p>Vim-style motions throughout. No command palette — just single keys.</p>
            <dl className="mt-6 divide-y divide-border/70 border-y border-border/70">
              {[
                ["j / k", "move selection"],
                ["h / v", "split focused panel"],
                ["Ctrl + h/j/k/l", "resize panel"],
                ["a", "open the agent"],
                ["/", "open search"],
                [",", "open settings"],
                ["g", "toggle en / de"],
                ["w", "add symbol to watchlist"],
                ["?", "show help"],
              ].map(([key, desc]) => (
                <div
                  key={key}
                  className="grid grid-cols-[130px_1fr] items-center gap-8 py-3 md:grid-cols-[180px_1fr]"
                >
                  <kbd className="font-mono text-[13px] text-foreground">{key}</kbd>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="config" number="05" title="Config">
            <p>
              A single <Mono>config.json</Mono> in your platform's app-config directory holds
              watchlists, provider keys and preferences. Delete it to reset.
            </p>
          </Section>

          <Section id="providers" number="06" title="Providers">
            <p>
              Open settings with <Kbd>,</Kbd>, or set these environment variables before launch:
            </p>
            <ul className="mt-5 space-y-2 font-mono text-[13px]">
              <li>
                <Mono>APETERM_FINNHUB_API_KEY</Mono>
                <span className="ml-3 text-muted-foreground">Finnhub — deeper fundamentals</span>
              </li>
              <li>
                <Mono>APETERM_FMP_API_KEY</Mono>
                <span className="ml-3 text-muted-foreground">FMP — financial statements</span>
              </li>
              <li>
                <Mono>OPENROUTER_API_KEY</Mono>
                <span className="ml-3 text-muted-foreground">Agent — model of your choice</span>
              </li>
            </ul>
          </Section>

          <Section id="faq" number="07" title="FAQ">
            <div className="space-y-6">
              <div>
                <div className="text-foreground">Where does my data live?</div>
                <p className="mt-1.5 text-muted-foreground">
                  A single SQLite file on your machine, alongside <Mono>config.json</Mono>. Nothing
                  is synced unless you turn it on.
                </p>
              </div>
              <div>
                <div className="text-foreground">Is telemetry on by default?</div>
                <p className="mt-1.5 text-muted-foreground">No.</p>
              </div>
              <div>
                <div className="text-foreground">Windows?</div>
                <p className="mt-1.5 text-muted-foreground">
                  Not yet. WSL works in the meantime.
                </p>
              </div>
            </div>
          </Section>

          <Divider />

          <div className="pb-16 text-sm text-muted-foreground">
            Found something wrong?{" "}
            <a
              href="https://github.com/LongdeLao/apeterm/issues"
              className="text-foreground underline underline-offset-4 hover:opacity-80"
            >
              File an issue
            </a>
            .
          </div>
        </article>
      </div>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-20 scroll-mt-24">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          {number}
        </span>
        <h2 className="font-display text-3xl tracking-[-0.01em] md:text-4xl">{title}</h2>
      </div>
      <div className="mt-6 space-y-4 text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="mt-16 h-px w-full bg-border/70" />;
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md border border-border/60 bg-secondary/60 px-1.5 py-0.5 font-mono text-[13px] text-foreground">
      {children}
    </code>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[12px] text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mt-6 overflow-x-auto rounded-xl border border-border/70 bg-terminal-bg px-5 py-4 font-mono text-[13px] leading-relaxed text-terminal-fg">
      <code>
        <span className="mr-3 select-none text-terminal-muted">$</span>
        {children}
      </code>
    </pre>
  );
}
