"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  COMPANY_RESEARCH_LIST,
  CONNECTED_MACRO_INSIGHTS,
  KNOWLEDGE_MODULES,
} from "@/lib/intelligence-data";
import {
  ArrowUpRight,
  Building2,
  TrendingUp,
  Landmark,
  Coins,
  Calculator,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
} from "lucide-react";
import { formatRibuanInput } from "@/components/system/system-provider";

export function CrossPillarExplorer() {
  const [selectedMacroId, setSelectedMacroId] = useState(
    CONNECTED_MACRO_INSIGHTS[0].id
  );
  const [selectedTicker, setSelectedTicker] = useState(
    COMPANY_RESEARCH_LIST[0].ticker
  );

  const activeMacro =
    CONNECTED_MACRO_INSIGHTS.find((m) => m.id === selectedMacroId) ||
    CONNECTED_MACRO_INSIGHTS[0];
  const activeCompany =
    COMPANY_RESEARCH_LIST.find((c) => c.ticker === selectedTicker) ||
    COMPANY_RESEARCH_LIST[0];

  const marginOfSafetyNum =
    ((activeCompany.intrinsicValue - activeCompany.price) /
      activeCompany.intrinsicValue) *
    100;
  const marginOfSafety = marginOfSafetyNum.toFixed(1);
  const mosProgress = Math.max(15, Math.min(100, 50 + marginOfSafetyNum * 1.5));
  const roeProgress = Math.max(10, Math.min(100, activeCompany.roe * 3.5));

  const handleSelectRelatedTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    const el = document.getElementById("equity-research");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-16">
      {/* =====================================================================
          PILAR 03: ECONOMIC INSIGHTS & CROSS-ASSET IMPACT MATRIX
      ===================================================================== */}
      <section id="economic-insights" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                PILAR 03
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                Economic Insights • Cross-Asset Transmission
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Menghubungkan Kejadian Ekonomi dengan Dampaknya
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md">
            Pilih peristiwa makroekonomi di bawah untuk menelusuri rantai dampaknya terhadap{" "}
            <strong className="text-foreground">Saham, Obligasi, dan Emas</strong> beserta alat hitung terkait.
          </p>
        </div>

        {/* Selector Kejadian Ekonomi (Shadcn Interactive Cards) */}
        <div className="grid gap-3.5 md:grid-cols-3">
          {CONNECTED_MACRO_INSIGHTS.map((item, idx) => {
            const isSelected = item.id === activeMacro.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedMacroId(item.id)}
                className="text-left group focus:outline-none"
              >
                <Card
                  className={`h-full transition-all duration-200 ${
                    isSelected
                      ? "border-[#101B2C] dark:border-[#C3A477] bg-card shadow-md ring-2 ring-[#C3A477]/45 -translate-y-0.5"
                      : "border-border/80 bg-card/75 hover:bg-card hover:border-[#C3A477]/60 hover:shadow-sm"
                  }`}
                >
                  <CardHeader className="pb-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={isSelected ? "default" : "secondary"}
                        className="font-mono text-[10px] uppercase tracking-wider"
                      >
                        03.{idx + 1} • {item.tag.split("•")[0].trim()}
                      </Badge>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {item.date}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {/* Detail Analisis Makro & Rantai Dampak 3 Kelas Aset */}
        <Card className="border-border/90 bg-card shadow-md overflow-hidden">
          <CardHeader className="border-b border-border/70 bg-gradient-to-r from-[#C3A477]/10 via-transparent to-transparent pb-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-2.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="default"
                    className="font-mono text-xs px-2.5 py-0.5 bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
                  >
                    {activeMacro.tag}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    AI-Assisted • Human-Supervised
                  </Badge>
                </div>
                <CardTitle className="text-xl md:text-2xl font-extrabold text-foreground">
                  {activeMacro.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                  {activeMacro.summary}
                </CardDescription>
              </div>

              <div className="shrink-0 rounded-xl border border-border bg-secondary/40 p-3.5 text-xs space-y-1 font-mono">
                <p className="text-muted-foreground uppercase text-[10px]">
                  Klasifikasi: Arsip Studi Kasus Editorial
                </p>
                <p className="font-semibold text-foreground">
                  Sumber: {activeMacro.source}
                </p>
                <p className="text-muted-foreground">Status: {activeMacro.date}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* 3-Column Asset Class Impact Matrix */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* 1. Dampak ke Saham */}
              <Card className="border-border/80 bg-secondary/20 shadow-2xs flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <TrendingUp className="w-4 h-4 text-[#C3A477]" />
                      Dampak ke Saham
                    </span>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    >
                      {activeMacro.impacts.equities.direction}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activeMacro.impacts.equities.detail}
                  </p>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/60 bg-card/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSelectRelatedTicker(
                        activeMacro.impacts.equities.relatedTicker
                      )
                    }
                    className="w-full justify-between text-xs font-semibold hover:border-[#C3A477]"
                  >
                    <span>
                      Buka Riset Emiten: {activeMacro.impacts.equities.relatedTicker} (Pilar 01)
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                  </Button>
                </CardFooter>
              </Card>

              {/* 2. Dampak ke Obligasi */}
              <Card className="border-border/80 bg-secondary/20 shadow-2xs flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Landmark className="w-4 h-4 text-[#C3A477]" />
                      Dampak ke Obligasi (SBN)
                    </span>
                    <Badge variant="secondary">
                      {activeMacro.impacts.bonds.direction}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activeMacro.impacts.bonds.detail}
                  </p>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/60 bg-card/60">
                  <Link
                    href={`/calculator?tab=${activeMacro.linkedToolTab}`}
                    className="inline-flex items-center justify-between w-full rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                  >
                    <span>{activeMacro.linkedToolLabel} (Pilar 04)</span>
                    <Calculator className="w-3.5 h-3.5 text-[#C3A477]" />
                  </Link>
                </CardFooter>
              </Card>

              {/* 3. Dampak ke Emas */}
              <Card className="border-border/80 bg-secondary/20 shadow-2xs flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Coins className="w-4 h-4 text-[#C3A477]" />
                      Dampak ke Emas Fisik &amp; Spot
                    </span>
                    <Badge
                      variant="outline"
                      className="border-[#C3A477]/50 bg-[#C3A477]/15 text-foreground"
                    >
                      {activeMacro.impacts.gold.direction}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {activeMacro.impacts.gold.detail}
                  </p>
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/60 bg-card/60">
                  <a
                    href="#knowledge"
                    className="inline-flex items-center justify-between w-full rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                  >
                    <span className="truncate">
                      Konsep: {activeMacro.linkedKnowledgeTitle} (Pilar 05)
                    </span>
                    <BookOpen className="w-3.5 h-3.5 text-[#C3A477] shrink-0" />
                  </a>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =====================================================================
          PILAR 01: EQUITY & COMPANY RESEARCH
      ===================================================================== */}
      <section id="equity-research" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                PILAR 01
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                Equity &amp; Company Research • Code-Validated Metrics
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Analisis Fundamental, Rasio Keuangan &amp; Valuasi Emiten
            </h2>
          </div>
          <Link
            href="/calculator?tab=comparison"
            className="inline-flex items-center gap-2 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-2.5 text-xs font-bold self-start md:self-auto shadow-xs hover:opacity-90 transition-opacity"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Buka Komparasi Emiten Penuh</span>
          </Link>
        </div>

        {/* Disclosure Banner for Static Educational Case Studies */}
        <div className="rounded-xl border border-[#C3A477]/45 bg-secondary/40 px-4 py-3 text-xs font-mono text-foreground flex flex-wrap items-center justify-between gap-2">
          <span>
            <strong>Klasifikasi Data Pilar 01:</strong> Studi Kasus Statis &amp; Preset Simulasi — Bukan Kuotasi Pasar Live BEI.
          </span>
          <Badge variant="outline" className="font-mono text-[10px]">
            Seluruh asumsi harga &amp; EPS dapat disesuaikan di Kalkulator Pilar 04
          </Badge>
        </div>

        {/* Ticker Selector Bar (Shadcn Interactive Pill Buttons) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {COMPANY_RESEARCH_LIST.map((comp) => {
            const active = comp.ticker === activeCompany.ticker;
            return (
              <button
                key={comp.ticker}
                type="button"
                onClick={() => setSelectedTicker(comp.ticker)}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-[#101B2C] bg-[#101B2C] text-[#F4F0E7] dark:border-[#C3A477] dark:bg-[#C3A477] dark:text-[#101B2C] shadow-md font-bold -translate-y-0.5"
                    : "border-border/80 bg-card hover:border-[#C3A477] hover:shadow-xs text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-extrabold leading-none">
                      {comp.ticker}
                    </div>
                    <div
                      className={`text-[11px] font-mono mt-1 truncate ${
                        active ? "opacity-90" : "text-muted-foreground"
                      }`}
                    >
                      Rp {formatRibuanInput(comp.price, true)}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={active ? "secondary" : "outline"}
                  className="font-mono text-[10px] px-1.5 py-0 h-4 shrink-0"
                >
                  {comp.per}x
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Active Company Institutional Research Terminal Card */}
        <Card className="border-border/90 bg-card shadow-md overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left 7 Cols: Company Profile, Thesis & Earnings Analysis */}
              <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="default"
                        className="px-3 py-1.5 h-auto rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-mono text-sm font-extrabold"
                      >
                        {activeCompany.ticker}.JK
                      </Badge>
                      <div>
                        <h3 className="text-xl font-extrabold text-foreground">
                          {activeCompany.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {activeCompany.sector}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/35 bg-emerald-500/15 px-3 py-1 h-auto text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      {activeCompany.verdict}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="rounded-xl border border-border/80 bg-secondary/25 p-4 space-y-1.5">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        Fundamental Thesis &amp; Company Profile
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {activeCompany.summary}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border/80 bg-secondary/20 p-4 space-y-1.5">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                          Earnings Analysis ({activeCompany.earningsGrowthYoY})
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeCompany.earningsNote}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/80 bg-secondary/20 p-4 space-y-1.5">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                          Keterkaitan Makroekonomi (Pilar 03)
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeCompany.macroSensitivity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
                  <span>Sumber: {activeCompany.source}</span>
                  <span>Status: {activeCompany.lastUpdated}</span>
                </div>
              </div>

              {/* Right 5 Cols: Deterministic Valuation & Financial Ratios Box */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-[#C3A477]/50 bg-secondary/35 p-5 space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Valuasi &amp; Margin of Safety
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono font-bold border-[#C3A477]/60 bg-[#C3A477]/20 text-foreground"
                    >
                      MoS +{marginOfSafety}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
                      <p className="text-[11px] text-muted-foreground">
                        Harga Acuan Studi Kasus (Ilustrasi Preset)
                      </p>
                      <p className="text-lg font-extrabold font-mono text-foreground mt-1">
                        Rp {formatRibuanInput(activeCompany.price, true)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#C3A477]/60 bg-card p-3.5 shadow-2xs">
                      <p className="text-[11px] text-muted-foreground">
                        Estimasi Nilai Intrinsik (Simulasi)
                      </p>
                      <p className="text-lg font-extrabold font-mono text-[#101B2C] dark:text-[#C3A477] mt-1">
                        Rp {formatRibuanInput(activeCompany.intrinsicValue, true)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>Indeks Valuasi &amp; Profitabilitas (ROE {activeCompany.roe}%)</span>
                      <span className="font-bold text-foreground">MoS +{marginOfSafety}%</span>
                    </div>
                    <Progress value={mosProgress} className="h-2" />
                  </div>

                  {/* Rasio Fundamental Tervalidasi */}
                  <div className="pt-1">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2.5">
                      Rasio Keuangan Utama (Financial Ratios)
                    </p>
                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-2xs">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          P/E (PER)
                        </p>
                        <p className="text-sm font-extrabold font-mono text-foreground">
                          {activeCompany.per}x
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-2xs">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          P/BV (PBV)
                        </p>
                        <p className="text-sm font-extrabold font-mono text-foreground">
                          {activeCompany.pbv}x
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-2xs">
                        <p className="text-[10px] text-muted-foreground uppercase">ROE</p>
                        <p className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          {activeCompany.roe}%
                        </p>
                        <Progress value={roeProgress} className="h-1 mt-1" />
                      </div>
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-2xs">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Div. Yield
                        </p>
                        <p className="text-sm font-extrabold font-mono text-foreground">
                          {activeCompany.dividendYield}%
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-2xs">
                        <p className="text-[10px] text-muted-foreground uppercase">DER</p>
                        <p className="text-sm font-extrabold font-mono text-foreground">
                          {activeCompany.der}x
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-2.5 shadow-2xs">
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Laba YoY
                        </p>
                        <p className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                          {activeCompany.earningsGrowthYoY.replace(" YoY", "")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/calculator?tab=valuation&ticker=${activeCompany.ticker}`}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] py-3 px-4 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulasikan Asumsi Valuasi {activeCompany.ticker} di Pilar 04</span>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* =====================================================================
          PILAR 05: FINANCIAL KNOWLEDGE ACADEMY
      ===================================================================== */}
      <section id="knowledge" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                PILAR 05
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                Financial Knowledge • Structured Investor Education
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Materi Edukasi Fundamental, Akuntansi, Ekonomi &amp; Prinsip Kekayaan
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md">
            Setiap konsep dilengkapi formula tervalidasi dan terhubung langsung ke kalkulator interaktif kami.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {KNOWLEDGE_MODULES.map((mod) => (
            <Card
              key={mod.id}
              className="border-border/90 bg-card hover:border-[#C3A477]/70 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary" className="font-mono text-[11px]">
                    {mod.category}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {mod.level} • {mod.readTime}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-extrabold text-foreground">
                  {mod.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {mod.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-xl border border-border bg-secondary/35 p-3.5 font-mono text-xs text-foreground">
                  <span className="block text-[10px] uppercase text-muted-foreground mb-1">
                    Formula / Prinsip Utama:
                  </span>
                  {mod.formulaOrPrinciple}
                </div>

                <div className="text-xs text-foreground/95 bg-[#C3A477]/15 border border-[#C3A477]/35 rounded-xl p-3.5 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#C3A477] shrink-0 mt-0.5" />
                  <span>
                    <strong>Prinsip Praktis:</strong> {mod.keyTakeaway}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-border/70 bg-secondary/20 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Terhubung ke Pilar 04
                </span>
                <Link
                  href={`/calculator?tab=${mod.linkedToolTab}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-[#C3A477] transition-colors"
                >
                  <span>{mod.linkedToolLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
