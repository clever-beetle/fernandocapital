"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Scale,
  TrendingUp,
  Coins,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatRibuanInput, parseRibuanInput } from "@/components/system/system-provider";
import { COMPANY_RESEARCH_LIST } from "@/lib/intelligence-data";

type ToolTab = "valuation" | "ratios" | "compound" | "gold" | "comparison";

const ANTAM_ALL_TIERS = [
  { label: "0.5 gr", weight: 0.5, multiplier: 1.0367 },
  { label: "1 gr", weight: 1, multiplier: 1.0 },
  { label: "2 gr", weight: 2, multiplier: 0.989 },
  { label: "3 gr", weight: 3, multiplier: 0.9859 },
  { label: "5 gr", weight: 5, multiplier: 0.9835 },
  { label: "10 gr", weight: 10, multiplier: 0.9815 },
  { label: "25 gr", weight: 25, multiplier: 0.9796 },
  { label: "50 gr", weight: 50, multiplier: 0.979 },
  { label: "100 gr", weight: 100, multiplier: 0.9788 },
  { label: "250 gr", weight: 250, multiplier: 0.9784 },
  { label: "500 gr", weight: 500, multiplier: 0.9782 },
  { label: "1000 gr", weight: 1000, multiplier: 0.9782 },
];

export function RatioCalculator({ liveAntamPrice = 2725000 }: { liveAntamPrice?: number }) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ToolTab>("valuation");

  // 1. Stock Valuation State
  const [valPrice, setValPrice] = useState("6.850");
  const [valEps, setValEps] = useState("628");
  const [valGrowth, setValGrowth] = useState("9,5");
  const [valYield, setValYield] = useState("6,68");

  // 2. Financial Ratio State
  const [stockPrice, setStockPrice] = useState("6.850");
  const [eps, setEps] = useState("628");
  const [bvps, setBvps] = useState("2.915");
  const [dps, setDps] = useState("356");

  // 3. Compound Interest State
  const [initialCapital, setInitialCapital] = useState("50.000.000");
  const [monthlySave, setMonthlySave] = useState("5.000.000");
  const [annualReturn, setAnnualReturn] = useState("12");
  const [yearsTenor, setYearsTenor] = useState("10");

  // 4. Gold Reference State
  const [goldRefPrice, setGoldRefPrice] = useState(
    formatRibuanInput(liveAntamPrice > 0 ? Math.round(liveAntamPrice) : 2725000, true)
  );
  const [goldSimGram, setGoldSimGram] = useState("10");

  // 5. Company Comparison State
  const [compareA, setCompareA] = useState("BMRI");
  const [compareB, setCompareB] = useState("BBCA");

  useEffect(() => {
    const tab = searchParams.get("tab") as ToolTab | null;
    if (tab && ["valuation", "ratios", "compound", "gold", "comparison"].includes(tab)) {
      setActiveTab(tab);
    }
    const ticker = searchParams.get("ticker");
    if (ticker) {
      const found = COMPANY_RESEARCH_LIST.find((c) => c.ticker === ticker.toUpperCase());
      if (found) {
        const estEps = Math.round(found.price / found.per);
        const estBvps = Math.round(found.price / found.pbv);
        const estDps = Math.round((found.price * found.dividendYield) / 100);
        setValPrice(formatRibuanInput(found.price, true));
        setValEps(formatRibuanInput(estEps, true));
        setStockPrice(formatRibuanInput(found.price, true));
        setEps(formatRibuanInput(estEps, true));
        setBvps(formatRibuanInput(estBvps, true));
        setDps(formatRibuanInput(estDps, true));
      }
    }
  }, [searchParams]);

  // --- Deterministic Code Calculations ---
  // 1. Stock Valuation (Benjamin Graham / Growth-Adjusted Intrinsic Value)
  const vP = parseRibuanInput(valPrice);
  const vE = parseRibuanInput(valEps);
  const vG = parseRibuanInput(valGrowth);
  const vY = parseRibuanInput(valYield) || 6.68;
  const intrinsicVal = vE > 0 && vY > 0 ? Math.round((vE * (8.5 + 1.5 * vG) * 4.4) / vY) : 0;
  const mosPct =
    intrinsicVal > 0 && vP > 0 ? (((intrinsicVal - vP) / intrinsicVal) * 100).toFixed(1) : "0.0";
  const mosNum = parseFloat(mosPct);

  // 2. Financial Ratios
  const price = parseRibuanInput(stockPrice);
  const earnings = parseRibuanInput(eps);
  const bookValue = parseRibuanInput(bvps);
  const dividend = parseRibuanInput(dps);

  const per = price > 0 && earnings > 0 ? (price / earnings).toFixed(2) : "-";
  const pbv = price > 0 && bookValue > 0 ? (price / bookValue).toFixed(2) : "-";
  const roe = earnings > 0 && bookValue > 0 ? ((earnings / bookValue) * 100).toFixed(2) + "%" : "-";
  const divYield = price > 0 && dividend > 0 ? ((dividend / price) * 100).toFixed(2) + "%" : "-";
  const earningsYield = price > 0 && earnings > 0 ? ((earnings / price) * 100).toFixed(2) + "%" : "-";

  // 3. Compound Interest
  const p0 = parseRibuanInput(initialCapital);
  const pmt = parseRibuanInput(monthlySave);
  const rAnnual = parseRibuanInput(annualReturn) / 100;
  const nYears = Math.min(50, Math.max(1, Math.round(parseRibuanInput(yearsTenor) || 1)));
  const rMonth = rAnnual / 12;
  const totalMonths = nYears * 12;
  const fvInitial = p0 * Math.pow(1 + rMonth, totalMonths);
  const fvSeries =
    rMonth > 0 ? pmt * ((Math.pow(1 + rMonth, totalMonths) - 1) / rMonth) : pmt * totalMonths;
  const totalFutureValue = Math.round(fvInitial + fvSeries);
  const totalPrincipal = Math.round(p0 + pmt * totalMonths);
  const totalCompoundGain = Math.max(0, totalFutureValue - totalPrincipal);
  const multiplier = totalPrincipal > 0 ? (totalFutureValue / totalPrincipal).toFixed(2) : "1.00";

  // 4. Gold Price Reference
  const baseAntam1g = parseRibuanInput(goldRefPrice) || 2725000;
  const simGrams = parseRibuanInput(goldSimGram) || 1;
  const simTotalBase = Math.round(baseAntam1g * simGrams);
  const simTotalWithTax = Math.round(simTotalBase * 1.0025);
  const simBuybackEst = Math.round(baseAntam1g * 0.945 * simGrams);

  // 5. Company Comparison
  const compLeft = COMPANY_RESEARCH_LIST.find((c) => c.ticker === compareA) || COMPANY_RESEARCH_LIST[0];
  const compRight = COMPANY_RESEARCH_LIST.find((c) => c.ticker === compareB) || COMPANY_RESEARCH_LIST[1];

  const loadCompanyPreset = (ticker: string) => {
    const found = COMPANY_RESEARCH_LIST.find((c) => c.ticker === ticker);
    if (!found) return;
    const estEps = Math.round(found.price / found.per);
    const estBvps = Math.round(found.price / found.pbv);
    const estDps = Math.round((found.price * found.dividendYield) / 100);
    setValPrice(formatRibuanInput(found.price, true));
    setValEps(formatRibuanInput(estEps, true));
    setStockPrice(formatRibuanInput(found.price, true));
    setEps(formatRibuanInput(estEps, true));
    setBvps(formatRibuanInput(estBvps, true));
    setDps(formatRibuanInput(estDps, true));
    toast.success(`Data fundamental ${found.ticker} dimuat ke kalkulator`);
  };

  return (
    <div className="space-y-6">
      {/* 5-Tool Selector Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[
          { id: "valuation" as ToolTab, label: "01. Stock Valuation", icon: Scale },
          { id: "ratios" as ToolTab, label: "02. Financial Ratios", icon: Calculator },
          { id: "compound" as ToolTab, label: "03. Compound Interest", icon: TrendingUp },
          { id: "gold" as ToolTab, label: "04. Gold Reference", icon: Coins },
          { id: "comparison" as ToolTab, label: "05. Company Comparison", icon: Layers },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-3 text-xs font-semibold transition-all text-left ${
                isActive
                  ? "border-[#101B2C] bg-[#101B2C] text-[#F4F0E7] dark:border-[#C3A477] dark:bg-[#C3A477] dark:text-[#101B2C] shadow-sm"
                  : "border-border bg-card hover:border-[#C3A477] text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preset Emiten Cepat (untuk Valuation & Ratios) */}
      {(activeTab === "valuation" || activeTab === "ratios") && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-2.5 text-xs">
          <span className="font-mono text-muted-foreground uppercase text-[11px] mr-1">
            Muat Data Emiten Tervalidasi:
          </span>
          {COMPANY_RESEARCH_LIST.map((c) => (
            <button
              key={c.ticker}
              type="button"
              onClick={() => loadCompanyPreset(c.ticker)}
              className="px-2.5 py-1 rounded-md border border-border bg-background hover:border-[#C3A477] font-mono font-semibold text-foreground transition-colors"
            >
              {c.ticker}
            </button>
          ))}
        </div>
      )}

      {/* =====================================================================
          TOOL 1: STOCK VALUATION CALCULATOR
      ===================================================================== */}
      {activeTab === "valuation" && (
        <Card className="w-full shadow-sm border-border bg-card">
          <CardHeader className="pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2.5 text-xl md:text-2xl">
                <Scale className="h-6 w-6 text-[#C3A477]" />
                Stock Valuation &amp; Margin of Safety Calculator
              </CardTitle>
              <span className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full bg-secondary text-foreground border border-border">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C3A477]" /> Deterministic Formula Engine
              </span>
            </div>
            <CardDescription className="text-sm">
              Menghitung estimasi Nilai Intrinsik saham berdasarkan laba per saham (EPS), proyeksi pertumbuhan,
              dan imbal hasil obligasi acuan (SBN 10Y) menggunakan kode tervalidasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="valPrice">Harga Saham Pasar Saat Ini (Rp)</Label>
                <Input
                  id="valPrice"
                  type="text"
                  inputMode="decimal"
                  value={valPrice}
                  onChange={(e) => setValPrice(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="valEps">Earnings Per Share / EPS Tahunan (Rp)</Label>
                <Input
                  id="valEps"
                  type="text"
                  inputMode="decimal"
                  value={valEps}
                  onChange={(e) => setValEps(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="valGrowth">Asumsi Pertumbuhan Laba (%)</Label>
                  <Input
                    id="valGrowth"
                    type="text"
                    inputMode="decimal"
                    value={valGrowth}
                    onChange={(e) => setValGrowth(formatRibuanInput(e.target.value, false))}
                    className="auto-ribuan h-11 font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="valYield">Yield SBN 10 Tahun (%)</Label>
                  <Input
                    id="valYield"
                    type="text"
                    inputMode="decimal"
                    value={valYield}
                    onChange={(e) => setValYield(formatRibuanInput(e.target.value, false))}
                    className="auto-ribuan h-11 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-xl border border-[#C3A477]/45 bg-secondary/40 p-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Hasil Kalkulasi Valuasi
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      mosNum >= 15
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        : mosNum >= 0
                          ? "bg-[#C3A477]/20 text-foreground border border-[#C3A477]/40"
                          : "bg-destructive/15 text-destructive border border-destructive/30"
                    }`}
                  >
                    {mosNum >= 15 ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Undervalued (MoS Kuat)
                      </>
                    ) : mosNum >= 0 ? (
                      "Fairly Valued (Harga Wajar)"
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Premium / Di Atas Intrinsik
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs text-muted-foreground">Harga Pasar</p>
                    <p className="text-xl font-bold font-mono text-foreground mt-1">
                      Rp {formatRibuanInput(vP, true) || "0"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#C3A477] bg-card p-4">
                    <p className="text-xs text-muted-foreground">Nilai Intrinsik Wajar</p>
                    <p className="text-xl font-bold font-mono text-[#101B2C] dark:text-[#C3A477] mt-1">
                      Rp {formatRibuanInput(intrinsicVal, true) || "0"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Margin of Safety (Diskon Valuasi)</p>
                    <p className="text-[11px] text-muted-foreground">
                      Selisih antara nilai intrinsik dengan harga pasar saat ini
                    </p>
                  </div>
                  <span
                    className={`font-mono text-2xl font-bold ${
                      mosNum >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                    }`}
                  >
                    {mosNum > 0 ? `+${mosPct}%` : `${mosPct}%`}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground border-t border-border pt-3 leading-relaxed">
                <strong>Catatan Metodologi:</strong> Kalkulasi dijalankan secara deterministik dengan model{" "}
                <code>V = EPS × (8.5 + 1.5g) × (4.4 / Y)</code>. Validasi manusia tetap diperlukan untuk menguji
                kualitas arus kas dan daya tahan keunggulan kompetitif emiten.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          TOOL 2: FINANCIAL RATIO CALCULATOR
      ===================================================================== */}
      {activeTab === "ratios" && (
        <Card className="w-full shadow-sm border-border bg-card">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-2.5 text-xl md:text-2xl">
              <Calculator className="h-6 w-6 text-[#C3A477]" />
              Financial Ratio Calculator (PER, PBV, ROE &amp; Dividend Yield)
            </CardTitle>
            <CardDescription className="text-sm">
              Masukkan metrik laporan keuangan per saham untuk mengevaluasi profitabilitas dan valuasi relatif.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Harga Saham Saat Ini (Rp)</Label>
                <Input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={stockPrice}
                  onChange={(e) => setStockPrice(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eps">Laba per Saham / EPS (Rp)</Label>
                <Input
                  id="eps"
                  type="text"
                  inputMode="decimal"
                  value={eps}
                  onChange={(e) => setEps(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bvps">Nilai Buku per Saham / BVPS (Rp)</Label>
                <Input
                  id="bvps"
                  type="text"
                  inputMode="decimal"
                  value={bvps}
                  onChange={(e) => setBvps(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dps">Dividen Tunai per Saham / DPS (Rp)</Label>
                <Input
                  id="dps"
                  type="text"
                  inputMode="decimal"
                  value={dps}
                  onChange={(e) => setDps(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setStockPrice("");
                  setEps("");
                  setBvps("");
                  setDps("");
                  toast.success("Input rasio telah direset");
                }}
              >
                Reset Input
              </Button>
            </div>

            <div className="flex flex-col justify-center rounded-xl border border-border bg-secondary/40 p-6 space-y-4">
              <h3 className="text-base font-bold text-foreground">Hasil Rasio Fundamental</h3>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">P/E Ratio (PER)</span>
                  <span className="font-mono text-2xl font-bold text-foreground">{per}x</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Price to Book Value (PBV)</span>
                  <span className="font-mono text-2xl font-bold text-foreground">{pbv}x</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Return on Equity (ROE)</span>
                  <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {roe}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Dividend Yield</span>
                  <span className="font-mono text-2xl font-bold text-[#101B2C] dark:text-[#C3A477]">
                    {divYield}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">Earnings Yield (E/P)</span>
                  <span className="font-mono text-lg font-bold text-foreground">{earningsYield}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          TOOL 3: COMPOUND INTEREST CALCULATOR
      ===================================================================== */}
      {activeTab === "compound" && (
        <Card className="w-full shadow-sm border-border bg-card">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-2.5 text-xl md:text-2xl">
              <TrendingUp className="h-6 w-6 text-[#C3A477]" />
              Compound Interest &amp; Wealth Accumulation Calculator
            </CardTitle>
            <CardDescription className="text-sm">
              Simulasi akumulasi kekayaan jangka panjang melalui efek bunga majemuk bulanan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="initCap">Modal Investasi Awal (Rp)</Label>
                <Input
                  id="initCap"
                  type="text"
                  inputMode="decimal"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthlySave">Setoran Investasi Rutin per Bulan (Rp)</Label>
                <Input
                  id="monthlySave"
                  type="text"
                  inputMode="decimal"
                  value={monthlySave}
                  onChange={(e) => setMonthlySave(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-11 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="annRet">Return Tahunan (%)</Label>
                  <Input
                    id="annRet"
                    type="text"
                    inputMode="decimal"
                    value={annualReturn}
                    onChange={(e) => setAnnualReturn(formatRibuanInput(e.target.value, false))}
                    className="auto-ribuan h-11 font-mono"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="yearsTenor">Durasi (Tahun)</Label>
                  <Input
                    id="yearsTenor"
                    type="text"
                    inputMode="numeric"
                    value={yearsTenor}
                    onChange={(e) => setYearsTenor(formatRibuanInput(e.target.value, false))}
                    className="auto-ribuan h-11 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#C3A477]/45 bg-secondary/40 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Estimasi Nilai Akhir Portofolio ({nYears} Tahun)
                  </p>
                  <p className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-1">
                    Rp {formatRibuanInput(totalFutureValue, true)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-card p-3">
                    <p className="text-[11px] text-muted-foreground">Total Modal Pokok Disetor</p>
                    <p className="text-sm font-bold font-mono text-foreground mt-0.5">
                      Rp {formatRibuanInput(totalPrincipal, true)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-3">
                    <p className="text-[11px] text-muted-foreground">Hasil Bunga Majemuk</p>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +Rp {formatRibuanInput(totalCompoundGain, true)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Rasio Penggandaan Modal</span>
                <span className="font-mono font-bold text-foreground px-2.5 py-0.5 rounded bg-[#C3A477]/25">
                  {multiplier}x Lipat dari Modal Pokok
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          TOOL 4: GOLD PRICE REFERENCE & ANTAM SIMULATOR
      ===================================================================== */}
      {activeTab === "gold" && (
        <Card className="w-full shadow-sm border-border bg-card">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-2.5 text-xl md:text-2xl">
              <Coins className="h-6 w-6 text-[#C3A477]" />
              Gold Price Reference &amp; Antam Physical Bullion Calculator (0.5g – 1000g)
            </CardTitle>
            <CardDescription className="text-sm">
              Referensi lengkap harga emas batangan fisik Antam seluruh pecahan beserta kalkulasi PPh 22 (0.25%)
              dan estimasi nilai buyback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3 rounded-xl border border-border bg-secondary/40 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="goldRef">Acuan Harga Antam 1 Gram (Rp)</Label>
                <Input
                  id="goldRef"
                  type="text"
                  inputMode="decimal"
                  value={goldRefPrice}
                  onChange={(e) => setGoldRefPrice(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-10 font-mono bg-card"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goldGram">Target Akumulasi Emas (Gram)</Label>
                <Input
                  id="goldGram"
                  type="text"
                  inputMode="decimal"
                  value={goldSimGram}
                  onChange={(e) => setGoldSimGram(formatRibuanInput(e.target.value, false))}
                  className="auto-ribuan h-10 font-mono bg-card"
                />
              </div>
              <div className="rounded-lg border border-[#C3A477]/50 bg-card p-3 flex flex-col justify-center">
                <p className="text-[11px] text-muted-foreground">
                  Total Nilai ({simGrams} gr • Termasuk PPh 0.25%)
                </p>
                <p className="text-lg font-bold font-mono text-foreground">
                  Rp {formatRibuanInput(simTotalWithTax, true)}
                </p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  Est. Buyback: Rp {formatRibuanInput(simBuybackEst, true)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-secondary/70 text-muted-foreground font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Pecahan Berat</th>
                    <th className="py-3 px-4 text-right">Harga Dasar (Rp)</th>
                    <th className="py-3 px-4 text-right">+Pajak PPh 0.25% (Rp)</th>
                    <th className="py-3 px-4 text-right">Harga Efektif / Gram</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {ANTAM_ALL_TIERS.map((tier) => {
                    const base = Math.round(baseAntam1g * tier.weight * tier.multiplier);
                    const taxed = Math.round(base * 1.0025);
                    const perGram = Math.round(taxed / tier.weight);
                    return (
                      <tr key={tier.label} className="hover:bg-secondary/40 transition-colors font-mono">
                        <td className="py-2.5 px-4 font-sans font-semibold text-foreground">{tier.label}</td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                          {formatRibuanInput(base, true)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-foreground">
                          {formatRibuanInput(taxed, true)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-muted-foreground">
                          {formatRibuanInput(perGram, true)}/g
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =====================================================================
          TOOL 5: COMPANY COMPARISON TOOL
      ===================================================================== */}
      {activeTab === "comparison" && (
        <Card className="w-full shadow-sm border-border bg-card">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-2.5 text-xl md:text-2xl">
              <Layers className="h-6 w-6 text-[#C3A477]" />
              Head-to-Head Company Fundamental &amp; Valuation Comparison
            </CardTitle>
            <CardDescription className="text-sm">
              Bandingkan metrik valuasi, profitabilitas, struktur modal, dan margin of safety antar emiten secara
              berdampingan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Emiten Pertama (A)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COMPANY_RESEARCH_LIST.map((c) => (
                    <button
                      key={c.ticker}
                      type="button"
                      onClick={() => setCompareA(c.ticker)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        compareA === c.ticker
                          ? "bg-[#101B2C] text-[#F4F0E7] border-[#101B2C] dark:bg-[#C3A477] dark:text-[#101B2C] dark:border-[#C3A477]"
                          : "bg-background text-foreground border-border hover:border-[#C3A477]"
                      }`}
                    >
                      {c.ticker}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Emiten Pembanding (B)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {COMPANY_RESEARCH_LIST.map((c) => (
                    <button
                      key={c.ticker}
                      type="button"
                      onClick={() => setCompareB(c.ticker)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        compareB === c.ticker
                          ? "bg-[#101B2C] text-[#F4F0E7] border-[#101B2C] dark:bg-[#C3A477] dark:text-[#101B2C] dark:border-[#C3A477]"
                          : "bg-background text-foreground border-border hover:border-[#C3A477]"
                      }`}
                    >
                      {c.ticker}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-secondary/70 font-mono text-xs uppercase">
                  <tr>
                    <th className="py-3 px-4 text-muted-foreground">Metrik Fundamental</th>
                    <th className="py-3 px-4 text-foreground font-bold">
                      {compLeft.ticker} — {compLeft.name}
                    </th>
                    <th className="py-3 px-4 text-foreground font-bold">
                      {compRight.ticker} — {compRight.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card font-mono">
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Sektor</td>
                    <td className="py-3 px-4 font-sans font-medium">{compLeft.sector}</td>
                    <td className="py-3 px-4 font-sans font-medium">{compRight.sector}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Harga Saham Saat Ini</td>
                    <td className="py-3 px-4 font-bold">Rp {formatRibuanInput(compLeft.price, true)}</td>
                    <td className="py-3 px-4 font-bold">Rp {formatRibuanInput(compRight.price, true)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Estimasi Nilai Intrinsik</td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {formatRibuanInput(compLeft.intrinsicValue, true)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {formatRibuanInput(compRight.intrinsicValue, true)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">P/E Ratio (PER)</td>
                    <td className="py-3 px-4">{compLeft.per}x</td>
                    <td className="py-3 px-4">{compRight.per}x</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Price to Book (PBV)</td>
                    <td className="py-3 px-4">{compLeft.pbv}x</td>
                    <td className="py-3 px-4">{compRight.pbv}x</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Return on Equity (ROE)</td>
                    <td className="py-3 px-4 font-bold">{compLeft.roe}%</td>
                    <td className="py-3 px-4 font-bold">{compRight.roe}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Dividend Yield</td>
                    <td className="py-3 px-4">{compLeft.dividendYield}%</td>
                    <td className="py-3 px-4">{compRight.dividendYield}%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Debt to Equity (DER)</td>
                    <td className="py-3 px-4">{compLeft.der}x</td>
                    <td className="py-3 px-4">{compRight.der}x</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Pertumbuhan Laba YoY</td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">
                      {compLeft.earningsGrowthYoY}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400">
                      {compRight.earningsGrowthYoY}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans text-muted-foreground">Kesimpulan Valuasi Editor</td>
                    <td className="py-3 px-4 font-sans font-semibold">{compLeft.verdict}</td>
                    <td className="py-3 px-4 font-sans font-semibold">{compRight.verdict}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
