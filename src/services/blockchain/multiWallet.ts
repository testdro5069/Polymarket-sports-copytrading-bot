import { providers, Wallet } from "ethers";
import type { ManagedWallet } from "../../types/wallet";

function networkName(chainId: number): string {
  if (chainId === 137) return "matic";
  if (chainId === 80002) return "amoy";
  return `chain-${chainId}`;
}

export function loadWallets(privateKeys: string[], rpcUrl: string, chainId: number): ManagedWallet[] {
  const provider = new providers.StaticJsonRpcProvider(
    { url: rpcUrl, timeout: 60_000 },
    { chainId, name: networkName(chainId) }
  );
  return privateKeys.map((pk, index) => {
    const wallet = new Wallet(pk, provider);
    return { index, wallet, address: wallet.address };
  });
}

let rr = 0;

export function pickNextWallet(wallets: ManagedWallet[]): ManagedWallet {
  if (!wallets.length) throw new Error("no wallets");
  rr = (rr + 1) % wallets.length;
  return wallets[rr]!;
}
