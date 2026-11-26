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
 * PHASE 3C-2 — FRANKFURTER API v2 PROVIDER ADAPTER (`USD_IDR`)
 *
 * Official Endpoint: `GET https://api.frankfurter.dev/v2/rate/USD/IDR`
 * - Treated strictly as a daily reference exchange rate (European Central Bank reference feed),
 *   NOT Bank Indonesia's official JISDOR rate.
 * - Preserves exact provider observation date (`date: "YYYY-MM-DD"`).
 * - Performs zero side effects or network calls on module import.
 */

const SUPPORTED_INDICATORS: ReadonlyArray<SupportedIndicatorCode> = ["USD_IDR"];

export class FrankfurterProviderAdapter implements MarketDataProviderAdapter {
  readonly providerId = "frankfurter" as const;
  readonly displayName = PROVIDER_CONFIGS.frankfurter.displayName;
  readonly readinessStatus = PROVIDER_CONFIGS.frankfurter.readinessStatus;
  readonly requiresApiKey = false;
  readonly apiKeyEnvVar = null;
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
        message: `Frankfurter adapter does not support indicator "${code}".`,
      });
    }

    const baseUrl = (
      readServerEnv("FRANKFURTER_API_BASE_URL", ctx) ||
      PROVIDER_CONFIGS.frankfurter.defaultBaseUrl
    ).replace(/\/+$/, "");

    const url = `${baseUrl}/rate/USD/IDR`;
    const httpResult = await executeProviderJsonGet({
      providerId: this.providerId,
      indicatorCode: code,
      url,
      ctx,
    });

    if (!httpResult.ok) {
      return httpResult;
    }

    return this.normalizeResponse(code, httpResult.payload, {
      now: ctx?.now,
      maxObservationAgeDays: ctx?.maxObservationAgeDays ?? 10,
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
        message: `Frankfurter adapter does not support indicator "${code}".`,
      });
    }

    if (rawPayload === null || rawPayload === undefined) {
      return createProviderError({
        code: "EMPTY_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "Frankfurter response payload is empty.",
      });
    }

    // Support Frankfurter v2 single-pair object `{ date, base, quote, rate }`,
    // v2 array `[{ date, base, quote, rate }]`, and v1 object `{ date, base, rates: { IDR } }`.
    let candidateObj: Record<string, unknown> | null = null;
    if (Array.isArray(rawPayload)) {
      if (rawPayload.length === 0) {
        return createProviderError({
          code: "EMPTY_RESPONSE",
          providerId: this.providerId,
          indicatorCode: code,
          message: "Frankfurter returned an empty rates array.",
        });
      }
      const first = rawPayload[0];
      if (first && typeof first === "object") {
        candidateObj = first as Record<string, unknown>;
      }
    } else if (typeof rawPayload === "object") {
      candidateObj = rawPayload as Record<string, unknown>;
    }

    if (!candidateObj) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "Frankfurter response is not a valid JSON object.",
      });
    }

    const rawBase =
      typeof candidateObj.base === "string" ? candidateObj.base.trim().toUpperCase() : "";
    let rawQuote =
      typeof candidateObj.quote === "string"
        ? candidateObj.quote.trim().toUpperCase()
        : "";
    let rawRate: unknown = candidateObj.rate;

    // Fallback check for v1 shape `{ base: "USD", date: "YYYY-MM-DD", rates: { IDR: ... } }`
    if (
      rawRate === undefined &&
      candidateObj.rates &&
      typeof candidateObj.rates === "object"
    ) {
      const ratesMap = candidateObj.rates as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(ratesMap, "IDR")) {
        rawQuote = "IDR";
        rawRate = ratesMap.IDR;
      }
    }

    if (!rawBase || !rawQuote || rawDateMissing(candidateObj.date)) {
      return createProviderError({
        code: "MALFORMED_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message:
          "Frankfurter response is missing required fields (date, base, quote/rates, rate).",
      });
    }

    if (rawBase !== "USD" || rawQuote !== "IDR") {
      return createProviderError({
        code: "CURRENCY_UNIT_MISMATCH",
        providerId: this.providerId,
        indicatorCode: code,
        message: `Frankfurter currency pair mismatch: expected USD/IDR, got ${rawBase}/${rawQuote}.`,
      });
    }

    const targetCurrency = ctx?.expectedCurrency ?? rawQuote;
    const targetUnit = ctx?.expectedUnit ?? mapping.unit;
    const unitCheck = verifyMappingCurrencyAndUnit({
      mapping,
      actualCurrency: targetCurrency,
      actualUnit: targetUnit,
    });
    if (!unitCheck.ok) {
      return createProviderError({
        code: "CURRENCY_UNIT_MISMATCH",
        providerId: this.providerId,
        indicatorCode: code,
        message: unitCheck.reason,
      });
    }

    const decimalCheck = normalizeDecimalObservationValue(rawRate, {
      allowZero: false,
      allowNegative: false,
    });
    if (!decimalCheck.ok) {
      return createProviderError({
        code: "INVALID_NUMERIC_VALUE",
        providerId: this.providerId,
        indicatorCode: code,
        message: `Frankfurter rate for USD_IDR is invalid: ${decimalCheck.reason}`,
      });
    }

    const nowDate = ctx?.now ?? new Date();
    const dateCheck = parseProviderObservationDate(candidateObj.date, {
      now: nowDate,
      maxAgeDays: ctx?.maxObservationAgeDays ?? 10,
    });
    if (!dateCheck.ok) {
      return createProviderError({
        code: dateCheck.code,
        providerId: this.providerId,
        indicatorCode: code,
        message: `Frankfurter observation date error: ${dateCheck.reason}`,
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

function rawDateMissing(val: unknown): boolean {
  return val === null || val === undefined || (typeof val === "string" && val.trim() === "");
}

export const frankfurterAdapter = new FrankfurterProviderAdapter();
