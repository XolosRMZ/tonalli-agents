"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const balance_1 = require("../src/chronik/balance");
const env_1 = require("../src/config/env");
async function main() {
    const balance = await (0, balance_1.getBalance)(env_1.env.AGENT_WALLET);
    console.log(balance);
}
main();
//# sourceMappingURL=balance.js.map