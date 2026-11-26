import type { Metadata } from "next";
import { Suspense } from "react";
import { getVersionInfo } from "@/lib/version";
import { isAdminAuthConfigured, isAdminAuthenticated } from "@/lib/auth";
import { SettingsClient } from "@/components/system/settings-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan & Versi Sistem | Fernando Capital",
  description: "Pengaturan tampilan, integrasi sistem, dan riwayat versi Fernando Capital.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function SettingsPage() {
  const isAdmin = await isAdminAuthenticated();
  const isAuthConfigured = isAdminAuthConfigured();
  const versionInfo = getVersionInfo(isAdmin);

  return (
    <Suspense fallback={<div className="py-10 text-center text-muted-foreground">Memuat pengaturan...</div>}>
      <SettingsClient
        initialVersionInfo={versionInfo}
        isAdmin={isAdmin}
        isAuthConfigured={isAuthConfigured}
      />
    </Suspense>
  );
}
