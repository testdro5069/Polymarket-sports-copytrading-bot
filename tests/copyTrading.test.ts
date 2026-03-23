import { activityToIntent } from "../src/strategies/copyTrading";

describe("activityToIntent", () => {
  it("maps trade", () => {
    const a = {
      proxyWallet: "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
      timestamp: 1,
      conditionId: "0x" + "a".repeat(64),
      type: "TRADE",
      size: 10,
      usdcSize: 5,
      transactionHash: "0x" + "b".repeat(64),
      price: 0.5,
      asset: "123",
      side: "BUY" as const,
      outcomeIndex: 0,
      title: "x",
      slug: "y",
      eventSlug: "z",
      outcome: "Yes"
    };
    const i = activityToIntent(a);
    expect(i?.tokenId).toBe("123");
    expect(i?.side).toBe("BUY");
  });
});
