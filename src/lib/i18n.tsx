import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "de";

const STORAGE_KEY = "apeterm-locale";

export const copy = {
  en: {
    nav: {
      docs: "Docs",
      links: [
        ["#features", "Features"],
        ["#workflow", "Workflow"],
        ["#open-source", "Open source"],
        ["#faq", "FAQ"],
      ],
      install: "Install",
      language: "Language",
    },
    hero: {
      badge: "markets in your terminal",
      titleA: "The open-source",
      titleB: "investment terminal.",
      body: "Prices, filings and news in one fast, keyboard-driven terminal. Local-first — your data stays in a SQLite file on your machine.",
      install: "Install ApeTerm",
      repo: "Read the repo",
      tags: ["local-first", "open-source"],
    },
    ticker: { label: "live crypto" },
    features: {
      eyebrow: "02 · What it does",
      headingA: "Market context,",
      headingB: "without the dashboard.",
      body: "ApeTerm keeps the high-signal parts of investing close to your shell: prices, filings, news and an agent that can change your workspace.",
      command: "apeterm watch NVDA BTC",
      items: [
        ["Markets", "Watch the tape.", "Stocks, ETFs and crypto watchlists in one fast local interface."],
        ["Filings", "See who moved.", "13F changes, Form 4 trades and congressional disclosures from SEC EDGAR."],
        ["News", "Read less noise.", "Per-ticker RSS feeds are grouped and deduped before they hit your screen."],
        ["Agent", "Ask, then act.", "Open tickers, build lists and change views without leaving the keyboard."],
      ],
      metrics: [
        ["0 accounts", "Local SQLite storage"],
        ["4 data lanes", "Quotes, filings, news, agent"],
        ["1 command", "Install and start from the shell"],
      ],
    },
    workflow: {
      eyebrow: "03 · Workflow",
      title: "From install to insight in four steps.",
      body: "ApeTerm is built for the way you already work — a shell, a keyboard, no dashboards to learn.",
      steps: [
        ["Install in one line.", "Puts apeterm on your PATH and sets up its local SQLite database and Python runtime. No accounts, no signup."],
        ["Open the dashboard.", "Press w in the watchlist view to add a ticker, h/v to split views, j/k to move — no mouse needed."],
        ["Press a, and just ask.", "The agent reads your current watchlists and screen state, then calls real tools to make the change."],
        ["Bring your own keys.", "Plug in Finnhub, FMP or an OpenRouter model — or run entirely on the free SEC EDGAR fallback."],
      ],
    },
    openSource: {
      eyebrow: "04 · Open source",
      title: "Built to stay out of your way.",
      body: "ApeTerm is for people who want a serious market workspace without another SaaS layer sitting between them and the data.",
      button: "Read the code",
      stats: ["stars", "forks", "open issues"],
      principles: [
        ["Local by default", "SQLite on your machine. No account wall, no sync setup, no hosted workspace to babysit."],
        ["Fast enough to use daily", "Keyboard-first flows, lightweight views and a layout designed for repeated scanning."],
        ["Hackable when you need more", "Bring your own data keys, extend the stack, or fork the repo when your workflow outgrows the defaults."],
      ],
      stackTitle: "What it's made of",
      stack: [
        ["Language", "Rust, ratatui + crossterm for the TUI"],
        ["Storage", "Local SQLite — nothing leaves your machine"],
        ["Market data", "yfinance stream · Binance websocket"],
        ["Filings", "SEC EDGAR — 13F, Form 4, congressional"],
        ["Agent", "Bring your own key via OpenRouter"],
        ["Telemetry", "None by default"],
      ],
    },
    compare: {
      eyebrow: "05 · The alternative",
      title: "Less tab chaos. More terminal.",
      body: "ApeTerm pulls the stuff you keep checking anyway into one keyboard-driven place: quotes, filings, news and notes. No seat license, no giant web dashboard.",
      headers: ["ApeTerm", "Pro terminal", "Web dashboards"],
      sub: ["free", "~$30k/yr", "freemium"],
      rows: [
        "Live stock & crypto quotes",
        "13F / Form 4 / congressional filings",
        "AI agent that acts on your workspace",
        "Keyboard-driven, runs in your shell",
        "Your data stays on your machine",
        "Source code you can read and fork",
      ],
    },
    faq: {
      eyebrow: "06 · Questions",
      title: "Fewer questions than you'd expect.",
      items: [
        ["Is ApeTerm really free?", "Yes — free and source-available on GitHub, no paid tier, no locked features. Optional data providers (Finnhub, Financial Modeling Prep) and the AI agent have their own free/paid tiers if you choose to plug in a key."],
        ["Where does market data come from?", "Stock quotes stream from yfinance and crypto from Binance's public websocket. Filing and holdings data comes from SEC EDGAR by default. Add a Finnhub or FMP key in settings for richer fundamentals."],
        ["Does it track me?", "No telemetry and no analytics by default. Everything lives in a local SQLite database and config file. The only network calls are to the data providers and, if you enable it, the LLM provider you configure."],
        ["Is this investment advice?", "No. ApeTerm shows public filings, prices and news. What you do with it is on you."],
        ["Which platforms are supported?", "Prebuilt binaries for macOS (Apple Silicon) and Linux (x86_64). Other platforms need to build from source with Cargo."],
      ],
    },
    cta: {
      title: "The market opens at 9:30. So does your terminal.",
      body: "Install ApeTerm and spend the morning reading, not clicking.",
      copy: "Copy",
      copied: "Copied",
      copyLabel: "Copy install command",
      detected: "detected:",
      supported: "supported",
      source: "Source",
    },
    footer: {
      body: "An open-source investment terminal, built in Rust for people who like building things.",
      cols: [
        ["Product", "Features", "Workflow", "Install"],
        ["Source", "GitHub", "Issues", "Releases"],
        ["Resources", "Docs", "FAQ"],
      ],
      legal: "not investment advice · not a bank",
    },
    terminal: {
      panels: "Panels",
      labels: ["watchlist", "news", "sec", "agent"],
      searchPlaceholder: "Search symbols, filings, news...",
      keys: "Keys",
      keyRows: ["a — ask agent", "/ — search", "h/v — split", "j/k — move"],
      hint: "this demo is live — click a panel, or hover and press 1 / 2 / 3 / a",
      prompt: ["apeterm · press", "to ask the agent,", "to search"],
      columns: ["Sym", "Name", "Last", "Chg"],
      stream: "streaming · yfinance + binance ws",
      newsTitle: "News — all tickers",
      extraNews: [
        "Apple supplier checks point to a stronger cycle",
        "Stock futures drift before the open",
        "Congress tracker: new NVDA disclosures",
        "Oil slips as OPEC+ weighs output increase",
      ],
      ago: "ago",
      dedupe: "deduplicated across RSS wires",
      secTitle: "SEC EDGAR — recent filings",
      secColumns: ["Form", "Action", "Sym", "Size"],
      secNote: "13F · Form 4 · congressional disclosures — free, no key needed",
      agentTitle: "Agent — grounded in screen state",
      afterHours: "after-hours",
      agentPrompt: "Ask a question. I’ll check the workspace.",
      agentHints: [
        "Add or remove from a watchlist",
        "Create a new watchlist",
        "Open a ticker's details",
        "Summarize current holdings",
      ],
      askPlaceholder: "ask anything...",
      actions: ["Buy", "Sell", "Cut", "Buy", "New"],
      news: [
        "Fed holds rates steady, signals two cuts in 2026",
        "NVIDIA reports record data-center revenue",
        "Apple supplier checks point to strong iPhone cycle",
        "Oil slips as OPEC+ weighs output increase",
        "Congress trading tracker: 3 new NVDA disclosures",
      ],
      agentScript: [
        'add UBER and DASH to a new "delivery" list',
        'create_watchlist(name="delivery")',
        "add_symbols([UBER, DASH] → delivery)",
        'Done — created "delivery" with 2 symbols. UBER is up 1.8% today; DASH reports earnings Thursday.',
      ],
    },
  },
  de: {
    nav: {
      docs: "Docs",
      links: [
        ["#features", "Funktionen"],
        ["#workflow", "Workflow"],
        ["#open-source", "Source"],
        ["#faq", "FAQ"],
      ],
      install: "Installieren",
      language: "Sprache",
    },
    hero: {
      badge: "Märkte direkt im Terminal",
      titleA: "Das Open-Source",
      titleB: "Investment-Terminal.",
      body: "Kurse, Meldungen und Nachrichten in einem schnellen, tastaturgesteuerten Terminal. Local-first — deine Daten bleiben in einer SQLite-Datei auf deinem Rechner.",
      install: "ApeTerm installieren",
      repo: "Repository ansehen",
      tags: ["local-first", "open-source"],
    },
    ticker: { label: "live krypto" },
    features: {
      eyebrow: "02 · Was es macht",
      headingA: "Marktkontext,",
      headingB: "ohne Dashboard.",
      body: "ApeTerm hält die wichtigen Investment-Signale nah an deiner Shell: Kurse, Filings, News und einen Agenten, der deinen Workspace ändern kann.",
      command: "apeterm watch NVDA BTC",
      items: [
        ["Märkte", "Tape im Blick.", "Aktien-, ETF- und Krypto-Watchlists in einer schnellen lokalen Oberfläche."],
        ["Filings", "Sieh, wer bewegt.", "13F-Änderungen, Form-4-Trades und Kongressmeldungen aus SEC EDGAR."],
        ["News", "Weniger Rauschen.", "Tickerbezogene RSS-Feeds werden gruppiert und dedupliziert, bevor sie auf deinem Bildschirm landen."],
        ["Agent", "Fragen, dann handeln.", "Ticker öffnen, Listen bauen und Ansichten ändern, ohne die Tastatur zu verlassen."],
      ],
      metrics: [
        ["0 Accounts", "Lokaler SQLite-Speicher"],
        ["4 Datenwege", "Kurse, Filings, News, Agent"],
        ["1 Befehl", "Installieren und aus der Shell starten"],
      ],
    },
    workflow: {
      eyebrow: "03 · Workflow",
      title: "Von Installation zu Insight in vier Schritten.",
      body: "ApeTerm ist für deine vorhandene Arbeitsweise gebaut — Shell, Tastatur, keine neuen Dashboards.",
      steps: [
        ["In einer Zeile installieren.", "Legt apeterm auf deinen PATH und richtet die lokale SQLite-Datenbank sowie die Python-Laufzeit ein. Keine Accounts, keine Registrierung."],
        ["Dashboard öffnen.", "Drücke w in der Watchlist, um einen Ticker hinzuzufügen, h/v zum Teilen, j/k zum Bewegen — keine Maus nötig."],
        ["a drücken und fragen.", "Der Agent liest deine Watchlists und den Bildschirmzustand und ruft echte Tools auf, um die Änderung umzusetzen."],
        ["Eigene Keys nutzen.", "Trage Finnhub, FMP oder ein OpenRouter-Modell ein — oder nutze komplett den freien SEC-EDGAR-Fallback."],
      ],
    },
    openSource: {
      eyebrow: "04 · Open Source",
      title: "Gebaut, um dich nicht zu stoeren.",
      body: "ApeTerm ist fuer Leute, die einen ernsthaften Markt-Workspace wollen, ohne dass noch eine SaaS-Schicht zwischen ihnen und den Daten sitzt.",
      button: "Code lesen",
      stats: ["Stars", "Forks", "offene Issues"],
      principles: [
        ["Lokal als Standard", "SQLite auf deinem Rechner. Keine Account-Pflicht, kein Sync-Setup, kein gehosteter Workspace."],
        ["Schnell genug fuer taegliche Nutzung", "Tastaturzentrierte Workflows, leichte Ansichten und ein Layout fuer wiederholtes Scannen."],
        ["Erweiterbar, wenn du mehr brauchst", "Eigene Daten-Keys eintragen, den Stack erweitern oder das Repo forken, wenn dein Workflow mehr verlangt."],
      ],
      stackTitle: "Woraus es besteht",
      stack: [
        ["Sprache", "Rust, ratatui + crossterm für das TUI"],
        ["Speicher", "Lokales SQLite — nichts verlässt deinen Rechner"],
        ["Marktdaten", "yfinance stream · Binance websocket"],
        ["Meldungen", "SEC EDGAR — 13F, Form 4, Kongress"],
        ["Agent", "Eigener Key via OpenRouter"],
        ["Telemetrie", "Standardmäßig keine"],
      ],
    },
    compare: {
      eyebrow: "05 · Die Alternative",
      title: "Weniger Tab-Chaos. Mehr Terminal.",
      body: "ApeTerm holt das Zeug, das du sowieso dauernd checkst, an einen tastaturgesteuerten Ort: Kurse, Filings, News und Notizen. Kein Abo-Zirkus, kein riesiges Web-Dashboard.",
      headers: ["ApeTerm", "Pro-Terminal", "Web-Dashboards"],
      sub: ["kostenlos", "~30k $/Jahr", "Freemium"],
      rows: [
        "Live-Kurse für Aktien & Krypto",
        "13F / Form 4 / Kongressmeldungen",
        "AI-Agent, der in deinem Workspace handelt",
        "Tastaturgesteuert, läuft in deiner Shell",
        "Deine Daten bleiben auf deinem Rechner",
        "Quellcode, den du lesen und forken kannst",
      ],
    },
    faq: {
      eyebrow: "06 · Fragen",
      title: "Weniger Fragen, als du erwartest.",
      items: [
        ["Ist ApeTerm wirklich kostenlos?", "Ja — kostenlos und mit Quellcode auf GitHub, ohne Paid Tier und ohne gesperrte Features. Optionale Datenanbieter (Finnhub, Financial Modeling Prep) und der AI-Agent haben eigene kostenlose oder bezahlte Tarife, wenn du einen Key einträgst."],
        ["Woher kommen die Marktdaten?", "Aktienkurse streamen von yfinance, Krypto von Binances öffentlichem Websocket. Filing- und Holdings-Daten kommen standardmäßig aus SEC EDGAR. Für reichere Fundamentaldaten kannst du Finnhub oder FMP in den Einstellungen eintragen."],
        ["Trackt es mich?", "Keine Telemetrie und keine Analytics standardmäßig. Alles liegt in einer lokalen SQLite-Datenbank und Konfigurationsdatei. Netzwerkaufrufe gehen nur an Datenanbieter und, wenn aktiviert, an deinen LLM-Anbieter."],
        ["Ist das Anlageberatung?", "Nein. ApeTerm zeigt öffentliche Filings, Kurse und News. Was du damit machst, liegt bei dir."],
        ["Welche Plattformen werden unterstützt?", "Vorgebaute Binaries für macOS (Apple Silicon) und Linux (x86_64). Andere Plattformen müssen mit Cargo aus dem Quellcode gebaut werden."],
      ],
    },
    cta: {
      title: "Der Markt öffnet um 9:30. Dein Terminal auch.",
      body: "Installiere ApeTerm und verbringe den Morgen mit Lesen statt Klicken.",
      copy: "Kopieren",
      copied: "Kopiert",
      copyLabel: "Installationsbefehl kopieren",
      detected: "erkannt:",
      supported: "unterstützt",
      source: "Quellcode",
    },
    footer: {
      body: "Ein Open-Source-Investment-Terminal, gebaut in Rust für Menschen, die gern Dinge bauen.",
      cols: [
        ["Produkt", "Funktionen", "Workflow", "Installieren"],
        ["Quelle", "GitHub", "Issues", "Releases"],
        ["Ressourcen", "Doku", "FAQ"],
      ],
      legal: "keine Anlageberatung · keine Bank",
    },
    terminal: {
      panels: "Panels",
      labels: ["Watchlist", "News", "SEC", "Agent"],
      searchPlaceholder: "Symbole, Filings, News suchen...",
      keys: "Tasten",
      keyRows: ["a — Agent fragen", "/ — Suche", "h/v — teilen", "j/k — bewegen"],
      hint: "Diese Demo ist live — Panel anklicken oder hovern und 1 / 2 / 3 / a drücken",
      prompt: ["apeterm · drücke", "für den Agenten,", "für Suche"],
      columns: ["Sym", "Name", "Letzter", "Änd."],
      stream: "streaming · yfinance + binance ws",
      newsTitle: "News — alle Ticker",
      extraNews: [
        "Apple-Zuliefererchecks deuten auf starken Zyklus",
        "US-Futures bewegen sich vor der Eröffnung kaum",
        "Kongress-Tracker: neue NVDA-Meldungen",
        "Öl fällt, während OPEC+ höhere Förderung prüft",
      ],
      ago: "",
      dedupe: "über RSS-Quellen dedupliziert",
      secTitle: "SEC EDGAR — aktuelle Meldungen",
      secColumns: ["Form", "Aktion", "Sym", "Größe"],
      secNote: "13F · Form 4 · Kongressmeldungen — kostenlos, kein Key nötig",
      agentTitle: "Agent — im Bildschirmzustand verankert",
      afterHours: "nachbörslich",
      agentPrompt: "Frag etwas. Ich prüfe den Workspace.",
      agentHints: [
        "Zur Watchlist hinzufügen oder entfernen",
        "Eine neue Watchlist erstellen",
        "Ticker-Details öffnen",
        "Aktuelle Holdings zusammenfassen",
      ],
      askPlaceholder: "frag einfach...",
      actions: ["Kauf", "Verkauf", "Reduziert", "Kauf", "Neu"],
      news: [
        "Fed hält Zinsen stabil und signalisiert zwei Senkungen 2026",
        "NVIDIA meldet Rekordumsatz im Datencenter-Geschäft",
        "Apple-Zuliefererchecks deuten auf starken iPhone-Zyklus",
        "Öl fällt, während OPEC+ höhere Förderung prüft",
        "Kongress-Trading-Tracker: 3 neue NVDA-Meldungen",
      ],
      agentScript: [
        'UBER und DASH zu neuer Liste "delivery" hinzufügen',
        'create_watchlist(name="delivery")',
        "add_symbols([UBER, DASH] → delivery)",
        'Fertig — "delivery" mit 2 Symbolen erstellt. UBER liegt heute 1,8% im Plus; DASH meldet Donnerstag Zahlen.',
      ],
    },
  },
} as const;

type Copy = typeof copy.en;

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Copy;
} | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "de" || stored === "en") setLocaleState(stored);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t: copy[locale] }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
