/**
 * Shared server-safe utility for deterministic Antam physical gold pricing,
 * tax calculation (+PPh 22 0.25%), buyback estimation, and Asia/Jakarta (WIB) date formatting.
 * Ensures identical inputs produce identical outputs across /, /calculator, and /studio.
 */

export const DEFAULT_ANTAM_1G_IDR = 2725000;
export const DEFAULT_GOLD_SPOT_USD = 2685.4;
export const DEFAULT_USD_IDR_RATE = 15845;
export const TROY_OUNCE_GRAMS = 31.1034768;
export const ANTAM_MINTING_PREMIUM = 1.05;
export const ANTAM_PPH22_TAX_RATE = 0.0025;
export const ANTAM_BUYBACK_RATIO = 0.945;

export interface AntamTierSpec {
  label: string;
  weight: number;
  multiplier: number;
}

export const ANTAM_ALL_TIERS: AntamTierSpec[] = [
  { label: "0.5 gr", weight: 0.5, multiplier: 1.0367 },
  { label: "1 gr", weight: 1, multiplier: 1.0 },
  { label: "2 gr", weight: 2, multiplier: 0.989 },
  { label: "3 gr", weight: 3, multiplier: 0.9859 },
  { label: "5 gr", weight: 5, multiplier: 0.9835 },
  { label: "10 gr", weight: 10, multiplier: 0.9815 },
  { label: "25 gr", weight: 25, multiplier: 0.9796 },
  { label: "50 gr", weight: 50, multiplier: 0.979 },
  { label: "100 gr", weight: 100, multiplier: 0.9788 },
  { label: "250 gr", weight: 250, multiplier: 0.9784 },
  { label: "500 gr", weight: 500, multiplier: 0.9782 },
  { label: "1000 gr", weight: 1000, multiplier: 0.9782 },
];

export const ANTAM_SUMMARY_TIERS: AntamTierSpec[] = ANTAM_ALL_TIERS.filter((t) =>
  [0.5, 1, 5, 10, 50, 100].includes(t.weight)
);

/**
 * Estimates 1-gram Antam retail price in IDR from spot XAU/USD and USD/IDR rate.
 */
export function estimateAntam1gFromSpotUsd(
  spotUsd: number,
  usdIdrRate: number = DEFAULT_USD_IDR_RATE
): number {
  if (!Number.isFinite(spotUsd) || spotUsd <= 0) return DEFAULT_ANTAM_1G_IDR;
  const rawPerGram = (spotUsd / TROY_OUNCE_GRAMS) * usdIdrRate * ANTAM_MINTING_PREMIUM;
  return Math.round(rawPerGram);
}

/**
 * Normalizes a raw 1-gram Antam price (from database string/number or fallback)
 * to a canonical integer Rupiah value so all pages compute from the exact same base.
 */
export function normalizeAntam1gPrice(
  rawAntamPriceIdr: string | number | null | undefined,
  fallbackSpotUsd?: string | number | null
): number {
  if (rawAntamPriceIdr !== null && rawAntamPriceIdr !== undefined && rawAntamPriceIdr !== "") {
    const parsed =
      typeof rawAntamPriceIdr === "number" ? rawAntamPriceIdr : parseFloat(String(rawAntamPriceIdr));
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.round(parsed);
    }
  }
  if (fallbackSpotUsd !== null && fallbackSpotUsd !== undefined && fallbackSpotUsd !== "") {
    const parsedUsd =
      typeof fallbackSpotUsd === "number" ? fallbackSpotUsd : parseFloat(String(fallbackSpotUsd));
    if (Number.isFinite(parsedUsd) && parsedUsd > 0) {
      return estimateAntam1gFromSpotUsd(parsedUsd);
    }
  }
  return DEFAULT_ANTAM_1G_IDR;
}

export interface AntamTierPricing {
  unit1g: number;
  basePrice: number;
  taxPrice: number;
  effectivePerGram: number;
  buybackEstimate: number;
}

/**
 * Deterministically computes base price, +PPh 22 (0.25%) price, effective price/gram,
 * and buyback estimate for any Antam weight and tier multiplier.
 */
export function calculateAntamTierPricing(
  antam1gPrice: number,
  weight: number,
  multiplier: number = 1.0
): AntamTierPricing {
  const unit1g =
    Number.isFinite(antam1gPrice) && antam1gPrice > 0
      ? Math.round(antam1gPrice)
      : DEFAULT_ANTAM_1G_IDR;
  const safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 1;
  const safeMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1.0;

  const basePrice = Math.round(unit1g * safeWeight * safeMultiplier);
  const taxPrice = Math.round(basePrice * (1 + ANTAM_PPH22_TAX_RATE));
  const effectivePerGram = Math.round(taxPrice / safeWeight);
  const buybackEstimate = Math.round(unit1g * ANTAM_BUYBACK_RATIO * safeWeight);

  return {
    unit1g,
    basePrice,
    taxPrice,
    effectivePerGram,
    buybackEstimate,
  };
}

/**
 * Deterministic Asia/Jakarta (WIB) date & time formatters to prevent SSR/Client hydration mismatches.
 */
export function formatWibDateTime(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function formatWibTimeOnly(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}
