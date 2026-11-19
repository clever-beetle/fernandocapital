"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, ArrowDownUp } from "lucide-react";
import { formatRibuanInput, parseRibuanInput } from "@/components/system/system-provider";
import { toast } from "sonner";

export function QuickConverter({ currentAntamPrice }: { currentAntamPrice: number }) {
  const effectivePrice = currentAntamPrice > 0 ? currentAntamPrice : 2725000;
  const [idrText, setIdrText] = useState("10.000.000");
  const [gramText, setGramText] = useState(() => {
    const gr = 10000000 / effectivePrice;
    return gr.toFixed(2).replace(".", ",");
  });
  const [mode, setMode] = useState<"idr-to-gram" | "gram-to-idr">("idr-to-gram");

  useEffect(() => {
    if (mode === "idr-to-gram") {
      const idrVal = parseRibuanInput(idrText);
      const gr = idrVal > 0 ? idrVal / effectivePrice : 0;
      setGramText(gr > 0 ? gr.toFixed(2).replace(".", ",") : "0");
    } else {
      const grVal = parseRibuanInput(gramText);
      const idr = grVal > 0 ? Math.round(grVal * effectivePrice) : 0;
      setIdrText(idr > 0 ? formatRibuanInput(idr, true) : "0");
    }
  }, [effectivePrice, idrText, gramText, mode]);

  const handleIdrChange = (val: string) => {
    setMode("idr-to-gram");
    const formatted = formatRibuanInput(val, false);
    setIdrText(formatted);
  };

  const handleGramChange = (val: string) => {
    setMode("gram-to-idr");
    const formatted = formatRibuanInput(val, false);
    setGramText(formatted);
  };

  const handleSwapDirection = () => {
    setMode((prev) => (prev === "idr-to-gram" ? "gram-to-idr" : "idr-to-gram"));
  };

  const handleCalculateSummary = () => {
    const idrVal = parseRibuanInput(idrText);
    const grVal = idrVal / effectivePrice;
    const withTax = idrVal * 1.0025;
    toast.success(`Estimasi Emas Fisik: ${grVal.toFixed(3).replace(".", ",")} gram`, {
      description: `Harga termasuk PPh 0.25%: Rp ${formatRibuanInput(Math.round(withTax), true)}`,
    });
  };

  return (
    <Card className="shadow-lg bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Kalkulator Cepat
        </CardTitle>
        <CardDescription>Estimasi konversi dana ke emas fisik (otomatis titik ribuan)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                className="auto-ribuan w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50 text-foreground font-medium"
                placeholder="10.000.000"
              />
            </div>
          </div>
          <div className="flex justify-center -my-3 relative z-10">
            <button
              type="button"
              onClick={handleSwapDirection}
              title="Balik arah kalkulasi"
              className="bg-card hover:bg-accent border border-white/10 rounded-full p-2 shadow-lg transition-transform hover:scale-110 active:scale-95"
            >
              <ArrowDownUp className="h-4 w-4 text-primary" />
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
                className="auto-ribuan w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-primary/50 text-foreground font-medium"
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
            className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 py-2 rounded-lg text-sm font-semibold transition-colors mt-2"
          >
            Hitung Akurat (+PPh 0.25%)
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
