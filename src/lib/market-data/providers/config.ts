import type { FinancialUnit } from "@/db/schema";
import {
  validateCurrencyAndUnit,
  type SupportedCurrency,
} from "@/lib/financial-engine";
import type {
  IndicatorProviderMapping,
  ProviderErrorCode,
  ProviderErrorDetail,
  ProviderExecutionContext,
  ProviderId,
  ProviderReadinessStatus,
  SupportedIndicatorCode,
} from "@/lib/market-data/providers/contracts";

/**
 * PHASE 3C-2 — PROVIDER CONFIGURATION, SECURITY REDACTION & HTTP EXECUTION LAYER
 *
 * Server-only configuration and network safeguards:
 * - Reads credentials strictly from server environment variables (`process.env` or injected test `ctx.env`).
 * - Redacts API keys, tokens, and secrets from all error messages and URLs.
 * - Enforces request timeouts and bounded retries (never retrying 401, 403, 429, or permanent errors).
 * - Preserves decimal precision without turning NULL into zero.
 */

export const DEFAULT_PROVIDER_TIMEOUT_MS = 8000;
export const DEFAULT_MAX_TRANSIENT_RETRIES = 1;

export interface ProviderStaticConfig {
  providerId: ProviderId;
  displayName: string;
  baseUrlEnvVar?: string;
  defaultBaseUrl: string;
  requiresApiKey: boolean;
  apiKeyEnvVar: string | null;
  readinessStatus: ProviderReadinessStatus;
  enabled: boolean;
  commercialDisplayAllowed: boolean;
  rateLimitSummary: string;
  licenseNotes: string;
}

export const PROVIDER_CONFIGS: Readonly<Record<ProviderId, ProviderStaticConfig>> = {
  frankfurter: {
    providerId: "frankfurter",
    displayName: "Frankfurter API v2 (ECB Reference Rates)",
    baseUrlEnvVar: "FRANKFURTER_API_BASE_URL",
    defaultBaseUrl: "https://api.frankfurter.dev/v2",
    requiresApiKey: false,
    apiKeyEnvVar: null,
    readinessStatus: "ready",
    enabled: true,
    commercialDisplayAllowed: true,
    rateLimitSummary: "Fair-use public endpoint; daily working-day reference updates (~16:00 CET)",
    licenseNotes:
      "Open-source service over public European Central Bank reference rates. Commercial use permitted. Must be presented as a daily reference exchange rate, not official Bank Indonesia JISDOR.",
  },
  fred: {
    providerId: "fred",
    displayName: "Federal Reserve Economic Data (FRED API)",
    defaultBaseUrl: "https://api.stlouisfed.org/fred",
    requiresApiKey: true,
    apiKeyEnvVar: "FRED_API_KEY",
    readinessStatus: "ready_with_key",
    enabled: true,
    commercialDisplayAllowed: true,
    rateLimitSummary: "~120 requests/minute per registered FRED API key",
    licenseNotes:
      "Federal Reserve Board H.15 statistical release series (DFF, DGS10) are U.S. Government public domain works (Citation Required). Must display FRED source citation and non-endorsement disclaimer.",
  },
  bps: {
    providerId: "bps",
    displayName: "Badan Pusat Statistik (BPS RI) WebAPI",
    defaultBaseUrl: "https://webapi.bps.go.id/v1/api",
    requiresApiKey: true,
    apiKeyEnvVar: "BPS_API_KEY",
    readinessStatus: "blocked",
    enabled: false,
    commercialDisplayAllowed: true,
    rateLimitSummary: "Account-scoped government portal rate limit",
    licenseNotes:
      "Official Republic of Indonesia statistics (attribution to Badan Pusat Statistik RI). Currently BLOCKED until BPS_API_KEY is provisioned and exact dynamic table var_id/turvar/period codes are verified against the live BPS catalog.",
  },
  twelve_data: {
    providerId: "twelve_data",
    displayName: "Twelve Data Market API",
    defaultBaseUrl: "https://api.twelvedata.com",
    requiresApiKey: true,
    apiKeyEnvVar: "TWELVE_DATA_API_KEY",
    readinessStatus: "disabled",
    enabled: false,
    commercialDisplayAllowed: false,
    rateLimitSummary: "Free Basic tier: 800 credits/day, 8 credits/minute",
    licenseNotes:
      "DISABLED: Twelve Data free Basic tier cannot be assumed to permit commercial public redistribution. Adapter remains hard-disabled until an appropriate commercial display license and API key are verified.",
  },
};

export const INDICATOR_PROVIDER_MATRIX: Readonly<
  Record<SupportedIndicatorCode, IndicatorProviderMapping>
> = {
  USD_IDR: {
    indicatorCode: "USD_IDR",
    providerId: "frankfurter",
    externalSeriesId: "USD/IDR",
    sourceName: "European Central Bank (ECB) Reference Rate via Frankfurter",
    sourceUrl: "https://api.frankfurter.dev/v2/rate/USD/IDR",
    unit: "IDR",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    frequency: "daily_eod",
    freshnessSlaSeconds: 86400,
    readinessStatus: "ready",
    requiresApiKey: false,
    apiKeyEnvVar: null,
    commercialDisplayAllowed: true,
    attributionText: "Kurs Referensi Pasar Valas & Bank Sentral",
    methodology:
      "Daily institutional reference exchange rate published by the European Central Bank via Frankfurter API v2 (non-JISDOR reference rate).",
  },
  FED_FUNDS: {
    indicatorCode: "FED_FUNDS",
    providerId: "fred",
    externalSeriesId: "DFF",
    sourceName: "Federal Reserve (FRED)",
    sourceUrl: "https://fred.stlouisfed.org/series/DFF",
    unit: "PERCENT",
    currency: "USD",
    timezone: "America/New_York",
    frequency: "daily_eod",
    freshnessSlaSeconds: 259200,
    readinessStatus: "ready_with_key",
    requiresApiKey: true,
    apiKeyEnvVar: "FRED_API_KEY",
    commercialDisplayAllowed: true,
    attributionText:
      "Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates via FRED (Series: DFF)",
    methodology:
      "Daily Effective Federal Funds Rate from Federal Reserve Statistical Release H.15 (FRED Series: DFF). This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis.",
  },
  US_10Y: {
    indicatorCode: "US_10Y",
    providerId: "fred",
    externalSeriesId: "DGS10",
    sourceName: "Federal Reserve (FRED)",
    sourceUrl: "https://fred.stlouisfed.org/series/DGS10",
    unit: "PERCENT",
    currency: "USD",
    timezone: "America/New_York",
    frequency: "daily_eod",
    freshnessSlaSeconds: 259200,
    readinessStatus: "ready_with_key",
    requiresApiKey: true,
    apiKeyEnvVar: "FRED_API_KEY",
    commercialDisplayAllowed: true,
    attributionText:
      "Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates via FRED (Series: DGS10)",
    methodology:
      "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity from Federal Reserve Statistical Release H.15 (FRED Series: DGS10). This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis.",
  },
  ID_CPI_YOY: {
    indicatorCode: "ID_CPI_YOY",
    providerId: "bps",
    externalSeriesId: null,
    sourceName: "Badan Pusat Statistik (BPS)",
    sourceUrl: "https://www.bps.go.id",
    unit: "PERCENT",
    currency: "NONE",
    timezone: "Asia/Jakarta",
    frequency: "monthly",
    freshnessSlaSeconds: 3024000,
    readinessStatus: "blocked",
    requiresApiKey: true,
    apiKeyEnvVar: "BPS_API_KEY",
    commercialDisplayAllowed: true,
    attributionText: "Badan Pusat Statistik (BPS RI)",
    methodology:
      "Indeks Harga Konsumen (IHK) / Inflasi Tahunan (YoY) Badan Pusat Statistik RI.",
    statusReason:
      "BLOCKED: Exact BPS WebAPI dynamic variable ID (var_id), derived variable (turvar), and period code (th) require authenticated catalog verification with BPS_API_KEY and must not be fabricated.",
  },
  ID_GDP: {
    indicatorCode: "ID_GDP",
    providerId: "bps",
    externalSeriesId: null,
    sourceName: "Badan Pusat Statistik (BPS)",
    sourceUrl: "https://www.bps.go.id",
    unit: "PERCENT",
    currency: "NONE",
    timezone: "Asia/Jakarta",
    frequency: "quarterly",
    freshnessSlaSeconds: 8640000,
    readinessStatus: "blocked",
    requiresApiKey: true,
    apiKeyEnvVar: "BPS_API_KEY",
    commercialDisplayAllowed: true,
    attributionText: "Badan Pusat Statistik (BPS RI)",
    methodology:
      "Pertumbuhan Produk Domestik Bruto (PDB) Riil Tahunan (YoY) Badan Pusat Statistik RI.",
    statusReason:
      "BLOCKED: Exact BPS WebAPI dynamic variable ID (var_id), derived variable (turvar), and period code (th) require authenticated catalog verification with BPS_API_KEY and must not be fabricated.",
  },
  XAU_USD: {
    indicatorCode: "XAU_USD",
    providerId: "twelve_data",
    externalSeriesId: "XAU/USD",
    sourceName: "Twelve Data",
    sourceUrl: "https://twelvedata.com",
    unit: "USD_PER_OZ",
    currency: "USD",
    timezone: "UTC",
    frequency: "daily_eod",
    freshnessSlaSeconds: 86400,
    readinessStatus: "disabled",
    requiresApiKey: true,
    apiKeyEnvVar: "TWELVE_DATA_API_KEY",
    commercialDisplayAllowed: false,
    attributionText: "Global Spot Bullion Market (XAU/USD)",
    methodology: "Spot Gold (XAU/USD) daily closing reference per troy ounce.",
    statusReason:
      "DISABLED: Twelve Data free tier cannot be assumed to grant commercial public display or redistribution rights. Disabled until commercial licensing and API key are verified.",
  },
  IHSG: {
    indicatorCode: "IHSG",
    providerId: null,
    externalSeriesId: "IHSG",
    sourceName: "Bursa Efek Indonesia (BEI / IDX)",
    sourceUrl: "https://www.idx.co.id",
    unit: "INDEX_PTS",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    frequency: "daily_eod",
    freshnessSlaSeconds: 86400,
    readinessStatus: "pending_license_review",
    requiresApiKey: false,
    apiKeyEnvVar: null,
    commercialDisplayAllowed: false,
    attributionText: "Bursa Efek Indonesia (BEI / IDX)",
    methodology: "Indeks Harga Saham Gabungan (IDX Composite) End-of-Day closing value.",
    statusReason:
      "PENDING_LICENSE_REVIEW: Automated public display of IDX index and equity prices awaits verification of commercial IDX redistribution licensing.",
  },
  BI_RATE: {
    indicatorCode: "BI_RATE",
    providerId: null,
    externalSeriesId: null,
    sourceName: "Bank Indonesia",
    sourceUrl: "https://www.bi.go.id",
    unit: "PERCENT",
    currency: "NONE",
    timezone: "Asia/Jakarta",
    frequency: "monthly",
    freshnessSlaSeconds: 3024000,
    readinessStatus: "editor_verified",
    requiresApiKey: false,
    apiKeyEnvVar: null,
    commercialDisplayAllowed: true,
    attributionText: "Rapat Dewan Gubernur Bank Indonesia (BI)",
    methodology: "Editor-verified monthly policy rate from official Bank Indonesia RDG release.",
  },
  SBN_10Y: {
    indicatorCode: "SBN_10Y",
    providerId: null,
    externalSeriesId: null,
    sourceName: "PHEI / IBPA",
    sourceUrl: "https://www.phei.co.id",
    unit: "PERCENT",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    frequency: "daily_eod",
    freshnessSlaSeconds: 259200,
    readinessStatus: "editor_verified",
    requiresApiKey: false,
    apiKeyEnvVar: null,
    commercialDisplayAllowed: true,
    attributionText: "Penilai Harga Efek Indonesia (PHEI / IBPA)",
    methodology: "Editor-verified 10-Year Indonesian Government Bond benchmark yield from PHEI/IBPA.",
  },
  ANTAM_1G_IDR: {
    indicatorCode: "ANTAM_1G_IDR",
    providerId: null,
    externalSeriesId: null,
    sourceName: "Fernando Capital Deterministic Parity Engine",
    sourceUrl: "https://fernandocapital.web.id/calculator?tab=gold",
    unit: "IDR_PER_GRAM",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    frequency: "daily_eod",
    freshnessSlaSeconds: 86400,
    readinessStatus: "derived_code",
    requiresApiKey: false,
    apiKeyEnvVar: null,
    commercialDisplayAllowed: true,
    attributionText: "Referensi Emas Fisik Antam Logam Mulia",
    methodology:
      "Derived synthetic bullion parity indicator from verified XAU_USD and USD_IDR observations; not an official PT Antam Tbk retail price list.",
  },
};

// ============================================================================
// Security & Credential Redaction Utilities
// ============================================================================

export function readServerEnv(
  key: string,
  ctx?: ProviderExecutionContext
): string | undefined {
  const raw =
    ctx?.env && Object.prototype.hasOwnProperty.call(ctx.env, key)
      ? ctx.env[key]
      : process.env[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Redacts API keys, query credentials, path keys, bearer tokens, and DB URIs
 * from any string or URL before logging or returning an error.
 */
export function redactProviderSecrets(
  input: unknown,
  explicitSecrets: ReadonlyArray<string | undefined> = []
): string {
  let text =
    input instanceof Error
      ? input.message
      : typeof input === "string"
        ? input
        : String(input ?? "Unknown provider error");

  for (const secret of explicitSecrets) {
    if (secret && secret.trim().length >= 3) {
      const escaped = secret.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      text = text.replace(new RegExp(escaped, "gi"), "[REDACTED]");
    }
  }

  return text
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[REDACTED_DB_URI]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/(\/key\/)[^/?#\s"']+/gi, "$1[REDACTED]")
    .replace(
      /([?&](?:api_key|apikey|key|token|secret|access_token)=)[^&#\s"']+/gi,
      "$1[REDACTED]"
    )
    .replace(
      /((?:api[_-]?key|apikey|token|secret|password|authorization)\s*[:=]\s*)[^\s&"',;]+/gi,
      "$1[REDACTED]"
    )
    .slice(0, 500);
}

export function createProviderError(params: {
  code: ProviderErrorCode;
  providerId: ProviderId;
  indicatorCode?: SupportedIndicatorCode;
  message: string;
  httpStatus?: number;
  retriable?: boolean;
  secretsToRedact?: ReadonlyArray<string | undefined>;
}): { ok: false; error: ProviderErrorDetail } {
  const nonRetriableCodes: ReadonlyArray<ProviderErrorCode> = [
    "PROVIDER_DISABLED",
    "PROVIDER_BLOCKED",
    "MISSING_API_KEY",
    "UNSUPPORTED_INDICATOR",
    "HTTP_UNAUTHORIZED",
    "HTTP_FORBIDDEN",
    "HTTP_RATE_LIMITED",
    "HTTP_CLIENT_ERROR",
    "MALFORMED_RESPONSE",
    "EMPTY_RESPONSE",
    "NO_RECENT_OBSERVATION",
    "INVALID_NUMERIC_VALUE",
    "INVALID_OBSERVATION_DATE",
    "CURRENCY_UNIT_MISMATCH",
  ];

  const isRetriable =
    params.retriable !== undefined
      ? params.retriable && !nonRetriableCodes.includes(params.code)
      : !nonRetriableCodes.includes(params.code);

  return {
    ok: false,
    error: {
      code: params.code,
      providerId: params.providerId,
      indicatorCode: params.indicatorCode,
      message: redactProviderSecrets(params.message, params.secretsToRedact),
      httpStatus: params.httpStatus,
      retriable: isRetriable,
    },
  };
}

// ============================================================================
// Decimal & Date Normalization Helpers
// ============================================================================

/**
 * Validates a numeric value or numeric string from a provider and returns a canonical
 * decimal string compatible with PostgreSQL `numeric(20, 6)` without arbitrary rounding.
 * - Never converts `null`, `undefined`, `""`, or `"."` into `"0"`.
 */
export function normalizeDecimalObservationValue(
  raw: unknown,
  options?: { allowZero?: boolean; allowNegative?: boolean }
): { ok: true; value: string; numericValue: number } | { ok: false; reason: string } {
  if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") {
    return { ok: false, reason: "Numeric observation value is missing or null." };
  }

  const str = String(raw).trim();
  if (!str || str === "." || str === "-" || str.toLowerCase() === "nan") {
    return { ok: false, reason: `Observation value "${str}" is not a valid decimal number.` };
  }

  if (!/^[+-]?\d+(?:\.\d+)?$/.test(str)) {
    return {
      ok: false,
      reason: `Observation value "${str}" must be in standard decimal format.`,
    };
  }

  const num = Number(str);
  if (!Number.isFinite(num)) {
    return { ok: false, reason: "Observation value is not finite." };
  }

  const allowZero = options?.allowZero ?? false;
  const allowNegative = options?.allowNegative ?? false;

  if (!allowZero && num === 0) {
    return { ok: false, reason: "Observation value cannot be zero for this instrument." };
  }
  if (!allowNegative && num < 0) {
    return { ok: false, reason: "Observation value cannot be negative for this instrument." };
  }

  // Normalize leading `+` and bound fractional scale to 6 decimal places (matching numeric(20, 6))
  // without truncating significant digits within 6 decimal places.
  const unsigned = str.startsWith("+") ? str.slice(1) : str;
  const [intPart, fracPart] = unsigned.split(".");
  let canonical = intPart;
  if (fracPart !== undefined) {
    const boundedFrac = fracPart.slice(0, 6);
    canonical = `${intPart}.${boundedFrac}`;
  }

  return {
    ok: true,
    value: canonical,
    numericValue: num,
  };
}

/**
 * Strictly parses a provider's observation date (`YYYY-MM-DD` or ISO-8601 timestamp).
 * - Rejects invalid calendar dates (e.g. `2026-02-30`).
 * - Rejects future dates beyond clock-skew tolerance.
 * - Rejects stale dates older than `maxAgeDays` when specified (never treating stale data as fresh).
 */
export function parseProviderObservationDate(
  rawDate: unknown,
  options?: {
    now?: Date;
    maxAgeDays?: number;
    maxFutureSkewMs?: number;
  }
): { ok: true; observedAtIso: string } | { ok: false; code: "INVALID_OBSERVATION_DATE" | "NO_RECENT_OBSERVATION"; reason: string } {
  if (typeof rawDate !== "string" || rawDate.trim().length === 0) {
    return {
      ok: false,
      code: "INVALID_OBSERVATION_DATE",
      reason: "Observation date is missing or not a string.",
    };
  }

  const trimmed = rawDate.trim();
  let parsedDate: Date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [yStr, mStr, dStr] = trimmed.split("-");
    const year = Number(yStr);
    const month = Number(mStr);
    const day = Number(dStr);
    parsedDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    // Verify calendar date components did not roll over (e.g. Feb 30 -> Mar 2)
    if (
      !Number.isFinite(parsedDate.getTime()) ||
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() + 1 !== month ||
      parsedDate.getUTCDate() !== day
    ) {
      return {
        ok: false,
        code: "INVALID_OBSERVATION_DATE",
        reason: `Invalid calendar date "${trimmed}".`,
      };
    }
  } else {
    parsedDate = new Date(trimmed);
    if (!Number.isFinite(parsedDate.getTime())) {
      return {
        ok: false,
        code: "INVALID_OBSERVATION_DATE",
        reason: `Unparseable observation timestamp "${trimmed}".`,
      };
    }
  }

  const obsMs = parsedDate.getTime();
  if (obsMs < 0) {
    return {
      ok: false,
      code: "INVALID_OBSERVATION_DATE",
      reason: "Observation date predates 1970-01-01.",
    };
  }

  const nowMs = (options?.now ?? new Date()).getTime();
  const maxFutureSkewMs = options?.maxFutureSkewMs ?? 24 * 60 * 60 * 1000; // 24h timezone date boundary tolerance for YYYY-MM-DD
  if (obsMs > nowMs + maxFutureSkewMs) {
    return {
      ok: false,
      code: "INVALID_OBSERVATION_DATE",
      reason: `Observation date "${trimmed}" is in the future.`,
    };
  }

  if (options?.maxAgeDays !== undefined && options.maxAgeDays > 0) {
    const maxAgeMs = options.maxAgeDays * 24 * 60 * 60 * 1000;
    if (nowMs - obsMs > maxAgeMs) {
      return {
        ok: false,
        code: "NO_RECENT_OBSERVATION",
        reason: `Latest observation date "${trimmed}" exceeds maximum freshness age of ${options.maxAgeDays} days.`,
      };
    }
  }

  return {
    ok: true,
    observedAtIso: parsedDate.toISOString(),
  };
}

/**
 * Verifies unit and currency alignment against the indicator's registered mapping.
 */
export function verifyMappingCurrencyAndUnit(params: {
  mapping: IndicatorProviderMapping;
  actualCurrency: string | null | undefined;
  actualUnit: string | null | undefined;
}): { ok: true } | { ok: false; reason: string } {
  const currCheck = validateCurrencyAndUnit(params.actualCurrency, params.actualUnit);
  if (!currCheck.ok) {
    return { ok: false, reason: currCheck.errors.join(" ") };
  }

  const normCurr = String(params.actualCurrency || "").trim().toUpperCase();
  const normUnit = String(params.actualUnit || "").trim().toUpperCase();

  if (normCurr !== params.mapping.currency || normUnit !== params.mapping.unit) {
    return {
      ok: false,
      reason: `Currency/unit mismatch for ${params.mapping.indicatorCode}: expected (${params.mapping.currency}, ${params.mapping.unit}), got (${normCurr}, ${normUnit}).`,
    };
  }

  return { ok: true };
}

// ============================================================================
// Bounded-Retry Server-Only HTTP Fetch Executor
// ============================================================================

export async function executeProviderJsonGet(params: {
  providerId: ProviderId;
  indicatorCode: SupportedIndicatorCode;
  url: string;
  headers?: Record<string, string>;
  ctx?: ProviderExecutionContext;
  secretsToRedact?: ReadonlyArray<string | undefined>;
}): Promise<
  | { ok: true; payload: unknown; httpStatus: number }
  | { ok: false; error: ProviderErrorDetail }
> {
  const fetchFn = params.ctx?.fetchImpl ?? globalThis.fetch;
  if (typeof fetchFn !== "function") {
    return createProviderError({
      code: "NETWORK_ERROR",
      providerId: params.providerId,
      indicatorCode: params.indicatorCode,
      message: "No fetch implementation available in current server runtime.",
      retriable: false,
      secretsToRedact: params.secretsToRedact,
    });
  }

  const timeoutMs = params.ctx?.timeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
  const maxRetries = Math.max(
    0,
    Math.min(2, params.ctx?.maxRetries ?? DEFAULT_MAX_TRANSIENT_RETRIES)
  );

  let attempt = 0;
  while (attempt <= maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchFn(params.url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "FernandoCapital-DataEngine/1.0",
          ...params.headers,
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timer);
      const status = response.status;

      // Never retry 401, 403, 429, or other 4xx client errors
      if (status === 401) {
        return createProviderError({
          code: "HTTP_UNAUTHORIZED",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          httpStatus: 401,
          message: `Provider ${params.providerId} rejected credentials with HTTP 401 Unauthorized.`,
          retriable: false,
          secretsToRedact: params.secretsToRedact,
        });
      }

      if (status === 403) {
        return createProviderError({
          code: "HTTP_FORBIDDEN",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          httpStatus: 403,
          message: `Provider ${params.providerId} denied access with HTTP 403 Forbidden.`,
          retriable: false,
          secretsToRedact: params.secretsToRedact,
        });
      }

      if (status === 429) {
        return createProviderError({
          code: "HTTP_RATE_LIMITED",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          httpStatus: 429,
          message: `Provider ${params.providerId} rate limit exceeded (HTTP 429).`,
          retriable: false,
          secretsToRedact: params.secretsToRedact,
        });
      }

      if (status >= 400 && status < 500) {
        return createProviderError({
          code: "HTTP_CLIENT_ERROR",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          httpStatus: status,
          message: `Provider ${params.providerId} returned client error HTTP ${status}.`,
          retriable: false,
          secretsToRedact: params.secretsToRedact,
        });
      }

      if (status >= 500) {
        if (attempt <= maxRetries) {
          continue;
        }
        return createProviderError({
          code: "HTTP_UPSTREAM_ERROR",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          httpStatus: status,
          message: `Provider ${params.providerId} failed with upstream HTTP ${status} after ${attempt} attempt(s).`,
          retriable: true,
          secretsToRedact: params.secretsToRedact,
        });
      }

      const rawText = await response.text();
      if (!rawText || rawText.trim().length === 0) {
        return createProviderError({
          code: "EMPTY_RESPONSE",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          httpStatus: status,
          message: `Provider ${params.providerId} returned an empty response body.`,
          retriable: false,
          secretsToRedact: params.secretsToRedact,
        });
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        return createProviderError({
          code: "MALFORMED_RESPONSE",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          httpStatus: status,
          message: `Provider ${params.providerId} returned invalid JSON.`,
          retriable: false,
          secretsToRedact: params.secretsToRedact,
        });
      }

      return {
        ok: true,
        payload: parsedJson,
        httpStatus: status,
      };
    } catch (err) {
      clearTimeout(timer);
      const isAbort =
        (err instanceof Error && err.name === "AbortError") ||
        String((err as { message?: string })?.message || "")
          .toLowerCase()
          .includes("abort") ||
        String((err as { message?: string })?.message || "")
          .toLowerCase()
          .includes("timeout");

      if (isAbort) {
        if (attempt <= maxRetries) {
          continue;
        }
        return createProviderError({
          code: "TIMEOUT",
          providerId: params.providerId,
          indicatorCode: params.indicatorCode,
          message: `Request to provider ${params.providerId} timed out after ${timeoutMs}ms.`,
          retriable: true,
          secretsToRedact: params.secretsToRedact,
        });
      }

      if (attempt <= maxRetries) {
        continue;
      }

      return createProviderError({
        code: "NETWORK_ERROR",
        providerId: params.providerId,
        indicatorCode: params.indicatorCode,
        message: `Network request to provider ${params.providerId} failed: ${redactProviderSecrets(
          err,
          params.secretsToRedact
        )}`,
        retriable: true,
        secretsToRedact: params.secretsToRedact,
      });
    }
  }

  return createProviderError({
    code: "NETWORK_ERROR",
    providerId: params.providerId,
    indicatorCode: params.indicatorCode,
    message: `Exhausted retry attempts for provider ${params.providerId}.`,
    retriable: true,
    secretsToRedact: params.secretsToRedact,
  });
}

export type { FinancialUnit, SupportedCurrency };
