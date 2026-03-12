import { TxIntent } from "../types/policy";
export interface SignedTxResult {
    txHex: string;
    txidPreview: string;
}
export declare function signApprovedIntent(intent: TxIntent): Promise<SignedTxResult>;
//# sourceMappingURL=sessionSigner.d.ts.map