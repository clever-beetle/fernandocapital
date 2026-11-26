import {
  createProviderError,
  INDICATOR_PROVIDER_MATRIX,
  PROVIDER_CONFIGS,
  readServerEnv,
} from "@/lib/market-data/providers/config";
import type {
  IndicatorProviderMapping,
  MarketDataProviderAdapter,
  ProviderExecutionContext,
  ProviderFetchResult,
  SupportedIndicatorCode,
} from "@/lib/market-data/providers/contracts";

/**
 * PHASE 3C-2 — BPS WEBAPI PROVIDER ADAPTER (`ID_CPI_YOY`, `ID_GDP`)
 *
 * Readiness Status: `BLOCKED`
 * - BPS WebAPI (`https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/var/{var_id}/key/{key}/`)
 *   requires a registered `BPS_API_KEY` AND an authenticated query against the BPS dynamic table catalog
 *   to verify the exact numeric `var_id`, `turvar` (YoY derived indicator), and `th` (period code).
 * - Per strict Phase 3C-2 governance rules, we NEVER invent or guess BPS variable IDs or period codes,
 *   and never return mock/fake observations.
 * - Until `BPS_API_KEY` is configured and the catalog variable IDs are verified, this adapter fails closed
 *   with `MISSING_API_KEY` (when key is absent) or `PROVIDER_BLOCKED` (when key is present but `externalSeriesId` is unverified).
 */

const SUPPORTED_INDICATORS: ReadonlyArray<SupportedIndicatorCode> = [
  "ID_CPI_YOY",
  "ID_GDP",
];

export class BpsProviderAdapter implements MarketDataProviderAdapter {
  readonly providerId = "bps" as const;
  readonly displayName = PROVIDER_CONFIGS.bps.displayName;
  readonly readinessStatus = PROVIDER_CONFIGS.bps.readinessStatus;
  readonly requiresApiKey = true;
  readonly apiKeyEnvVar = "BPS_API_KEY";
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
        message: `BPS WebAPI adapter does not support indicator "${code}".`,
      });
    }

    const apiKey = readServerEnv("BPS_API_KEY", ctx);
    if (!apiKey) {
      return createProviderError({
        code: "MISSING_API_KEY",
        providerId: this.providerId,
        indicatorCode: code,
        message:
          "Missing required environment variable BPS_API_KEY for Badan Pusat Statistik (BPS) WebAPI.",
      });
    }

    if (
      this.readinessStatus === "blocked" ||
      mapping.readinessStatus === "blocked" ||
      !mapping.externalSeriesId
    ) {
      return createProviderError({
        code: "PROVIDER_BLOCKED",
        providerId: this.providerId,
        indicatorCode: code,
        message:
          mapping.statusReason ||
          `BPS WebAPI integration for ${code} is BLOCKED until exact BPS variable ID (var_id) and period codes are verified against the BPS catalog.`,
        secretsToRedact: [apiKey],
      });
    }

    return createProviderError({
      code: "PROVIDER_BLOCKED",
      providerId: this.providerId,
      indicatorCode: code,
      message: `BPS WebAPI adapter for ${code} is blocked pending variable catalog verification.`,
      secretsToRedact: [apiKey],
    });
  }

  normalizeResponse(
    code: SupportedIndicatorCode,
    rawPayload: unknown
  ): ProviderFetchResult {
    const mapping = this.getIndicatorMapping(code);
    if (!mapping) {
      return createProviderError({
        code: "UNSUPPORTED_INDICATOR",
        providerId: this.providerId,
        indicatorCode: code,
        message: `BPS WebAPI adapter does not support indicator "${code}".`,
      });
    }

    if (rawPayload === null || rawPayload === undefined) {
      return createProviderError({
        code: "EMPTY_RESPONSE",
        providerId: this.providerId,
        indicatorCode: code,
        message: "BPS WebAPI payload is empty.",
      });
    }

    return createProviderError({
      code: "PROVIDER_BLOCKED",
      providerId: this.providerId,
      indicatorCode: code,
      message:
        mapping.statusReason ||
        `BPS WebAPI normalization for ${code} is BLOCKED until official BPS var_id and turvar codes are verified.`,
    });
  }
}

export const bpsAdapter = new BpsProviderAdapter();
