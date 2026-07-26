import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

type AgentMessage = { role: "user" | "assistant"; content: string };
type AgentAction = {
  type: "add_to_watchlist" | "remove_from_watchlist";
  symbol: string;
};
type RateEntry = { count: number; resetAt: number };
const rateGlobal = globalThis as typeof globalThis & { __apeAgentRate?: Map<string, RateEntry> };
const rateLimit = (rateGlobal.__apeAgentRate ??= new Map());

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

async function authenticated(request: Request) {
  const authorization = request.headers.get("authorization");
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!authorization?.startsWith("Bearer ") || !supabaseUrl || !publishableKey) return false;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: publishableKey },
    signal: AbortSignal.timeout(8_000),
  }).catch(() => null);
  return response?.ok === true;
}

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await authenticated(request))) {
          return Response.json({ error: "Sign in required." }, { status: 401 });
        }
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
        const messages = (body?.messages ?? [])
          .filter(
            (message): message is AgentMessage =>
              ["user", "assistant"].includes(message?.role) &&
              typeof message?.content === "string" &&
              message.content.trim().length > 0,
          )
          .slice(-10)
          .map((message) => ({ ...message, content: message.content.trim().slice(0, 4_000) }));
        if (!messages.length) return Response.json({ error: "Message required." }, { status: 400 });

        const context = body?.context?.trim().slice(0, 6_000) ?? "";
        const tools = [
          {
            type: "function",
            function: {
              name: "add_to_watchlist",
              description: "Add a standard US-listed stock or ETF ticker to the user's watchlist.",
              parameters: {
                type: "object",
                properties: {
                  symbol: { type: "string", description: "Canonical ticker, for example NFLX" },
                },
                required: ["symbol"],
                additionalProperties: false,
              },
            },
          },
          {
            type: "function",
            function: {
              name: "remove_from_watchlist",
              description: "Remove a stock or ETF ticker from the user's watchlist.",
              parameters: {
                type: "object",
                properties: {
                  symbol: { type: "string", description: "Canonical ticker, for example NFLX" },
                },
                required: ["symbol"],
                additionalProperties: false,
              },
            },
          },
        ];
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
            model: "openrouter/free",
            messages: [
              {
                role: "system",
                content:
                  "You are Ape, the concise market research agent inside ApeTerm. You can modify the watchlist: whenever the user asks to add or remove an instrument, resolve its common company name to its canonical US ticker and call the matching tool. Never say the watchlist is read-only. Use the supplied live dashboard context when relevant. Clearly distinguish facts from inference, avoid fabricated prices or filings, and do not present personalized financial advice. Keep answers compact and readable in a narrow terminal panel.",
              },
              ...(context
                ? [{ role: "system", content: `Current ApeTerm dashboard context:\n${context}` }]
                : []),
              ...messages,
            ],
            temperature: 0.3,
            max_tokens: 700,
            tools,
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
        const modelMessage = payload?.choices?.[0]?.message;
        const actions: AgentAction[] = (modelMessage?.tool_calls ?? []).flatMap(
          (call: { function?: { name?: string; arguments?: string } }): AgentAction[] => {
            const name = call.function?.name;
            if (name !== "add_to_watchlist" && name !== "remove_from_watchlist") return [];
            try {
              const args = JSON.parse(call.function?.arguments ?? "{}") as { symbol?: unknown };
              const symbol =
                typeof args.symbol === "string" ? args.symbol.trim().toUpperCase() : "";
              if (!/^[A-Z]{1,6}(?:-[A-Z])?$/.test(symbol)) return [];
              return [{ type: name, symbol }];
            } catch {
              return [];
            }
          },
        );
        const modelReply = modelMessage?.content;
        const reply =
          typeof modelReply === "string" && modelReply.trim()
            ? modelReply.trim()
            : actions
                .map((action: AgentAction) =>
                  action.type === "add_to_watchlist"
                    ? `Added ${action.symbol} to your watchlist.`
                    : `Removed ${action.symbol} from your watchlist.`,
                )
                .join("\n");
        if (!reply) {
          return Response.json({ error: "The model returned no response." }, { status: 502 });
        }
        return Response.json({ reply, model: payload.model ?? "openrouter/free", actions });
      },
    },
  },
});
