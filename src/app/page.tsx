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
  Database,
  CheckCircle2,
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
    <div className="flex flex-col gap-16 max-w-7xl mx-auto w-full pb-14">
      {/* =====================================================================
          SHADCN INSTITUTIONAL TERMINAL HERO & 5 PILLARS BENTO MATRIX
      ===================================================================== */}
      <section className="space-y-8 pt-2">
        <Card className="border-border/90 bg-card shadow-lg relative overflow-hidden">
          {/* Subtle Architectural Grid & Ambient Gold Accent Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_90%_-10%,rgba(195,164,119,0.22),transparent)]"
          />

          <CardHeader className="relative z-10 pb-4 md:px-10 md:pt-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="default"
                  className="font-mono text-[11px] uppercase tracking-wider px-3 py-1 h-auto rounded-full bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  AI-Powered, Human-Supervised Financial Intelligence
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] px-2.5 py-1 h-auto rounded-full border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Web Platform Active • v{versionInfo.version}
                </Badge>
              </div>

              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground hover:text-[#C3A477] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C3A477]" />
                <span>Model Operasional: 70% AI &amp; Otomasi • 30% Validasi Editor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 md:px-10 pb-8">
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              {/* Left 7 Cols: Editorial Headline & Action Bar */}
              <div className="lg:col-span-7 space-y-5">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                  Riset Ekuitas, Intelijen Pasar &amp;{" "}
                  <span className="bg-gradient-to-r from-[#101B2C] via-[#8F6F3E] to-[#C3A477] dark:from-[#F4F0E7] dark:via-[#E2C89D] dark:to-[#C3A477] bg-clip-text text-transparent">
                    Instrumen Valuasi Deterministik
                  </span>{" "}
                  dalam Satu Ekosistem.
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Lebih dari sekadar portal berita:{" "}
                  <strong className="text-foreground">Fernando Capital</strong> menghubungkan
                  perkembangan makroekonomi dan suku bunga langsung dengan analisis dampak terhadap{" "}
                  <strong className="text-foreground">saham, obligasi, dan emas fisik</strong>,
                  didukung mesin kalkulasi finansial deterministik yang tervalidasi kode.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    href="/calculator"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-90 transition-all"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Buka 5 Kalkulator &amp; Data Finansial</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/research"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 hover:bg-secondary hover:border-[#C3A477] px-4 py-3 text-xs font-semibold text-foreground transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[#C3A477]" />
                    <span>Direktori Riset</span>
                  </Link>
                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-background hover:border-[#C3A477] px-4 py-3 text-xs font-semibold text-foreground transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-[#C3A477]" />
                    <span>AI Research Studio</span>
                  </Link>
                </div>
              </div>

              {/* Right 5 Cols: Shadcn Live Telemetry Snapshot Card */}
              <div className="lg:col-span-5">
                <Card className="border-[#C3A477]/50 bg-secondary/30 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                        <Database className="w-3.5 h-3.5 text-[#C3A477]" />
                        Telemetry Snapshot • Neon PostgreSQL
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      >
                        {usdIdr.freshnessLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                          USD/IDR (Ref. ECB)
                        </span>
                        <span className="text-lg font-extrabold font-mono text-foreground mt-0.5 block">
                          {formattedUsdIdr || "Belum Tersedia"}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {usdIdr.sourceDate || "EOD Reference"}
                        </span>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3 shadow-2xs">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                          Simulasi Acuan Emas 1g
                        </span>
                        <span className="text-lg font-extrabold font-mono text-foreground mt-0.5 block">
                          {formatRupiah(currentAntamPrice)}
                        </span>
                        <span className="text-[10px] font-mono text-[#C3A477]">
                          Preset Internal • +PPh 0.25%
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/80 bg-card/80 p-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Status Mesin Finansial:</span>
                      <span className="font-bold text-foreground">
                        10 Indikator • 5 Emiten IDX
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5 Core Pillars Architectural Matrix (Shadcn Bento Cards) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
              Arsitektur 5 Pilar Utama Fernando Capital (Saling Terhubung)
            </p>
            <Badge variant="secondary" className="font-mono text-[11px] hidden sm:inline-flex">
              Klik pilar untuk menelusuri modul
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FIVE_PILLARS.map((pillar) => (
              <Link
                key={pillar.id}
                href={pillar.href}
                className="group block h-full focus:outline-none"
              >
                <Card className="h-full border-border/90 bg-card hover:border-[#C3A477] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
                  <CardHeader className="pb-2 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="default"
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
                      >
                        {pillar.number}
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#C3A477] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <CardTitle className="text-base font-extrabold text-foreground group-hover:text-[#101B2C] dark:group-hover:text-[#C3A477] transition-colors">
                      {pillar.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                      {pillar.subtitle}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2">
                    <Separator className="mb-3" />
                    <ul className="space-y-1.5 text-[11px] font-medium text-foreground/85">
                      {pillar.capabilities.map((cap) => (
                        <li key={cap} className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C3A477] shrink-0" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          PILAR 02: MARKET INTELLIGENCE & FINANCIAL DATA ENGINE
      ===================================================================== */}
      <section id="market-intelligence" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                PILAR 02
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                Market Intelligence • Sistem Otomatis 03 (Financial Data Engine)
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Pemantauan Pasar Saham, Emas Fisik, Valuta Asing &amp; Indikator Makro
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card border border-border px-3.5 py-2 rounded-xl shadow-2xs self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#C3A477]" />
            <span>
              Sinkronisasi Database:{" "}
              {usdIdr.fetchedAtFormattedWib || `${lastUpdateDate} WIB`}
            </span>
          </div>
        </div>

        {/* Database-Backed Market Indicators Overview (Neon PostgreSQL market_indicators) */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* CARD 1: USD_IDR (Verified Database Observation) */}
          <Card
            data-indicator-code="USD_IDR"
            className="shadow-sm bg-gradient-to-br from-card via-card to-[#C3A477]/15 border-[#C3A477]/65 flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    usdIdr.freshnessStatus
                  )}`}
                >
                  {usdIdr.freshnessLabel}
                </span>
                <div className="p-2 bg-[#C3A477]/20 rounded-xl">
                  <Globe className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                Kurs Referensi USD/IDR (IDR per USD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
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

                  <div className="pt-2 border-t border-border/70 space-y-1 text-[11px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Sumber: {usdIdr.sourceDate || "—"}{" "}
                      {usdIdr.asOfFormattedWib ? `(${usdIdr.asOfFormattedWib})` : ""}
                    </p>
                    <p>Sumber: {usdIdr.sourceName}</p>
                    <p className="text-[10px] text-foreground/85">
                      Klasifikasi: {usdIdr.classificationLabel}
                    </p>
                    {usdIdr.fetchedAtFormattedWib && (
                      <p className="text-[10px]">
                        Diambil: {usdIdr.fetchedAtFormattedWib}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
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

          {/* CARD 2: IHSG (Database-Backed • Honest Pending/Unavailable State when NULL) */}
          <Card
            data-indicator-code="IHSG"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    ihsg.freshnessStatus
                  )}`}
                >
                  {ihsg.freshnessLabel}
                </span>
                <div className="p-2 bg-secondary rounded-xl">
                  <TrendingUp className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Indeks Harga Saham Gabungan (IHSG)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {ihsg.trimmedDecimalValue !== null && ihsg.numericValue !== null ? (
                <>
                  <div className="text-2xl font-extrabold font-mono text-foreground">
                    {ihsg.numericValue.toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="pt-2 border-t border-border/70 space-y-1 text-[11px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Sumber: {ihsg.sourceDate || "—"}
                    </p>
                    <p>Sumber: {ihsg.sourceName}</p>
                    {ihsg.fetchedAtFormattedWib && (
                      <p className="text-[10px]">Diambil: {ihsg.fetchedAtFormattedWib}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
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

          {/* CARD 3: BI_RATE & SBN_10Y (Database-Backed • Editor-Verified Governance) */}
          <Card
            data-indicator-code="BI_RATE_SBN_10Y"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    biRate.freshnessStatus
                  )}`}
                >
                  {biRate.freshnessLabel}
                </span>
                <div className="p-2 bg-secondary rounded-xl">
                  <Landmark className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                BI-Rate &amp; Yield SBN 10 Tahun
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
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
                <div className="space-y-2">
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

          {/* CARD 4: XAU_USD (Database-Backed • Disabled Provider Governance when NULL) */}
          <Card
            data-indicator-code="XAU_USD"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                    xauUsd.freshnessStatus
                  )}`}
                >
                  {xauUsd.freshnessLabel}
                </span>
                <div className="p-2 bg-secondary rounded-xl">
                  <Activity className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Spot Emas Global (XAU/USD)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {xauUsd.trimmedDecimalValue !== null && xauUsd.numericValue !== null ? (
                <>
                  <div className="text-2xl font-extrabold font-mono text-foreground">
                    $
                    {xauUsd.numericValue.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      / toz
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border/70 space-y-1 text-[11px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Sumber: {xauUsd.sourceDate || "—"}
                    </p>
                    <p>Sumber: {xauUsd.sourceName}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-bold font-mono text-foreground">
                    {xauUsd.unavailableTitle}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {xauUsd.unavailableExplanation}
                  </p>
                  <div className="pt-2 border-t border-border/70 text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <p>Status Provider: {xauUsd.readinessStatus}</p>
                    <p>Referensi Fisik IDR tetap tersedia melalui modul Antam di bawah.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FRED US Macroeconomic & Benchmark Interest Rate Indicators (DFF & DGS10) */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* CARD 5: FED_FUNDS (FRED Series: DFF) */}
          <Card
            data-indicator-code="FED_FUNDS"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                      fedFunds.freshnessStatus
                    )}`}
                  >
                    {fedFunds.freshnessLabel}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    FRED Series: {fedFunds.externalSeriesId || "DFF"} •{" "}
                    {fedFunds.nativeFrequencyLabel}
                  </Badge>
                </div>
                <div className="p-2 bg-secondary rounded-xl">
                  <Landmark className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                {fedFunds.officialSeriesName || fedFunds.name} (FED_FUNDS)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {fedFunds.trimmedDecimalValue !== null && formattedFedFunds ? (
                <>
                  <div>
                    <div className="text-2xl font-extrabold font-mono text-foreground">
                      {formattedFedFunds}
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {`Unit: Percent (${fedFunds.trimmedDecimalValue}% p.a.)${
                        fedFunds.changePercent !== null
                          ? ` • Perubahan: ${fedFunds.changePercent >= 0 ? "+" : ""}${fedFunds.changePercent.toFixed(2)}%`
                          : ""
                      }`}
                    </p>
                  </div>

                  {fedFunds.isStale && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] font-mono text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Observasi melewati SLA ({fedFunds.sourceDate}). Nilai terverifikasi terakhir dipertahankan.
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/70 space-y-1 text-[11px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Observasi H.15: {fedFunds.sourceDate || "—"}{" "}
                      {fedFunds.asOfFormattedWib ? `(${fedFunds.asOfFormattedWib})` : ""}
                    </p>
                    <p>Sumber: {fedFunds.attributionText}</p>
                    <p className="text-[10px] text-foreground/85">
                      Frekuensi Rilis: {fedFunds.nativeFrequencyLabel} (Bukan Kuotasi Intraday Kontinu)
                    </p>
                    {fedFunds.fetchedAtFormattedWib && (
                      <p className="text-[10px]">
                        Diambil: {fedFunds.fetchedAtFormattedWib}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-bold font-mono text-foreground">
                    {fedFunds.unavailableTitle}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {fedFunds.unavailableExplanation}
                  </p>
                  <div className="pt-2 border-t border-border/70 text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <p>Sumber: {fedFunds.attributionText}</p>
                    <p>Frekuensi: {fedFunds.nativeFrequencyLabel} • Unit: Percent</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 6: US_10Y (FRED Series: DGS10) */}
          <Card
            data-indicator-code="US_10Y"
            className="shadow-xs bg-card border-border/90 hover:border-[#C3A477]/60 transition-colors flex flex-col justify-between"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getFreshnessBadgeClasses(
                      us10y.freshnessStatus
                    )}`}
                  >
                    {us10y.freshnessLabel}
                  </span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    FRED Series: {us10y.externalSeriesId || "DGS10"} •{" "}
                    {us10y.nativeFrequencyLabel}
                  </Badge>
                </div>
                <div className="p-2 bg-secondary rounded-xl">
                  <Activity className="h-4 w-4 text-foreground" />
                </div>
              </div>
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground font-bold">
                {us10y.officialSeriesName || us10y.name} (US_10Y)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {us10y.trimmedDecimalValue !== null && formattedUs10y ? (
                <>
                  <div>
                    <div className="text-2xl font-extrabold font-mono text-foreground">
                      {formattedUs10y}
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {`Unit: Percent (${us10y.trimmedDecimalValue}% p.a.)${
                        us10y.changePercent !== null
                          ? ` • Perubahan: ${us10y.changePercent >= 0 ? "+" : ""}${us10y.changePercent.toFixed(2)}%`
                          : ""
                      }`}
                    </p>
                  </div>

                  {us10y.isStale && (
                    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] font-mono text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Observasi melewati SLA ({us10y.sourceDate}). Nilai terverifikasi terakhir dipertahankan.
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/70 space-y-1 text-[11px] font-mono text-muted-foreground">
                    <p className="text-foreground font-semibold">
                      Tanggal Observasi H.15: {us10y.sourceDate || "—"}{" "}
                      {us10y.asOfFormattedWib ? `(${us10y.asOfFormattedWib})` : ""}
                    </p>
                    <p>Sumber: {us10y.attributionText}</p>
                    <p className="text-[10px] text-foreground/85">
                      Frekuensi Rilis: {us10y.nativeFrequencyLabel} (Bukan Kuotasi Intraday Kontinu)
                    </p>
                    {us10y.fetchedAtFormattedWib && (
                      <p className="text-[10px]">
                        Diambil: {us10y.fetchedAtFormattedWib}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-bold font-mono text-foreground">
                    {us10y.unavailableTitle}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {us10y.unavailableExplanation}
                  </p>
                  <div className="pt-2 border-t border-border/70 text-[10px] font-mono text-muted-foreground space-y-0.5">
                    <p>Sumber: {us10y.attributionText}</p>
                    <p>Frekuensi: {us10y.nativeFrequencyLabel} • Unit: Percent</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Public FRED® / H.15 Compliance & Source Governance Disclosure */}
        <div
          id="fred-legal-attribution"
          className="rounded-xl border border-[#C3A477]/45 bg-secondary/40 px-4 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
        >
          <div className="space-y-1">
            <p className="font-mono font-bold text-foreground">
              Status Kepatuhan Sumber Data AS (FED_FUNDS &amp; US_10Y): Dinonaktifkan Sementara (Compliance Review)
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Berdasarkan tinjauan kepatuhan terhadap{" "}
              <strong className="text-foreground">FRED® Services &amp; API Terms of Use</strong>{" "}
              (larangan penyimpanan/caching permanen ke basis data serta pembatasan penggunaan pada
              sistem AI/LLM), Fernando Capital menonaktifkan pengambilan data otomatis dari FRED API
              dan tidak menyimpan data FRED di basis data. Evaluasi sumber primer{" "}
              <strong className="text-foreground">
                Board of Governors of the Federal Reserve System (H.15 Selected Interest Rates)
              </strong>{" "}
              didokumentasikan dalam kebijakan tata kelola data kami.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0 font-mono text-[11px]">
            <a
              href={FRED_TERMS_OF_USE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 font-semibold text-foreground transition-colors"
            >
              <span>FRED® API Terms of Use</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
            </a>
            <a
              href={FRED_LEGAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 font-semibold text-foreground transition-colors"
            >
              <span>St. Louis Fed Legal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
            </a>
          </div>
        </div>

        {/* Historical USD/IDR Exchange Rate Section (market_price_history) */}
        <UsdIdrHistoryChart history={marketOverview.usdIdrHistory} />

        {/* Antam Physical Gold Section: Gold Chart + Quick Converter + Shadcn Table */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2 h-full">
            <div id="tracker" className="h-full min-h-[540px]">
              <GoldChart
                data={chartDataIdr}
                currentPrice={currentAntamPrice}
                isRupiah={true}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 relative z-10 h-full">
            <div id="converter">
              <QuickConverter currentAntamPrice={currentAntamPrice} />
            </div>

            <div id="pricelist" className="flex-1">
              <Card className="shadow-sm bg-card border-border/90 h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-extrabold">
                      Referensi Fisik Antam
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      +PPh 0.25%
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] font-mono text-muted-foreground">
                    Preset Acuan 1g: {formatRupiah(currentAntamPrice)} • Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[11px] font-mono uppercase">
                          Berat
                        </TableHead>
                        <TableHead className="text-right text-[11px] font-mono uppercase">
                          Dasar
                        </TableHead>
                        <TableHead className="text-right text-[11px] font-mono uppercase">
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
                            <TableCell className="font-sans font-bold text-foreground py-2">
                              {tier.label}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground py-2">
                              {currentAntamPrice > 0
                                ? formatRupiah(basePrice).replace("Rp", "").trim()
                                : "---"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-foreground py-2">
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

                <CardFooter className="pt-3 border-t border-border/70 bg-secondary/25">
                  <Link
                    href="/calculator?tab=gold"
                    className="inline-flex items-center justify-between w-full rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-2 text-xs font-semibold text-foreground transition-colors"
                  >
                    <span>Lihat Tabel Lengkap 0.5g – 1000g</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          FEATURED & LATEST PUBLISHED RESEARCH (DATABASE-BACKED CMS)
      ===================================================================== */}
      <section id="published-research" className="scroll-mt-28 space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                RISET EDITORIAL
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                Database-Backed Research CMS • 30% Human Oversight Verified
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Riset &amp; Publikasi Editorial Terbaru
            </h2>
          </div>
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-[#C3A477]"
          >
            <span>Lihat Semua Riset (/research)</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {latestResearch.length === 0 ? (
          <Card className="border-border/90 bg-card shadow-sm">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <BookOpen className="w-4 h-4 text-[#C3A477]" />
                  <span>Arsip Riset Terverifikasi</span>
                </div>
                <h3 className="text-lg font-extrabold text-foreground">
                  Belum Ada Riset Baru yang Dipublikasikan
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Fernando Capital hanya menampilkan laporan riset yang telah melewati tinjauan dan persetujuan
                  editor manusia (30% Human Oversight) di Research Studio. Draf yang sedang disusun tidak
                  ditampilkan ke publik.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/research"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background hover:border-[#C3A477] px-4 py-2.5 text-xs font-semibold text-foreground transition-colors"
                >
                  <span>Direktori Riset</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                </Link>
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  <span>Kelola di Research Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {latestResearch.map((art) => (
              <Link
                key={art.id}
                href={`/research/${art.slug}`}
                className="group block h-full"
              >
                <Card className="h-full border-border/90 bg-card hover:border-[#C3A477] hover:shadow-md transition-all flex flex-col justify-between">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="default"
                        className="font-mono text-[11px] bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
                      >
                        {art.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-mono text-[11px] border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-extrabold text-foreground group-hover:text-[#101B2C] dark:group-hover:text-[#C3A477] transition-colors leading-snug">
                      {art.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {art.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-3 border-t border-border/70 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C3A477]" />
                      {formatWibDateTime(art.publishedAt || art.updatedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground group-hover:text-[#C3A477]">
                      Baca Riset
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          PILAR 03 (ECONOMIC INSIGHTS), PILAR 01 (EQUITY RESEARCH) & PILAR 05 (KNOWLEDGE)
      ===================================================================== */}
      <CrossPillarExplorer />

      {/* =====================================================================
          PILAR 04: FINANCIAL DATA & TOOLS GATEWAY
      ===================================================================== */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                PILAR 04
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                Financial Data &amp; Tools • Deterministic Code Engine
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              5 Instrumen Kalkulasi &amp; Eksplorasi Data Finansial Interaktif
            </h2>
          </div>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-[#C3A477]"
          >
            <span>Buka Halaman Kalkulator Penuh</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              tab: "valuation",
              title: "Stock Valuation",
              desc: "Hitung Nilai Intrinsik saham & diskon Margin of Safety (%).",
              icon: Scale,
            },
            {
              tab: "ratios",
              title: "Financial Ratios",
              desc: "Evaluasi PER, PBV, ROE, Dividend Yield & Earnings Yield.",
              icon: Calculator,
            },
            {
              tab: "compound",
              title: "Compound Interest",
              desc: "Simulasi akumulasi modal & efek bunga majemuk bulanan.",
              icon: TrendingUp,
            },
            {
              tab: "gold",
              title: "Gold Reference",
              desc: "Tabel lengkap emas Antam 0.5g–1000g (+PPh 22 & Buyback).",
              icon: Coins,
            },
            {
              tab: "comparison",
              title: "Company Comparison",
              desc: "Bandingkan fundamental & valuasi 2 emiten secara berdampingan.",
              icon: Layers,
            },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.tab}
                href={`/calculator?tab=${tool.tab}`}
                className="group block h-full"
              >
                <Card className="h-full border-border/90 bg-card hover:border-[#C3A477] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
                  <CardHeader className="space-y-2.5 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-secondary text-foreground">
                        <Icon className="w-4 h-4 text-[#C3A477]" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#C3A477]" />
                    </div>
                    <CardTitle className="text-sm font-extrabold text-foreground">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                      {tool.desc}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2.5 border-t border-border/60 bg-secondary/20">
                    <span className="text-[11px] font-mono font-bold text-foreground group-hover:text-[#C3A477]">
                      Buka Kalkulator →
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          OPERATING MODEL & CREDIBILITY GOVERNANCE BANNER
      ===================================================================== */}
      <Card className="border-[#C3A477]/55 bg-card shadow-md">
        <CardContent className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-[#C3A477]" />
              <span>Standar Kredibilitas &amp; Tata Kelola Riset Fernando Capital</span>
            </div>
            <h3 className="text-xl font-extrabold text-foreground">
              70% AI &amp; Automation • 30% Human Oversight
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Setiap publikasi dan kalkulasi di Fernando Capital memisahkan otomasi pengumpulan data dari
              validasi editorial. Seluruh angka rasio dan valuasi dihitung menggunakan kode deterministik dari
              sumber resmi, dilengkapi tanggal data, metodologi, serta ditinjau sebelum terbit.
            </p>
          </div>
          <Link
            href="/studio"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-5 py-3 text-xs font-bold uppercase tracking-wider shrink-0 hover:opacity-90 transition-opacity shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Kelola 5 Sistem Otomatis di AI Studio</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
