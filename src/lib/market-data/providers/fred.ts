import {
  createProviderError,
  executeProviderJsonGet,
  INDICATOR_PROVIDER_MATRIX,
  normalizeDecimalObservationValue,
  parseProviderObservationDate,
  PROVIDER_CONFIGS,
  readServerEnv,
  verifyMappingCurrencyAndUnit,
} from "@/lib/market-data/providers/config";
import type {
  IndicatorProviderMapping,
  MarketDataProviderAdapter,
  ProviderExecutionContext,
  ProviderFetchResult,
  SupportedIndicatorCode,
} from "@/lib/market-data/providers/contracts";

/**
 * PHASE 3C-2 & PHASE 3D-2 — FRED API v1 PROVIDER ADAPTER (`FED_FUNDS` -> `DFF`, `US_10Y` -> `DGS10`)
 *
 * Official FRED Web Service v1 Endpoint:
 * `GET https://api.stlouisfed.org/fred/series/observations?series_id={DFF|DGS10}&api_key={FRED_API_KEY}&file_type=json&sort_order=desc&limit=10`
 *
 * Authentication & Security:
 * - Uses official FRED API v1 query parameter `api_key` read strictly from server-only `FRED_API_KEY`.
 * - Never prints, logs, or exposes `FRED_API_KEY`; redacts key from all URLs and error summaries.
 * - Contains zero hardcoded fallback keys; when `FRED_API_KEY` is absent, fails gracefully with `MISSING_API_KEY`.
 *
 * Series & Frequency Validation (Task 3):
 * - `FED_FUNDS` -> `DFF`: "Federal Funds Effective Rate", Frequency: Daily, 7-Day (`daily_eod`), Unit: Percent (`PERCENT`),
 *   Source: Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates.
 *   Never substitutes monthly `FEDFUNDS` for daily `DFF`.
 * - `US_10Y` -> `DGS10`: "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity", Frequency: Daily (`daily_eod`),
 *   Unit: Percent (`PERCENT`), Source: Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates.
 *
 * Normalization & Integrity (Task 4):
 * - Skips FRED missing/holiday placeholder observations represented by `"."`.
 * - Never converts missing values (`"."`, `""`, `null`) to zero.
 * - Never forward-fills weekends or holidays as new observations (preserves exact source observation date).
 * - Preserves exact decimal precision.
 */

export const FRED_REQUIRED_LEGAL_NOTICE =
  "This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis.";

export const FRED_TERMS_OF_USE_URL =
  "https://fred.stlouisfed.org/docs/api/terms_of_use.html";

export const FRED_LEGAL_URL = "https://fred.stlouisfed.org/legal/";

export const FRED_API_KEY_SETUP_URL =
  "https://fred.stlouisfed.org/docs/api/api_key.html";

export interface FredSeriesSpecification {
  indicatorCode: "FED_FUNDS" | "US_10Y";
  seriesId: "DFF" | "DGS10";
  officialName: string;
  nativeFrequency: string;
  schemaFrequency: "daily_eod";
  unitLabel: "Percent";
  schemaUnit: "PERCENT";
  currency: "USD";
  timezone: "America/New_York";
  sourceRelease: string;
  seriesUrl: string;
  copyrightStatus: string;
  disallowedSubstitutes: ReadonlyArray<string>;
}

export const FRED_SERIES_SPECIFICATIONS: Readonly<
  Record<"FED_FUNDS" | "US_10Y", FredSeriesSpecification>
> = {
  FED_FUNDS: {
    indicatorCode: "FED_FUNDS",
    seriesId: "DFF",
    officialName: "Federal Funds Effective Rate",
    nativeFrequency: "Daily, 7-Day",
    schemaFrequency: "daily_eod",
    unitLabel: "Percent",
    schemaUnit: "PERCENT",
    currency: "USD",
    timezone: "America/New_York",
    sourceRelease:
      "Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates",
    seriesUrl: "https://fred.stlouisfed.org/series/DFF",
    copyrightStatus:
      "Public Domain: Citation Requested (U.S. Government Work, 17 U.S.C. § 105)",
    disallowedSubstitutes: ["FEDFUNDS"],
  },
  US_10Y: {
    indicatorCode: "US_10Y",
    seriesId: "DGS10",
    officialName:
      "Market Yield on U.S. Treasury Securities at 10-Year Constant Maturity",
    nativeFrequency: "Daily",
    schemaFrequency: "daily_eod",
    unitLabel: "Percent",
    schemaUnit: "PERCENT",
    currency: "USD",
    timezone: "America/New_York",
    sourceRelease:
      "Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates",
    seriesUrl: "https://fred.stlouisfed.org/series/DGS10",
    copyrightStatus:
      "Public Domain: Citation Requested (U.S. Government Work, 17 U.S.C. § 105)",
    disallowedSubstitutes: ["GS10", "WGS10YR"],
  },
};

const SUPPORTED_INDICATORS: ReadonlyArray<SupportedIndicatorCode> = [
  "FED_FUNDS",
  "US_10Y",
];

function isValidIsoCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    Number.isFinite(dt.getTime()) &&
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
}

export class FredProviderAdapter implements MarketDataProviderAdapter {
  readonly providerId = "fred" as const;
  readonly displayName = PROVIDER_CONFIGS.fred.displayName;
  readonly readinessStatus = PROVIDER_CONFIGS.fred.readinessStatus;
  readonly requiresApiKey = true;
  readonly apiKeyEnvVar = "FRED_API_KEY";
  readonly apiVersion = "v1" as const;
  readonly supportedIndicators = SUPPORTED_INDICATORS;

  isConfigured(ctx?: ProviderExecutionContext): boolean {
    return Boolean(readServerEnv("FRED_API_KEY", ctx));
  }

  getIndicatorMapping(
    code: SupportedIndicatorCode
  ): IndicatorProviderMapping | null {
    if (!this.supportedIndicators.includes(code)) return null;
    return INDICATOR_PROVIDER_MATRIX[code];
  }

  getSeriesSpecification(
    code: SupportedIndicatorCode
  ): FredSeriesSpecification | null {
    if (code === "FED_FUNDS" || code === "US_10Y") {
      return FRED_SERIES_SPECIFICATIONS[code];
    }
    return null;
  }

  async fetchIndicator(
    code: SupportedIndicatorCode,
    ctx?: ProviderExecutionContext
  ): Promise<ProviderFetchResult> {
    const mapping = this.getIndicatorMapping(code);
    if (!mapping || !mapping.externalSeriesId) {
      return createProviderError({
        code: "UNSUPPORTED_INDICATOR",
        providerId: this.providerId,
        indicatorCode: code,
        message: `FRED adapter does not support indicator "${code}".`,
      });
    }

    // Phase 3D-2A Compliance Gate:
    // Block all live network calls to the external FRED API (when no offline unit-test mock `fetchImpl` is injected).
    if (!ctx?.fetchImpl) {
      return createProviderError({
        code: "PROVIDER_DISABLED",
        providerId: this.providerId,
        indicatorCode: code,
        retriable: false,
        message:
          "DISABLED (Phase 3D-2A Legal & Compliance Review): Live FRED API ingestion is disabled because FRED Terms of Use restrict persistent database storage/caching and AI/LLM workflow usage.",
      });
    }

    const apiKey = readServerEnv("FRED_API_KEY", ctx);
    if (!apiKey) {
      return createProviderError({
        code: "MISSING_API_KEY",
        providerId: this.providerId,
        indicatorCode: code,
        message:
          "Missing required environment variable FRED_API_KEY for FRED provider adapter.",
      });
    }

    const seriesId = encodeURIComponent(mapping.externalSeriesId);
    const url = `${PROVIDER_CONFIGS.fred.defaultBaseUrl}/series/observations?series_id=${seriesId}&api_key=${encodeURIComponent(
      apiKey
    )}&file_type=json&sort_order=desc&limit=10`;

    const httpResult = await executeProviderJsonGet({
      providerId: this.providerId,
      indicatorCode: code,
      url,
      ctx,
      secretsToRedact: [apiKey],
    });

    if (!httpResult.ok) {
      return httpResult;
    }

    return this.normalizeResponse(code, httpResult.payload, {
      now: ctx?.now,
      maxObservationAgeDays: ctx?.maxObservationAgeDays ?? 14,
    });
  }

  normalizeResponse(
    code: SupportedIndicatorCode,
    rawPayload: unknown,
    ctx?: {
      now?: Date;
      maxObservationAgeDays?: number;
      expectedUnit?: IndicatorProviderMapping["unit"];
      expectedCurrency?: IndicatorProviderMapping["currency"];
    }
  ): ProviderFetchResult {
    const mapping = this.getIndicatorMapping(code);
    if (!mapping) {
      return createProviderError({
        code: "UNSUPPORTED_INDICATOR",
        providerId: this.providerId,
        indicatorCode: code,
        message: `FRED adapter does not support indicator "${code}".`,
      });
    }

    if (rawPayload === null || rawPayload === undefined) {
      return createProviderError({
        code: "EMPTY_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "FRED response payload is empty.",
      });
    }

    if (typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "FRED response payload is not a JSON object.",
      });
    }

    const obj = rawPayload as Record<string, unknown>;

    // Guard against accidental series substitution (e.g. monthly FEDFUNDS instead of daily DFF)
    if (
      typeof obj.series_id === "string" &&
      obj.series_id.trim().toUpperCase() !== mapping.externalSeriesId
    ) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: `FRED series_id mismatch for ${code}: expected "${mapping.externalSeriesId}", got "${obj.series_id}".`,
      });
    }

    if (!Array.isArray(obj.observations)) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: 'FRED response is missing the "observations" array.',
      });
    }

    if (obj.observations.length === 0) {
      return createProviderError({
        code: "EMPTY_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "FRED observations array is empty.",
      });
    }

    const unitCheck = verifyMappingCurrencyAndUnit({
      mapping,
      actualCurrency: ctx?.expectedCurrency ?? mapping.currency,
      actualUnit: ctx?.expectedUnit ?? mapping.unit,
    });
    if (!unitCheck.ok) {
      return createProviderError({
        code: "CURRENCY_UNIT_MISMATCH",
        providerId: this.providerId,
        indicatorCode: code,
        message: unitCheck.reason,
      });
    }

    // FRED returns `"."` on market holidays/weekends; collect non-placeholder rows
    // and never forward-fill a holiday date with an earlier observation's value.
    const nonPlaceholderRows: Array<Record<string, unknown>> = [];
    for (const item of obj.observations) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return createProviderError({
          code: "MALFORMED_RESPONSE",
          providerId: this.providerId,
          indicatorCode: code,
          message: "FRED observation item is not a valid object.",
        });
      }
      const row = item as Record<string, unknown>;
      const rawVal =
        typeof row.value === "string" ? row.value.trim() : row.value;
      if (rawVal === ".") {
        continue;
      }
      nonPlaceholderRows.push(row);
    }

    if (nonPlaceholderRows.length === 0) {
      return createProviderError({
        code: "NO_RECENT_OBSERVATION",
        providerId: this.providerId,
        indicatorCode: code,
        message: `FRED returned only missing/holiday placeholder observations (".") for ${code}.`,
      });
    }

    // Select the latest valid observation by date if all candidate dates are valid YYYY-MM-DD;
    // otherwise keep the first non-placeholder row so date validation reports INVALID_OBSERVATION_DATE.
    let selectedRow: Record<string, unknown> = nonPlaceholderRows[0];
    const allDatesValidIso = nonPlaceholderRows.every(
      (r) =>
        typeof r.date === "string" && isValidIsoCalendarDate(r.date.trim())
    );
    if (allDatesValidIso && nonPlaceholderRows.length > 1) {
      for (const candidate of nonPlaceholderRows) {
        const candDate = String(candidate.date).trim();
        const currDate = String(selectedRow.date).trim();
        if (candDate > currDate) {
          selectedRow = candidate;
        }
      }
    }

    const decimalCheck = normalizeDecimalObservationValue(selectedRow.value, {
      allowZero: true,
      allowNegative: true,
    });
    if (!decimalCheck.ok) {
      return createProviderError({
        code: "INVALID_NUMERIC_VALUE",
        providerId: this.providerId,
        indicatorCode: code,
        message: `FRED observation value for ${code} is invalid: ${decimalCheck.reason}`,
      });
    }

    const nowDate = ctx?.now ?? new Date();
    const dateCheck = parseProviderObservationDate(selectedRow.date, {
      now: nowDate,
      maxAgeDays: ctx?.maxObservationAgeDays ?? 14,
    });
    if (!dateCheck.ok) {
      return createProviderError({
        code: dateCheck.code,
        providerId: this.providerId,
        indicatorCode: code,
        message: `FRED observation date error for ${code}: ${dateCheck.reason}`,
      });
    }

    return {
      ok: true,
      observation: {
        indicatorCode: code,
        value: decimalCheck.value,
        numericValue: decimalCheck.numericValue,
        unit: mapping.unit,
        currency: mapping.currency,
        observedAt: dateCheck.observedAtIso,
        fetchedAt: nowDate.toISOString(),
        sourceName: mapping.sourceName,
        sourceUrl: mapping.sourceUrl,
        providerId: this.providerId,
        timezone: mapping.timezone,
        frequency: mapping.frequency,
        attributionText: mapping.attributionText,
        methodology: mapping.methodology,
      },
    };
  }
}

export const fredAdapter = new FredProviderAdapter();
