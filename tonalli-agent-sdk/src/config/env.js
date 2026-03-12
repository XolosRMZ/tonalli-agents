"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const EnvSchema = zod_1.z.object({
    CHRONIK_URL: zod_1.z.string(),
    CAE_PREFLIGHT_URL: zod_1.z.string(),
    AGENT_ID: zod_1.z.string(),
    AGENT_ROLE: zod_1.z.string(),
    AGENT_WALLET: zod_1.z.string(),
    AGENT_DAILY_LIMIT_SATS: zod_1.z.coerce.number()
});
exports.env = EnvSchema.parse(process.env);
//# sourceMappingURL=env.js.map