import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Github, Keyboard, Database } from "lucide-react";
import { PageIntro, PromoLayout } from "@/components/site/promo-layout";
import { RevealBlock, TerminalStage } from "@/components/site/promo-motion";

export const Route = createFileRoute("/desktop")({
  head: () => ({
    meta: [
      { title: "Desktop terminal — ApeTerm" },
      {
        name: "description",
        content: "A local-first, open-source Rust terminal for market research.",
      },
    ],
  }),
  component: DesktopPage,
});

const details = [
  [
    Keyboard,
    "Keyboard-native",
    "Move through watchlists, filings, news, and notes without reaching for the mouse.",
  ],
  [
    Database,
    "Local by default",
    "Watchlists, settings, and notes live in a local SQLite database you control.",
  ],
  [
    Github,
    "Inspectable",
    "The Rust client is open source. Read it, build it, or adapt it to your workflow.",
  ],
] as const;

function DesktopPage() {
  return (
    <PromoLayout>
      <main>
        <PageIntro
          label="Desktop / Rust"
          title="A market terminal that belongs on your machine."
          body="The desktop edition is a fast terminal UI built in Rust. It keeps the core workflow local, exposes its configuration, and stays out of the way when speed matters."
        />
        <section className="px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto max-w-[1320px]">
            <TerminalStage />
            <div className="mt-20 grid border-l border-t border-[#171714] md:grid-cols-3">
              {details.map(([Icon, title, body], index) => (
                <RevealBlock key={title} delay={index * 0.08}>
                  <article className="min-h-72 border-b border-r border-[#171714] p-8">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                    <h2 className="mt-16 text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
                    <p className="mt-4 text-sm leading-6 text-[#5c5850]">{body}</p>
                  </article>
                </RevealBlock>
              ))}
            </div>
            <div className="mt-14 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/LongdeLao/apeterm/releases"
                className="inline-flex items-center gap-2 bg-[#171714] px-5 py-3 text-sm text-[#f2efe7]"
              >
                <Download className="h-4 w-4" /> Download release
              </a>
              <Link
                to="/docs"
                className="inline-flex items-center gap-2 border border-[#171714] px-5 py-3 text-sm"
              >
                Installation guide <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6a665e]">
                macOS · Linux · Windows
              </span>
            </div>
          </div>
        </section>
      </main>
    </PromoLayout>
  );
}
