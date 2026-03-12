export const activeIdentity = {
  name: "human-a0-fernando",
  role: "admin",
  origin: "local operator context",
  treasuryAddress:
    typeof import.meta.env.VITE_TONALLI_TREASURY_ADDRESS === "string" &&
    import.meta.env.VITE_TONALLI_TREASURY_ADDRESS.trim().length > 0
      ? import.meta.env.VITE_TONALLI_TREASURY_ADDRESS.trim()
      : null
} as const;
