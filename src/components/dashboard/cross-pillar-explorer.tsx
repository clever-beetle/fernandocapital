"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { formatRibuanInput } from "@/components/system/system-provider";

export function CrossPillarExplorer() {
  const [selectedMacroId, setSelectedMacroId] = useState(CONNECTED_MACRO_INSIGHTS[0].id);
  const [selectedTicker, setSelectedTicker] = useState(COMPANY_RESEARCH_LIST[0].ticker);

  const activeMacro =
    CONNECTED_MACRO_INSIGHTS.find((m) => m.id === selectedMacroId) || CONNECTED_MACRO_INSIGHTS[0];
  const activeCompany =
    COMPANY_RESEARCH_LIST.find((c) => c.ticker === selectedTicker) || COMPANY_RESEARCH_LIST[0];

  const marginOfSafety = (
    ((activeCompany.intrinsicValue - activeCompany.price) / activeCompany.intrinsicValue) *
    100
  ).toFixed(1);

  const handleSelectRelatedTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    const el = document.getElementById("equity-research");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="space-y-14">
      {/* =====================================================================
          PILAR 03: ECONOMIC INSIGHTS & CROSS-ASSET IMPACT MATRIX
      ===================================================================== */}
      <section id="economic-insights" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                PILAR 03
              </span>
              <span>Economic Insights • Cross-Asset Transmission</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Menghubungkan Kejadian Ekonomi dengan Dampaknya
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md">
            Pilih peristiwa makroekonomi di bawah untuk menelusuri rantai dampaknya terhadap{" "}
            <strong className="text-foreground">Saham, Obligasi, dan Emas</strong> beserta alat hitung terkait.
          </p>
        </div>

        {/* Selector Kejadian Ekonomi */}
        <div className="grid gap-3 md:grid-cols-3">
          {CONNECTED_MACRO_INSIGHTS.map((item, idx) => {
            const isSelected = item.id === activeMacro.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedMacroId(item.id)}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#101B2C] dark:border-[#C3A477] bg-card shadow-md ring-1 ring-[#C3A477]/40"
                    : "border-border bg-card/60 hover:bg-card hover:border-[#C3A477]/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-foreground font-semibold">
                    03.{idx + 1} • {item.tag.split("•")[0].trim()}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
              </button>
            );
          })}
        </div>

        {/* Detail Analisis Makro & Rantai Dampak 3 Kelas Aset */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-border pb-5">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-semibold">
                  {activeMacro.tag}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                  <ShieldCheck className="w-3.5 h-3.5" /> AI-Assisted • Human-Supervised
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">{activeMacro.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{activeMacro.summary}</p>
            </div>

            <div className="shrink-0 rounded-xl border border-border bg-secondary/50 p-3.5 text-xs space-y-1 font-mono">
              <p className="text-muted-foreground uppercase text-[10px]">Provenansi Riset</p>
              <p className="font-semibold text-foreground">Sumber: {activeMacro.source}</p>
              <p className="text-muted-foreground">Data: {activeMacro.date}</p>
            </div>
          </div>

          {/* 3-Column Asset Class Impact Matrix */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* 1. Dampak ke Saham */}
            <div className="rounded-xl border border-border bg-background/70 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <TrendingUp className="w-4 h-4 text-[#C3A477]" />
                    Dampak ke Saham
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {activeMacro.impacts.equities.direction}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {activeMacro.impacts.equities.detail}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectRelatedTicker(activeMacro.impacts.equities.relatedTicker)}
                className="inline-flex items-center justify-between w-full rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-2 text-xs font-semibold text-foreground transition-colors"
              >
                <span>Buka Riset Emiten: {activeMacro.impacts.equities.relatedTicker} (Pilar 01)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#C3A477]" />
              </button>
            </div>

            {/* 2. Dampak ke Obligasi */}
            <div className="rounded-xl border border-border bg-background/70 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Landmark className="w-4 h-4 text-[#C3A477]" />
                    Dampak ke Obligasi (SBN)
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                    {activeMacro.impacts.bonds.direction}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {activeMacro.impacts.bonds.detail}
                </p>
              </div>
              <Link
                href={`/calculator?tab=${activeMacro.linkedToolTab}`}
                className="inline-flex items-center justify-between w-full rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-2 text-xs font-semibold text-foreground transition-colors"
              >
                <span>{activeMacro.linkedToolLabel} (Pilar 04)</span>
                <Calculator className="w-3.5 h-3.5 text-[#C3A477]" />
              </Link>
            </div>

            {/* 3. Dampak ke Emas */}
            <div className="rounded-xl border border-border bg-background/70 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Coins className="w-4 h-4 text-[#C3A477]" />
                    Dampak ke Emas Fisik &amp; Spot
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#C3A477]/20 text-foreground border border-[#C3A477]/40">
                    {activeMacro.impacts.gold.direction}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {activeMacro.impacts.gold.detail}
                </p>
              </div>
              <a
                href="#knowledge"
                className="inline-flex items-center justify-between w-full rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-2 text-xs font-semibold text-foreground transition-colors"
              >
                <span className="truncate">Konsep: {activeMacro.linkedKnowledgeTitle} (Pilar 05)</span>
                <BookOpen className="w-3.5 h-3.5 text-[#C3A477] shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PILAR 01: EQUITY & COMPANY RESEARCH
      ===================================================================== */}
      <section id="equity-research" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                PILAR 01
              </span>
              <span>Equity &amp; Company Research • Code-Validated Metrics</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Analisis Fundamental, Rasio Keuangan &amp; Valuasi Emiten
            </h2>
          </div>
          <Link
            href="/calculator?tab=comparison"
            className="inline-flex items-center gap-2 rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-2 text-xs font-semibold self-start md:self-auto shadow-xs hover:opacity-90 transition-opacity"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Buka Komparasi Emiten Penuh</span>
          </Link>
        </div>

        {/* Ticker Selector Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {COMPANY_RESEARCH_LIST.map((comp) => {
            const active = comp.ticker === activeCompany.ticker;
            return (
              <button
                key={comp.ticker}
                type="button"
                onClick={() => setSelectedTicker(comp.ticker)}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-left transition-all ${
                  active
                    ? "border-[#101B2C] bg-[#101B2C] text-[#F4F0E7] dark:border-[#C3A477] dark:bg-[#C3A477] dark:text-[#101B2C] shadow-sm font-bold"
                    : "border-border bg-card hover:border-[#C3A477] text-foreground"
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <div>
                  <div className="text-xs font-mono font-bold leading-none">{comp.ticker}</div>
                  <div className={`text-[10px] mt-0.5 ${active ? "opacity-85" : "text-muted-foreground"}`}>
                    Rp {formatRibuanInput(comp.price, true)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Company Institutional Research Terminal Card */}
        <div className="grid gap-6 lg:grid-cols-12 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          {/* Left 7 Cols: Company Profile, Thesis & Earnings Analysis */}
          <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-mono text-sm font-bold">
                    {activeCompany.ticker}.JK
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{activeCompany.name}</h3>
                    <p className="text-xs text-muted-foreground">{activeCompany.sector}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {activeCompany.verdict}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="rounded-xl border border-border bg-background/70 p-4 space-y-1.5">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Fundamental Thesis &amp; Company Profile
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{activeCompany.summary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background/70 p-4 space-y-1">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Earnings Analysis ({activeCompany.earningsGrowthYoY})
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeCompany.earningsNote}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background/70 p-4 space-y-1">
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
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#C3A477]/45 bg-secondary/40 p-5 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Valuasi &amp; Margin of Safety
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#C3A477]/25 text-foreground">
                  MoS +{marginOfSafety}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">Harga Pasar Saat Ini</p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    Rp {formatRibuanInput(activeCompany.price, true)}
                  </p>
                </div>
                <div className="rounded-lg border border-[#C3A477]/50 bg-card p-3">
                  <p className="text-[11px] text-muted-foreground">Estimasi Nilai Intrinsik</p>
                  <p className="text-lg font-bold font-mono text-[#101B2C] dark:text-[#C3A477]">
                    Rp {formatRibuanInput(activeCompany.intrinsicValue, true)}
                  </p>
                </div>
              </div>

              {/* Rasio Fundamental Tervalidasi */}
              <div className="pt-2">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2.5">
                  Rasio Keuangan Utama (Financial Ratios)
                </p>
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase">P/E (PER)</p>
                    <p className="text-sm font-bold font-mono text-foreground">{activeCompany.per}x</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase">P/BV (PBV)</p>
                    <p className="text-sm font-bold font-mono text-foreground">{activeCompany.pbv}x</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase">ROE</p>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {activeCompany.roe}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase">Div. Yield</p>
                    <p className="text-sm font-bold font-mono text-foreground">
                      {activeCompany.dividendYield}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase">DER</p>
                    <p className="text-sm font-bold font-mono text-foreground">{activeCompany.der}x</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase">Laba YoY</p>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {activeCompany.earningsGrowthYoY.replace(" YoY", "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={`/calculator?tab=valuation&ticker=${activeCompany.ticker}`}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] py-2.5 px-4 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulasikan Asumsi Valuasi {activeCompany.ticker} di Pilar 04</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PILAR 05: FINANCIAL KNOWLEDGE ACADEMY
      ===================================================================== */}
      <section id="knowledge" className="scroll-mt-28 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                PILAR 05
              </span>
              <span>Financial Knowledge • Structured Investor Education</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Materi Edukasi Fundamental, Akuntansi, Ekonomi &amp; Prinsip Kekayaan
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md">
            Setiap konsep dilengkapi formula tervalidasi dan terhubung langsung ke kalkulator interaktif kami.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {KNOWLEDGE_MODULES.map((mod) => (
            <div
              key={mod.id}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-5 hover:border-[#C3A477]/60 transition-colors shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-secondary text-foreground font-semibold">
                    {mod.category}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {mod.level} • {mod.readTime}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground">{mod.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{mod.summary}</p>

                <div className="rounded-xl border border-border bg-background/80 p-3.5 font-mono text-xs text-foreground">
                  <span className="block text-[10px] uppercase text-muted-foreground mb-1">
                    Formula / Prinsip Utama:
                  </span>
                  {mod.formulaOrPrinciple}
                </div>

                <p className="text-xs text-foreground/90 bg-[#C3A477]/15 border border-[#C3A477]/30 rounded-lg p-3">
                  <strong>Prinsip Praktis:</strong> {mod.keyTakeaway}
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">Terhubung ke Pilar 04</span>
                <Link
                  href={`/calculator?tab=${mod.linkedToolTab}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-[#C3A477] transition-colors"
                >
                  <span>{mod.linkedToolLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
