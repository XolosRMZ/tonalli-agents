import { TxIntent } from "../types/policy";
interface SafeSendXecInput {
    toAddress: string;
    amountSats: number;
    reason: string;
    memo?: string;
}
export declare function safeSendXEC(input: SafeSendXecInput): Promise<{
    success: boolean;
    intent: TxIntent;
    preflight: import("../types/policy").PreflightResponse;
    signed: import("./sessionSigner").SignedTxResult;
}>;
export {};
//# sourceMappingURL=safeSendXEC.d.ts.map