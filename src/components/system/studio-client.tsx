"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  AUTOMATION_DELEGATION_MATRIX,
  FIVE_AUTOMATED_SYSTEMS,
} from "@/lib/intelligence-data";
import type {
  ArticleStatus,
  ResearchArticleRecord,
  ResearchSourceItem,
} from "@/db/schema";
import type { ArticleStatusCounts } from "@/lib/research-cms";
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
  Plus,
  Search,
  Eye,
  Edit3,
  Archive,
  ExternalLink,
  Trash2,
  BookOpen,
} from "lucide-react";
import { formatRibuanInput } from "@/components/system/system-provider";
import { AdminLogoutButton } from "@/components/system/admin-login-card";
import {
  calculateAntamTierPricing,
  DEFAULT_ANTAM_1G_IDR,
  DEFAULT_GOLD_SPOT_USD,
  formatWibDateTime,
} from "@/lib/gold-pricing";
import { SafeMarkdown } from "@/lib/safe-markdown";
import { toast } from "sonner";

const CATEGORIES = [
  "01. Equity & Company Research",
  "02. Market Intelligence",
  "03. Economic Insights",
  "04. Financial Data & Tools",
  "05. Financial Knowledge",
] as const;

interface StudioProps {
  currentAntamPrice: number;
  currentGoldUsd: number;
  lastTimestamp: string;
  initialArticles?: ResearchArticleRecord[];
  initialCounts?: ArticleStatusCounts;
  initialTotal?: number;
  initialMigrationPending?: boolean;
}

interface ArticleFormState {
  id: number | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tagsText: string;
  status: ArticleStatus;
  featuredImage: string;
  sources: ResearchSourceItem[];
  methodology: string;
  author: string;
  seoTitle: string;
  seoDescription: string;
  approvedBy: string;
  humanConfirmed: boolean;
}

function getEmptyForm(): ArticleFormState {
  return {
    id: null,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: CATEGORIES[0],
    tagsText: "Riset Fundamental, Valuasi, Makroekonomi",
    status: "draft",
    featuredImage: "",
    sources: [
      {
        title: "Laporan Keuangan & Keterbukaan Informasi Emiten",
        publisher: "Bursa Efek Indonesia (BEI)",
        url: "https://www.idx.co.id",
        publishedDate: "2026-11-01",
        accessedDate: "2026-11-23",
      },
    ],
    methodology:
      "Analisis disusun menggunakan data laporan keuangan teraudit dan kalkulasi rasio deterministik yang diverifikasi oleh Editor Fernando Capital.",
    author: "Fernando Capital Editorial Board",
    seoTitle: "",
    seoDescription: "",
    approvedBy: "Managing Editor — Fernando Capital",
    humanConfirmed: false,
  };
}

function slugifyClient(input: string): string {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

export function StudioClient({
  currentAntamPrice,
  currentGoldUsd,
  lastTimestamp,
  initialArticles = [],
  initialCounts = { all: 0, draft: 0, review: 0, published: 0, archived: 0 },
  initialTotal = 0,
  initialMigrationPending = false,
}: StudioProps) {
  const effectiveAntam = currentAntamPrice > 0 ? Math.round(currentAntamPrice) : DEFAULT_ANTAM_1G_IDR;
  const effectiveUsd = currentGoldUsd > 0 ? currentGoldUsd : DEFAULT_GOLD_SPOT_USD;
  const antam10gTaxed = calculateAntamTierPricing(effectiveAntam, 10, 0.9815).taxPrice;

  // CMS State
  const [articles, setArticles] = useState<ResearchArticleRecord[]>(initialArticles);
  const [counts, setCounts] = useState<ArticleStatusCounts>(initialCounts);
  const [totalArticles, setTotalArticles] = useState<number>(initialTotal);
  const [migrationPending, setMigrationPending] = useState<boolean>(initialMigrationPending);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [loadingList, setLoadingList] = useState(false);

  // Editor & Preview State
  const [form, setForm] = useState<ArticleFormState>(getEmptyForm);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Interactive 6-Step Gold Research Workflow State
  const [activeStep, setActiveStep] = useState<number>(4);
  const [checks, setChecks] = useState({
    numbersVerified: true,
    macroValidated: true,
    methodologyAttached: true,
    disclaimerIncluded: true,
  });
  const [isApproved, setIsApproved] = useState(false);
  const [approving, setApproving] = useState(false);
  const [customEditorNote, setCustomEditorNote] = useState(
    "Tetap disiplin melakukan akumulasi bertahap (DCA) pada pecahan 5g–10g untuk meminimalkan spread premi fisik."
  );

  // --- Financial Data Engine Manual Sync State (Phase 3C-3, 3C-4 & 3D-2) ---
  const [syncingMarketData, setSyncingMarketData] = useState(false);
  const [marketSyncMessage, setMarketSyncMessage] = useState<string | null>(null);
  const [showSyncLogs, setShowSyncLogs] = useState(false);
  const [loadingSyncLogs, setLoadingSyncLogs] = useState(false);
  const [recentSyncLogs, setRecentSyncLogs] = useState<
    Array<{
      id: number;
      jobName: string;
      provider: string;
      status: string;
      recordsUpdated: number;
      durationMs: number;
      errorSummary: string | null;
      executedAt: string;
    }>
  >([]);
  const [usdIdrSnapshot, setUsdIdrSnapshot] = useState<{
    value: string | null;
    previousValue: string | null;
    asOfTimestamp: string | null;
    fetchedAt: string | null;
  } | null>(null);
  const [fredSnapshots, setFredSnapshots] = useState<{
    FED_FUNDS: { value: string | null; asOfTimestamp: string | null } | null;
    US_10Y: { value: string | null; asOfTimestamp: string | null } | null;
  }>({ FED_FUNDS: null, US_10Y: null });
  const [fredComplianceReason, setFredComplianceReason] = useState<string>(
    "DISABLED (Phase 3D-2A Legal & Compliance Review): FRED API Terms of Use prohibit storing/caching/archiving FRED Content in databases and prohibit use in connection with AI/ML/LLM systems."
  );

  const fetchMarketSyncHistory = useCallback(async () => {
    setLoadingSyncLogs(true);
    try {
      const res = await fetch("/api/admin/sync-market-data", {
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setRecentSyncLogs(Array.isArray(data.logs) ? data.logs : []);
        setUsdIdrSnapshot(data.indicator || null);
        if (data.indicators) {
          setFredSnapshots({
            FED_FUNDS: data.indicators.FED_FUNDS || null,
            US_10Y: data.indicators.US_10Y || null,
          });
        }
        if (data.providerStatus?.fred?.complianceReason) {
          setFredComplianceReason(String(data.providerStatus.fred.complianceReason));
        }
      }
    } catch {
      toast.error("Gagal memuat riwayat log sinkronisasi pasar.");
    } finally {
      setLoadingSyncLogs(false);
    }
  }, []);

  const handleMarketDataSync = async (
    dryRun: boolean,
    indicators: Array<"USD_IDR" | "FED_FUNDS" | "US_10Y"> = ["USD_IDR"]
  ) => {
    if (syncingMarketData) return;
    setSyncingMarketData(true);
    setMarketSyncMessage(null);
    try {
      const res = await fetch("/api/admin/sync-market-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indicators,
          dryRun,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        const msg = data?.error || "Gagal menjalankan sinkronisasi data pasar.";
        setMarketSyncMessage(msg);
        toast.error(msg);
        return;
      }

      const resultsList: Array<{
        indicatorCode: string;
        status: string;
        skipReason?: string;
        observation?: { value: string; observedAt: string } | null;
        indicatorSnapshot?: { value: string | null } | null;
      }> = Array.isArray(data.results) ? data.results : [];

      const skippedItems = resultsList.filter((r) => r.status === "skipped");
      if (skippedItems.length > 0 && skippedItems.length === resultsList.length) {
        const skipMsg = `Sinkronisasi Dilewati (${skippedItems.map((s) => s.indicatorCode).join(", ")}): ${
          skippedItems[0]?.skipReason || "FRED_API_KEY belum dikonfigurasi pada server."
        }`;
        setMarketSyncMessage(skipMsg);
        toast.info(skipMsg);
        if (showSyncLogs) {
          await fetchMarketSyncHistory();
        }
        return;
      }

      const itemSummaries = resultsList.map((item) => {
        const valText = item?.observation?.value || item?.indicatorSnapshot?.value || "-";
        const obsDate = item?.observation?.observedAt
          ? item.observation.observedAt.slice(0, 10)
          : "-";
        return `${item.indicatorCode}: ${valText} (${obsDate})`;
      });
      const summary = dryRun
        ? `Dry-Run Validasi Berhasil [${itemSummaries.join(" • ")}] (0 DB Write)`
        : `Sinkronisasi Live Berhasil [${itemSummaries.join(" • ")}] (Records Updated: ${data.totalRecordsUpdated ?? 0})`;
      setMarketSyncMessage(summary);
      toast.success(summary);
      if (!dryRun && showSyncLogs) {
        await fetchMarketSyncHistory();
      }
    } catch {
      const errText = "Gagal menghubungi endpoint /api/admin/sync-market-data.";
      setMarketSyncMessage(errText);
      toast.error(errText);
    } finally {
      setSyncingMarketData(false);
    }
  };

  const fetchArticles = useCallback(
    async (opts?: {
      nextPage?: number;
      nextSearch?: string;
      nextStatus?: string;
      nextCategory?: string;
    }) => {
      setLoadingList(true);
      const targetPage = opts?.nextPage ?? page;
      const targetSearch = opts?.nextSearch ?? searchQuery;
      const targetStatus = opts?.nextStatus ?? statusFilter;
      const targetCategory = opts?.nextCategory ?? categoryFilter;

      try {
        const params = new URLSearchParams({
          page: String(targetPage),
          pageSize: String(pageSize),
          search: targetSearch,
          status: targetStatus,
          category: targetCategory,
        });
        const res = await fetch(`/api/admin/articles?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setArticles(data.articles || []);
          setCounts(
            data.counts || { all: 0, draft: 0, review: 0, published: 0, archived: 0 }
          );
          setTotalArticles(Number(data.total) || 0);
          setMigrationPending(Boolean(data.migrationPending));
          setPage(targetPage);
        }
      } catch {
        toast.error("Gagal memuat daftar artikel dari server");
      } finally {
        setLoadingList(false);
      }
    },
    [page, pageSize, searchQuery, statusFilter, categoryFilter]
  );

  const handleCreateNew = () => {
    setForm(getEmptyForm());
    setEditorMode("write");
    setFeedbackBanner(null);
    const el = document.getElementById("cms-editor-panel");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLoadArticleIntoEditor = (art: ResearchArticleRecord) => {
    setForm({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      category: art.category,
      tagsText: Array.isArray(art.tags) ? art.tags.join(", ") : "",
      status: art.status,
      featuredImage: art.featuredImage || "",
      sources:
        Array.isArray(art.sources) && art.sources.length > 0
          ? art.sources
          : [
              {
                title: "",
                publisher: "",
                url: "",
                publishedDate: "",
                accessedDate: "",
              },
            ],
      methodology: art.methodology,
      author: art.author,
      seoTitle: art.seoTitle || "",
      seoDescription: art.seoDescription || "",
      approvedBy: art.approvedBy || "Managing Editor — Fernando Capital",
      humanConfirmed: false,
    });
    setEditorMode("write");
    setFeedbackBanner(null);
    const el = document.getElementById("cms-editor-panel");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveArticle = async (
    targetStatus: ArticleStatus,
    isExplicitPublish = false
  ) => {
    setFeedbackBanner(null);

    if (isExplicitPublish && form.status === "published" && form.id !== null) {
      const msg = "Artikel ini sudah berstatus Published (Terbit). Publikasi ganda dicegah.";
      setFeedbackBanner({ type: "error", message: msg });
      toast.error(msg);
      return;
    }

    if (targetStatus === "published" && !form.humanConfirmed) {
      const msg =
        "Wajib mencentang konfirmasi eksplisit Editor (30% Human Oversight) sebelum menerbitkan artikel ke publik.";
      setFeedbackBanner({ type: "error", message: msg });
      toast.error(msg);
      return;
    }

    setSavingAction(isExplicitPublish ? "publish" : targetStatus);

    const payload = {
      title: form.title,
      slug: form.slug || slugifyClient(form.title),
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      tags: form.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: targetStatus,
      featuredImage: form.featuredImage.trim() || null,
      sources: form.sources,
      methodology: form.methodology,
      author: form.author,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      approvedBy: form.approvedBy.trim() || form.author,
      humanConfirmed: form.humanConfirmed,
      action: isExplicitPublish ? "publish" : targetStatus,
    };

    try {
      const isUpdating = form.id !== null;
      const url = isUpdating ? `/api/admin/articles/${form.id}` : "/api/admin/articles";
      const method = isUpdating ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        const errMsg = data?.error || "Gagal menyimpan artikel.";
        setFeedbackBanner({ type: "error", message: errMsg });
        toast.error(errMsg);
        return;
      }

      const saved: ResearchArticleRecord = data.article;
      setForm((prev) => ({
        ...prev,
        id: saved.id,
        slug: saved.slug,
        status: saved.status,
        humanConfirmed: false,
      }));

      const actionLabel =
        targetStatus === "published"
          ? `Artikel "${saved.title}" berhasil disetujui & diterbitkan ke /research/${saved.slug}!`
          : targetStatus === "review"
            ? `Artikel "${saved.title}" dikirim ke antrean Review Editor.`
            : targetStatus === "archived"
              ? `Artikel "${saved.title}" telah diarsipkan dan ditarik dari halaman publik.`
              : `Draft "${saved.title}" berhasil disimpan ke database.`;

      setFeedbackBanner({ type: "success", message: actionLabel });
      toast.success(actionLabel);
      await fetchArticles();
    } catch {
      const errMsg = "Gagal menghubungi server CMS.";
      setFeedbackBanner({ type: "error", message: errMsg });
      toast.error(errMsg);
    } finally {
      setSavingAction(null);
    }
  };

  const handleQuickArchive = async (art: ResearchArticleRecord) => {
    try {
      const res = await fetch(`/api/admin/articles/${art.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived", action: "archive" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error || "Gagal mengarsipkan artikel");
        return;
      }
      if (form.id === art.id) {
        setForm((prev) => ({ ...prev, status: "archived" }));
      }
      toast.success(`Artikel "${art.title}" telah diarsipkan.`);
      await fetchArticles();
    } catch {
      toast.error("Gagal menghubungi server CMS");
    }
  };

  const handleDeleteArticle = async (art: ResearchArticleRecord) => {
    try {
      const res = await fetch(`/api/admin/articles/${art.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error || "Gagal menghapus artikel");
        return;
      }
      if (form.id === art.id) {
        setForm(getEmptyForm());
      }
      toast.success(`Artikel "${art.title}" telah dihapus.`);
      await fetchArticles();
    } catch {
      toast.error("Gagal menghapus artikel");
    }
  };

  const handleAddSourceRow = () => {
    setForm((prev) => ({
      ...prev,
      sources: [
        ...prev.sources,
        { title: "", publisher: "", url: "", publishedDate: "", accessedDate: "" },
      ],
    }));
  };

  const handleUpdateSourceRow = (
    idx: number,
    field: keyof ResearchSourceItem,
    value: string
  ) => {
    setForm((prev) => {
      const next = [...prev.sources];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, sources: next };
    });
  };

  const handleRemoveSourceRow = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== idx),
    }));
  };

  // 6-Step Gold Workflow approval handler
  const allChecked =
    checks.numbersVerified &&
    checks.macroValidated &&
    checks.methodologyAttached &&
    checks.disclaimerIncluded;

  const handleApprovePublish = async () => {
    if (!allChecked) {
      toast.error("Harap lengkapi seluruh ceklis validasi editor (Human Oversight) terlebih dahulu.");
      return;
    }
    setApproving(true);
    try {
      const res = await fetch("/api/admin/approve-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checks,
          editorNote: customEditorNote,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error || "Gagal memverifikasi persetujuan riset");
        return;
      }
      setIsApproved(true);
      setActiveStep(6);
      toast.success("Riset Emas Disetujui Editor & Siap Didistribusikan!", {
        description: "Artikel telah melewati gerbang Human Oversight 30% yang terverifikasi server.",
      });
    } catch {
      toast.error("Gagal menghubungi server persetujuan riset");
    } finally {
      setApproving(false);
    }
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

  const totalPages = Math.max(1, Math.ceil(totalArticles / pageSize));

  return (
    <div className="space-y-12 max-w-7xl mx-auto w-full pb-14">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered, Human-Supervised Editorial CMS
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Sesi Editor Terverifikasi
            </span>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Fernando Capital Editorial &amp; Research CMS Studio
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Kelola siklus penuh publikasi riset finansial (Draft → Review → Human Approval → Published →
              Archived). Tidak ada konten yang diterbitkan ke publik tanpa persetujuan eksplisit{" "}
              <strong className="text-foreground">30% Human Oversight</strong>.
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
          FINANCIAL DATA ENGINE MANUAL SYNC CONTROL (PHASE 3C-3 ADMIN ONLY)
      ===================================================================== */}
      <section className="rounded-2xl border border-[#C3A477]/50 bg-card p-5 md:p-6 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <Database className="w-3.5 h-3.5 text-[#C3A477]" />
              <span>Sistem Otomatis 03 • Financial Data Engine Ingestion</span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Sinkronisasi Terkontrol Indikator Pasar: USD_IDR (Frankfurter Ready) • FRED (Blocked — Legal Review)
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Menarik kurs referensi harian European Central Bank (ECB) melalui Frankfurter API v2
              ke <code>market_price_history</code> dan <code>market_indicators</code>. Integrasi
              otomatis FRED (<code>FED_FUNDS</code> / <code>DFF</code> &amp; <code>US_10Y</code> /{" "}
              <code>DGS10</code>) <strong>dinonaktifkan sementara (Blocked — Legal &amp; Compliance Review)</strong>{" "}
              karena pembatasan penyimpanan basis data dan penggunaan AI pada FRED Terms of Use.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={loadingSyncLogs}
              onClick={() => {
                const next = !showSyncLogs;
                setShowSyncLogs(next);
                if (next) {
                  void fetchMarketSyncHistory();
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/70 hover:border-[#C3A477] px-3.5 py-2 text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
            >
              <Activity className="w-3.5 h-3.5 text-[#C3A477]" />
              <span>{showSyncLogs ? "Sembunyikan Status & Log" : "Status Provider & Audit Log"}</span>
            </button>
            <button
              type="button"
              disabled={syncingMarketData}
              onClick={() => handleMarketDataSync(true, ["USD_IDR"])}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background hover:border-[#C3A477] px-3.5 py-2 text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C3A477]" />
              <span>Dry-Run USD_IDR</span>
            </button>
            <button
              type="button"
              disabled={syncingMarketData}
              onClick={() => handleMarketDataSync(false, ["USD_IDR"])}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingMarketData ? "animate-spin" : ""}`} />
              <span>Sync Live USD_IDR</span>
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-xs font-mono text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>Status Kepatuhan FRED (FED_FUNDS &amp; US_10Y): BLOCKED / LEGAL REVIEW.</strong>{" "}
            {fredComplianceReason}
          </div>
        </div>
        {marketSyncMessage && (
          <div className="rounded-xl border border-border bg-secondary/50 px-3.5 py-2.5 text-xs font-mono text-foreground">
            {marketSyncMessage}
          </div>
        )}
        {showSyncLogs && (
          <div className="rounded-xl border border-border bg-background/80 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
              <div className="space-y-1">
                <p className="font-mono font-bold uppercase tracking-wider text-foreground">
                  Status Provider &amp; Riwayat Sinkronisasi (automation_logs)
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  [Frankfurter: <strong className="text-emerald-600 dark:text-emerald-400">READY</strong>] USD_IDR:{" "}
                  <strong className="text-foreground">
                    {usdIdrSnapshot?.value ? `Rp ${usdIdrSnapshot.value}` : "NULL"}
                  </strong>{" "}
                  ({usdIdrSnapshot?.asOfTimestamp ? usdIdrSnapshot.asOfTimestamp.slice(0, 10) : "-"})
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  [FRED API:{" "}
                  <strong className="text-amber-600 dark:text-amber-400">
                    BLOCKED (Legal &amp; Compliance Review)
                  </strong>
                  ] FED_FUNDS (DFF):{" "}
                  <strong className="text-foreground">
                    {fredSnapshots.FED_FUNDS?.value ? `${fredSnapshots.FED_FUNDS.value}%` : "NULL"}
                  </strong>{" "}
                  • US_10Y (DGS10):{" "}
                  <strong className="text-foreground">
                    {fredSnapshots.US_10Y?.value ? `${fredSnapshots.US_10Y.value}%` : "NULL"}
                  </strong>
                </p>
              </div>
              <button
                type="button"
                disabled={loadingSyncLogs}
                onClick={() => void fetchMarketSyncHistory()}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:border-[#C3A477] px-2.5 py-1 text-[11px] font-mono font-semibold text-foreground"
              >
                <RefreshCw className={`w-3 h-3 ${loadingSyncLogs ? "animate-spin" : ""}`} />
                <span>Refresh Log</span>
              </button>
            </div>
            {recentSyncLogs.length === 0 ? (
              <p className="text-muted-foreground font-mono py-2">
                {loadingSyncLogs
                  ? "Memuat riwayat automation_logs..."
                  : "Belum ada catatan di automation_logs."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="text-muted-foreground uppercase border-b border-border">
                    <tr>
                      <th className="py-1.5 pr-3">ID</th>
                      <th className="py-1.5 pr-3">Job Name</th>
                      <th className="py-1.5 pr-3">Provider</th>
                      <th className="py-1.5 pr-3">Status</th>
                      <th className="py-1.5 pr-3">Updated</th>
                      <th className="py-1.5 pr-3">Duration</th>
                      <th className="py-1.5">Executed At (UTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {recentSyncLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-1.5 pr-3 font-bold">#{log.id}</td>
                        <td className="py-1.5 pr-3">{log.jobName}</td>
                        <td className="py-1.5 pr-3">{log.provider}</td>
                        <td className="py-1.5 pr-3">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              log.status === "success"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : "bg-destructive/15 text-destructive"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-1.5 pr-3">{log.recordsUpdated}</td>
                        <td className="py-1.5 pr-3">{log.durationMs}ms</td>
                        <td className="py-1.5 text-muted-foreground">
                          {log.executedAt.replace("T", " ").slice(0, 19)}Z
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================================
          BAGIAN UTAMA: DATABASE-BACKED RESEARCH CMS (PHASE 2)
      ===================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              PostgreSQL Research Repository • Sistem 02 &amp; 04
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              Manajemen Artikel &amp; Publikasi Riset (CMS)
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:border-[#C3A477] px-3.5 py-2.5 text-xs font-semibold text-foreground transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C3A477]" />
              <span>Lihat Direktori Publik (/research)</span>
            </Link>
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Artikel Riset Baru</span>
            </button>
          </div>
        </div>

        {/* Migration Pending Safety Banner */}
        {migrationPending && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                Migrasi Tabel <code>research_articles</code> Belum Diterapkan ke Database
              </p>
              <p>
                Sesuai kebijakan keamanan database (Task 0), file migrasi SQL telah dibuat di{" "}
                <code>drizzle/0000_careless_maverick.sql</code> tanpa memodifikasi database produksi secara
                otomatis. Jalankan migrasi pada branch database Neon Anda untuk mengaktifkan penyimpanan
                PostgreSQL.
              </p>
            </div>
          </div>
        )}

        {/* 1. Article Status Counts Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { key: "all", label: "Total Artikel", count: counts.all, badge: "Semua" },
            { key: "draft", label: "Draft", count: counts.draft, badge: "Konsep" },
            { key: "review", label: "In Review", count: counts.review, badge: "Verifikasi 30%" },
            { key: "published", label: "Published", count: counts.published, badge: "Terbit Publik" },
            { key: "archived", label: "Archived", count: counts.archived, badge: "Arsip" },
          ].map((stat) => {
            const active = statusFilter === stat.key;
            return (
              <button
                key={stat.key}
                type="button"
                onClick={() => {
                  setStatusFilter(stat.key);
                  fetchArticles({ nextStatus: stat.key, nextPage: 1 });
                }}
                className={`rounded-xl border p-4 text-left transition-all ${
                  active
                    ? "border-[#101B2C] dark:border-[#C3A477] bg-card shadow-sm ring-1 ring-[#C3A477]/40"
                    : "border-border bg-card/70 hover:border-[#C3A477]/50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{stat.label}</span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px]">
                    {stat.badge}
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono text-foreground mt-1.5">{stat.count}</p>
              </button>
            );
          })}
        </div>

        {/* 2. Search, Filters & Paginated Articles List */}
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-xs space-y-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchArticles({ nextSearch: searchQuery, nextPage: 1 });
                  }
                }}
                placeholder="Cari judul, slug, ringkasan, penulis..."
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  fetchArticles({ nextStatus: e.target.value, nextPage: 1 });
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
              >
                <option value="all">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="review">In Review (Menunggu Editor)</option>
                <option value="published">Published (Terbit)</option>
                <option value="archived">Archived (Arsip)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  fetchArticles({ nextCategory: e.target.value, nextPage: 1 });
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
              >
                <option value="all">Semua Pilar / Kategori</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <button
                type="button"
                onClick={() => fetchArticles({ nextPage: 1 })}
                disabled={loadingList}
                className="w-full h-full inline-flex items-center justify-center rounded-lg border border-border bg-secondary hover:border-[#C3A477] px-3 py-2 text-xs font-semibold text-foreground transition-colors"
                title="Segarkan Daftar"
              >
                <RefreshCw className={`w-4 h-4 ${loadingList ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Articles Table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/70 font-mono text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Judul &amp; Slug</th>
                  <th className="py-3 px-4">Kategori / Pilar</th>
                  <th className="py-3 px-4">Penulis</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tanggal Terbit / Update</th>
                  <th className="py-3 px-4 text-right">Aksi Editor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground text-xs">
                      Belum ada artikel riset yang cocok dengan filter saat ini. Gunakan formulir editor di
                      bawah untuk membuat dan menyimpan artikel baru.
                    </td>
                  </tr>
                ) : (
                  articles.map((art) => (
                    <tr key={art.id} className="hover:bg-secondary/35 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-foreground truncate">{art.title}</p>
                        <p className="text-[11px] font-mono text-muted-foreground truncate">
                          /research/{art.slug}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-foreground">{art.category}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">{art.author}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-mono font-semibold ${
                            art.status === "published"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                              : art.status === "review"
                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                : art.status === "archived"
                                  ? "bg-secondary text-muted-foreground border border-border"
                                  : "bg-[#C3A477]/20 text-foreground border border-[#C3A477]/40"
                          }`}
                        >
                          {art.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {art.publishedAt
                          ? formatWibDateTime(art.publishedAt)
                          : formatWibDateTime(art.updatedAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleLoadArticleIntoEditor(art)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background hover:border-[#C3A477] px-2.5 py-1 text-xs font-semibold text-foreground"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C3A477]" />
                            <span>Edit</span>
                          </button>
                          {art.status === "published" && (
                            <>
                              <Link
                                href={`/research/${art.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background hover:border-[#C3A477] px-2.5 py-1 text-xs font-semibold text-foreground"
                                title="Buka Halaman Publik"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleQuickArchive(art)}
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background hover:border-amber-500 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                title="Arsipkan Artikel"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {art.status !== "published" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteArticle(art)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background hover:border-destructive px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
                              title="Hapus Artikel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>
              Menampilkan {articles.length} dari {totalArticles} artikel (Halaman {page} / {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loadingList}
                onClick={() => fetchArticles({ nextPage: page - 1 })}
                className="rounded-lg border border-border bg-background hover:bg-secondary px-3 py-1.5 font-semibold text-foreground disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loadingList}
                onClick={() => fetchArticles({ nextPage: page + 1 })}
                className="rounded-lg border border-border bg-background hover:bg-secondary px-3 py-1.5 font-semibold text-foreground disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            3-8. ARTICLE EDITOR, LIVE SAFE MARKDOWN PREVIEW & HUMAN APPROVAL GATE
        =================================================================== */}
        <div
          id="cms-editor-panel"
          className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                  {form.id ? `EDIT ARTIKEL #${form.id}` : "ARTIKEL RISET BARU"}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                  Status Saat Ini: <strong>{form.status.toUpperCase()}</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {form.title || "Editor Riset & Publikasi Fernando Capital"}
              </h3>
            </div>

            {/* Write vs Preview Toggle */}
            <div className="inline-flex rounded-xl border border-border bg-secondary/60 p-1">
              <button
                type="button"
                onClick={() => setEditorMode("write")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  editorMode === "write"
                    ? "bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
                    : "text-foreground hover:bg-background/60"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorMode("preview")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  editorMode === "preview"
                    ? "bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C]"
                    : "text-foreground hover:bg-background/60"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Artikel (Safe Preview)</span>
              </button>
            </div>
          </div>

          {feedbackBanner && (
            <div
              className={`rounded-xl border p-4 text-xs font-medium flex items-center justify-between gap-3 ${
                feedbackBanner.type === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackBanner.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedbackBanner.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackBanner(null)}
                className="text-xs underline opacity-80 hover:opacity-100"
              >
                Tutup
              </button>
            </div>
          )}

          {editorMode === "write" ? (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left 8 Cols: Core Content, Sources & Methodology */}
              <div className="lg:col-span-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Judul Artikel Riset *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => {
                        const nextTitle = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          title: nextTitle,
                          slug: prev.id === null ? slugifyClient(nextTitle) : prev.slug,
                        }));
                      }}
                      placeholder="Contoh: Analisis Transmisi Suku Bunga Acuan terhadap Valuasi Perbankan..."
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:border-[#C3A477]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Slug URL (/research/[slug]) *
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, slug: slugifyClient(e.target.value) }))
                      }
                      placeholder="analisis-transmisi-suku-bunga"
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-[#C3A477]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Kategori / Pilar Utama *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Ringkasan Eksekutif (Excerpt) *
                  </label>
                  <textarea
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Ringkasan 1–2 kalimat mengenai temuan utama riset..."
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Isi Artikel Lengkap (Safe Markdown) *
                    </label>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Mendukung ## Heading, **Bold**, *Italic*, List, &gt; Quote, | Tabel |
                    </span>
                  </div>
                  <textarea
                    rows={11}
                    value={form.content}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Tulis isi analisis mendalam dalam format Markdown..."
                    className="w-full rounded-xl border border-border bg-background p-3.5 font-mono text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Metodologi Riset &amp; Asumsi Kalkulasi *
                  </label>
                  <textarea
                    rows={2}
                    value={form.methodology}
                    onChange={(e) => setForm((prev) => ({ ...prev, methodology: e.target.value }))}
                    placeholder="Jelaskan metodologi analisis, tanggal penarikan data, dan formula valuasi yang digunakan..."
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-[#C3A477]"
                  />
                </div>

                {/* Structured Sources List */}
                <div className="rounded-xl border border-border bg-secondary/35 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Daftar Sumber &amp; Referensi Terstruktur
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Setiap publikasi wajib mencantumkan sumber resmi, tanggal terbit, dan tanggal akses.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSourceRow}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:border-[#C3A477] px-2.5 py-1 text-xs font-semibold text-foreground"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C3A477]" />
                      <span>Tambah Sumber</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {form.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="grid gap-2 sm:grid-cols-12 rounded-lg border border-border bg-card p-3 text-xs"
                      >
                        <input
                          type="text"
                          value={src.title}
                          onChange={(e) => handleUpdateSourceRow(idx, "title", e.target.value)}
                          placeholder="Judul Dokumen / Data *"
                          className="sm:col-span-3 rounded border border-border bg-background px-2.5 py-1.5"
                        />
                        <input
                          type="text"
                          value={src.publisher}
                          onChange={(e) => handleUpdateSourceRow(idx, "publisher", e.target.value)}
                          placeholder="Institusi / Penerbit *"
                          className="sm:col-span-2 rounded border border-border bg-background px-2.5 py-1.5"
                        />
                        <input
                          type="text"
                          value={src.url}
                          onChange={(e) => handleUpdateSourceRow(idx, "url", e.target.value)}
                          placeholder="https://..."
                          className="sm:col-span-3 rounded border border-border bg-background px-2.5 py-1.5 font-mono"
                        />
                        <input
                          type="text"
                          value={src.publishedDate}
                          onChange={(e) =>
                            handleUpdateSourceRow(idx, "publishedDate", e.target.value)
                          }
                          placeholder="Tgl Rilis (YYYY-MM-DD)"
                          className="sm:col-span-2 rounded border border-border bg-background px-2 py-1.5 font-mono"
                        />
                        <div className="sm:col-span-2 flex items-center gap-1">
                          <input
                            type="text"
                            value={src.accessedDate}
                            onChange={(e) =>
                              handleUpdateSourceRow(idx, "accessedDate", e.target.value)
                            }
                            placeholder="Tgl Akses"
                            className="w-full rounded border border-border bg-background px-2 py-1.5 font-mono"
                          />
                          {form.sources.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSourceRow(idx)}
                              className="p-1 text-muted-foreground hover:text-destructive"
                              title="Hapus baris sumber"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Metadata, SEO & 30% Human Oversight Approval Gate */}
              <div className="lg:col-span-4 space-y-5">
                <div className="rounded-xl border border-border bg-background/70 p-4 space-y-3.5">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Atribut Editorial &amp; SEO
                  </p>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono text-muted-foreground">
                      Penulis / Tim Riset *
                    </label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono text-muted-foreground">
                      Tags (Pisahkan dengan koma)
                    </label>
                    <input
                      type="text"
                      value={form.tagsText}
                      onChange={(e) => setForm((prev) => ({ ...prev, tagsText: e.target.value }))}
                      placeholder="BBCA, Suku Bunga, Valuasi"
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono text-muted-foreground">
                      Featured Image Path / URL (Opsional)
                    </label>
                    <input
                      type="text"
                      value={form.featuredImage}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, featuredImage: e.target.value }))
                      }
                      placeholder="/logo.png atau https://..."
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-mono text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono text-muted-foreground">
                      SEO Title (Opsional)
                    </label>
                    <input
                      type="text"
                      value={form.seoTitle}
                      onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder="Default mengikuti judul artikel"
                      className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono text-muted-foreground">
                      SEO Meta Description (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.seoDescription}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, seoDescription: e.target.value }))
                      }
                      placeholder="Default mengikuti ringkasan (excerpt)"
                      className="w-full rounded-lg border border-border bg-card p-2.5 text-xs text-foreground"
                    />
                  </div>
                </div>

                {/* 30% Human Oversight Workflow Actions */}
                <div className="rounded-xl border border-[#C3A477]/50 bg-secondary/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                      <ShieldCheck className="w-4 h-4 text-[#C3A477]" />
                      Gerbang Publikasi (30% Human)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C3A477]/20 text-foreground">
                      Wajib Persetujuan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={savingAction !== null}
                      onClick={() => handleSaveArticle("draft", false)}
                      className="rounded-lg border border-border bg-card hover:border-[#C3A477] py-2 px-3 text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
                    >
                      {savingAction === "draft" ? "Menyimpan..." : "Simpan Draft"}
                    </button>
                    <button
                      type="button"
                      disabled={savingAction !== null}
                      onClick={() => handleSaveArticle("review", false)}
                      className="rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-2 px-3 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-colors disabled:opacity-50"
                    >
                      {savingAction === "review" ? "Mengirim..." : "Kirim ke Review"}
                    </button>
                  </div>

                  <div className="border-t border-border pt-3 space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-mono text-muted-foreground">
                        Disetujui Oleh (Editor Penanggung Jawab)
                      </label>
                      <input
                        type="text"
                        value={form.approvedBy}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, approvedBy: e.target.value }))
                        }
                        className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-3 cursor-pointer hover:border-[#C3A477] text-xs">
                      <input
                        type="checkbox"
                        checked={form.humanConfirmed}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, humanConfirmed: e.target.checked }))
                        }
                        className="mt-0.5 accent-[#101B2C]"
                      />
                      <span className="leading-snug text-foreground font-medium">
                        Saya (Editor) telah memverifikasi angka, sumber referensi, metodologi, dan
                        menyetujui publikasi artikel ini ke halaman publik.
                      </span>
                    </label>

                    <button
                      type="button"
                      disabled={
                        savingAction !== null ||
                        (form.status === "published" && form.id !== null)
                      }
                      onClick={() => handleSaveArticle("published", true)}
                      className="w-full rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xs"
                    >
                      {savingAction === "publish"
                        ? "Menerbitkan..."
                        : form.status === "published" && form.id !== null
                          ? "✓ Sudah Terbit (Publikasi Ganda Dicegah)"
                          : "Setujui & Terbitkan ke Publik"}
                    </button>

                    {form.id !== null && form.status === "published" && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          disabled={savingAction !== null}
                          onClick={() => handleSaveArticle("published", false)}
                          className="rounded-lg border border-border bg-card hover:border-[#C3A477] py-2 px-3 text-xs font-semibold text-foreground"
                        >
                          Perbarui Isi Terbitan
                        </button>
                        <button
                          type="button"
                          disabled={savingAction !== null}
                          onClick={() => handleSaveArticle("archived", false)}
                          className="rounded-lg border border-border bg-card hover:border-amber-500 py-2 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                          Arsipkan Artikel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* LIVE SAFE MARKDOWN PREVIEW */
            <div className="rounded-xl border border-border bg-background/80 p-6 md:p-8 space-y-6">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
                    {form.category}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    Oleh {form.author || "Editorial Board"}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {form.title || "Judul Artikel Belum Diisi"}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {form.excerpt || "Ringkasan artikel belum diisi."}
                </p>
              </div>

              <div className="prose max-w-none">
                <SafeMarkdown content={form.content || "*Belum ada isi konten Markdown.*"} />
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
                <p className="font-mono uppercase text-muted-foreground font-bold">
                  Metodologi Riset
                </p>
                <p className="text-foreground/90 leading-relaxed">{form.methodology}</p>
              </div>

              {form.sources.filter((s) => s.title || s.publisher).length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
                  <p className="font-mono uppercase text-muted-foreground font-bold">
                    Sumber &amp; Referensi
                  </p>
                  <ul className="space-y-1.5">
                    {form.sources
                      .filter((s) => s.title || s.publisher)
                      .map((s, i) => (
                        <li key={i} className="text-muted-foreground">
                          <strong className="text-foreground">{s.title}</strong> — {s.publisher}{" "}
                          (Rilis: {s.publishedDate || "-"}, Akses: {s.accessedDate || "-"})
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

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
                    Rp {formatRibuanInput(antam10gTaxed, true)}
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
                disabled={approving}
                className="w-full rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] py-3 px-4 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {approving
                  ? "Memverifikasi Persetujuan..."
                  : isApproved
                    ? "✓ Telah Disetujui & Diterbitkan ke CMS"
                    : "Setujui & Terbitkan Riset (Human Approved)"}
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
                { need: "Website Publishing & UI", tool: "Next.js 16 + Editorial Research CMS", status: "Aktif" },
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
