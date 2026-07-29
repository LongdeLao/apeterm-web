import type { DriveStep } from "driver.js";

export type TourAction = "close-overlays" | "open-search" | "open-agent";

export type OnboardingStep = DriveStep & {
  action?: TourAction;
};

export const onboardingSteps = [
  {
    element: '[data-tour="new-project"]',
    action: "close-overlays",
    popover: {
      title: "Start here",
      description:
        "Create a project when you want a clean workspace for one thesis, client, or research thread.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="search"]',
    action: "close-overlays",
    popover: {
      title: "Find anything by ticker",
      description:
        "Use search to open stocks and ETFs by symbol or company name, then inspect charts, news, filings, and fundamentals.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="search-panel"]',
    action: "open-search",
    popover: {
      title: "Search results stay focused",
      description:
        "Search by ticker or company name, use the arrow keys to choose a row, and press Enter to open the detail view.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="editor-canvas"]',
    action: "close-overlays",
    popover: {
      title: "This is your research desk",
      description:
        "The canvas keeps market panels, selected instruments, and notes together; workspace changes are saved as you work.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: '[data-tour="watchlist"]',
    popover: {
      title: "Live watchlist",
      description:
        "Stocks stream from Yahoo and crypto streams from Binance; switch tabs to track the symbols you care about.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="news"]',
    popover: {
      title: "Market news",
      description:
        "Filter all headlines, watchlist stories, macro news, Reddit, or crypto so context stays next to prices.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="sec"]',
    popover: {
      title: "SEC filings",
      description:
        "Inspect institutional 13F holdings, executive Form 4 activity, and congressional disclosures without leaving the workspace.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="notes"]',
    popover: {
      title: "Notes and thesis history",
      description:
        "Write ticker notes, journal entries, and pinned reminders so the reason for each move is visible later.",
      side: "top",
      align: "start",
    },
  },
  {
    element: '[data-tour="agent-toggle"]',
    popover: {
      title: "Open the AI agent",
      description:
        "The agent can read the current workspace and call tools to add tickers, open charts, compare symbols, and write notes.",
      side: "top",
      align: "center",
    },
  },
  {
    element: '[data-tour="agent-panel"]',
    action: "open-agent",
    popover: {
      title: "Ask for research help",
      description:
        "Ask questions in plain language; the agent uses your watchlist, news, SEC data, notes, and open instrument as context.",
      side: "left",
      align: "start",
    },
  },
  {
    element: '[data-tour="share"]',
    action: "close-overlays",
    popover: {
      title: "Invite your team",
      description: "Share a workspace when others need access; permissions default to view-only.",
      side: "top",
      align: "end",
    },
  },
  {
    element: '[data-tour="settings"]',
    popover: {
      title: "Everything else lives here",
      description:
        "Open settings for density, contrast, agent response style, account controls, and other browser preferences.",
      side: "top",
      align: "end",
    },
  },
] satisfies OnboardingStep[];
