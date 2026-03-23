import { tradeConfig } from "../config/tradeConfig";
import type { GammaMarket } from "../types/market";
import type { CopyTradeIntent } from "../types/trade";

export function copyTradeDetail(intent: CopyTradeIntent, market: GammaMarket): Record<string, unknown> {
  return {
    leaderFeed: tradeConfig.leaderFeed,
    dedupeKey: intent.dedupeKey,
    leaderRef: intent.transactionHash,
    side: intent.side,
    price: intent.price,
    sizeUsdc: Number(intent.sizeUsdc.toFixed(6)),
    sizeShares: Number(intent.sizeShares.toFixed(6)),
    outcome: intent.outcome,
    tokenId: intent.tokenId,
    conditionId: intent.conditionId,
    eventSlug: intent.eventSlug,
    title: intent.title,
    marketQuestion: market.question,
    marketSlug: market.slug,
    marketConditionId: market.conditionId,
    negRisk: market.negRisk ?? null,
    orderMinSize: market.orderMinSize ?? null,
    copyRatio: tradeConfig.copyRatio,
    maxTradeUsdc: tradeConfig.maxTradeUsdc,
    minTradeUsdc: tradeConfig.minTradeUsdc
  };
}
