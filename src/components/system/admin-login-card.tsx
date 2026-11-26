"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";

export function AdminLoginCard({
  title = "Autentikasi Editor / Admin",
  description = "Masukkan kredensial Editor untuk mengakses kontrol administratif dan studio riset.",
  isConfigured = true,
  compact = false,
}: {
  title?: string;
  description?: string;
  isConfigured?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        const msg = data?.error || "Autentikasi gagal";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }

      setPassword("");
      toast.success("Sesi Editor / Admin terverifikasi");
      router.refresh();
    } catch {
      setErrorMsg("Gagal menghubungi server autentikasi");
      toast.error("Gagal menghubungi server autentikasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-sm ${
        compact ? "p-5 space-y-4" : "max-w-md mx-auto my-12 p-6 md:p-8 space-y-5"
      }`}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>Server-Verified Session</span>
        </div>
        <h2 className={`${compact ? "text-base" : "text-xl"} font-bold text-foreground`}>
          {title}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {!isConfigured ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Autentikasi Server Belum Dikonfigurasi</p>
            <p className="mt-0.5 opacity-90">
              Variabel lingkungan <code>ADMIN_PASSWORD</code> belum diatur pada server. Akses administratif
              ditutup secara otomatis (fail-closed).
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label
              htmlFor="editor-password"
              className="block text-xs font-mono uppercase tracking-wider text-muted-foreground"
            >
              Kata Sandi Editor (ADMIN_PASSWORD)
            </label>
            <input
              id="editor-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi editor..."
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? "Memverifikasi..." : "Masuk sebagai Editor"}</span>
          </button>
        </form>
      )}
    </div>
  );
}

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Sesi Editor telah diakhiri");
      router.refresh();
    } catch {
      toast.error("Gagal mengakhiri sesi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-accent hover:border-[#C3A477] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
    >
      <LogOut className="w-3.5 h-3.5 text-[#C3A477]" />
      <span>{loading ? "Keluar..." : "Keluar Sesi Editor"}</span>
    </button>
  );
}
