import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fernando Capital | Premium Financial Dashboard",
  description: "Real-time gold tracker, stock ratio calculator, and financial news dashboard tailored for professional investors.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Fernando Capital",
    description: "Professional financial dashboard and real-time gold tracker.",
    type: "website",
    url: "https://fernando-capital.vercel.app",
    siteName: "Fernando Capital",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fernando Capital",
    description: "Professional financial dashboard and real-time gold tracker.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} flex min-h-screen flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">
            <div className="container mx-auto py-8 px-4 md:px-8">
              {children}
            </div>
          </main>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
