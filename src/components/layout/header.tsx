import Link from "next/link";
import Image from "next/image";
import { Settings, Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header({ appVersion = "1.5.0" }: { appVersion?: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-2xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8 max-w-7xl w-full">
        <div className="flex items-center gap-4 md:gap-12">
          {/* Mobile Menu */}
          <Sheet>
            {/* @ts-expect-error - asChild is missing from Radix UI DialogTrigger types locally */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col justify-between bg-background border-border">
              <nav className="flex flex-col gap-6 mt-10">
                <Link href="/" className="flex items-center gap-3 font-bold mb-6 group">
                  <div className="px-2.5 py-2 bg-[#FAF7F0] dark:bg-[#1B2C45] border border-[#101B2C]/15 dark:border-[#C3A477]/45 rounded-xl flex items-center justify-center shadow-sm">
                    <Image
                      src="/logo-navy.png"
                      alt="Fernando Capital Logo (Midnight Navy)"
                      width={140}
                      height={50}
                      priority
                      className="h-6 w-auto object-contain block dark:hidden transition-transform duration-300 group-hover:scale-105"
                    />
                    <Image
                      src="/logo-gold.png"
                      alt="Fernando Capital Logo (Champagne Gold)"
                      width={140}
                      height={50}
                      priority
                      className="h-6 w-auto object-contain hidden dark:block transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-2xl text-[#101B2C] dark:text-[#F4F0E7] tracking-tight">
                    Fernando Capital
                  </span>
                </Link>
                <Link href="/" className="text-lg font-semibold text-foreground transition-colors hover:text-[#C3A477]">
                  Dashboard
                </Link>
                <Link href="/calculator" className="text-lg font-semibold text-foreground/75 transition-colors hover:text-[#C3A477]">
                  Calculator
                </Link>
                <Link href="/#news" className="text-lg font-semibold text-foreground/75 transition-colors hover:text-[#C3A477]">
                  News
                </Link>
                <Link href="/settings" className="text-lg font-semibold text-foreground/75 transition-colors hover:text-[#C3A477]">
                  Pengaturan
                </Link>
              </nav>

              <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Fernando Capital</span>
                <Link
                  href="/settings?tab=version"
                  className="rounded-full bg-secondary px-2.5 py-0.5 border border-border hover:border-[#C3A477] transition-colors text-foreground"
                >
                  v{appVersion}
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Logo: Midnight Navy (#101B2C) on Warm Ivory Light Mode, Champagne Gold (#C3A477) on Midnight Navy Dark Mode */}
          <Link href="/" className="flex items-center gap-3 font-bold group">
            <div className="px-2.5 py-1.5 md:px-3 md:py-2 bg-[#FAF7F0] dark:bg-[#1B2C45] border border-[#101B2C]/15 dark:border-[#C3A477]/45 rounded-xl flex items-center justify-center shadow-sm group-hover:border-[#C3A477] transition-all">
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
            <span className="text-xl md:text-2xl text-[#101B2C] dark:text-[#F4F0E7] tracking-tight">
              Fernando Capital
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide">
            <Link href="/" className="text-foreground transition-colors hover:text-[#C3A477]">
              Dashboard
            </Link>
            <Link href="/calculator" className="text-foreground/75 transition-colors hover:text-[#C3A477]">
              Calculator
            </Link>
            <Link href="/#news" className="text-foreground/75 transition-colors hover:text-[#C3A477]">
              News
            </Link>
            <Link href="/settings" className="text-foreground/75 transition-colors hover:text-[#C3A477]">
              Pengaturan
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden relative md:block w-60">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              className="h-10 w-full rounded-full bg-secondary/70 border-border pl-10 text-sm outline-none focus-visible:ring-1 focus-visible:ring-[#C3A477] transition-all focus:bg-card hover:bg-secondary"
            />
          </div>
          <Link
            href="/settings?tab=version"
            title="Versi Aplikasi & Riwayat Pembaruan"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/70 hover:bg-secondary hover:border-[#C3A477]/60 px-3 py-1.5 text-xs font-mono font-semibold text-foreground transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#C3A477]" />
            v{appVersion}
          </Link>
          <ModeToggle />
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-11 md:w-11">
            <Bell className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Link href="/settings" title="Pengaturan Aplikasi">
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 md:h-11 md:w-11 border border-border">
              <Settings className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
