import type { Wallet } from "ethers";

export interface ManagedWallet {
  index: number;
  wallet: Wallet;
  address: string;
}
