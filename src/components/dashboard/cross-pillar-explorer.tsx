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
    <div className="space-y-8">
      {/* =====================================================================
          PILAR 01: MASTER-DETAIL EQUITY RESEARCH WORKBENCH (4 COLS LIST + 8 COLS TERMINAL)
      ===================================================================== */}
      <section id="equity-research" className="scroll-mt-20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="default"
              className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
            >
              PILAR 01
            </Badge>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground">
              Equity Research Master-Detail Workbench
            </h2>
            <Badge variant="outline" className="font-mono text-[10px]">
              Studi Kasus Statis &amp; Preset Simulasi — Bukan Kuotasi Pasar Live BEI.
            </Badge>
          </div>
          <Link
            href="/calculator?tab=comparison"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-3.5 py-2 text-xs font-bold self-start sm:self-auto shadow-xs hover:opacity-90 transition-opacity"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Komparasi Emiten Penuh</span>
          </Link>
        </div>

        <div className="grid gap-5 xl:grid-cols-12 items-stretch">
          {/* Left 4 Cols: Vertical Master Watchlist of 5 IDX Issuers */}
          <Card className="xl:col-span-4 border-border/90 bg-card shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-2.5 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Daftar Studi Kasus 5 Emiten IDX
                </CardTitle>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Preset Simulasi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2.5 space-y-2 flex-1">
              {COMPANY_RESEARCH_LIST.map((comp) => {
                const active = comp.ticker === activeCompany.ticker;
                const compMos = (
                  ((comp.intrinsicValue - comp.price) / comp.intrinsicValue) *
                  100
                ).toFixed(1);
                return (
                  <button
                    key={comp.ticker}
                    type="button"
                    onClick={() => setSelectedTicker(comp.ticker)}
                    className={`w-full rounded-xl border p-3 text-left transition-all flex items-center justify-between gap-2 ${
                      active
                        ? "border-[#101B2C] bg-[#101B2C] text-[#F4F0E7] dark:border-[#C3A477] dark:bg-[#C3A477] dark:text-[#101B2C] shadow-sm font-bold"
                        : "border-border/70 bg-secondary/20 hover:bg-card hover:border-[#C3A477] text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          active
                            ? "bg-white/15 dark:bg-[#101B2C]/15"
                            : "bg-card border border-border/80"
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-extrabold">
                            {comp.ticker}.JK
                          </span>
                          <span
                            className={`text-[10px] font-mono ${
                              active ? "opacity-85" : "text-muted-foreground"
                            }`}
                          >
                            • PER {comp.per}x
                          </span>
                        </div>
                        <div
                          className={`text-[11px] truncate ${
                            active ? "opacity-90" : "text-muted-foreground"
                          }`}
                        >
                          {comp.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="text-xs font-extrabold">
                        Rp {formatRibuanInput(comp.price, true)}
                      </div>
                      <div
                        className={`text-[10px] ${
                          active
                            ? "opacity-90"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        MoS +{compMos}%
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
            <CardFooter className="py-2.5 px-3 border-t border-border/60 bg-secondary/25 text-[10px] font-mono text-muted-foreground">
              Studi Kasus Statis &amp; Preset Simulasi — Bukan Kuotasi Pasar Live BEI.
            </CardFooter>
          </Card>

          {/* Right 8 Cols: Selected Company Deep-Dive Terminal */}
          <Card className="xl:col-span-8 border-border/90 bg-card shadow-md flex flex-col justify-between">
            <CardHeader className="border-b border-border/70 bg-gradient-to-r from-[#C3A477]/10 via-transparent to-transparent pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="default"
                    className="px-3 py-1.5 h-auto rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-mono text-sm font-extrabold"
                  >
                    {activeCompany.ticker}.JK
                  </Badge>
                  <div>
                    <CardTitle className="text-xl font-extrabold text-foreground">
                      {activeCompany.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {activeCompany.sector} • Sumber: {activeCompany.source}
                    </CardDescription>
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
            </CardHeader>

            <CardContent className="pt-5 space-y-5 flex-1">
              {/* Top Price vs Intrinsic Value & Ratios Bento */}
              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-5 rounded-xl border border-[#C3A477]/50 bg-secondary/30 p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        Valuasi &amp; Margin of Safety
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] font-bold border-[#C3A477]/60 bg-[#C3A477]/20"
                      >
                        MoS +{marginOfSafety}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-card p-2.5">
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Harga Acuan Studi Kasus (Ilustrasi Preset)
                        </p>
                        <p className="text-sm font-extrabold font-mono text-foreground mt-1">
                          Rp {formatRibuanInput(activeCompany.price, true)}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#C3A477]/60 bg-card p-2.5">
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          Estimasi Nilai Intrinsik
                        </p>
                        <p className="text-sm font-extrabold font-mono text-[#101B2C] dark:text-[#C3A477] mt-1">
                          Rp {formatRibuanInput(activeCompany.intrinsicValue, true)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>Indeks Diskon Valuasi</span>
                      <span className="font-bold text-foreground">+{marginOfSafety}%</span>
                    </div>
                    <Progress value={mosProgress} className="h-2" />
                  </div>
                </div>

                {/* 6 Financial Ratio Tiles */}
                <div className="md:col-span-7 grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-xl border border-border bg-secondary/20 p-3 flex flex-col justify-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">
                      P/E (PER)
                    </p>
                    <p className="text-base font-extrabold font-mono text-foreground mt-0.5">
                      {activeCompany.per}x
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3 flex flex-col justify-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">
                      P/BV (PBV)
                    </p>
                    <p className="text-base font-extrabold font-mono text-foreground mt-0.5">
                      {activeCompany.pbv}x
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3 flex flex-col justify-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">
                      ROE
                    </p>
                    <p className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activeCompany.roe}%
                    </p>
                    <Progress value={roeProgress} className="h-1 mt-1" />
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3 flex flex-col justify-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">
                      Div. Yield
                    </p>
                    <p className="text-base font-extrabold font-mono text-foreground mt-0.5">
                      {activeCompany.dividendYield}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3 flex flex-col justify-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">
                      DER
                    </p>
                    <p className="text-base font-extrabold font-mono text-foreground mt-0.5">
                      {activeCompany.der}x
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/20 p-3 flex flex-col justify-center">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">
                      Laba YoY
                    </p>
                    <p className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {activeCompany.earningsGrowthYoY.replace(" YoY", "")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thesis, Earnings & Macro Sensitivity */}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-border/80 bg-secondary/20 p-3.5 space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Fundamental Thesis
                  </p>
                  <p className="text-xs text-foreground leading-relaxed">
                    {activeCompany.summary}
                  </p>
                </div>
                <div className="rounded-xl border border-border/80 bg-secondary/20 p-3.5 space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Earnings ({activeCompany.earningsGrowthYoY})
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeCompany.earningsNote}
                  </p>
                </div>
                <div className="rounded-xl border border-border/80 bg-secondary/20 p-3.5 space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Sensitivitas Makro (Pilar 03)
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeCompany.macroSensitivity}
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="py-3 border-t border-border/70 bg-secondary/25 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-muted-foreground">
                Status: {activeCompany.lastUpdated}
              </span>
              <Link
                href={`/calculator?tab=valuation&ticker=${activeCompany.ticker}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] py-2 px-4 text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Simulasikan Valuasi {activeCompany.ticker} di Kalkulator</span>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* =====================================================================
          SIDE-BY-SIDE SPLIT WORKBENCH: PILAR 03 (7 COLS) + PILAR 05 (5 COLS)
      ===================================================================== */}
      <div className="grid gap-6 xl:grid-cols-12 items-start">
        {/* Left 7 Cols: PILAR 03 ECONOMIC INSIGHTS & CROSS-ASSET TRANSMISSION */}
        <section id="economic-insights" className="xl:col-span-7 scroll-mt-20 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                PILAR 03
              </Badge>
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                Transmisi Makro Lintas Kelas Aset
              </h2>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              Klasifikasi: Arsip Studi Kasus Editorial
            </span>
          </div>

          <Card className="border-border/90 bg-card shadow-sm">
            <CardHeader className="pb-3 space-y-3 border-b border-border/70">
              {/* Horizontal Scenario Selector Tabs */}
              <div className="grid gap-2 sm:grid-cols-3">
                {CONNECTED_MACRO_INSIGHTS.map((item, idx) => {
                  const isSelected = item.id === activeMacro.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMacroId(item.id)}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        isSelected
                          ? "border-[#101B2C] bg-[#101B2C] text-[#F4F0E7] dark:border-[#C3A477] dark:bg-[#C3A477] dark:text-[#101B2C] shadow-xs font-bold"
                          : "border-border/80 bg-secondary/25 hover:bg-card hover:border-[#C3A477]"
                      }`}
                    >
                      <div className="text-[10px] font-mono uppercase opacity-80">
                        03.{idx + 1} • {item.tag.split("•")[0].trim()}
                      </div>
                      <div className="text-xs font-bold line-clamp-1 mt-0.5">
                        {item.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {activeMacro.tag}
                  </Badge>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {activeMacro.date} • Sumber: {activeMacro.source}
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg font-extrabold text-foreground">
                  {activeMacro.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                  {activeMacro.summary}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {/* 3 Compact Asset Class Impact Rows */}
              <div className="rounded-xl border border-border/80 bg-secondary/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-foreground">
                    <TrendingUp className="w-3.5 h-3.5 text-[#C3A477]" />
                    1. Dampak ke Saham
                  </span>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]"
                  >
                    {activeMacro.impacts.equities.direction}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeMacro.impacts.equities.detail}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    handleSelectRelatedTicker(
                      activeMacro.impacts.equities.relatedTicker
                    )
                  }
                  className="font-semibold"
                >
                  <span>
                    Pilih Emiten {activeMacro.impacts.equities.relatedTicker} di Pilar 01
                  </span>
                  <ArrowUpRight className="w-3 h-3 ml-1 text-[#C3A477]" />
                </Button>
              </div>

              <div className="rounded-xl border border-border/80 bg-secondary/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-foreground">
                    <Landmark className="w-3.5 h-3.5 text-[#C3A477]" />
                    2. Dampak ke Obligasi (SBN)
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {activeMacro.impacts.bonds.direction}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeMacro.impacts.bonds.detail}
                </p>
                <Link
                  href={`/calculator?tab=${activeMacro.linkedToolTab}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-[#C3A477]"
                >
                  <span>{activeMacro.linkedToolLabel} (Pilar 04)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
                </Link>
              </div>

              <div className="rounded-xl border border-border/80 bg-secondary/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-foreground">
                    <Coins className="w-3.5 h-3.5 text-[#C3A477]" />
                    3. Dampak ke Emas Fisik &amp; Spot
                  </span>
                  <Badge
                    variant="outline"
                    className="border-[#C3A477]/50 bg-[#C3A477]/15 text-[10px]"
                  >
                    {activeMacro.impacts.gold.direction}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeMacro.impacts.gold.detail}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right 5 Cols: PILAR 05 FINANCIAL KNOWLEDGE ACADEMY */}
        <section id="knowledge" className="xl:col-span-5 scroll-mt-20 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="default"
                className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
              >
                PILAR 05
              </Badge>
              <h2 className="text-lg font-extrabold tracking-tight text-foreground">
                Financial Knowledge Academy
              </h2>
            </div>
            <BookOpen className="w-4 h-4 text-[#C3A477]" />
          </div>

          <div className="space-y-3">
            {KNOWLEDGE_MODULES.map((mod) => (
              <Card
                key={mod.id}
                className="border-border/90 bg-card hover:border-[#C3A477]/70 transition-all shadow-2xs"
              >
                <CardHeader className="pb-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {mod.category}
                    </Badge>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {mod.level} • {mod.readTime}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-extrabold text-foreground">
                    {mod.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                    {mod.summary}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2.5 space-y-2">
                  <div className="rounded-lg border border-border bg-secondary/35 p-2.5 font-mono text-[11px] text-foreground">
                    {mod.formulaOrPrinciple}
                  </div>
                  <div className="text-[11px] text-foreground/90 bg-[#C3A477]/15 border border-[#C3A477]/35 rounded-lg p-2.5 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C3A477] shrink-0 mt-0.5" />
                    <span>
                      <strong>Prinsip:</strong> {mod.keyTakeaway}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="py-2 border-t border-border/60 bg-secondary/20 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Kalkulator Terkait
                  </span>
                  <Link
                    href={`/calculator?tab=${mod.linkedToolTab}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-[#C3A477]"
                  >
                    <span>{mod.linkedToolLabel}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#C3A477]" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
