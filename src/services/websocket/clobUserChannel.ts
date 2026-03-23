import WebSocket from "ws";
import type { ApiKeyCreds } from "@polymarket/clob-client";
import { POLYMARKET_URLS } from "../../config/polymarketEndpoints";
import { logger } from "../../utils/logger";
import { sleep } from "../../utils/helpers";

const OK_TRADE = new Set(["MATCHED", "MINED", "CONFIRMED"]);

export class ClobUserChannel {
  private ws: WebSocket | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private stopped = false;

  constructor(
    private readonly creds: ApiKeyCreds,
    private readonly onTrade: (payload: Record<string, unknown>) => void,
    private readonly markets: string[]
  ) {}

  start(): void {
    this.stopped = false;
    void this.loop();
  }

  stop(): void {
    this.stopped = true;
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    try {
      this.ws?.close();
    } catch {
      return;
    }
  }

  private async loop(): Promise<void> {
    let backoff = 500;
    while (!this.stopped) {
      try {
        await new Promise<void>((resolve, reject) => {
          const ws = new WebSocket(POLYMARKET_URLS.wsUser);
          this.ws = ws;
          ws.on("open", () => {
            backoff = 500;
            const sub: Record<string, unknown> = {
              auth: {
                apiKey: this.creds.key,
                secret: this.creds.secret,
                passphrase: this.creds.passphrase
              },
              type: "user"
            };
            if (this.markets.length) sub.markets = this.markets;
            ws.send(JSON.stringify(sub));
            this.pingTimer = setInterval(() => {
              try {
                if (ws.readyState === WebSocket.OPEN) ws.send("PING");
              } catch {
                return;
              }
            }, 10_000);
          });
          ws.on("message", (d) => {
            const s = String(d);
            if (s === "PONG" || s.trim() === "") return;
            let parsed: unknown;
            try {
              parsed = JSON.parse(s);
            } catch {
              return;
            }
            const batch = Array.isArray(parsed) ? parsed : [parsed];
            for (const item of batch) {
              if (!item || typeof item !== "object") continue;
              const o = item as Record<string, unknown>;
              if (o.event_type !== "trade") continue;
              const st = String(o.status ?? "");
              if (!OK_TRADE.has(st)) continue;
              this.onTrade(o);
            }
          });
          ws.on("close", () => {
            if (this.pingTimer) {
              clearInterval(this.pingTimer);
              this.pingTimer = null;
            }
            resolve();
          });
          ws.on("error", (e) => {
            if (this.pingTimer) {
              clearInterval(this.pingTimer);
              this.pingTimer = null;
            }
            reject(e);
          });
        });
      } catch (e) {
        logger.warn({ err: e }, "clob user ws reconnect");
        await sleep(Math.min(30_000, backoff));
        backoff = Math.min(30_000, Math.floor(backoff * 1.7));
      }
    }
  }
}
