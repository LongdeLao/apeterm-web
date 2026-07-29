import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import protobuf from "protobufjs";

const DEFAULT_SYMBOLS = [
  "SPY",
  "QQQ",
  "NVDA",
  "AAPL",
  "MSFT",
  "AMZN",
  "META",
  "GOOGL",
  "TSLA",
  "JPM",
];
const YAHOO_STREAM_URL = "wss://streamer.finance.yahoo.com/?version=2";
const encoder = new TextEncoder();

const pricingType = protobuf
  .parse(
    `
      syntax = "proto3";
      message PricingData {
        string id = 1;
        float price = 2;
        sint64 time = 3;
        string currency = 4;
        string exchange = 5;
        int32 quote_type = 6;
        int32 market_hours = 7;
        float change_percent = 8;
        sint64 day_volume = 9;
        float day_high = 10;
        float day_low = 11;
        float change = 12;
        string short_name = 13;
        sint64 expire_date = 14;
        float open_price = 15;
        float previous_close = 16;
        float strike_price = 17;
        string underlying_symbol = 18;
        sint64 open_interest = 19;
        sint64 options_type = 20;
        sint64 mini_option = 21;
        sint64 last_size = 22;
        float bid = 23;
        sint64 bid_size = 24;
        float ask = 25;
        sint64 ask_size = 26;
        sint64 price_hint = 27;
        sint64 vol_24hr = 28;
        sint64 vol_all_currencies = 29;
        string from_currency = 30;
        string last_market = 31;
        double circulating_supply = 32;
        double market_cap = 33;
      }
    `,
    { keepCase: true },
  )
  .root.lookupType("PricingData");

type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  relativeVolume: number | null;
  marketState: "pre_market" | "regular" | "after_hours";
  receivedAt: string;
  source: "websocket";
};

type PricingMessage = {
  id?: string;
  price?: number;
  change_percent?: number;
  day_volume?: number | LongLike;
  market_hours?: number;
};

type LongLike = { toNumber?: () => number; toString: () => string };

function symbolsFromRequest(request: Request) {
  const values = new URL(request.url).searchParams.get("symbols")?.split(",") ?? DEFAULT_SYMBOLS;
  const symbols = values
    .map((symbol) => symbol.trim().toUpperCase())
    .filter((symbol) => /^[A-Z]{1,6}(?:-[A-Z])?$/.test(symbol))
    .filter((symbol, index, all) => all.indexOf(symbol) === index)
    .slice(0, 25);
  return symbols.length ? symbols : DEFAULT_SYMBOLS;
}

function event(value: unknown) {
  return encoder.encode(`data: ${JSON.stringify(value)}\n\n`);
}

function integer(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "object" && value && "toNumber" in value) return value.toNumber?.() ?? 0;
  if (typeof value === "object" && value && "toString" in value) return Number(value.toString());
  return 0;
}

function normalizeMarketState(value: unknown): Quote["marketState"] {
  if (value === 0) return "pre_market";
  if (value === 1) return "regular";
  return "after_hours";
}

function decodeYahooMessage(data: unknown): Quote | null {
  const raw = typeof data === "string" ? data : Buffer.from(data as ArrayBuffer).toString("utf8");
  const payload = JSON.parse(raw) as { message?: string };
  if (!payload.message) return null;
  const decoded = pricingType.toObject(
    pricingType.decode(Buffer.from(payload.message, "base64")),
  ) as PricingMessage;
  if (!decoded.id || !decoded.price) return null;
  return {
    symbol: decoded.id,
    price: decoded.price,
    changePercent: decoded.change_percent ?? 0,
    volume: integer(decoded.day_volume),
    relativeVolume: null,
    marketState: normalizeMarketState(decoded.market_hours),
    receivedAt: new Date().toISOString(),
    source: "websocket",
  };
}

export const Route = createFileRoute("/api/yahoo-stream")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const symbols = symbolsFromRequest(request);
        let socket: WebSocket | undefined;
        let subscribeTimer: ReturnType<typeof setInterval> | undefined;
        let closed = false;

        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            const safeEnqueue = (value: unknown) => {
              if (!closed) controller.enqueue(event(value));
            };
            const subscribe = () => socket?.send(JSON.stringify({ subscribe: symbols }));

            socket = new WebSocket(YAHOO_STREAM_URL);
            socket.addEventListener("open", () => {
              safeEnqueue({ type: "status", status: "websocket-live" });
              subscribe();
              subscribeTimer = setInterval(subscribe, 15_000);
            });
            socket.addEventListener("message", (message) => {
              try {
                const quote = decodeYahooMessage(message.data);
                if (quote) safeEnqueue(quote);
              } catch (error) {
                safeEnqueue({ type: "status", status: "decode-error", error: String(error) });
              }
            });
            socket.addEventListener("error", () =>
              safeEnqueue({ type: "status", status: "websocket-error" }),
            );
            socket.addEventListener("close", () => {
              if (!closed) safeEnqueue({ type: "status", status: "websocket-closed" });
            });

            request.signal.addEventListener(
              "abort",
              () => {
                closed = true;
                if (subscribeTimer) clearInterval(subscribeTimer);
                socket?.close();
                controller.close();
              },
              { once: true },
            );
          },
          cancel() {
            closed = true;
            if (subscribeTimer) clearInterval(subscribeTimer);
            socket?.close();
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
