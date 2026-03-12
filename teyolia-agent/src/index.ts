import dotenv from "dotenv";
import path from "path";
import { generateFundingRFC, hasRecentDraft } from "./drafter";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const GREEN = "\u001b[32m";
const RED = "\u001b[31m";
const RESET = "\u001b[0m";

interface TeyoliaConfig {
  chronikUrl: string;
  treasuryAddress: string;
  treasuryLowThresholdSats: number;
  agentId: string;
  agentRole: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function loadConfig(): TeyoliaConfig {
  return {
    chronikUrl: requireEnv("CHRONIK_URL"),
    treasuryAddress: requireEnv("TREASURY_ADDRESS"),
    treasuryLowThresholdSats: Number(requireEnv("TREASURY_LOW_THRESHOLD_SATS")),
    agentId: requireEnv("AGENT_ID"),
    agentRole: requireEnv("AGENT_ROLE")
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function applySdkCompatibilityEnv(config: TeyoliaConfig): void {
  process.env.CHRONIK_URL = config.chronikUrl;
  process.env.AGENT_ID = config.agentId;
  process.env.AGENT_ROLE = config.agentRole;

  // The current SDK validates a broader env contract on import.
  process.env.CAE_PREFLIGHT_URL ??= "http://127.0.0.1:0";
  process.env.AGENT_WALLET ??= config.treasuryAddress;
  process.env.AGENT_DAILY_LIMIT_SATS ??= String(config.treasuryLowThresholdSats);
}

export async function runTeyoliaScan(): Promise<void> {
  const config = loadConfig();
  applySdkCompatibilityEnv(config);

  const { getBalance } = await import("@xolosarmy/tonalli-agent-sdk");
  const balance = await getBalance(config.treasuryAddress);

  if (balance.sats > config.treasuryLowThresholdSats) {
    console.log(`${GREEN}[TEYOLIA] Reservas estables. No se requiere accion.${RESET}`);
    return;
  }

  console.log(`${RED}[TEYOLIA] ALERTA: Reservas por debajo del umbral operativo.${RESET}`);

  const activeDraftPath = hasRecentDraft();

  if (activeDraftPath) {
    console.log(`[TEYOLIA] Existing funding RFC already active: ${activeDraftPath}`);
    return;
  }

  const draftPath = generateFundingRFC(
    balance.sats,
    config.treasuryLowThresholdSats,
    config.treasuryAddress
  );

  console.log(`[TEYOLIA] RFC generado en: ${draftPath}`);
}

runTeyoliaScan().catch((error: unknown) => {
  const config = {
    agentId: process.env.AGENT_ID ?? "teyolia-funding-agent",
    agentRole: process.env.AGENT_ROLE ?? "a2_agent",
    chronikUrl: process.env.CHRONIK_URL ?? "unknown"
  };

  console.error(
    `${RED}[TEYOLIA] Scan fallido (${config.agentId}/${config.agentRole}) via ${config.chronikUrl}: ${getErrorMessage(error)}${RESET}`
  );
  process.exitCode = 1;
});
