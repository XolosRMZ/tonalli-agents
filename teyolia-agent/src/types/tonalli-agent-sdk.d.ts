declare module "@xolosarmy/tonalli-agent-sdk" {
  export interface BalanceResult {
    address: string;
    sats: number;
    xec: number;
  }

  export function getBalance(address: string): Promise<BalanceResult>;
}
