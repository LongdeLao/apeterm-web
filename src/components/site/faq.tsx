import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    q: "Is ApeTerm really free?",
    a: "Yes. ApeTerm is MIT-licensed and free forever. There's no paid tier, no seat-based pricing, no locked features. Data providers you plug in may have their own free/paid tiers.",
  },
  {
    q: "Where does market data come from?",
    a: "Out of the box, ApeTerm uses free public sources for delayed quotes, filings and macro data. You can plug in your own API keys — Polygon, Alpaca, IEX Cloud, Alpha Vantage — for real-time coverage.",
  },
  {
    q: "Does it track me?",
    a: "No telemetry, no analytics, no crash reporting unless you opt in. Everything runs locally; your watchlists and notes never leave your machine.",
  },
  {
    q: "Is this investment advice?",
    a: "No. ApeTerm is a research tool. It shows you data and helps you reason about it — the decisions are yours.",
  },
  {
    q: "Which platforms are supported?",
    a: "Native builds for macOS (Apple Silicon and Intel), Linux (x86_64 and arm64) and Windows 11.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 md:grid-cols-[1fr_1.6fr] md:py-32">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            05 · Questions
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
