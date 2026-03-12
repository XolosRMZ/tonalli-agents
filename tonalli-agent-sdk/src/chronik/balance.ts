// @ts-ignore
import * as ecashaddr from "ecashaddrjs";
import { chronikClient } from "./chronikClient";

export async function getBalance(address: string) {
  try {
    const decode = (ecashaddr as any).decode ?? ecashaddr.decodeCashAddress;
    const { type, hash } = decode(address);
    const hashHex = Array.from(hash).map((b: any) => b.toString(16).padStart(2, "0")).join("");
    const scriptType = type.toLowerCase();
    const { data } = await chronikClient.get(`/script/${scriptType}/${hashHex}/utxos`, {
      headers: {
        Accept: "application/json"
      }
    });

    const utxos = Array.isArray(data?.utxos) ? data.utxos : [];
    const sats = utxos
      .filter((u: any) => !u?.token)
      .reduce((sum: number, u: any) => {
        const value = u?.sats ?? u?.value;
        const normalizedValue = typeof value === "number" ? value : Number(value);

        return Number.isFinite(normalizedValue) ? sum + normalizedValue : sum;
      }, 0);

    return {
      address,
      sats,
      xec: sats / 100
    };
  } catch {
    return {
      address,
      sats: 0,
      xec: 0
    };
  }
}
