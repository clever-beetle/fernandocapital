"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Coins, ArrowDownUp } from "lucide-react";
import {
  formatRibuanInput,
  parseRibuanInput,
} from "@/components/system/system-provider";
import { DEFAULT_ANTAM_1G_IDR } from "@/lib/gold-pricing";
import { toast } from "sonner";

export function QuickConverter({
  currentAntamPrice,
}: {
  currentAntamPrice: number;
}) {
  const initialRef =
    currentAntamPrice > 0 ? Math.round(currentAntamPrice) : DEFAULT_ANTAM_1G_IDR;
  const [refPriceText, setRefPriceText] = useState(() =>
    formatRibuanInput(initialRef, true)
  );
  const parsedRef = parseRibuanInput(refPriceText);
  const effectivePrice =
    Number.isFinite(parsedRef) && parsedRef > 0
      ? Math.round(parsedRef)
      : DEFAULT_ANTAM_1G_IDR;

  const [idrText, setIdrText] = useState("10.000.000");
  const [gramText, setGramText] = useState(() => {
    const gr = 10000000 / initialRef;
    return gr.toFixed(2).replace(".", ",");
  });

  const handleRefPriceChange = (val: string) => {
    const formatted = formatRibuanInput(val, false);
    setRefPriceText(formatted);
    const nextRef = parseRibuanInput(formatted);
    const activeRef =
      Number.isFinite(nextRef) && nextRef > 0
        ? Math.round(nextRef)
        : DEFAULT_ANTAM_1G_IDR;
    const idrVal = parseRibuanInput(idrText);
    const gr = idrVal > 0 ? idrVal / activeRef : 0;
    setGramText(gr > 0 ? gr.toFixed(2).replace(".", ",") : "0");
  };

  const handleIdrChange = (val: string) => {
    const formatted = formatRibuanInput(val, false);
    setIdrText(formatted);
    const idrVal = parseRibuanInput(formatted);
    const gr = idrVal > 0 ? idrVal / effectivePrice : 0;
    setGramText(gr > 0 ? gr.toFixed(2).replace(".", ",") : "0");
  };

  const handleGramChange = (val: string) => {
    const formatted = formatRibuanInput(val, false);
    setGramText(formatted);
    const grVal = parseRibuanInput(formatted);
    const idr = grVal > 0 ? Math.round(grVal * effectivePrice) : 0;
    setIdrText(idr > 0 ? formatRibuanInput(idr, true) : "0");
  };

  const handleSwapDirection = () => {
    const idrVal = parseRibuanInput(idrText);
    const gr = idrVal > 0 ? idrVal / effectivePrice : 0;
    setGramText(gr > 0 ? gr.toFixed(2).replace(".", ",") : "0");
  };

  const handleCalculateSummary = () => {
    const idrVal = parseRibuanInput(idrText);
    const grVal = idrVal / effectivePrice;
    const withTax = idrVal * 1.0025;
    toast.success(
      `Estimasi Emas Fisik: ${grVal.toFixed(3).replace(".", ",")} gram`,
      {
        description: `Harga termasuk PPh 0.25%: Rp ${formatRibuanInput(Math.round(withTax), true)}`,
      }
    );
  };

  return (
    <Card className="shadow-lg bg-gradient-to-br from-card via-card to-[#C3A477]/10 backdrop-blur-xl border-border hover:border-[#C3A477]/50 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Coins className="h-5 w-5 text-[#C3A477]" />
          Kalkulator Cepat Emas
        </CardTitle>
        <CardDescription className="text-xs">
          Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="quick-conv-ref-1g"
              className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Harga Acuan Simulasi 1g (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                Rp
              </span>
              <input
                id="quick-conv-ref-1g"
                type="text"
                inputMode="decimal"
                value={refPriceText}
                onChange={(e) => handleRefPriceChange(e.target.value)}
                className="auto-ribuan w-full bg-background/80 border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[#C3A477] text-foreground font-mono font-semibold"
                placeholder="2.725.000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Punya Dana (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                Rp
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={idrText}
                onChange={(e) => handleIdrChange(e.target.value)}
                className="auto-ribuan w-full bg-background/80 border border-border rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[#C3A477] text-foreground font-medium"
                placeholder="10.000.000"
              />
            </div>
          </div>
          <div className="flex justify-center -my-3 relative z-10">
            <button
              type="button"
              onClick={handleSwapDirection}
              title="Balik arah kalkulasi"
              className="bg-card hover:bg-secondary border border-[#C3A477]/40 rounded-full p-2 shadow-md transition-transform hover:scale-110 active:scale-95"
            >
              <ArrowDownUp className="h-4 w-4 text-[#C3A477]" />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dapat Emas (Gram)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={gramText}
                onChange={(e) => handleGramChange(e.target.value)}
                className="auto-ribuan w-full bg-background/80 border border-border rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-[#C3A477] text-foreground font-medium"
                placeholder="3,56"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                gr
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCalculateSummary}
            className="w-full bg-[#101B2C] hover:bg-[#101B2C]/90 text-[#F4F0E7] dark:bg-[#C3A477] dark:hover:bg-[#C3A477]/90 dark:text-[#101B2C] border border-[#C3A477]/30 py-2.5 rounded-lg text-sm font-semibold transition-colors mt-2 shadow-sm"
          >
            Hitung Akurat (+PPh 0.25%)
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
