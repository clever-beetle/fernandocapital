import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SystemProvider } from "@/components/system/system-provider";
import { getVersionInfo } from "@/lib/version";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fernandocapital.web.id"),
  title: {
    default: "Fernando Capital — Financial Intelligence & Research Platform",
    template: "%s | Fernando Capital",
  },
  description:
    "Independent Financial Intelligence, Equity Research & Deterministic Valuation Platform.",
  applicationName: "Fernando Capital",
  keywords: [
    "Fernando Capital",
    "Equity Research Indonesia",
    "Financial Intelligence",
    "Kalkulator Valuasi Saham",
    "Margin of Safety",
    "Harga Emas Antam",
    "Analisis Makroekonomi",
    "Rasio Keuangan PER PBV ROE",
  ],
  authors: [{ name: "Fernando Capital Research" }],
  creator: "Fernando Capital",
  publisher: "Fernando Capital",
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://fernandocapital.web.id",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://fernandocapital.web.id",
    siteName: "Fernando Capital",
    title: "Fernando Capital — Financial Intelligence & Research Platform",
    description:
      "Independent Financial Intelligence, Equity Research & Deterministic Valuation Platform.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Fernando Capital — Financial Intelligence & Research Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fernando Capital — Financial Intelligence & Research Platform",
    description:
      "Independent Financial Intelligence, Equity Research & Deterministic Valuation Platform.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const versionInfo = getVersionInfo(false);

  return (
    <html lang="id" className="overflow-x-clip" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} min-h-screen bg-background text-foreground overflow-x-clip`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="fc-theme-v2"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Modern Shadcn Sidebar + Inset Command Center Shell */}
          <div className="flex min-h-screen w-full">
            <Sidebar appVersion={versionInfo.version} />
            <div className="flex-1 min-w-0 flex flex-col">
              <Header appVersion={versionInfo.version} />
              <main className="flex-1 min-w-0 w-full">
                <div className="mx-auto max-w-[1440px] py-6 px-3 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <SystemProvider initialVersion={versionInfo.version} />
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
