import { StudioClient } from "@/components/system/studio-client";
import { db } from "@/db";
import { goldPrices } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  let currentAntamPrice = 2725000;
  let currentGoldUsd = 2685.4;
  let lastTimestamp = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  try {
    const latest = await db.select().from(goldPrices).orderBy(desc(goldPrices.timestamp)).limit(1);
    if (latest.length > 0) {
      currentGoldUsd = parseFloat(latest[0].priceUsd);
      currentAntamPrice = latest[0].antamPriceIdr
        ? parseFloat(latest[0].antamPriceIdr)
        : (currentGoldUsd * 15845) / 31.1035 * 1.05;
      lastTimestamp = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(latest[0].timestamp);
    }
  } catch {
    // Fallback to reference values
  }

  return (
    <StudioClient
      currentAntamPrice={currentAntamPrice}
      currentGoldUsd={currentGoldUsd}
      lastTimestamp={lastTimestamp}
    />
  );
}
