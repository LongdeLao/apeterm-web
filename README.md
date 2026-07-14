# apeterm-webpage

Marketing site for [ApeTerm](../apeterm), built with TanStack Start (React 19,
file-based routing, SSR) and Tailwind CSS v4. Deployed to Vercel via Nitro.

## Setup

```sh
bun install
bun run dev        # dev server
bun run build      # production build (NITRO_PRESET=vercel)
bun run preview    # preview the production build
bun run lint       # eslint (includes prettier formatting checks)
bun run format     # prettier --write
```

## Structure

```
src/
  routes/           file-based routes (see routes/README.md for conventions)
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
