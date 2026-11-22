"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function formatRibuanInput(rawVal: string | number, isInitialLoad = false): string {
  let str: string;
  if (typeof rawVal === "number") {
    if (!Number.isFinite(rawVal)) return "";
    const rounded = Math.round(Math.abs(rawVal) * 100) / 100;
    str = String(rounded).replace(".", ",");
  } else {
    str = String(rawVal ?? "").trim();
  }
  if (!str) return "";

  if (isInitialLoad) {
    if (/^\d+\.0{1,2}$/.test(str)) {
      str = str.replace(/\.0{1,2}$/, "");
    } else if (/^\d+\.\d{1,2}$/.test(str)) {
      str = str.replace(".", ",");
    }
  }

  const value = str.replace(/[^,\d]/g, "");
  const parts = value.split(",");
  let intPart = parts[0].replace(/^0+(?=\d)/, "");
  if (intPart === "" && parts[1] !== undefined) intPart = "0";
  const sisa = intPart.length % 3;
  let rupiah = intPart.substr(0, sisa);
  const ribuan = intPart.substr(sisa).match(/\d{3}/gi);
  if (ribuan) {
    const separator = sisa ? "." : "";
    rupiah += separator + ribuan.join(".");
  }
  return parts[1] !== undefined ? `${rupiah},${parts[1].slice(0, 2)}` : rupiah;
}

export function parseRibuanInput(formatted: string): number {
  if (!formatted) return 0;
  const cleaned = String(formatted).replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function SystemProvider({ initialVersion }: { initialVersion: string }) {
  const router = useRouter();
  const [appVersion, setAppVersion] = useState(initialVersion);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  useEffect(() => {
    // Expose global formatRibuanInput helper like Treasury Flow
    (window as unknown as Record<string, unknown>).formatRibuanInput = formatRibuanInput;

    // 1. Register Dynamic Service Worker (/sw.js)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.update().catch(() => {});
        })
        .catch(() => {});
    }

    // 2. Background Auto-Update Version Polling (/api/version)
    let currentVer = initialVersion;
    const checkVersionUpdate = async () => {
      try {
        const res = await fetch("/api/version?mode=public", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.version && data.version !== currentVer) {
          currentVer = data.version;
          setAppVersion(data.version);
          if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            regs.forEach((r) => r.update());
          }
          toast.success(`Pembaruan Sistem v${data.version} Aktif`, {
            description: "Versi terbaru Fernando Capital telah disinkronkan secara otomatis.",
            action: {
              label: "Muat Ulang",
              onClick: () => window.location.reload(),
            },
          });
          router.refresh();
        }
      } catch {
        // silent background check
      }
    };

    const intervalId = window.setInterval(checkVersionUpdate, 60000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersionUpdate();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // 3. PWA beforeinstallprompt Banner
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const dismissed = sessionStorage.getItem("fc_pwa_dismissed");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) {
        setShowPwaBanner(true);
      }
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    // 4. Global Auto-Ribuan Input Delegation
    const onInput = (e: Event) => {
      const target = e.target as HTMLInputElement | null;
      if (
        target &&
        target.tagName === "INPUT" &&
        target.classList.contains("auto-ribuan") &&
        target.type !== "number"
      ) {
        target.value = formatRibuanInput(target.value, false);
      }
    };
    document.body.addEventListener("input", onInput);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      document.body.removeEventListener("input", onInput);
    };
  }, [initialVersion, router]);

  const handleInstallPwa = async () => {
    setShowPwaBanner(false);
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleClosePwa = () => {
    sessionStorage.setItem("fc_pwa_dismissed", "1");
    setShowPwaBanner(false);
  };

  return (
    <>
      {/* Watermark Footer ala Treasury Flow */}
      <footer className="w-full py-5 text-center mt-auto border-t border-border/30">
        <Link
          href="/settings?tab=version"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary tracking-widest font-medium uppercase transition-colors"
        >
          <span>Powered by Fernando Capital</span>
          <span>&bull;</span>
          <span className="font-mono normal-case tracking-normal rounded-full bg-muted/60 px-2 py-0.5 border border-border/60 text-foreground/80">
            v{appVersion}
          </span>
        </Link>
      </footer>

      {/* PWA Install Banner ala Treasury Flow */}
      {showPwaBanner && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur-2xl border-t border-primary/30 text-foreground flex flex-col sm:flex-row items-center justify-between z-[9999] rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-500">
          <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full max-w-7xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] dark:bg-[#1B2C45] border border-[#101B2C]/15 dark:border-[#C3A477]/45 p-1.5 shadow-sm flex items-center justify-center shrink-0">
              <Image
                src="/logo-navy.png"
                alt="Fernando Capital"
                width={96}
                height={34}
                className="w-full h-auto object-contain block dark:hidden"
              />
              <Image
                src="/logo-gold.png"
                alt="Fernando Capital"
                width={96}
                height={34}
                className="w-full h-auto object-contain hidden dark:block"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base">Install Fernando Capital</h3>
              <p className="text-xs text-muted-foreground">
                Akses lebih cepat, pembaruan otomatis, layaknya aplikasi native!
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClosePwa}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 font-medium text-sm transition-colors border border-border"
              >
                Nanti
              </button>
              <button
                type="button"
                onClick={handleInstallPwa}
                className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:scale-105 transition-transform"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
