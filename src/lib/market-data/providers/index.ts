import { INITIAL_MARKET_INDICATOR_REGISTRY } from "@/lib/financial-registry";
import { bpsAdapter, BpsProviderAdapter } from "@/lib/market-data/providers/bps";
import {
  createProviderError,
  DEFAULT_MAX_TRANSIENT_RETRIES,
  DEFAULT_PROVIDER_TIMEOUT_MS,
  executeProviderJsonGet,
  INDICATOR_PROVIDER_MATRIX,
  normalizeDecimalObservationValue,
  parseProviderObservationDate,
  PROVIDER_CONFIGS,
  readServerEnv,
  redactProviderSecrets,
  verifyMappingCurrencyAndUnit,
} from "@/lib/market-data/providers/config";
import type {
  IndicatorProviderMapping,
  MarketDataProviderAdapter,
  NormalizedIndicatorObservation,
  ProviderErrorCode,
  ProviderErrorDetail,
  ProviderExecutionContext,
  ProviderFetchResult,
  ProviderId,
  ProviderReadinessStatus,
  SupportedIndicatorCode,
} from "@/lib/market-data/providers/contracts";
import {
  frankfurterAdapter,
  FrankfurterProviderAdapter,
} from "@/lib/market-data/providers/frankfurter";
import {
  fredAdapter,
  FredProviderAdapter,
  FRED_API_KEY_SETUP_URL,
  FRED_LEGAL_URL,
  FRED_REQUIRED_LEGAL_NOTICE,
  FRED_SERIES_SPECIFICATIONS,
  FRED_TERMS_OF_USE_URL,
  type FredSeriesSpecification,
} from "@/lib/market-data/providers/fred";
import {
  twelveDataAdapter,
  TwelveDataProviderAdapter,
} from "@/lib/market-data/providers/twelve-data";

/**
 * PHASE 3C-2 — PROVIDER ADAPTER FOUNDATION INDEX
 *
 * Central registry of server-only market data provider adapters.
 * Zero network requests or database writes occur when this module is imported.
 */

export const PROVIDER_ADAPTERS: Readonly<
  Record<ProviderId, MarketDataProviderAdapter>
> = {
  frankfurter: frankfurterAdapter,
  fred: fredAdapter,
  bps: bpsAdapter,
  twelve_data: twelveDataAdapter,
};

export function getProviderAdapter(providerId: ProviderId): MarketDataProviderAdapter {
  return PROVIDER_ADAPTERS[providerId];
}

export function getIndicatorProviderMapping(
  code: SupportedIndicatorCode
): IndicatorProviderMapping {
  return INDICATOR_PROVIDER_MATRIX[code];
}

export function getAdapterForIndicator(
  code: SupportedIndicatorCode
): MarketDataProviderAdapter | null {
  const mapping = INDICATOR_PROVIDER_MATRIX[code];
  if (!mapping || !mapping.providerId) return null;
  return PROVIDER_ADAPTERS[mapping.providerId] ?? null;
}

/**
 * Verifies that every indicator's frequency, unit, currency, timezone, and freshness SLA
 * in `INDICATOR_PROVIDER_MATRIX` matches `INITIAL_MARKET_INDICATOR_REGISTRY`.
 */
export function verifyProviderRegistryAlignment(): {
  ok: boolean;
  mismatches: string[];
} {
  const mismatches: string[] = [];

  for (const regItem of INITIAL_MARKET_INDICATOR_REGISTRY) {
    const code = regItem.code as SupportedIndicatorCode;
    const mapping = INDICATOR_PROVIDER_MATRIX[code];
    if (!mapping) {
      mismatches.push(`Missing provider matrix entry for registry code "${code}".`);
      continue;
    }

    if (mapping.unit !== regItem.unit) {
      mismatches.push(
        `${code}: unit mismatch (matrix=${mapping.unit}, registry=${regItem.unit})`
      );
    }
    if (mapping.currency !== regItem.currency) {
      mismatches.push(
        `${code}: currency mismatch (matrix=${mapping.currency}, registry=${regItem.currency})`
      );
    }
    if (mapping.timezone !== regItem.marketTimezone) {
      mismatches.push(
        `${code}: timezone mismatch (matrix=${mapping.timezone}, registry=${regItem.marketTimezone})`
      );
    }
    if (mapping.frequency !== regItem.updateFrequency) {
      mismatches.push(
        `${code}: frequency mismatch (matrix=${mapping.frequency}, registry=${regItem.updateFrequency})`
      );
    }
    if (mapping.freshnessSlaSeconds !== regItem.freshnessSlaSeconds) {
      mismatches.push(
        `${code}: freshnessSlaSeconds mismatch (matrix=${mapping.freshnessSlaSeconds}, registry=${regItem.freshnessSlaSeconds})`
      );
    }
  }

  return {
    ok: mismatches.length === 0,
    mismatches,
  };
}

export {
  bpsAdapter,
  BpsProviderAdapter,
  createProviderError,
  DEFAULT_MAX_TRANSIENT_RETRIES,
  DEFAULT_PROVIDER_TIMEOUT_MS,
  executeProviderJsonGet,
  frankfurterAdapter,
  FrankfurterProviderAdapter,
  fredAdapter,
  FredProviderAdapter,
  FRED_API_KEY_SETUP_URL,
  FRED_LEGAL_URL,
  FRED_REQUIRED_LEGAL_NOTICE,
  FRED_SERIES_SPECIFICATIONS,
  FRED_TERMS_OF_USE_URL,
  INDICATOR_PROVIDER_MATRIX,
  normalizeDecimalObservationValue,
  parseProviderObservationDate,
  PROVIDER_CONFIGS,
  readServerEnv,
  redactProviderSecrets,
  twelveDataAdapter,
  TwelveDataProviderAdapter,
  verifyMappingCurrencyAndUnit,
};

export type {
  FredSeriesSpecification,
  IndicatorProviderMapping,
  MarketDataProviderAdapter,
  NormalizedIndicatorObservation,
  ProviderErrorCode,
  ProviderErrorDetail,
  ProviderExecutionContext,
  ProviderFetchResult,
  ProviderId,
  ProviderReadinessStatus,
  SupportedIndicatorCode,
};
