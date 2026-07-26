/**
 * Shared contract between the agent route and the workspace.
 *
 * Client tools are applied in the browser against React state and Supabase, then
 * echoed back to the model so it can confirm what happened. Read tools run on the
 * server against the existing API routes and their results feed back into the loop.
 */

export const panels = ["news", "watchlist", "sec", "notes"] as const;
export const overlays = ["search", "spotlight", "settings", "help"] as const;
export const newsCategoryNames = ["all", "watchlist", "macro", "reddit", "crypto"] as const;
export const secFeedNames = ["institutions", "executives", "congress"] as const;
export const timeframeNames = ["1d", "1w", "1m", "3m", "6m", "1y", "5y", "max"] as const;
export const sortKeys = ["change", "symbol", "price", "volume"] as const;
export const preferenceKeys = [
  "experience",
  "density",
  "agentTone",
  "explanations",
  "highContrast",
] as const;

export type ClientAction =
  // ── watchlists ────────────────────────────────────────────────
  | { type: "add_to_watchlist"; symbol: string }
  | { type: "remove_from_watchlist"; symbol: string }
  | { type: "add_symbols"; symbols: string[] }
  | { type: "sort_watchlist"; by: (typeof sortKeys)[number]; descending?: boolean }
  | { type: "pin_symbol"; symbol: string }
  | { type: "create_watchlist"; name: string; symbols?: string[] }
  | { type: "switch_watchlist"; name: string }
  | { type: "rename_watchlist"; name: string; to: string }
  | { type: "delete_watchlist"; name: string }
  // ── navigation ────────────────────────────────────────────────
  | { type: "open_instrument"; symbol: string }
  | { type: "set_timeframe"; timeframe: (typeof timeframeNames)[number] }
  | { type: "focus_panel"; panel: (typeof panels)[number] }
  | { type: "set_news_category"; category: (typeof newsCategoryNames)[number] }
  | { type: "set_sec_feed"; feed: (typeof secFeedNames)[number] }
  | { type: "open_overlay"; overlay: (typeof overlays)[number] | "none" }
  // ── notes ─────────────────────────────────────────────────────
  | { type: "create_note"; body: string; symbol?: string; starred?: boolean }
  | { type: "star_note"; id: string; starred?: boolean }
  | { type: "edit_note"; id: string; body: string }
  | { type: "delete_note"; id: string }
  // ── session ───────────────────────────────────────────────────
  | { type: "set_preference"; key: (typeof preferenceKeys)[number]; value: string | boolean }
  | { type: "save_layout"; name: string }
  | { type: "load_layout"; name: string }
  | { type: "undo_last_action" }
  // ── alerts ────────────────────────────────────────────────────
  | {
      type: "create_alert";
      kind: "price_above" | "price_below" | "percent_move" | "filing" | "digest";
      symbol?: string;
      filer?: string;
      threshold?: number;
      schedule?: string;
      note?: string;
    }
  | { type: "cancel_alert"; id: string };

export type ClientActionType = ClientAction["type"];

const clientToolNames = new Set<string>([
  "add_to_watchlist",
  "remove_from_watchlist",
  "add_symbols",
  "sort_watchlist",
  "pin_symbol",
  "create_watchlist",
  "switch_watchlist",
  "rename_watchlist",
  "delete_watchlist",
  "open_instrument",
  "set_timeframe",
  "focus_panel",
  "set_news_category",
  "set_sec_feed",
  "open_overlay",
  "create_note",
  "star_note",
  "edit_note",
  "delete_note",
  "set_preference",
  "save_layout",
  "load_layout",
  "undo_last_action",
  "create_alert",
  "cancel_alert",
]);

export function isClientTool(name: string): name is ClientActionType {
  return clientToolNames.has(name);
}

type Property = Record<string, unknown>;
const tool = (
  name: string,
  description: string,
  properties: Property,
  required: string[] = [],
) => ({
  type: "function" as const,
  function: {
    name,
    description,
    parameters: { type: "object", properties, required, additionalProperties: false },
  },
});

const symbolProp = { type: "string", description: "Canonical US ticker, for example NVDA" };
const enumProp = (values: readonly string[], description: string) => ({
  type: "string",
  enum: [...values],
  description,
});

export const agentTools = [
  // ── watchlists ──────────────────────────────────────────────────────────────
  tool("add_to_watchlist", "Add one ticker to the active watchlist.", { symbol: symbolProp }, [
    "symbol",
  ]),
  tool(
    "remove_from_watchlist",
    "Remove one ticker from the active watchlist.",
    { symbol: symbolProp },
    ["symbol"],
  ),
  tool(
    "add_symbols",
    "Add several tickers to the active watchlist at once. Use after looking up holdings or search results.",
    { symbols: { type: "array", items: symbolProp, description: "Up to 20 tickers" } },
    ["symbols"],
  ),
  tool("sort_watchlist", "Reorder the active watchlist.", {
    by: enumProp(sortKeys, "Field to sort by"),
    descending: { type: "boolean", description: "Largest first. Defaults to true." },
  }),
  tool(
    "pin_symbol",
    "Move one ticker to the top of the active watchlist.",
    { symbol: symbolProp },
    ["symbol"],
  ),
  tool(
    "create_watchlist",
    "Create a new named watchlist, optionally seeded with tickers.",
    {
      name: { type: "string", description: "Short list name, for example Semis" },
      symbols: { type: "array", items: symbolProp },
    },
    ["name"],
  ),
  tool(
    "switch_watchlist",
    "Make a named watchlist the active one.",
    {
      name: { type: "string" },
    },
    ["name"],
  ),
  tool(
    "rename_watchlist",
    "Rename an existing watchlist.",
    { name: { type: "string" }, to: { type: "string" } },
    ["name", "to"],
  ),
  tool("delete_watchlist", "Delete a named watchlist.", { name: { type: "string" } }, ["name"]),

  // ── navigation ──────────────────────────────────────────────────────────────
  tool(
    "open_instrument",
    "Open the full-screen price chart and detail page for a ticker.",
    { symbol: symbolProp },
    ["symbol"],
  ),
  tool(
    "set_timeframe",
    "Change the chart timeframe on the open instrument page.",
    { timeframe: enumProp(timeframeNames, "Chart range") },
    ["timeframe"],
  ),
  tool(
    "focus_panel",
    "Move keyboard focus to a workspace panel.",
    {
      panel: enumProp(panels, "Panel to focus"),
    },
    ["panel"],
  ),
  tool(
    "set_news_category",
    "Filter the news panel.",
    {
      category: enumProp(newsCategoryNames, "News category"),
    },
    ["category"],
  ),
  tool(
    "set_sec_feed",
    "Switch the SEC panel between filing feeds.",
    {
      feed: enumProp(secFeedNames, "SEC feed"),
    },
    ["feed"],
  ),
  tool(
    "open_overlay",
    "Open or close a workspace overlay. Use 'none' to close.",
    {
      overlay: enumProp([...overlays, "none"], "Overlay to show"),
    },
    ["overlay"],
  ),

  // ── notes ───────────────────────────────────────────────────────────────────
  tool(
    "create_note",
    "Save a research note. Attach it to a ticker when the user is talking about one.",
    {
      body: { type: "string", description: "The note text, in the user's own words" },
      symbol: symbolProp,
      starred: { type: "boolean" },
    },
    ["body"],
  ),
  tool(
    "star_note",
    "Star or unstar an existing note by id.",
    { id: { type: "string" }, starred: { type: "boolean" } },
    ["id"],
  ),
  tool(
    "edit_note",
    "Replace the body of an existing note.",
    {
      id: { type: "string" },
      body: { type: "string" },
    },
    ["id", "body"],
  ),
  tool("delete_note", "Delete a note by id.", { id: { type: "string" } }, ["id"]),

  // ── session ─────────────────────────────────────────────────────────────────
  tool(
    "set_preference",
    "Change a workspace preference.",
    {
      key: enumProp(preferenceKeys, "Preference to change"),
      value: {
        description:
          "experience: simple|pro. density: compact|comfortable. agentTone: normal|terse|verbose. explanations: beginner|experienced. highContrast: boolean.",
      },
    },
    ["key", "value"],
  ),
  tool(
    "save_layout",
    "Save the current workspace arrangement under a name.",
    {
      name: { type: "string" },
    },
    ["name"],
  ),
  tool(
    "load_layout",
    "Restore a previously saved workspace arrangement.",
    {
      name: { type: "string" },
    },
    ["name"],
  ),
  tool("undo_last_action", "Undo the last change you made to the workspace.", {}),

  // ── alerts ──────────────────────────────────────────────────────────────────
  tool(
    "create_alert",
    "Watch for something and notify the user in the workspace when it happens.",
    {
      kind: enumProp(
        ["price_above", "price_below", "percent_move", "filing", "digest"],
        "What to watch for",
      ),
      symbol: symbolProp,
      filer: { type: "string", description: "Institution name, for filing alerts" },
      threshold: { type: "number", description: "Price level, or percent for percent_move" },
      schedule: { type: "string", description: "For digests, e.g. 'weekdays 08:00'" },
      note: { type: "string" },
    },
    ["kind"],
  ),
  tool("cancel_alert", "Cancel an alert by id.", { id: { type: "string" } }, ["id"]),

  // ── read tools (executed server side) ───────────────────────────────────────
  tool(
    "get_quote",
    "Look up live quotes for tickers, including ones not on the watchlist.",
    { symbols: { type: "array", items: symbolProp, description: "Up to 8 tickers" } },
    ["symbols"],
  ),
  tool(
    "search_symbol",
    "Resolve a company name or description to candidate tickers.",
    { query: { type: "string", description: "Company name or plain-language description" } },
    ["query"],
  ),
  tool(
    "get_chart_stats",
    "Price history statistics: period return, 52-week range, distance from highs and lows, volume.",
    { symbol: symbolProp, timeframe: enumProp(timeframeNames, "Range to summarise") },
    ["symbol"],
  ),
  tool("get_news", "Recent headlines, for one ticker or a whole category.", {
    symbol: symbolProp,
    category: enumProp(newsCategoryNames, "Used when no symbol is given"),
  }),
  tool(
    "get_filings",
    "Recent SEC filings for a company, from EDGAR.",
    {
      symbol: symbolProp,
      form: { type: "string", description: "Optional form prefix, e.g. 4, 8-K, 10-Q, 13F" },
    },
    ["symbol"],
  ),
  tool(
    "compare_symbols",
    "Compare several tickers side by side on price, change, volume and relative volume.",
    { symbols: { type: "array", items: symbolProp, description: "Two to five tickers" } },
    ["symbols"],
  ),
  tool("get_notes", "Read the user's own saved research notes.", {
    symbol: { ...symbolProp, description: "Optional — restrict to one ticker" },
  }),
  tool("list_alerts", "List the user's active alerts.", {}),
];
