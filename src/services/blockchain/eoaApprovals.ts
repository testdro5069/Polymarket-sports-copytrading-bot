import { getContractConfig } from "@polymarket/clob-client";
import { BigNumber, Contract, constants } from "ethers";
import type { Wallet } from "ethers";
import { logger } from "../../utils/logger";

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const ERC1155_ABI = [
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address account, address operator) view returns (bool)"
];

const MIN_APPROVAL = BigNumber.from(10).pow(30);

const done = new Set<string>();

export async function ensureEoaOnchainApprovals(wallet: Wallet, chainId: number): Promise<void> {
  const key = `${chainId}:${wallet.address.toLowerCase()}`;
  if (done.has(key)) return;

  const cfg = getContractConfig(chainId);
  const usdc = new Contract(cfg.collateral, ERC20_ABI, wallet);
  const ctf = new Contract(cfg.conditionalTokens, ERC1155_ABI, wallet);

  const usdcSpenders = [
    cfg.conditionalTokens,
    cfg.exchange,
    cfg.negRiskExchange,
    cfg.negRiskAdapter
  ];

  for (const spender of usdcSpenders) {
    const allowance = await usdc.allowance(wallet.address, spender);
    if (allowance.gte(MIN_APPROVAL)) continue;
    logger.info({ spender, chainId }, "eoa: approving USDC allowance");
    const tx = await usdc.approve(spender, constants.MaxUint256);
    await tx.wait();
  }

  const operators = [cfg.exchange, cfg.negRiskExchange, cfg.negRiskAdapter];
  for (const operator of operators) {
    const ok = await ctf.isApprovedForAll(wallet.address, operator);
    if (ok) continue;
    logger.info({ operator, chainId }, "eoa: setApprovalForAll outcome tokens");
    const tx = await ctf.setApprovalForAll(operator, true);
    await tx.wait();
  }

  done.add(key);
}
