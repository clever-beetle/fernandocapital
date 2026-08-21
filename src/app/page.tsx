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
    <div className="flex flex-col gap-10">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Welcome back, Investor</h2>
        <p className="text-lg text-muted-foreground">Here is what's happening in your account today.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Total Portfolio Value</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatRupiah(450000000)}</div>
            <p className="text-sm text-green-500 font-medium mt-1">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-primary/50 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Emas Antam (1g)</CardTitle>
            <Coins className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {currentAntamPrice > 0 ? formatRupiah(currentAntamPrice) : 'Menunggu data...'}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1">Estimasi Retail Real-time</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Spot Emas (XAU/USD)</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${currentGoldPriceUsd > 0 ? currentGoldPriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1">Harga Global / oz</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Market Trend</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Bullish</div>
            <p className="text-sm text-muted-foreground mt-1">S&P 500 futures naik</p>
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
        <div>
          <section id="news">
            <Card className="shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-2xl">Recent Financial News</CardTitle>
                <CardDescription className="text-base">Latest updates on markets and economy.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                {[
                  { title: "Fed signals potential rate cuts by year-end", time: "2 hours ago", source: "Bloomberg" },
                  { title: "Tech stocks rally as AI investments surge", time: "5 hours ago", source: "CNBC" },
                  { title: "Gold hits new all-time high amid inflation fears", time: "1 day ago", source: "Reuters" },
                  { title: "Consumer spending remains resilient in Q2", time: "1 day ago", source: "Wall Street Journal" },
                ].map((news, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border bg-muted/50 p-5 transition-colors hover:bg-muted/80">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-foreground">{news.title}</p>
                      <p className="text-sm text-muted-foreground">{news.source} • {news.time}</p>
                    </div>
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
