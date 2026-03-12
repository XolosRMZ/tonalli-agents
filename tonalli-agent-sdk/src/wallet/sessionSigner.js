"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signApprovedIntent = signApprovedIntent;
const policy_1 = require("../types/policy");
async function signApprovedIntent(intent) {
    console.log(`[SIGNER] Firmando transacción aprobada hacia ${intent.toAddress}...`);
    return {
        txHex: `signed_mock_tx_for_${intent.toAddress}_${intent.amountSats}`,
        txidPreview: `mock_txid_${Date.now()}`
    };
}
//# sourceMappingURL=sessionSigner.js.map