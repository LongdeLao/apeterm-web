import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { agentTools, isClientTool, type ClientAction } from "@/lib/agent-tools";

type AgentMessage = { role: "user" | "assistant"; content: string };
type ToolCall = { id?: string; function?: { name?: string; arguments?: string } };
type RateEntry = { count: number; resetAt: number };

const rateGlobal = globalThis as typeof globalThis & { __apeAgentRate?: Map<string, RateEntry> };
const rateLimit = (rateGlobal.__apeAgentRate ??= new Map());

const MAX_ROUNDS = 4;
const SYMBOL_PATTERN = /^[A-Z]{1,6}(?:-[A-Z]{1,4})?$/;

function clientAddress(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

function allowed(request: Request) {
  const address = clientAddress(request);
  const now = Date.now();
  const current = rateLimit.get(address);
  if (!current || current.resetAt <= now) {
    rateLimit.set(address, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  current.count += 1;
  return current.count <= 10;
}

function supabaseEnv() {
  return {
    url: process.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

async function authenticate(request: Request) {
  const authorization = request.headers.get("authorization");
  const { url, key } = supabaseEnv();
  if (!authorization?.startsWith("Bearer ") || !url || !key) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: key },
    signal: AbortSignal.timeout(8_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  const user = (await response.json().catch(() => null)) as { id?: string } | null;
  return typeof user?.id === "string" ? user.id : null;
}

/** Reads a user-owned table through PostgREST, so row level security still applies. */
async function supabaseSelect(request: Request, path: string) {
  const { url, key } = supabaseEnv();
  const authorization = request.headers.get("authorization");
  if (!url || !key || !authorization) return null;
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: { Authorization: authorization, apikey: key },
    signal: AbortSignal.timeout(8_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  return (await response.json().catch(() => null)) as unknown;
}

async function internalJson(origin: string, path: string) {
  const response = await fetch(`${origin}${path}`, {
    signal: AbortSignal.timeout(12_000),
    headers: { "User-Agent": "ApeTerm-Agent/1.0" },
  }).catch(() => null);
  if (!response?.ok) return null;
  return (await response.json().catch(() => null)) as Record<string, unknown> | null;
}

const secHeaders = () => ({
  "User-Agent": "ApeTerm/0.1 (research@apeterm.com)",
  Accept: "application/json",
});

/** ticker → CIK, cached for the life of the serverless instance. */
const tickerGlobal = globalThis as typeof globalThis & {
  __apeTickerMap?: Promise<Map<string, { cik: string; title: string }>>;
};
function tickerMap() {
  return (tickerGlobal.__apeTickerMap ??= (async () => {
    const map = new Map<string, { cik: string; title: string }>();
    const response = await fetch("https://www.sec.gov/files/company_tickers.json", {
      headers: secHeaders(),
      signal: AbortSignal.timeout(12_000),
    }).catch(() => null);
    if (!response?.ok) return map;
    const payload = (await response.json().catch(() => ({}))) as Record<
      string,
      { cik_str?: number; ticker?: string; title?: string }
    >;
    for (const row of Object.values(payload)) {
      if (!row?.ticker || typeof row.cik_str !== "number") continue;
      map.set(row.ticker.toUpperCase(), {
        cik: String(row.cik_str).padStart(10, "0"),
        title: row.title ?? row.ticker,
      });
    }
    return map;
  })());
}

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function symbolArg(value: unknown) {
  const symbol = typeof value === "string" ? value.trim().toUpperCase() : "";
  return SYMBOL_PATTERN.test(symbol) ? symbol : "";
}

/** Executes a read-only tool server side and returns a compact JSON result string. */
async function runReadTool(
  name: string,
  args: Record<string, unknown>,
  origin: string,
  request: Request,
): Promise<string> {
  try {
    switch (name) {
      case "get_quote": {
        const symbols = (Array.isArray(args.symbols) ? args.symbols : [args.symbol])
          .map(symbolArg)
          .filter(Boolean)
          .slice(0, 8);
        if (!symbols.length) return JSON.stringify({ error: "No valid symbol given." });
        const data = await internalJson(origin, `/api/market?symbols=${symbols.join(",")}`);
        const rows = [
          ...((data?.stocks as unknown[]) ?? []),
          ...((data?.crypto as unknown[]) ?? []),
        ];
        return JSON.stringify({ quotes: rows.slice(0, 8) });
      }
      case "search_symbol": {
        const query = String(args.query ?? "")
          .trim()
          .slice(0, 60);
        if (!query) return JSON.stringify({ error: "No query given." });
        const data = await internalJson(origin, `/api/search?q=${encodeURIComponent(query)}`);
        return JSON.stringify({ results: ((data?.results as unknown[]) ?? []).slice(0, 6) });
      }
      case "get_chart_stats": {
        const symbol = symbolArg(args.symbol);
        if (!symbol) return JSON.stringify({ error: "No valid symbol given." });
        const timeframe = String(args.timeframe ?? "1y");
        const data = await internalJson(
          origin,
          `/api/instrument?symbol=${symbol}&timeframe=${encodeURIComponent(timeframe)}`,
        );
        if (!data) return JSON.stringify({ error: `No data for ${symbol}.` });
        const history = (data.history as { close: number }[] | undefined) ?? [];
        const closes = history.map((point) => point.close).filter(Number.isFinite);
        const first = closes[0] ?? 0;
        const last = closes.at(-1) ?? 0;
        const high52 = num(data.week52High);
        const low52 = num(data.week52Low);
        const price = num(data.price);
        return JSON.stringify({
          symbol,
          timeframe,
          price,
          changePercent: num(data.changePercent),
          periodReturnPercent: first ? ((last - first) / first) * 100 : 0,
          periodHigh: closes.length ? Math.max(...closes) : 0,
          periodLow: closes.length ? Math.min(...closes) : 0,
          week52High: high52,
          week52Low: low52,
          percentBelow52WeekHigh: high52 ? ((high52 - price) / high52) * 100 : 0,
          percentAbove52WeekLow: low52 ? ((price - low52) / low52) * 100 : 0,
          volume: num(data.volume),
          averageVolume: num(data.averageVolume),
          marketCap: num(data.marketCap),
        });
      }
      case "get_news": {
        const symbol = symbolArg(args.symbol);
        const category = String(args.category ?? "all");
        const query = symbol ? `?symbol=${symbol}` : `?category=${encodeURIComponent(category)}`;
        const data = await internalJson(origin, `/api/news${query}`);
        const items = ((data?.items as Record<string, unknown>[]) ?? [])
          .slice(0, 8)
          .map((item) => ({ age: item.age, source: item.source, title: item.title }));
        return JSON.stringify({ headlines: items });
      }
      case "get_filings": {
        const symbol = symbolArg(args.symbol);
        const map = await tickerMap();
        const entry = symbol ? map.get(symbol) : undefined;
        if (!entry) return JSON.stringify({ error: `No SEC filer found for ${symbol || "that"}.` });
        const response = await fetch(`https://data.sec.gov/submissions/CIK${entry.cik}.json`, {
          headers: secHeaders(),
          signal: AbortSignal.timeout(12_000),
        }).catch(() => null);
        if (!response?.ok) return JSON.stringify({ error: "SEC submissions unavailable." });
        const payload = (await response.json()) as {
          name?: string;
          sicDescription?: string;
          filings?: { recent?: Record<string, unknown[]> };
        };
        const recent = payload.filings?.recent ?? {};
        const forms = (recent.form as string[] | undefined) ?? [];
        const wanted = typeof args.form === "string" ? args.form.toUpperCase() : "";
        const filings = forms
          .map((form, index) => ({
            form,
            filedAt: (recent.filingDate as string[] | undefined)?.[index] ?? "",
            description: (recent.primaryDocDescription as string[] | undefined)?.[index] ?? "",
          }))
          .filter((row) => (wanted ? row.form.toUpperCase().startsWith(wanted) : true))
          .slice(0, 10);
        return JSON.stringify({
          filer: payload.name ?? entry.title,
          industry: payload.sicDescription ?? "",
          filings,
        });
      }
      case "compare_symbols": {
        const symbols = (Array.isArray(args.symbols) ? args.symbols : [])
          .map(symbolArg)
          .filter(Boolean)
          .slice(0, 5);
        if (symbols.length < 2)
          return JSON.stringify({ error: "Give at least two symbols to compare." });
        const data = await internalJson(origin, `/api/market?symbols=${symbols.join(",")}`);
        const rows = [
          ...((data?.stocks as Record<string, unknown>[]) ?? []),
          ...((data?.crypto as Record<string, unknown>[]) ?? []),
        ];
        return JSON.stringify({
          comparison: rows.map((row) => ({
            symbol: row.symbol,
            price: row.price,
            changePercent: row.changePercent,
            volume: row.volume,
            relativeVolume: row.relativeVolume,
          })),
        });
      }
      case "get_notes": {
        const symbol = symbolArg(args.symbol);
        const filter = symbol ? `&symbol=eq.${symbol}` : "";
        const rows = await supabaseSelect(
          request,
          `notes?select=id,symbol,body,starred,created_at${filter}&order=created_at.desc&limit=20`,
        );
        if (!Array.isArray(rows))
          return JSON.stringify({ error: "Notes storage is not available yet.", notes: [] });
        return JSON.stringify({ notes: rows });
      }
      case "list_alerts": {
        const rows = await supabaseSelect(
          request,
          "alerts?select=id,kind,symbol,filer,threshold,schedule,active&active=is.true&limit=25",
        );
        if (!Array.isArray(rows))
          return JSON.stringify({ error: "Alert storage is not available yet.", alerts: [] });
        return JSON.stringify({ alerts: rows });
      }
      default:
        return JSON.stringify({ error: `Unknown tool ${name}.` });
    }
  } catch (error) {
    return JSON.stringify({ error: error instanceof Error ? error.message : "Tool failed." });
  }
}

const SYSTEM_PROMPT = `You are Ape, the market research agent inside ApeTerm.

You can both look things up and operate the workspace. Prefer acting over describing: if the user
asks for something you have a tool for, call the tool rather than explaining how they could do it
themselves.

Rules:
- Resolve company names to canonical US tickers before calling any symbol tool.
- Use the read tools whenever you need a number. Never invent a price, filing or headline.
- Chain tools when it helps: look something up, then act on the result.
- Distinguish facts from inference. Do not give personalised financial advice.
- Answers render in a narrow terminal panel: be compact, no markdown headings, short lines.
- After acting, confirm in one short sentence what you changed.`;

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const userId = await authenticate(request);
        if (!userId) return Response.json({ error: "Sign in required." }, { status: 401 });
        if (!allowed(request)) {
          return Response.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
        }
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          return Response.json({ error: "OpenRouter is not configured." }, { status: 503 });
        }
        const body = (await request.json().catch(() => null)) as {
          messages?: AgentMessage[];
          context?: string;
        } | null;
        const incoming = (body?.messages ?? [])
          .filter(
            (message): message is AgentMessage =>
              ["user", "assistant"].includes(message?.role) &&
              typeof message?.content === "string" &&
              message.content.trim().length > 0,
          )
          .slice(-10)
          .map((message) => ({ ...message, content: message.content.trim().slice(0, 4_000) }));
        if (!incoming.length) return Response.json({ error: "Message required." }, { status: 400 });

        const context = body?.context?.trim().slice(0, 6_000) ?? "";
        const origin = new URL(request.url).origin;
        const model = process.env.OPENROUTER_MODEL ?? "openrouter/free";

        const conversation: Record<string, unknown>[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...(context
            ? [{ role: "system", content: `Current ApeTerm workspace state:\n${context}` }]
            : []),
          ...incoming,
        ];
        const actions: ClientAction[] = [];
        let reply = "";
        let usedModel = model;

        for (let round = 0; round < MAX_ROUNDS; round += 1) {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            signal: AbortSignal.timeout(60_000),
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://app.apeterm.com",
              "X-Title": "ApeTerm Web",
            },
            body: JSON.stringify({
              model,
              messages: conversation,
              temperature: 0.3,
              max_tokens: 900,
              tools: agentTools,
              tool_choice: "auto",
            }),
          });
          const payload = await response.json().catch(() => null);
          if (!response.ok) {
            console.error("[api/agent] OpenRouter", response.status, payload?.error?.message);
            return Response.json(
              { error: payload?.error?.message ?? `OpenRouter ${response.status}` },
              { status: response.status === 429 ? 429 : 502 },
            );
          }
          usedModel = payload?.model ?? model;
          const message = payload?.choices?.[0]?.message as
            | { content?: string; tool_calls?: ToolCall[] }
            | undefined;
          const toolCalls = message?.tool_calls ?? [];
          if (typeof message?.content === "string" && message.content.trim()) {
            reply = message.content.trim();
          }
          if (!toolCalls.length) break;

          conversation.push({
            role: "assistant",
            content: message?.content ?? "",
            tool_calls: toolCalls,
          });

          for (const call of toolCalls) {
            const name = call.function?.name ?? "";
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(call.function?.arguments ?? "{}") as Record<string, unknown>;
            } catch {
              args = {};
            }
            let result: string;
            if (isClientTool(name)) {
              // Applied in the browser; acknowledged here so the model can compose a reply.
              actions.push({ type: name, ...args } as ClientAction);
              result = JSON.stringify({ ok: true, applied: name, args });
            } else {
              result = await runReadTool(name, args, origin, request);
            }
            conversation.push({
              role: "tool",
              tool_call_id: call.id ?? name,
              name,
              content: result.slice(0, 6_000),
            });
          }
          // The reply must come from a round that ends without tool calls.
          reply = "";
        }

        if (!reply && actions.length) {
          reply = `Done — ${actions.length} change${actions.length > 1 ? "s" : ""} applied.`;
        }
        if (!reply) {
          return Response.json({ error: "The model returned no response." }, { status: 502 });
        }
        return Response.json({ reply, model: usedModel, actions });
      },
    },
  },
});
