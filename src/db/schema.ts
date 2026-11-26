import {
  pgTable,
  serial,
  numeric,
  timestamp,
  varchar,
  text,
  jsonb,
  integer,
  boolean,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// Domain Types & Enums
// ============================================================================

export type ArticleStatus = "draft" | "review" | "published" | "archived";

export interface ResearchSourceItem {
  title: string;
  publisher: string;
  url: string;
  publishedDate: string;
  accessedDate: string;
}

export type IndicatorCategory =
  | "commodity"
  | "fx"
  | "equity_index"
  | "macro_rate"
  | "macro_inflation"
  | "macro_output"
  | "bond_yield";

export type FinancialUnit =
  | "USD_PER_OZ"
  | "IDR_PER_GRAM"
  | "IDR"
  | "USD"
  | "INDEX_PTS"
  | "PERCENT"
  | "IDR_TRILLION"
  | "USD_BILLION";

export type UpdateFrequency =
  | "intraday"
  | "daily_eod"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "event_driven";

export type IndicatorSourceType = "api_auto" | "derived_code" | "editor_verified";

export type InstrumentType = "commodity" | "fx" | "equity" | "index" | "bond" | "macro";

export type FiscalQuarter = "Q1" | "Q2" | "Q3" | "Q4" | "FY";

export type FundamentalPeriodType =
  | "quarterly"
  | "year_to_date"
  | "annual"
  | "trailing_twelve_months";

export type FundamentalUnitScale =
  | "FULL_AMOUNT"
  | "THOUSANDS"
  | "MILLIONS"
  | "BILLIONS";

export type AutomationJobStatus =
  | "success"
  | "partial_failure"
  | "rate_limited"
  | "error";

// ============================================================================
// Existing Tables (PRESERVED UNTOUCHED — Phase 1 & Phase 2)
// ============================================================================

// Tabel untuk menyimpan riwayat harga emas (Existing — Preserved)
export const goldPrices = pgTable("gold_prices", {
  id: serial("id").primaryKey(),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
  antamPriceIdr: numeric("antam_price_idr", { precision: 15, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  source: varchar("source", { length: 50 }).notNull(),
});

// Tabel CMS untuk artikel riset finansial Fernando Capital (Phase 2 — Preserved)
export const researchArticles = pgTable(
  "research_articles",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 240 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    status: varchar("status", { length: 20 })
      .$type<ArticleStatus>()
      .notNull()
      .default("draft"),
    featuredImage: varchar("featured_image", { length: 500 }),
    sources: jsonb("sources").$type<ResearchSourceItem[]>().notNull().default([]),
    methodology: text("methodology").notNull(),
    author: varchar("author", { length: 120 }).notNull(),
    seoTitle: varchar("seo_title", { length: 240 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: varchar("approved_by", { length: 120 }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_research_articles_slug").on(table.slug),
    index("idx_research_articles_status_published_at").on(table.status, table.publishedAt),
    index("idx_research_articles_category").on(table.category),
    index("idx_research_articles_created_at").on(table.createdAt),
  ]
);

export type ResearchArticleRecord = typeof researchArticles.$inferSelect;
export type NewResearchArticleRecord = typeof researchArticles.$inferInsert;

// ============================================================================
// Phase 3B-1 Financial Data Engine Tables
// ============================================================================

/**
 * A. market_indicators
 * Current canonical values and provenance metadata for financial and macroeconomic indicators.
 * - `value` and `previousValue` are nullable so indicator metadata can be registered
 *   before a verified observation exists.
 * - Percentage deltas are computed deterministically in the financial engine from
 *   `value` and `previousValue` rather than stored as a redundant column.
 */
export const marketIndicators = pgTable(
  "market_indicators",
  {
    code: varchar("code", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    category: varchar("category", { length: 40 }).$type<IndicatorCategory>().notNull(),
    value: numeric("value", { precision: 20, scale: 6 }),
    previousValue: numeric("previous_value", { precision: 20, scale: 6 }),
    unit: varchar("unit", { length: 40 }).$type<FinancialUnit>().notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("NONE"),
    marketTimezone: varchar("market_timezone", { length: 64 })
      .notNull()
      .default("Asia/Jakarta"),
    asOfTimestamp: timestamp("as_of_timestamp", { withTimezone: true }),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }),
    freshnessSlaSeconds: integer("freshness_sla_seconds").notNull().default(86400),
    updateFrequency: varchar("update_frequency", { length: 40 })
      .$type<UpdateFrequency>()
      .notNull(),
    sourceType: varchar("source_type", { length: 30 })
      .$type<IndicatorSourceType>()
      .notNull(),
    sourceName: varchar("source_name", { length: 160 }),
    sourceUrl: varchar("source_url", { length: 500 }),
    providerId: varchar("provider_id", { length: 80 }),
    attributionText: varchar("attribution_text", { length: 320 }),
    isStaleFallback: boolean("is_stale_fallback").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_market_indicators_category").on(table.category),
    index("idx_market_indicators_as_of").on(table.asOfTimestamp),
    check(
      "market_indicators_category_check",
      sql`${table.category} IN ('commodity', 'fx', 'equity_index', 'macro_rate', 'macro_inflation', 'macro_output', 'bond_yield')`
    ),
    check(
      "market_indicators_source_type_check",
      sql`${table.sourceType} IN ('api_auto', 'derived_code', 'editor_verified')`
    ),
    check(
      "market_indicators_freshness_sla_check",
      sql`${table.freshnessSlaSeconds} > 0`
    ),
  ]
);

/**
 * B. market_price_history
 * Historical time-series observations across commodities, FX, equities, indices, and bonds.
 * - Uses a flexible `instrument_code` (e.g. 'XAU_USD', 'USD_IDR', 'IHSG', 'BBCA.JK') without
 *   a foreign key to `market_indicators`, allowing individual company stock history to be
 *   recorded without creating duplicate indicator rows.
 * - Enforces idempotency via a unique index on `(instrument_code, observed_at, source_name)`.
 */
export const marketPriceHistory = pgTable(
  "market_price_history",
  {
    id: serial("id").primaryKey(),
    instrumentCode: varchar("instrument_code", { length: 64 }).notNull(),
    instrumentType: varchar("instrument_type", { length: 30 })
      .$type<InstrumentType>()
      .notNull(),
    value: numeric("value", { precision: 20, scale: 6 }).notNull(),
    open: numeric("open", { precision: 20, scale: 6 }),
    high: numeric("high", { precision: 20, scale: 6 }),
    low: numeric("low", { precision: 20, scale: 6 }),
    close: numeric("close", { precision: 20, scale: 6 }),
    volume: numeric("volume", { precision: 22, scale: 2 }),
    unit: varchar("unit", { length: 40 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("NONE"),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
    sourceName: varchar("source_name", { length: 160 }).notNull(),
    sourceUrl: varchar("source_url", { length: 500 }),
    providerId: varchar("provider_id", { length: 80 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_market_price_history_instrument_observed").on(
      table.instrumentCode,
      table.observedAt
    ),
    index("idx_market_price_history_type_observed").on(
      table.instrumentType,
      table.observedAt
    ),
    index("idx_market_price_history_observed_at").on(table.observedAt),
    uniqueIndex("uq_market_price_history_idempotency").on(
      table.instrumentCode,
      table.observedAt,
      table.sourceName
    ),
    check(
      "market_price_history_instrument_type_check",
      sql`${table.instrumentType} IN ('commodity', 'fx', 'equity', 'index', 'bond', 'macro')`
    ),
  ]
);

/**
 * C. companies
 * Master issuer registry for tracked IDX and global companies.
 * - Does not duplicate `last_price`; latest and historical equity prices are stored in `market_price_history`.
 */
export const companies = pgTable(
  "companies",
  {
    ticker: varchar("ticker", { length: 24 }).primaryKey(),
    exchange: varchar("exchange", { length: 24 }).notNull().default("IDX"),
    name: varchar("name", { length: 200 }).notNull(),
    sector: varchar("sector", { length: 120 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("IDR"),
    isActive: boolean("is_active").notNull().default(true),
    sourceName: varchar("source_name", { length: 160 }),
    sourceUrl: varchar("source_url", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_companies_exchange_active").on(table.exchange, table.isActive),
    index("idx_companies_sector").on(table.sector),
  ]
);

/**
 * D. company_fundamentals
 * Verified quarterly and annual financial statements per company.
 * - Keeps raw financial statement inputs separate from calculated valuation ratios and analyst assumptions.
 * - All financial statement metrics are nullable when a specific line item is not reported in a filing.
 * - Prevents duplicate statements for the same issuer, fiscal year, quarter, and period type.
 */
export const companyFundamentals = pgTable(
  "company_fundamentals",
  {
    id: serial("id").primaryKey(),
    ticker: varchar("ticker", { length: 24 })
      .notNull()
      .references(() => companies.ticker, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    fiscalYear: integer("fiscal_year").notNull(),
    fiscalQuarter: varchar("fiscal_quarter", { length: 10 })
      .$type<FiscalQuarter>()
      .notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    periodType: varchar("period_type", { length: 32 })
      .$type<FundamentalPeriodType>()
      .notNull(),
    reportingCurrency: varchar("reporting_currency", { length: 10 })
      .notNull()
      .default("IDR"),
    unitScale: varchar("unit_scale", { length: 30 })
      .$type<FundamentalUnitScale>()
      .notNull()
      .default("FULL_AMOUNT"),
    revenue: numeric("revenue", { precision: 24, scale: 2 }),
    netIncome: numeric("net_income", { precision: 24, scale: 2 }),
    totalAssets: numeric("total_assets", { precision: 24, scale: 2 }),
    totalLiabilities: numeric("total_liabilities", { precision: 24, scale: 2 }),
    totalEquity: numeric("total_equity", { precision: 24, scale: 2 }),
    totalDebt: numeric("total_debt", { precision: 24, scale: 2 }),
    sharesOutstanding: numeric("shares_outstanding", { precision: 22, scale: 0 }),
    weightedAverageShares: numeric("weighted_average_shares", {
      precision: 22,
      scale: 0,
    }),
    reportedEps: numeric("reported_eps", { precision: 18, scale: 4 }),
    reportedBvps: numeric("reported_bvps", { precision: 18, scale: 4 }),
    dividendPerShare: numeric("dividend_per_share", { precision: 18, scale: 4 }),
    sourceFiling: varchar("source_filing", { length: 240 }),
    sourceUrl: varchar("source_url", { length: 500 }),
    approvedBy: varchar("approved_by", { length: 120 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("uq_company_fundamentals_period").on(
      table.ticker,
      table.fiscalYear,
      table.fiscalQuarter,
      table.periodType
    ),
    index("idx_company_fundamentals_ticker_year").on(table.ticker, table.fiscalYear),
    index("idx_company_fundamentals_period_end").on(table.periodEnd),
    check(
      "company_fundamentals_quarter_check",
      sql`${table.fiscalQuarter} IN ('Q1', 'Q2', 'Q3', 'Q4', 'FY')`
    ),
    check(
      "company_fundamentals_period_type_check",
      sql`${table.periodType} IN ('quarterly', 'year_to_date', 'annual', 'trailing_twelve_months')`
    ),
    check(
      "company_fundamentals_unit_scale_check",
      sql`${table.unitScale} IN ('FULL_AMOUNT', 'THOUSANDS', 'MILLIONS', 'BILLIONS')`
    ),
    check(
      "company_fundamentals_fiscal_year_check",
      sql`${table.fiscalYear} >= 1990 AND ${table.fiscalYear} <= 2100`
    ),
  ]
);

/**
 * E. automation_logs
 * Operational audit trail for scheduled cron jobs, provider syncs, and manual data operations.
 * - `error_summary` must always be sanitized via `sanitizeAutomationError()` so API keys,
 *   bearer tokens, and database connection strings are never stored.
 */
export const automationLogs = pgTable(
  "automation_logs",
  {
    id: serial("id").primaryKey(),
    jobName: varchar("job_name", { length: 100 }).notNull(),
    provider: varchar("provider", { length: 80 }).notNull(),
    status: varchar("status", { length: 30 })
      .$type<AutomationJobStatus>()
      .notNull(),
    recordsUpdated: integer("records_updated").notNull().default(0),
    durationMs: integer("duration_ms").notNull().default(0),
    errorSummary: text("error_summary"),
    executedAt: timestamp("executed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_automation_logs_job_executed").on(table.jobName, table.executedAt),
    index("idx_automation_logs_status_executed").on(table.status, table.executedAt),
    index("idx_automation_logs_executed_at").on(table.executedAt),
    check(
      "automation_logs_status_check",
      sql`${table.status} IN ('success', 'partial_failure', 'rate_limited', 'error')`
    ),
    check(
      "automation_logs_records_updated_check",
      sql`${table.recordsUpdated} >= 0`
    ),
    check("automation_logs_duration_ms_check", sql`${table.durationMs} >= 0`),
  ]
);

// ============================================================================
// Drizzle ORM Relational Definitions
// ============================================================================

export const companiesRelations = relations(companies, ({ many }) => ({
  fundamentals: many(companyFundamentals),
}));

export const companyFundamentalsRelations = relations(
  companyFundamentals,
  ({ one }) => ({
    company: one(companies, {
      fields: [companyFundamentals.ticker],
      references: [companies.ticker],
    }),
  })
);

// ============================================================================
// Inferred TypeScript Record Types
// ============================================================================

export type MarketIndicatorRecord = typeof marketIndicators.$inferSelect;
export type NewMarketIndicatorRecord = typeof marketIndicators.$inferInsert;

export type MarketPriceHistoryRecord = typeof marketPriceHistory.$inferSelect;
export type NewMarketPriceHistoryRecord = typeof marketPriceHistory.$inferInsert;

export type CompanyRecord = typeof companies.$inferSelect;
export type NewCompanyRecord = typeof companies.$inferInsert;

export type CompanyFundamentalRecord = typeof companyFundamentals.$inferSelect;
export type NewCompanyFundamentalRecord = typeof companyFundamentals.$inferInsert;

export type AutomationLogRecord = typeof automationLogs.$inferSelect;
export type NewAutomationLogRecord = typeof automationLogs.$inferInsert;
