import { tradeConfig } from "../config/tradeConfig";
import { metrics } from "../utils/metrics";
import type { CopyTradeIntent } from "../types/trade";

export function allowIntent(intent: CopyTradeIntent): { ok: boolean; reason?: string } {
  if (intent.sizeUsdc < tradeConfig.minTradeUsdc) {
    return { ok: false, reason: "min trade" };
  }
  if (intent.sizeUsdc > tradeConfig.maxTradeUsdc) {
    return { ok: false, reason: "max trade" };
  }
  if (metrics.usdcNotional + intent.sizeUsdc > tradeConfig.maxDailyUsdc) {
    return { ok: false, reason: "daily cap" };
  }
  return { ok: true };
}
