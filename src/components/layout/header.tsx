import Link from "next/link";
import { CircleDollarSign, CircleUser, Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 md:gap-12">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-10">
                <Link href="/" className="flex items-center gap-3 font-bold text-primary mb-6">
                  <CircleDollarSign className="h-8 w-8" />
                  <span className="text-2xl">Fernando Capital</span>
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
          <Link href="/" className="flex items-center gap-3 font-bold text-primary">
            <CircleDollarSign className="h-8 w-8 hidden md:block" />
            <span className="text-xl md:text-2xl">Fernando Capital</span>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-base font-semibold">
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
          <div className="hidden relative md:block w-72">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              className="h-11 w-full rounded-md bg-muted pl-10 text-base outline-none"
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
