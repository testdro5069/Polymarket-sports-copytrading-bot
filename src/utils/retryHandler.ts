import { logger } from "./logger";
import { sleep } from "./helpers";

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: { retries?: number; baseMs?: number; label?: string }
): Promise<T> {
  const retries = opts?.retries ?? 4;
  const baseMs = opts?.baseMs ?? 400;
  const label = opts?.label ?? "op";
  let last: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i === retries) break;
      const wait = baseMs * Math.pow(2, i);
      logger.warn({ err: e, label, attempt: i + 1, wait }, "retry");
      await sleep(wait);
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}
