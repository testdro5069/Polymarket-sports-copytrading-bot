import WebSocket from "ws";
import { POLYMARKET_URLS } from "../../config/polymarketEndpoints";
import { logger } from "../../utils/logger";
import { sleep } from "../../utils/helpers";

export class ClobMarketWs {
  private ws: WebSocket | null = null;
  private ping: ReturnType<typeof setInterval> | null = null;
  private stopped = false;

  constructor(
    private readonly assetIds: string[],
    private readonly onMessage: (raw: string) => void,
    private readonly customFeatures = false
  ) {}

  start(): void {
    if (!this.assetIds.length) return;
    this.stopped = false;
    void this.run();
  }

  stop(): void {
    this.stopped = true;
    if (this.ping) clearInterval(this.ping);
    try {
      this.ws?.close();
    } catch {
      return;
    }
  }

  private async run(): Promise<void> {
    let backoff = 500;
    while (!this.stopped) {
      try {
        await new Promise<void>((resolve, reject) => {
          const ws = new WebSocket(POLYMARKET_URLS.wsMarket);
          this.ws = ws;
          ws.on("open", () => {
            const sub = JSON.stringify({
              assets_ids: this.assetIds,
              type: "market",
              custom_feature_enabled: this.customFeatures
            });
            ws.send(sub);
            this.ping = setInterval(() => {
              try {
                if (ws.readyState === WebSocket.OPEN) ws.send("PING");
              } catch {
                return;
              }
            }, 10_000);
          });
          ws.on("message", (d) => this.onMessage(String(d)));
          ws.on("close", () => {
            if (this.ping) clearInterval(this.ping);
            this.ping = null;
            resolve();
          });
          ws.on("error", (e) => {
            if (this.ping) clearInterval(this.ping);
            this.ping = null;
            reject(e);
          });
        });
      } catch (e) {
        logger.warn({ err: e }, "clob market ws");
        await sleep(Math.min(30_000, backoff));
        backoff = Math.min(30_000, Math.floor(backoff * 1.7));
      }
    }
  }
}
