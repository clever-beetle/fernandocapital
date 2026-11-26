"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Palette,
  Blocks,
  Info,
  RefreshCw,
  Shield,
  ChevronRight,
  CheckCircle2,
  Sun,
  Moon,
  Laptop,
  Database,
  Sparkles,
  Lock,
} from "lucide-react";
import type { VersionInfo } from "@/lib/version";
import { AdminLoginCard, AdminLogoutButton } from "@/components/system/admin-login-card";
import { toast } from "sonner";

export function SettingsClient({
  initialVersionInfo,
  isAdmin = false,
  isAuthConfigured = true,
}: {
  initialVersionInfo: VersionInfo;
  isAdmin?: boolean;
  isAuthConfigured?: boolean;
}) {
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const currentTheme = isHydrated ? theme : "light";
  const tabParam = searchParams.get("tab");
  const initialTab: "appearance" | "integrations" | "version" =
    tabParam === "appearance" || tabParam === "integrations" || tabParam === "version"
      ? tabParam
      : "version";
  const [selectedTab, setSelectedTab] = useState<"appearance" | "integrations" | "version" | null>(
    null
  );
  const activeTab = selectedTab ?? initialTab;
  const setActiveTab = (tab: "appearance" | "integrations" | "version") => setSelectedTab(tab);

  const [fetchedVersionInfo, setFetchedVersionInfo] = useState<VersionInfo | null>(null);
  const versionInfo =
    fetchedVersionInfo && fetchedVersionInfo.is_detailed === initialVersionInfo.is_detailed
      ? fetchedVersionInfo
      : initialVersionInfo;
  const setVersionInfo = (info: VersionInfo) => setFetchedVersionInfo(info);

  const [showDevDetails, setShowDevDetails] = useState(true);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatusMsg, setUpdateStatusMsg] = useState("");
  const [syncingGold, setSyncingGold] = useState(false);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateStatusMsg("");
    try {
      const res = await fetch("/api/version", { cache: "no-store" });
      const data: VersionInfo = await res.json();
      if (data?.version) {
        setVersionInfo(data);
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        regs.forEach((reg) => reg.update());
      }
      setUpdateStatusMsg(`Sudah menggunakan versi terbaru (v${data?.version || versionInfo.version})`);
      toast.success(`Versi terbaru aktif (v${data?.version || versionInfo.version})`);
    } catch {
      setUpdateStatusMsg("Gagal memeriksa pembaruan");
      toast.error("Gagal memeriksa pembaruan");
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleManualGoldSync = async () => {
    if (!isAdmin) {
      toast.error("Autentikasi Editor/Admin diperlukan untuk menyinkronkan database.");
      return;
    }
    setSyncingGold(true);
    try {
      const res = await fetch("/api/admin/sync-gold", {
        method: "POST",
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        toast.success("Harga emas berhasil disinkronkan!", {
          description: "Spot XAU/USD & Estimasi Antam telah diperbarui di database.",
        });
      } else {
        toast.error("Sinkronisasi tidak dijalankan", {
          description: data?.error || "Periksa sesi autentikasi atau masa jeda cooldown.",
        });
      }
    } catch {
      toast.error("Gagal menghubungi server sinkronisasi");
    } finally {
      setSyncingGold(false);
    }
  };

  const handleClearPwaCache = async () => {
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update()));
      }
      toast.success("Cache PWA berhasil disegarkan!");
    } catch {
      toast.error("Gagal membersihkan cache");
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-12">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pengaturan</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Kelola preferensi tampilan publik, integrasi PWA, autentikasi editor, dan riwayat versi aplikasi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isAdmin && <AdminLogoutButton />}
          <button
            type="button"
            onClick={() => setActiveTab("version")}
            title="Lihat versi aplikasi & riwayat pembaruan"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors shadow-sm"
          >
            <Image
              src="/logo-navy.png"
              alt="Fernando Capital"
              width={40}
              height={14}
              className="h-3.5 w-auto object-contain block dark:hidden"
            />
            <Image
              src="/logo-gold.png"
              alt="Fernando Capital"
              width={40}
              height={14}
              className="h-3.5 w-auto object-contain hidden dark:block"
            />
            <span className="font-semibold">Versi v{versionInfo.version}</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="shrink-0 bg-border h-[1px] w-full my-6" />

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-10 lg:space-y-0">
        {/* Left Navigation Tabs */}
        <aside className="lg:w-1/4">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1.5 overflow-x-auto pb-2 lg:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("version")}
              className={`justify-start inline-flex items-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 w-auto whitespace-nowrap lg:w-full ${
                activeTab === "version"
                  ? "bg-muted text-foreground font-semibold shadow-sm"
                  : "hover:bg-accent/50 text-muted-foreground"
              }`}
            >
              <Info className="w-4 h-4 mr-2.5 text-primary" />
              Versi Aplikasi
              <span className="ml-auto hidden lg:inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                v{versionInfo.version}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={`justify-start inline-flex items-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 w-auto whitespace-nowrap lg:w-full ${
                activeTab === "appearance"
                  ? "bg-muted text-foreground font-semibold shadow-sm"
                  : "hover:bg-accent/50 text-muted-foreground"
              }`}
            >
              <Palette className="w-4 h-4 mr-2.5 text-amber-500" />
              Tampilan &amp; Sistem
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("integrations")}
              className={`justify-start inline-flex items-center rounded-lg text-sm font-medium transition-colors h-10 px-4 py-2 w-auto whitespace-nowrap lg:w-full ${
                activeTab === "integrations"
                  ? "bg-muted text-foreground font-semibold shadow-sm"
                  : "hover:bg-accent/50 text-muted-foreground"
              }`}
            >
              <Blocks className="w-4 h-4 mr-2.5 text-emerald-500" />
              Integrasi &amp; Admin
              <span
                className={`ml-auto hidden lg:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isAdmin
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isAdmin ? "Editor" : "Publik"}
              </span>
            </button>
          </nav>
        </aside>

        {/* Main Tab Content */}
        <div className="flex-1 lg:max-w-3xl">
          {/* TAB 1: VERSI APLIKASI */}
          {activeTab === "version" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-medium">Versi Aplikasi</h3>
                  <p className="text-sm text-muted-foreground">
                    Informasi versi Fernando Capital saat ini dan daftar riwayat rilis aplikasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckUpdate}
                  disabled={checkingUpdate}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-medium h-9 px-3 shadow-sm self-start sm:self-auto transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${checkingUpdate ? "animate-spin" : ""}`} />
                  <span>{checkingUpdate ? "Memeriksa..." : "Cek Pembaruan"}</span>
                </button>
              </div>

              <div className="shrink-0 bg-border h-[1px] w-full" />

              {/* Kartu Utama Informasi Versi */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border border-[#101B2C]/15 dark:border-[#C3A477]/45 bg-[#FAF7F0] dark:bg-[#1B2C45] p-2 shadow-sm">
                      <Image
                        src="/logo-navy.png"
                        alt="Logo Fernando Capital (Midnight Navy)"
                        width={100}
                        height={36}
                        className="h-full w-full object-contain block dark:hidden"
                      />
                      <Image
                        src="/logo-gold.png"
                        alt="Logo Fernando Capital (Champagne Gold)"
                        width={100}
                        height={36}
                        className="h-full w-full object-contain hidden dark:block"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-foreground">Fernando Capital</h4>
                        <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          v{versionInfo.version}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Auto-Update Aktif
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin && showDevDetails && versionInfo.is_detailed
                          ? versionInfo.codename
                          : "Rilis Stabil • Pembaruan Otomatis Aktif"}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                      Pembaruan Terakhir
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {versionInfo.release_date_id || versionInfo.release_date}
                    </p>
                  </div>
                </div>
                {updateStatusMsg && (
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-2 border-t border-border/60 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {updateStatusMsg}
                  </p>
                )}
              </div>

              {/* Daftar Riwayat Pembaruan */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">Riwayat Pembaruan</h4>
                    <span className="text-xs text-muted-foreground">
                      ({versionInfo.history.length} versi tercatat)
                    </span>
                  </div>
                  {isAdmin && versionInfo.is_detailed && (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-300"
                        title="Rincian perubahan hanya terlihat oleh sesi Editor/Admin terverifikasi"
                      >
                        <Shield className="w-3 h-3" /> Khusus Editor / Developer
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDevDetails((prev) => !prev)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background hover:bg-accent px-2.5 py-1 text-xs font-medium text-foreground transition-colors"
                      >
                        <span>{showDevDetails ? "Lihat Tampilan Publik" : "Tampilkan Detail Dev"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Tampilan Detail Khusus Editor / Admin (Server-Verified Only) */}
                {isAdmin && versionInfo.is_detailed && showDevDetails ? (
                  <div className="space-y-3">
                    {versionInfo.history.map((rel, idx) => {
                      const isFirst = idx === 0;
                      return (
                        <div
                          key={rel.version}
                          className={`rounded-xl border p-4 sm:p-5 shadow-sm space-y-2.5 transition-colors ${
                            isFirst ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-card"
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                                  isFirst
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground border border-border"
                                }`}
                              >
                                v{rel.version}
                              </span>
                              <span className="text-sm font-semibold text-foreground">{rel.title}</span>
                              {isFirst && (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                                  Terkini
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{rel.date_id}</span>
                          </div>
                          {rel.highlights && rel.highlights.length > 0 && (
                            <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                              {rel.highlights.map((item, hIdx) => (
                                <li key={hIdx} className="flex items-start gap-2">
                                  <span
                                    className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                                      isFirst ? "bg-primary" : "bg-muted-foreground/50"
                                    }`}
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Tampilan Ringkas untuk Pengguna Publik */
                  <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
                    {versionInfo.history.map((rel, idx) => {
                      const isFirst = idx === 0;
                      return (
                        <div
                          key={rel.version}
                          className={`flex items-center justify-between gap-3 px-4 py-3 text-xs sm:text-sm ${
                            isFirst ? "bg-primary/[0.03]" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                                isFirst
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground border border-border"
                              }`}
                            >
                              v{rel.version}
                            </span>
                            <span className="font-medium text-foreground">
                              {isFirst ? "Versi Aktif Saat Ini" : "Rilis Stabil"}
                            </span>
                            {isFirst && (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                                Terkini
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">{rel.date_id}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TAMPILAN & SISTEM (Preferensi Publik) */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Tampilan &amp; Sistem</h3>
                <p className="text-sm text-muted-foreground">
                  Sesuaikan tema antarmuka perangkat Anda dan lihat standar palet warna Fernando Capital.
                </p>
              </div>
              <div className="shrink-0 bg-border h-[1px] w-full" />

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Mode Tema Layar</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all ${
                        currentTheme === "light"
                          ? "border-[#C3A477] bg-[#C3A477]/15 text-foreground font-semibold"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      <Sun className="w-5 h-5 text-[#C3A477]" />
                      <span>Warm Ivory (Utama)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all ${
                        currentTheme === "dark"
                          ? "border-[#C3A477] bg-[#C3A477]/15 text-foreground font-semibold"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      <Moon className="w-5 h-5 text-[#C3A477]" />
                      <span>Midnight Navy (Gelap)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all ${
                        currentTheme === "system"
                          ? "border-[#C3A477] bg-[#C3A477]/15 text-foreground font-semibold"
                          : "border-border bg-background hover:bg-accent"
                      }`}
                    >
                      <Laptop className="w-5 h-5 text-muted-foreground" />
                      <span>Sistem</span>
                    </button>
                  </div>
                </div>

                <div className="shrink-0 bg-border/60 h-[1px] w-full" />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Palet Warna Resmi Fernando Capital</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {[
                      { name: "Midnight Navy", role: "Logo Utama / Dark BG", hex: "#101B2C" },
                      { name: "Champagne Gold", role: "Logo Alternatif / Aksen", hex: "#C3A477" },
                      { name: "Warm Ivory", role: "Background Utama", hex: "#F4F0E7" },
                      { name: "Graphite", role: "Teks Utama", hex: "#242A32" },
                      { name: "Muted Taupe", role: "Elemen Pendukung", hex: "#8C8275" },
                      { name: "Silver Mist", role: "Elemen Pendukung", hex: "#D8E0E8" },
                    ].map((swatch) => (
                      <div
                        key={swatch.name}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-background/70 p-2"
                      >
                        <span
                          className="h-7 w-7 rounded-md border border-black/15 shrink-0 shadow-xs"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{swatch.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {swatch.hex} • {swatch.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 bg-border/60 h-[1px] w-full" />

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-foreground">Format Titik Ribuan Otomatis</h4>
                    <p className="text-xs text-muted-foreground">
                      Menata titik pemisah ribuan Rupiah secara otomatis saat mengetik di seluruh kalkulator.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTEGRASI & ADMIN */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Integrasi &amp; Kontrol Administratif</h3>
                <p className="text-sm text-muted-foreground">
                  Manajemen cache PWA perangkat serta kontrol sinkronisasi database khusus Editor/Admin terverifikasi.
                </p>
              </div>
              <div className="shrink-0 bg-border h-[1px] w-full" />

              {/* Public Client-Side PWA Cache Refresh */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <h4 className="text-sm font-semibold text-foreground">
                        Service Worker &amp; Cache PWA (fernandocapital-v{versionInfo.version})
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bersihkan cache statis lama di perangkat ini dan muat ulang aset versi terbaru dari server.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearPwaCache}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-accent px-4 py-2 text-xs font-medium shadow-sm transition-colors shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Segarkan Cache PWA</span>
                  </button>
                </div>
              </div>

              {/* Protected Administrative Section */}
              {isAdmin ? (
                <div className="rounded-xl border border-[#C3A477]/50 bg-card p-6 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#C3A477]" />
                      <h4 className="text-sm font-bold text-foreground">
                        Panel Kontrol Editor Terverifikasi
                      </h4>
                    </div>
                    <AdminLogoutButton />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold text-foreground">
                          Sinkronisasi Manual Harga Emas Global &amp; Antam
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tarik data spot XAU/USD &amp; kurs USD/IDR terbaru ke database Neon PostgreSQL
                        (dilindungi batas cooldown 60 detik &amp; deduplikasi otomatis).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleManualGoldSync}
                      disabled={syncingGold}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-xs font-semibold shadow-sm transition-colors disabled:opacity-60 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingGold ? "animate-spin" : ""}`} />
                      <span>{syncingGold ? "Menyinkronkan..." : "Sinkronkan Sekarang"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    <Lock className="w-3.5 h-3.5 text-[#C3A477]" />
                    <span>Operasi Administratif Terkunci</span>
                  </div>
                  <AdminLoginCard
                    compact
                    isConfigured={isAuthConfigured}
                    title="Login Editor untuk Kontrol Database & Detail Versi"
                    description="Sinkronisasi manual database harga emas dan rincian teknis riwayat versi dilindungi oleh sesi HTTP-only yang diverifikasi di server."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
