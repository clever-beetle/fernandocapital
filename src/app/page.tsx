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
import { HeroShowcase } from "@/components/dashboard/hero-showcase";
import {
  ArrowUpRight,
  Calculator,
  BookOpen,
  Scale,
  TrendingUp,
  Coins,
  Layers,
  Globe,
  Landmark,
  CheckCircle2,
  Sparkles,
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
    <div className="space-y-14 pb-12">
      {/* =====================================================================
          1. CATCHY SPLIT HERO SECTION (HEADLINE LEFT + FLOATING SHOWCASE RIGHT)
      ===================================================================== */}
      <section className="pt-2 sm:pt-4 grid gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Web Platform Active • v{versionInfo.version}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Riset Finansial, Kurs &amp;{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Kalkulator Valuasi yang Jernih.
            </span>
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
            Pantau kurs referensi harian ECB, simulasikan kurva harga emas fisik, dan
            uji valuasi wajar saham Indonesia dengan mesin kalkulasi deterministik yang akurat.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 text-sm font-semibold shadow-md shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>Coba 5 Kalkulator Finansial</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:bg-secondary px-5 py-3 text-sm font-semibold text-foreground shadow-2xs transition-colors"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Direktori Riset</span>
            </Link>
          </div>

          {/* Crisp 3-Stat Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Kurs Harian ECB</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>5 Studi Kasus Saham</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>12 Pecahan Emas</span>
            </div>
          </div>
        </div>

        {/* Right Floating Interactive Showcase Card */}
        <div className="lg:col-span-5">
          <HeroShowcase
            formattedUsdIdr={formattedUsdIdr}
            usdIdrDate={usdIdr.sourceDate}
          />
        </div>
      </section>

      {/* =====================================================================
          2. COLOR-CODED 4-CARD MARKET SUMMARY
      ===================================================================== */}
      <section id="market-intelligence" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
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
          <Card
            data-indicator-code="USD_IDR"
            className="border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.06] to-card shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Globe className="w-4 h-4" />
                </span>
                <Badge
                  variant="secondary"
                  className="text-[11px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                >
                  {usdIdr.freshnessLabel}
                </Badge>
              </div>
              <CardDescription className="text-xs font-medium pt-2">
                Kurs USD/IDR (Ref. ECB)
              </CardDescription>
              <CardTitle className="text-2xl font-extrabold font-mono text-foreground">
                {formattedUsdIdr || usdIdr.unavailableTitle || "Belum Tersedia"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              {usdIdr.trimmedDecimalValue !== null ? (
                <>
                  <p>
                    {usdIdr.trimmedDecimalValue} IDR per 1 USD • {usdIdr.sourceDate}
                  </p>
                  <details className="pt-0.5">
                    <summary className="cursor-pointer font-medium text-primary hover:underline">
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
          <Card
            data-indicator-code="IHSG"
            className="border-border bg-card shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  {ihsg.freshnessLabel}
                </Badge>
              </div>
              <CardDescription className="text-xs font-medium pt-2">
                Indeks IHSG
              </CardDescription>
              <CardTitle className="text-base font-bold text-foreground">
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
          <Card
            data-indicator-code="BI_RATE_SBN_10Y"
            className="border-border bg-card shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Landmark className="w-4 h-4" />
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  {biRate.freshnessLabel}
                </Badge>
              </div>
              <CardDescription className="text-xs font-medium pt-2">
                BI-Rate &amp; SBN 10Y
              </CardDescription>
              <CardTitle className="text-base font-bold text-foreground">
                {biRate.trimmedDecimalValue !== null ||
                sbn10y.trimmedDecimalValue !== null
                  ? `${biRate.trimmedDecimalValue ?? "—"}% / ${
                      sbn10y.trimmedDecimalValue ?? "—"
                    }%`
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
          <Card
            data-indicator-code="XAU_USD"
            className="border-border bg-card shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Coins className="w-4 h-4" />
                </span>
                <Badge variant="secondary" className="text-[11px]">
                  {xauUsd.freshnessLabel}
                </Badge>
              </div>
              <CardDescription className="text-xs font-medium pt-2">
                Spot Emas (XAU/USD)
              </CardDescription>
              <CardTitle className="text-base font-bold text-foreground">
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

        {/* Quiet Collapsible US Macro & Governance Info */}
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
          3. LIVE GOLD CURVE SIMULATOR & EXCHANGE RATE SECTION
      ===================================================================== */}
      <section className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left 7 Cols: Gold Simulator with Live Recharts Curve */}
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
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">
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
                            <TableCell className="font-sans font-semibold py-2">
                              {tier.label}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground py-2">
                              {formatRupiah(basePrice).replace("Rp", "").trim()}
                            </TableCell>
                            <TableCell className="text-right font-bold py-2">
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
          4. TABBED RESEARCH & EDUCATION EXPLORER
      ===================================================================== */}
      <CrossPillarExplorer />

      {/* =====================================================================
          5. CALCULATORS & EDITORIAL RESEARCH + DARK GRADIENT CTA BANNER
      ===================================================================== */}
      <section className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              5 Kalkulator Finansial
            </h2>
            <Link
              href="/calculator"
              className="text-xs font-semibold text-primary hover:underline"
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
                tint: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
              },
              {
                tab: "ratios",
                title: "Rasio Keuangan",
                desc: "PER, PBV, ROE & Dividend Yield.",
                icon: Calculator,
                tint: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
              },
              {
                tab: "compound",
                title: "Bunga Majemuk",
                desc: "Simulasi pertumbuhan investasi bulanan.",
                icon: TrendingUp,
                tint: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
              },
              {
                tab: "gold",
                title: "Tabel Emas Lengkap",
                desc: "Simulasi Antam 0.5g hingga 1000g.",
                icon: Coins,
                tint: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
              },
              {
                tab: "comparison",
                title: "Bandingkan 2 Saham",
                desc: "Perbandingan rasio emiten berdampingan.",
                icon: Layers,
                tint: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.tab}
                  href={`/calculator?tab=${tool.tab}`}
                  className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${tool.tint}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
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
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Publikasi Riset
            </h2>
            <Link
              href="/research"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Direktori riset →
            </Link>
          </div>

          {latestResearch.length === 0 ? (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="space-y-1.5">
                <CardTitle className="text-base font-bold">
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

      {/* =====================================================================
          6. MODERN FINTECH DARK GRADIENT CALLOUT BANNER
      ===================================================================== */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-7 sm:p-10 shadow-xl relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300">
              <Sparkles className="w-4 h-4" />
              70% AI &amp; Automation • 30% Human Oversight
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Siap Menghitung Valuasi Saham &amp; Strategi Aset Anda?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Gunakan 5 kalkulator deterministik kami untuk menguji skenario harga wajar saham, rasio keuangan, bunga majemuk, dan emas fisik secara instan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 text-sm font-bold shadow-sm transition-colors"
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Mulai Simulasi</span>
            </Link>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white px-5 py-3 text-sm font-semibold transition-colors"
            >
              <span>Research Studio</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
