"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    <Card className="w-full shadow-lg bg-card/90 backdrop-blur-xl border-border hover:border-[#C3A477]/50 transition-colors h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#C3A477]/10 rounded-full blur-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
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
            <div className={`text-sm font-medium mt-1 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{isRupiah ? 'Rp ' + priceChange.toLocaleString('id-ID', {maximumFractionDigits:0}) : priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: isRupiah ? 0 : -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C3A477" stopOpacity={0.45}/>
                <stop offset="95%" stopColor="#C3A477" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="time" 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={formatAxis}
            />
            <Tooltip 
              formatter={(value: any) => [formatPrice(value), "Harga"]}
              contentStyle={{ 
                backgroundColor: "var(--card)", 
                backdropFilter: "blur(12px)",
                borderColor: "#C3A477",
                color: "var(--foreground)",
                borderRadius: "12px",
                boxShadow: "0 4px 20px -2px rgba(16, 27, 44, 0.25)"
              }}
              itemStyle={{ color: "#C3A477", fontWeight: "bold" }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#C3A477" 
              fillOpacity={1}
              fill="url(#colorPrice)"
              strokeWidth={3}
              activeDot={{ r: 6, fill: "var(--background)", stroke: "#C3A477", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
