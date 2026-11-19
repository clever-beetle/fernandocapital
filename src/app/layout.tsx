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
  metadataBase: new URL("https://fernando-capital.vercel.app"),
  title: "Fernando Capital | Premium Financial Dashboard",
  description: "Real-time gold tracker, stock ratio calculator, and financial news dashboard tailored for professional investors.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: ["/icon-192.png"],
  },
  openGraph: {
    title: "Fernando Capital",
    description: "Professional financial dashboard and real-time gold tracker.",
    type: "website",
    url: "https://fernando-capital.vercel.app",
    siteName: "Fernando Capital",
    images: [
      {
        url: "/logo.png",
        width: 574,
        height: 197,
        alt: "Fernando Capital Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fernando Capital",
    description: "Professional financial dashboard and real-time gold tracker.",
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
    <html lang="id" suppressHydrationWarning>
      <body className={`${jakarta.variable} flex min-h-screen flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header appVersion={versionInfo.version} />
          <main className="flex-1">
            <div className="container mx-auto py-8 px-4 md:px-8">
              {children}
            </div>
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
