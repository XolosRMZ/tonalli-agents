const DEFAULT_TREASURY_LOW_THRESHOLD_SATS = 1_000_000;

function parseTreasuryLowThreshold(rawValue: unknown) {
  if (typeof rawValue !== "string") {
    return DEFAULT_TREASURY_LOW_THRESHOLD_SATS;
  }

  const normalizedValue = rawValue.trim();

  if (normalizedValue.length === 0) {
    return DEFAULT_TREASURY_LOW_THRESHOLD_SATS;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return DEFAULT_TREASURY_LOW_THRESHOLD_SATS;
  }

  return Math.floor(parsedValue);
}

export const treasuryConfig = {
  lowThresholdSats: parseTreasuryLowThreshold(import.meta.env.VITE_TREASURY_LOW_THRESHOLD_SATS)
} as const;

