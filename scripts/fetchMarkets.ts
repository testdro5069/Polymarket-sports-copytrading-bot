import axios from "axios";
import fs from "fs";
import path from "path";
import { POLYMARKET_URLS } from "../src/config/polymarketEndpoints";

async function main(): Promise<void> {
  const base = process.env.GAMMA_API_HOST || POLYMARKET_URLS.gammaApi;
  const res = await axios.get(`${base}/events`, {
    params: { tag_id: 1, limit: 200, active: true }
  });
  const out = path.join(process.cwd(), "markets-cache.json");
  fs.writeFileSync(out, JSON.stringify(res.data, null, 2));
  process.stdout.write(out + "\n");
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
