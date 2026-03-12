"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const safeSendXEC_1 = require("../src/wallet/safeSendXEC");
const bus_1 = require("../src/events/bus");
const env_1 = require("../src/config/env");
// Escuchamos los eventos como si fuéramos el Orchestrator
(0, bus_1.onEvent)(bus_1.Topics.TX_SIGNED, (data) => console.log("🟢 EVENTO RECIBIDO: Transacción Firmada", data));
(0, bus_1.onEvent)(bus_1.Topics.POLICY_REJECTED, (data) => console.log("🔴 EVENTO RECIBIDO: Violación de Política", data));
async function main() {
    console.log(`\n--- Prueba 1: Pago Constitucional (Límite: ${env_1.env.AGENT_DAILY_LIMIT_SATS} sats) ---`);
    try {
        const result = await (0, safeSendXEC_1.safeSendXEC)({
            toAddress: "ecash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
            amountSats: 10000, // Dentro del límite
            reason: "Pago de servidor VPS",
            memo: "Infraestructura xNS"
        });
        console.log("✅ RESULTADO:", result.preflight.decision);
    }
    catch (error) {
        console.error(error.message);
    }
    console.log(`\n--- Prueba 2: Intento de Gasto Malicioso ---`);
    try {
        // Intentamos gastar 200,000,000 (Supera el límite de 100,000,000 del .env)
        const badResult = await (0, safeSendXEC_1.safeSendXEC)({
            toAddress: "ecash:q_hacker_wallet",
            amountSats: 200000000,
            reason: "Drenar tesorería",
        });
    }
    catch (error) {
        console.error(error.message);
    }
}
main();
//# sourceMappingURL=safe-send.js.map