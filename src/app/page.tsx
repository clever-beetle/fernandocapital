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
            <CardTitle className="text-sm font-medium text-muted-foreground">Kinerja Emas (YTD)</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
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
      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Gold Tracker Section */}
          <section id="tracker" className="h-[550px]">
            <GoldChart data={chartDataIdr} currentPrice={currentAntamPrice} isRupiah={true} />
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6 relative z-10 h-full">
          {/* Quick Converter Widget */}
          <section id="converter">
            <Card className="shadow-lg bg-gradient-to-br from-card/80 to-primary/5 backdrop-blur-xl border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Kalkulator Cepat
                </CardTitle>
                <CardDescription>Estimasi konversi dana ke emas fisik</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Punya Dana (IDR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50 text-foreground" placeholder="10.000.000" disabled />
                    </div>
                  </div>
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-background border border-white/10 rounded-full p-1">
                      <Activity className="h-4 w-4 text-muted-foreground rotate-90" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dapat Emas (Gram)</label>
                    <div className="relative">
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-primary/50 text-foreground" placeholder="3.56" disabled />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">gr</span>
                    </div>
                  </div>
                  <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 py-2 rounded-lg text-sm font-semibold transition-colors mt-2">
                    Hitung Akurat
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Antam Physical Price Table */}
          <section id="pricelist" className="flex-1">
            <Card className="shadow-lg bg-card/40 backdrop-blur-xl border-border/50 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Harga Fisik Antam</span>
                  <span className="text-xs font-normal px-2 py-1 bg-primary/20 text-primary rounded-full">
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
                      <div key={i} className="grid grid-cols-3 text-sm font-medium items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-md px-1">
                        <div className="text-foreground">{tier.label}</div>
                        <div className="text-right text-muted-foreground">{currentAntamPrice > 0 ? formatRupiah(basePrice).replace('Rp', '') : '---'}</div>
                        <div className="text-right text-primary">{currentAntamPrice > 0 ? formatRupiah(taxPrice).replace('Rp', '') : '---'}</div>
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
          <Card className="shadow-lg bg-card/40 backdrop-blur-xl border-border/50">
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
                <div key={i} className="group flex flex-col justify-between rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:bg-white/10 hover:border-primary/30 cursor-pointer min-h-[120px]">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-3 mb-4">{news.title}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{news.source} • {news.time}</p>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
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
