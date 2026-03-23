import axios from "axios";
import { tradeConfig } from "../../config/tradeConfig";
import type { DataApiActivity } from "../../types/apiResponses";
import { withRetry } from "../../utils/retryHandler";

const dataApi = axios.create({ baseURL: tradeConfig.dataApiHost, timeout: 30_000 });

export async function fetchRecentTrades(
  userAddress: string,
  opts?: { limit?: number; offset?: number }
): Promise<DataApiActivity[]> {
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;
  const res = await withRetry(
    async () =>
      dataApi.get<DataApiActivity[]>("/activity", {
        params: {
          user: userAddress,
          type: "TRADE",
          limit,
          offset,
          sortBy: "TIMESTAMP",
          sortDirection: "DESC"
        }
      }),
    { label: "data.activity" }
  );
  return Array.isArray(res.data) ? res.data : [];
}
