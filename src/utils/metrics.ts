export const metrics = {
  tradesAttempted: 0,
  tradesSucceeded: 0,
  tradesFailed: 0,
  usdcNotional: 0,
  lastError: "" as string
};

export function resetDailyMetrics(): void {
  metrics.usdcNotional = 0;
}
