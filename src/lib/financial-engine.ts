import type {
  FinancialUnit,
  FiscalQuarter,
  FundamentalPeriodType,
  FundamentalUnitScale,
} from "@/db/schema";

/**
 * PHASE 3C-1 — DETERMINISTIC FINANCIAL ENGINE & DATA VALIDATION
 *
 * Pure, deterministic financial calculation and validation functions for Fernando Capital.
 *
 * Strict Governance Rules:
 * 1. Never divide by zero; never return `Infinity`, `-Infinity`, or `NaN`.
 * 2. Return `null` when required inputs are missing, invalid, or period-misaligned.
 * 3. Never mix `quarterly` / `year_to_date` partial-year figures with `annual` / `trailing_twelve_months`
 *    multiples (`PER`, `ROE`, `Dividend Yield`), and never silently annualize partial-quarter income.
 * 4. Prefer reported per-share figures (`reportedEps`, `reportedBvps`) when verified; derive from
 *    statement totals (`netIncome`, `totalEquity`, `weightedAverageShares` / `sharesOutstanding`)
 *    only when all required inputs and unit scales match.
 * 5. Compute `ROE` using average shareholders' equity `(beginningEquity + endingEquity) / 2` when
 *    verified beginning and ending equity are both available, or explicitly label `ending_equity` basis.
 * 6. Clearly distinguish interest-bearing `totalDebtToEquity` (`total_debt / total_equity`) from
 *    `totalLiabilitiesToEquity` (`total_liabilities / total_equity`).
 * 7. Compute `Margin of Safety` ONLY when a valid, independently verified intrinsic value is supplied.
 *    Does NOT introduce a new Graham intrinsic valuation formula (preserving existing calculator logic).
 * 8. Preserve source and reporting-period provenance on every computed metric.
 */

export const VALID_CURRENCIES = ["IDR", "USD", "NONE"] as const;
export type SupportedCurrency = (typeof VALID_CURRENCIES)[number];

export const VALID_FINANCIAL_UNITS: ReadonlyArray<FinancialUnit> = [
  "USD_PER_OZ",
  "IDR_PER_GRAM",
  "IDR",
  "USD",
  "INDEX_PTS",
  "PERCENT",
  "IDR_TRILLION",
  "USD_BILLION",
];

export const VALID_FISCAL_QUARTERS: ReadonlyArray<FiscalQuarter> = [
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "FY",
];

export const VALID_PERIOD_TYPES: ReadonlyArray<FundamentalPeriodType> = [
  "quarterly",
  "year_to_date",
  "annual",
  "trailing_twelve_months",
];

export const VALID_UNIT_SCALES: ReadonlyArray<FundamentalUnitScale> = [
  "FULL_AMOUNT",
  "THOUSANDS",
  "MILLIONS",
  "BILLIONS",
];

export interface MetricProvenance {
  ticker?: string;
  fiscalYear?: number | null;
  fiscalQuarter?: FiscalQuarter | null;
  periodType?: FundamentalPeriodType | null;
  reportingCurrency?: string | null;
  sourceFiling?: string | null;
  sourceUrl?: string | null;
  priceSourceName?: string | null;
  priceObservedAt?: string | null;
}

export interface DeterministicMetricResult<T = number> {
  value: T | null;
  method: string;
  reason: string | null;
  isAnnualized: false;
  provenance: MetricProvenance;
}

export interface PerCalculationResult extends DeterministicMetricResult<number> {
  isNegativeEarnings: boolean;
}

export interface PbvCalculationResult extends DeterministicMetricResult<number> {
  isNegativeOrZeroEquity: boolean;
}

export interface RoeCalculationResult extends DeterministicMetricResult<number> {
  equityBasis: "average_equity" | "ending_equity" | "unavailable";
  equityDenominator: number | null;
}

export interface DerCalculationResult {
  totalDebtToEquity: number | null;
  totalLiabilitiesToEquity: number | null;
  primaryBasis:
    | "interest_bearing_debt_to_equity"
    | "total_liabilities_to_equity"
    | "unavailable";
  reason: string | null;
  provenance: MetricProvenance;
}

export interface MarginOfSafetyResult extends DeterministicMetricResult<number> {
  discountPerShare: number | null;
  isUndervalued: boolean | null;
}

// ============================================================================
// Helper: Numeric & Scale Parsing
// ============================================================================

export function toFiniteNumber(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === "") {
    return null;
  }
  if (typeof input === "boolean") {
    return null;
  }
  const num = typeof input === "number" ? input : Number(String(input).trim());
  if (!Number.isFinite(num)) {
    return null;
  }
  return num;
}

export function getUnitScaleMultiplier(
  unitScale: FundamentalUnitScale | string | null | undefined = "FULL_AMOUNT"
): number | null {
  switch (unitScale) {
    case "FULL_AMOUNT":
      return 1;
    case "THOUSANDS":
      return 1_000;
    case "MILLIONS":
      return 1_000_000;
    case "BILLIONS":
      return 1_000_000_000;
    default:
      return null;
  }
}

export function isFullYearPeriodType(
  periodType: FundamentalPeriodType | string | null | undefined
): boolean {
  return periodType === "annual" || periodType === "trailing_twelve_months";
}

function roundDeterministic(val: number, decimals = 4): number | null {
  if (!Number.isFinite(val)) return null;
  const factor = Math.pow(10, decimals);
  const rounded = Math.round((val + Number.EPSILON) * factor) / factor;
  return Number.isFinite(rounded) ? rounded : null;
}

// ============================================================================
// TASK 3 — Deterministic Financial Metric Functions (1 to 8)
// ============================================================================

/**
 * 1. EPS (Earnings Per Share)
 * - Uses verified `reportedEps` if present.
 * - Otherwise derives `(netIncome * unitScaleMultiplier) / shares` (preferring
 *   `weightedAverageShares` over `sharesOutstanding`) when inputs are valid.
 * - Never silently annualizes quarterly or YTD net income (`isAnnualized: false`).
 */
export function calculateEps(input: {
  reportedEps?: string | number | null;
  netIncome?: string | number | null;
  weightedAverageShares?: string | number | null;
  sharesOutstanding?: string | number | null;
  periodType?: FundamentalPeriodType | null;
  reportingCurrency?: string | null;
  unitScale?: FundamentalUnitScale | null;
  provenance?: MetricProvenance;
}): DeterministicMetricResult<number> {
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
    periodType: input.periodType ?? input.provenance?.periodType ?? null,
    reportingCurrency:
      input.reportingCurrency ?? input.provenance?.reportingCurrency ?? null,
  };

  if (
    input.periodType !== undefined &&
    input.periodType !== null &&
    !VALID_PERIOD_TYPES.includes(input.periodType)
  ) {
    return {
      value: null,
      method: "unavailable",
      reason: "invalid_period_type",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const reported = toFiniteNumber(input.reportedEps);
  if (reported !== null) {
    return {
      value: roundDeterministic(reported, 4),
      method: "reported_eps",
      reason: null,
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const netIncome = toFiniteNumber(input.netIncome);
  if (netIncome === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_reported_eps_and_net_income",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const scaleMultiplier = getUnitScaleMultiplier(input.unitScale ?? "FULL_AMOUNT");
  if (scaleMultiplier === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "invalid_unit_scale",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const weightedShares = toFiniteNumber(input.weightedAverageShares);
  const endingShares = toFiniteNumber(input.sharesOutstanding);

  let sharesDenominator: number | null = null;
  let shareMethod = "derived_from_weighted_average_shares";

  if (weightedShares !== null) {
    if (weightedShares <= 0) {
      return {
        value: null,
        method: "unavailable",
        reason: "non_positive_share_denominator",
        isAnnualized: false,
        provenance: baseProvenance,
      };
    }
    sharesDenominator = weightedShares;
  } else if (endingShares !== null) {
    if (endingShares <= 0) {
      return {
        value: null,
        method: "unavailable",
        reason: "non_positive_share_denominator",
        isAnnualized: false,
        provenance: baseProvenance,
      };
    }
    sharesDenominator = endingShares;
    shareMethod = "derived_from_shares_outstanding";
  }

  if (sharesDenominator === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_share_denominator",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const fullNetIncome = netIncome * scaleMultiplier;
  const rawEps = fullNetIncome / sharesDenominator;
  const rounded = roundDeterministic(rawEps, 4);

  return {
    value: rounded,
    method: shareMethod,
    reason: rounded === null ? "calculation_overflow" : null,
    isAnnualized: false,
    provenance: baseProvenance,
  };
}

/**
 * 2. BVPS (Book Value Per Share)
 * - Uses verified `reportedBvps` if present.
 * - Otherwise derives `(totalEquity * unitScaleMultiplier) / sharesOutstanding`.
 */
export function calculateBvps(input: {
  reportedBvps?: string | number | null;
  totalEquity?: string | number | null;
  sharesOutstanding?: string | number | null;
  periodType?: FundamentalPeriodType | null;
  reportingCurrency?: string | null;
  unitScale?: FundamentalUnitScale | null;
  provenance?: MetricProvenance;
}): DeterministicMetricResult<number> {
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
    periodType: input.periodType ?? input.provenance?.periodType ?? null,
    reportingCurrency:
      input.reportingCurrency ?? input.provenance?.reportingCurrency ?? null,
  };

  const reported = toFiniteNumber(input.reportedBvps);
  if (reported !== null) {
    return {
      value: roundDeterministic(reported, 4),
      method: "reported_bvps",
      reason: null,
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const totalEquity = toFiniteNumber(input.totalEquity);
  if (totalEquity === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_reported_bvps_and_total_equity",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const shares = toFiniteNumber(input.sharesOutstanding);
  if (shares === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_shares_outstanding",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }
  if (shares <= 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "non_positive_share_denominator",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const scaleMultiplier = getUnitScaleMultiplier(input.unitScale ?? "FULL_AMOUNT");
  if (scaleMultiplier === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "invalid_unit_scale",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const fullEquity = totalEquity * scaleMultiplier;
  const rawBvps = fullEquity / shares;
  const rounded = roundDeterministic(rawBvps, 4);

  return {
    value: rounded,
    method: "derived_from_total_equity_and_shares",
    reason: rounded === null ? "calculation_overflow" : null,
    isAnnualized: false,
    provenance: baseProvenance,
  };
}

/**
 * 3. PER (Price-to-Earnings Ratio)
 * - Formula: `stockPrice / eps`
 * - Requires `stockPrice > 0`, matching currencies, and an annual or trailing-twelve-month
 *   (`annual` | `trailing_twelve_months`) EPS period.
 * - Rejects partial-year (`quarterly` | `year_to_date`) EPS without silent annualization.
 * - Returns `value: null` and `isNegativeEarnings: true` when `eps < 0`, and `value: null` when `eps === 0`.
 */
export function calculatePer(input: {
  stockPrice: string | number | null | undefined;
  eps: string | number | null | undefined;
  periodType?: FundamentalPeriodType | null;
  priceCurrency?: string | null;
  epsCurrency?: string | null;
  provenance?: MetricProvenance;
}): PerCalculationResult {
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
    periodType: input.periodType ?? input.provenance?.periodType ?? null,
    reportingCurrency:
      input.epsCurrency ?? input.priceCurrency ?? input.provenance?.reportingCurrency ?? null,
  };

  const price = toFiniteNumber(input.stockPrice);
  if (price === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_stock_price",
      isAnnualized: false,
      isNegativeEarnings: false,
      provenance: baseProvenance,
    };
  }
  if (price <= 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "non_positive_stock_price",
      isAnnualized: false,
      isNegativeEarnings: false,
      provenance: baseProvenance,
    };
  }

  if (
    input.priceCurrency &&
    input.epsCurrency &&
    input.priceCurrency.toUpperCase() !== input.epsCurrency.toUpperCase()
  ) {
    return {
      value: null,
      method: "unavailable",
      reason: "currency_mismatch",
      isAnnualized: false,
      isNegativeEarnings: false,
      provenance: baseProvenance,
    };
  }

  const effectivePeriod = input.periodType ?? input.provenance?.periodType ?? "annual";
  if (!isFullYearPeriodType(effectivePeriod)) {
    return {
      value: null,
      method: "unavailable",
      reason: "period_mismatch_requires_annual_or_ttm_eps",
      isAnnualized: false,
      isNegativeEarnings: false,
      provenance: baseProvenance,
    };
  }

  const eps = toFiniteNumber(input.eps);
  if (eps === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_eps",
      isAnnualized: false,
      isNegativeEarnings: false,
      provenance: baseProvenance,
    };
  }
  if (eps === 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "zero_eps_denominator",
      isAnnualized: false,
      isNegativeEarnings: false,
      provenance: baseProvenance,
    };
  }
  if (eps < 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "negative_earnings",
      isAnnualized: false,
      isNegativeEarnings: true,
      provenance: baseProvenance,
    };
  }

  const rounded = roundDeterministic(price / eps, 4);
  return {
    value: rounded,
    method: "price_divided_by_annual_or_ttm_eps",
    reason: rounded === null ? "calculation_overflow" : null,
    isAnnualized: false,
    isNegativeEarnings: false,
    provenance: baseProvenance,
  };
}

/**
 * 4. PBV (Price-to-Book Value Ratio)
 * - Formula: `stockPrice / bvps`
 * - Requires `stockPrice > 0`, matching currencies, and `bvps > 0`.
 * - Returns `value: null` and `isNegativeOrZeroEquity: true` when `bvps <= 0`.
 */
export function calculatePbv(input: {
  stockPrice: string | number | null | undefined;
  bvps: string | number | null | undefined;
  priceCurrency?: string | null;
  bvpsCurrency?: string | null;
  provenance?: MetricProvenance;
}): PbvCalculationResult {
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
    reportingCurrency:
      input.bvpsCurrency ?? input.priceCurrency ?? input.provenance?.reportingCurrency ?? null,
  };

  const price = toFiniteNumber(input.stockPrice);
  if (price === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_stock_price",
      isAnnualized: false,
      isNegativeOrZeroEquity: false,
      provenance: baseProvenance,
    };
  }
  if (price <= 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "non_positive_stock_price",
      isAnnualized: false,
      isNegativeOrZeroEquity: false,
      provenance: baseProvenance,
    };
  }

  if (
    input.priceCurrency &&
    input.bvpsCurrency &&
    input.priceCurrency.toUpperCase() !== input.bvpsCurrency.toUpperCase()
  ) {
    return {
      value: null,
      method: "unavailable",
      reason: "currency_mismatch",
      isAnnualized: false,
      isNegativeOrZeroEquity: false,
      provenance: baseProvenance,
    };
  }

  const bvps = toFiniteNumber(input.bvps);
  if (bvps === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_bvps",
      isAnnualized: false,
      isNegativeOrZeroEquity: false,
      provenance: baseProvenance,
    };
  }
  if (bvps === 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "zero_bvps_denominator",
      isAnnualized: false,
      isNegativeOrZeroEquity: true,
      provenance: baseProvenance,
    };
  }
  if (bvps < 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "negative_book_equity",
      isAnnualized: false,
      isNegativeOrZeroEquity: true,
      provenance: baseProvenance,
    };
  }

  const rounded = roundDeterministic(price / bvps, 4);
  return {
    value: rounded,
    method: "price_divided_by_bvps",
    reason: rounded === null ? "calculation_overflow" : null,
    isAnnualized: false,
    isNegativeOrZeroEquity: false,
    provenance: baseProvenance,
  };
}

/**
 * 5. ROE (Return on Equity, %)
 * - Formula: `(netIncome / equityDenominator) * 100`
 * - Uses average equity `(beginningEquity + endingEquity) / 2` when both positive
 *   `beginningEquity` and `endingEquity` are supplied; otherwise uses `endingEquity`.
 * - Requires full-year (`annual` | `trailing_twelve_months`) net income; never silently
 *   annualizes partial-quarter or YTD income.
 */
export function calculateRoe(input: {
  netIncome: string | number | null | undefined;
  endingEquity: string | number | null | undefined;
  beginningEquity?: string | number | null;
  periodType?: FundamentalPeriodType | null;
  provenance?: MetricProvenance;
}): RoeCalculationResult {
  const effectivePeriod = input.periodType ?? input.provenance?.periodType ?? "annual";
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
    periodType: effectivePeriod,
  };

  if (!isFullYearPeriodType(effectivePeriod)) {
    return {
      value: null,
      method: "unavailable",
      reason: "period_mismatch_requires_annual_or_ttm_net_income",
      isAnnualized: false,
      equityBasis: "unavailable",
      equityDenominator: null,
      provenance: baseProvenance,
    };
  }

  const netIncome = toFiniteNumber(input.netIncome);
  if (netIncome === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_net_income",
      isAnnualized: false,
      equityBasis: "unavailable",
      equityDenominator: null,
      provenance: baseProvenance,
    };
  }

  const endingEq = toFiniteNumber(input.endingEquity);
  if (endingEq === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_ending_equity",
      isAnnualized: false,
      equityBasis: "unavailable",
      equityDenominator: null,
      provenance: baseProvenance,
    };
  }
  if (endingEq <= 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "non_positive_ending_equity",
      isAnnualized: false,
      equityBasis: "unavailable",
      equityDenominator: null,
      provenance: baseProvenance,
    };
  }

  const beginningEq = toFiniteNumber(input.beginningEquity);
  let equityDenominator = endingEq;
  let equityBasis: "average_equity" | "ending_equity" = "ending_equity";

  if (beginningEq !== null) {
    if (beginningEq <= 0) {
      return {
        value: null,
        method: "unavailable",
        reason: "non_positive_beginning_equity",
        isAnnualized: false,
        equityBasis: "unavailable",
        equityDenominator: null,
        provenance: baseProvenance,
      };
    }
    equityDenominator = (beginningEq + endingEq) / 2;
    equityBasis = "average_equity";
  }

  const rawRoePct = (netIncome / equityDenominator) * 100;
  const rounded = roundDeterministic(rawRoePct, 4);

  return {
    value: rounded,
    method:
      equityBasis === "average_equity"
        ? "net_income_divided_by_average_equity_pct"
        : "net_income_divided_by_ending_equity_pct",
    reason: rounded === null ? "calculation_overflow" : null,
    isAnnualized: false,
    equityBasis,
    equityDenominator: roundDeterministic(equityDenominator, 2),
    provenance: baseProvenance,
  };
}

/**
 * 6. DER (Debt-to-Equity & Liabilities-to-Equity Ratios)
 * - Clearly distinguishes:
 *   1. `totalDebtToEquity` = Interest-Bearing Total Debt / Total Shareholders' Equity (`total_debt / total_equity`)
 *   2. `totalLiabilitiesToEquity` = Total Liabilities / Total Shareholders' Equity (`total_liabilities / total_equity`)
 * - Rejects zero/negative equity or negative debt/liabilities.
 */
export function calculateDer(input: {
  totalDebt?: string | number | null;
  totalLiabilities?: string | number | null;
  totalEquity: string | number | null | undefined;
  provenance?: MetricProvenance;
}): DerCalculationResult {
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
  };

  const equity = toFiniteNumber(input.totalEquity);
  if (equity === null) {
    return {
      totalDebtToEquity: null,
      totalLiabilitiesToEquity: null,
      primaryBasis: "unavailable",
      reason: "missing_total_equity",
      provenance: baseProvenance,
    };
  }
  if (equity <= 0) {
    return {
      totalDebtToEquity: null,
      totalLiabilitiesToEquity: null,
      primaryBasis: "unavailable",
      reason: "non_positive_total_equity",
      provenance: baseProvenance,
    };
  }

  const debt = toFiniteNumber(input.totalDebt);
  const liabilities = toFiniteNumber(input.totalLiabilities);

  if (debt !== null && debt < 0) {
    return {
      totalDebtToEquity: null,
      totalLiabilitiesToEquity: null,
      primaryBasis: "unavailable",
      reason: "negative_total_debt",
      provenance: baseProvenance,
    };
  }
  if (liabilities !== null && liabilities < 0) {
    return {
      totalDebtToEquity: null,
      totalLiabilitiesToEquity: null,
      primaryBasis: "unavailable",
      reason: "negative_total_liabilities",
      provenance: baseProvenance,
    };
  }

  if (debt === null && liabilities === null) {
    return {
      totalDebtToEquity: null,
      totalLiabilitiesToEquity: null,
      primaryBasis: "unavailable",
      reason: "missing_debt_and_liabilities",
      provenance: baseProvenance,
    };
  }

  const totalDebtToEquity =
    debt !== null ? roundDeterministic(debt / equity, 4) : null;
  const totalLiabilitiesToEquity =
    liabilities !== null ? roundDeterministic(liabilities / equity, 4) : null;

  const primaryBasis =
    totalDebtToEquity !== null
      ? "interest_bearing_debt_to_equity"
      : totalLiabilitiesToEquity !== null
        ? "total_liabilities_to_equity"
        : "unavailable";

  return {
    totalDebtToEquity,
    totalLiabilitiesToEquity,
    primaryBasis,
    reason: null,
    provenance: baseProvenance,
  };
}

/**
 * 7. Dividend Yield (%)
 * - Formula: `(dividendPerShare / stockPrice) * 100`
 * - Requires `stockPrice > 0`, `dividendPerShare >= 0`, matching currencies,
 *   and full-year/TTM period when `periodType` is specified.
 */
export function calculateDividendYield(input: {
  dividendPerShare: string | number | null | undefined;
  stockPrice: string | number | null | undefined;
  periodType?: FundamentalPeriodType | null;
  dividendCurrency?: string | null;
  priceCurrency?: string | null;
  provenance?: MetricProvenance;
}): DeterministicMetricResult<number> {
  const effectivePeriod = input.periodType ?? input.provenance?.periodType ?? "annual";
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
    periodType: effectivePeriod,
    reportingCurrency:
      input.dividendCurrency ?? input.priceCurrency ?? input.provenance?.reportingCurrency ?? null,
  };

  if (!isFullYearPeriodType(effectivePeriod)) {
    return {
      value: null,
      method: "unavailable",
      reason: "period_mismatch_requires_annual_or_ttm_dividend",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const price = toFiniteNumber(input.stockPrice);
  if (price === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_stock_price",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }
  if (price <= 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "non_positive_stock_price",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  if (
    input.dividendCurrency &&
    input.priceCurrency &&
    input.dividendCurrency.toUpperCase() !== input.priceCurrency.toUpperCase()
  ) {
    return {
      value: null,
      method: "unavailable",
      reason: "currency_mismatch",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const dps = toFiniteNumber(input.dividendPerShare);
  if (dps === null) {
    return {
      value: null,
      method: "unavailable",
      reason: "missing_dividend_per_share",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }
  if (dps < 0) {
    return {
      value: null,
      method: "unavailable",
      reason: "negative_dividend_per_share",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const rounded = roundDeterministic((dps / price) * 100, 4);
  return {
    value: rounded,
    method: "dps_divided_by_stock_price_pct",
    reason: rounded === null ? "calculation_overflow" : null,
    isAnnualized: false,
    provenance: baseProvenance,
  };
}

/**
 * 8. Margin of Safety (%)
 * - Formula: `((verifiedIntrinsicValue - stockPrice) / verifiedIntrinsicValue) * 100`
 * - Computes Margin of Safety ONLY when an independently verified positive intrinsic value
 *   (`verifiedIntrinsicValue > 0`) and positive `stockPrice > 0` are supplied.
 * - Does NOT compute or introduce a new Graham intrinsic valuation formula.
 */
export function calculateMarginOfSafety(input: {
  stockPrice: string | number | null | undefined;
  verifiedIntrinsicValue: string | number | null | undefined;
  priceCurrency?: string | null;
  intrinsicCurrency?: string | null;
  provenance?: MetricProvenance;
}): MarginOfSafetyResult {
  const baseProvenance: MetricProvenance = {
    ...input.provenance,
    reportingCurrency:
      input.intrinsicCurrency ?? input.priceCurrency ?? input.provenance?.reportingCurrency ?? null,
  };

  const price = toFiniteNumber(input.stockPrice);
  if (price === null) {
    return {
      value: null,
      discountPerShare: null,
      isUndervalued: null,
      method: "unavailable",
      reason: "missing_stock_price",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }
  if (price <= 0) {
    return {
      value: null,
      discountPerShare: null,
      isUndervalued: null,
      method: "unavailable",
      reason: "non_positive_stock_price",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  if (
    input.priceCurrency &&
    input.intrinsicCurrency &&
    input.priceCurrency.toUpperCase() !== input.intrinsicCurrency.toUpperCase()
  ) {
    return {
      value: null,
      discountPerShare: null,
      isUndervalued: null,
      method: "unavailable",
      reason: "currency_mismatch",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const intrinsic = toFiniteNumber(input.verifiedIntrinsicValue);
  if (intrinsic === null) {
    return {
      value: null,
      discountPerShare: null,
      isUndervalued: null,
      method: "unavailable",
      reason: "missing_verified_intrinsic_value",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }
  if (intrinsic <= 0) {
    return {
      value: null,
      discountPerShare: null,
      isUndervalued: null,
      method: "unavailable",
      reason: "non_positive_intrinsic_value",
      isAnnualized: false,
      provenance: baseProvenance,
    };
  }

  const discount = intrinsic - price;
  const mosPct = roundDeterministic((discount / intrinsic) * 100, 4);

  return {
    value: mosPct,
    discountPerShare: roundDeterministic(discount, 4),
    isUndervalued: mosPct !== null ? mosPct > 0 : null,
    method: "verified_intrinsic_minus_price_over_intrinsic_pct",
    reason: mosPct === null ? "calculation_overflow" : null,
    isAnnualized: false,
    provenance: baseProvenance,
  };
}

// ============================================================================
// TASK 4 — Data Validation Utilities
// ============================================================================

export interface ValidationOutcome {
  ok: boolean;
  errors: string[];
}

/**
 * 1. Validates positive stock prices (`> 0` and finite).
 */
export function validatePositiveStockPrice(
  price: string | number | null | undefined
): ValidationOutcome {
  const num = toFiniteNumber(price);
  if (num === null) {
    return { ok: false, errors: ["Stock price is missing or not a finite number."] };
  }
  if (num <= 0) {
    return { ok: false, errors: ["Stock price must be strictly greater than zero."] };
  }
  return { ok: true, errors: [] };
}

/**
 * 2. Validates currency and financial unit compatibility.
 */
export function validateCurrencyAndUnit(
  currency: string | null | undefined,
  unit: string | null | undefined
): ValidationOutcome {
  const errors: string[] = [];
  const normCurr = String(currency || "").trim().toUpperCase();
  const normUnit = String(unit || "").trim().toUpperCase();

  if (!VALID_CURRENCIES.includes(normCurr as SupportedCurrency)) {
    errors.push(`Unsupported currency "${currency}". Expected one of: ${VALID_CURRENCIES.join(", ")}.`);
  }
  if (!VALID_FINANCIAL_UNITS.includes(normUnit as FinancialUnit)) {
    errors.push(
      `Unsupported financial unit "${unit}". Expected one of: ${VALID_FINANCIAL_UNITS.join(", ")}.`
    );
  }

  if (errors.length === 0) {
    if (normUnit === "USD_PER_OZ" && normCurr !== "USD") {
      errors.push("Unit USD_PER_OZ requires currency USD.");
    }
    if (normUnit === "IDR_PER_GRAM" && normCurr !== "IDR") {
      errors.push("Unit IDR_PER_GRAM requires currency IDR.");
    }
    if (normUnit === "IDR_TRILLION" && normCurr !== "IDR") {
      errors.push("Unit IDR_TRILLION requires currency IDR.");
    }
    if (normUnit === "USD_BILLION" && normCurr !== "USD") {
      errors.push("Unit USD_BILLION requires currency USD.");
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * 3. Validates observation timestamps (must be parseable Date, not before 1970, and not in the future beyond clock-skew allowance).
 */
export function validateObservationTimestamp(
  timestamp: Date | string | number | null | undefined,
  options?: { maxFutureSkewMs?: number; nowMs?: number }
): ValidationOutcome {
  if (timestamp === null || timestamp === undefined || timestamp === "") {
    return { ok: false, errors: ["Observation timestamp is missing."] };
  }
  const parsed = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const tsMs = parsed.getTime();
  if (!Number.isFinite(tsMs)) {
    return { ok: false, errors: ["Observation timestamp is not a valid date."] };
  }
  if (tsMs < 0) {
    return { ok: false, errors: ["Observation timestamp predates 1970-01-01T00:00:00Z."] };
  }
  const nowMs = options?.nowMs ?? Date.now();
  const maxSkew = options?.maxFutureSkewMs ?? 5 * 60 * 1000; // 5 minutes default clock-skew tolerance
  if (tsMs > nowMs + maxSkew) {
    return { ok: false, errors: ["Observation timestamp cannot be in the future."] };
  }
  return { ok: true, errors: [] };
}

/**
 * 4. Checks for missing required values in a structured payload.
 */
export function validateRequiredFields(
  payload: Record<string, unknown> | null | undefined,
  requiredKeys: ReadonlyArray<string>
): ValidationOutcome {
  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Payload object is missing."] };
  }
  const missing: string[] = [];
  for (const key of requiredKeys) {
    const val = payload[key];
    if (val === null || val === undefined || (typeof val === "string" && val.trim() === "")) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    return {
      ok: false,
      errors: [`Missing required fields: ${missing.join(", ")}.`],
    };
  }
  return { ok: true, errors: [] };
}

/**
 * 5. Validates that an observation does not duplicate an existing `(instrumentCode, observedAt, sourceName)` key.
 */
export function validateNoDuplicateObservation(
  candidate: {
    instrumentCode: string;
    observedAt: Date | string;
    sourceName: string;
  },
  existingObservations: ReadonlyArray<{
    instrumentCode: string;
    observedAt: Date | string;
    sourceName: string;
  }>
): ValidationOutcome {
  const candCode = String(candidate.instrumentCode || "").trim().toUpperCase();
  const candSource = String(candidate.sourceName || "").trim().toLowerCase();
  const candTs = new Date(candidate.observedAt).getTime();

  if (!candCode || !candSource || !Number.isFinite(candTs)) {
    return {
      ok: false,
      errors: ["Candidate observation must have valid instrumentCode, observedAt, and sourceName."],
    };
  }

  const isDuplicate = existingObservations.some((obs) => {
    const obsCode = String(obs.instrumentCode || "").trim().toUpperCase();
    const obsSource = String(obs.sourceName || "").trim().toLowerCase();
    const obsTs = new Date(obs.observedAt).getTime();
    return obsCode === candCode && obsSource === candSource && obsTs === candTs;
  });

  if (isDuplicate) {
    return {
      ok: false,
      errors: [
        `Duplicate observation detected for ${candCode} at ${new Date(candTs).toISOString()} from ${candidate.sourceName}.`,
      ],
    };
  }

  return { ok: true, errors: [] };
}

/**
 * 6. Validates reporting period metadata and alignment between `fiscalQuarter` and `periodType`.
 */
export function validateReportingPeriod(input: {
  fiscalYear: number | null | undefined;
  fiscalQuarter: FiscalQuarter | string | null | undefined;
  periodType: FundamentalPeriodType | string | null | undefined;
  periodStart?: Date | string | null;
  periodEnd?: Date | string | null;
}): ValidationOutcome {
  const errors: string[] = [];

  if (
    typeof input.fiscalYear !== "number" ||
    !Number.isInteger(input.fiscalYear) ||
    input.fiscalYear < 1990 ||
    input.fiscalYear > 2100
  ) {
    errors.push("fiscalYear must be an integer between 1990 and 2100.");
  }

  if (!VALID_FISCAL_QUARTERS.includes(input.fiscalQuarter as FiscalQuarter)) {
    errors.push(
      `Invalid fiscalQuarter "${input.fiscalQuarter}". Expected one of: ${VALID_FISCAL_QUARTERS.join(", ")}.`
    );
  }

  if (!VALID_PERIOD_TYPES.includes(input.periodType as FundamentalPeriodType)) {
    errors.push(
      `Invalid periodType "${input.periodType}". Expected one of: ${VALID_PERIOD_TYPES.join(", ")}.`
    );
  }

  // Period alignment rule: FY quarter cannot be tagged as a single partial quarter ("quarterly")
  if (input.fiscalQuarter === "FY" && input.periodType === "quarterly") {
    errors.push(
      "Period alignment mismatch: fiscalQuarter 'FY' cannot have periodType 'quarterly' (use 'annual')."
    );
  }
  // A partial quarter Q1/Q2/Q3 cannot be tagged as full-year 'annual'
  if (
    (input.fiscalQuarter === "Q1" ||
      input.fiscalQuarter === "Q2" ||
      input.fiscalQuarter === "Q3") &&
    input.periodType === "annual"
  ) {
    errors.push(
      `Period alignment mismatch: partial-year quarter '${input.fiscalQuarter}' cannot have periodType 'annual'.`
    );
  }

  if (input.periodStart && input.periodEnd) {
    const startMs = new Date(input.periodStart).getTime();
    const endMs = new Date(input.periodEnd).getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      errors.push("periodStart and periodEnd must be valid dates when provided.");
    } else if (startMs >= endMs) {
      errors.push("periodStart must be earlier than periodEnd.");
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * 7. Validates financial statement internal consistency:
 * - Balance sheet accounting identity (`totalAssets ≈ totalLiabilities + totalEquity`) when all three exist.
 * - Non-negative revenue, assets, liabilities, debt, and dividend per share.
 * - Strictly positive share counts when provided.
 * - Valid unit scale.
 */
export function validateFinancialStatementConsistency(input: {
  unitScale?: FundamentalUnitScale | string | null;
  revenue?: string | number | null;
  netIncome?: string | number | null;
  totalAssets?: string | number | null;
  totalLiabilities?: string | number | null;
  totalEquity?: string | number | null;
  totalDebt?: string | number | null;
  sharesOutstanding?: string | number | null;
  weightedAverageShares?: string | number | null;
  dividendPerShare?: string | number | null;
  balanceSheetToleranceRatio?: number;
}): ValidationOutcome {
  const errors: string[] = [];

  if (
    input.unitScale !== undefined &&
    input.unitScale !== null &&
    !VALID_UNIT_SCALES.includes(input.unitScale as FundamentalUnitScale)
  ) {
    errors.push(
      `Invalid unitScale "${input.unitScale}". Expected one of: ${VALID_UNIT_SCALES.join(", ")}.`
    );
  }

  const revenue = toFiniteNumber(input.revenue);
  if (revenue !== null && revenue < 0) {
    errors.push("Revenue cannot be negative.");
  }

  const assets = toFiniteNumber(input.totalAssets);
  if (assets !== null && assets < 0) {
    errors.push("totalAssets cannot be negative.");
  }

  const liabilities = toFiniteNumber(input.totalLiabilities);
  if (liabilities !== null && liabilities < 0) {
    errors.push("totalLiabilities cannot be negative.");
  }

  const debt = toFiniteNumber(input.totalDebt);
  if (debt !== null && debt < 0) {
    errors.push("totalDebt cannot be negative.");
  }

  // Interest-bearing debt cannot exceed total liabilities when both are reported
  if (debt !== null && liabilities !== null && debt > liabilities * 1.001) {
    errors.push("totalDebt cannot exceed totalLiabilities.");
  }

  const equity = toFiniteNumber(input.totalEquity);
  if (assets !== null && liabilities !== null && equity !== null) {
    const expectedAssets = liabilities + equity;
    const maxMag = Math.max(Math.abs(assets), Math.abs(expectedAssets), 1);
    const relDiff = Math.abs(assets - expectedAssets) / maxMag;
    const tolerance = input.balanceSheetToleranceRatio ?? 0.005; // 0.5% default rounding tolerance
    if (relDiff > tolerance) {
      errors.push(
        `Balance sheet accounting identity mismatch: totalAssets (${assets}) does not equal totalLiabilities + totalEquity (${expectedAssets}).`
      );
    }
  }

  const shares = toFiniteNumber(input.sharesOutstanding);
  if (shares !== null && shares <= 0) {
    errors.push("sharesOutstanding must be strictly positive when provided.");
  }

  const weightedShares = toFiniteNumber(input.weightedAverageShares);
  if (weightedShares !== null && weightedShares <= 0) {
    errors.push("weightedAverageShares must be strictly positive when provided.");
  }

  const dps = toFiniteNumber(input.dividendPerShare);
  if (dps !== null && dps < 0) {
    errors.push("dividendPerShare cannot be negative.");
  }

  return { ok: errors.length === 0, errors };
}

/**
 * 8. Validates source provenance metadata.
 */
export function validateSourceProvenance(input: {
  sourceName?: string | null;
  sourceFiling?: string | null;
  sourceUrl?: string | null;
}): ValidationOutcome {
  const errors: string[] = [];
  const hasName =
    (typeof input.sourceName === "string" && input.sourceName.trim().length >= 2) ||
    (typeof input.sourceFiling === "string" && input.sourceFiling.trim().length >= 2);

  if (!hasName) {
    errors.push("Source provenance requires a non-empty sourceName or sourceFiling.");
  }

  if (input.sourceUrl !== undefined && input.sourceUrl !== null && input.sourceUrl !== "") {
    const rawUrl = String(input.sourceUrl).trim();
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        errors.push("sourceUrl must use https:// or http:// protocol.");
      }
    } catch {
      errors.push("sourceUrl is not a valid URL.");
    }
  }

  return { ok: errors.length === 0, errors };
}
