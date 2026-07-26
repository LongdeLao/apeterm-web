# ApeTerm Web

The browser version of ApeTerm: a keyboard-first market terminal with live stock
and crypto quotes, financial news, SEC 13F holdings, instrument search, and
full-screen price charts. Built with TanStack Start, React 19, and Tailwind CSS.

## Setup

```sh
bun install
bun run dev        # dev server
bun run build      # production build (NITRO_PRESET=vercel)
bun run preview    # preview the production build
bun run lint       # eslint (includes prettier formatting checks)
bun run format     # prettier --write
```

Open `http://localhost:3000/app`. Press `/` to search instruments and `Enter` to
open the desktop-style chart view.

Market data comes from Yahoo Finance and Binance, news from Google News RSS, and
institutional filings from SEC EDGAR. The one-second Yahoo stream uses the
companion ApeTerm Python/yfinance worker when this repository is checked out
beside the desktop project; the web API remains the fallback.

## Structure

```
src/
  routes/app.tsx     terminal dashboard
  routes/api.*.ts    market, news, search, and SEC data endpoints
  components/instrument-chart.tsx  desktop-style chart view
  routes/            remaining file-based routes
  components/site/  page sections (hero, features, faq, footer, ...)
  components/ui/    shadcn/ui primitives — only the ones actually used
  lib/i18n.tsx      EN/DE copy decks + I18nProvider (locale persisted in localStorage)
  lib/error-*.ts    SSR error capture and fallback error page
  router.tsx        router factory; start.ts / server.ts are the SSR entries
  styles.css        Tailwind entry (tw-animate-css included)
```

## Conventions

- TypeScript strict; `bunx tsc --noEmit` must stay clean.
- Formatting/linting via prettier + eslint (`bun run lint`).
- Path alias `@/*` → `src/*`.
- Add shadcn/ui components on demand (`components.json` is configured);
  don't pre-install the whole kit — unused components get removed.
