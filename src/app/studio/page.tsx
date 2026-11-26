import type { Metadata } from "next";
import { StudioClient } from "@/components/system/studio-client";
import { AdminLoginCard } from "@/components/system/admin-login-card";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/auth";
import { listArticlesForAdmin } from "@/lib/research-cms";
import { db } from "@/db";
import { goldPrices } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  DEFAULT_ANTAM_1G_IDR,
  DEFAULT_GOLD_SPOT_USD,
  formatWibDateTime,
  normalizeAntam1gPrice,
} from "@/lib/gold-pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Research & Editorial Studio | Fernando Capital",
  description: "Internal editorial workflow and database-backed research CMS for Fernando Capital.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function StudioPage() {
  const isAdmin = await isAdminAuthenticated();
  const isConfigured = isAdminAuthConfigured();

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto w-full py-8">
        <AdminLoginCard
          title="Akses Terbatas: AI Research & Editorial CMS Studio"
          description="Halaman manajemen artikel riset (CMS), kontrol 5 Sistem Otomatis, dan gerbang persetujuan publikasi (30% Human Oversight) memerlukan sesi Editor/Admin terverifikasi."
          isConfigured={isConfigured}
        />
      </div>
    );
  }

  let currentAntamPrice = DEFAULT_ANTAM_1G_IDR;
  let currentGoldUsd = DEFAULT_GOLD_SPOT_USD;
  let lastTimestamp = formatWibDateTime(new Date());

  try {
    const latest = await db.select().from(goldPrices).orderBy(desc(goldPrices.timestamp)).limit(1);
    if (latest.length > 0) {
      currentGoldUsd = parseFloat(latest[0].priceUsd);
      currentAntamPrice = normalizeAntam1gPrice(latest[0].antamPriceIdr, latest[0].priceUsd);
      lastTimestamp = formatWibDateTime(latest[0].timestamp);
    }
  } catch {
    // Fallback to reference values
  }

  const initialCmsData = await listArticlesForAdmin({
    page: 1,
    pageSize: 10,
  });

  return (
    <StudioClient
      currentAntamPrice={currentAntamPrice}
      currentGoldUsd={currentGoldUsd}
      lastTimestamp={lastTimestamp}
      initialArticles={initialCmsData.articles}
      initialCounts={initialCmsData.counts}
      initialTotal={initialCmsData.total}
      initialMigrationPending={initialCmsData.migrationPending}
    />
  );
}
