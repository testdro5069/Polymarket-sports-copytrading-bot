import axios from "axios";
import { tradeConfig } from "../../config/tradeConfig";

const dataApi = axios.create({ baseURL: tradeConfig.dataApiHost, timeout: 30_000 });

export async function fetchOpenInterest(conditionId: string): Promise<number | null> {
  try {
    const res = await dataApi.get<{ oi?: number }>("/oi", { params: { market: conditionId } });
    const v = (res.data as { oi?: number })?.oi;
    return typeof v === "number" ? v : null;
  } catch {
    return null;
  }
}
