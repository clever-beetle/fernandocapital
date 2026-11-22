import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldChart } from "@/components/dashboard/gold-chart";
import { QuickConverter } from "@/components/dashboard/quick-converter";
import { ArrowUpRight, Activity, Coins } from "lucide-react";
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
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#C3A477]/20 rounded-full blur-[100px] -z-10" />
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#101B2C] via-[#242A32] to-[#9E7D4B] dark:from-[#F4F0E7] dark:via-[#F4F0E7]/90 dark:to-[#C3A477] bg-clip-text text-transparent">
          Welcome back, Investor
        </h2>
        <p className="text-lg text-muted-foreground">Here is what&apos;s happening in your portfolio today.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4 relative z-10">
        <Card className="shadow-md bg-card/90 backdrop-blur-xl border-border hover:border-[#C3A477]/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kinerja Emas (YTD)</CardTitle>
            <div className="p-2 bg-secondary rounded-lg">
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">+24.8%</div>
            <p className="text-sm text-chart-2 font-medium mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              Mengungguli IHSG
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md bg-gradient-to-br from-card via-card to-[#C3A477]/15 backdrop-blur-xl border-[#C3A477]/45 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C3A477]/15 rounded-full blur-[50px] -z-10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#8A6A3A] dark:text-[#C3A477]">Emas Antam (1g)</CardTitle>
            <div className="p-2 bg-[#C3A477]/20 rounded-lg">
              <Coins className="h-4 w-4 text-[#8A6A3A] dark:text-[#C3A477]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-foreground">
              {currentAntamPrice > 0 ? formatRupiah(currentAntamPrice) : 'Menunggu data...'}
            </div>
            <p className="text-xs text-[#8A6A3A] dark:text-[#C3A477] font-semibold mt-2 uppercase tracking-wider">Estimasi Retail Live</p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card/90 backdrop-blur-xl border-border hover:border-[#C3A477]/50 transition-colors">
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

        <Card className="shadow-md bg-card/90 backdrop-blur-xl border-border hover:border-[#C3A477]/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Trend</CardTitle>
            <div className="p-2 bg-chart-2/15 rounded-lg">
              <ArrowUpRight className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-chart-2">Bullish</div>
            <p className="text-sm text-muted-foreground mt-2">S&amp;P 500 futures naik</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2 h-full">
          {/* Gold Tracker Section */}
          <section id="tracker" className="h-full min-h-[550px]">
            <GoldChart data={chartDataIdr} currentPrice={currentAntamPrice} isRupiah={true} />
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 relative z-10 h-full">
          {/* Quick Converter Widget */}
          <section id="converter">
            <QuickConverter currentAntamPrice={currentAntamPrice} />
          </section>

          {/* Antam Physical Price Table */}
          <section id="pricelist" className="flex-1">
            <Card className="shadow-md bg-card/90 backdrop-blur-xl border-border h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Harga Fisik Antam</span>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#C3A477]/20 text-[#7D5E31] dark:text-[#C3A477] border border-[#C3A477]/30 rounded-full">
                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    <div>Berat</div>
                    <div className="text-right">Dasar</div>
                    <div className="text-right">+Pajak 0.25%</div>
                  </div>
                  {[
                    { label: "0.5 gr", weight: 0.5, multiplier: 1.0367 },
                    { label: "1 gr", weight: 1, multiplier: 1.0 },
                    { label: "5 gr", weight: 5, multiplier: 0.9835 },
                    { label: "10 gr", weight: 10, multiplier: 0.9815 },
                    { label: "50 gr", weight: 50, multiplier: 0.9790 },
                    { label: "100 gr", weight: 100, multiplier: 0.9788 },
                  ].map((tier, i) => {
                    const basePrice = currentAntamPrice * tier.weight * tier.multiplier;
                    const taxPrice = basePrice * 1.0025;
                    return (
                      <div key={i} className="grid grid-cols-3 text-sm font-medium items-center py-2 border-b border-border/60 last:border-0 hover:bg-secondary/60 transition-colors rounded-md px-1.5">
                        <div className="text-foreground font-semibold">{tier.label}</div>
                        <div className="text-right text-muted-foreground">{currentAntamPrice > 0 ? formatRupiah(basePrice).replace('Rp', '') : '---'}</div>
                        <div className="text-right font-semibold text-[#7D5E31] dark:text-[#C3A477]">{currentAntamPrice > 0 ? formatRupiah(taxPrice).replace('Rp', '') : '---'}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Financial News Section (Moved to Bottom, Full Width) */}
      <div className="relative z-10 mt-6">
        <section id="news">
          <Card className="shadow-md bg-card/90 backdrop-blur-xl border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Market Intelligence</CardTitle>
              <CardDescription className="text-base">Real-time updates on global markets.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Fed signals potential rate cuts by year-end", time: "2 hours ago", source: "Bloomberg" },
                { title: "Tech stocks rally as AI investments surge", time: "5 hours ago", source: "CNBC" },
                { title: "Gold hits new all-time high amid inflation fears", time: "1 day ago", source: "Reuters" },
                { title: "Consumer spending remains resilient in Q2", time: "1 day ago", source: "WSJ" },
              ].map((news, i) => (
                <div key={i} className="group flex flex-col justify-between rounded-xl border border-border bg-secondary/45 p-5 transition-all hover:bg-secondary hover:border-[#C3A477]/60 cursor-pointer min-h-[120px]">
                  <p className="text-sm font-medium text-foreground group-hover:text-[#7D5E31] dark:group-hover:text-[#C3A477] transition-colors line-clamp-3 mb-4">{news.title}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{news.source} • {news.time}</p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-[#C3A477] opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
