import axios from "axios";
import { env } from "../config/env";
import type { TxIntent, PreflightResponse } from "../types/policy";

const client = axios.create({
  baseURL: env.CAE_PREFLIGHT_URL,
  timeout: 10000
});

export async function requestPreflight(intent: TxIntent): Promise<PreflightResponse> {
  try {
    const { data, status } = await client.post("", intent);

    if (status < 200 || status >= 300 || !data || typeof data !== "object") {
      throw new Error("Invalid HTTP response from CAE preflight endpoint");
    }

    return data as PreflightResponse;
  } catch (error: any) {
    const details = error?.response?.data
      ? JSON.stringify(error.response.data)
      : error?.message ?? "Unknown error";

    throw new Error(`[CAE PREFLIGHT ERROR] ${details}`);
  }
}
