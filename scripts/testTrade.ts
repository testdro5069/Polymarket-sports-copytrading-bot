import "../src/config";
import { ClobClient, SignatureType } from "@polymarket/clob-client";
import { Wallet } from "ethers";
import { appSecrets } from "../src/config";
import { tradeConfig } from "../src/config/tradeConfig";

function signatureTypeFromConfig(): SignatureType {
  const s = tradeConfig.signatureType;
  if (s === 0) return SignatureType.EOA;
  if (s === 1) return SignatureType.POLY_PROXY;
  return SignatureType.POLY_GNOSIS_SAFE;
}

async function main(): Promise<void> {
  const pk = appSecrets.privateKeys[0];
  if (!pk) throw new Error("PRIVATE_KEY");
  const w = new Wallet(pk);
  const temp = new ClobClient(tradeConfig.clobHost, tradeConfig.chainId, w);
  const creds = await temp.createOrDeriveApiKey();
  const client = new ClobClient(
    tradeConfig.clobHost,
    tradeConfig.chainId,
    w,
    creds,
    signatureTypeFromConfig(),
    appSecrets.funderAddress || undefined
  );
  const ok = await client.getOk();
  process.stdout.write(JSON.stringify({ address: w.address, ok }) + "\n");
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
