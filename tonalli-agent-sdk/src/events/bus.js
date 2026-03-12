"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topics = exports.bus = void 0;
exports.emitEvent = emitEvent;
exports.onEvent = onEvent;
const eventemitter3_1 = __importDefault(require("eventemitter3"));
exports.bus = new eventemitter3_1.default();
exports.Topics = {
    BALANCE_LOW: "treasury.balance_low",
    TX_SIGNED: "treasury.tx.approved_and_signed",
    POLICY_REJECTED: "policy.rejected"
};
function emitEvent(topic, payload) {
    exports.bus.emit(topic, payload);
}
function onEvent(topic, handler) {
    exports.bus.on(topic, handler);
}
//# sourceMappingURL=bus.js.map