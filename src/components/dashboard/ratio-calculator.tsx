"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";

export function RatioCalculator() {
  const [stockPrice, setStockPrice] = useState("");
  const [eps, setEps] = useState("");
  const [bvps, setBvps] = useState("");
  
  const price = parseFloat(stockPrice);
  const earnings = parseFloat(eps);
  const bookValue = parseFloat(bvps);

  const per = price && earnings ? (price / earnings).toFixed(2) : "-";
  const pbv = price && bookValue ? (price / bookValue).toFixed(2) : "-";
  const roe = earnings && bookValue ? ((earnings / bookValue) * 100).toFixed(2) + "%" : "-";

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Calculator className="h-6 w-6 text-primary" />
          Input Metrics
        </CardTitle>
        <CardDescription className="text-base">
          Enter the current market data below to calculate the ratios.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2">
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="price" className="text-base">Current Stock Price</Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g. 1500"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="eps" className="text-base">Earnings Per Share (EPS)</Label>
            <Input
              id="eps"
              type="number"
              placeholder="e.g. 150"
              value={eps}
              onChange={(e) => setEps(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="bvps" className="text-base">Book Value Per Share (BVPS)</Label>
            <Input
              id="bvps"
              type="number"
              placeholder="e.g. 1200"
              value={bvps}
              onChange={(e) => setBvps(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <Button variant="outline" size="lg" className="mt-2 text-base h-12" onClick={() => { setStockPrice(""); setEps(""); setBvps(""); }}>
            Reset Fields
          </Button>
        </div>

        <div className="flex flex-col justify-center rounded-xl border bg-muted/30 p-8">
          <h3 className="mb-6 text-xl font-bold text-foreground">Calculated Results</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-lg text-muted-foreground font-medium">P/E Ratio (PER)</span>
              <span className="font-mono text-3xl font-bold text-primary">{per}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-lg text-muted-foreground font-medium">Price to Book (PBV)</span>
              <span className="font-mono text-3xl font-bold text-primary">{pbv}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-lg text-muted-foreground font-medium">Return on Equity (ROE)</span>
              <span className="font-mono text-3xl font-bold text-primary">{roe}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
