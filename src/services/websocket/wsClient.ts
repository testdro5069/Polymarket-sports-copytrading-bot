import WebSocket from "ws";
import { logger } from "../../utils/logger";
import { sleep } from "../../utils/helpers";

export class ReconnectingWs {
  private ws: WebSocket | null = null;
  private stopped = false;

  constructor(
    private readonly url: string,
    private readonly onMessage: (data: string) => void,
    private readonly heartbeatMs = 25_000
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

  send(data: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(data);
  }

  private async loop(): Promise<void> {
    let backoff = 500;
    while (!this.stopped) {
      try {
        await new Promise<void>((resolve, reject) => {
          const ws = new WebSocket(this.url);
          this.ws = ws;
          const ping = setInterval(() => {
            try {
              if (ws.readyState === WebSocket.OPEN) ws.ping();
            } catch {
              return;
            }
          }, this.heartbeatMs);
          ws.on("message", (d) => this.onMessage(String(d)));
          ws.on("close", () => {
            clearInterval(ping);
            resolve();
          });
          ws.on("error", (e) => {
            clearInterval(ping);
            reject(e);
          });
        });
      } catch (e) {
        logger.warn({ err: e, url: this.url }, "ws reconnect");
        await sleep(Math.min(30_000, backoff));
        backoff = Math.min(30_000, Math.floor(backoff * 1.7));
      }
    }
  }
}
