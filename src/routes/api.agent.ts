import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

type AgentMessage = { role: "user" | "assistant"; content: string };
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

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
                  "You are Ape, the concise market research agent inside ApeTerm. Use the supplied live dashboard context when relevant. Clearly distinguish facts from inference, avoid fabricated prices or filings, and do not present personalized financial advice. Keep answers compact and readable in a narrow terminal panel.",
              },
              ...(context
                ? [{ role: "system", content: `Current ApeTerm dashboard context:\n${context}` }]
                : []),
              ...messages,
            ],
            temperature: 0.3,
            max_tokens: 700,
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
        const reply = payload?.choices?.[0]?.message?.content;
        if (typeof reply !== "string" || !reply.trim()) {
          return Response.json({ error: "The model returned no response." }, { status: 502 });
        }
        return Response.json({ reply: reply.trim(), model: payload.model ?? "openrouter/free" });
      },
    },
  },
});
