import Link from "next/link";
import Image from "next/image";
import { Settings, Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header({ appVersion = "1.5.0" }: { appVersion?: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/40 backdrop-blur-2xl">
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
            <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col justify-between">
              <nav className="flex flex-col gap-6 mt-10">
                <Link href="/" className="flex items-center gap-3 font-bold mb-6 group">
                  <div className="px-2.5 py-2 bg-gradient-to-br from-white/15 to-primary/10 dark:from-white/10 dark:to-primary/15 border border-white/15 rounded-xl flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
                    <Image
                      src="/logo.png"
                      alt="Fernando Capital Logo"
                      width={140}
                      height={48}
                      priority
                      className="h-6 w-auto object-contain drop-shadow-[0_2px_10px_hsl(var(--primary)/0.4)] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-2xl bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">Fernando Capital</span>
                </Link>
                <Link href="/" className="text-lg font-semibold text-foreground transition-colors hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/calculator" className="text-lg font-semibold text-foreground/70 transition-colors hover:text-primary">
                  Calculator
                </Link>
                <Link href="/#news" className="text-lg font-semibold text-foreground/70 transition-colors hover:text-primary">
                  News
                </Link>
                <Link href="/settings" className="text-lg font-semibold text-foreground/70 transition-colors hover:text-primary">
                  Pengaturan
                </Link>
              </nav>

              <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>Fernando Capital</span>
                <Link
                  href="/settings?tab=version"
                  className="rounded-full bg-muted px-2.5 py-0.5 border border-border hover:border-primary/40 transition-colors"
                >
                  v{appVersion}
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold group">
            <div className="px-2.5 py-1.5 md:px-3 md:py-2 bg-gradient-to-br from-white/15 to-primary/10 dark:from-white/10 dark:to-primary/15 border border-white/15 rounded-xl flex items-center justify-center shadow-[0_0_18px_hsl(var(--primary)/0.15)] group-hover:border-primary/40 transition-all">
              <Image
                src="/logo.png"
                alt="Fernando Capital Logo"
                width={140}
                height={48}
                priority
                className="h-5 md:h-6 w-auto object-contain drop-shadow-[0_2px_10px_hsl(var(--primary)/0.4)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-xl md:text-2xl bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent tracking-tight">Fernando Capital</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm font-semibold tracking-wide">
            <Link href="/" className="text-foreground transition-colors hover:text-primary">
              Dashboard
            </Link>
            <Link href="/calculator" className="text-foreground/70 transition-colors hover:text-primary">
              Calculator
            </Link>
            <Link href="/#news" className="text-foreground/70 transition-colors hover:text-primary">
              News
            </Link>
            <Link href="/settings" className="text-foreground/70 transition-colors hover:text-primary">
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
              className="h-10 w-full rounded-full bg-white/5 border-white/10 pl-10 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all focus:bg-white/10 hover:bg-white/10"
            />
          </div>
          <Link
            href="/settings?tab=version"
            title="Versi Aplikasi & Riwayat Pembaruan"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/5 hover:bg-white/10 hover:border-primary/40 px-3 py-1.5 text-xs font-mono font-semibold text-foreground/90 transition-all"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            v{appVersion}
          </Link>
          <ModeToggle />
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-11 md:w-11">
            <Bell className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Link href="/settings" title="Pengaturan Aplikasi">
            <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 md:h-11 md:w-11">
              <Settings className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
