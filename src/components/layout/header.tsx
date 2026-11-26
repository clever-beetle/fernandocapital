import Link from "next/link";
import Image from "next/image";
import { Settings, Menu, Sparkles, ShieldCheck, ArrowUpRight, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  formatIdrPerUsdDisplay,
  getDashboardMarketOverview,
} from "@/lib/market-data/read";

const PILLAR_NAV = [
  { num: "01", label: "Equity Research", href: "/#equity-research" },
  { num: "02", label: "Market Intelligence", href: "/#market-intelligence" },
  { num: "03", label: "Economic Insights", href: "/#economic-insights" },
  { num: "04", label: "Data & Tools", href: "/calculator" },
  { num: "05", label: "Knowledge", href: "/#knowledge" },
];

export async function Header({ appVersion = "1.6.0" }: { appVersion?: string }) {
  const overview = await getDashboardMarketOverview();
  const usdIdr = overview.indicators.USD_IDR;
  const ihsg = overview.indicators.IHSG;
  const biRate = overview.indicators.BI_RATE;
  const sbn10y = overview.indicators.SBN_10Y;
  const formattedUsdIdr = formatIdrPerUsdDisplay(usdIdr.trimmedDecimalValue);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/75 shadow-xs">
      {/* Top Institutional Market Intelligence Strip */}
      <div className="w-full bg-[#0D1726] text-[#F4F0E7] border-b border-[#C3A477]/25">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-8 h-9 flex items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[#C3A477] font-semibold tracking-wider uppercase shrink-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Financial Data Engine
            </span>
            <span className="text-[#B8C4D4]/30 shrink-0">|</span>
            <span className="text-[#F4F0E7]/90 shrink-0">
              USD/IDR (Ref. ECB){" "}
              {formattedUsdIdr ? (
                <strong className="text-[#C3A477]">
                  {formattedUsdIdr} ({usdIdr.sourceDate} • {usdIdr.freshnessLabel})
                </strong>
              ) : (
                <span className="text-[#B8C4D4]">Belum Tersedia</span>
              )}
            </span>
            <span className="hidden sm:inline text-[#B8C4D4]/30 shrink-0">•</span>
            <span className="hidden sm:inline text-[#F4F0E7]/90 shrink-0">
              IHSG{" "}
              {ihsg.trimmedDecimalValue !== null ? (
                <strong className="text-emerald-400">{ihsg.trimmedDecimalValue}</strong>
              ) : (
                <span className="text-[#B8C4D4]">Pending Lisensi IDX</span>
              )}
            </span>
            <span className="hidden md:inline text-[#B8C4D4]/30 shrink-0">•</span>
            <span className="hidden md:inline text-[#F4F0E7]/90 shrink-0">
              BI-Rate{" "}
              {biRate.trimmedDecimalValue !== null ? (
                <strong>{biRate.trimmedDecimalValue}%</strong>
              ) : (
                <span className="text-[#B8C4D4]">Menunggu Verifikasi Editor</span>
              )}
            </span>
            <span className="hidden lg:inline text-[#B8C4D4]/30 shrink-0">•</span>
            <span className="hidden lg:inline text-[#F4F0E7]/90 shrink-0">
              SBN 10Y{" "}
              {sbn10y.trimmedDecimalValue !== null ? (
                <strong className="text-emerald-400">{sbn10y.trimmedDecimalValue}%</strong>
              ) : (
                <span className="text-[#B8C4D4]">Menunggu Verifikasi Editor</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <Link
              href="/studio"
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C3A477]/15 text-[#C3A477] border border-[#C3A477]/35 hover:bg-[#C3A477]/25 transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />
              AI 70% • Human 30%
            </Link>
            <Link
              href="/settings?tab=version"
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-[#F4F0E7] hover:text-[#C3A477] border border-white/15 transition-colors"
            >
              <Radio className="w-2.5 h-2.5 text-emerald-400" />
              <span>v{appVersion}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Editorial & Intelligence Masthead */}
      <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between gap-2 px-3 sm:px-4 md:px-8 max-w-7xl w-full">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-5 min-w-0">
          {/* Mobile Drawer — uses Base UI native render prop so only a single <button> is rendered */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="xl:hidden shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-border/80 bg-card/80 shadow-2xs"
                />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="data-[side=left]:w-[290px] data-[side=left]:sm:w-[340px] max-w-[90vw] p-5 pt-6 flex flex-col justify-between bg-background border-border overflow-y-auto"
            >
              <div className="space-y-5">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 group pb-4 pr-8"
                >
                  <div className="shrink-0 px-2.5 py-1.5 bg-[#FAF7F0] dark:bg-[#18273F] border border-[#101B2C]/20 dark:border-[#C3A477]/45 rounded-xl flex items-center justify-center shadow-xs">
                    <Image
                      src="/logo-navy.png"
                      alt="Fernando Capital Logo (Midnight Navy)"
                      width={130}
                      height={46}
                      priority
                      className="h-4 w-auto shrink-0 object-contain block dark:hidden"
                    />
                    <Image
                      src="/logo-gold.png"
                      alt="Fernando Capital Logo (Champagne Gold)"
                      width={130}
                      height={46}
                      priority
                      className="h-4 w-auto shrink-0 object-contain hidden dark:block"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm sm:text-base font-extrabold tracking-tight text-foreground whitespace-nowrap">
                      FERNANDO CAPITAL
                    </span>
                    <span className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                      Financial Intelligence
                    </span>
                  </div>
                </Link>

                <Separator />

                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 mb-2">
                    5 Pilar Utama
                  </p>
                  {PILLAR_NAV.map((item) => (
                    <Link
                      key={item.num}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Badge
                          variant="default"
                          className="font-mono text-[10px] px-1.5 py-0 h-5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold"
                        >
                          {item.num}
                        </Badge>
                        <span>{item.label}</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2">
                    Sistem &amp; Otomasi
                  </p>
                  <Link
                    href="/studio"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>AI Research Studio (70/30)</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80"
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Pengaturan &amp; Versi Sistem</span>
                  </Link>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Fernando Capital</span>
                <Link
                  href="/settings?tab=version"
                  className="rounded-full bg-secondary px-2.5 py-0.5 border border-border text-foreground font-semibold"
                >
                  v{appVersion}
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0 sm:shrink-0">
            <div className="shrink-0 px-2.5 py-1.5 sm:px-3 md:py-2 bg-card dark:bg-[#17263D] border border-border/90 dark:border-[#C3A477]/45 rounded-xl flex items-center justify-center shadow-xs group-hover:border-[#C3A477] group-hover:shadow-md transition-all">
              <Image
                src="/logo-navy.png"
                alt="Fernando Capital Logo (Midnight Navy)"
                width={140}
                height={50}
                priority
                className="h-3.5 sm:h-5 md:h-6 w-auto shrink-0 object-contain block dark:hidden transition-transform duration-300 group-hover:scale-105"
              />
              <Image
                src="/logo-gold.png"
                alt="Fernando Capital Logo (Champagne Gold)"
                width={140}
                height={50}
                priority
                className="h-3.5 sm:h-5 md:h-6 w-auto shrink-0 object-contain hidden dark:block transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-base xl:text-xl font-extrabold text-foreground tracking-tight leading-none whitespace-nowrap">
                FERNANDO CAPITAL
              </span>
              <span className="hidden sm:block text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground mt-1 whitespace-nowrap">
                Intelligence &amp; Research
              </span>
            </div>
          </Link>

          {/* Desktop 5-Pillar Shadcn Pill Navigation */}
          <nav className="hidden xl:flex items-center gap-1 rounded-xl border border-border/70 bg-secondary/40 p-1 min-w-0">
            {PILLAR_NAV.map((item) => (
              <Link
                key={item.num}
                href={item.href}
                className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground/85 hover:text-foreground hover:bg-card hover:shadow-2xs transition-all whitespace-nowrap"
              >
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-card border border-border/70 text-muted-foreground group-hover:bg-[#101B2C] group-hover:text-[#F4F0E7] dark:group-hover:bg-[#C3A477] dark:group-hover:text-[#101B2C] group-hover:border-transparent transition-colors font-bold">
                  {item.num}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions: AI Studio (70/30 on sm+), Theme Mode Toggle, System Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/studio"
            title="AI Research & Automation Studio (70/30)"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] hover:opacity-90 px-3.5 py-2 text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C3A477] dark:text-[#101B2C] shrink-0" />
            <span>AI Studio</span>
            <Badge
              variant="outline"
              className="font-mono text-[10px] px-1.5 py-0 h-4 border-white/25 dark:border-[#101B2C]/30 text-current"
            >
              70/30
            </Badge>
          </Link>

          <ModeToggle />

          <Link href="/settings" title="Pengaturan & Versi Sistem" className="shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 border-border/80 bg-card/80 hover:border-[#C3A477] shadow-2xs"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
