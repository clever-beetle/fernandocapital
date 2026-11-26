import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/research-cms";
import { formatWibDateTime } from "@/lib/gold-pricing";
import {
  ArrowUpRight,
  BookOpen,
  ShieldCheck,
  Clock,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riset & Publikasi Finansial | Fernando Capital",
  description:
    "Kumpulan analisis perusahaan, riset makroekonomi, intelijen pasar, dan edukasi finansial yang telah diverifikasi oleh Editor Fernando Capital.",
  alternates: {
    canonical: "https://fernandocapital.web.id/research",
  },
  openGraph: {
    title: "Riset & Publikasi Finansial | Fernando Capital",
    description:
      "Analisis fundamental saham, makroekonomi, dan komoditas emas dengan standar Human-Supervised Financial Intelligence.",
    url: "https://fernandocapital.web.id/research",
    siteName: "Fernando Capital",
    type: "website",
  },
};

export default async function ResearchDirectoryPage() {
  const articles = await getPublishedArticles(50);

  return (
    <div className="max-w-7xl mx-auto w-full pb-14 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="px-2.5 py-0.5 rounded bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
              PUBLIC RESEARCH ARCHIVE
            </span>
            <span>AI-Assisted • 30% Human-Supervised</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Riset &amp; Publikasi Editorial Fernando Capital
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
            Setiap publikasi di bawah ini telah melalui verifikasi angka, sumber referensi resmi, dan
            persetujuan editor sebelum diterbitkan ke publik.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 self-start md:self-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{articles.length} Publikasi Terverifikasi</span>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-foreground">
            <BookOpen className="w-6 h-6 text-[#C3A477]" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Belum Ada Artikel Riset yang Diterbitkan ke Publik
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Sesuai standar kredibilitas Fernando Capital (30% Human Oversight), artikel hanya tampil di
            halaman ini setelah disetujui secara eksplisit oleh Editor melalui{" "}
            <strong className="text-foreground">AI Research &amp; Editorial Studio</strong>.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              <span>Jelajahi 5 Pilar di Beranda</span>
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background hover:border-[#C3A477] px-4 py-2.5 text-xs font-semibold text-foreground"
            >
              <span>Buka Kalkulator Finansial</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/research/${art.slug}`}
              className="group rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-5 hover:border-[#C3A477] transition-all shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-secondary text-foreground font-semibold truncate">
                    {art.category}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-[#C3A477] shrink-0 transition-colors" />
                </div>

                <h2 className="text-lg font-bold text-foreground group-hover:text-[#101B2C] dark:group-hover:text-[#C3A477] transition-colors line-clamp-2">
                  {art.title}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1 truncate">
                  <User className="w-3 h-3 text-[#C3A477]" />
                  {art.author}
                </span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-[#C3A477]" />
                  {formatWibDateTime(art.publishedAt || art.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
