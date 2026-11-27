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
import {
  ANTAM_ALL_TIERS,
  ANTAM_SUMMARY_TIERS,
  calculateAntamTierPricing,
  DEFAULT_ANTAM_1G_IDR,
} from "@/lib/gold-pricing";
import {
  formatRibuanInput,
  parseRibuanInput,
} from "@/components/system/system-provider";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Coins } from "lucide-react";

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

  // Deterministic curve data across 8 physical weights (0.5g to 100g)
  const curveData = ANTAM_ALL_TIERS.filter((t) => t.weight <= 100).map((t) => {
    const p = calculateAntamTierPricing(effectiveRef1g, t.weight, t.multiplier);
    return {
      tier: t.label,
      perGram: p.effectivePerGram,
    };
  });

  return (
    <Card className="w-full border-border bg-card shadow-sm h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Coins className="w-4 h-4" />
              </span>
              <CardTitle className="text-lg font-bold text-foreground">
                Grafik Emas Antam &amp; Simulator Pecahan
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
            </CardDescription>
          </div>
          <div className="text-left sm:text-right shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 block">
              Acuan 1 Gram
            </span>
            <div className="text-xl font-bold font-mono text-foreground">
              {formatRupiah(effectiveRef1g)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 flex-1">
        {/* Clean 1g Input + Preset Pills */}
        <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-secondary/60 p-4">
          <div className="space-y-2">
            <Label htmlFor="home-gold-ref-1g" className="text-xs text-muted-foreground">
              Ubah Harga Acuan 1 Gram (Rp)
            </Label>
            <Input
              id="home-gold-ref-1g"
              type="text"
              inputMode="decimal"
              value={refInputText}
              onChange={(e) =>
                setRefInputText(formatRibuanInput(e.target.value, false))
              }
              className="auto-ribuan bg-card h-10 font-mono font-semibold"
              placeholder="2.725.000"
            />
            <div className="flex flex-wrap gap-1.5">
              {GOLD_REF_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant={effectiveRef1g === preset.value ? "default" : "outline"}
                  size="xs"
                  onClick={() =>
                    setRefInputText(formatRibuanInput(preset.value, true))
                  }
                  className="text-[11px]"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-3.5 flex flex-col justify-center space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Pecahan Optimal 10 gr (+PPh 0.25%)
              </span>
              <Badge variant="secondary" className="text-[10px]">
                Hemat Spread
              </Badge>
            </div>
            <div className="text-lg font-bold font-mono text-foreground">
              {formatRupiah(tier10g.taxPrice)}
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Est. Buyback: {formatRupiah(tier10g.buybackEstimate)}
            </span>
          </div>
        </div>

        {/* Live Interactive Deterministic Price-per-Gram Curve Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              Kurva Penurunan Harga per Gram (0.5g → 100g)
            </span>
            <span>Semakin besar gramasi, semakin efisien</span>
          </div>
          <div className="h-[170px] w-full rounded-xl border border-border/70 bg-secondary/25 pt-3 pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={curveData}
                margin={{ top: 6, right: 10, left: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="goldCurveFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="tier"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={["auto", "auto"]}
                  width={72}
                  tickFormatter={(v: number) =>
                    `${(Number(v) / 1000000).toFixed(2)} Jt`
                  }
                />
                <Tooltip
                  formatter={(val: unknown) => [
                    `${formatRupiah(Number(val))}/gram`,
                    "Harga Efektif (+PPh)",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="perGram"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#goldCurveFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clean 6-Tier Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ANTAM_SUMMARY_TIERS.map((tier) => {
            const pricing = calculateAntamTierPricing(
              effectiveRef1g,
              tier.weight,
              tier.multiplier
            );
            const efficiencyScore = Math.round(
              Math.max(25, Math.min(100, (1.05 - tier.multiplier) * 1250))
            );
            return (
              <div
                key={tier.label}
                className="rounded-xl border border-border bg-card hover:border-amber-500/50 transition-colors p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    {tier.label}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-medium">
                    {(tier.multiplier * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-foreground">
                  {formatRupiah(pricing.effectivePerGram)}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    /g
                  </span>
                </div>
                <Progress
                  value={efficiencyScore}
                  className="h-1.5"
                  indicatorClassName="bg-amber-500"
                />
                <div className="text-[11px] text-muted-foreground truncate">
                  Total: {formatRupiah(pricing.taxPrice)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="py-3.5 border-t border-border bg-secondary/30 flex items-center justify-between text-xs text-muted-foreground">
        <span>Simulasi deterministik internal (+PPh 0.25%)</span>
        <Link
          href="/calculator?tab=gold"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <span>Tabel lengkap 0.5g–1000g</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
