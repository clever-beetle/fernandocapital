import {
  createProviderError,
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
 * PHASE 3C-2 — TWELVE DATA PROVIDER ADAPTER (`XAU_USD`)
 *
 * Readiness Status: `DISABLED`
 * - Twelve Data's free Basic plan cannot be assumed to grant commercial public display or redistribution rights.
 * - Per strict Phase 3C-2 governance rules, `fetchIndicator` is hard-disabled (`PROVIDER_DISABLED`)
 *   and NEVER initiates an outbound HTTP request until commercial licensing and `TWELVE_DATA_API_KEY` are approved.
 * - `normalizeResponse` is implemented for offline contract verification against mock Twelve Data payloads.
 */

const SUPPORTED_INDICATORS: ReadonlyArray<SupportedIndicatorCode> = ["XAU_USD"];

export class TwelveDataProviderAdapter implements MarketDataProviderAdapter {
  readonly providerId = "twelve_data" as const;
  readonly displayName = PROVIDER_CONFIGS.twelve_data.displayName;
  readonly readinessStatus = PROVIDER_CONFIGS.twelve_data.readinessStatus;
  readonly requiresApiKey = true;
  readonly apiKeyEnvVar = "TWELVE_DATA_API_KEY";
  readonly supportedIndicators = SUPPORTED_INDICATORS;

  getIndicatorMapping(code: SupportedIndicatorCode): IndicatorProviderMapping | null {
    if (!this.supportedIndicators.includes(code)) return null;
    return INDICATOR_PROVIDER_MATRIX[code];
  }

  async fetchIndicator(
    code: SupportedIndicatorCode,
    ctx?: ProviderExecutionContext
  ): Promise<ProviderFetchResult> {
    const mapping = this.getIndicatorMapping(code);
    if (!mapping) {
      return createProviderError({
        code: "UNSUPPORTED_INDICATOR",
        providerId: this.providerId,
        indicatorCode: code,
        message: `Twelve Data adapter does not support indicator "${code}".`,
      });
    }

    const apiKey = readServerEnv("TWELVE_DATA_API_KEY", ctx);

    // Fail closed immediately while disabled — never call the external endpoint
    if (!PROVIDER_CONFIGS.twelve_data.enabled || this.readinessStatus === "disabled") {
      return createProviderError({
        code: "PROVIDER_DISABLED",
        providerId: this.providerId,
        indicatorCode: code,
        message:
          mapping.statusReason ||
          "Twelve Data provider is DISABLED pending commercial redistribution license verification.",
        secretsToRedact: [apiKey],
      });
    }

    if (!apiKey) {
      return createProviderError({
        code: "MISSING_API_KEY",
        providerId: this.providerId,
        indicatorCode: code,
        message: "Missing required environment variable TWELVE_DATA_API_KEY.",
      });
    }

    return createProviderError({
      code: "PROVIDER_DISABLED",
      providerId: this.providerId,
      indicatorCode: code,
      message: "Twelve Data provider is disabled.",
      secretsToRedact: [apiKey],
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
        message: `Twelve Data adapter does not support indicator "${code}".`,
      });
    }

    if (rawPayload === null || rawPayload === undefined) {
      return createProviderError({
        code: "EMPTY_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "Twelve Data payload is empty.",
      });
    }

    if (typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "Twelve Data payload is not a JSON object.",
      });
    }

    const obj = rawPayload as Record<string, unknown>;
    const meta =
      obj.meta && typeof obj.meta === "object"
        ? (obj.meta as Record<string, unknown>)
        : null;
    const values = Array.isArray(obj.values) ? obj.values : null;

    if (!meta || !values) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: 'Twelve Data response is missing required "meta" or "values" fields.',
      });
    }

    if (values.length === 0) {
      return createProviderError({
        code: "EMPTY_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "Twelve Data values array is empty.",
      });
    }

    const symbol = typeof meta.symbol === "string" ? meta.symbol.trim().toUpperCase() : "";
    if (symbol !== "XAU/USD") {
      return createProviderError({
        code: "CURRENCY_UNIT_MISMATCH",
        providerId: this.providerId,
        indicatorCode: code,
        message: `Twelve Data symbol mismatch: expected XAU/USD, got "${symbol}".`,
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

    const latestRow =
      values[0] && typeof values[0] === "object"
        ? (values[0] as Record<string, unknown>)
        : null;
    if (!latestRow) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "Twelve Data observation entry is not an object.",
      });
    }

    const decimalCheck = normalizeDecimalObservationValue(latestRow.close ?? latestRow.price, {
      allowZero: false,
      allowNegative: false,
    });
    if (!decimalCheck.ok) {
      return createProviderError({
        code: "INVALID_NUMERIC_VALUE",
        providerId: this.providerId,
        indicatorCode: code,
        message: `Twelve Data price for XAU_USD is invalid: ${decimalCheck.reason}`,
      });
    }

    const nowDate = ctx?.now ?? new Date();
    const dateCheck = parseProviderObservationDate(latestRow.datetime, {
      now: nowDate,
      maxAgeDays: ctx?.maxObservationAgeDays ?? 10,
    });
    if (!dateCheck.ok) {
      return createProviderError({
        code: dateCheck.code,
        providerId: this.providerId,
        indicatorCode: code,
        message: `Twelve Data observation date error: ${dateCheck.reason}`,
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

export const twelveDataAdapter = new TwelveDataProviderAdapter();
