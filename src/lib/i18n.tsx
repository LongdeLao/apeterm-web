import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "de";

const STORAGE_KEY = "apeterm-locale";

export const copy = {
  en: {
    nav: {
      docs: "Docs",
      links: [
        ["#features", "Features"],
        ["#terminal", "Terminal"],
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
    ticker: { label: "sample" },
    features: {
      eyebrow: "02 · Capabilities",
      headingA: "Stocks, crypto, filings, news:",
      headingB: "One calm window.",
      words: ["prices", "filings", "news", "agents"],
      cells: [
        [
          "Market data",
          "Prices that keep up.",
          "Streaming stock quotes and a live Binance feed for crypto, right in the terminal. Bring your own Finnhub or FMP key for deeper fundamentals.",
        ],
        [
          "Institutional & insider",
          "See who's actually buying.",
          "13F holding changes, Form 4 insider trades and congressional disclosures, pulled straight from SEC EDGAR.",
        ],
        ["News", "Signal, not noise.", "Per-ticker feeds pulled from RSS wires and deduplicated across sources."],
        [
          "Agent",
          "An assistant that can act.",
          "Ask it to build a watchlist or open a ticker and it calls real tools against your app state — grounded in what's on screen, not guessing. Bring your own OpenRouter-compatible key.",
        ],
        [
          "Watchlists",
          "Named lists, stocks and crypto.",
          "As many watchlists as you want, stored locally in a single config file — no account, nothing synced anywhere.",
        ],
        [
          "Keyboard first",
          "Vim motions, no mouse required.",
          "j/k to move, h/v to split views, / to search, a to ask the agent, g to switch language.",
        ],
      ],
      news: [
        ["Fed holds rates steady, signals two cuts in 2026", "wire · 4m ago"],
        ["NVIDIA reports record data-center revenue", "wire · 22m ago"],
      ],
      agent: [
        '› add UBER, DASH to a new "delivery" list',
        "adding UBER, DASH · tool_call",
        'Done — created "delivery" with 2 symbols.',
      ],
      keys: ["j/k move", "h/v split", "a agent", "/ search", ", settings", "g locale"],
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
      title: "The source is the whole pitch.",
      body: "No paywalls, no upgrade funnel, no telemetry phoning home unless you turn it on. Read the code, file an issue, or fork it and make it yours — it's a young project, so PRs matter more than praise.",
      button: "Browse the repo",
      stats: ["stars", "forks", "open issues"],
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
        ["Product", "Features", "Terminal", "Install"],
        ["Source", "GitHub", "Issues", "Releases"],
        ["Resources", "Docs", "FAQ"],
      ],
      legal: "not investment advice · not a bank",
    },
    terminal: {
      panels: "Panels",
      labels: ["watchlist", "news", "sec", "agent"],
      keys: "Keys",
      keyRows: ["a — ask agent", "/ — search", "h/v — split", "j/k — move"],
      hint: "this demo is live — click a panel, or hover and press 1 / 2 / 3 / a",
      prompt: ["apeterm · press", "to ask the agent,", "to search"],
      columns: ["Sym", "Name", "Last", "Chg"],
      stream: "streaming · yfinance + binance ws",
      newsTitle: "News — all tickers",
      ago: "ago",
      dedupe: "deduplicated across RSS wires",
      secTitle: "SEC EDGAR — recent filings",
      secColumns: ["Form", "Action", "Sym", "Size"],
      secNote: "13F · Form 4 · congressional disclosures — free, no key needed",
      agentTitle: "Agent — grounded in screen state",
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
        ["#terminal", "Terminal"],
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
    ticker: { label: "beispiel" },
    features: {
      eyebrow: "02 · Funktionen",
      headingA: "Aktien, Krypto, Filings, News:",
      headingB: "Alles in einem ruhigen Fenster.",
      words: ["Kurse", "Meldungen", "News", "Agenten"],
      cells: [
        ["Marktdaten", "Kurse, die Schritt halten.", "Streaming-Aktienkurse und ein Live-Binance-Feed für Krypto direkt im Terminal. Für tiefere Fundamentaldaten kannst du eigene Finnhub- oder FMP-Keys eintragen."],
        ["Institutionelle & Insider", "Sieh, wer wirklich kauft.", "13F-Positionsveränderungen, Form-4-Insidertrades und Kongressmeldungen direkt aus SEC EDGAR."],
        ["News", "Signal statt Rauschen.", "Tickerbezogene Feeds aus RSS-Quellen, quellenübergreifend dedupliziert."],
        ["Agent", "Ein Assistent, der handeln kann.", "Bitte ihn, eine Watchlist zu bauen oder einen Ticker zu öffnen. Er nutzt echte Tools gegen deinen App-Zustand — mit Kontext vom Bildschirm, nicht geraten. Bring deinen eigenen OpenRouter-kompatiblen Key mit."],
        ["Watchlists", "Benannte Listen, Aktien und Krypto.", "Beliebig viele Watchlists, lokal in einer einzelnen Konfigurationsdatei gespeichert — kein Account, keine Synchronisierung."],
        ["Tastatur zuerst", "Vim-Bewegungen, keine Maus nötig.", "j/k zum Bewegen, h/v zum Teilen von Ansichten, / für Suche, a für den Agenten, g zum Sprachwechsel."],
      ],
      news: [
        ["Fed hält Zinsen stabil und signalisiert zwei Senkungen 2026", "wire · vor 4 min"],
        ["NVIDIA meldet Rekordumsatz im Datencenter-Geschäft", "wire · vor 22 min"],
      ],
      agent: [
        '› UBER, DASH zu neuer Liste "delivery" hinzufügen',
        "füge UBER, DASH hinzu · tool_call",
        'Fertig — "delivery" mit 2 Symbolen erstellt.',
      ],
      keys: ["j/k bewegen", "h/v teilen", "a Agent", "/ Suche", ", Einstellungen", "g Sprache"],
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
      title: "Der Quellcode ist das ganze Argument.",
      body: "Keine Paywalls, kein Upgrade-Funnel, keine Telemetrie nach Hause, solange du sie nicht aktivierst. Lies den Code, melde Issues oder forke das Projekt — es ist jung, also zaehlen PRs mehr als Lob.",
      button: "Repository durchsuchen",
      stats: ["Stars", "Forks", "offene Issues"],
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
        ["Produkt", "Funktionen", "Terminal", "Installieren"],
        ["Quelle", "GitHub", "Issues", "Releases"],
        ["Ressourcen", "Doku", "FAQ"],
      ],
      legal: "keine Anlageberatung · keine Bank",
    },
    terminal: {
      panels: "Panels",
      labels: ["Watchlist", "News", "SEC", "Agent"],
      keys: "Tasten",
      keyRows: ["a — Agent fragen", "/ — Suche", "h/v — teilen", "j/k — bewegen"],
      hint: "Diese Demo ist live — Panel anklicken oder hovern und 1 / 2 / 3 / a drücken",
      prompt: ["apeterm · drücke", "für den Agenten,", "für Suche"],
      columns: ["Sym", "Name", "Letzter", "Änd."],
      stream: "streaming · yfinance + binance ws",
      newsTitle: "News — alle Ticker",
      ago: "",
      dedupe: "über RSS-Quellen dedupliziert",
      secTitle: "SEC EDGAR — aktuelle Meldungen",
      secColumns: ["Form", "Aktion", "Sym", "Größe"],
      secNote: "13F · Form 4 · Kongressmeldungen — kostenlos, kein Key nötig",
      agentTitle: "Agent — im Bildschirmzustand verankert",
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
