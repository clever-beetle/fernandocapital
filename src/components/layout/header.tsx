import Link from "next/link";
import Image from "next/image";
import { Settings, Menu, Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const PILLAR_NAV = [
  { num: "01", label: "Equity Research", href: "/#equity-research" },
  { num: "02", label: "Market Intelligence", href: "/#market-intelligence" },
  { num: "03", label: "Economic Insights", href: "/#economic-insights" },
  { num: "04", label: "Data & Tools", href: "/calculator" },
  { num: "05", label: "Knowledge", href: "/#knowledge" },
];

export function Header({ appVersion = "1.6.0" }: { appVersion?: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-2xl">
      {/* Top Institutional Market Intelligence Strip */}
      <div className="w-full bg-[#101B2C] text-[#F4F0E7] border-b border-[#C3A477]/30">
        <div className="container mx-auto max-w-7xl px-4 md:px-8 h-9 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 text-[#C3A477] font-semibold tracking-wider uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Data Engine • 5m Sync
            </span>
            <span className="text-[#B8C4D4]/40">|</span>
            <span className="text-[#F4F0E7]/90">
              IHSG <strong className="text-emerald-400">7.418,20 (+0,64%)</strong>
            </span>
            <span className="hidden sm:inline text-[#B8C4D4]/40">•</span>
            <span className="hidden sm:inline text-[#F4F0E7]/90">
              USD/IDR <strong className="text-[#C3A477]">15.845</strong>
            </span>
            <span className="hidden md:inline text-[#B8C4D4]/40">•</span>
            <span className="hidden md:inline text-[#F4F0E7]/90">
              BI-Rate <strong>6,00%</strong>
            </span>
            <span className="hidden lg:inline text-[#B8C4D4]/40">•</span>
            <span className="hidden lg:inline text-[#F4F0E7]/90">
              SBN 10Y <strong className="text-emerald-400">6,68%</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/studio"
              className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C3A477]/15 text-[#C3A477] border border-[#C3A477]/35 hover:bg-[#C3A477]/25 transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />
              AI 70% • Human 30%
            </Link>
            <Link
              href="/settings?tab=version"
              className="inline-flex items-center gap-1 text-[11px] text-[#B8C4D4] hover:text-[#C3A477] transition-colors"
            >
              <span>v{appVersion}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Editorial & Intelligence Masthead */}
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8 max-w-7xl w-full">
        <div className="flex items-center gap-3 md:gap-8">
          {/* Mobile Drawer */}
          <Sheet>
            {/* @ts-expect-error - asChild is missing from Radix UI DialogTrigger types locally */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden border border-border">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[310px] sm:w-[360px] flex flex-col justify-between bg-background border-border"
            >
              <div className="space-y-6 mt-6">
                <Link href="/" className="flex items-center gap-3 group pb-4 border-b border-border">
                  <div className="px-2.5 py-2 bg-[#FAF7F0] dark:bg-[#1B2C45] border border-[#101B2C]/20 dark:border-[#C3A477]/45 rounded-lg flex items-center justify-center shadow-xs">
                    <Image
                      src="/logo-navy.png"
                      alt="Fernando Capital Logo (Midnight Navy)"
                      width={130}
                      height={46}
                      priority
                      className="h-5 w-auto object-contain block dark:hidden"
                    />
                    <Image
                      src="/logo-gold.png"
                      alt="Fernando Capital Logo (Champagne Gold)"
                      width={130}
                      height={46}
                      priority
                      className="h-5 w-auto object-contain hidden dark:block"
                    />
                  </div>
                  <div>
                    <span className="block text-lg font-bold tracking-tight text-foreground">
                      FERNANDO CAPITAL
                    </span>
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Financial Intelligence
                    </span>
                  </div>
                </Link>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 mb-2">
                    5 Pilar Utama
                  </p>
                  {PILLAR_NAV.map((item) => (
                    <Link
                      key={item.num}
                      href={item.href}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                          {item.num}
                        </span>
                        <span>{item.label}</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2">
                    Sistem &amp; Otomasi
                  </p>
                  <Link
                    href="/studio"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Research Studio (70/30)</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan &amp; Versi Sistem</span>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Fernando Capital</span>
                <Link
                  href="/settings?tab=version"
                  className="rounded-full bg-secondary px-2.5 py-0.5 border border-border text-foreground"
                >
                  v{appVersion}
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="px-2.5 py-1.5 md:px-3 md:py-2 bg-[#FAF7F0] dark:bg-[#1B2C45] border border-[#101B2C]/20 dark:border-[#C3A477]/45 rounded-lg flex items-center justify-center shadow-xs group-hover:border-[#C3A477] transition-all">
              <Image
                src="/logo-navy.png"
                alt="Fernando Capital Logo (Midnight Navy)"
                width={140}
                height={50}
                priority
                className="h-5 md:h-6 w-auto object-contain block dark:hidden transition-transform duration-300 group-hover:scale-105"
              />
              <Image
                src="/logo-gold.png"
                alt="Fernando Capital Logo (Champagne Gold)"
                width={140}
                height={50}
                priority
                className="h-5 md:h-6 w-auto object-contain hidden dark:block transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-extrabold text-[#101B2C] dark:text-[#F4F0E7] tracking-tight leading-none">
                FERNANDO CAPITAL
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
                Intelligence &amp; Research
              </span>
            </div>
          </Link>

          {/* Desktop 5-Pillar Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {PILLAR_NAV.map((item) => (
              <Link
                key={item.num}
                href={item.href}
                className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground/85 hover:text-foreground hover:bg-secondary/80 transition-all"
              >
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground group-hover:bg-[#101B2C] group-hover:text-[#F4F0E7] dark:group-hover:bg-[#C3A477] dark:group-hover:text-[#101B2C] transition-colors font-bold">
                  {item.num}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions: AI Studio (70/30), Theme Mode Toggle, System Settings */}
        <div className="flex items-center gap-2">
          <Link
            href="/studio"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] hover:opacity-90 px-3 py-2 text-xs font-semibold shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C3A477] dark:text-[#101B2C]" />
            <span className="hidden sm:inline">AI Studio</span>
            <span className="font-mono text-[10px] opacity-85">70/30</span>
          </Link>

          <ModeToggle />

          <Link href="/settings" title="Pengaturan & Versi Sistem">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full h-10 w-10 md:h-11 md:w-11 border border-border hover:border-[#C3A477]"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
