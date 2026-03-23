import { AssetType } from "@polymarket/clob-client";
import { utils } from "ethers";
import { appSecrets } from "../../config";
import { tradeConfig } from "../../config/tradeConfig";
import type { ManagedWallet } from "../../types/wallet";
import { logger } from "../../utils/logger";
import { getOrCreateClobClient } from "./tradeExecutor";

export async function logStartupWalletBalances(wallets: ManagedWallet[]): Promise<void> {
  if (!wallets.length) return;
  const funder = appSecrets.funderAddress || undefined;
  for (const m of wallets) {
    try {
      const maticWei = await m.wallet.provider.getBalance(m.address);
      const client = await getOrCreateClobClient(m.wallet, funder);
      if (tradeConfig.signatureType === 0) {
        await client.updateBalanceAllowance({ asset_type: AssetType.COLLATERAL });
      }
      const col = await client.getBalanceAllowance({ asset_type: AssetType.COLLATERAL });
      logger.info(
        {
          walletIndex: m.index,
          address: m.address,
          matic: utils.formatEther(maticWei),
          clobCollateralUsdc: col.balance,
          clobCollateralAllowance: col.allowance
        },
        "wallet balance at start (CLOB API + on-chain MATIC for gas)"
      );
    } catch (e) {
      logger.error(
        { err: e, address: m.address },
        "startup balances: failed — check POLYGON_RPC_URL, CLOB_HOST, and wallet / API credentials"
      );
      throw e;
    }
  }
}
