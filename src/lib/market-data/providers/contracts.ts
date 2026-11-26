import type { FinancialUnit, UpdateFrequency } from "@/db/schema";
import type { SupportedCurrency } from "@/lib/financial-engine";

/**
 * PHASE 3C-2 — MARKET DATA PROVIDER ADAPTER CONTRACTS
 *
 * Server-only contracts for external market and macroeconomic data providers.
 * Guarantees consistent provenance, strict unit/currency typing, decimal preservation,
 * and structured error classification without database side effects.
 */

export type ProviderId = "frankfurter" | "fred" | "bps" | "twelve_data";

export type SupportedIndicatorCode =
  | "XAU_USD"
  | "ANTAM_1G_IDR"
  | "USD_IDR"
  | "IHSG"
  | "BI_RATE"
  | "SBN_10Y"
  | "ID_CPI_YOY"
  | "ID_GDP"
  | "FED_FUNDS"
  | "US_10Y";

export type ProviderReadinessStatus =
  | "ready"
  | "ready_with_key"
  | "blocked"
  | "disabled"
  | "pending_license_review"
  | "editor_verified"
  | "derived_code";

export type ProviderErrorCode =
  | "PROVIDER_DISABLED"
  | "PROVIDER_BLOCKED"
  | "MISSING_API_KEY"
  | "UNSUPPORTED_INDICATOR"
  | "TIMEOUT"
  | "HTTP_UNAUTHORIZED"
  | "HTTP_FORBIDDEN"
  | "HTTP_RATE_LIMITED"
  | "HTTP_CLIENT_ERROR"
  | "HTTP_UPSTREAM_ERROR"
  | "NETWORK_ERROR"
  | "MALFORMED_RESPONSE"
  | "EMPTY_RESPONSE"
  | "NO_RECENT_OBSERVATION"
  | "INVALID_NUMERIC_VALUE"
  | "INVALID_OBSERVATION_DATE"
  | "CURRENCY_UNIT_MISMATCH";

export interface NormalizedIndicatorObservation {
  indicatorCode: SupportedIndicatorCode;
  /**
   * Canonical decimal string preserving exact provider precision (compatible with PostgreSQL `numeric(20, 6)`).
   * Never rounded arbitrarily and never converted from NULL to "0".
   */
  value: string;
  /**
   * Parsed finite number for deterministic validation and in-memory comparison.
   */
  numericValue: number;
  unit: FinancialUnit;
  currency: SupportedCurrency;
  /**
   * ISO-8601 timestamp representing the upstream market/statistical observation date.
   */
  observedAt: string;
  /**
   * ISO-8601 timestamp when the adapter fetched and normalized the payload.
   */
  fetchedAt: string;
  sourceName: string;
  sourceUrl: string;
  providerId: ProviderId;
  timezone: string;
  frequency: UpdateFrequency;
  attributionText: string;
  methodology?: string;
}

export interface ProviderErrorDetail {
  code: ProviderErrorCode;
  providerId: ProviderId;
  indicatorCode?: SupportedIndicatorCode;
  /**
   * Sanitized human-readable message with all API keys, tokens, and secrets redacted.
   */
  message: string;
  httpStatus?: number;
  /**
   * True ONLY for transient upstream failures (5xx, timeout, transient socket error).
   * False for 401, 403, 429, disabled/blocked status, missing key, or schema/validation errors.
   */
  retriable: boolean;
}

export type ProviderFetchResult =
  | {
      ok: true;
      observation: NormalizedIndicatorObservation;
    }
  | {
      ok: false;
      error: ProviderErrorDetail;
    };

export interface IndicatorProviderMapping {
  indicatorCode: SupportedIndicatorCode;
  providerId: ProviderId | null;
  externalSeriesId: string | null;
  sourceName: string;
  sourceUrl: string;
  unit: FinancialUnit;
  currency: SupportedCurrency;
  timezone: string;
  frequency: UpdateFrequency;
  freshnessSlaSeconds: number;
  readinessStatus: ProviderReadinessStatus;
  requiresApiKey: boolean;
  apiKeyEnvVar: string | null;
  commercialDisplayAllowed: boolean;
  attributionText: string;
  methodology: string;
  statusReason?: string;
}

export interface ProviderExecutionContext {
  /**
   * Custom fetch implementation (used for unit testing without live network access).
   */
  fetchImpl?: typeof fetch;
  /**
   * Optional environment variable map override for isolated testing.
   */
  env?: Record<string, string | undefined>;
  /**
   * Request timeout in milliseconds (defaults to 8000ms).
   */
  timeoutMs?: number;
  /**
   * Maximum retry count for transient failures only (defaults to 1).
   */
  maxRetries?: number;
  /**
   * Reference current time for deterministic `fetchedAt` and staleness/future-date validation.
   */
  now?: Date;
  /**
   * Maximum allowed age (in days) for an observation to be accepted as current.
   */
  maxObservationAgeDays?: number;
}

export interface MarketDataProviderAdapter {
  readonly providerId: ProviderId;
  readonly displayName: string;
  readonly readinessStatus: ProviderReadinessStatus;
  readonly requiresApiKey: boolean;
  readonly apiKeyEnvVar: string | null;
  readonly supportedIndicators: ReadonlyArray<SupportedIndicatorCode>;

  getIndicatorMapping(code: SupportedIndicatorCode): IndicatorProviderMapping | null;

  fetchIndicator(
    code: SupportedIndicatorCode,
    ctx?: ProviderExecutionContext
  ): Promise<ProviderFetchResult>;

  normalizeResponse(
    code: SupportedIndicatorCode,
    rawPayload: unknown,
    ctx?: {
      now?: Date;
      maxObservationAgeDays?: number;
      expectedUnit?: FinancialUnit;
      expectedCurrency?: SupportedCurrency;
    }
  ): ProviderFetchResult;
}
