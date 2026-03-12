/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAE_API_BASE_URL?: string;
  readonly VITE_CHRONIK_API_BASE_URL?: string;
  readonly VITE_TONALLI_TREASURY_ADDRESS?: string;
  readonly VITE_TREASURY_LOW_THRESHOLD_SATS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

