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
import { Separator } from "@/components/ui/separator";
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
import { FIVE_PILLARS } from "@/lib/intelligence-data";
import {
  ArrowUpRight,
  Activity,
  Coins,
  ShieldCheck,
  Sparkles,
  Scale,
  Calculator,
  TrendingUp,
  Layers,
  Clock,
  Landmark,
  BookOpen,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Terminal,
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
  type IndicatorFreshnessStatus,
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

function getFreshnessBadgeClasses(status: IndicatorFreshnessStatus): string {
  switch (status) {
    case "fresh":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    case "stale":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35";
    case "unavailable":
      return "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30";
    case "not_yet_populated":
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

export default async function Dashboard() {
  const [latestResearch, marketOverview] = await Promise.all([
    getPublishedArticles(3),
    getDashboardMarketOverview(),
  ]);

  const versionInfo = getVersionInfo(false);
  const lastUpdateDate = formatWibDateTime(new Date());
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
    <div className="flex flex-col gap-8 w-full pb-12">
      {/* =====================================================================
          ROW 1: ASYMMETRIC BENTO COMMAND DECK (8 COLS HERO + 4 COLS QUICK CONVERTER)
      ===================================================================== */}
      <section className="grid gap-6 xl:grid-cols-12 items-stretch">
        {/* Left 8 Cols: Command Center Header & Integrated 5-Pillar Ribbon */}
        <Card className="xl:col-span-8 border-border/90 bg-card shadow-md relative overflow-hidden flex flex-col justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_95%_-15%,rgba(195,164,119,0.22),transparent)]"
          />

          <CardHeader className="relative z-10 pb-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="default"
                  className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 h-auto rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
                >
                  <Terminal className="w-3 h-3 mr-1.5" />
                  Institutional Command Center
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] px-2.5 py-1 h-auto rounded-md border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Web Platform Active • v{versionInfo.version}
                </Badge>
              </div>

              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-muted-foreground hover:text-[#C3A477] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C3A477]" />
                <span>70% AI &amp; Otomasi • 30% Validasi Editor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 pt-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Terminal Riset Ekuitas, Intelijen Makro &amp;{" "}
                <span className="bg-gradient-to-r from-[#101B2C] via-[#8F6F3E] to-[#C3A477] dark:from-[#F4F0E7] dark:via-[#E2C89D] dark:to-[#C3A477] bg-clip-text text-transparent">
                  Valuasi Deterministik
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Workspace analitik terpadu <strong className="text-foreground">Fernando Capital</strong>:
                menghubungkan data kurs referensi <strong className="text-foreground">ECB/Frankfurter</strong>,
                transmisi suku bunga lintas aset (<strong className="text-foreground">Saham, SBN, Emas Fisik</strong>),
                dan 5 mesin kalkulasi finansial dalam satu layar komando.
              </p>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {/* Quick Action Strip */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-xs hover:opacity-90 transition-all"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Buka 5 Kalkulator Finansial</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/50 hover:bg-secondary hover:border-[#C3A477] px-3.5 py-2.5 text-xs font-semibold text-foreground transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C3A477]" />
                <span>Direktori Riset</span>
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background hover:border-[#C3A477] px-3.5 py-2.5 text-xs font-semibold text-foreground transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C3A477]" />
                <span>AI Research Studio</span>
              </Link>
            </div>

            <Separator />

            {/* Compact 5-Pillar Horizontal Dock Inside Command Deck */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="uppercase tracking-wider font-semibold">
                  Akses Cepat 5 Pilar Arsitektur
                </span>
                <span>Klik modul untuk lompat ke workbench</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
                {FIVE_PILLARS.map((pillar) => (
                  <Link
                    key={pillar.id}
                    href={pillar.href}
                    className="group rounded-xl border border-border/80 bg-secondary/30 hover:bg-card hover:border-[#C3A477] p-2.5 flex flex-col justify-between gap-1.5 transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="default"
                        className="font-mono text-[10px] px-1.5 py-0 h-4 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
                      >
                        {pillar.number}
                      </Badge>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-[#C3A477]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground leading-tight group-hover:text-[#101B2C] dark:group-hover:text-[#C3A477]">
                        {pillar.title}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {pillar.capabilities[0]}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right 4 Cols: Promoted Above-the-Fold Quick Gold Converter */}
        <div id="converter" className="xl:col-span-4 flex flex-col h-full">
          <QuickConverter currentAntamPrice={currentAntamPrice} />
        </div>
      </section>

      {/* =====================================================================
          ROW 2: PILAR 02 MARKET INTELLIGENCE — COMPACT TELEMETRY & SPLIT GOLD/FX TERMINAL
      ===================================================================== */}
      <section id="market-intelligence" className="scroll-mt-20 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
            >
              PILAR 02
            </Badge>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
              Market Intelligence &amp; Database Telemetry
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl shadow-2xs self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#C3A477]" />
            <span>
              Sinkronisasi Database:{" "}
              {usdIdr.fetchedAtFormattedWib || `${lastUpdateDate} WIB`}
            </span>
          </div>
        </div>

        {/* Row 2A: 4-Column Database Indicator Strip */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* CARD 1: USD_IDR */}
          <Card
            data-indicator-code="USD_IDR"
            className="shadow-sm bg-gradient-to-br from-card via-card to-[#C3A477]/15 border-[#C3A477]/65 flex flex-col justify-between"
          >
            <CardHeader className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    usdIdr.freshnessStatus
                  )}`}
                >
                  {usdIdr.freshnessLabel}
                </span>
                <Globe className="h-4 w-4 text-[#C3A477]" />
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                Kurs Referensi USD/IDR (IDR per USD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {usdIdr.trimmedDecimalValue !== null && formattedUsdIdr ? (
                <>
                  <div>
                    <div className="text-2xl font-extrabold font-mono text-foreground">
                      {formattedUsdIdr}
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {`${usdIdr.trimmedDecimalValue} IDR per 1 USD${
                        usdIdr.changePercent !== null
                          ? ` (${usdIdr.changePercent >= 0 ? "+" : ""}${usdIdr.changePercent.toFixed(2)}%)`
                          : ""
                      }`}
                    </p>
                  </div>

                  {usdIdr.isStale && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] font-mono text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Observasi melewati SLA ({usdIdr.sourceDate}). Nilai terverifikasi terakhir dipertahankan.
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/70 space-y-0.5 text-[10px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Sumber: {usdIdr.sourceDate || "—"}{" "}
                      {usdIdr.asOfFormattedWib ? `(${usdIdr.asOfFormattedWib})` : ""}
                    </p>
                    <p>Sumber: {usdIdr.sourceName}</p>
                    <p className="text-foreground/85">
                      Klasifikasi: {usdIdr.classificationLabel}
                    </p>
                    {usdIdr.fetchedAtFormattedWib && (
                      <p>Diambil: {usdIdr.fetchedAtFormattedWib}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-sm font-bold font-mono text-foreground">
                    {usdIdr.unavailableTitle || "Belum Tersedia"}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {usdIdr.unavailableExplanation}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                    Sumber Terdaftar: {usdIdr.sourceName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 2: IHSG */}
          <Card
            data-indicator-code="IHSG"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    ihsg.freshnessStatus
                  )}`}
                >
                  {ihsg.freshnessLabel}
                </span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Indeks Harga Saham Gabungan (IHSG)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ihsg.trimmedDecimalValue !== null && ihsg.numericValue !== null ? (
                <>
                  <div className="text-2xl font-extrabold font-mono text-foreground">
                    {ihsg.numericValue.toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="pt-2 border-t border-border/70 space-y-0.5 text-[10px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Sumber: {ihsg.sourceDate || "—"}
                    </p>
                    <p>Sumber: {ihsg.sourceName}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-sm font-bold font-mono text-foreground">
                    {ihsg.unavailableTitle}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ihsg.unavailableExplanation}
                  </p>
                  <div className="pt-2 border-t border-border/70 text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <p>Status Provider: {ihsg.readinessStatus}</p>
                    <p>Otoritas: {ihsg.sourceName}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 3: BI_RATE & SBN_10Y */}
          <Card
            data-indicator-code="BI_RATE_SBN_10Y"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    biRate.freshnessStatus
                  )}`}
                >
                  {biRate.freshnessLabel}
                </span>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                BI-Rate &amp; Yield SBN 10 Tahun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {biRate.trimmedDecimalValue !== null || sbn10y.trimmedDecimalValue !== null ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border bg-secondary/40 p-2">
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        BI-Rate
                      </span>
                      <span className="text-base font-bold font-mono text-foreground">
                        {biRate.trimmedDecimalValue !== null
                          ? `${biRate.trimmedDecimalValue}%`
                          : "Belum Diisi"}
                      </span>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/40 p-2">
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        SBN 10Y
                      </span>
                      <span className="text-base font-bold font-mono text-foreground">
                        {sbn10y.trimmedDecimalValue !== null
                          ? `${sbn10y.trimmedDecimalValue}%`
                          : "Belum Diisi"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Sumber: {biRate.sourceName} &amp; {sbn10y.sourceName}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-sm font-bold font-mono text-foreground">
                    {biRate.unavailableTitle}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Indikator suku bunga kebijakan RDG Bank Indonesia (BI-Rate) dan imbal hasil
                    SBN 10 Tahun (PHEI / IBPA) dikelola melalui verifikasi editor (30% Human
                    Oversight) dan belum diisi pada basis data.
                  </p>
                  <div className="pt-2 border-t border-border/70 text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <p>Mode Tata Kelola: {biRate.readinessStatus}</p>
                    <p>Sumber Resmi: Bank Indonesia &amp; PHEI / IBPA</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 4: XAU_USD */}
          <Card
            data-indicator-code="XAU_USD"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-1.5 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    xauUsd.freshnessStatus
                  )}`}
                >
                  {xauUsd.freshnessLabel}
                </span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Spot Emas Global (XAU/USD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {xauUsd.trimmedDecimalValue !== null && xauUsd.numericValue !== null ? (
                <>
                  <div className="text-2xl font-extrabold font-mono text-foreground">
                    $
                    {xauUsd.numericValue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-xs font-normal text-muted-foreground"> / toz</span>
                  </div>
                  <div className="pt-2 border-t border-border/70 space-y-0.5 text-[10px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Sumber: {xauUsd.sourceDate || "—"}
                    </p>
                    <p>Sumber: {xauUsd.sourceName}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <div className="text-sm font-bold font-mono text-foreground">
                    {xauUsd.unavailableTitle}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {xauUsd.unavailableExplanation}
                  </p>
                  <div className="pt-2 border-t border-border/70 text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <p>Status Provider: {xauUsd.readinessStatus}</p>
                    <p>Referensi Fisik IDR tersedia pada simulator Antam di bawah.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Row 2B: Side-by-Side Split Terminal — Left 7 Cols Gold Simulator + Right 5 Cols Antam Table & USD/IDR History */}
        <div className="grid gap-6 xl:grid-cols-12 items-start">
          {/* Left 7 Cols: Interactive Gold Tier Efficiency Simulator */}
          <div id="tracker" className="xl:col-span-7 h-full">
            <GoldChart
              data={chartDataIdr}
              currentPrice={currentAntamPrice}
              isRupiah={true}
            />
          </div>

          {/* Right 5 Cols: Antam Reference Table + Historical USD/IDR Chart */}
          <div className="xl:col-span-5 flex flex-col gap-5">
            <div id="pricelist">
              <Card className="shadow-sm bg-card border-border/90 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base font-extrabold">
                      Referensi Fisik Antam
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      +PPh 0.25%
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] font-mono text-muted-foreground">
                    Preset Acuan 1g: {formatRupiah(currentAntamPrice)} • Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-mono uppercase h-8">
                          Berat
                        </TableHead>
                        <TableHead className="text-right text-[10px] font-mono uppercase h-8">
                          Dasar
                        </TableHead>
                        <TableHead className="text-right text-[10px] font-mono uppercase h-8">
                          +Pajak 0.25%
                        </TableHead>
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
                            <TableCell className="font-sans font-bold text-foreground py-1.5">
                              {tier.label}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground py-1.5">
                              {currentAntamPrice > 0
                                ? formatRupiah(basePrice).replace("Rp", "").trim()
                                : "---"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground py-1.5">
                              {currentAntamPrice > 0
                                ? formatRupiah(taxPrice).replace("Rp", "").trim()
                                : "---"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>

                <CardFooter className="py-2.5 border-t border-border/70 bg-secondary/25">
                  <Link
                    href="/calculator?tab=gold"
                    className="inline-flex items-center justify-between w-full rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                  >
                    <span>Lihat Tabel Lengkap 0.5g – 1000g</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                  </Link>
                </CardFooter>
              </Card>
            </div>

            {/* Historical USD/IDR Exchange Rate Section */}
            <UsdIdrHistoryChart history={marketOverview.usdIdrHistory} />
          </div>
        </div>

        {/* Row 2C: Compact US Macro Benchmarks (FED_FUNDS & US_10Y) + Legal Compliance Strip */}
        <div className="grid gap-4 lg:grid-cols-12 items-stretch">
          {/* CARD 5: FED_FUNDS */}
          <Card
            data-indicator-code="FED_FUNDS"
            className="lg:col-span-4 shadow-2xs bg-card border-border/80 flex flex-col justify-between"
          >
            <CardHeader className="space-y-1.5 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    fedFunds.freshnessStatus
                  )}`}
                >
                  {fedFunds.freshnessLabel}
                </span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  FRED: {fedFunds.externalSeriesId || "DFF"}
                </Badge>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                {fedFunds.officialSeriesName || fedFunds.name} (FED_FUNDS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {fedFunds.trimmedDecimalValue !== null && formattedFedFunds ? (
                <div className="text-xl font-extrabold font-mono text-foreground">
                  {formattedFedFunds}
                </div>
              ) : (
                <>
                  <div className="text-xs font-bold font-mono text-foreground">
                    {fedFunds.unavailableTitle}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {fedFunds.unavailableExplanation}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                    Sumber: {fedFunds.attributionText}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* CARD 6: US_10Y */}
          <Card
            data-indicator-code="US_10Y"
            className="lg:col-span-4 shadow-2xs bg-card border-border/80 flex flex-col justify-between"
          >
            <CardHeader className="space-y-1.5 pb-2">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    us10y.freshnessStatus
                  )}`}
                >
                  {us10y.freshnessLabel}
                </span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  FRED: {us10y.externalSeriesId || "DGS10"}
                </Badge>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                {us10y.officialSeriesName || us10y.name} (US_10Y)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {us10y.trimmedDecimalValue !== null && formattedUs10y ? (
                <div className="text-xl font-extrabold font-mono text-foreground">
                  {formattedUs10y}
                </div>
              ) : (
                <>
                  <div className="text-xs font-bold font-mono text-foreground">
                    {us10y.unavailableTitle}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {us10y.unavailableExplanation}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                    Sumber: {us10y.attributionText}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* FRED® / H.15 Compliance Governance Card */}
          <div
            id="fred-legal-attribution"
            className="lg:col-span-4 rounded-xl border border-[#C3A477]/45 bg-secondary/35 p-4 flex flex-col justify-between gap-2.5 text-xs"
          >
            <div className="space-y-1">
              <p className="font-mono font-bold text-foreground text-[11px]">
                Kepatuhan Sumber Data AS (FED_FUNDS &amp; US_10Y)
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sesuai <strong className="text-foreground">FRED® API Terms of Use</strong>, pengambilan
                dan penyimpanan database untuk seri FRED dinonaktifkan sementara selama evaluasi sumber primer{" "}
                <strong className="text-foreground">Federal Reserve H.15</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
              <a
                href={FRED_TERMS_OF_USE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:border-[#C3A477] px-2.5 py-1 font-semibold text-foreground transition-colors"
              >
                <span>FRED® Terms</span>
                <ArrowUpRight className="w-3 h-3 text-[#C3A477]" />
              </a>
              <a
                href={FRED_LEGAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:border-[#C3A477] px-2.5 py-1 font-semibold text-foreground transition-colors"
              >
                <span>St. Louis Fed Legal</span>
                <ArrowUpRight className="w-3 h-3 text-[#C3A477]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          ROW 3: MASTER-DETAIL INTELLIGENCE WORKBENCH (PILAR 01, PILAR 03 & PILAR 05)
      ===================================================================== */}
      <CrossPillarExplorer />

      {/* =====================================================================
          ROW 4: SPLIT BOTTOM DOCK — PUBLISHED RESEARCH CMS (6 COLS) + 5 CALCULATORS & GOVERNANCE (6 COLS)
      ===================================================================== */}
      <section className="grid gap-6 xl:grid-cols-12 items-stretch">
        {/* Left 6 Cols: Published Editorial Research CMS */}
        <div id="published-research" className="xl:col-span-6 scroll-mt-20 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-[11px] bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
              >
                RISET EDITORIAL
              </Badge>
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                Publikasi Riset Terverifikasi
              </h2>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-[#C3A477]"
            >
              <span>Direktori (/research)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestResearch.length === 0 ? (
            <Card className="border-border/90 bg-card shadow-sm flex-1 flex flex-col justify-between">
              <CardHeader className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-[#C3A477]" />
                  <span>Database-Backed Research CMS • 30% Human Oversight</span>
                </div>
                <CardTitle className="text-base font-extrabold text-foreground">
                  Belum Ada Riset Baru yang Dipublikasikan
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                  Fernando Capital hanya menampilkan laporan riset yang telah melewati tinjauan dan
                  persetujuan editor manusia (30% Human Oversight) di Research Studio. Draf yang sedang
                  disusun tidak ditampilkan ke publik.
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-3 border-t border-border/70 bg-secondary/20 flex flex-wrap items-center gap-2">
                <Link
                  href="/research"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:border-[#C3A477] px-3.5 py-2 text-xs font-semibold text-foreground transition-colors"
                >
                  <span>Buka Direktori Riset</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-3.5 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  <span>Kelola di Research Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid gap-3">
              {latestResearch.map((art) => (
                <Link
                  key={art.id}
                  href={`/research/${art.slug}`}
                  className="group block"
                >
                  <Card className="border-border/90 bg-card hover:border-[#C3A477] transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="default" className="font-mono text-[10px]">
                          {art.category}
                        </Badge>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {formatWibDateTime(art.publishedAt || art.updatedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-base font-extrabold text-foreground group-hover:text-[#C3A477] transition-colors">
                        {art.title}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2">
                        {art.excerpt}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right 6 Cols: Pilar 04 Calculator Quick-Launch Dock + 70/30 Governance */}
        <div className="xl:col-span-6 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-[11px] bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
              >
                PILAR 04
              </Badge>
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                5 Mesin Kalkulator Deterministik
              </h2>
            </div>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-[#C3A477]"
            >
              <span>Buka Semua (/calculator)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                tab: "valuation",
                title: "Stock Valuation",
                desc: "Nilai Intrinsik & Margin of Safety (%).",
                icon: Scale,
              },
              {
                tab: "ratios",
                title: "Financial Ratios",
                desc: "PER, PBV, ROE, Div. Yield & DER.",
                icon: Calculator,
              },
              {
                tab: "compound",
                title: "Compound Interest",
                desc: "Simulasi akumulasi bunga majemuk.",
                icon: TrendingUp,
              },
              {
                tab: "gold",
                title: "Gold Reference",
                desc: "Tabel Antam 0.5g–1000g (+PPh 22).",
                icon: Coins,
              },
              {
                tab: "comparison",
                title: "Company Compare",
                desc: "Komparasi 2 emiten berdampingan.",
                icon: Layers,
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.tab}
                  href={`/calculator?tab=${tool.tab}`}
                  className="group rounded-xl border border-border/90 bg-card hover:border-[#C3A477] p-3 flex flex-col justify-between gap-2 shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-lg bg-secondary text-foreground">
                      <Icon className="w-3.5 h-3.5 text-[#C3A477]" />
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#C3A477]" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-foreground">
                      {tool.title}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {tool.desc}
                    </p>
                  </div>
                </Link>
              );
            })}

            <Link
              href="/studio"
              className="group rounded-xl border border-[#C3A477]/60 bg-secondary/40 hover:bg-secondary p-3 flex flex-col justify-between gap-2 shadow-2xs transition-all"
            >
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-4 h-4 text-[#C3A477]" />
                <Badge variant="outline" className="font-mono text-[9px] px-1.5 py-0 h-4">
                  70/30 Gate
                </Badge>
              </div>
              <div>
                <div className="text-xs font-extrabold text-foreground">
                  AI Research Studio
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  70% AI &amp; Automation • 30% Human Oversight
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
