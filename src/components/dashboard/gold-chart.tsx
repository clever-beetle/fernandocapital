"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GoldChartProps {
  data: {
    time: string;
    price: number;
  }[];
  currentPrice: number;
  isRupiah?: boolean;
}

export function GoldChart({ data, currentPrice, isRupiah = false }: GoldChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Grafik Emas Antam (IDR/g)</CardTitle>
          <CardDescription className="text-base">Menunggu sinkronisasi data pertama...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          Belum ada data. Cron job akan segera menarik data.
        </CardContent>
      </Card>
    );
  }

  const firstPrice = data[0].price;
  const priceChange = currentPrice - firstPrice;
  const percentChange = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const formatPrice = (value: number) => {
    if (isRupiah) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatAxis = (value: number) => {
    if (isRupiah) {
      return `Rp${(value / 1000000).toFixed(2)}M`; // Format as millions for axis
    }
    return `$${value}`;
  };

  return (
    <Card className="w-full shadow-sm h-full flex flex-col border-primary/20">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{isRupiah ? 'Grafik Emas Antam' : 'Gold Price (XAU/USD)'}</CardTitle>
            <CardDescription className="text-base">{isRupiah ? 'Harga estimasi per gram (IDR)' : 'Real-time market data'}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {formatPrice(currentPrice)}
            </div>
            <div className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{isRupiah ? 'Rp ' + priceChange.toLocaleString('id-ID', {maximumFractionDigits:0}) : priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: isRupiah ? 0 : -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={formatAxis}
            />
            <Tooltip 
              formatter={(value: any) => [formatPrice(value), "Harga"]}
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))", 
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
