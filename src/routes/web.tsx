import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Cloud, Search, Rows3 } from "lucide-react";
import { PageIntro, PromoLayout } from "@/components/site/promo-layout";
import { RevealBlock } from "@/components/site/promo-motion";

export const Route = createFileRoute("/web")({
  head: () => ({
    meta: [
      { title: "Web workspace — ApeTerm" },
      {
        name: "description",
        content: "Use the ApeTerm market research workspace in your browser.",
      },
    ],
  }),
  component: WebPage,
});

const capabilities = [
  [
    Rows3,
    "A desk, not a dashboard",
    "News, watchlists, filings, and notes stay close enough to preserve context.",
  ],
  [
    Search,
    "Find by symbol or company",
    "Search instruments directly, whether you start with AAPL or Apple.",
  ],
  [
    Cloud,
    "Available anywhere",
    "Sign in from a modern browser and return to your account-backed workspace.",
  ],
] as const;

function WebPage() {
  return (
    <PromoLayout>
      <main>
        <PageIntro
          label="Web / browser"
          title="The terminal workflow, without the install."
          body="The web edition brings ApeTerm's compact research desk to the browser. It is the hosted option for quick access and account-backed watchlists—not the Rust application running in a tab."
        />
        <section className="px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto max-w-[1320px]">
            <RevealBlock>
              <div className="grid min-h-[440px] overflow-hidden border border-[#171714] bg-[#171714] text-[#f2efe7] md:grid-cols-[0.72fr_1.28fr]">
                <div className="flex flex-col justify-between border-b border-white/20 p-8 md:border-b-0 md:border-r">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
                    app.apeterm.com
                  </div>
                  <div>
                    <div className="text-6xl font-semibold tracking-[-0.06em]">
                      Open.
                      <br />
                      Research.
                      <br />
                      Return.
                    </div>
                    <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">
                      No download. No broker connection required. Start with the information you
                      already follow.
                    </p>
                  </div>
                </div>
                <div className="grid grid-rows-2 font-mono text-[10px]">
                  <div className="border-b border-white/20 p-7">
                    <div className="mb-8 text-white/40">WATCHLIST / MAIN</div>
                    {[
                      "AAPL  213.88  +0.71%",
                      "NVDA  173.62  +2.84%",
                      "MSFT  495.94  -0.34%",
                      "SPY   637.48  +0.42%",
                    ].map((row) => (
                      <div key={row} className="border-b border-white/10 py-2 text-white/75">
                        {row}
                      </div>
                    ))}
                  </div>
                  <div className="p-7">
                    <div className="mb-5 text-white/40">SEARCH INSTRUMENTS</div>
                    <div className="border border-white/25 p-3 text-white/85">
                      / AAPL<span className="animate-pulse text-[#42d68b]">_</span>
                    </div>
                    <div className="mt-3 border-l-2 border-[#42d68b] bg-white/5 p-3">
                      AAPL · Apple Inc. · NASDAQ
                    </div>
                  </div>
                </div>
              </div>
            </RevealBlock>
            <div className="mt-20 grid border-l border-t border-[#171714] md:grid-cols-3">
              {capabilities.map(([Icon, title, body], index) => (
                <RevealBlock key={title} delay={index * 0.08}>
                  <article className="min-h-64 border-b border-r border-[#171714] p-8">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                    <h2 className="mt-14 text-2xl font-semibold tracking-[-0.04em]">{title}</h2>
                    <p className="mt-4 text-sm leading-6 text-[#5c5850]">{body}</p>
                  </article>
                </RevealBlock>
              ))}
            </div>
            <a
              href="https://app.apeterm.com"
              className="mt-14 inline-flex items-center gap-2 bg-[#171714] px-5 py-3 text-sm text-[#f2efe7]"
            >
              Sign in to the web app <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
    </PromoLayout>
  );
}
