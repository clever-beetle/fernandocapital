import { Suspense } from "react";
import { getVersionInfo } from "@/lib/version";
import { SettingsClient } from "@/components/system/settings-client";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const versionInfo = getVersionInfo(true);

  return (
    <Suspense fallback={<div className="py-10 text-center text-muted-foreground">Memuat pengaturan...</div>}>
      <SettingsClient initialVersionInfo={versionInfo} />
    </Suspense>
  );
}
