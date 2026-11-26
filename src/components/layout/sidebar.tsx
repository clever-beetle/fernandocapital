import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Calculator,
  BookOpen,
  Building2,
  Activity,
  Globe,
  Coins,
  GraduationCap,
  Sparkles,
  Settings,
  ShieldCheck,
  ArrowUpRight,
  Database,
  Radio,
} from "lucide-react";
import {
  formatIdrPerUsdDisplay,
  getDashboardMarketOverview,
} from "@/lib/market-data/read";
import { DEFAULT_ANTAM_1G_IDR } from "@/lib/gold-pricing";

const WORKSPACE_LINKS = [
  {
    label: "Command Center",
    sublabel: "Bento Terminal Utama",
    href: "/",
    icon: LayoutDashboard,
    badge: "Live",
  },
  {
    label: "Kalkulator & Valuasi",
    sublabel: "5 Mesin Deterministik",
    href: "/calculator",
    icon: Calculator,
    badge: "5 Tools",
  },
  {
    label: "Direktori Riset",
    sublabel: "Database-Backed CMS",
    href: "/research",
    icon: BookOpen,
    badge: "CMS",
  },
];

const PILLAR_LINKS = [
  {
    num: "01",
    label: "Equity Research",
    href: "/#equity-research",
    icon: Building2,
  },
  {
    num: "02",
    label: "Market Intelligence",
    href: "/#market-intelligence",
    icon: Activity,
  },
  {
    num: "03",
    label: "Economic Insights",
    href: "/#economic-insights",
    icon: Globe,
  },
  {
    num: "04",
    label: "Gold & Data Matrix",
    href: "/#tracker",
    icon: Coins,
  },
  {
    num: "05",
    label: "Knowledge Academy",
    href: "/#knowledge",
    icon: GraduationCap,
  },
];

const SYSTEM_LINKS = [
  {
    label: "AI Research Studio",
    href: "/studio",
    icon: Sparkles,
    badge: "70/30",
  },
  {
    label: "Pengaturan & Versi",
    href: "/settings",
    icon: Settings,
    badge: "System",
  },
];

export async function Sidebar({ appVersion = "1.8.0" }: { appVersion?: string }) {
  const overview = await getDashboardMarketOverview();
  const usdIdr = overview.indicators.USD_IDR;
  const formattedUsdIdr = formatIdrPerUsdDisplay(usdIdr.trimmedDecimalValue);
  const formattedGold1g = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(DEFAULT_ANTAM_1G_IDR);

  return (
    <aside
      data-slot="app-sidebar"
      className="hidden lg:flex lg:w-64 xl:w-72 lg:shrink-0 lg:flex-col lg:sticky lg:top-0 lg:h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none z-40"
    >
      {/* Top Sidebar Brand Header */}
      <div className="p-4 pb-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="shrink-0 px-2.5 py-1.5 bg-card dark:bg-[#17263D] border border-border/90 dark:border-[#C3A477]/45 rounded-xl flex items-center justify-center shadow-xs group-hover:border-[#C3A477] transition-all">
            <Image
              src="/logo-navy.png"
              alt="Fernando Capital Logo (Midnight Navy)"
              width={120}
              height={42}
              priority
              className="h-4 w-auto shrink-0 object-contain block dark:hidden"
            />
            <Image
              src="/logo-gold.png"
              alt="Fernando Capital Logo (Champagne Gold)"
              width={120}
              height={42}
              priority
              className="h-4 w-auto shrink-0 object-contain hidden dark:block"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold tracking-tight text-foreground leading-none truncate">
              FERNANDO CAPITAL
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1 truncate">
              Terminal Workspace
            </span>
          </div>
        </Link>

        <Link href="/settings?tab=version" className="shrink-0">
          <Badge
            variant="outline"
            className="font-mono text-[10px] px-1.5 py-0.5 border-[#C3A477]/50 bg-[#C3A477]/15 text-foreground"
          >
            v{appVersion}
          </Badge>
        </Link>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Scrollable Navigation & Live Telemetry Rail */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {/* Live Neon Database Telemetry Dock inside Sidebar */}
        <div className="rounded-xl border border-[#C3A477]/45 bg-card/90 p-3 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-foreground">
              <Database className="w-3 h-3 text-[#C3A477]" />
              Neon DB Telemetry
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {usdIdr.freshnessLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border/70 bg-secondary/40 p-2">
              <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                USD/IDR (ECB)
              </span>
              <span className="text-xs font-extrabold font-mono text-foreground block mt-0.5">
                {formattedUsdIdr || "—"}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground block truncate">
                {usdIdr.sourceDate || "EOD"}
              </span>
            </div>
            <div className="rounded-lg border border-border/70 bg-secondary/40 p-2">
              <span className="text-[9px] font-mono uppercase text-muted-foreground block">
                Simulasi Emas 1g
              </span>
              <span className="text-xs font-extrabold font-mono text-foreground block mt-0.5">
                {formattedGold1g}
              </span>
              <span className="text-[9px] font-mono text-[#C3A477] block truncate">
                Preset +PPh 0.25%
              </span>
            </div>
          </div>
        </div>

        {/* Group 1: Primary Workspace Views */}
        <div className="space-y-1">
          <p className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            Workspace Utama
          </p>
          {WORKSPACE_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="p-1.5 rounded-lg bg-card border border-border/80 text-foreground group-hover:border-[#C3A477] group-hover:text-[#C3A477] transition-colors shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate">
                    <span className="block leading-tight">{item.label}</span>
                    <span className="block text-[10px] font-normal text-muted-foreground">
                      {item.sublabel}
                    </span>
                  </span>
                </span>
                <Badge
                  variant="secondary"
                  className="font-mono text-[9px] px-1.5 py-0 h-4 shrink-0"
                >
                  {item.badge}
                </Badge>
              </Link>
            );
          })}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Group 2: 5 Core Pillars */}
        <div className="space-y-1">
          <p className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            Navigasi 5 Pilar
          </p>
          {PILLAR_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.num}
                href={item.href}
                className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Badge
                    variant="default"
                    className="font-mono text-[10px] px-1.5 py-0 h-5 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold shrink-0"
                  >
                    {item.num}
                  </Badge>
                  <span className="truncate">{item.label}</span>
                </span>
                <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#C3A477] shrink-0" />
              </Link>
            );
          })}
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Group 3: Editorial Studio & System */}
        <div className="space-y-1">
          <p className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
            Otomasi &amp; Tata Kelola
          </p>
          {SYSTEM_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#C3A477]" />
                  <span>{item.label}</span>
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[9px] px-1.5 py-0 h-4 border-[#C3A477]/45"
                >
                  {item.badge}
                </Badge>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Sidebar Governance Footer */}
      <div className="p-3 border-t border-sidebar-border bg-card/60 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-foreground font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C3A477]" />
            70% AI • 30% Human
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Radio className="w-3 h-3" />
            Active
          </span>
        </div>
        <Link
          href="/calculator"
          className="flex items-center justify-between w-full rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-3 py-2 text-[11px] font-bold hover:opacity-90 transition-opacity"
        >
          <span>Buka Terminal Kalkulator</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
