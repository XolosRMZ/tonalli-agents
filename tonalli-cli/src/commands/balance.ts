import { Command } from "commander";
import { getBalance } from "@xolosarmy/tonalli-agent-sdk";

export const balanceCmd = new Command("balance")
  .description("Consulta el balance de tu wallet en la infraestructura soberana")
  .action(async () => {
    const address = process.env.AGENT_WALLET || "";
    if (!address) {
      console.error("❌ Error: AGENT_WALLET no definido en .env");
      process.exit(1);
    }

    console.log("📡 Consultando Chronik Node...");
    try {
      const bal = await getBalance(address);
      console.log(`\n🐕 Balance de [ ${address} ]:`);
      console.log(`   ${bal.xec} XEC (${bal.sats} sats)\n`);
    } catch (e: any) {
      console.error("❌ Error consultando balance:", e.message);
      process.exit(1);
    }
  });
