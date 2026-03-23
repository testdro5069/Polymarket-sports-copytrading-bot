import { ClobMarketWs } from "./clobMarketWs";
import { logger } from "../../utils/logger";

export function startTradeWs(
  assetIds: string[],
  onRaw: (raw: string) => void,
  customFeatures?: boolean
): ClobMarketWs | null {
  if (!assetIds.length) return null;
  const ws = new ClobMarketWs(assetIds, onRaw, customFeatures ?? false);
  ws.start();
  return ws;
}
