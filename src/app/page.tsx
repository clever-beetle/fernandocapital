import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoldChart } from "@/components/dashboard/gold-chart";
import { ArrowUpRight, DollarSign, Activity } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-10">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-foreground">Welcome back, Investor</h2>
        <p className="text-lg text-muted-foreground">Here is what's happening in your account today.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Total Portfolio Value</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">$45,231.89</div>
            <p className="text-sm text-green-500 font-medium mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Gold Status (XAU)</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">$2,480.00</div>
            <p className="text-sm text-green-500 font-medium mt-1">Up +5.2% this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Market Trend</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">Bullish</div>
            <p className="text-sm text-muted-foreground mt-1">S&P 500 futures up</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          {/* Gold Tracker Section */}
          <section id="tracker">
            <GoldChart />
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
