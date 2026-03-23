import { Chalk } from "chalk";
import figlet from "figlet";
import { readFileSync } from "fs";
import { join } from "path";
import stripAnsi from "strip-ansi";
import { appSecrets } from "../config";
import { isDryRun } from "../config/environment";
import { tradeConfig } from "../config/tradeConfig";

const chalk = new Chalk({
  level: process.env.NO_COLOR ? 0 : 3
});

function cols(): number {
  return Math.max(40, process.stdout.columns || 80);
}

function centerPlain(line: string, width: number): string {
  const len = stripAnsi(line).length;
  const pad = Math.max(0, Math.floor((width - len) / 2));
  return " ".repeat(pad) + line;
}

function line(char: string, label: string): string {
  const w = cols();
  const inner = ` ${label} `;
  const repeat = Math.max(3, Math.floor((w - inner.length - 4) / 2));
  const edge = char.repeat(repeat);
  return `${edge}${inner}${edge}`;
}

function readVersion(): string {
  try {
    const pkgPath = join(__dirname, "../../package.json");
    const raw = readFileSync(pkgPath, "utf8");
    const j = JSON.parse(raw) as { version?: string };
    return j.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export function printLuxuryBanner(): void {
  const w = cols();
  console.log();
  let art: string;
  try {
    art = figlet.textSync("POLY COPY", {
      font: "Standard",
      horizontalLayout: "default"
    });
  } catch {
    art = "POLY COPY";
  }
  for (const row of art.split("\n")) {
    console.log(chalk.cyan.bold(centerPlain(row, w)));
  }
  console.log();
  console.log(chalk.cyan(centerPlain("🚀  POLYMARKET COPY BOT ACTIVATED  🚀", w)));
  console.log(chalk.cyan.dim(centerPlain("Made with ❤  for traders", w)));
  console.log(chalk.cyan(centerPlain(`Version: ${readVersion()}`, w)));
  console.log();
  console.log(chalk.gray(line("─", "CONFIGURATION START")));
  const tag = chalk.greenBright("●");
  console.log(`  ${tag} ${chalk.white("Target wallet:")} ${chalk.cyan(appSecrets.targetWallet || "(unset)")}`);
  console.log(`  ${tag} ${chalk.white("Dry run:")} ${chalk.cyan(String(isDryRun()))}`);
  console.log(`  ${tag} ${chalk.white("Sports only:")} ${chalk.cyan(String(tradeConfig.sportsOnly))}`);
  console.log(`  ${tag} ${chalk.white("Signature type:")} ${chalk.cyan(String(tradeConfig.signatureType))}`);
  console.log(`  ${tag} ${chalk.white("Geoblock check:")} ${chalk.cyan(String(tradeConfig.geoblockEnabled))}`);
  console.log(`  ${tag} ${chalk.white("CLOB:")} ${chalk.cyan(tradeConfig.clobHost)}`);
  console.log(chalk.gray(line("─", "RUNTIME")));
  console.log();
}

export function printCopyEngineExplainer(): void {
  const leaderLine =
    tradeConfig.leaderFeed === "clob_user_ws"
      ? "CLOB authenticated user channel (leader’s API key / secret / passphrase)."
      : `Public Data API: GET /activity for TARGET_WALLET, every ${tradeConfig.pollIntervalMs} ms.`;
  const sportsLine = tradeConfig.sportsOnly
    ? "Gamma-backed sports tag; non-sports markets are skipped."
    : "All markets that pass risk checks are eligible.";
  console.log(chalk.gray(line("─", "COPY ENGINE")));
  console.log();
  console.log(chalk.white.bold("  What you are copying"));
  console.log(
    chalk.gray("  Each ") +
      chalk.cyan("copy transaction") +
      chalk.gray(
        " is a signed GTC limit order on Polymarket’s CLOB. It mirrors the leader’s "
      ) +
      chalk.white("BUY or SELL") +
      chalk.gray(", the same ") +
      chalk.white("outcome token") +
      chalk.gray(", and the leader’s ") +
      chalk.white("limit price") +
      chalk.gray(
        ". Notional size is scaled by COPY_RATIO, then clamped between MIN_TRADE_USDC and MAX_TRADE_USDC, with a daily budget cap."
      )
  );
  console.log();
  console.log(chalk.white.bold("  How the leader is observed"));
  console.log(chalk.gray(`  ${leaderLine}`));
  console.log();
  console.log(chalk.white.bold("  How it becomes your trade"));
  console.log(
    chalk.gray(
      "  Raw trade → normalized intent → optional sports filter → risk gates → market validation → "
    ) +
      chalk.cyan("createAndPostOrder") +
      chalk.gray(" (") +
      chalk.dim("@polymarket/clob-client") +
      chalk.gray("). Slippage vs live book must stay within MAX_PRICE_SLIPPAGE_BPS.")
  );
  console.log();
  console.log(chalk.white.bold("  Sports filter"));
  console.log(chalk.gray(`  ${sportsLine}`));
  console.log();
  console.log(chalk.white.bold("  What is not used"));
  console.log(
    chalk.gray(
      "  The leader’s private key. In REST mode, only their public address is required. Proxy / smart-wallet modes use your FUNDER_ADDRESS when configured."
    )
  );
  console.log();
  if (isDryRun()) {
    console.log(chalk.yellow.bold("  Mode: DRY RUN — orders are simulated; nothing is posted to the CLOB."));
  } else {
    console.log(
      chalk.green.bold("  Mode: LIVE — ") +
        chalk.gray("real orders are submitted to ") +
        chalk.cyan(tradeConfig.clobHost)
    );
  }
  console.log();
  console.log(chalk.gray(line("─", "START")));
  console.log();
}

export function printFatalBanner(err: unknown): void {
  console.error();
  console.error(chalk.red.bold(centerPlain("✖  FATAL  ✖", cols())));
  console.error(chalk.red.dim(String(err)));
  console.error();
}
