jest.mock("@polymarket/clob-client", () => ({
  AssetType: { COLLATERAL: "COLLATERAL", CONDITIONAL: "CONDITIONAL" },
  SignatureType: { EOA: 0, POLY_PROXY: 1, POLY_GNOSIS_SAFE: 2 },
  ClobClient: class {
    createOrDeriveApiKey() {
      return Promise.resolve({});
    }
    getTickSize() {
      return Promise.resolve("0.001");
    }
    getNegRisk() {
      return Promise.resolve(false);
    }
    getBalanceAllowance() {
      return Promise.resolve({ balance: "1000000", allowance: "1000000" });
    }
    createAndPostOrder() {
      return Promise.resolve({ ok: true });
    }
  },
  OrderType: { GTC: "GTC" },
  Side: { BUY: "BUY", SELL: "SELL" }
}));

jest.mock("../src/services/api/clobPublic", () => ({
  getClobBestPrice: () => Promise.resolve(0.5)
}));

import { submitCopyOrder } from "../src/services/blockchain/tradeExecutor";
import { Wallet } from "ethers";

describe("submitCopyOrder", () => {
  it("submits", async () => {
    const w = Wallet.createRandom();
    const intent = {
      dedupeKey: "k",
      tokenId: "1",
      conditionId: "0x" + "a".repeat(64),
      side: "BUY" as const,
      price: 0.5,
      sizeUsdc: 10,
      sizeShares: 20,
      title: "t",
      outcome: "Yes",
      eventSlug: "e",
      transactionHash: "0x" + "b".repeat(64),
      timestamp: 1,
      priority: 1
    };
    const market = {
      id: "1",
      conditionId: intent.conditionId,
      slug: "s",
      question: "q",
      outcomes: "[]",
      active: true,
      closed: false,
      orderMinSize: 1
    };
    const r = await submitCopyOrder(w, intent, market);
    expect(r).toEqual({ ok: true });
  });
});
