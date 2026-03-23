import type { CopyTradeIntent } from "../types/trade";

type Task = { intent: CopyTradeIntent; run: () => Promise<void> };

export class QueueManager {
  private q: Task[] = [];
  private running = false;

  enqueue(intent: CopyTradeIntent, run: () => Promise<void>): void {
    this.q.push({ intent, run });
    this.q.sort((a, b) => b.intent.priority - a.intent.priority);
    void this.pump();
  }

  private async pump(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      while (this.q.length) {
        const t = this.q.shift();
        if (!t) break;
        await t.run();
      }
    } finally {
      this.running = false;
    }
  }
}
