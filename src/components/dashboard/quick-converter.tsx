"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownUp } from "lucide-react";
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
        description: `Harga termasuk PPh 0.25%: Rp ${formatRibuanInput(
          Math.round(withTax),
          true
        )}`,
      }
    );
  };

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Kalkulator Cepat Emas
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Simulasi &amp; Estimasi Referensi Internal — Bukan Daftar Harga Resmi PT Antam Tbk.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="quick-conv-ref-1g" className="text-xs text-muted-foreground">
            Harga Acuan 1 Gram (Rp)
          </Label>
          <Input
            id="quick-conv-ref-1g"
            type="text"
            inputMode="decimal"
            value={refPriceText}
            onChange={(e) => handleRefPriceChange(e.target.value)}
            className="auto-ribuan h-10 font-mono font-semibold"
            placeholder="2.725.000"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Nominal Dana (Rp)</Label>
          <Input
            type="text"
            inputMode="decimal"
            value={idrText}
            onChange={(e) => handleIdrChange(e.target.value)}
            className="auto-ribuan h-10 font-mono"
            placeholder="10.000.000"
          />
        </div>

        <div className="flex justify-center -my-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={handleSwapDirection}
            title="Hitung ulang konversi"
            className="rounded-full"
          >
            <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Estimasi Emas (Gram)</Label>
          <div className="relative">
            <Input
              type="text"
              inputMode="decimal"
              value={gramText}
              onChange={(e) => handleGramChange(e.target.value)}
              className="auto-ribuan h-10 pr-10 font-mono font-semibold"
              placeholder="3,67"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              gr
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleCalculateSummary}
          className="w-full h-10 font-semibold"
        >
          Hitung Akurat (+PPh 0.25%)
        </Button>
      </CardContent>
    </Card>
  );
}
