import { loadWallets, pickNextWallet } from "../src/services/blockchain/multiWallet";

describe("multiWallet", () => {
  it("rotates", () => {
    const k =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const w = loadWallets([k], "https://polygon-rpc.com", 137);
    expect(w.length).toBe(1);
    expect(pickNextWallet(w).address).toMatch(/^0x/);
  });
});
