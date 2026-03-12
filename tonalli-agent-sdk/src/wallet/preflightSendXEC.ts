import { requestPreflight } from "../cae/preflightClient";
import { env } from "../config/env";
import type { TxIntent } from "../types/policy";

interface PreflightSendXecInput {
  toAddress: string;
  amountSats: number;
  reason: string;
  memo?: string;
}

export async function preflightSendXEC(input: PreflightSendXecInput) {
  const intent: TxIntent = {
    agentId: env.AGENT_ID,
    agentRole: env.AGENT_ROLE,
    fromAddress: env.AGENT_WALLET,
    toAddress: input.toAddress,
    amountSats: input.amountSats,
    reason: input.reason,
    memo: input.memo,
    timestamp: new Date().toISOString()
  };

  const preflight = await requestPreflight(intent);

  return {
    success: preflight.decision === "approved",
    intent,
    preflight
  };
}
