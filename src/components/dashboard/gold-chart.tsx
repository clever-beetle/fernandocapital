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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ANTAM_SUMMARY_TIERS,
  calculateAntamTierPricing,
  DEFAULT_ANTAM_1G_IDR,
} from "@/lib/gold-pricing";
import {
  formatRibuanInput,
  parseRibuanInput,
} from "@/components/system/system-provider";
import { ArrowUpRight, Calculator, Coins, Info, ShieldCheck, Sparkles } from "lucide-react";

interface GoldChartProps {
  data?: {
    time: string;
    price: number;
  }[];
  currentPrice: number;
  isRupiah?: boolean;
}

const GOLD_REF_PRESETS = [
  { label: "Rp 1,60 Jt", value: 1600000 },
  { label: "Rp 2,50 Jt", value: 2500000 },
  { label: "Rp 2,725 Jt", value: 2725000 },
  { label: "Rp 3,00 Jt", value: 3000000 },
];

export function GoldChart({
  data,
  currentPrice,
  isRupiah = true,
}: GoldChartProps) {
  void data;
  void isRupiah;

  const initialPreset =
    Number.isFinite(currentPrice) && currentPrice > 0
      ? Math.round(currentPrice)
      : DEFAULT_ANTAM_1G_IDR;

  const [refInputText, setRefInputText] = useState(() =>
    formatRibuanInput(initialPreset, true)
  );

  const parsedRef1g = parseRibuanInput(refInputText);
  const effectiveRef1g =
    Number.isFinite(parsedRef1g) && parsedRef1g > 0
      ? Math.round(parsedRef1g)
      : DEFAULT_ANTAM_1G_IDR;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const tier10g = calculateAntamTierPricing(effectiveRef1g, 10, 0.9815);

  return (
    <Card className="w-full shadow-md bg-card/95 backdrop-blur-xl border-border/90 hover:border-[#C3A477]/60 transition-all h-full flex flex-col justify-between relative overflow-hidden">
      <CardHeader className="border-b border-border/70 pb-4 space-y-3 bg-gradient-to-r from-[#C3A477]/10 via-transparent to-transparent">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            variant="default"
            className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 h-auto rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
          >
            <Coins className="w-3.5 h-3.5 mr-1" />
            Modul Simulasi Emas Fisik • Deterministic Tier Engine
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] px-2.5 py-1 h-auto rounded-md border-[#C3A477]/50 bg-[#C3A477]/10 text-foreground whitespace-normal text-left"
          >
            Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <CardTitle className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
              Grafik Emas Antam &amp; Simulator Kurva Pecahan (IDR/g)
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
            </CardDescription>
          </div>
          <div className="text-left sm:text-right shrink-0 rounded-xl border border-[#C3A477]/40 bg-secondary/40 px-3.5 py-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
              Harga Acuan Simulasi 1g
            </span>
            <div className="text-xl md:text-2xl font-extrabold font-mono text-foreground">
              {formatRupiah(effectiveRef1g)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Educational & Compliance Disclosure Box */}
          <div className="rounded-xl border border-[#C3A477]/45 bg-secondary/35 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              <Info className="w-4 h-4 text-[#C3A477] shrink-0" />
              <span>
                Status Kepatuhan Data Emas: Mode Simulasi &amp; Edukasi Deterministik
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Penarikan otomatis data historis emas dari pihak ketiga yang belum berlisensi
              redistribusi komersial dinonaktifkan. Gunakan input{" "}
              <strong className="text-foreground">Harga Acuan Simulasi 1 Gram</strong> di bawah ini
              untuk mensimulasikan kurva harga efektif per gram, pajak PPh 22 (+0.25%), dan estimasi
              buyback seluruh pecahan.
            </p>
          </div>

          {/* User-Configurable 1g Reference Price Input + Quick Shadcn Presets */}
          <div className="grid gap-3.5 sm:grid-cols-2 rounded-xl border border-border bg-secondary/25 p-4">
            <div className="space-y-2">
              <Label
                htmlFor="home-gold-ref-1g"
                className="text-xs font-mono uppercase tracking-wider text-muted-foreground"
              >
                Sesuaikan Harga Acuan 1 Gram (IDR)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono font-semibold">
                  Rp
                </span>
                <Input
                  id="home-gold-ref-1g"
                  type="text"
                  inputMode="decimal"
                  value={refInputText}
                  onChange={(e) =>
                    setRefInputText(formatRibuanInput(e.target.value, false))
                  }
                  className="auto-ribuan w-full bg-card border-border rounded-lg h-10 pl-9 pr-3 text-sm font-mono font-bold text-foreground focus-visible:border-[#C3A477]"
                  placeholder="2.725.000"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {GOLD_REF_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant={effectiveRef1g === preset.value ? "default" : "outline"}
                    size="xs"
                    onClick={() =>
                      setRefInputText(formatRibuanInput(preset.value, true))
                    }
                    className="font-mono text-[10px]"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#C3A477]/50 bg-card p-3.5 flex flex-col justify-between shadow-2xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-muted-foreground">
                  Simulasi Pecahan Optimal (10 gr • +PPh 0.25%)
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#C3A477] shrink-0" />
              </div>
              <div className="my-1">
                <span className="text-lg font-extrabold font-mono text-foreground">
                  {formatRupiah(tier10g.taxPrice)}
                </span>{" "}
                <span className="text-xs font-mono text-muted-foreground">
                  ({formatRupiah(tier10g.effectivePerGram)}/g)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                Estimasi Buyback (94.5%): {formatRupiah(tier10g.buybackEstimate)}
              </span>
            </div>
          </div>

          {/* Deterministic Effective Price-per-Gram Curve Visualization across Tiers */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
              <span>Kurva Efisiensi Harga / Gram Berdasarkan Pecahan</span>
              <Badge variant="secondary" className="font-mono text-[10px]">
                Basis: +PPh 22 (0.25%)
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ANTAM_SUMMARY_TIERS.map((tier) => {
                const pricing = calculateAntamTierPricing(
                  effectiveRef1g,
                  tier.weight,
                  tier.multiplier
                );
                // Efficiency visual score: 0.5g (1.0367) -> ~35%, 100g (0.9788) -> 100%
                const efficiencyScore = Math.round(
                  Math.max(25, Math.min(100, (1.05 - tier.multiplier) * 1250))
                );
                return (
                  <div
                    key={tier.label}
                    className="rounded-xl border border-border/80 bg-card hover:border-[#C3A477]/60 transition-colors p-3 space-y-1.5 font-mono shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-sans font-extrabold text-foreground">
                        {tier.label}
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] px-1.5 py-0 h-4 border-[#C3A477]/50 text-[#101B2C] dark:text-[#C3A477]"
                      >
                        {(tier.multiplier * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {formatRupiah(pricing.effectivePerGram)}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        /g
                      </span>
                    </div>
                    <Progress value={efficiencyScore} className="h-1.5" />
                    <div className="text-[10px] text-muted-foreground truncate">
                      Total: {formatRupiah(pricing.taxPrice)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="py-3.5 bg-secondary/30 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C3A477]" />
          <span>
            Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
          </span>
        </span>
        <Link
          href="/calculator?tab=gold"
          className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-[#C3A477] transition-colors"
        >
          <Calculator className="w-3.5 h-3.5 text-[#C3A477]" />
          <span>Buka Simulator 0.5g–1000g</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
