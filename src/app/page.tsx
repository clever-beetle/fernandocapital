import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldChart } from "@/components/dashboard/gold-chart";
import { QuickConverter } from "@/components/dashboard/quick-converter";
import { CrossPillarExplorer } from "@/components/dashboard/cross-pillar-explorer";
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
} from "lucide-react";
import { db } from "@/db";
import { goldPrices } from "@/db/schema";
import { desc } from "drizzle-orm";

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
  const rawPrices = await db.select().from(goldPrices).orderBy(desc(goldPrices.timestamp)).limit(50);

  const lastUpdateDate =
    rawPrices.length > 0
      ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(rawPrices[0].timestamp)
      : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const chartDataIdr = rawPrices.reverse().map((record) => ({
    time: new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(
      record.timestamp
    ),
    price: record.antamPriceIdr
      ? parseFloat(record.antamPriceIdr)
      : (parseFloat(record.priceUsd) * 15845) / 31.1035 * 1.05,
  }));

  const currentAntamPrice =
    chartDataIdr.length > 0 ? chartDataIdr[chartDataIdr.length - 1].price : 2725000;
  const currentGoldPriceUsd =
    rawPrices.length > 0 ? parseFloat(rawPrices[rawPrices.length - 1].priceUsd) : 2685.4;

  return (
    <div className="flex flex-col gap-14 max-w-7xl mx-auto w-full pb-12">
      {/* =====================================================================
          HERO MASTHEAD & 5 PILLARS ARCHITECTURAL INDEX
      ===================================================================== */}
      <section className="space-y-8 pt-2">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              AI-Powered, Human-Supervised Financial Intelligence
            </span>
            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-foreground hover:text-[#C3A477] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C3A477]" />
              <span>Model Operasional: 70% AI &amp; Otomasi • 30% Validasi Editor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Riset Ekuitas, Intelijen Pasar &amp; Instrumen Valuasi dalam Satu Ekosistem.
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                Lebih dari sekadar portal berita: <strong className="text-foreground">Fernando Capital</strong>{" "}
                menghubungkan perkembangan makroekonomi dan suku bunga langsung dengan analisis dampak terhadap{" "}
                <strong className="text-foreground">saham, obligasi, dan emas fisik</strong>, didukung mesin
                kalkulasi finansial deterministik yang tervalidasi kode.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <Link
                href="/calculator"
                className="inline-flex items-center justify-between rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-3 text-xs font-bold uppercase tracking-wider shadow-xs hover:opacity-90 transition-opacity"
              >
                <span>Buka 5 Kalkulator &amp; Data Finansial</span>
                <Calculator className="w-4 h-4" />
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center justify-between rounded-xl border border-border bg-background hover:border-[#C3A477] px-4 py-3 text-xs font-semibold text-foreground transition-colors"
              >
                <span>Buka AI Research &amp; Workflow Studio</span>
                <ArrowUpRight className="w-4 h-4 text-[#C3A477]" />
              </Link>
            </div>
          </div>
        </div>

        {/* 5 Core Pillars Architectural Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Arsitektur 5 Pilar Utama Fernando Capital (Saling Terhubung)
            </p>
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Klik pilar untuk menelusuri modul
            </span>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {FIVE_PILLARS.map((pillar) => (
              <Link
                key={pillar.id}
                href={pillar.href}
                className="group rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-[#C3A477] transition-all shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]">
                      {pillar.number}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#C3A477] transition-colors" />
                  </div>
                  <h2 className="text-base font-bold text-foreground group-hover:text-[#101B2C] dark:group-hover:text-[#C3A477] transition-colors">
                    {pillar.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{pillar.subtitle}</p>
                </div>

                <ul className="space-y-1 pt-3 border-t border-border text-[11px] font-medium text-foreground/85">
                  {pillar.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[#C3A477] shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
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
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                PILAR 02
              </span>
              <span>Market Intelligence • Sistem Otomatis 03 (Financial Data Engine)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Pemantauan Pasar Saham, Emas Fisik, Valuta Asing &amp; Indikator Makro
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground bg-secondary/70 border border-border px-3 py-1.5 rounded-lg self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#C3A477]" />
            <span>Timestamp: {lastUpdateDate} • Frekuensi: 5 Menit</span>
          </div>
        </div>

        {/* 4 Market Intelligence Cards with Explicit Provenance */}
        <div className="grid gap-5 md:grid-cols-4">
          <Card className="shadow-xs bg-gradient-to-br from-card via-card to-[#C3A477]/15 border-[#C3A477]/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-foreground">
                Emas Fisik Antam (1g)
              </CardTitle>
              <div className="p-2 bg-[#C3A477]/20 rounded-lg">
                <Coins className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                {currentAntamPrice > 0 ? formatRupiah(currentAntamPrice) : "Rp 2.725.000"}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground mt-2">
                Sumber: Ref. Logam Mulia • Live 5m
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs bg-card border-border hover:border-[#C3A477]/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Spot Emas (XAU/USD)
              </CardTitle>
              <div className="p-2 bg-secondary rounded-lg">
                <Activity className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">
                $
                {currentGoldPriceUsd > 0
                  ? currentGoldPriceUsd.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "2,685.40"}
              </div>
              <p className="text-[11px] font-mono text-muted-foreground mt-2">
                Sumber: Pasar Spot Global / oz • Live 5m
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs bg-card border-border hover:border-[#C3A477]/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                IHSG &amp; Kurs USD/IDR
              </CardTitle>
              <div className="p-2 bg-secondary rounded-lg">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">7.418,20</div>
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">
                +0,64% • USD/IDR Rp 15.845 (BEI / BI)
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-xs bg-card border-border hover:border-[#C3A477]/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                BI-Rate &amp; Yield SBN 10Y
              </CardTitle>
              <div className="p-2 bg-secondary rounded-lg">
                <Landmark className="h-4 w-4 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-foreground">6,00% / 6,68%</div>
              <p className="text-[11px] font-mono text-muted-foreground mt-2">
                Sumber: Bank Indonesia &amp; PHEI
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gold Chart + Quick Converter + Antam Physical Table */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2 h-full">
            <div id="tracker" className="h-full min-h-[540px]">
              <GoldChart data={chartDataIdr} currentPrice={currentAntamPrice} isRupiah={true} />
            </div>
          </div>

          <div className="flex flex-col gap-6 relative z-10 h-full">
            <div id="converter">
              <QuickConverter currentAntamPrice={currentAntamPrice} />
            </div>

            <div id="pricelist" className="flex-1">
              <Card className="shadow-xs bg-card border-border h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center justify-between">
                    <span>Referensi Fisik Antam</span>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 bg-secondary text-foreground border border-border rounded-full">
                      +PPh 0.25%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    <div>Berat</div>
                    <div className="text-right">Dasar</div>
                    <div className="text-right">+Pajak 0.25%</div>
                  </div>
                  {[
                    { label: "0.5 gr", weight: 0.5, multiplier: 1.0367 },
                    { label: "1 gr", weight: 1, multiplier: 1.0 },
                    { label: "5 gr", weight: 5, multiplier: 0.9835 },
                    { label: "10 gr", weight: 10, multiplier: 0.9815 },
                    { label: "50 gr", weight: 50, multiplier: 0.979 },
                    { label: "100 gr", weight: 100, multiplier: 0.9788 },
                  ].map((tier, i) => {
                    const basePrice = currentAntamPrice * tier.weight * tier.multiplier;
                    const taxPrice = basePrice * 1.0025;
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-3 text-xs font-mono items-center py-2 border-b border-border/60 last:border-0 hover:bg-secondary/50 transition-colors rounded-md px-1.5"
                      >
                        <div className="font-sans font-semibold text-foreground">{tier.label}</div>
                        <div className="text-right text-muted-foreground">
                          {currentAntamPrice > 0 ? formatRupiah(basePrice).replace("Rp", "").trim() : "---"}
                        </div>
                        <div className="text-right font-bold text-foreground">
                          {currentAntamPrice > 0 ? formatRupiah(taxPrice).replace("Rp", "").trim() : "---"}
                        </div>
                      </div>
                    );
                  })}

                  <Link
                    href="/calculator?tab=gold"
                    className="mt-2 inline-flex items-center justify-between w-full rounded-lg border border-border bg-secondary/50 hover:border-[#C3A477] px-3 py-2 text-xs font-semibold text-foreground transition-colors"
                  >
                    <span>Lihat Tabel Lengkap 0.5g – 1000g</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                PILAR 04
              </span>
              <span>Financial Data &amp; Tools • Deterministic Code Engine</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              5 Instrumen Kalkulasi &amp; Eksplorasi Data Finansial Interaktif
            </h2>
          </div>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-[#C3A477]"
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
                className="group rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-[#C3A477] transition-all shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-secondary text-foreground">
                      <Icon className="w-4 h-4 text-[#C3A477]" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#C3A477]" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-foreground group-hover:text-[#C3A477]">
                  Buka Kalkulator →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          OPERATING MODEL & CREDIBILITY GOVERNANCE BANNER
      ===================================================================== */}
      <section className="rounded-2xl border border-[#C3A477]/50 bg-card p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-[#C3A477]" />
              <span>Standar Kredibilitas &amp; Tata Kelola Riset Fernando Capital</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-5 py-3 text-xs font-bold uppercase tracking-wider shrink-0 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            <span>Kelola 5 Sistem Otomatis di AI Studio</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
