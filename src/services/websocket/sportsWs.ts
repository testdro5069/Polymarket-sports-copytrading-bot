import WebSocket from "ws";
import { POLYMARKET_URLS } from "../../config/polymarketEndpoints";
import { logger } from "../../utils/logger";
import { sleep } from "../../utils/helpers";

export class SportsResultsWs {
  private ws: WebSocket | null = null;
  private stopped = false;

  constructor(
    private readonly url: string,
    private readonly onPayload: (payload: unknown) => void
  ) {}

  start(): void {
    this.stopped = false;
    void this.loop();
  }

  stop(): void {
    this.stopped = true;
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
          const ws = new WebSocket(this.url);
          this.ws = ws;
          ws.on("message", (d) => {
            const s = String(d).trim();
            if (s === "ping") {
              try {
                if (ws.readyState === WebSocket.OPEN) ws.send("pong");
              } catch {
                return;
              }
              return;
            }
            try {
              this.onPayload(JSON.parse(s));
            } catch {
              logger.debug({ s }, "sports ws");
            }
          });
          ws.on("close", () => resolve());
          ws.on("error", (e) => reject(e));
        });
      } catch (e) {
        logger.warn({ err: e, url: this.url }, "sports ws");
        await sleep(Math.min(30_000, backoff));
        backoff = Math.min(30_000, Math.floor(backoff * 1.7));
      }
    }
  }
}

export function startSportsWs(
  url: string | undefined,
  onPayload: (payload: unknown) => void
): SportsResultsWs | null {
  const u = url || POLYMARKET_URLS.wsSports;
  const ws = new SportsResultsWs(u, onPayload);
  ws.start();
  return ws;
}
