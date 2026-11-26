CREATE TABLE "automation_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_name" varchar(100) NOT NULL,
	"provider" varchar(80) NOT NULL,
	"status" varchar(30) NOT NULL,
	"records_updated" integer DEFAULT 0 NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"error_summary" text,
	"executed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "automation_logs_status_check" CHECK ("automation_logs"."status" IN ('success', 'partial_failure', 'rate_limited', 'error')),
	CONSTRAINT "automation_logs_records_updated_check" CHECK ("automation_logs"."records_updated" >= 0),
	CONSTRAINT "automation_logs_duration_ms_check" CHECK ("automation_logs"."duration_ms" >= 0)
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"ticker" varchar(24) PRIMARY KEY NOT NULL,
	"exchange" varchar(24) DEFAULT 'IDX' NOT NULL,
	"name" varchar(200) NOT NULL,
	"sector" varchar(120) NOT NULL,
	"currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"source_name" varchar(160),
	"source_url" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_fundamentals" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticker" varchar(24) NOT NULL,
	"fiscal_year" integer NOT NULL,
	"fiscal_quarter" varchar(10) NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"period_type" varchar(32) NOT NULL,
	"reporting_currency" varchar(10) DEFAULT 'IDR' NOT NULL,
	"unit_scale" varchar(30) DEFAULT 'FULL_AMOUNT' NOT NULL,
	"revenue" numeric(24, 2),
	"net_income" numeric(24, 2),
	"total_assets" numeric(24, 2),
	"total_liabilities" numeric(24, 2),
	"total_equity" numeric(24, 2),
	"total_debt" numeric(24, 2),
	"shares_outstanding" numeric(22, 0),
	"weighted_average_shares" numeric(22, 0),
	"reported_eps" numeric(18, 4),
	"reported_bvps" numeric(18, 4),
	"dividend_per_share" numeric(18, 4),
	"source_filing" varchar(240),
	"source_url" varchar(500),
	"approved_by" varchar(120),
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_fundamentals_quarter_check" CHECK ("company_fundamentals"."fiscal_quarter" IN ('Q1', 'Q2', 'Q3', 'Q4', 'FY')),
	CONSTRAINT "company_fundamentals_period_type_check" CHECK ("company_fundamentals"."period_type" IN ('quarterly', 'year_to_date', 'annual', 'trailing_twelve_months')),
	CONSTRAINT "company_fundamentals_unit_scale_check" CHECK ("company_fundamentals"."unit_scale" IN ('FULL_AMOUNT', 'THOUSANDS', 'MILLIONS', 'BILLIONS')),
	CONSTRAINT "company_fundamentals_fiscal_year_check" CHECK ("company_fundamentals"."fiscal_year" >= 1990 AND "company_fundamentals"."fiscal_year" <= 2100)
);
--> statement-breakpoint
CREATE TABLE "market_indicators" (
	"code" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" varchar(40) NOT NULL,
	"value" numeric(20, 6),
	"previous_value" numeric(20, 6),
	"unit" varchar(40) NOT NULL,
	"currency" varchar(10) DEFAULT 'NONE' NOT NULL,
	"market_timezone" varchar(64) DEFAULT 'Asia/Jakarta' NOT NULL,
	"as_of_timestamp" timestamp with time zone,
	"fetched_at" timestamp with time zone,
	"freshness_sla_seconds" integer DEFAULT 86400 NOT NULL,
	"update_frequency" varchar(40) NOT NULL,
	"source_type" varchar(30) NOT NULL,
	"source_name" varchar(160),
	"source_url" varchar(500),
	"provider_id" varchar(80),
	"attribution_text" varchar(320),
	"is_stale_fallback" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_indicators_category_check" CHECK ("market_indicators"."category" IN ('commodity', 'fx', 'equity_index', 'macro_rate', 'macro_inflation', 'macro_output', 'bond_yield')),
	CONSTRAINT "market_indicators_source_type_check" CHECK ("market_indicators"."source_type" IN ('api_auto', 'derived_code', 'editor_verified')),
	CONSTRAINT "market_indicators_freshness_sla_check" CHECK ("market_indicators"."freshness_sla_seconds" > 0)
);
--> statement-breakpoint
CREATE TABLE "market_price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"instrument_code" varchar(64) NOT NULL,
	"instrument_type" varchar(30) NOT NULL,
	"value" numeric(20, 6) NOT NULL,
	"open" numeric(20, 6),
	"high" numeric(20, 6),
	"low" numeric(20, 6),
	"close" numeric(20, 6),
	"volume" numeric(22, 2),
	"unit" varchar(40) NOT NULL,
	"currency" varchar(10) DEFAULT 'NONE' NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_name" varchar(160) NOT NULL,
	"source_url" varchar(500),
	"provider_id" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_price_history_instrument_type_check" CHECK ("market_price_history"."instrument_type" IN ('commodity', 'fx', 'equity', 'index', 'bond', 'macro'))
);
--> statement-breakpoint
ALTER TABLE "company_fundamentals" ADD CONSTRAINT "company_fundamentals_ticker_companies_ticker_fk" FOREIGN KEY ("ticker") REFERENCES "public"."companies"("ticker") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_automation_logs_job_executed" ON "automation_logs" USING btree ("job_name","executed_at");--> statement-breakpoint
CREATE INDEX "idx_automation_logs_status_executed" ON "automation_logs" USING btree ("status","executed_at");--> statement-breakpoint
CREATE INDEX "idx_automation_logs_executed_at" ON "automation_logs" USING btree ("executed_at");--> statement-breakpoint
CREATE INDEX "idx_companies_exchange_active" ON "companies" USING btree ("exchange","is_active");--> statement-breakpoint
CREATE INDEX "idx_companies_sector" ON "companies" USING btree ("sector");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_company_fundamentals_period" ON "company_fundamentals" USING btree ("ticker","fiscal_year","fiscal_quarter","period_type");--> statement-breakpoint
CREATE INDEX "idx_company_fundamentals_ticker_year" ON "company_fundamentals" USING btree ("ticker","fiscal_year");--> statement-breakpoint
CREATE INDEX "idx_company_fundamentals_period_end" ON "company_fundamentals" USING btree ("period_end");--> statement-breakpoint
CREATE INDEX "idx_market_indicators_category" ON "market_indicators" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_market_indicators_as_of" ON "market_indicators" USING btree ("as_of_timestamp");--> statement-breakpoint
CREATE INDEX "idx_market_price_history_instrument_observed" ON "market_price_history" USING btree ("instrument_code","observed_at");--> statement-breakpoint
CREATE INDEX "idx_market_price_history_type_observed" ON "market_price_history" USING btree ("instrument_type","observed_at");--> statement-breakpoint
CREATE INDEX "idx_market_price_history_observed_at" ON "market_price_history" USING btree ("observed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_market_price_history_idempotency" ON "market_price_history" USING btree ("instrument_code","observed_at","source_name");