import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    q: "Is ApeTerm really free?",
    a: "Yes — free and source-available on GitHub, no paid tier, no locked features. Optional data providers (Finnhub, Financial Modeling Prep) and the AI agent have their own free/paid tiers if you choose to plug in a key.",
  },
  {
    q: "Where does market data come from?",
    a: "Stock quotes stream from yfinance and crypto from Binance's public websocket. Filing and holdings data comes from SEC EDGAR by default. Add a Finnhub or FMP key in settings for richer fundamentals.",
  },
  {
    q: "Does it track me?",
    a: "No telemetry and no analytics by default. Everything lives in a local SQLite database and config file. The only network calls are to the data providers and, if you enable it, the LLM provider you configure.",
  },
  {
    q: "Is this investment advice?",
    a: "No. ApeTerm is a research tool — it surfaces public filings, prices and news. The decisions are yours.",
  },
  {
    q: "Which platforms are supported?",
    a: "Prebuilt binaries for macOS (Apple Silicon) and Linux (x86_64). Other platforms need to build from source with Cargo.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 md:grid-cols-[1fr_1.6fr] md:py-32">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            06 · Questions
          </div>
          <h2 className="mt-4 font-display text-4xl leading-[1.05]">
            Fewer questions than you'd expect.
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="py-6 text-left font-display text-xl hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-6 text-[15px] leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
