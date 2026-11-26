import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function ResearchNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] text-center px-4 max-w-lg mx-auto space-y-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-xs">
        <FileQuestion className="h-8 w-8 text-[#C3A477]" />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          404 • Riset Tidak Tersedia Publik
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Artikel Riset Tidak Ditemukan
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Artikel yang Anda cari belum diterbitkan, masih berada dalam tahap peninjauan editor (Draft /
          Review), telah diarsipkan, atau alamat URL tidak valid.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/research"
          className="inline-flex items-center gap-2 rounded-xl bg-[#101B2C] text-[#F4F0E7] dark:bg-[#C3A477] dark:text-[#101B2C] px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lihat Direktori Riset Terbit</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card hover:border-[#C3A477] px-5 py-2.5 text-xs font-semibold text-foreground transition-colors"
        >
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
