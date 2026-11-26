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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  COMPANY_RESEARCH_LIST,
  CONNECTED_MACRO_INSIGHTS,
  KNOWLEDGE_MODULES,
} from "@/lib/intelligence-data";
import { ArrowUpRight, Calculator } from "lucide-react";
import { formatRibuanInput } from "@/components/system/system-provider";

export function CrossPillarExplorer() {
  const [activeTab, setActiveTab] = useState<string>("saham");
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

  const handleSelectRelatedTicker = (ticker: string) => {
    setSelectedTicker(ticker);
    setActiveTab("saham");
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Riset Saham, Ekonomi &amp; Edukasi
          </h2>
          <p className="text-sm text-muted-foreground">
            Pilih tab untuk melihat analisis fundamental emiten, dampak makro, atau panduan finansial.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(String(val))}
        className="w-full space-y-5"
      >
        <TabsList className="w-full sm:w-fit h-10 p-1 bg-secondary rounded-xl grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="saham" className="px-4 text-xs sm:text-sm rounded-lg">
            Saham (5 Emiten)
          </TabsTrigger>
          <TabsTrigger value="makro" className="px-4 text-xs sm:text-sm rounded-lg">
            Dampak Ekonomi
          </TabsTrigger>
          <TabsTrigger value="edukasi" className="px-4 text-xs sm:text-sm rounded-lg">
            Panduan Edukasi
          </TabsTrigger>
        </TabsList>

        {/* ===================================================================
            TAB 1: ANALISIS SAHAM (5 EMITEN)
        =================================================================== */}
        <TabsContent value="saham" keepMounted className="space-y-4">
          <div id="equity-research" className="scroll-mt-24 space-y-4">
            {/* Simple Pill Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {COMPANY_RESEARCH_LIST.map((comp) => {
                const active = comp.ticker === activeCompany.ticker;
                return (
                  <Button
                    key={comp.ticker}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTicker(comp.ticker)}
                    className="rounded-full px-4 font-semibold"
                  >
                    <span>{comp.ticker}</span>
                    <span className="ml-1.5 font-normal opacity-80 text-xs">
                      Rp {formatRibuanInput(comp.price, true)}
                    </span>
                  </Button>
                );
              })}
            </div>

            {/* Clean Single Company Card */}
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {activeCompany.ticker}.JK
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activeCompany.sector}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {activeCompany.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  >
                    {activeCompany.verdict}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-5 space-y-6">
                <div className="grid gap-6 lg:grid-cols-12">
                  {/* Left: Summary & Thesis */}
                  <div className="lg:col-span-7 space-y-4">
                    <p className="text-sm text-foreground leading-relaxed">
                      {activeCompany.summary}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 pt-1">
                      <div className="rounded-xl bg-secondary/50 p-3.5 space-y-1">
                        <span className="text-xs font-medium text-foreground block">
                          Kinerja Laba ({activeCompany.earningsGrowthYoY})
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeCompany.earningsNote}
                        </p>
                      </div>
                      <div className="rounded-xl bg-secondary/50 p-3.5 space-y-1">
                        <span className="text-xs font-medium text-foreground block">
                          Sensitivitas Makro
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {activeCompany.macroSensitivity}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Clean Valuation & Ratios */}
                  <div className="lg:col-span-5 rounded-xl bg-secondary/40 border border-border p-4 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-card border border-border p-3">
                          <span className="text-[11px] text-muted-foreground block">
                            Harga Acuan Studi Kasus (Ilustrasi Preset)
                          </span>
                          <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                            Rp {formatRibuanInput(activeCompany.price, true)}
                          </span>
                        </div>
                        <div className="rounded-lg bg-card border border-border p-3">
                          <span className="text-[11px] text-muted-foreground block">
                            Nilai Intrinsik (Simulasi)
                          </span>
                          <span className="text-base font-bold font-mono text-primary mt-0.5 block">
                            Rp {formatRibuanInput(activeCompany.intrinsicValue, true)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Margin of Safety</span>
                          <span className="font-semibold text-foreground">
                            +{marginOfSafety}%
                          </span>
                        </div>
                        <Progress value={mosProgress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="rounded-lg bg-card border border-border p-2">
                          <span className="text-[10px] text-muted-foreground block">
                            PER
                          </span>
                          <span className="text-xs font-bold font-mono">
                            {activeCompany.per}x
                          </span>
                        </div>
                        <div className="rounded-lg bg-card border border-border p-2">
                          <span className="text-[10px] text-muted-foreground block">
                            PBV
                          </span>
                          <span className="text-xs font-bold font-mono">
                            {activeCompany.pbv}x
                          </span>
                        </div>
                        <div className="rounded-lg bg-card border border-border p-2">
                          <span className="text-[10px] text-muted-foreground block">
                            ROE
                          </span>
                          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {activeCompany.roe}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/calculator?tab=valuation&ticker=${activeCompany.ticker}`}
                      className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground py-2.5 px-4 text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Ubah Asumsi Valuasi {activeCompany.ticker}</span>
                    </Link>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="py-3 border-t border-border bg-secondary/20 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  Studi Kasus Statis &amp; Preset Simulasi — Bukan Kuotasi Pasar Live BEI.
                </span>
                <span>Sumber: {activeCompany.source}</span>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* ===================================================================
            TAB 2: DAMPAK EKONOMI
        =================================================================== */}
        <TabsContent value="makro" keepMounted className="space-y-4">
          <div id="economic-insights" className="scroll-mt-24 space-y-4">
            <div className="flex flex-wrap gap-2">
              {CONNECTED_MACRO_INSIGHTS.map((item) => {
                const isSelected = item.id === activeMacro.id;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMacroId(item.id)}
                    className="rounded-full"
                  >
                    {item.tag.split("•")[0].trim()}
                  </Button>
                );
              })}
            </div>

            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="secondary">{activeMacro.tag}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Klasifikasi: Arsip Studi Kasus Editorial ({activeMacro.date})
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground pt-1">
                  {activeMacro.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {activeMacro.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-secondary/50 p-4 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Saham
                      </span>
                      <Badge variant="outline" className="text-[11px]">
                        {activeMacro.impacts.equities.direction}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeMacro.impacts.equities.detail}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() =>
                      handleSelectRelatedTicker(
                        activeMacro.impacts.equities.relatedTicker
                      )
                    }
                    className="px-0 justify-start"
                  >
                    Lihat saham {activeMacro.impacts.equities.relatedTicker} →
                  </Button>
                </div>

                <div className="rounded-xl bg-secondary/50 p-4 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Obligasi (SBN)
                      </span>
                      <Badge variant="outline" className="text-[11px]">
                        {activeMacro.impacts.bonds.direction}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeMacro.impacts.bonds.detail}
                    </p>
                  </div>
                  <Link
                    href={`/calculator?tab=${activeMacro.linkedToolTab}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {activeMacro.linkedToolLabel} →
                  </Link>
                </div>

                <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Emas
                    </span>
                    <Badge variant="outline" className="text-[11px]">
                      {activeMacro.impacts.gold.direction}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeMacro.impacts.gold.detail}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================================================================
            TAB 3: PANDUAN EDUKASI
        =================================================================== */}
        <TabsContent value="edukasi" keepMounted className="space-y-4">
          <div id="knowledge" className="scroll-mt-24 grid gap-4 md:grid-cols-2">
            {KNOWLEDGE_MODULES.map((mod) => (
              <Card key={mod.id} className="border-border bg-card shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{mod.category}</span>
                    <span>{mod.readTime}</span>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {mod.title}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {mod.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="rounded-lg bg-secondary/60 p-3 font-mono text-xs text-foreground">
                    {mod.formulaOrPrinciple}
                  </div>
                </CardContent>
                <CardFooter className="py-3 border-t border-border bg-secondary/20 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{mod.level}</span>
                  <Link
                    href={`/calculator?tab=${mod.linkedToolTab}`}
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    <span>{mod.linkedToolLabel}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
