import "../config/consoleColorBootstrap";
import "../config";
import { logger } from "../utils/logger";
import { BotController } from "../controllers/botController";
import { printCopyEngineExplainer, printFatalBanner, printLuxuryBanner } from "../utils/luxuryConsole";

async function main(): Promise<void> {
  printLuxuryBanner();
  printCopyEngineExplainer();
  const bot = new BotController();
  await bot.start();
}

main().catch((e) => {
  printFatalBanner(e);
  logger.error({ err: e }, "fatal");
  process.exit(1);
});
