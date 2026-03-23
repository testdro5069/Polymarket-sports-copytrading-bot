import axios from "axios";
import { tradeConfig } from "../../config/tradeConfig";
import type { TradeSide } from "../../types/trade";
import { withRetry } from "../../utils/retryHandler";

export async function getClobBestPrice(tokenId: string, side: TradeSide): Promise<number> {
  const res = await withRetry(
    async () =>
      axios.get<{ price?: string; error?: string }>(`${tradeConfig.clobHost}/price`, {
        params: { token_id: tokenId, side },
        timeout: 15_000
      }),
    { label: "clob.price", retries: 2 }
  );
  const p = res.data?.price;
  if (p === undefined) throw new Error(res.data?.error || "no price");
  return parseFloat(p);
}
