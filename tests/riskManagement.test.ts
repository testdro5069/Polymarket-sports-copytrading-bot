import { allowIntent } from "../src/strategies/riskManagement";
import { metrics } from "../src/utils/metrics";

describe("allowIntent", () => {
  it("blocks when daily cap", () => {
    metrics.usdcNotional = 1e9;
    const r = allowIntent({
      dedupeKey: "k",
      tokenId: "1",
      conditionId: "0x" + "a".repeat(64),
      side: "BUY",
      price: 0.5,
      sizeUsdc: 10,
      sizeShares: 20,
      title: "t",
      outcome: "Yes",
      eventSlug: "e",
      transactionHash: "0x" + "b".repeat(64),
      timestamp: 1,
      priority: 1
    });
    expect(r.ok).toBe(false);
    metrics.usdcNotional = 0;
  });
});
