"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { COMPANY_RESEARCH_LIST } from "@/lib/intelligence-data";
import { formatRibuanInput } from "@/components/system/system-provider";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";

interface HeroShowcaseProps {
  formattedUsdIdr: string | null;
  usdIdrDate: string | null;
}

export function HeroShowcase({
  formattedUsdIdr,
  usdIdrDate,
}: HeroShowcaseProps) {
  const featured = COMPANY_RESEARCH_LIST.slice(0, 3);
  const [selectedTicker, setSelectedTicker] = useState(featured[0].ticker);

  const active =
    featured.find((c) => c.ticker === selectedTicker) || featured[0];

  const mosNum =
    ((active.intrinsicValue - active.price) / active.intrinsicValue) * 100;
  const mosFormatted = mosNum.toFixed(1);
  const barVal = Math.max(20, Math.min(100, 50 + mosNum * 1.4));

  return (
    <div className="relative">
      {/* Soft Ambient Glow Behind Floating Card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-blue-500/20 via-indigo-500/15 to-emerald-400/20 blur-2xl"
      />

      <Card className="relative border-border/80 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Vibrant Top Accent Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500" />

        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Preview Valuasi Interaktif
            </span>
            {formattedUsdIdr && (
              <Badge
                variant="secondary"
                className="font-mono text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >
                USD/IDR {formattedUsdIdr}
              </Badge>
            )}
          </div>

          {/* Interactive 3-Ticker Pill Switcher */}
          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-secondary p-1">
            {featured.map((item) => {
              const isSelected = item.ticker === active.ticker;
              return (
                <button
                  key={item.ticker}
                  type="button"
                  onClick={() => setSelectedTicker(item.ticker)}
                  className={`rounded-lg py-1.5 px-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.ticker}
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-base font-bold text-foreground">
                {active.name}
              </div>
              <span className="text-xs text-muted-foreground">
                {active.sector}
              </span>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              MoS +{mosFormatted}%
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-secondary/60 p-3">
              <span className="text-[11px] text-muted-foreground block">
                Preset Harga
              </span>
              <span className="text-lg font-bold font-mono text-foreground mt-0.5 block">
                Rp {formatRibuanInput(active.price, true)}
              </span>
            </div>
            <div className="rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 p-3">
              <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium block">
                Nilai Intrinsik
              </span>
              <span className="text-lg font-bold font-mono text-blue-700 dark:text-blue-300 mt-0.5 block">
                Rp {formatRibuanInput(active.intrinsicValue, true)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                ROE {active.roe}% • PER {active.per}x • PBV {active.pbv}x
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Diskon +{mosFormatted}%
              </span>
            </div>
            <Progress value={barVal} className="h-2" />
          </div>
        </CardContent>

        <CardFooter className="py-3 bg-secondary/40 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {usdIdrDate ? `Ref. Kurs ${usdIdrDate}` : "Ilustrasi Studi Kasus"}
          </span>
          <Link
            href={`/calculator?tab=valuation&ticker=${active.ticker}`}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <span>Hitung Sendiri</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
