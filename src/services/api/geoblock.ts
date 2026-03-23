import axios from "axios";
import { POLYMARKET_URLS } from "../../config/polymarketEndpoints";
import { withRetry } from "../../utils/retryHandler";

export interface GeoblockResult {
  blocked: boolean;
  ip: string;
  country: string;
  region: string;
}

export async function fetchGeoblockStatus(): Promise<GeoblockResult> {
  const res = await withRetry(
    async () => axios.get<GeoblockResult>(POLYMARKET_URLS.geoblock, { timeout: 15_000 }),
    { label: "geoblock", retries: 2 }
  );
  return res.data;
}
