import Link from "next/link";
import Image from "next/image";
import {
  Settings,
  Menu,
  Sparkles,
  ArrowUpRight,
  Radio,
  Calculator,
  BookOpen,
} from "lucide-react";
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

export async function Header({ appVersion = "1.8.0" }: { appVersion?: string }) {
  const overview = await getDashboardMarketOverview();
  const usdIdr = overview.indicators.USD_IDR;
  const ihsg = overview.indicators.IHSG;
  const biRate = overview.indicators.BI_RATE;
  const formattedUsdIdr = formatIdrPerUsdDisplay(usdIdr.trimmedDecimalValue);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/80 bg-background/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/75 shadow-2xs">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-6 w-full">
        {/* Left: Mobile Drawer Trigger + Mobile Brand + Desktop Workspace Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden shrink-0 h-9 w-9 rounded-xl border-border/80 bg-card/80 shadow-2xs"
                />
              }
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="data-[side=left]:w-[290px] data-[side=left]:sm:w-[330px] max-w-[90vw] p-5 pt-6 flex flex-col justify-between bg-background border-border overflow-y-auto"
            >
              <div className="space-y-5">
                <Link href="/" className="flex items-center gap-2.5 group pb-3 pr-8">
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
                    <span className="block text-sm font-extrabold tracking-tight text-foreground whitespace-nowrap">
                      FERNANDO CAPITAL
                    </span>
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-muted-foreground whitespace-nowrap">
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

          {/* Mobile Brand (< lg) */}
          <Link href="/" className="flex lg:hidden items-center gap-2 min-w-0">
            <div className="shrink-0 px-2 py-1 bg-card dark:bg-[#17263D] border border-border/90 rounded-lg flex items-center justify-center">
              <Image
                src="/logo-navy.png"
                alt="Fernando Capital Logo"
                width={100}
                height={36}
                priority
                className="h-3.5 w-auto object-contain block dark:hidden"
              />
              <Image
                src="/logo-gold.png"
                alt="Fernando Capital Logo"
                width={100}
                height={36}
                priority
                className="h-3.5 w-auto object-contain hidden dark:block"
              />
            </div>
            <span className="text-xs sm:text-sm font-extrabold tracking-tight text-foreground truncate">
              FERNANDO CAPITAL
            </span>
          </Link>

          {/* Desktop Command Bar Telemetry Strip (lg+) */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <Badge
              variant="outline"
              className="font-mono text-[11px] px-2.5 py-1 h-auto rounded-lg border-border bg-card shadow-2xs"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              USD/IDR (ECB):{" "}
              <strong className="ml-1 text-foreground">
                {formattedUsdIdr || "Belum Tersedia"}
              </strong>
              {usdIdr.sourceDate ? (
                <span className="ml-1 text-muted-foreground">({usdIdr.sourceDate})</span>
              ) : null}
            </Badge>

            <Badge
              variant="secondary"
              className="hidden xl:inline-flex font-mono text-[11px] px-2.5 py-1 h-auto rounded-lg"
            >
              IHSG:{" "}
              <span className="ml-1 text-muted-foreground">
                {ihsg.trimmedDecimalValue ?? "Pending Lisensi IDX"}
              </span>
            </Badge>

            <Badge
              variant="secondary"
              className="hidden 2xl:inline-flex font-mono text-[11px] px-2.5 py-1 h-auto rounded-lg"
            >
              BI-Rate:{" "}
              <span className="ml-1 text-muted-foreground">
                {biRate.trimmedDecimalValue
                  ? `${biRate.trimmedDecimalValue}%`
                  : "Verifikasi Editor"}
              </span>
            </Badge>
          </div>
        </div>

        {/* Right Command Bar Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/calculator"
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-[#C3A477]" />
            <span>5 Kalkulator</span>
          </Link>

          <Link
            href="/research"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#C3A477]" />
            <span>Riset</span>
          </Link>

          <Link
            href="/studio"
            title="AI Research & Automation Studio (70/30)"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] hover:opacity-90 px-3 py-1.5 text-xs font-bold shadow-xs transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C3A477] dark:text-[#101B2C] shrink-0" />
            <span>AI Studio</span>
            <span className="font-mono text-[10px] opacity-85">70/30</span>
          </Link>

          <Link
            href="/settings?tab=version"
            className="inline-flex items-center gap-1 rounded-xl border border-[#C3A477]/45 bg-[#C3A477]/15 px-2.5 py-1.5 text-[11px] font-mono font-bold text-foreground hover:bg-[#C3A477]/25 transition-colors"
          >
            <Radio className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>v{appVersion}</span>
          </Link>

          <ModeToggle />

          <Link href="/settings" title="Pengaturan & Versi Sistem" className="shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-9 w-9 border-border/80 bg-card/80 hover:border-[#C3A477] shadow-2xs"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
