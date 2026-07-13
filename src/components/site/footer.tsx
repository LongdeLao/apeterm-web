import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  const cols = [
    {
      h: t.footer.cols[0][0],
      links: [
        { l: t.footer.cols[0][1], href: "#features" },
        { l: t.footer.cols[0][2], href: "#workflow" },
        { l: t.footer.cols[0][3], href: "#download" },
      ],
    },
    {
      h: t.footer.cols[1][0],
      links: [
        { l: t.footer.cols[1][1], href: "https://github.com/LongdeLao/apeterm" },
        { l: t.footer.cols[1][2], href: "https://github.com/LongdeLao/apeterm/issues" },
        { l: t.footer.cols[1][3], href: "https://github.com/LongdeLao/apeterm/releases" },
      ],
    },
    {
      h: t.footer.cols[2][0],
      links: [
        { l: t.footer.cols[2][1], href: "/docs" },
        { l: t.footer.cols[2][2], href: "#faq" },
      ],
    },
  ];
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="ApeTerm logo"
              className="h-8 w-8 rounded-md border border-border-strong bg-card object-cover p-1"
            />
            <span className="font-mono text-[15px]">apeterm</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {t.footer.body}
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {c.h}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map((item) => (
                <li key={item.l}>
                  <a
                    href={item.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {item.l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <div>© 2026 ApeTerm</div>
          <div className="font-mono">
            {t.footer.legal}
          </div>
        </div>
      </div>
    </footer>
  );
}
