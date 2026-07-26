import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageIntro, PromoLayout } from "@/components/site/promo-layout";
import { RevealBlock, TerminalStage } from "@/components/site/promo-motion";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "Product — ApeTerm" },
      { name: "description", content: "A focused market research workspace for desktop and web." },
    ],
  }),
  component: ProductPage,
});

const workflow = [
  ["01", "Notice", "See price movement and relevant market news in one view."],
  ["02", "Inspect", "Move from the headline to filings, charts, and the underlying source."],
  ["03", "Record", "Keep the thesis and the follow-up beside the instrument."],
  ["04", "Return", "Open the same research context when the market changes again."],
] as const;

function ProductPage() {
  return (
    <PromoLayout>
      <main>
        <PageIntro
          label="Product / research workflow"
          title="The useful parts of a market desk."
          body="ApeTerm puts watchlists, news, SEC filings, charts, and notes into a restrained workspace. It helps you research; it does not place trades or pretend to replace judgment."
        />
        <section className="px-5 py-20 sm:px-8 md:py-28">
          <div className="mx-auto max-w-[1320px]">
            <RevealBlock>
              <TerminalStage />
            </RevealBlock>
            <div className="mt-24 grid border-l border-t border-[#171714] md:grid-cols-2 lg:grid-cols-4">
              {workflow.map(([number, title, body], index) => (
                <RevealBlock key={title} delay={index * 0.07}>
                  <article className="min-h-64 border-b border-r border-[#171714] p-7">
                    <span className="font-mono text-xs text-[#777168]">{number}</span>
                    <h2 className="mt-14 text-2xl font-semibold tracking-[-0.035em]">{title}</h2>
                    <p className="mt-4 text-sm leading-6 text-[#5c5850]">{body}</p>
                  </article>
                </RevealBlock>
              ))}
            </div>
            <div className="mt-16 flex flex-wrap gap-3">
              <Link
                to="/desktop"
                className="inline-flex items-center gap-2 bg-[#171714] px-5 py-3 text-sm text-[#f2efe7]"
              >
                Desktop terminal <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/web"
                className="inline-flex items-center gap-2 border border-[#171714] px-5 py-3 text-sm"
              >
                Web workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PromoLayout>
  );
}
