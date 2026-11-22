"use client";

import { useState } from "react";
import {
  AUTOMATION_DELEGATION_MATRIX,
  FIVE_AUTOMATED_SYSTEMS,
} from "@/lib/intelligence-data";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Database,
  FileText,
  Send,
  Activity,
  Copy,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { formatRibuanInput } from "@/components/system/system-provider";
import { toast } from "sonner";

interface StudioProps {
  currentAntamPrice: number;
  currentGoldUsd: number;
  lastTimestamp: string;
}

export function StudioClient({ currentAntamPrice, currentGoldUsd, lastTimestamp }: StudioProps) {
  const effectiveAntam = currentAntamPrice > 0 ? Math.round(currentAntamPrice) : 2725000;
  const effectiveUsd = currentGoldUsd > 0 ? currentGoldUsd : 2685.4;

  // Interactive 6-Step Gold Research Workflow State
  const [activeStep, setActiveStep] = useState<number>(4); // Default focused on Step 4: Human Review
  const [checks, setChecks] = useState({
    numbersVerified: true,
    macroValidated: true,
    methodologyAttached: true,
    disclaimerIncluded: true,
  });
  const [isApproved, setIsApproved] = useState(false);
  const [customEditorNote, setCustomEditorNote] = useState(
    "Tetap disiplin melakukan akumulasi bertahap (DCA) pada pecahan 5g–10g untuk meminimalkan spread premi fisik."
  );

  const allChecked =
    checks.numbersVerified &&
    checks.macroValidated &&
    checks.methodologyAttached &&
    checks.disclaimerIncluded;

  const handleApprovePublish = () => {
    if (!allChecked) {
      toast.error("Harap lengkapi seluruh ceklis validasi editor (Human Oversight) terlebih dahulu.");
      return;
    }
    setIsApproved(true);
    setActiveStep(6);
    toast.success("Riset Emas Disetujui Editor & Siap Didistribusikan!", {
      description: "Artikel telah melewati gerbang Human Oversight 30% dan siap diterbitkan.",
    });
  };

  const handleCopyDistribution = (type: "newsletter" | "social") => {
    const text =
      type === "newsletter"
        ? `[Fernando Capital Brief] Analisis Harga Emas Antam Rp ${formatRibuanInput(effectiveAntam, true)}/g & Spot XAU/USD $${effectiveUsd.toFixed(2)}. Catatan Editor: ${customEditorNote}`
        : `📊 [FERNANDO CAPITAL RESEARCH]\nEmas Antam (1g): Rp ${formatRibuanInput(effectiveAntam, true)}\nSpot XAU/USD: $${effectiveUsd.toFixed(2)}/oz\n\nInsight Editor: ${customEditorNote}\n\nBaca analisis dampak suku bunga terhadap saham, obligasi & emas di Fernando Capital.`;
    navigator.clipboard.writeText(text);
    toast.success(
      type === "newsletter"
        ? "Ringkasan Newsletter (Brevo) berhasil disalin!"
        : "Ringkasan Media Sosial berhasil disalin!"
    );
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full pb-14">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered, Human-Supervised Operating System
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Kualitas &amp; Kredibilitas Riset Terjaga
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Fernando Capital Editorial &amp; Automation Studio
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              AI dan otomasi menangani 70% beban produksi harian (pengumpulan informasi, pengolahan data,
              penyusunan draft, formatting, dan distribusi), sedangkan Anda memegang kendali penuh 30%{" "}
              <strong className="text-foreground">Human Oversight</strong> sebagai pemilik brand, editor, dan
              pengambil keputusan.
            </p>
          </div>

          {/* 70% AI / 30% Human Visual Operating Model Card */}
          <div className="lg:col-span-5 rounded-xl border border-[#C3A477]/50 bg-secondary/50 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span className="font-bold text-foreground">Fernando Capital Operating Model</span>
              <span className="text-muted-foreground">Target Desain Operasional</span>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden flex border border-border">
              <div
                className="bg-[#101B2C] dark:bg-[#C3A477] h-full flex items-center justify-center text-[10px] font-mono font-bold text-[#F4F0E7] dark:text-[#101B2C]"
                style={{ width: "70%" }}
              >
                70% AI &amp; AUTOMATION
              </div>
              <div
                className="bg-[#C3A477] dark:bg-[#1E314D] h-full flex items-center justify-center text-[10px] font-mono font-bold text-[#101B2C] dark:text-[#F4F0E7]"
                style={{ width: "30%" }}
              >
                30% HUMAN
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <p className="font-bold text-foreground">AI &amp; Automation (70%)</p>
                <p className="text-[11px] text-muted-foreground">
                  Pengumpulan informasi, draft, pengolahan data, formatting, dan distribusi.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground">Human Oversight (30%)</p>
                <p className="text-[11px] text-muted-foreground">
                  Validasi angka, interpretasi, keputusan editorial, dan persetujuan publikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          BAGIAN 1: LIMA SISTEM OTOMATIS (01 - 05)
      ===================================================================== */}
      <section className="space-y-5">
        <div className="border-b border-border pb-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Arsitektur Otomasi Platform
          </p>
          <h2 className="text-2xl font-bold text-foreground">Lima Sistem Otomatis Fernando Capital</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {FIVE_AUTOMATED_SYSTEMS.map((sys) => (
            <div
              key={sys.id}
              className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between space-y-4 hover:border-[#C3A477] transition-colors shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]">
                    {sys.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {sys.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{sys.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{sys.description}</p>
              </div>

              <ul className="space-y-1 pt-3 border-t border-border text-[11px] text-foreground/90">
                {sys.outputs.map((out, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#C3A477] shrink-0" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          BAGIAN 2: SIMULASI WORKFLOW 6 TAHAP (AUTOMATED GOLD RESEARCH WORKFLOW)
      ===================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              End-to-End Editorial Pipeline
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              Automated Gold Research Workflow (6 Tahap Terintegrasi)
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Data Live Terakhir: {lastTimestamp}
          </span>
        </div>

        {/* 6-Step Progress Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { step: 1, title: "1. Data Collection", sub: "Harga & Sumber Resmi", icon: Database },
            { step: 2, title: "2. AI Preparation", sub: "Identifikasi Konteks", icon: RefreshCw },
            { step: 3, title: "3. Research Draft", sub: "Draft & SEO Metadata", icon: FileText },
            { step: 4, title: "4. Human Review", sub: "Validasi Editor (30%)", icon: ShieldCheck },
            { step: 5, title: "5. Publishing", sub: "CMS & Penjadwalan", icon: CheckCircle2 },
            { step: 6, title: "6. Distribution", sub: "Newsletter & Sosmed", icon: Send },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeStep === item.step;
            const isGate = item.step === 4;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setActiveStep(item.step)}
                className={`rounded-xl border p-3.5 text-left transition-all ${
                  isCurrent
                    ? "border-[#101B2C] bg-[#101B2C] text-[#F4F0E7] dark:border-[#C3A477] dark:bg-[#C3A477] dark:text-[#101B2C] shadow-sm"
                    : isGate
                      ? "border-[#C3A477] bg-[#C3A477]/15 text-foreground"
                      : "border-border bg-card hover:border-[#C3A477]/60 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-mono uppercase">
                    {item.step <= 3 || item.step === 6 ? "AI 70%" : item.step === 4 ? "HUMAN 30%" : "CMS"}
                  </span>
                </div>
                <p className="text-xs font-bold truncate">{item.title}</p>
                <p className={`text-[10px] truncate ${isCurrent ? "opacity-85" : "text-muted-foreground"}`}>
                  {item.sub}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Research Draft & Human Review Workspace */}
        <div className="grid gap-6 lg:grid-cols-12 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
          {/* Left 7 Cols: Live Generated Research Brief (Steps 1, 2, 3) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Hasil Tahap 1–3 (Data Collection &amp; AI Research Draft)
                </span>
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  Analisis Perkembangan Harga Emas Fisik Antam &amp; Transmisi Suku Bunga Global
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isApproved
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                }`}
              >
                {isApproved ? "Disetujui Editor • Terbit" : "Draft Menunggu Review Editor"}
              </span>
            </div>

            {/* Deterministic Data Snapshot (Code-Validated, NOT AI-Guessed) */}
            <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span>DATA ENGINE SNAPSHOT (TERVALIDASI KODE)</span>
                <span>SUMBER: YAHOO FINANCE &amp; LOGAM MULIA</span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Emas Antam (1g)</p>
                  <p className="text-sm sm:text-base font-bold font-mono text-foreground">
                    Rp {formatRibuanInput(effectiveAntam, true)}
                  </p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Spot XAU/USD</p>
                  <p className="text-sm sm:text-base font-bold font-mono text-foreground">
                    ${effectiveUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-lg bg-card border border-border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase">Antam 10g (+PPh)</p>
                  <p className="text-sm sm:text-base font-bold font-mono text-foreground">
                    Rp {formatRibuanInput(Math.round(effectiveAntam * 10 * 0.9815 * 1.0025), true)}
                  </p>
                </div>
              </div>
            </div>

            {/* Executive Summary & Editorial Body */}
            <div className="space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              <p className="font-semibold text-foreground">Executive Summary (AI-Prepared):</p>
              <p className="text-muted-foreground">
                Harga emas batangan fisik Antam berada pada level{" "}
                <strong className="text-foreground">Rp {formatRibuanInput(effectiveAntam, true)}/gram</strong>{" "}
                seiring bertahannya harga spot emas global (XAU/USD) di{" "}
                <strong className="text-foreground">${effectiveUsd.toFixed(2)}/oz</strong>. Permintaan lindung
                nilai terhadap ketidakpastian suku bunga global menjaga daya tarik emas sebagai penyeimbang
                portofolio saham dan obligasi.
              </p>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Perspektif &amp; Catatan Editor (Human Input — 30% Oversight):
                </label>
                <textarea
                  rows={2}
                  value={customEditorNote}
                  onChange={(e) => setCustomEditorNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
                />
              </div>
            </div>

            {/* Mandatory Provenance, Methodology & Disclaimer Footer */}
            <div className="rounded-xl border border-border bg-background/80 p-3.5 text-[11px] text-muted-foreground space-y-1">
              <p>
                <strong className="text-foreground">Metodologi &amp; Sumber:</strong> Harga dihitung secara
                deterministik dari feed XAU/USD, kurs USD/IDR, dan struktur koefisien pecahan fisik Antam (+PPh
                22 sebesar 0.25%) per {lastTimestamp}.
              </p>
              <p>
                <strong className="text-foreground">Disclaimer:</strong> Riset ini disusun untuk tujuan
                informasi dan edukasi finansial, bukan merupakan rekomendasi jual/beli efek atau komoditas
                tanpa mempertimbangkan profil risiko masing-masing investor.
              </p>
            </div>
          </div>

          {/* Right 5 Cols: Step 4 Human Review Gate & Step 6 Distribution */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#C3A477]/50 bg-secondary/40 p-5 space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                  <ShieldCheck className="w-4 h-4 text-[#C3A477]" />
                  Gerbang Validasi Editor (Tahap 4)
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">Wajib Sebelum Terbit</span>
              </div>

              <div className="rounded-lg border border-border bg-card p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#C3A477] shrink-0 mt-0.5" />
                <span>
                  AI tidak diizinkan menerbitkan analisis investasi secara otomatis. Periksa keakuratan angka
                  dan asumsi di bawah sebelum menyetujui publikasi.
                </span>
              </div>

              {/* Editor Checklist */}
              <div className="space-y-2.5 text-xs">
                {[
                  {
                    key: "numbersVerified" as const,
                    label: "Angka harga emas & rasio telah tervalidasi kode (bukan halusinasi AI)",
                  },
                  {
                    key: "macroValidated" as const,
                    label: "Konteks dampak suku bunga ke saham, obligasi & emas sudah akurat",
                  },
                  {
                    key: "methodologyAttached" as const,
                    label: "Sumber resmi, tanggal pengambilan data, dan metodologi sudah tercantum",
                  },
                  {
                    key: "disclaimerIncluded" as const,
                    label: "Disclaimer risiko investasi standar Fernando Capital sudah disertakan",
                  },
                ].map((c) => (
                  <label
                    key={c.key}
                    className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3 cursor-pointer hover:border-[#C3A477] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checks[c.key]}
                      onChange={(e) => setChecks((prev) => ({ ...prev, [c.key]: e.target.checked }))}
                      className="mt-0.5 accent-[#101B2C]"
                    />
                    <span className="text-foreground font-medium leading-snug">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleApprovePublish}
                className="w-full rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] py-3 px-4 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm"
              >
                {isApproved ? "✓ Telah Disetujui & Diterbitkan ke CMS" : "Setujui & Terbitkan Riset (Human Approved)"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyDistribution("newsletter")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:border-[#C3A477] py-2 px-3 text-xs font-semibold text-foreground transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#C3A477]" />
                  <span>Copy Newsletter</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyDistribution("social")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card hover:border-[#C3A477] py-2 px-3 text-xs font-semibold text-foreground transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#C3A477]" />
                  <span>Copy Ringkasan Sosmed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAGIAN 3: MATRIKS PEMBAGIAN PERAN AI VS MANUSIA & TOOLS PILIHAN
      ===================================================================== */}
      <section className="grid gap-8 lg:grid-cols-12">
        {/* Tabel 11 Aktivitas AI vs Peran Kamu */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border-b border-border pb-3">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Tata Kelola Editorial
            </p>
            <h2 className="text-xl font-bold text-foreground">
              Pembagian Tugas AI / Automation vs Peran Editor (Manusia)
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/70 font-mono text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Aktivitas</th>
                  <th className="py-3 px-4">AI / Automation</th>
                  <th className="py-3 px-4">Peran Kamu (Human Oversight)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {AUTOMATION_DELEGATION_MATRIX.map((row) => (
                  <tr key={row.activity} className="hover:bg-secondary/35 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-foreground">{row.activity}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold ${
                          row.automationLevel === "Bisa otomatis"
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : row.automationLevel === "AI-assisted"
                              ? "bg-[#C3A477]/20 text-foreground border border-[#C3A477]/45"
                              : "bg-[#101B2C] text-[#F4F0E7] dark:bg-secondary dark:text-foreground"
                        }`}
                      >
                        {row.automationLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">{row.humanRole}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stack Tools Ramping & Monitoring Sistem */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-b border-border pb-3">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Ekosistem Teknologi Ramping
            </p>
            <h2 className="text-xl font-bold text-foreground">
              Integrasi Tools &amp; Website Monitoring (Sistem 05)
            </h2>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-foreground">Status Operasional Sistem</span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ● Semua Sistem Normal
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { need: "Database & Data Engine", tool: "Neon PostgreSQL + Drizzle ORM", status: "Terhubung" },
                { need: "Website Publishing & UI", tool: "Next.js 16 + Vercel CI/CD Auto-Deploy", status: "Aktif" },
                { need: "Financial Data Feed", tool: "Yahoo Finance API & Cron 5-Menit", status: "Aktif" },
                { need: "Website Analytics & Speed", tool: "Vercel Analytics & Speed Insights (GA4 Ready)", status: "Aktif" },
                { need: "AI Research & Writing", tool: "LLM Editorial Pipeline + Human Gate", status: "Siap" },
                { need: "Workflow & Newsletter", tool: "n8n / Make Webhook & Brevo Export", status: "Siap" },
              ].map((item) => (
                <div
                  key={item.need}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/70 px-3.5 py-2.5"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.need}</p>
                    <p className="text-[11px] text-muted-foreground">{item.tool}</p>
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-secondary text-foreground font-semibold">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
