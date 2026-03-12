// @ts-ignore
import * as ecashaddr from "ecashaddrjs";

export type ChronikStatusDetail = "ONLINE" | "RESPONDING" | "OFFLINE";

type ChronikUtxoEntry = {
  value?: number | string;
  sats?: number | string;
  token?: unknown;
};

type ChronikBlockchainInfoResponse = {
  tipHash?: string;
  tipHeight?: number;
  blockHeight?: number;
  bestHash?: string;
  network?: string;
  version?: string;
};

export type ChronikStatus = {
  online: boolean;
  detail: ChronikStatusDetail;
  summary: string;
  tipHash: string | null;
  tipHeight: number | null;
  network: string | null;
  version: string | null;
};

export type ChronikAddressBalance = {
  address: string;
  sats: number | null;
  xec: number | null;
  utxoCount: number | null;
  summary: string;
  endpoint: string;
};

const DEFAULT_CHRONIK_API_BASE_URL = "/api/chronik";
const BLOCKCHAIN_INFO_PATH = "/blockchain-info";

function getChronikApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_CHRONIK_API_BASE_URL;

  if (typeof configuredBaseUrl !== "string" || configuredBaseUrl.trim().length === 0) {
    return DEFAULT_CHRONIK_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/$/, "");
}

export function getChronikStatusEndpoint() {
  return `${getChronikApiBaseUrl()}${BLOCKCHAIN_INFO_PATH}`;
}

export function getChronikAddressEndpoint(address: string) {
  const decode = (ecashaddr as any).decode ?? ecashaddr.decodeCashAddress;
  const { type, hash } = decode(address);
  const hashHex = Array.from(hash).map((b: any) => b.toString(16).padStart(2, "0")).join("");
  const scriptType = type.toLowerCase();

  return `${getChronikApiBaseUrl()}/script/${scriptType}/${hashHex}/utxos`;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Chronik request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function normalizeChronikAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function extractChronikUtxos(payload: unknown): ChronikUtxoEntry[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.utxos)) {
    return record.utxos as ChronikUtxoEntry[];
  }

  if (Array.isArray(record.outputs)) {
    return record.outputs as ChronikUtxoEntry[];
  }

  return [];
}

function normalizeAddressBalance(address: string, payload: unknown): ChronikAddressBalance {
  const endpoint = getChronikAddressEndpoint(address);
  const utxos = extractChronikUtxos(payload);

  if (utxos.length === 0) {
    return {
      address,
      sats: null,
      xec: null,
      utxoCount: null,
      summary: "Chronik respondio, pero el endpoint de UTXOs no expuso un arreglo reconocible.",
      endpoint
    };
  }

  const basicUtxos = utxos.filter((utxo) => !utxo.token);
  const sats = basicUtxos.reduce((sum, utxo) => {
    const value = normalizeChronikAmount(utxo.value ?? utxo.sats);

    return value === null ? sum : sum + value;
  }, 0);

  return {
    address,
    sats,
    xec: sats / 100,
    utxoCount: basicUtxos.length,
    summary: `Balance real calculado desde ${basicUtxos.length} UTXO${basicUtxos.length === 1 ? "" : "s"} basico${basicUtxos.length === 1 ? "" : "s"}.`,
    endpoint
  };
}

function normalizeBlockchainInfo(payload: ChronikBlockchainInfoResponse): ChronikStatus {
  const tipHeight =
    typeof payload.tipHeight === "number" ? payload.tipHeight :
    typeof payload.blockHeight === "number" ? payload.blockHeight :
    null;
  const tipHash =
    typeof payload.tipHash === "string" ? payload.tipHash :
    typeof payload.bestHash === "string" ? payload.bestHash :
    null;
  const network = typeof payload.network === "string" ? payload.network : null;
  const version = typeof payload.version === "string" ? payload.version : null;
  const hasChronikSignal = tipHeight !== null || tipHash !== null || network !== null;

  return {
    online: hasChronikSignal,
    detail: hasChronikSignal ? "ONLINE" : "RESPONDING",
    summary: hasChronikSignal
      ? `Chronik ${network ?? "node"} sincronizado${tipHeight !== null ? ` en altura ${tipHeight}` : ""}.`
      : "Chronik reachable, but blockchain-info returned no recognizable fields.",
    tipHash,
    tipHeight,
    network,
    version
  };
}

export async function fetchChronikStatus(signal?: AbortSignal): Promise<ChronikStatus> {
  const payload = await requestJson<ChronikBlockchainInfoResponse>(getChronikStatusEndpoint(), {
    method: "GET",
    signal
  });

  return normalizeBlockchainInfo(payload);
}

export async function checkChronikStatus(signal?: AbortSignal): Promise<ChronikStatus> {
  try {
    return await fetchChronikStatus(signal);
  } catch {
    return {
      online: false,
      detail: "OFFLINE",
      summary: "Chronik no responde por el proxy local.",
      tipHash: null,
      tipHeight: null,
      network: null,
      version: null
    };
  }
}

export async function getAddressBalance(address: string, signal?: AbortSignal): Promise<ChronikAddressBalance> {
  const normalizedAddress = address.trim();

  if (normalizedAddress.length === 0) {
    return {
      address: "",
      sats: null,
      xec: null,
      utxoCount: null,
      summary: "No hay direccion activa configurada para consultar tesoreria.",
      endpoint: `${getChronikApiBaseUrl()}/script/p2pkh/hash160/utxos`
    };
  }

  try {
    const payload = await requestJson<unknown>(getChronikAddressEndpoint(normalizedAddress), {
      method: "GET",
      signal
    });

    return normalizeAddressBalance(normalizedAddress, payload);
  } catch {
    return {
      address: normalizedAddress,
      sats: null,
      xec: null,
      utxoCount: null,
      summary: "Chronik no expuso balance util para la direccion activa por el proxy local.",
      endpoint: (() => {
        try {
          return getChronikAddressEndpoint(normalizedAddress);
        } catch {
          return `${getChronikApiBaseUrl()}/script/unknown/invalid/utxos`;
        }
      })()
    };
  }
}
