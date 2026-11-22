import Link from "next/link";
import Image from "next/image";
import { Home, Newspaper, TrendingUp, Calculator } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Financial News", href: "#", icon: Newspaper },
  { name: "Gold Tracker", href: "#", icon: TrendingUp },
  { name: "Ratio Calculator", href: "#", icon: Calculator },
];

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
            <Image
              src="/logo-navy.png"
              alt="Fernando Capital Logo"
              width={110}
              height={38}
              className="h-5 w-auto object-contain block dark:hidden"
            />
            <Image
              src="/logo-gold.png"
              alt="Fernando Capital Logo"
              width={110}
              height={38}
              className="h-5 w-auto object-contain hidden dark:block"
            />
            <span className="text-lg">Fernando Capital</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
