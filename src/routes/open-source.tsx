import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Braces, Bug, GitFork } from "lucide-react";
import { PageIntro, PromoLayout } from "@/components/site/promo-layout";
import { RevealBlock } from "@/components/site/promo-motion";

export const Route = createFileRoute("/open-source")({
  head: () => ({
    meta: [
      { title: "Open source — ApeTerm" },
      { name: "description", content: "Inspect, build, and contribute to ApeTerm on GitHub." },
    ],
  }),
  component: OpenSourcePage,
});

function OpenSourcePage() {
  return (
    <PromoLayout>
      <main>
        <PageIntro
          label="Open source / GitHub"
          title="Research software should withstand inspection."
          body="ApeTerm's code is public. You can see how the desktop client stores data, how market providers are connected, and where a contribution would fit before you rely on it."
        />
        <section className="bg-[#171714] px-5 py-20 text-[#f2efe7] sm:px-8 md:py-28">
          <div className="mx-auto max-w-[1320px]">
            <RevealBlock>
              <div className="font-mono text-[clamp(2rem,5vw,5.5rem)] leading-[1.05] tracking-[-0.055em] text-white/90">
                github.com/
                <br />
                <span className="text-[#42d68b]">LongdeLao/apeterm</span>
              </div>
            </RevealBlock>
            <div className="mt-20 grid border-l border-t border-white/30 md:grid-cols-3">
              {[
                [Braces, "Read the code", "Trace the data flow and understand the defaults."],
                [GitFork, "Shape the tool", "Fork the project or propose a focused improvement."],
                [Bug, "Report precisely", "Open an issue with the context needed to reproduce it."],
              ].map(([Icon, title, body], index) => (
                <RevealBlock key={title as string} delay={index * 0.08}>
                  <article className="min-h-64 border-b border-r border-white/30 p-8">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                    <h2 className="mt-14 text-2xl font-semibold tracking-[-0.04em]">
                      {title as string}
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-white/55">{body as string}</p>
                  </article>
                </RevealBlock>
              ))}
            </div>
            <div className="mt-14 flex flex-wrap gap-3">
              <a
                href="https://github.com/LongdeLao/apeterm"
                className="inline-flex items-center gap-2 bg-[#f2efe7] px-5 py-3 text-sm text-[#171714]"
              >
                View repository <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link to="/docs" className="border border-white/40 px-5 py-3 text-sm">
                Read the docs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PromoLayout>
  );
}
