import {
  AssetType,
  ClobClient,
  OrderType,
  Side,
  SignatureType
} from "@polymarket/clob-client";
import type { Wallet } from "ethers";
import { tradeConfig } from "../../config/tradeConfig";
import { getClobBestPrice } from "../../services/api/clobPublic";
import type { GammaMarket } from "../../types/market";
import type { CopyTradeIntent } from "../../types/trade";
import { withRetry } from "../../utils/retryHandler";
import { ensureEoaOnchainApprovals } from "./eoaApprovals";

const clientCache = new Map<string, ClobClient>();

function sigType(): SignatureType {
  const s = tradeConfig.signatureType;
  if (s === 0) return SignatureType.EOA;
  if (s === 1) return SignatureType.POLY_PROXY;
  return SignatureType.POLY_GNOSIS_SAFE;
}

async function getClient(wallet: Wallet, funder?: string): Promise<ClobClient> {
  const key = wallet.address.toLowerCase();
  if (clientCache.has(key)) return clientCache.get(key)!;
  const temp = new ClobClient(tradeConfig.clobHost, tradeConfig.chainId, wallet);
  const creds = await temp.createOrDeriveApiKey();
  const client = new ClobClient(
    tradeConfig.clobHost,
    tradeConfig.chainId,
    wallet,
    creds,
    sigType(),
    funder
  );
  clientCache.set(key, client);
  return client;
}

export async function getOrCreateClobClient(wallet: Wallet, funder?: string): Promise<ClobClient> {
  return getClient(wallet, funder);
}

async function assertLiquidityAndFunds(client: ClobClient, intent: CopyTradeIntent): Promise<void> {
  const live = await getClobBestPrice(intent.tokenId, intent.side);
  const slip = Math.abs(intent.price - live) / Math.max(live, 1e-9);
  if (slip * 10_000 > tradeConfig.maxPriceSlippageBps) {
    throw new Error(
      `price moved: leader ${intent.price} vs book ${live} (${(slip * 100).toFixed(2)}%)`
    );
  }
  if (intent.side === "BUY") {
    const bal = await client.getBalanceAllowance({ asset_type: AssetType.COLLATERAL });
    const v = parseFloat(bal.balance);
    if (v + 1e-6 < intent.sizeUsdc) {
      throw new Error(`insufficient USDC collateral: ${v} < ${intent.sizeUsdc}`);
    }
  } else {
    const bal = await client.getBalanceAllowance({
      asset_type: AssetType.CONDITIONAL,
      token_id: intent.tokenId
    });
    const v = parseFloat(bal.balance);
    if (v + 1e-9 < intent.sizeShares) {
      throw new Error(`insufficient outcome tokens: ${v} < ${intent.sizeShares}`);
    }
  }
}

export async function submitCopyOrder(
  wallet: Wallet,
  intent: CopyTradeIntent,
  market: GammaMarket,
  funder?: string
): Promise<unknown> {
  const minSize = market.orderMinSize ?? 1;
  if (intent.sizeShares < minSize) {
    throw new Error(`below min shares ${minSize}`);
  }
  if (tradeConfig.signatureType === 0) {
    await ensureEoaOnchainApprovals(wallet, tradeConfig.chainId);
  }
  const client = await getClient(wallet, funder);
  if (tradeConfig.signatureType === 0) {
    await client.updateBalanceAllowance({ asset_type: AssetType.COLLATERAL });
    await client.updateBalanceAllowance({
      asset_type: AssetType.CONDITIONAL,
      token_id: intent.tokenId
    });
  }
  await assertLiquidityAndFunds(client, intent);
  const [tickSize, negRisk] = await Promise.all([
    client.getTickSize(intent.tokenId),
    client.getNegRisk(intent.tokenId)
  ]);
  const side = intent.side === "BUY" ? Side.BUY : Side.SELL;
  return withRetry(
    async () =>
      client.createAndPostOrder(
        {
          tokenID: intent.tokenId,
          price: intent.price,
          side,
          size: intent.sizeShares
        },
        { tickSize, negRisk },
        OrderType.GTC
      ),
    { label: "clob.order" }
  );
}
