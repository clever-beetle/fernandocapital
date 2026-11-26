import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedArticleBySlug } from "@/lib/research-cms";
import { SafeMarkdown, isSafeHttpUrl } from "@/lib/safe-markdown";
import { formatWibDateTime } from "@/lib/gold-pricing";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  User,
  BookOpen,
  ExternalLink,
  Tag,
} from "lucide-react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article || article.status !== "published") {
    notFound();
  }

  const canonicalUrl = `https://fernandocapital.web.id/research/${article.slug}`;
  const effectiveTitle = article.seoTitle || article.title;
  const effectiveDesc = article.seoDescription || article.excerpt;

  return {
    title: `${effectiveTitle} | Fernando Capital Research`,
    description: effectiveDesc,
    authors: [{ name: article.author }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: effectiveTitle,
      description: effectiveDesc,
      type: "article",
      url: canonicalUrl,
      siteName: "Fernando Capital",
      publishedTime: (article.publishedAt || article.createdAt).toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author],
      tags: Array.isArray(article.tags) ? article.tags : [],
    },
    twitter: {
      card: "summary_large_image",
      title: effectiveTitle,
      description: effectiveDesc,
    },
  };
}

export default async function ResearchArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article || article.status !== "published") {
    notFound();
  }

  const canonicalUrl = `https://fernandocapital.web.id/research/${article.slug}`;
  const publishedDateFormatted = formatWibDateTime(
    article.publishedAt || article.createdAt
  );
  const updatedDateFormatted = formatWibDateTime(article.updatedAt);

  // Sanitized Article JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Fernando Capital",
      url: "https://fernandocapital.web.id",
      logo: {
        "@type": "ImageObject",
        url: "https://fernandocapital.web.id/logo.png",
      },
    },
    datePublished: (article.publishedAt || article.createdAt).toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleSection: article.category,
    keywords: Array.isArray(article.tags) ? article.tags.join(", ") : "",
  };

  const safeJsonLdString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
  const validSources = Array.isArray(article.sources)
    ? article.sources.filter((s) => s && (s.title || s.publisher))
    : [];
  const tagsList = Array.isArray(article.tags) ? article.tags.filter(Boolean) : [];

  return (
    <article className="max-w-4xl mx-auto w-full pb-14 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString }}
      />

      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:border-[#C3A477] px-3 py-1.5 font-semibold text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C3A477]" />
            <span>Semua Riset</span>
          </Link>
          <span>/</span>
          <span className="truncate max-w-[200px] sm:max-w-xs">{article.category}</span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Human-Supervised Research
        </span>
      </div>

      {/* Article Header Card */}
      <header className="rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-10 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-md bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] font-bold">
            {article.category}
          </span>
          {tagsList.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border"
            >
              <Tag className="w-3 h-3 text-[#C3A477]" />
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed border-l-4 border-[#C3A477] pl-4">
          {article.excerpt}
        </p>

        <div className="pt-4 border-t border-border grid gap-3 sm:grid-cols-3 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#C3A477] shrink-0" />
            <div>
              <span className="block text-[10px] uppercase">Penulis / Analis</span>
              <strong className="text-foreground font-sans">{article.author}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#C3A477] shrink-0" />
            <div>
              <span className="block text-[10px] uppercase">Tanggal Publikasi (WIB)</span>
              <strong className="text-foreground">{publishedDateFormatted}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div>
              <span className="block text-[10px] uppercase">Disetujui Editor</span>
              <strong className="text-foreground font-sans">
                {article.approvedBy || article.author}
              </strong>
            </div>
          </div>
        </div>
      </header>

      {/* Main Long-Form Content */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 md:p-10 shadow-sm">
        <SafeMarkdown content={article.content} />
      </div>

      {/* Methodology & Structured Sources Section */}
      <div className="grid gap-6 md:grid-cols-12">
        <section className="md:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
            <BookOpen className="w-4 h-4 text-[#C3A477]" />
            <span>Metodologi &amp; Validasi Data</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
            {article.methodology}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground pt-2 border-t border-border">
            Pembaruan Terakhir: {updatedDateFormatted} WIB
          </p>
        </section>

        <section className="md:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
              Sumber &amp; Referensi Resmi ({validSources.length})
            </span>
          </div>

          {validSources.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Data diolah dari publikasi resmi pasar modal dan basis data internal Fernando Capital.
            </p>
          ) : (
            <ul className="space-y-2.5 text-xs">
              {validSources.map((src, idx) => {
                const hasSafeLink = isSafeHttpUrl(src.url);
                return (
                  <li
                    key={idx}
                    className="rounded-xl border border-border bg-background/70 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground">{src.title}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {src.publisher} • Rilis: {src.publishedDate || "-"} • Diakses:{" "}
                        {src.accessedDate || "-"}
                      </p>
                    </div>
                    {hasSafeLink && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card hover:border-[#C3A477] px-2.5 py-1.5 text-[11px] font-semibold text-foreground shrink-0 self-start sm:self-auto"
                      >
                        <span>Buka Sumber</span>
                        <ExternalLink className="w-3 h-3 text-[#C3A477]" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Institutional Disclaimer */}
      <footer className="rounded-xl border border-[#C3A477]/40 bg-secondary/40 p-4 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Disclaimer Riset &amp; Investasi:</strong> Seluruh analisis
        dan kalkulasi yang diterbitkan oleh Fernando Capital disusun berdasarkan data sumber resmi dan
        telah melalui proses peninjauan editor (Human Oversight) untuk tujuan informasi dan edukasi.
        Publikasi ini bukan merupakan penawaran atau rekomendasi mengikat untuk membeli atau menjual
        instrumen efek maupun komoditas.
      </footer>
    </article>
  );
}
