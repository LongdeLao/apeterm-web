export function CTA() {
  return (
    <section id="download" className="border-t border-border bg-surface/60">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <pre className="mx-auto font-mono text-[12px] leading-[1.15] text-muted-foreground">
{`      / ≡ ヽ
    (6(  ·  ·|)
     |    ( ⊥ )`}
        </pre>
        <h2 className="mx-auto mt-8 max-w-2xl font-display text-4xl leading-[1.05] md:text-6xl">
          The market opens at 9:30. So does your terminal.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-muted-foreground">
          Install ApeTerm and spend the morning reading, not clicking.
        </p>

        <div className="mt-10 inline-flex items-center gap-2 rounded-lg border border-border-strong bg-card px-4 py-3 font-mono text-[13px]">
          <span className="text-muted-foreground">$</span>
          <span>brew install apeterm</span>
          <button
            className="ml-3 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary"
            onClick={() => navigator.clipboard?.writeText("brew install apeterm")}
          >
            Copy
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <a href="#" className="underline underline-offset-4 hover:text-foreground">macOS</a>
          <span>·</span>
          <a href="#" className="underline underline-offset-4 hover:text-foreground">Linux</a>
          <span>·</span>
          <a href="#" className="underline underline-offset-4 hover:text-foreground">Windows</a>
          <span>·</span>
          <a href="#" className="underline underline-offset-4 hover:text-foreground">Source</a>
        </div>
      </div>
    </section>
  );
}
