import { Suspense } from "react";
import { RatioCalculator } from "@/components/dashboard/ratio-calculator";
import { db } from "@/db";
import { goldPrices } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CalculatorPage() {
  let currentAntamPrice = 2725000;
  try {
    const latest = await db.select().from(goldPrices).orderBy(desc(goldPrices.timestamp)).limit(1);
    if (latest.length > 0 && latest[0].antamPriceIdr) {
      currentAntamPrice = parseFloat(latest[0].antamPriceIdr);
    }
  } catch {
    // Fallback to reference price
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-12">
      <div className="flex flex-col gap-2 border-b border-border pb-5">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <span className="px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
            PILAR 04
          </span>
          <span>Financial Data &amp; Tools • Deterministic Calculation Engine</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Interactive Financial Data &amp; Valuation Tools
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
          Seluruh kalkulasi dijalankan secara deterministik menggunakan formula finansial dan data tervalidasi
          (bukan angka tebakan AI), dilengkapi penjelasan interpretasi untuk membantu pengambilan keputusan.
        </p>
      </div>

      <Suspense fallback={<div className="py-10 text-center text-muted-foreground">Memuat instrumen kalkulasi...</div>}>
        <RatioCalculator liveAntamPrice={currentAntamPrice} />
      </Suspense>
    </div>
  );
}
