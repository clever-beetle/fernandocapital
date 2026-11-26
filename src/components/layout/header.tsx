import Link from "next/link";
import Image from "next/image";
import { Settings, Menu, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  formatIdrPerUsdDisplay,
  getDashboardMarketOverview,
} from "@/lib/market-data/read";

const MAIN_NAV = [
  { label: "Beranda", href: "/" },
  { label: "Kalkulator", href: "/calculator" },
  { label: "Riset", href: "/research" },
  { label: "Studio", href: "/studio" },
];

export async function Header({ appVersion = "1.9.0" }: { appVersion?: string }) {
  const overview = await getDashboardMarketOverview();
  const usdIdr = overview.indicators.USD_IDR;
  const formattedUsdIdr = formatIdrPerUsdDisplay(usdIdr.trimmedDecimalValue);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu + Clean Brand */}
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0 h-9 w-9 rounded-lg"
                />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="data-[side=left]:w-[280px] max-w-[88vw] p-6 flex flex-col justify-between bg-card border-border"
            >
              <div className="space-y-6">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="px-2 py-1.5 bg-secondary rounded-lg border border-border flex items-center justify-center">
                    <Image
                      src="/logo-navy.png"
                      alt="Fernando Capital Logo"
                      width={110}
                      height={38}
                      priority
                      className="h-4 w-auto object-contain block dark:hidden"
                    />
                    <Image
                      src="/logo-gold.png"
                      alt="Fernando Capital Logo"
                      width={110}
                      height={38}
                      priority
                      className="h-4 w-auto object-contain hidden dark:block"
                    />
                  </div>
                  <span className="text-base font-bold tracking-tight text-foreground">
                    Fernando Capital
                  </span>
                </Link>

                <Separator />

                <nav className="space-y-1">
                  {MAIN_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                  <Link
                    href="/settings"
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <span>Pengaturan</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>Fernando Capital</span>
                <Link
                  href="/settings?tab=version"
                  className="font-mono font-medium text-foreground"
                >
                  v{appVersion}
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="px-2.5 py-1.5 bg-secondary/80 dark:bg-secondary border border-border rounded-lg flex items-center justify-center">
              <Image
                src="/logo-navy.png"
                alt="Fernando Capital Logo"
                width={120}
                height={42}
                priority
                className="h-4 sm:h-5 w-auto object-contain block dark:hidden"
              />
              <Image
                src="/logo-gold.png"
                alt="Fernando Capital Logo"
                width={120}
                height={42}
                priority
                className="h-4 sm:h-5 w-auto object-contain hidden dark:block"
              />
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-foreground whitespace-nowrap">
              Fernando Capital
            </span>
          </Link>
        </div>

        {/* Center: Clean Minimalist Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Quiet USD/IDR Pill + Theme + Settings */}
        <div className="flex items-center gap-2 shrink-0">
          {formattedUsdIdr && (
            <div className="hidden lg:inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>USD/IDR</span>
              <strong className="font-semibold text-foreground">
                {formattedUsdIdr}
              </strong>
            </div>
          )}

          <ModeToggle />

          <Link href="/settings" title="Pengaturan">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
