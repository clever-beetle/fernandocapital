import { db } from "@/db";
import {
  marketIndicators,
  marketPriceHistory,
  type MarketIndicatorRecord,
  type MarketPriceHistoryRecord,
} from "@/db/schema";
import {
  calculateDeterministicChangePercent,
  INITIAL_MARKET_INDICATOR_REGISTRY,
} from "@/lib/financial-registry";
import { formatWibDateTime } from "@/lib/gold-pricing";
import {
  FRED_LEGAL_URL,
  FRED_REQUIRED_LEGAL_NOTICE,
  FRED_SERIES_SPECIFICATIONS,
  FRED_TERMS_OF_USE_URL,
  INDICATOR_PROVIDER_MATRIX,
  type ProviderReadinessStatus,
  type SupportedIndicatorCode,
} from "@/lib/market-data/providers";
import { desc, eq } from "drizzle-orm";

/**
 * PHASE 3D-1 — SERVER-SIDE FINANCIAL DATA READ REPOSITORY
 *
 * Read-only server-side data access and deterministic view-model builders for
 * `market_indicators` and `market_price_history`.
 *
 * Strict Governance Rules:
 * - Never calls external data providers from the browser or during page render.
 * - Preserves exact decimal strings from PostgreSQL (`numeric(20, 6)`) alongside validated numbers.
 * - Evaluates data freshness (`fresh`, `stale`, `not_yet_populated`, `unavailable`) against
 *   each indicator's configured `freshness_sla_seconds`.
 * - When an observation becomes stale, preserves the last verified value and observation date,
 *   marking `freshnessStatus = "stale"` without substituting fabricated fallback values.
 * - Never exposes raw SQL errors, database stack traces, or credentials.
 */

export type IndicatorFreshnessStatus =
  | "fresh"
  | "stale"
  | "not_yet_populated"
  | "unavailable";

export interface FreshnessEvaluation {
  status: IndicatorFreshnessStatus;
  label: string;
  badgeText: string;
  isStale: boolean;
  ageSeconds: number | null;
}

export interface MarketIndicatorView {
  code: SupportedIndicatorCode;
  name: string;
  category: string;
  /**
   * Exact decimal string from PostgreSQL `numeric(20, 6)` (e.g. `"18231.000000"` or `"15845.250000"`).
   * Remains `null` when no verified observation exists.
   */
  value: string | null;
  /**
   * Trimmed decimal display string (e.g. `"18231"` or `"15845.25"`), preserving non-zero fractional precision.
   */
  trimmedDecimalValue: string | null;
  numericValue: number | null;
  previousValue: string | null;
  previousNumericValue: number | null;
  changePercent: number | null;
  unit: string;
  currency: string;
  marketTimezone: string;
  updateFrequency: string;
  freshnessSlaSeconds: number;
  asOfTimestamp: string | null;
  sourceDate: string | null;
  asOfFormattedWib: string | null;
  fetchedAt: string | null;
  fetchedAtFormattedWib: string | null;
  freshnessStatus: IndicatorFreshnessStatus;
  freshnessLabel: string;
  freshnessBadgeText: string;
  isStale: boolean;
  readinessStatus: ProviderReadinessStatus;
  sourceType: string;
  sourceName: string;
  sourceUrl: string | null;
  providerId: string | null;
  externalSeriesId: string | null;
  officialSeriesName: string | null;
  nativeFrequencyLabel: string;
  requiresFredAttribution: boolean;
  attributionText: string;
  methodology: string;
  classificationLabel: string;
  unavailableTitle: string | null;
  unavailableExplanation: string | null;
}

export interface MarketPriceHistoryPoint {
  id: number;
  instrumentCode: string;
  instrumentType: string;
  /**
   * Exact decimal string from PostgreSQL `numeric(20, 6)`.
   */
  value: string;
  trimmedDecimalValue: string;
  numericValue: number;
  unit: string;
  currency: string;
  observedAt: string;
  sourceDate: string;
  observedDateLabelWib: string;
  fetchedAt: string;
  sourceName: string;
  providerId: string | null;
}

export interface UsdIdrHistoryChartState {
  status: "ready" | "insufficient_history" | "empty" | "unavailable";
  canRenderChart: boolean;
  pointCount: number;
  points: MarketPriceHistoryPoint[];
  latestPoint: MarketPriceHistoryPoint | null;
  firstPoint: MarketPriceHistoryPoint | null;
  changeAmount: number | null;
  changePercent: number | null;
  unitLabel: "IDR per USD";
  sourceAttribution: "European Central Bank (ECB) Reference Rate via Frankfurter";
  classificationNote: "Daily Reference Exchange Rate (Non-JISDOR / Bukan Kurs Resmi Bank Indonesia)";
  message: string;
}

export interface DashboardMarketOverviewData {
  indicators: Record<SupportedIndicatorCode, MarketIndicatorView>;
  usdIdrHistory: UsdIdrHistoryChartState;
  queryOk: boolean;
}

const ALL_INDICATOR_CODES: ReadonlyArray<SupportedIndicatorCode> = [
  "USD_IDR",
  "XAU_USD",
  "IHSG",
  "BI_RATE",
  "SBN_10Y",
  "ANTAM_1G_IDR",
  "ID_CPI_YOY",
  "ID_GDP",
  "FED_FUNDS",
  "US_10Y",
];

/**
 * Strips trailing zeroes after the decimal point while preserving all significant fractional digits.
 * Example: `"18231.000000"` -> `"18231"`, `"15845.250000"` -> `"15845.25"`.
 */
export function trimDecimalString(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (!trimmed.includes(".")) return trimmed;
  return trimmed.replace(/\.?0+$/, "");
}

/**
 * Deterministically formats an IDR-per-USD decimal string or number for Indonesian display,
 * preserving significant fractional digits when present (e.g. `Rp 18.231` or `Rp 15.845,25`).
 */
export function formatIdrPerUsdDisplay(
  raw: string | number | null | undefined
): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const trimmed = trimDecimalString(String(raw));
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return null;

  const hasFraction = trimmed.includes(".");
  const fractionDigits = hasFraction
    ? Math.min(4, Math.max(2, (trimmed.split(".")[1] || "").length))
    : 0;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

/**
 * Deterministically formats a percentage indicator value (such as FRED `DFF` or `DGS10`),
 * preserving exact non-zero decimal precision from the database observation (e.g. `4.58%` or `4.4125%`).
 * Returns `null` when the value is `null`, `undefined`, or non-numeric.
 */
export function formatPercentIndicatorDisplay(
  raw: string | number | null | undefined
): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const trimmed = trimDecimalString(String(raw));
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  return `${trimmed}%`;
}

/**
 * Formats an observation date (`YYYY-MM-DD` or ISO timestamp) in `Asia/Jakarta` short date format.
 */
export function formatWibDateOnly(input: Date | string | null | undefined): string | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (!Number.isFinite(d.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
}

/**
 * Formats a full timestamp in `Asia/Jakarta` (`WIB`).
 */
export function formatWibTimestamp(
  input: Date | string | null | undefined
): string | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  if (!Number.isFinite(d.getTime())) return null;
  return `${formatWibDateTime(d)} WIB`;
}

/**
 * TASK 5 — Evaluates data freshness against configured `freshness_sla_seconds`.
 * Supports:
 * - `fresh`
 * - `stale` (preserves last verified value and observation date)
 * - `not_yet_populated`
 * - `unavailable`
 */
export function evaluateIndicatorFreshness(params: {
  value: string | null | undefined;
  asOfTimestamp: Date | string | null | undefined;
  fetchedAt: Date | string | null | undefined;
  freshnessSlaSeconds: number;
  isStaleFallback?: boolean;
  now?: Date;
  queryFailed?: boolean;
}): FreshnessEvaluation {
  if (params.queryFailed) {
    return {
      status: "unavailable",
      label: "Unavailable",
      badgeText: "Unavailable • Gangguan Koneksi Data",
      isStale: false,
      ageSeconds: null,
    };
  }

  if (
    params.value === null ||
    params.value === undefined ||
    String(params.value).trim() === ""
  ) {
    return {
      status: "not_yet_populated",
      label: "Not Yet Populated",
      badgeText: "Not Yet Populated • Belum Ada Observasi",
      isStale: false,
      ageSeconds: null,
    };
  }

  const num = Number(params.value);
  if (!Number.isFinite(num)) {
    return {
      status: "unavailable",
      label: "Unavailable",
      badgeText: "Unavailable • Nilai Tidak Valid",
      isStale: false,
      ageSeconds: null,
    };
  }

  const nowMs = (params.now ?? new Date()).getTime();
  const slaSeconds =
    Number.isFinite(params.freshnessSlaSeconds) && params.freshnessSlaSeconds > 0
      ? params.freshnessSlaSeconds
      : 86400;

  // Evaluate freshness against the observation date (`asOfTimestamp`) and `fetchedAt`.
  // For daily reference rates where `asOfTimestamp` is `YYYY-MM-DDT00:00:00Z`, add 24h end-of-day grace
  // so an observation dated today or yesterday within the SLA window is evaluated accurately.
  const asOfMs = params.asOfTimestamp ? new Date(params.asOfTimestamp).getTime() : NaN;
  const fetchedMs = params.fetchedAt ? new Date(params.fetchedAt).getTime() : NaN;

  // If neither timestamp is valid, treat as stale fallback
  if (!Number.isFinite(asOfMs) && !Number.isFinite(fetchedMs)) {
    return {
      status: "stale",
      label: "Stale",
      badgeText: "Stale • Timestamp Observasi Tidak Lengkap",
      isStale: true,
      ageSeconds: null,
    };
  }

  // Primary age check uses `asOfTimestamp` (the market observation date).
  // Because daily reference dates (`YYYY-MM-DDT00:00:00Z`) start at 00:00 UTC of the observation day,
  // we measure elapsed time from the end of that observation day (`asOfMs + 86400_000`) when `asOfMs` is midnight UTC,
  // or directly `nowMs - asOfMs` otherwise.
  let effectiveReferenceMs = Number.isFinite(asOfMs) ? asOfMs : fetchedMs;
  if (Number.isFinite(asOfMs)) {
    const asOfDate = new Date(asOfMs);
    const isMidnightUtc =
      asOfDate.getUTCHours() === 0 &&
      asOfDate.getUTCMinutes() === 0 &&
      asOfDate.getUTCSeconds() === 0;
    if (isMidnightUtc) {
      effectiveReferenceMs = asOfMs + 24 * 60 * 60 * 1000;
    }
  }

  const ageSeconds = Math.max(0, Math.floor((nowMs - effectiveReferenceMs) / 1000));
  const exceedsSla = ageSeconds > slaSeconds;

  if (params.isStaleFallback === true || exceedsSla) {
    return {
      status: "stale",
      label: "Stale",
      badgeText: "Stale • Melewati Batas SLA (Nilai Terakhir Dipertahankan)",
      isStale: true,
      ageSeconds,
    };
  }

  return {
    status: "fresh",
    label: "Fresh",
    badgeText: "Fresh • Terverifikasi dalam SLA",
    isStale: false,
    ageSeconds,
  };
}

function getUnavailableMetadata(
  code: SupportedIndicatorCode,
  readinessStatus: ProviderReadinessStatus,
  freshnessStatus: IndicatorFreshnessStatus
): { title: string | null; explanation: string | null } {
  if (freshnessStatus === "fresh" || freshnessStatus === "stale") {
    return { title: null, explanation: null };
  }

  if (freshnessStatus === "unavailable") {
    return {
      title: "Data Sementara Tidak Tersedia",
      explanation:
        "Koneksi ke repositori indikator sedang mengalami gangguan. Tidak ada nilai estimasi atau angka pengganti yang ditampilkan.",
    };
  }

  switch (code) {
    case "XAU_USD":
      return {
        title: "Belum Aktif (Provider Disabled)",
        explanation:
          "Integrasi otomatis Twelve Data (XAU/USD) dinonaktifkan sementara menunggu verifikasi lisensi redistribusi komersial.",
      };
    case "IHSG":
      return {
        title: "Belum Tersedia (Pending Lisensi IDX)",
        explanation:
          "Penayangan otomatis Indeks Harga Saham Gabungan (BEI / IDX) menunggu verifikasi lisensi distribusi data pasar.",
      };
    case "BI_RATE":
      return {
        title: "Belum Diisi (Menunggu Verifikasi Editor)",
        explanation:
          "Indikator suku bunga kebijakan RDG Bank Indonesia (BI-Rate) dikelola melalui verifikasi editor (30% Human Oversight) dan belum diisi pada basis data.",
      };
    case "SBN_10Y":
      return {
        title: "Belum Diisi (Menunggu Verifikasi Editor)",
        explanation:
          "Imbal hasil benchmark SBN 10 Tahun (PHEI / IBPA) dikelola melalui verifikasi editor (30% Human Oversight) dan belum diisi pada basis data.",
      };
    case "ID_CPI_YOY":
    case "ID_GDP":
      return {
        title: "Belum Aktif (Provider Blocked)",
        explanation:
          "Menunggu konfigurasi BPS_API_KEY dan verifikasi katalog kode variabel resmi Badan Pusat Statistik (BPS RI).",
      };
    case "FED_FUNDS":
      return {
        title: "Belum Aktif (Ditangguhkan — Review Kepatuhan FRED)",
        explanation:
          "Integrasi otomatis Federal Funds Effective Rate (H.15 / DFF) dinonaktifkan sementara karena pembatasan penyimpanan basis data dan penggunaan AI pada FRED Terms of Use.",
      };
    case "US_10Y":
      return {
        title: "Belum Aktif (Ditangguhkan — Review Kepatuhan FRED)",
        explanation:
          "Integrasi otomatis Imbal Hasil US Treasury 10 Tahun (H.15 / DGS10) dinonaktifkan sementara karena pembatasan penyimpanan basis data dan penggunaan AI pada FRED Terms of Use.",
      };
    default:
      return {
        title: `Belum Diisi (${readinessStatus})`,
        explanation:
          "Observasi terverifikasi belum tersedia pada basis data untuk indikator ini.",
      };
  }
}

/**
 * Deterministically constructs a `MarketIndicatorView` from a PostgreSQL row (or registry template if unseeded/failed).
 */
export function buildMarketIndicatorView(
  code: SupportedIndicatorCode,
  row: MarketIndicatorRecord | null | undefined,
  options?: { now?: Date; queryFailed?: boolean }
): MarketIndicatorView {
  const mapping = INDICATOR_PROVIDER_MATRIX[code];
  const regTemplate = INITIAL_MARKET_INDICATOR_REGISTRY.find((r) => r.code === code);

  const rawValue = options?.queryFailed ? null : (row?.value ?? null);
  const trimmedVal = trimDecimalString(rawValue);
  const numVal =
    trimmedVal !== null && Number.isFinite(Number(trimmedVal))
      ? Number(trimmedVal)
      : null;

  const rawPrev = options?.queryFailed ? null : (row?.previousValue ?? null);
  const trimmedPrev = trimDecimalString(rawPrev);
  const numPrev =
    trimmedPrev !== null && Number.isFinite(Number(trimmedPrev))
      ? Number(trimmedPrev)
      : null;

  const slaSeconds =
    row?.freshnessSlaSeconds ??
    mapping?.freshnessSlaSeconds ??
    regTemplate?.freshnessSlaSeconds ??
    86400;

  const freshness = evaluateIndicatorFreshness({
    value: rawValue,
    asOfTimestamp: row?.asOfTimestamp ?? null,
    fetchedAt: row?.fetchedAt ?? null,
    freshnessSlaSeconds: slaSeconds,
    isStaleFallback: row?.isStaleFallback ?? false,
    now: options?.now,
    queryFailed: options?.queryFailed,
  });

  const asOfIso =
    row?.asOfTimestamp && !options?.queryFailed
      ? new Date(row.asOfTimestamp).toISOString()
      : null;
  const sourceDate = asOfIso ? asOfIso.slice(0, 10) : null;
  const asOfFormattedWib = asOfIso ? formatWibDateOnly(asOfIso) : null;

  const fetchedIso =
    row?.fetchedAt && !options?.queryFailed
      ? new Date(row.fetchedAt).toISOString()
      : null;
  const fetchedAtFormattedWib = fetchedIso ? formatWibTimestamp(fetchedIso) : null;

  const readinessStatus = mapping?.readinessStatus ?? "editor_verified";
  const unavailableMeta = getUnavailableMetadata(
    code,
    readinessStatus,
    freshness.status
  );

  const classificationLabel =
    code === "USD_IDR"
      ? "Daily Reference Exchange Rate (Non-JISDOR / Bukan Kurs Resmi Bank Indonesia)"
      : code === "FED_FUNDS"
        ? "H.15 Selected Interest Rates • Daily, 7-Day Reference Release (FRED Series: DFF)"
        : code === "US_10Y"
          ? "H.15 Selected Interest Rates • Daily Constant Maturity Reference Yield (FRED Series: DGS10)"
          : mapping?.methodology || "Indikator Pasar & Makroekonomi Terverifikasi";

  const fredSpec =
    code === "FED_FUNDS" || code === "US_10Y"
      ? FRED_SERIES_SPECIFICATIONS[code]
      : null;

  return {
    code,
    name: row?.name ?? regTemplate?.name ?? code,
    category: row?.category ?? regTemplate?.category ?? "fx",
    value: numVal !== null ? rawValue : null,
    trimmedDecimalValue: numVal !== null ? trimmedVal : null,
    numericValue: numVal,
    previousValue: numPrev !== null ? rawPrev : null,
    previousNumericValue: numPrev,
    changePercent: calculateDeterministicChangePercent(numVal, numPrev),
    unit: row?.unit ?? mapping?.unit ?? regTemplate?.unit ?? "NONE",
    currency: row?.currency ?? mapping?.currency ?? regTemplate?.currency ?? "NONE",
    marketTimezone:
      row?.marketTimezone ??
      mapping?.timezone ??
      regTemplate?.marketTimezone ??
      "Asia/Jakarta",
    updateFrequency:
      row?.updateFrequency ??
      mapping?.frequency ??
      regTemplate?.updateFrequency ??
      "daily_eod",
    freshnessSlaSeconds: slaSeconds,
    asOfTimestamp: asOfIso,
    sourceDate,
    asOfFormattedWib,
    fetchedAt: fetchedIso,
    fetchedAtFormattedWib,
    freshnessStatus: freshness.status,
    freshnessLabel: freshness.label,
    freshnessBadgeText: freshness.badgeText,
    isStale: freshness.isStale,
    readinessStatus,
    sourceType: row?.sourceType ?? regTemplate?.sourceType ?? "api_auto",
    sourceName:
      row?.sourceName ||
      mapping?.sourceName ||
      regTemplate?.sourceName ||
      "European Central Bank (ECB) Reference Rate via Frankfurter",
    sourceUrl: row?.sourceUrl ?? mapping?.sourceUrl ?? regTemplate?.sourceUrl ?? null,
    providerId: row?.providerId ?? mapping?.providerId ?? regTemplate?.providerId ?? null,
    externalSeriesId: fredSpec?.seriesId ?? mapping?.externalSeriesId ?? null,
    officialSeriesName: fredSpec?.officialName ?? null,
    nativeFrequencyLabel:
      fredSpec?.nativeFrequency ??
      (mapping?.frequency === "daily_eod"
        ? "Daily (End of Day)"
        : mapping?.frequency || "Daily"),
    requiresFredAttribution: code === "FED_FUNDS" || code === "US_10Y",
    attributionText:
      row?.attributionText ||
      mapping?.attributionText ||
      regTemplate?.attributionText ||
      "Sumber Resmi Terverifikasi",
    methodology: mapping?.methodology || "",
    classificationLabel,
    unavailableTitle: unavailableMeta.title,
    unavailableExplanation: unavailableMeta.explanation,
  };
}

export {
  FRED_LEGAL_URL,
  FRED_REQUIRED_LEGAL_NOTICE,
  FRED_SERIES_SPECIFICATIONS,
  FRED_TERMS_OF_USE_URL,
};

/**
 * TASK 4 — Pure, deterministic builder for Historical `USD_IDR` chart state.
 * - Filters valid positive finite points.
 * - Sorts points chronologically ascending by `observedAt` (`observed_at ASC`).
 * - Enables chart rendering (`canRenderChart: true`) ONLY when at least 2 valid observations exist.
 * - With 1 observation, returns `status: "insufficient_history"` (`canRenderChart: false`) and a clear explanation.
 */
export function prepareUsdIdrHistoryChartState(
  rawRows: ReadonlyArray<MarketPriceHistoryRecord>,
  options?: { queryFailed?: boolean }
): UsdIdrHistoryChartState {
  const baseMeta = {
    unitLabel: "IDR per USD" as const,
    sourceAttribution:
      "European Central Bank (ECB) Reference Rate via Frankfurter" as const,
    classificationNote:
      "Daily Reference Exchange Rate (Non-JISDOR / Bukan Kurs Resmi Bank Indonesia)" as const,
  };

  if (options?.queryFailed) {
    return {
      ...baseMeta,
      status: "unavailable",
      canRenderChart: false,
      pointCount: 0,
      points: [],
      latestPoint: null,
      firstPoint: null,
      changeAmount: null,
      changePercent: null,
      message:
        "Data riwayat nilai tukar USD/IDR sementara tidak dapat dimuat dari basis data.",
    };
  }

  const validPoints: MarketPriceHistoryPoint[] = [];
  for (const row of rawRows) {
    if (!row || row.instrumentCode !== "USD_IDR") continue;
    const trimmed = trimDecimalString(row.value);
    if (!trimmed) continue;
    const num = Number(trimmed);
    if (!Number.isFinite(num) || num <= 0) continue;

    const obsDate = new Date(row.observedAt);
    const fetchedDate = new Date(row.fetchedAt);
    if (!Number.isFinite(obsDate.getTime())) continue;

    const obsIso = obsDate.toISOString();
    const sourceDate = obsIso.slice(0, 10);

    validPoints.push({
      id: row.id,
      instrumentCode: row.instrumentCode,
      instrumentType: row.instrumentType,
      value: String(row.value),
      trimmedDecimalValue: trimmed,
      numericValue: num,
      unit: row.unit,
      currency: row.currency,
      observedAt: obsIso,
      sourceDate,
      observedDateLabelWib: formatWibDateOnly(obsDate) || sourceDate,
      fetchedAt: Number.isFinite(fetchedDate.getTime())
        ? fetchedDate.toISOString()
        : obsIso,
      sourceName: row.sourceName,
      providerId: row.providerId ?? null,
    });
  }

  // Sort chronologically ascending by observedAt
  validPoints.sort(
    (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
  );

  if (validPoints.length === 0) {
    return {
      ...baseMeta,
      status: "empty",
      canRenderChart: false,
      pointCount: 0,
      points: [],
      latestPoint: null,
      firstPoint: null,
      changeAmount: null,
      changePercent: null,
      message:
        "Belum ada observasi historis USD/IDR di dalam tabel market_price_history.",
    };
  }

  if (validPoints.length === 1) {
    const only = validPoints[0];
    return {
      ...baseMeta,
      status: "insufficient_history",
      canRenderChart: false,
      pointCount: 1,
      points: validPoints,
      latestPoint: only,
      firstPoint: only,
      changeAmount: null,
      changePercent: null,
      message: `Saat ini baru terdapat 1 observasi terverifikasi (${only.sourceDate}: ${formatIdrPerUsdDisplay(
        only.trimmedDecimalValue
      )} per USD). Grafik tren historis membutuhkan minimal 2 titik observasi harian dari European Central Bank via Frankfurter.`,
    };
  }

  const firstPoint = validPoints[0];
  const latestPoint = validPoints[validPoints.length - 1];
  const changeAmount = Number(
    (latestPoint.numericValue - firstPoint.numericValue).toFixed(4)
  );
  const changePercent = calculateDeterministicChangePercent(
    latestPoint.numericValue,
    firstPoint.numericValue
  );

  return {
    ...baseMeta,
    status: "ready",
    canRenderChart: true,
    pointCount: validPoints.length,
    points: validPoints,
    latestPoint,
    firstPoint,
    changeAmount,
    changePercent,
    message: `Menampilkan ${validPoints.length} observasi referensi harian (${firstPoint.sourceDate} hingga ${latestPoint.sourceDate}).`,
  };
}

// ============================================================================
// Server-Side Read Queries (Drizzle ORM + Safe Fallback on DB Error)
// ============================================================================

/**
 * Fetches the latest snapshot for a single indicator from `public.market_indicators`.
 */
export async function getMarketIndicatorSnapshot(
  code: SupportedIndicatorCode,
  options?: { now?: Date }
): Promise<MarketIndicatorView> {
  try {
    const rows = await db
      .select()
      .from(marketIndicators)
      .where(eq(marketIndicators.code, code))
      .limit(1);
    return buildMarketIndicatorView(code, rows[0], { now: options?.now });
  } catch {
    console.error(`[MarketDataRead] Failed to query indicator ${code}`);
    return buildMarketIndicatorView(code, null, {
      now: options?.now,
      queryFailed: true,
    });
  }
}

/**
 * Queries `public.market_price_history` for the latest 30 to 90 `USD_IDR` observations,
 * returning them sorted chronologically ascending (`observed_at ASC`).
 */
export async function getUsdIdrPriceHistory(
  limit = 60
): Promise<UsdIdrHistoryChartState> {
  // Clamp limit to the approved 30..90 range
  const safeLimit = Math.max(30, Math.min(90, Math.floor(limit)));

  try {
    const rows = await db
      .select()
      .from(marketPriceHistory)
      .where(eq(marketPriceHistory.instrumentCode, "USD_IDR"))
      .orderBy(desc(marketPriceHistory.observedAt), desc(marketPriceHistory.id))
      .limit(safeLimit);

    return prepareUsdIdrHistoryChartState(rows);
  } catch {
    console.error("[MarketDataRead] Failed to query market_price_history for USD_IDR");
    return prepareUsdIdrHistoryChartState([], { queryFailed: true });
  }
}

/**
 * Fetches all 10 registered market indicator snapshots and the `USD_IDR` historical series
 * in parallel for the public homepage Market Overview.
 */
export async function getDashboardMarketOverview(options?: {
  now?: Date;
  historyLimit?: number;
}): Promise<DashboardMarketOverviewData> {
  const safeLimit = Math.max(
    30,
    Math.min(90, Math.floor(options?.historyLimit ?? 60))
  );

  try {
    const [indicatorRows, historyRows] = await Promise.all([
      db.select().from(marketIndicators),
      db
        .select()
        .from(marketPriceHistory)
        .where(eq(marketPriceHistory.instrumentCode, "USD_IDR"))
        .orderBy(desc(marketPriceHistory.observedAt), desc(marketPriceHistory.id))
        .limit(safeLimit),
    ]);

    const rowMap = new Map<string, MarketIndicatorRecord>();
    for (const r of indicatorRows) {
      rowMap.set(r.code, r);
    }

    const indicators = {} as Record<SupportedIndicatorCode, MarketIndicatorView>;
    for (const code of ALL_INDICATOR_CODES) {
      indicators[code] = buildMarketIndicatorView(code, rowMap.get(code), {
        now: options?.now,
      });
    }

    const usdIdrHistory = prepareUsdIdrHistoryChartState(historyRows);

    return {
      indicators,
      usdIdrHistory,
      queryOk: true,
    };
  } catch {
    console.error("[MarketDataRead] Failed to load dashboard market overview");
    const indicators = {} as Record<SupportedIndicatorCode, MarketIndicatorView>;
    for (const code of ALL_INDICATOR_CODES) {
      indicators[code] = buildMarketIndicatorView(code, null, {
        now: options?.now,
        queryFailed: true,
      });
    }

    return {
      indicators,
      usdIdrHistory: prepareUsdIdrHistoryChartState([], { queryFailed: true }),
      queryOk: false,
    };
  }
}
