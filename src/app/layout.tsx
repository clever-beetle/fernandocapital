import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { SystemProvider } from "@/components/system/system-provider";
import { getVersionInfo } from "@/lib/version";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fernandocapital.web.id"),
  title: "Fernando Capital | Financial Intelligence & Equity Research",
  description:
    "Independent Financial Intelligence, Equity Research & Deterministic Valuation Platform.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://fernandocapital.web.id",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: ["/icon-192.png"],
  },
  openGraph: {
    title: "Fernando Capital",
    description:
      "Independent Financial Intelligence, Equity Research & Deterministic Valuation Platform.",
    type: "website",
    url: "https://fernandocapital.web.id",
    siteName: "Fernando Capital",
    images: [
      {
        url: "/logo.png",
        width: 852,
        height: 306,
        alt: "Fernando Capital Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fernando Capital",
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
        className={`${jakarta.variable} flex min-h-screen flex-col bg-background text-foreground overflow-x-clip`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          storageKey="fc-theme-v2"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Header appVersion={versionInfo.version} />
          <main className="flex-1 min-w-0 w-full">
            <div className="container mx-auto py-8 px-4 md:px-8">{children}</div>
          </main>
          <SystemProvider initialVersion={versionInfo.version} />
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
