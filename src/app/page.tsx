import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GoldChart } from "@/components/dashboard/gold-chart";
import { QuickConverter } from "@/components/dashboard/quick-converter";
import { CrossPillarExplorer } from "@/components/dashboard/cross-pillar-explorer";
import { UsdIdrHistoryChart } from "@/components/dashboard/usd-idr-history-chart";
import {
  ArrowUpRight,
  Calculator,
  BookOpen,
  Scale,
  TrendingUp,
  Coins,
  Layers,
} from "lucide-react";
import { getPublishedArticles } from "@/lib/research-cms";
import {
  ANTAM_SUMMARY_TIERS,
  calculateAntamTierPricing,
  DEFAULT_ANTAM_1G_IDR,
  formatWibDateTime,
} from "@/lib/gold-pricing";
import {
  formatIdrPerUsdDisplay,
  formatPercentIndicatorDisplay,
  FRED_LEGAL_URL,
  FRED_TERMS_OF_USE_URL,
  getDashboardMarketOverview,
} from "@/lib/market-data/read";
import { getVersionInfo } from "@/lib/version";

export const dynamic = "force-dynamic";

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default async function Dashboard() {
  const [latestResearch, marketOverview] = await Promise.all([
    getPublishedArticles(3),
    getDashboardMarketOverview(),
  ]);

  const versionInfo = getVersionInfo(false);
  const currentAntamPrice = DEFAULT_ANTAM_1G_IDR;
  const chartDataIdr: { time: string; price: number }[] = [];

  const usdIdr = marketOverview.indicators.USD_IDR;
  const xauUsd = marketOverview.indicators.XAU_USD;
  const ihsg = marketOverview.indicators.IHSG;
  const biRate = marketOverview.indicators.BI_RATE;
  const sbn10y = marketOverview.indicators.SBN_10Y;
  const fedFunds = marketOverview.indicators.FED_FUNDS;
  const us10y = marketOverview.indicators.US_10Y;

  const formattedUsdIdr = formatIdrPerUsdDisplay(usdIdr.trimmedDecimalValue);
  const formattedFedFunds = formatPercentIndicatorDisplay(
    fedFunds.trimmedDecimalValue
  );
  const formattedUs10y = formatPercentIndicatorDisplay(
    us10y.trimmedDecimalValue
  );

  return (
    <div className="space-y-12 pb-12">
      {/* =====================================================================
          1. CALM, SPACIOUS HERO SECTION
      ===================================================================== */}
      <section className="py-4 sm:py-6 space-y-5 max-w-3xl">
        <Badge
          variant="secondary"
          className="rounded-full px-3 py-1 text-xs font-medium text-foreground"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
          Web Platform Active • v{versionInfo.version}
        </Badge>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
          Riset Finansial, Kurs &amp; Kalkulator Valuasi yang Jernih.
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed">
          Pantau kurs referensi harian, simulasikan harga emas fisik, dan hitung
          valuasi wajar saham Indonesia dalam satu tampilan yang bersih dan mudah dipahami.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-xs hover:opacity-90 transition-opacity"
          >
            <Calculator className="w-4 h-4" />
            <span>Buka Kalkulator Finansial</span>
          </Link>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary px-5 py-2.5 text-sm font-medium text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span>Direktori Riset</span>
          </Link>
        </div>
      </section>

      {/* =====================================================================
          2. CLEAN 4-CARD MARKET SUMMARY
      ===================================================================== */}
      <section id="market-intelligence" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Ringkasan Indikator Pasar
          </h2>
          {usdIdr.fetchedAtFormattedWib && (
            <span className="text-xs text-muted-foreground">
              Diperbarui: {usdIdr.fetchedAtFormattedWib}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* USD/IDR */}
          <Card data-indicator-code="USD_IDR" className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  Kurs USD/IDR (ECB)
                </CardDescription>
                <Badge
                  variant="secondary"
                  className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  {usdIdr.freshnessLabel}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold font-mono text-foreground pt-1">
                {formattedUsdIdr || usdIdr.unavailableTitle || "Belum Tersedia"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              {usdIdr.trimmedDecimalValue !== null ? (
                <>
                  <p>
                    {usdIdr.trimmedDecimalValue} IDR per 1 USD • {usdIdr.sourceDate}
                  </p>
                  <details className="pt-1">
                    <summary className="cursor-pointer text-primary hover:underline">
                      Detail sumber
                    </summary>
                    <div className="pt-1.5 space-y-0.5 text-[11px]">
                      <p>{usdIdr.sourceName}</p>
                      <p>{usdIdr.classificationLabel}</p>
                    </div>
                  </details>
                </>
              ) : (
                <p>{usdIdr.unavailableExplanation}</p>
              )}
            </CardContent>
          </Card>

          {/* IHSG */}
          <Card data-indicator-code="IHSG" className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  Indeks IHSG
                </CardDescription>
                <Badge variant="secondary" className="text-[11px]">
                  {ihsg.freshnessLabel}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold text-foreground pt-1">
                {ihsg.numericValue !== null
                  ? ihsg.numericValue.toLocaleString("id-ID")
                  : ihsg.unavailableTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p className="line-clamp-2">{ihsg.unavailableExplanation}</p>
            </CardContent>
          </Card>

          {/* BI-Rate & SBN 10Y */}
          <Card data-indicator-code="BI_RATE_SBN_10Y" className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  BI-Rate &amp; SBN 10Y
                </CardDescription>
                <Badge variant="secondary" className="text-[11px]">
                  {biRate.freshnessLabel}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold text-foreground pt-1">
                {biRate.trimmedDecimalValue !== null || sbn10y.trimmedDecimalValue !== null
                  ? `${biRate.trimmedDecimalValue ?? "—"}% / ${sbn10y.trimmedDecimalValue ?? "—"}%`
                  : biRate.unavailableTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p className="line-clamp-2">
                Dikelola melalui verifikasi editor dari rilis resmi BI &amp; PHEI.
              </p>
            </CardContent>
          </Card>

          {/* Spot Emas XAU/USD */}
          <Card data-indicator-code="XAU_USD" className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  Spot Emas (XAU/USD)
                </CardDescription>
                <Badge variant="secondary" className="text-[11px]">
                  {xauUsd.freshnessLabel}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold text-foreground pt-1">
                {xauUsd.numericValue !== null
                  ? `$${xauUsd.numericValue.toLocaleString("en-US")}`
                  : xauUsd.unavailableTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p className="line-clamp-2">
                Gunakan simulator emas fisik Rupiah di bawah untuk estimasi pecahan.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quiet Collapsible US Macro & Governance Info (Zero Visual Noise) */}
        <details className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            Indikator Suku Bunga AS (FED_FUNDS &amp; US_10Y) &amp; Informasi Kepatuhan Sumber Data
          </summary>
          <div className="pt-3 mt-3 border-t border-border grid gap-4 md:grid-cols-3">
            <div data-indicator-code="FED_FUNDS" className="space-y-1">
              <span className="font-semibold text-foreground block">
                {fedFunds.officialSeriesName || fedFunds.name} (FED_FUNDS)
              </span>
              <span className="block">
                {formattedFedFunds || fedFunds.unavailableTitle}
              </span>
              <span className="text-[11px] block">{fedFunds.attributionText}</span>
            </div>
            <div data-indicator-code="US_10Y" className="space-y-1">
              <span className="font-semibold text-foreground block">
                {us10y.officialSeriesName || us10y.name} (US_10Y)
              </span>
              <span className="block">
                {formattedUs10y || us10y.unavailableTitle}
              </span>
              <span className="text-[11px] block">{us10y.attributionText}</span>
            </div>
            <div id="fred-legal-attribution" className="space-y-1.5">
              <p className="text-[11px] leading-relaxed">
                Sesuai FRED® API Terms of Use, penyimpanan database untuk seri FRED dinonaktifkan selama evaluasi sumber primer Federal Reserve H.15.
              </p>
              <div className="flex gap-3 text-[11px]">
                <a
                  href={FRED_TERMS_OF_USE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  FRED® Terms
                </a>
                <a
                  href={FRED_LEGAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  St. Louis Fed Legal
                </a>
              </div>
            </div>
          </div>
        </details>
      </section>

      {/* =====================================================================
          3. CLEAN GOLD SIMULATION & EXCHANGE RATE SECTION
      ===================================================================== */}
      <section className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left 7 Cols: Gold Simulator */}
          <div id="tracker" className="lg:col-span-7">
            <GoldChart
              data={chartDataIdr}
              currentPrice={currentAntamPrice}
              isRupiah={true}
            />
          </div>

          {/* Right 5 Cols: Quick Converter + Clean Antam Table */}
          <div className="lg:col-span-5 space-y-6">
            <div id="converter">
              <QuickConverter currentAntamPrice={currentAntamPrice} />
            </div>

            <div id="pricelist">
              <Card className="border-border bg-card shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Referensi Fisik Antam
                    </CardTitle>
                    <Badge variant="secondary" className="text-[11px]">
                      +PPh 0.25%
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Berat</TableHead>
                        <TableHead className="text-right text-xs">Dasar</TableHead>
                        <TableHead className="text-right text-xs">+Pajak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ANTAM_SUMMARY_TIERS.map((tier, i) => {
                        const { basePrice, taxPrice } = calculateAntamTierPricing(
                          currentAntamPrice,
                          tier.weight,
                          tier.multiplier
                        );
                        return (
                          <TableRow key={i} className="text-xs font-mono">
                            <TableCell className="font-sans font-medium py-2">
                              {tier.label}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground py-2">
                              {formatRupiah(basePrice).replace("Rp", "").trim()}
                            </TableCell>
                            <TableCell className="text-right font-semibold py-2">
                              {formatRupiah(taxPrice).replace("Rp", "").trim()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <UsdIdrHistoryChart history={marketOverview.usdIdrHistory} />
      </section>

      {/* =====================================================================
          4. TABBED RESEARCH & EDUCATION EXPLORER (ONE CLEAN VIEW AT A TIME)
      ===================================================================== */}
      <CrossPillarExplorer />

      {/* =====================================================================
          5. SIMPLE BOTTOM ROW: CALCULATORS & EDITORIAL RESEARCH
      ===================================================================== */}
      <section className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              5 Kalkulator Finansial
            </h2>
            <Link
              href="/calculator"
              className="text-xs font-medium text-primary hover:underline"
            >
              Buka semua →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                tab: "valuation",
                title: "Valuasi Saham",
                desc: "Nilai Intrinsik & Margin of Safety.",
                icon: Scale,
              },
              {
                tab: "ratios",
                title: "Rasio Keuangan",
                desc: "PER, PBV, ROE & Dividend Yield.",
                icon: Calculator,
              },
              {
                tab: "compound",
                title: "Bunga Majemuk",
                desc: "Simulasi pertumbuhan investasi bulanan.",
                icon: TrendingUp,
              },
              {
                tab: "gold",
                title: "Tabel Emas Lengkap",
                desc: "Simulasi Antam 0.5g hingga 1000g.",
                icon: Coins,
              },
              {
                tab: "comparison",
                title: "Bandingkan 2 Saham",
                desc: "Perbandingan rasio emiten berdampingan.",
                icon: Layers,
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.tab}
                  href={`/calculator?tab=${tool.tab}`}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors shadow-2xs"
                >
                  <div className="p-2 rounded-lg bg-secondary text-primary shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tool.title}
                    </div>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div id="published-research" className="lg:col-span-5 scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Publikasi Riset
            </h2>
            <Link
              href="/research"
              className="text-xs font-medium text-primary hover:underline"
            >
              Direktori riset →
            </Link>
          </div>

          {latestResearch.length === 0 ? (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="space-y-1.5">
                <CardTitle className="text-base font-semibold">
                  Belum Ada Riset Publik Terbaru
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Artikel hanya ditampilkan setelah melewati tinjauan dan persetujuan editor di Research Studio.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 flex gap-2">
                <Link
                  href="/research"
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background hover:bg-secondary px-3.5 py-2 text-xs font-medium text-foreground transition-colors"
                >
                  <span>Arsip Riset</span>
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <span>Buka Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-3">
              {latestResearch.map((art) => (
                <Link
                  key={art.id}
                  href={`/research/${art.slug}`}
                  className="block group"
                >
                  <Card className="border-border bg-card hover:border-primary/50 transition-colors">
                    <CardHeader className="py-4 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{art.category}</span>
                        <span>
                          {formatWibDateTime(art.publishedAt || art.updatedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-semibold group-hover:text-primary">
                        {art.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
