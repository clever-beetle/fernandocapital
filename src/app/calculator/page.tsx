import { RatioCalculator } from "@/components/dashboard/ratio-calculator";

export default function CalculatorPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Stock Ratio Calculator</h2>
        <p className="text-lg text-muted-foreground">Evaluate stock valuation using essential financial metrics.</p>
      </div>
      <RatioCalculator />
    </div>
  );
}
