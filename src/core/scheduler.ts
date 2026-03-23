import cron from "node-cron";
import { logger } from "../utils/logger";

export function scheduleDaily(hourUtc: number, minute: number, fn: () => void): void {
  const expr = `${minute} ${hourUtc} * * *`;
  cron.schedule(expr, () => {
    try {
      fn();
    } catch (e) {
      logger.error({ err: e }, "cron");
    }
  });
}
