export function SiteFooter() {
  const cols = [
    { h: "Product", links: ["Features", "Download", "Changelog", "Roadmap"] },
    { h: "Community", links: ["GitHub", "Discord", "Contribute", "Sponsors"] },
    { h: "Resources", links: ["Docs", "Handbook", "Keyboard map", "Data sources"] },
  ];
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md border border-border-strong bg-card font-mono text-[13px] leading-none">
              <span className="translate-y-[1px]">≡</span>
            </span>
            <span className="font-mono text-[15px]">apeterm</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            An open-source, AI-powered investment terminal for people who like
            building things.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {c.h}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-foreground/80 transition-colors hover:text-foreground">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <div>© 2026 ApeTerm contributors · MIT License</div>
          <div className="font-mono">not investment advice · not a bank · not your keys, not your terminal</div>
        </div>
      </div>
    </footer>
  );
}
