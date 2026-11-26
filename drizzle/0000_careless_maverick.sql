CREATE TABLE IF NOT EXISTS "gold_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"antam_price_idr" numeric(15, 2),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"source" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "research_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(240) NOT NULL,
	"slug" varchar(240) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"featured_image" varchar(500),
	"sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"methodology" text NOT NULL,
	"author" varchar(120) NOT NULL,
	"seo_title" varchar(240),
	"seo_description" varchar(320),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"approved_at" timestamp with time zone,
	"approved_by" varchar(120),
	"published_at" timestamp with time zone,
	CONSTRAINT "research_articles_slug_unique" UNIQUE("slug"),
	CONSTRAINT "research_articles_status_check" CHECK ("status" IN ('draft', 'review', 'published', 'archived'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_research_articles_slug" ON "research_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_research_articles_status_published_at" ON "research_articles" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_research_articles_category" ON "research_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_research_articles_created_at" ON "research_articles" USING btree ("created_at");
