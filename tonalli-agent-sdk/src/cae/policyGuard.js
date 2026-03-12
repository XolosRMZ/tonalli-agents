"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforcePreflight = enforcePreflight;
const preflightClient_1 = require("./preflightClient");
const policy_1 = require("../types/policy");
async function enforcePreflight(intent) {
    const response = await (0, preflightClient_1.requestPreflight)(intent);
    if (response.decision === "rejected") {
        throw new Error(`\n[MRCL ENFORCEMENT FAIL] Transacción bloqueada por el CAE.\nRazón: ${response.reason}\nTrace ID: ${response.policyTraceId}\n`);
    }
    if (response.decision === "needs_human_approval") {
        throw new Error(`[MRCL PENDING] Se requiere aprobación humana (A0): ${response.reason}`);
    }
    return response;
}
//# sourceMappingURL=policyGuard.js.map