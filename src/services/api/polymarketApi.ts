import axios from "axios";
import { tradeConfig } from "../../config/tradeConfig";
import type { GammaEvent, GammaMarket } from "../../types/market";
import { withRetry } from "../../utils/retryHandler";

const gamma = axios.create({ baseURL: tradeConfig.gammaApiHost, timeout: 30_000 });

export async function fetchMarketByConditionId(conditionId: string): Promise<GammaMarket | null> {
  const res = await withRetry(
    async () =>
      gamma.get<GammaMarket[]>("/markets", {
        params: { condition_ids: conditionId }
      }),
    { label: "gamma.markets" }
  );
  const row = res.data?.[0];
  return row ?? null;
}

export async function fetchEventBySlug(eventSlug: string): Promise<GammaEvent | null> {
  if (!eventSlug) return null;
  const res = await withRetry(
    async () =>
      gamma.get<GammaEvent[]>("/events", {
        params: { slug: eventSlug, limit: 1 }
      }),
    { label: "gamma.events" }
  );
  return res.data?.[0] ?? null;
}

export function isSportsEvent(ev: GammaEvent | null): boolean {
  if (!ev?.tags?.length) return false;
  return ev.tags.some((t) => t.slug === "sports" || t.id === "1");
}

export function eventSlugFromMarket(m: GammaMarket): string {
  const ev = m.events?.[0];
  if (ev?.slug) return ev.slug;
  return m.slug ?? "";
}
