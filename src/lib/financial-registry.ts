import { db } from "@/db";
import {
  companies,
  marketIndicators,
  type CompanyRecord,
  type MarketIndicatorRecord,
  type NewCompanyRecord,
  type NewMarketIndicatorRecord,
} from "@/db/schema";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";

/**
 * TASK 1 & TASK 2 — FINANCIAL INDICATOR & COMPANY REGISTRY
 * Prepared metadata registry definitions for the 10 core macroeconomic/market indicators
 * and 5 tracked IDX issuers, plus idempotent database initialization services.
 *
 * STRICT GOVERNANCE:
 * - Contains ZERO invented numeric prices, yields, or financial statement figures.
 * - All numeric observation fields (`value`, `previousValue`, `asOfTimestamp`, `fetchedAt`)
 *   are initialized to `null` until populated by a verified data observation or official filing.
 * - Initialization uses `onConflictDoNothing` so existing verified market observations
 *   and company metadata are NEVER overwritten.
 */

export const INITIAL_MARKET_INDICATOR_REGISTRY: ReadonlyArray<NewMarketIndicatorRecord> = [
  {
    code: "XAU_USD",
    name: "Spot Gold (XAU/USD)",
    category: "commodity",
    value: null,
    previousValue: null,
    unit: "USD_PER_OZ",
    currency: "USD",
    marketTimezone: "UTC",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 86400,
    updateFrequency: "daily_eod",
    sourceType: "api_auto",
    sourceName: null,
    sourceUrl: null,
    providerId: null,
    attributionText: "Global Spot Bullion Market (XAU/USD)",
    isStaleFallback: false,
  },
  {
    code: "ANTAM_1G_IDR",
    name: "Emas Fisik Antam Referensi 1 Gram",
    category: "commodity",
    value: null,
    previousValue: null,
    unit: "IDR_PER_GRAM",
    currency: "IDR",
    marketTimezone: "Asia/Jakarta",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 86400,
    updateFrequency: "daily_eod",
    sourceType: "derived_code",
    sourceName: null,
    sourceUrl: null,
    providerId: null,
    attributionText: "Referensi Emas Fisik Antam Logam Mulia",
    isStaleFallback: false,
  },
  {
    code: "USD_IDR",
    name: "Nilai Tukar USD/IDR",
    category: "fx",
    value: null,
    previousValue: null,
    unit: "IDR",
    currency: "IDR",
    marketTimezone: "Asia/Jakarta",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 86400,
    updateFrequency: "daily_eod",
    sourceType: "api_auto",
    sourceName: null,
    sourceUrl: null,
    providerId: null,
    attributionText: "Kurs Referensi Pasar Valas & Bank Sentral",
    isStaleFallback: false,
  },
  {
    code: "IHSG",
    name: "Indeks Harga Saham Gabungan (IDX Composite)",
    category: "equity_index",
    value: null,
    previousValue: null,
    unit: "INDEX_PTS",
    currency: "IDR",
    marketTimezone: "Asia/Jakarta",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 86400,
    updateFrequency: "daily_eod",
    sourceType: "api_auto",
    sourceName: null,
    sourceUrl: "https://www.idx.co.id",
    providerId: null,
    attributionText: "Bursa Efek Indonesia (BEI / IDX)",
    isStaleFallback: false,
  },
  {
    code: "BI_RATE",
    name: "Suku Bunga Acuan Bank Indonesia (BI-Rate)",
    category: "macro_rate",
    value: null,
    previousValue: null,
    unit: "PERCENT",
    currency: "NONE",
    marketTimezone: "Asia/Jakarta",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 3024000, // 35 days (monthly RDG cadence)
    updateFrequency: "monthly",
    sourceType: "editor_verified",
    sourceName: "Bank Indonesia",
    sourceUrl: "https://www.bi.go.id",
    providerId: "bank_indonesia",
    attributionText: "Rapat Dewan Gubernur Bank Indonesia (BI)",
    isStaleFallback: false,
  },
  {
    code: "SBN_10Y",
    name: "Imbal Hasil SBN Benchmark 10 Tahun (INDOGB 10Y)",
    category: "bond_yield",
    value: null,
    previousValue: null,
    unit: "PERCENT",
    currency: "IDR",
    marketTimezone: "Asia/Jakarta",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 259200, // 72 hours (covers weekends)
    updateFrequency: "daily_eod",
    sourceType: "editor_verified",
    sourceName: "PHEI / IBPA",
    sourceUrl: "https://www.phei.co.id",
    providerId: "phei_ibpa",
    attributionText: "Penilai Harga Efek Indonesia (PHEI / IBPA)",
    isStaleFallback: false,
  },
  {
    code: "ID_CPI_YOY",
    name: "Inflasi IHK Tahunan Indonesia (CPI YoY)",
    category: "macro_inflation",
    value: null,
    previousValue: null,
    unit: "PERCENT",
    currency: "NONE",
    marketTimezone: "Asia/Jakarta",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 3024000, // 35 days (monthly BPS release)
    updateFrequency: "monthly",
    sourceType: "api_auto",
    sourceName: "Badan Pusat Statistik (BPS)",
    sourceUrl: "https://www.bps.go.id",
    providerId: "bps_indonesia",
    attributionText: "Badan Pusat Statistik (BPS RI)",
    isStaleFallback: false,
  },
  {
    code: "ID_GDP",
    name: "Pertumbuhan Ekonomi PDB Indonesia (GDP YoY)",
    category: "macro_output",
    value: null,
    previousValue: null,
    unit: "PERCENT",
    currency: "NONE",
    marketTimezone: "Asia/Jakarta",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 8640000, // 100 days (quarterly BPS release)
    updateFrequency: "quarterly",
    sourceType: "api_auto",
    sourceName: "Badan Pusat Statistik (BPS)",
    sourceUrl: "https://www.bps.go.id",
    providerId: "bps_indonesia",
    attributionText: "Badan Pusat Statistik (BPS RI)",
    isStaleFallback: false,
  },
  {
    code: "FED_FUNDS",
    name: "US Federal Funds Effective Rate",
    category: "macro_rate",
    value: null,
    previousValue: null,
    unit: "PERCENT",
    currency: "USD",
    marketTimezone: "America/New_York",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 259200,
    updateFrequency: "daily_eod",
    sourceType: "api_auto",
    sourceName: "Federal Reserve (FRED)",
    sourceUrl: "https://fred.stlouisfed.org/series/DFF",
    providerId: "fred",
    attributionText:
      "Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates via FRED (Series: DFF)",
    isStaleFallback: false,
  },
  {
    code: "US_10Y",
    name: "US 10-Year Treasury Constant Maturity Yield",
    category: "bond_yield",
    value: null,
    previousValue: null,
    unit: "PERCENT",
    currency: "USD",
    marketTimezone: "America/New_York",
    asOfTimestamp: null,
    fetchedAt: null,
    freshnessSlaSeconds: 259200,
    updateFrequency: "daily_eod",
    sourceType: "api_auto",
    sourceName: "Federal Reserve (FRED)",
    sourceUrl: "https://fred.stlouisfed.org/series/DGS10",
    providerId: "fred",
    attributionText:
      "Board of Governors of the Federal Reserve System (US), H.15 Selected Interest Rates via FRED (Series: DGS10)",
    isStaleFallback: false,
  },
] as const;

export const INITIAL_TRACKED_COMPANIES_REGISTRY: ReadonlyArray<NewCompanyRecord> = [
  {
    ticker: "BBCA",
    exchange: "IDX",
    name: "PT Bank Central Asia Tbk",
    sector: "Perbankan & Jasa Keuangan",
    currency: "IDR",
    isActive: true,
    sourceName: "Bursa Efek Indonesia (BEI)",
    sourceUrl: "https://www.idx.co.id",
  },
  {
    ticker: "ANTM",
    exchange: "IDX",
    name: "PT Aneka Tambang Tbk",
    sector: "Pertambangan Emas & Nikel",
    currency: "IDR",
    isActive: true,
    sourceName: "Bursa Efek Indonesia (BEI)",
    sourceUrl: "https://www.idx.co.id",
  },
  {
    ticker: "BMRI",
    exchange: "IDX",
    name: "PT Bank Mandiri (Persero) Tbk",
    sector: "Perbankan & Jasa Keuangan",
    currency: "IDR",
    isActive: true,
    sourceName: "Bursa Efek Indonesia (BEI)",
    sourceUrl: "https://www.idx.co.id",
  },
  {
    ticker: "TLKM",
    exchange: "IDX",
    name: "PT Telkom Indonesia (Persero) Tbk",
    sector: "Infrastruktur Telekomunikasi & Data",
    currency: "IDR",
    isActive: true,
    sourceName: "Bursa Efek Indonesia (BEI)",
    sourceUrl: "https://www.idx.co.id",
  },
  {
    ticker: "ASII",
    exchange: "IDX",
    name: "PT Astra International Tbk",
    sector: "Konglomerasi Otomotif, Alat Berat & Jasa Keuangan",
    currency: "IDR",
    isActive: true,
    sourceName: "Bursa Efek Indonesia (BEI)",
    sourceUrl: "https://www.idx.co.id",
  },
] as const;

export interface IndicatorRegistryInitResult {
  insertedCount: number;
  preservedCount: number;
  totalRegistered: number;
  indicators: MarketIndicatorRecord[];
}

export interface CompanyRegistryInitResult {
  insertedCount: number;
  preservedCount: number;
  totalRegistered: number;
  companies: CompanyRecord[];
}

export interface FinancialRegistriesInitResult {
  indicators: IndicatorRegistryInitResult;
  companies: CompanyRegistryInitResult;
}

/**
 * TASK 1 — Idempotent Market Indicator Registry Initialization.
 * Inserts the 10 metadata-only indicator records with NULL numeric values (`value`,
 * `previous_value`, `as_of_timestamp`, `fetched_at`).
 * Uses `onConflictDoNothing` so existing rows and any previously verified market
 * observations are NEVER overwritten.
 */
export async function initializeIndicatorRegistry(): Promise<IndicatorRegistryInitResult> {
  const metadataPayloads: NewMarketIndicatorRecord[] =
    INITIAL_MARKET_INDICATOR_REGISTRY.map((item) => ({
      ...item,
      // Explicitly enforce null initial observations
      value: null,
      previousValue: null,
      asOfTimestamp: null,
      fetchedAt: null,
    }));

  const inserted = await db
    .insert(marketIndicators)
    .values(metadataPayloads)
    .onConflictDoNothing({ target: marketIndicators.code })
    .returning({ code: marketIndicators.code });

  const codes = metadataPayloads.map((m) => m.code);
  const allRows = await db
    .select()
    .from(marketIndicators)
    .where(inArray(marketIndicators.code, codes))
    .orderBy(asc(marketIndicators.code));

  return {
    insertedCount: inserted.length,
    preservedCount: allRows.length - inserted.length,
    totalRegistered: allRows.length,
    indicators: allRows,
  };
}

/**
 * TASK 2 — Idempotent Company Master Registry Initialization.
 * Inserts the 5 tracked IDX issuers (`BBCA`, `ANTM`, `BMRI`, `TLKM`, `ASII`)
 * with verified issuer metadata only (zero stock prices, ratios, or financial statements).
 * Uses `onConflictDoNothing` so existing verified company metadata is preserved.
 */
export async function initializeCompanyRegistry(): Promise<CompanyRegistryInitResult> {
  const companyPayloads: NewCompanyRecord[] = INITIAL_TRACKED_COMPANIES_REGISTRY.map(
    (item) => ({
      ...item,
    })
  );

  const inserted = await db
    .insert(companies)
    .values(companyPayloads)
    .onConflictDoNothing({ target: companies.ticker })
    .returning({ ticker: companies.ticker });

  const tickers = companyPayloads.map((c) => c.ticker);
  const allRows = await db
    .select()
    .from(companies)
    .where(inArray(companies.ticker, tickers))
    .orderBy(asc(companies.ticker));

  return {
    insertedCount: inserted.length,
    preservedCount: allRows.length - inserted.length,
    totalRegistered: allRows.length,
    companies: allRows,
  };
}

/**
 * Safely synchronizes static metadata definitions (such as `sourceUrl`, `attributionText`,
 * `updateFrequency`, and `freshnessSlaSeconds`) on unpopulated registry rows (`WHERE value IS NULL`).
 * Never modifies `value`, `previous_value`, `as_of_timestamp`, or `fetched_at`.
 */
export async function syncIndicatorRegistryMetadata(): Promise<{ updatedCount: number }> {
  let updatedCount = 0;
  for (const item of INITIAL_MARKET_INDICATOR_REGISTRY) {
    const updated = await db
      .update(marketIndicators)
      .set({
        name: item.name,
        category: item.category,
        unit: item.unit,
        currency: item.currency,
        marketTimezone: item.marketTimezone,
        freshnessSlaSeconds: item.freshnessSlaSeconds,
        updateFrequency: item.updateFrequency,
        sourceType: item.sourceType,
        sourceName: item.sourceName ?? null,
        sourceUrl: item.sourceUrl ?? null,
        providerId: item.providerId ?? null,
        attributionText: item.attributionText ?? null,
      })
      .where(
        and(eq(marketIndicators.code, item.code), isNull(marketIndicators.value))
      )
      .returning({ code: marketIndicators.code });
    updatedCount += updated.length;
  }
  return { updatedCount };
}

/**
 * Initializes both the Market Indicator Registry (10 codes) and the Company Registry (5 IDX issuers)
 * idempotently without overwriting existing verified records.
 */
export async function initializeFinancialRegistries(): Promise<FinancialRegistriesInitResult> {
  const indicatorsResult = await initializeIndicatorRegistry();
  const companiesResult = await initializeCompanyRegistry();

  return {
    indicators: indicatorsResult,
    companies: companiesResult,
  };
}

/**
 * Deterministically computes percentage change between current and previous observations.
 * Returns `null` if either value is null, non-finite, or `previousValue` is zero.
 */
export function calculateDeterministicChangePercent(
  currentValue: string | number | null | undefined,
  previousValue: string | number | null | undefined
): number | null {
  if (
    currentValue === null ||
    currentValue === undefined ||
    currentValue === "" ||
    previousValue === null ||
    previousValue === undefined ||
    previousValue === ""
  ) {
    return null;
  }

  const curr = typeof currentValue === "number" ? currentValue : Number(currentValue);
  const prev = typeof previousValue === "number" ? previousValue : Number(previousValue);

  if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) {
    return null;
  }

  return Number((((curr - prev) / Math.abs(prev)) * 100).toFixed(4));
}

/**
 * Sanitizes error summaries before persisting to `automation_logs.error_summary`.
 * Ensures database connection strings, API keys, bearer tokens, and passwords are never logged.
 */
export function sanitizeAutomationError(rawError: unknown): string {
  const text =
    rawError instanceof Error
      ? rawError.message
      : typeof rawError === "string"
        ? rawError
        : "Unknown automation error";

  return text
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "[REDACTED_DB_URI]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED_TOKEN]")
    .replace(
      /(api[_-]?key|apikey|token|secret|password|authorization)\s*[:=]\s*[^\s&"',;]+/gi,
      "$1=[REDACTED]"
    )
    .slice(0, 500);
}
