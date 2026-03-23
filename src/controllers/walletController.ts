import { loadWallets, pickNextWallet } from "../services/blockchain/multiWallet";
import type { ManagedWallet } from "../types/wallet";

export class WalletController {
  readonly wallets: ManagedWallet[];

  constructor(privateKeys: string[], rpcUrl: string, chainId: number) {
    this.wallets = loadWallets(privateKeys, rpcUrl, chainId);
  }

  next(): ManagedWallet {
    return pickNextWallet(this.wallets);
  }
}
