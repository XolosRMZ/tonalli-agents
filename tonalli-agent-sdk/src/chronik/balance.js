"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = getBalance;
const chronikClient_1 = require("./chronikClient");
async function getBalance(address) {
    const { data } = await chronikClient_1.chronikClient.get(`/address/${address}/utxos`);
    const sats = data.utxos
        .filter((u) => !u.token)
        .reduce((sum, u) => sum + u.value, 0);
    return {
        address,
        sats,
        xec: sats / 100
    };
}
//# sourceMappingURL=balance.js.map