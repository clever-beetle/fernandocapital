import Link from "next/link";
import { CircleDollarSign, CircleUser, Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
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
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-10">
                <Link href="/" className="flex items-center gap-3 font-bold mb-6">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <CircleDollarSign className="h-8 w-8 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" />
                  </div>
                  <span className="text-2xl bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">Fernando Capital</span>
                </Link>
                <Link href="/" className="text-lg font-semibold text-foreground transition-colors hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/calculator" className="text-lg font-semibold text-foreground/70 transition-colors hover:text-primary">
                  Calculator
                </Link>
                <Link href="/" className="text-lg font-semibold text-foreground/70 transition-colors hover:text-primary">
                  News
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold">
            <div className="p-2 bg-primary/10 rounded-xl hidden md:flex items-center justify-center">
              <CircleDollarSign className="h-7 w-7 text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" />
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
            <Link href="/" className="text-foreground/70 transition-colors hover:text-primary">
              News
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden relative md:block w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              className="h-10 w-full rounded-full bg-white/5 border-white/10 pl-10 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all focus:bg-white/10 hover:bg-white/10"
            />
          </div>
          <ModeToggle />
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 md:h-11 md:w-11">
            <Bell className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Button variant="secondary" size="icon" className="rounded-full h-10 w-10 md:h-11 md:w-11">
            <CircleUser className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
