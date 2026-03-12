"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPreflight = requestPreflight;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const policy_1 = require("../types/policy");
const client = axios_1.default.create({
    baseURL: env_1.env.CAE_PREFLIGHT_URL,
    timeout: 10000
});
async function requestPreflight(intent) {
    try {
        // Aquí simulamos la llamada HTTP para este MVP.
        // En producción, descomenta la siguiente línea:
        // const { data } = await client.post("", intent);
        // return data;
        console.log(`[CAE PREFLIGHT] Evaluando intent de ${intent.agentId} por ${intent.amountSats} sats...`);
        // MOCK DEL CAE PARA PRUEBAS: Si supera el límite diario, falla.
        if (intent.amountSats > env_1.env.AGENT_DAILY_LIMIT_SATS) {
            return {
                decision: "rejected",
                reason: `Monto (${intent.amountSats}) supera el límite diario del agente (${env_1.env.AGENT_DAILY_LIMIT_SATS})`,
                policyTraceId: `cae_mock_${Date.now()}`
            };
        }
        return {
            decision: "approved",
            reason: "Within A2/A3 policy threshold",
            policyTraceId: `cae_mock_${Date.now()}`
        };
    }
    catch (error) {
        console.error("[CAE PREFLIGHT] Error al consultar el Tribunal:", error);
        throw error;
    }
}
//# sourceMappingURL=preflightClient.js.map