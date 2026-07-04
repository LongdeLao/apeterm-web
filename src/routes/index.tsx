import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Ticker } from "@/components/site/ticker";
import { Features } from "@/components/site/features";
import { Workflow } from "@/components/site/workflow";
import { OpenSource } from "@/components/site/open-source";
import { Compare } from "@/components/site/compare";
import { FAQ } from "@/components/site/faq";
import { CTA } from "@/components/site/cta";
import { SiteFooter } from "@/components/site/footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero />
        <Ticker />
        <Features />
        <Workflow />
        <OpenSource />
        <Compare />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}
