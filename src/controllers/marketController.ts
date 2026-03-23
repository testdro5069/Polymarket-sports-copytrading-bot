import { tradeConfig } from "../config/tradeConfig";
import { fetchEventBySlug, isSportsEvent } from "../services/api/polymarketApi";
import { logger } from "../utils/logger";

const cache = new Map<string, { ok: boolean; at: number }>();
const TTL_MS = 10 * 60_000;

export async function isSportsMarketEvent(eventSlug: string): Promise<boolean> {
  if (!tradeConfig.sportsOnly) return true;
  if (!eventSlug) return false;
  const now = Date.now();
  const hit = cache.get(eventSlug);
  if (hit && now - hit.at < TTL_MS) return hit.ok;
  try {
    const ev = await fetchEventBySlug(eventSlug);
    const ok = isSportsEvent(ev);
    cache.set(eventSlug, { ok, at: now });
    return ok;
  } catch (e) {
    logger.warn({ err: e, eventSlug }, "event lookup");
    return false;
  }
}
