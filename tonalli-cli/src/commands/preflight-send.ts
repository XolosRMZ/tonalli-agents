import { Command } from "commander";
import { preflightSendXEC } from "@xolosarmy/tonalli-agent-sdk";

export const preflightSendCmd = new Command("preflight-send")
  .description("Evalua una intencion de envio contra el CAE sin firmar la transaccion")
  .requiredOption("-t, --to <address>", "Direccion destino")
  .requiredOption("-a, --amount <sats>", "Cantidad en sats", parseInt)
  .requiredOption("-r, --reason <text>", "Justificacion constitucional de la transaccion")
  .option("-m, --memo <text>", "Memo opcional")
  .action(async (options) => {
    console.log("\n⚖️  Sometiendo intencion de pago al Tribunal CAE...");
    console.log(`   Destino: ${options.to}`);
    console.log(`   Monto:   ${options.amount} sats`);
    console.log(`   Motivo:  "${options.reason}"\n`);

    try {
      const result = await preflightSendXEC({
        toAddress: options.to,
        amountSats: options.amount,
        reason: options.reason,
        memo: options.memo
      });

      console.log(`✅ [DICTAMEN: ${result.preflight.decision.toUpperCase()}]`);
      console.log(`   Razon:    ${result.preflight.reason}`);

      if (result.preflight.policyTraceId) {
        console.log(`   Trace ID: ${result.preflight.policyTraceId}`);
      }

      console.log("");
    } catch (e: any) {
      console.error(e.message);
      process.exit(1);
    }
  });
