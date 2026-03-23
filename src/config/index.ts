import "dotenv/config";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export * from "./environment";
export * from "./markets";
export * from "./polymarketEndpoints";
export * from "./tradeConfig";

export const appSecrets = {
  privateKeys: (process.env.PRIVATE_KEYS || process.env.PRIVATE_KEY || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  polygonRpc: process.env.POLYGON_RPC_URL || "https://polygon-bor.publicnode.com",
  targetWallet: (process.env.TARGET_WALLET || "").trim(),
  funderAddress: (process.env.FUNDER_ADDRESS || "").trim(),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || "",
  smtpUrl: process.env.SMTP_URL || "",
  wsSportsUrl: process.env.WS_SPORTS_URL || "",
  wsMarketAssetIds: (process.env.WS_MARKET_ASSET_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  marketWsCustomFeatures: String(process.env.WS_MARKET_CUSTOM_FEATURES || "false").toLowerCase() === "true",
  sportsWsColoredTable: String(process.env.SPORTS_WS_COLORED_TABLE || "true").toLowerCase() !== "false",
  targetClobApiKey: (process.env.TARGET_CLOB_API_KEY || "").trim(),
  targetClobSecret: (process.env.TARGET_CLOB_SECRET || "").trim(),
  targetClobPassphrase: (process.env.TARGET_CLOB_PASSPHRASE || "").trim(),
  targetUserWsMarkets: (process.env.TARGET_USER_WS_MARKETS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
};

export { appSecrets as config };
