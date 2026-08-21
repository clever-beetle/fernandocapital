import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldChart } from "@/components/dashboard/gold-chart";
import { ArrowUpRight, DollarSign, Activity, Coins } from "lucide-react";
import { db } from "@/db";
import { goldPrices } from "@/db/schema";
import { desc } from "drizzle-orm";

// Force dynamic rendering to prevent static generation from hitting the DB at build time
export const dynamic = 'force-dynamic';

// Helper untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default async function Dashboard() {
  // Fetch historical gold prices from Neon Database (last 50 records)
  const rawPrices = await db.select().from(goldPrices).orderBy(desc(goldPrices.timestamp)).limit(50);
  
  // Format data for Recharts (reverse to make it chronological)
  const chartDataIdr = rawPrices.reverse().map(record => ({
    time: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(record.timestamp),
    price: record.antamPriceIdr ? parseFloat(record.antamPriceIdr) : parseFloat(record.priceUsd) * 15500 / 31.103 * 1.05 // fallback if antam is null
  }));

  const currentAntamPrice = chartDataIdr.length > 0 ? chartDataIdr[chartDataIdr.length - 1].price : 0;
  
  // XAU USD tetap ada untuk referensi
  const currentGoldPriceUsd = rawPrices.length > 0 ? parseFloat(rawPrices[0].priceUsd) : 0;

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[100px] -z-10" />
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary/80 bg-clip-text text-transparent">
          Welcome back, Investor
        </h2>
        <p className="text-lg text-muted-foreground">Here is what's happening in your portfolio today.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4 relative z-10">
        <Card className="shadow-lg bg-card/40 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Value</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">{formatRupiah(450000000)}</div>
            <p className="text-sm text-chart-2 font-medium mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +20.1% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-[0_0_20px_hsl(var(--primary)/0.05)] bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-xl border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Emas Antam (1g)</CardTitle>
            <div className="p-2 bg-primary/20 rounded-lg">
              <Coins className="h-4 w-4 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {currentAntamPrice > 0 ? formatRupiah(currentAntamPrice) : 'Menunggu data...'}
            </div>
            <p className="text-xs text-primary/80 font-medium mt-2 uppercase tracking-wider">Estimasi Retail Live</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/40 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spot Emas (XAU/USD)</CardTitle>
            <div className="p-2 bg-secondary rounded-lg">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              ${currentGoldPriceUsd > 0 ? currentGoldPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-2 uppercase tracking-wider">Harga Global / oz</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/40 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Trend</CardTitle>
            <div className="p-2 bg-chart-2/10 rounded-lg">
              <ArrowUpRight className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-chart-2 drop-shadow-[0_0_8px_hsl(var(--chart-2)/0.5)]">Bullish</div>
            <p className="text-sm text-muted-foreground mt-2">S&P 500 futures naik</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          {/* Gold Tracker Section */}
          <section id="tracker">
            <GoldChart data={chartDataIdr} currentPrice={currentAntamPrice} isRupiah={true} />
          </section>
        </div>

        {/* Financial News Section */}
        <div className="relative z-10">
          <section id="news" className="h-full">
            <Card className="shadow-lg bg-card/40 backdrop-blur-xl border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Market Intelligence</CardTitle>
                <CardDescription className="text-base">Real-time updates on global markets.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  { title: "Fed signals potential rate cuts by year-end", time: "2 hours ago", source: "Bloomberg" },
                  { title: "Tech stocks rally as AI investments surge", time: "5 hours ago", source: "CNBC" },
                  { title: "Gold hits new all-time high amid inflation fears", time: "1 day ago", source: "Reuters" },
                  { title: "Consumer spending remains resilient in Q2", time: "1 day ago", source: "Wall Street Journal" },
                ].map((news, i) => (
                  <div key={i} className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-primary/30 cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{news.title}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{news.source} • {news.time}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
