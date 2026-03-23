export type TradeSide = "BUY" | "SELL";

export interface CopyTradeIntent {
  dedupeKey: string;
  tokenId: string;
  conditionId: string;
  side: TradeSide;
  price: number;
  sizeUsdc: number;
  sizeShares: number;
  title: string;
  outcome: string;
  eventSlug: string;
  transactionHash: string;
  timestamp: number;
  priority: number;
}

export interface ExecutionResult {
  ok: boolean;
  error?: string;
  response?: unknown;
}
