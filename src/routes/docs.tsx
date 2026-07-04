import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Command,
  FileCode2,
  LayoutDashboard,
  Rocket,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { GlowCard } from "@/components/aceternity/glow-card";

export const Route = createFileRoute("/docs")({
  component: DocsPage,
});

const mainNav = [
  { title: "Overview", href: "#overview", icon: LayoutDashboard, badge: "New" },
  { title: "Getting Started", href: "#getting-started", icon: Rocket },
  { title: "CLI", href: "#cli", icon: Command },
];

const resourceNav = [
  { title: "Components", href: "#components", icon: FileCode2 },
  { title: "FAQ", href: "#faq", icon: CircleHelp },
];

function DocsPage() {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ApeTerm logo"
              className="h-10 w-10 rounded-xl border border-sidebar-border bg-white object-cover p-1"
            />
            <div className="min-w-0">
              <div className="font-mono text-sm text-sidebar-foreground">apeterm docs</div>
              <div className="text-xs text-sidebar-foreground/60">Operator handbook</div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Documentation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={item.href === "#overview"}
                    >
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                    {item.title === "Getting Started" ? (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#install">Install</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <a href="#run-local">Run locally</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {resourceNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-sidebar-foreground">
              <BookOpen className="h-4 w-4" />
              Quick start
            </div>
            <p className="mt-1 text-xs leading-5 text-sidebar-foreground/70">
              Install dependencies, run the dev server, then open the local URL in your browser.
            </p>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-screen bg-[radial-gradient(circle_at_top,oklch(1_0_0),transparent_36%),linear-gradient(180deg,oklch(0.992_0.004_90),oklch(0.977_0.005_90))]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur md:px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Docs</span>
          </div>
          <a
            href="https://github.com/LongdeLao/apeterm"
            className="ml-auto hidden items-center gap-2 rounded-full border border-border/80 bg-white/85 px-3.5 py-2 text-sm text-foreground/80 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white md:inline-flex"
          >
            Repo
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-8 md:px-8">
          <GlowCard id="overview" className="p-8 md:p-10">
            <div className="max-w-3xl">
              <div className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Documentation
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                Install it, run it, learn the keys.
              </h1>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                ApeTerm is a terminal app, not a web dashboard — there's no account to make.
                Everything below is what you'll actually type or press.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["keyboard first", "local SQLite", "no telemetry by default"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/80 bg-white/75 px-3 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </GlowCard>

          <section id="getting-started" className="grid gap-6 md:grid-cols-2">
            <GlowCard id="install" className="p-6">
              <h2 className="text-xl font-semibold">Install</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                One script puts <code className="font-mono text-foreground">apeterm</code> on your
                PATH, installs the runtime under{" "}
                <code className="font-mono text-foreground">~/.local/share/apeterm</code>, and sets
                up the private Python runtime used for streaming quotes.
              </p>
              <pre className="mt-5 overflow-x-auto rounded-2xl border border-border/60 bg-[linear-gradient(180deg,oklch(0.99_0.003_90),oklch(0.96_0.005_90))] p-4 font-mono text-sm shadow-inner">
                <code>
                  curl -fsSL https://github.com/LongdeLao/apeterm/raw/master/install.sh | bash
                </code>
              </pre>
            </GlowCard>

            <GlowCard id="run-local" className="p-6" glowClassName="via-[oklch(0.86_0.05_145/0.5)]">
              <h2 className="text-xl font-semibold">First run</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Launch it, open a new terminal if the shell doesn't pick up the new PATH yet, and
                you land on the dashboard with News, Watchlist, Calendar and Notes panels.
              </p>
              <pre className="mt-5 overflow-x-auto rounded-2xl border border-border/60 bg-[linear-gradient(180deg,oklch(0.99_0.003_90),oklch(0.96_0.005_90))] p-4 font-mono text-sm shadow-inner">
                <code>apeterm</code>
              </pre>
            </GlowCard>
          </section>

          <GlowCard id="cli" className="p-6">
            <h2 className="text-xl font-semibold">CLI flags</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Beyond the interactive terminal, a few subcommands run outside the TUI.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
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
                  desc: "Validate the bundled en/de translation files.",
                },
              ].map((row) => (
                <div key={row.cmd} className="rounded-2xl border border-border/70 bg-white/60 p-3">
                  <pre className="overflow-x-auto rounded-xl border border-border/60 bg-[linear-gradient(180deg,oklch(0.99_0.003_90),oklch(0.96_0.005_90))] p-4 font-mono text-sm">
                    <code>{row.cmd}</code>
                  </pre>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{row.desc}</p>
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard id="components" className="p-6">
            <h2 className="text-xl font-semibold">Keybindings</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Vim-style motions throughout — no command palette, just single keys.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["j / k", "move selection"],
                ["h / v", "split focused panel"],
                ["Ctrl+h/j/k/l", "resize panel"],
                ["a", "open the agent"],
                ["/", "open search"],
                [",", "open settings"],
                ["g", "toggle en / de"],
                ["w", "add symbol to watchlist"],
                ["?", "show help"],
              ].map(([key, desc]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-white/70 px-3 py-2.5 shadow-[0_12px_30px_-26px_oklch(0.24_0.03_265/0.35)]"
                >
                  <kbd className="font-mono text-xs text-foreground">{key}</kbd>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard id="faq" className="p-6">
            <h2 className="text-xl font-semibold">FAQ</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Where does config live?</span> A
                single <code className="font-mono text-foreground">config.json</code> in your
                platform's app-config directory holds watchlists, provider keys and preferences.
                Delete it to reset.
              </p>
              <p>
                <span className="font-medium text-foreground">
                  How do I add a data provider key?
                </span>{" "}
                Open settings with <kbd className="font-mono">,</kbd>, or set{" "}
                <code className="font-mono text-foreground">APETERM_FINNHUB_API_KEY</code>,{" "}
                <code className="font-mono text-foreground">APETERM_FMP_API_KEY</code> or{" "}
                <code className="font-mono text-foreground">OPENROUTER_API_KEY</code> as environment
                variables before launch.
              </p>
            </div>
          </GlowCard>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
