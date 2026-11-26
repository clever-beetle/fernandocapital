import { db } from "@/db";
import {
  automationLogs,
  marketIndicators,
  marketPriceHistory,
  type AutomationJobStatus,
  type InstrumentType,
  type MarketIndicatorRecord,
} from "@/db/schema";
import {
  validateCurrencyAndUnit,
  validateObservationTimestamp,
  validateSourceProvenance,
} from "@/lib/financial-engine";
import {
  INITIAL_MARKET_INDICATOR_REGISTRY,
  sanitizeAutomationError,
} from "@/lib/financial-registry";
import {
  getAdapterForIndicator,
  getIndicatorProviderMapping,
  normalizeDecimalObservationValue,
  parseProviderObservationDate,
  redactProviderSecrets,
  type NormalizedIndicatorObservation,
  type ProviderErrorDetail,
  type ProviderExecutionContext,
  type SupportedIndicatorCode,
} from "@/lib/market-data/providers";
import { and, desc, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";

/**
 * PHASE 3C-3 & PHASE 3D-2A — SERVER-ONLY FINANCIAL DATA INGESTION & VALIDATION SERVICE
 *
 * Orchestrates provider fetching, response normalization, strict validation,
 * idempotent persistence to `market_price_history` and `market_indicators`,
 * and sanitized audit logging to `automation_logs`.
 *
 * Strict Governance Rules:
 * - Only `USD_IDR` (Frankfurter API v2) is enabled for live external ingestion.
 * - `FED_FUNDS` (`DFF`) and `US_10Y` (`DGS10`) are hard-disabled / skipped in Phase 3D-2A due to
 *   FRED API Terms of Use restrictions on persistent database storage/caching and AI/LLM workflows.
 * - `XAU_USD` (Twelve Data disabled), `ID_CPI_YOY` & `ID_GDP` (BPS blocked), `IHSG` (pending license review),
 *   `BI_RATE` & `SBN_10Y` (editor verified), and `ANTAM_1G_IDR` (derived) are never fetched automatically.
 * - Preserves `previous_value` accurately:
 *   - First observation (`as_of_timestamp IS NULL`): `previous_value` stays `NULL`.
 *   - Newer observation (`observed_at > as_of_timestamp`): `previous_value` becomes prior `value`.
 *   - Duplicate retry (`observed_at === as_of_timestamp`): `market_indicators` is not overwritten (`previous_value` preserved).
 *   - Older observation (`observed_at < as_of_timestamp`): rejected from updating `market_indicators` snapshot.
 */

export const PERMITTED_LIVE_INGESTION_INDICATORS: ReadonlyArray<SupportedIndicatorCode> = [
  "USD_IDR",
];

export const DEFAULT_LIVE_INGESTION_INDICATORS: ReadonlyArray<SupportedIndicatorCode> = [
  "USD_IDR",
];

export const FRED_COMPLIANCE_BLOCK_REASON =
  "DISABLED (Phase 3D-2A Legal & Compliance Review): FRED API Terms of Use prohibit storing/caching/archiving FRED Content in databases and prohibit use in connection with AI/ML/LLM systems.";

export const DEFAULT_MARKET_SYNC_COOLDOWN_SECONDS = 60;

export type HistoryWriteAction =
  | "inserted"
  | "duplicate_skipped"
  | "dry_run_no_write"
  | "none";

export type SnapshotWriteAction =
  | "initialized_first_value"
  | "updated_newer_observation"
  | "duplicate_unchanged"
  | "rejected_older_observation"
  | "dry_run_no_write"
  | "none";

export interface SingleIndicatorIngestionResult {
  indicatorCode: SupportedIndicatorCode;
  providerId: string | null;
  status: "success" | "skipped" | "error";
  historyAction: HistoryWriteAction;
  snapshotAction: SnapshotWriteAction;
  recordsUpdated: number;
  observation: NormalizedIndicatorObservation | null;
  indicatorSnapshot: {
    code: string;
    value: string | null;
    previousValue: string | null;
    asOfTimestamp: string | null;
    fetchedAt: string | null;
    sourceName: string | null;
    sourceUrl: string | null;
  } | null;
  skipReason?: string;
  error?: ProviderErrorDetail;
}

export type MarketDataSyncBatchResult =
  | {
      ok: true;
      status: "completed" | "dry_run_completed";
      dryRun: boolean;
      jobName: string;
      provider: string;
      totalRecordsUpdated: number;
      durationMs: number;
      automationLogId: number | null;
      results: SingleIndicatorIngestionResult[];
    }
  | {
      ok: false;
      status: "cooldown";
      retryAfterSeconds: number;
      message: string;
    }
  | {
      ok: false;
      status: "error";
      dryRun: boolean;
      jobName: string;
      provider: string;
      durationMs: number;
      automationLogId: number | null;
      error: string;
      results: SingleIndicatorIngestionResult[];
    };

interface GlobalIngestionCooldownState {
  inProgress: boolean;
  lastCompletedAtMs: number;
  lastCompletedAtByProvider: Record<string, number>;
}

const globalForIngestion = globalThis as unknown as {
  __fcMarketDataIngestionState?: GlobalIngestionCooldownState;
};

function getCooldownState(): GlobalIngestionCooldownState {
  if (!globalForIngestion.__fcMarketDataIngestionState) {
    globalForIngestion.__fcMarketDataIngestionState = {
      inProgress: false,
      lastCompletedAtMs: 0,
      lastCompletedAtByProvider: {},
    };
  }
  if (!globalForIngestion.__fcMarketDataIngestionState.lastCompletedAtByProvider) {
    globalForIngestion.__fcMarketDataIngestionState.lastCompletedAtByProvider = {};
  }
  return globalForIngestion.__fcMarketDataIngestionState;
}

export function resetMarketDataIngestionCooldownForTest(): void {
  const state = getCooldownState();
  state.inProgress = false;
  state.lastCompletedAtMs = 0;
  state.lastCompletedAtByProvider = {};
}

function mapCategoryToInstrumentType(category: string): InstrumentType {
  switch (category) {
    case "fx":
      return "fx";
    case "commodity":
      return "commodity";
    case "equity_index":
      return "index";
    case "bond_yield":
      return "bond";
    default:
      return "macro";
  }
}

/**
 * Validates a normalized provider observation against the indicator's registered metadata
 * and Phase 3C-3 data integrity rules.
 */
export function validateNormalizedObservation(
  indicatorCode: SupportedIndicatorCode,
  observation: NormalizedIndicatorObservation,
  ctx?: ProviderExecutionContext
): { ok: true } | { ok: false; error: ProviderErrorDetail } {
  const mapping = getIndicatorProviderMapping(indicatorCode);
  const providerId = observation.providerId;

  if (observation.indicatorCode !== indicatorCode) {
    return {
      ok: false,
      error: {
        code: "MALFORMED_RESPONSE",
        providerId,
        indicatorCode,
        message: `Observation indicatorCode "${observation.indicatorCode}" does not match requested "${indicatorCode}".`,
        retriable: false,
      },
    };
  }

  const currUnitCheck = validateCurrencyAndUnit(observation.currency, observation.unit);
  if (
    !currUnitCheck.ok ||
    observation.currency !== mapping.currency ||
    observation.unit !== mapping.unit
  ) {
    return {
      ok: false,
      error: {
        code: "CURRENCY_UNIT_MISMATCH",
        providerId,
        indicatorCode,
        message:
          currUnitCheck.errors[0] ||
          `Currency/unit mismatch for ${indicatorCode}: expected (${mapping.currency}, ${mapping.unit}), got (${observation.currency}, ${observation.unit}).`,
        retriable: false,
      },
    };
  }

  const regEntry = INITIAL_MARKET_INDICATOR_REGISTRY.find(
    (r) => r.code === indicatorCode
  );
  const category = regEntry?.category ?? "fx";
  const allowZeroOrNeg =
    category === "macro_rate" ||
    category === "macro_inflation" ||
    category === "macro_output" ||
    category === "bond_yield";

  const decCheck = normalizeDecimalObservationValue(observation.value, {
    allowZero: allowZeroOrNeg,
    allowNegative: allowZeroOrNeg,
  });
  if (!decCheck.ok) {
    return {
      ok: false,
      error: {
        code: "INVALID_NUMERIC_VALUE",
        providerId,
        indicatorCode,
        message: decCheck.reason,
        retriable: false,
      },
    };
  }

  const nowDate = ctx?.now ?? new Date();
  const tsCheck = validateObservationTimestamp(observation.observedAt, {
    nowMs: nowDate.getTime(),
    maxFutureSkewMs: 24 * 60 * 60 * 1000,
  });
  if (!tsCheck.ok) {
    return {
      ok: false,
      error: {
        code: "INVALID_OBSERVATION_DATE",
        providerId,
        indicatorCode,
        message: tsCheck.errors.join(" "),
        retriable: false,
      },
    };
  }

  const freshnessCheck = parseProviderObservationDate(observation.observedAt, {
    now: nowDate,
    maxAgeDays:
      ctx?.maxObservationAgeDays ??
      (observation.providerId === "fred" ? 14 : 10),
  });
  if (!freshnessCheck.ok) {
    return {
      ok: false,
      error: {
        code: freshnessCheck.code,
        providerId,
        indicatorCode,
        message: freshnessCheck.reason,
        retriable: false,
      },
    };
  }

  const provCheck = validateSourceProvenance({
    sourceName: observation.sourceName,
    sourceUrl: observation.sourceUrl,
  });
  if (!provCheck.ok) {
    return {
      ok: false,
      error: {
        code: "MALFORMED_RESPONSE",
        providerId,
        indicatorCode,
        message: provCheck.errors.join(" "),
        retriable: false,
      },
    };
  }

  return { ok: true };
}

/**
 * Ingests a single indicator observation through its configured provider adapter
 * and persists idempotently to `market_price_history` and `market_indicators` (unless `dryRun: true`).
 */
export async function ingestSingleIndicator(
  indicatorCode: SupportedIndicatorCode,
  options?: {
    dryRun?: boolean;
    ctx?: ProviderExecutionContext;
  }
): Promise<SingleIndicatorIngestionResult> {
  const dryRun = options?.dryRun === true;
  const mapping = getIndicatorProviderMapping(indicatorCode);

  if (!mapping) {
    return {
      indicatorCode,
      providerId: null,
      status: "error",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      error: {
        code: "UNSUPPORTED_INDICATOR",
        providerId: "frankfurter",
        indicatorCode,
        message: `Unknown indicator code "${indicatorCode}".`,
        retriable: false,
      },
    };
  }

  // Phase 3D-2A Compliance Gate: Never fetch or persist FRED indicators (`FED_FUNDS`, `US_10Y`)
  if (
    indicatorCode === "FED_FUNDS" ||
    indicatorCode === "US_10Y" ||
    mapping.providerId === "fred"
  ) {
    return {
      indicatorCode,
      providerId: mapping.providerId,
      status: "skipped",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      skipReason: FRED_COMPLIANCE_BLOCK_REASON,
    };
  }

  // Enforce Task 7 Provider Status Preservation
  if (mapping.readinessStatus === "disabled") {
    return {
      indicatorCode,
      providerId: mapping.providerId,
      status: "skipped",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      skipReason:
        mapping.statusReason ||
        `Indicator ${indicatorCode} is disabled pending commercial redistribution license.`,
    };
  }

  if (mapping.readinessStatus === "blocked") {
    return {
      indicatorCode,
      providerId: mapping.providerId,
      status: "skipped",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      skipReason:
        mapping.statusReason ||
        `Indicator ${indicatorCode} is blocked pending verified catalog variable IDs and API key.`,
    };
  }

  if (
    mapping.readinessStatus === "pending_license_review" ||
    mapping.readinessStatus === "editor_verified" ||
    mapping.readinessStatus === "derived_code"
  ) {
    return {
      indicatorCode,
      providerId: mapping.providerId,
      status: "skipped",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      skipReason:
        mapping.statusReason ||
        `Indicator ${indicatorCode} has status "${mapping.readinessStatus}" and is not eligible for automated provider ingestion.`,
    };
  }

  const adapter = getAdapterForIndicator(indicatorCode);
  if (!adapter) {
    return {
      indicatorCode,
      providerId: mapping.providerId,
      status: "skipped",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      skipReason: `No automated provider adapter is bound to ${indicatorCode}.`,
    };
  }

  // Fetch and normalize from provider adapter
  const fetchResult = await adapter.fetchIndicator(indicatorCode, options?.ctx);
  if (!fetchResult.ok) {
    // Phase 3D-2A: If FRED is reached via fallback, report compliance block
    if (
      adapter.providerId === "fred" &&
      (fetchResult.error.code === "MISSING_API_KEY" ||
        fetchResult.error.code === "PROVIDER_DISABLED")
    ) {
      return {
        indicatorCode,
        providerId: adapter.providerId,
        status: "skipped",
        historyAction: "none",
        snapshotAction: "none",
        recordsUpdated: 0,
        observation: null,
        indicatorSnapshot: null,
        skipReason: FRED_COMPLIANCE_BLOCK_REASON,
      };
    }

    return {
      indicatorCode,
      providerId: adapter.providerId,
      status: "error",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      error: fetchResult.error,
    };
  }

  const observation = fetchResult.observation;

  // Double-validate normalized observation before any DB operation
  const validation = validateNormalizedObservation(
    indicatorCode,
    observation,
    options?.ctx
  );
  if (!validation.ok) {
    return {
      indicatorCode,
      providerId: adapter.providerId,
      status: "error",
      historyAction: "none",
      snapshotAction: "none",
      recordsUpdated: 0,
      observation: null,
      indicatorSnapshot: null,
      error: validation.error,
    };
  }

  // Dry-run mode performs zero database writes
  if (dryRun) {
    return {
      indicatorCode,
      providerId: adapter.providerId,
      status: "success",
      historyAction: "dry_run_no_write",
      snapshotAction: "dry_run_no_write",
      recordsUpdated: 0,
      observation,
      indicatorSnapshot: null,
    };
  }

  const observedAtDate = new Date(observation.observedAt);
  const fetchedAtDate = new Date(observation.fetchedAt);
  const regTemplate = INITIAL_MARKET_INDICATOR_REGISTRY.find(
    (r) => r.code === indicatorCode
  );
  const instrumentType = mapCategoryToInstrumentType(
    regTemplate?.category ?? "fx"
  );

  // 1. Ensure registry metadata row exists in `market_indicators` (idempotent)
  if (regTemplate) {
    await db
      .insert(marketIndicators)
      .values({
        ...regTemplate,
        value: null,
        previousValue: null,
        asOfTimestamp: null,
        fetchedAt: null,
      })
      .onConflictDoNothing({ target: marketIndicators.code });
  }

  // Read current indicator row before mutation to determine exact snapshot transition
  const existingRows = await db
    .select()
    .from(marketIndicators)
    .where(eq(marketIndicators.code, indicatorCode))
    .limit(1);
  const currentIndicator: MarketIndicatorRecord | undefined = existingRows[0];

  // 2. Idempotent insert into `market_price_history` using unique index (instrument_code, observed_at, source_name)
  const insertedHistory = await db
    .insert(marketPriceHistory)
    .values({
      instrumentCode: observation.indicatorCode,
      instrumentType,
      value: observation.value,
      unit: observation.unit,
      currency: observation.currency,
      observedAt: observedAtDate,
      fetchedAt: fetchedAtDate,
      sourceName: observation.sourceName,
      sourceUrl: observation.sourceUrl,
      providerId: observation.providerId,
    })
    .onConflictDoNothing({
      target: [
        marketPriceHistory.instrumentCode,
        marketPriceHistory.observedAt,
        marketPriceHistory.sourceName,
      ],
    })
    .returning({ id: marketPriceHistory.id });

  const historyAction: HistoryWriteAction =
    insertedHistory.length > 0 ? "inserted" : "duplicate_skipped";

  // 3. Atomic snapshot update in `market_indicators`
  // Only update if `as_of_timestamp IS NULL` (first observation) OR `as_of_timestamp < observedAtDate` (strictly newer observation).
  let snapshotAction: SnapshotWriteAction = "none";
  let finalIndicator: MarketIndicatorRecord | undefined = currentIndicator;
  let indicatorUpdatedCount = 0;

  const currentAsOfMs = currentIndicator?.asOfTimestamp
    ? new Date(currentIndicator.asOfTimestamp).getTime()
    : null;
  const candidateObsMs = observedAtDate.getTime();

  if (currentAsOfMs !== null && candidateObsMs < currentAsOfMs) {
    // Older observation: never overwrite a newer current snapshot
    snapshotAction = "rejected_older_observation";
  } else if (currentAsOfMs !== null && candidateObsMs === currentAsOfMs) {
    // Duplicate observation timestamp: preserve `value` and `previous_value` untouched
    snapshotAction = "duplicate_unchanged";
  } else {
    // First observation (`currentAsOfMs === null`) OR strictly newer observation (`candidateObsMs > currentAsOfMs`)
    const updatedRows = await db
      .update(marketIndicators)
      .set({
        previousValue: sql`CASE WHEN ${marketIndicators.asOfTimestamp} IS NULL THEN ${marketIndicators.previousValue} WHEN ${marketIndicators.asOfTimestamp} < ${observedAtDate} THEN ${marketIndicators.value} ELSE ${marketIndicators.previousValue} END`,
        value: observation.value,
        asOfTimestamp: observedAtDate,
        fetchedAt: fetchedAtDate,
        sourceName: observation.sourceName,
        sourceUrl: observation.sourceUrl,
        providerId: observation.providerId,
        attributionText: observation.attributionText,
        isStaleFallback: false,
        updatedAt: fetchedAtDate,
      })
      .where(
        and(
          eq(marketIndicators.code, observation.indicatorCode),
          or(
            isNull(marketIndicators.asOfTimestamp),
            lt(marketIndicators.asOfTimestamp, observedAtDate)
          )
        )
      )
      .returning();

    if (updatedRows.length > 0) {
      finalIndicator = updatedRows[0];
      indicatorUpdatedCount = 1;
      snapshotAction =
        currentAsOfMs === null
          ? "initialized_first_value"
          : "updated_newer_observation";
    } else {
      snapshotAction = "duplicate_unchanged";
    }
  }

  const recordsUpdated = insertedHistory.length + indicatorUpdatedCount;

  return {
    indicatorCode,
    providerId: adapter.providerId,
    status: "success",
    historyAction,
    snapshotAction,
    recordsUpdated,
    observation,
    indicatorSnapshot: finalIndicator
      ? {
          code: finalIndicator.code,
          value: finalIndicator.value,
          previousValue: finalIndicator.previousValue,
          asOfTimestamp: finalIndicator.asOfTimestamp
            ? new Date(finalIndicator.asOfTimestamp).toISOString()
            : null,
          fetchedAt: finalIndicator.fetchedAt
            ? new Date(finalIndicator.fetchedAt).toISOString()
            : null,
          sourceName: finalIndicator.sourceName,
          sourceUrl: finalIndicator.sourceUrl,
        }
      : null,
  };
}

/**
 * Executes a controlled market data ingestion batch with cooldown protection and `automation_logs` recording.
 * - Defaults to `["USD_IDR"]` (Frankfurter API v2).
 * - When `dryRun: true`, performs zero database writes (including zero writes to `automation_logs`).
 * - When blocked by cooldown/concurrency, returns `status: "cooldown"` without writing duplicate rows to `automation_logs`.
 */
export async function executeMarketDataIngestion(options?: {
  indicators?: ReadonlyArray<SupportedIndicatorCode>;
  dryRun?: boolean;
  cooldownSeconds?: number;
  bypassCooldown?: boolean;
  jobName?: string;
  ctx?: ProviderExecutionContext;
}): Promise<MarketDataSyncBatchResult> {
  const dryRun = options?.dryRun === true;
  const indicators: ReadonlyArray<SupportedIndicatorCode> =
    options?.indicators && options.indicators.length > 0
      ? options.indicators
      : DEFAULT_LIVE_INGESTION_INDICATORS;

  const uniqueProviders = Array.from(
    new Set(
      indicators.map(
        (c) => getIndicatorProviderMapping(c)?.providerId || "frankfurter"
      )
    )
  );
  const primaryProvider =
    uniqueProviders.length === 1 ? uniqueProviders[0] : "multi_provider";

  const jobName =
    options?.jobName ||
    (indicators.length === 1 && indicators[0] === "USD_IDR"
      ? "sync_market_data_usd_idr"
      : uniqueProviders.length === 1 && uniqueProviders[0] === "fred"
        ? `sync_market_data_fred_${indicators.map((i) => i.toLowerCase()).join("_")}`
        : "sync_market_data_batch");

  const cooldownSeconds =
    options?.cooldownSeconds ?? DEFAULT_MARKET_SYNC_COOLDOWN_SECONDS;
  const cooldownMs = cooldownSeconds * 1000;
  const state = getCooldownState();
  const startMs = Date.now();

  if (!dryRun && !options?.bypassCooldown) {
    if (state.inProgress) {
      return {
        ok: false,
        status: "cooldown",
        retryAfterSeconds: 5,
        message: "Market data ingestion is currently in progress.",
      };
    }

    const providerLastCompletedMs =
      state.lastCompletedAtByProvider[primaryProvider] ?? 0;

    if (
      providerLastCompletedMs > 0 &&
      startMs - providerLastCompletedMs < cooldownMs
    ) {
      // Verify against database `fetched_at` so a test-suite DB reset clears stale in-memory cooldown
      let dbAlsoWithinCooldown = true;
      try {
        const primaryCode = indicators[0];
        const [indRow] = await db
          .select({ fetchedAt: marketIndicators.fetchedAt })
          .from(marketIndicators)
          .where(eq(marketIndicators.code, primaryCode))
          .limit(1);
        if (!indRow || !indRow.fetchedAt) {
          dbAlsoWithinCooldown = false;
          state.lastCompletedAtByProvider[primaryProvider] = 0;
          state.lastCompletedAtMs = 0;
        }
      } catch {
        // Keep in-memory cooldown if DB check fails
      }

      if (dbAlsoWithinCooldown) {
        const retryAfterSeconds = Math.max(
          1,
          Math.ceil((cooldownMs - (startMs - providerLastCompletedMs)) / 1000)
        );
        return {
          ok: false,
          status: "cooldown",
          retryAfterSeconds,
          message: `Market data sync cooldown active. Retry after ${retryAfterSeconds} seconds.`,
        };
      }
    }
  }

  if (!dryRun) {
    state.inProgress = true;
  }

  try {
    const results: SingleIndicatorIngestionResult[] = [];
    let totalRecordsUpdated = 0;
    let successCount = 0;
    let errorCount = 0;
    let rateLimitedCount = 0;
    const errorMessages: string[] = [];

    for (const code of indicators) {
      const itemRes = await ingestSingleIndicator(code, {
        dryRun,
        ctx: options?.ctx,
      });
      results.push(itemRes);
      totalRecordsUpdated += itemRes.recordsUpdated;

      if (itemRes.status === "success") {
        successCount++;
      } else if (itemRes.status === "error") {
        errorCount++;
        if (itemRes.error?.code === "HTTP_RATE_LIMITED") {
          rateLimitedCount++;
        }
        if (itemRes.error?.message) {
          errorMessages.push(`${code}: ${itemRes.error.message}`);
        }
      }
    }

    const durationMs = Math.max(0, Date.now() - startMs);

    if (dryRun) {
      if (errorCount > 0 && successCount === 0) {
        return {
          ok: false,
          status: "error",
          dryRun: true,
          jobName,
          provider: primaryProvider,
          durationMs,
          automationLogId: null,
          error: sanitizeAutomationError(
            redactProviderSecrets(errorMessages.join(" | ") || "Dry-run validation failed.")
          ),
          results,
        };
      }

      return {
        ok: true,
        status: "dry_run_completed",
        dryRun: true,
        jobName,
        provider: primaryProvider,
        totalRecordsUpdated: 0,
        durationMs,
        automationLogId: null,
        results,
      };
    }

    // Determine AutomationJobStatus for `automation_logs`
    let logStatus: AutomationJobStatus = "success";
    if (errorCount > 0) {
      if (rateLimitedCount > 0 && successCount === 0) {
        logStatus = "rate_limited";
      } else if (successCount > 0) {
        logStatus = "partial_failure";
      } else {
        logStatus = "error";
      }
    }

    const sanitizedErrorSummary =
      errorMessages.length > 0
        ? sanitizeAutomationError(redactProviderSecrets(errorMessages.join(" | ")))
        : null;

    const insertedLogs = await db
      .insert(automationLogs)
      .values({
        jobName,
        provider: primaryProvider,
        status: logStatus,
        recordsUpdated: totalRecordsUpdated,
        durationMs,
        errorSummary: sanitizedErrorSummary,
        executedAt: new Date(),
      })
      .returning({ id: automationLogs.id });

    const automationLogId = insertedLogs[0]?.id ?? null;

    if (errorCount === 0 && successCount > 0) {
      const doneAt = Date.now();
      state.lastCompletedAtMs = doneAt;
      state.lastCompletedAtByProvider[primaryProvider] = doneAt;
    }

    if (errorCount > 0 && successCount === 0) {
      return {
        ok: false,
        status: "error",
        dryRun: false,
        jobName,
        provider: primaryProvider,
        durationMs,
        automationLogId,
        error: sanitizedErrorSummary || "Market data ingestion failed.",
        results,
      };
    }

    return {
      ok: true,
      status: "completed",
      dryRun: false,
      jobName,
      provider: primaryProvider,
      totalRecordsUpdated,
      durationMs,
      automationLogId,
      results,
    };
  } catch (err) {
    const durationMs = Math.max(0, Date.now() - startMs);
    const sanitized = sanitizeAutomationError(redactProviderSecrets(err));
    let automationLogId: number | null = null;

    if (!dryRun) {
      try {
        const insertedLogs = await db
          .insert(automationLogs)
          .values({
            jobName,
            provider: primaryProvider,
            status: "error",
            recordsUpdated: 0,
            durationMs,
            errorSummary: sanitized,
            executedAt: new Date(),
          })
          .returning({ id: automationLogs.id });
        automationLogId = insertedLogs[0]?.id ?? null;
      } catch {
        // Ignore secondary logging error
      }
    }

    return {
      ok: false,
      status: "error",
      dryRun,
      jobName,
      provider: primaryProvider,
      durationMs,
      automationLogId,
      error: sanitized,
      results: [],
    };
  } finally {
    if (!dryRun) {
      state.inProgress = false;
    }
  }
}

export interface AdminIndicatorSnapshotItem {
  code: string;
  value: string | null;
  previousValue: string | null;
  unit: string;
  currency: string;
  updateFrequency: string;
  asOfTimestamp: string | null;
  fetchedAt: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  providerId: string | null;
}

export interface MarketDataSyncHistorySnapshot {
  indicator: AdminIndicatorSnapshotItem | null;
  indicators: Record<"USD_IDR" | "FED_FUNDS" | "US_10Y", AdminIndicatorSnapshotItem | null>;
  providerStatus: {
    frankfurter: {
      providerId: "frankfurter";
      configured: boolean;
      readinessStatus: "ready";
      apiKeyEnvVar: null;
    };
    fred: {
      providerId: "fred";
      enabled: false;
      configured: false;
      readinessStatus: "blocked_legal_review";
      complianceReason: string;
    };
  };
  logs: Array<{
    id: number;
    jobName: string;
    provider: string;
    status: AutomationJobStatus;
    recordsUpdated: number;
    durationMs: number;
    errorSummary: string | null;
    executedAt: string;
  }>;
}

function mapAdminIndicatorRow(
  ind: MarketIndicatorRecord | undefined
): AdminIndicatorSnapshotItem | null {
  if (!ind) return null;
  return {
    code: ind.code,
    value: ind.value,
    previousValue: ind.previousValue,
    unit: ind.unit,
    currency: ind.currency,
    updateFrequency: ind.updateFrequency,
    asOfTimestamp: ind.asOfTimestamp
      ? new Date(ind.asOfTimestamp).toISOString()
      : null,
    fetchedAt: ind.fetchedAt ? new Date(ind.fetchedAt).toISOString() : null,
    sourceName: ind.sourceName,
    sourceUrl: ind.sourceUrl,
    providerId: ind.providerId,
  };
}

/**
 * TASK 6 & PHASE 3D-2A — Admin-only query helper to inspect current
 * `USD_IDR`, `FED_FUNDS`, and `US_10Y` snapshots, provider compliance status,
 * and recent `automation_logs` entries from the admin workspace (`/studio`).
 */
export async function getRecentMarketDataSyncHistory(
  limit = 10
): Promise<MarketDataSyncHistorySnapshot> {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));

  const [indRows, logRows] = await Promise.all([
    db
      .select()
      .from(marketIndicators)
      .where(
        inArray(marketIndicators.code, ["USD_IDR", "FED_FUNDS", "US_10Y"])
      ),
    db
      .select()
      .from(automationLogs)
      .orderBy(desc(automationLogs.executedAt), desc(automationLogs.id))
      .limit(safeLimit),
  ]);

  const rowMap = new Map<string, MarketIndicatorRecord>();
  for (const r of indRows) {
    rowMap.set(r.code, r);
  }

  const usdIdrSnap = mapAdminIndicatorRow(rowMap.get("USD_IDR"));
  const fedFundsSnap = mapAdminIndicatorRow(rowMap.get("FED_FUNDS"));
  const us10ySnap = mapAdminIndicatorRow(rowMap.get("US_10Y"));

  return {
    indicator: usdIdrSnap,
    indicators: {
      USD_IDR: usdIdrSnap,
      FED_FUNDS: fedFundsSnap,
      US_10Y: us10ySnap,
    },
    providerStatus: {
      frankfurter: {
        providerId: "frankfurter",
        configured: true,
        readinessStatus: "ready",
        apiKeyEnvVar: null,
      },
      fred: {
        providerId: "fred",
        enabled: false,
        configured: false,
        readinessStatus: "blocked_legal_review",
        complianceReason: FRED_COMPLIANCE_BLOCK_REASON,
      },
    },
    logs: logRows.map((l) => ({
      id: l.id,
      jobName: l.jobName,
      provider: l.provider,
      status: l.status,
      recordsUpdated: l.recordsUpdated,
      durationMs: l.durationMs,
      errorSummary: l.errorSummary
        ? sanitizeAutomationError(redactProviderSecrets(l.errorSummary))
        : null,
      executedAt: new Date(l.executedAt).toISOString(),
    })),
  };
}
