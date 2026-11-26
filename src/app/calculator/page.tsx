import type { Metadata } from "next";
import { Suspense } from "react";
import { RatioCalculator } from "@/components/dashboard/ratio-calculator";
import { DEFAULT_ANTAM_1G_IDR } from "@/lib/gold-pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Financial Data & Valuation Calculators | Fernando Capital",
  description:
    "Interactive stock valuation calculator, financial ratio analyzer (PER, PBV, ROE), compound interest simulator, Antam physical gold reference, and company comparison tool.",
  alternates: {
    canonical: "https://fernandocapital.web.id/calculator",
  },
  openGraph: {
    title: "Financial Data & Valuation Calculators | Fernando Capital",
    description:
      "Deterministic stock valuation, financial ratio, compound interest, and Antam physical gold calculators.",
    url: "https://fernandocapital.web.id/calculator",
    siteName: "Fernando Capital",
    type: "website",
  },
};

export default async function CalculatorPage() {
  // Uses the user-configurable internal baseline reference preset (DEFAULT_ANTAM_1G_IDR)
  // rather than displaying unlicensed Yahoo Finance observations as current public quotes.
  const currentAntamPrice = DEFAULT_ANTAM_1G_IDR;

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-12">
      <div className="flex flex-col gap-2 pb-2">
        <span className="text-xs font-medium text-primary">
          Kalkulator Finansial Deterministik
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Interactive Financial Data &amp; Valuation Tools
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
          Hitung valuasi wajar saham, rasio fundamental, bunga majemuk, dan simulasi pecahan emas secara akurat.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="py-10 text-center text-muted-foreground">
            Memuat instrumen kalkulasi...
          </div>
        }
      >
        <RatioCalculator liveAntamPrice={currentAntamPrice} />
      </Suspense>
    </div>
  );
}
