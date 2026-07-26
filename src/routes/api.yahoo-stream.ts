import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const SYMBOLS = ["SPY", "QQQ", "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL", "TSLA", "JPM"];
type Subscriber = ReadableStreamDefaultController<Uint8Array>;
type StreamState = {
  child?: ChildProcessWithoutNullStreams;
  subscribers: Set<Subscriber>;
  stopTimer?: ReturnType<typeof setTimeout>;
};

const serverGlobal = globalThis as typeof globalThis & { __apeYahooStream?: StreamState };
const state = (serverGlobal.__apeYahooStream ??= { subscribers: new Set() });
const encoder = new TextEncoder();

function broadcast(value: unknown) {
  const message = encoder.encode(`data: ${JSON.stringify(value)}\n\n`);
  for (const subscriber of state.subscribers) {
    try {
      subscriber.enqueue(message);
    } catch {
      state.subscribers.delete(subscriber);
    }
  }
}

function startYfinance() {
  if (state.child) return;
  if (state.stopTimer) clearTimeout(state.stopTimer);
  const workspace = path.resolve(process.cwd(), "..");
  const python = process.env.APETERM_PYTHON ?? path.join(workspace, "apeterm/.venv/bin/python");
  const script = path.join(workspace, "apeterm/scripts/yfinance_stream.py");
  const child = spawn(python, ["-u", script, ...SYMBOLS]);
  state.child = child;
  let pending = "";

  child.stdout.on("data", (chunk: Buffer) => {
    pending += chunk.toString("utf8");
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";
    for (const line of lines) {
      try {
        const quote = JSON.parse(line);
        broadcast({
          symbol: quote.symbol,
          price: quote.price,
          changePercent: quote.price_change_percent,
          volume: quote.day_volume ?? 0,
          relativeVolume:
            quote.avg_volume > 0 && quote.day_volume > 0
              ? quote.day_volume / quote.avg_volume
              : null,
          marketState: quote.market_state,
          receivedAt: new Date().toISOString(),
        });
      } catch {
        // Ignore non-JSON diagnostics from the local Python process.
      }
    }
  });
  child.stderr.on("data", (chunk: Buffer) =>
    console.error("[yfinance-stream]", chunk.toString("utf8").trim()),
  );
  child.on("error", (error) => console.error("[yfinance-stream]", error));
  child.on("close", () => {
    state.child = undefined;
    if (state.subscribers.size) setTimeout(startYfinance, 1_500);
  });
}

function unsubscribe(controller: Subscriber) {
  state.subscribers.delete(controller);
  if (!state.subscribers.size && state.child && !state.stopTimer) {
    state.stopTimer = setTimeout(() => {
      state.child?.kill();
      state.child = undefined;
      state.stopTimer = undefined;
    }, 5_000);
  }
}

export const Route = createFileRoute("/api/yahoo-stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        let subscriber: Subscriber | undefined;
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            subscriber = controller;
            state.subscribers.add(controller);
            startYfinance();
            request.signal.addEventListener("abort", () => unsubscribe(controller), { once: true });
          },
          cancel() {
            if (subscriber) unsubscribe(subscriber);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
