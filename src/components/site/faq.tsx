import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";

export function FAQ() {
  const { t } = useI18n();

  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 md:grid-cols-[1fr_1.6fr] md:py-32">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {t.faq.eyebrow}
          </div>
          <h2 className="mt-4 font-display text-4xl leading-[1.05]">{t.faq.title}</h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {t.faq.items.map(([q, a], i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
              <AccordionTrigger className="py-6 text-left font-display text-xl hover:no-underline">
                {q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-6 text-[15px] leading-relaxed text-muted-foreground">
                {a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
