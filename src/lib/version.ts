import { execSync } from "child_process";

export interface ReleaseHistoryItem {
  version: string;
  date_id: string;
  title: string;
  highlights: string[];
  public_label?: string;
}

export interface VersionInfo {
  version: string;
  build: string;
  release_date: string;
  release_date_id: string;
  codename: string;
  display: string;
  full_display: string;
  is_detailed: boolean;
  history: ReleaseHistoryItem[];
}

export const _BASE_VERSION = "2.0.0";
export const _BASE_RELEASE_DATE = "2026-11-27";
export const _BASE_CODENAME = "Split Hero Interaktif, Grafik Kurva Emas Live & Visual Fintech v2.0";
export const _PUBLIC_CODENAME = "Rilis Stabil • Pembaruan Otomatis Aktif";

const _BULAN_ID = [
  "",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const _BASE_RELEASE_HISTORY: ReleaseHistoryItem[] = [
  {
    version: "2.0.0",
    date_id: "27 November 2026",
    title: "Split Hero Interaktif, Grafik Kurva Emas Live & Visual Fintech v2.0",
    highlights: [
      "Menghadirkan Split Hero baru dengan kartu floating Preview Valuasi Interaktif (BBCA, ANTM, BMRI), aksen gradient modern, dan latar Aurora halus.",
      "Menambahkan grafik kurva interaktif Recharts pada Simulator Emas Antam yang memvisualisasikan penurunan harga efektif per gram (0.5g hingga 100g) secara live.",
      "Memberikan aksen ikon berwarna yang segar pada setiap kartu indikator dan kalkulator serta banner call-to-action bergaya fintech modern.",
    ],
  },
  {
    version: "1.9.0",
    date_id: "27 November 2026",
    title: "Desain Minimalis Calm Slate & Blue, Navigasi Bersih & Eksplorasi Bertab",
    highlights: [
      "Mengganti palet warna menjadi Neutral Slate & Royal Blue yang bersih, tenang, dan nyaman di mata pada mode terang maupun gelap.",
      "Menyederhanakan navigasi atas tanpa sidebar ganda, mengurangi kepadatan badge/teks kecil, dan memberi ruang putih (whitespace) yang lega.",
      "Menyusun eksplorasi Saham, Dampak Ekonomi, dan Panduan Edukasi ke dalam sistem Tab interaktif sehingga hanya menampilkan satu fokus bersih dalam satu waktu.",
    ],
  },
  {
    version: "1.8.0",
    date_id: "26 November 2026",
    title: "Tata Letak Baru Workspace Sidebar, Asymmetric Bento Command Deck & Master-Detail Workbench",
    highlights: [
      "Merombak total arsitektur tata letak aplikasi menggunakan Persistent Left Sidebar shadcn/ui (lengkap dengan Live Neon DB Telemetry Dock) dan Sticky Top Command Bar.",
      "Mengubah struktur beranda menjadi Asymmetric Bento Command Deck: menempatkan Kalkulator Cepat Emas langsung di sudut kanan atas (above-the-fold) berdampingan dengan Command Center & akses cepat 5 Pilar.",
      "Mengubah Pilar 01 Equity Research menjadi Master-Detail Split Workbench (4 kolom daftar watchlist emiten di kiri + 8 kolom terminal valuasi & rasio di kanan).",
      "Menyusun Pilar 03 (Transmisi Makro Lintas Aset) dan Pilar 05 (Financial Knowledge Academy) secara berdampingan (Side-by-Side 2-Column Split Workbench).",
    ],
  },
  {
    version: "1.7.0",
    date_id: "26 November 2026",
    title: "Desain Institutional Terminal shadcn/ui, Database-Backed Market Engine & Research CMS",
    highlights: [
      "Merombak tampilan utama menggunakan komponen shadcn/ui modern (Card, Badge, Button, Table, Progress, Separator, Input, Sheet) dengan kontras tinggi pada mode terang (Warm Alabaster) dan mode gelap (Midnight Obsidian).",
      "Menambahkan Telemetry Snapshot Card di Hero, indikator status Web Platform Active v1.7.0, tombol preset cepat harga acuan emas 1g, serta visualisasi Progress efisiensi harga/gram dan indeks Margin of Safety / ROE emiten.",
      "Mengintegrasikan Financial Data Engine berbasis Neon PostgreSQL dengan sinkronisasi harian kurs referensi USD/IDR (ECB / Frankfurter) serta Database-Backed Research CMS dengan gerbang 30% Human Oversight.",
      "Mengaktifkan HTTP Security Headers, proteksi autentikasi HMAC-SHA256, dan sistem Automated QA & Self-Healing Release Pipeline.",
    ],
  },
  {
    version: "1.6.0",
    date_id: "22 November 2026",
    title: "Platform 5 Pilar Financial Intelligence & AI Research Studio (70/30)",
    highlights: [
      "Merombak antarmuka menjadi platform Financial Intelligence & Research 5 Pilar yang saling terhubung: (01) Equity & Company Research, (02) Market Intelligence, (03) Economic Insights, (04) Financial Data & Tools, dan (05) Financial Knowledge.",
      "Membangun rantai dampak lintas aset interaktif: menghubungkan kejadian makroekonomi & suku bunga langsung dengan dampaknya ke Saham, Obligasi (SBN), dan Emas.",
      "Menghadirkan 5 instrumen kalkulasi finansial deterministik tervalidasi kode: Stock Valuation & Margin of Safety, Financial Ratio Calculator, Compound Interest, Gold Price Reference (0.5g–1000g), dan Company Comparison.",
      "Menambahkan halaman AI Research & Automation Studio (/studio) dengan model operasional 70% AI & Automation / 30% Human Oversight, 5 Sistem Otomatis, dan simulasi 6-Tahap Automated Gold Research Workflow.",
    ],
  },
  {
    version: "1.5.1",
    date_id: "22 November 2026",
    title: "Logo Siluet Baru, Palet Warna Resmi & Mode Gelap Otomatis",
    highlights: [
      "Memperbarui seluruh logo menggunakan siluet crest terbaru dalam dua varian kontras otomatis: Logo Utama Midnight Navy (#101B2C) di atas latar Warm Ivory (#F4F0E7) dan Logo Alternatif Champagne Gold (#C3A477) di atas latar Midnight Navy (#101B2C).",
      "Menerapkan palet warna resmi Fernando Capital: Warm Ivory (#F4F0E7), Midnight Navy (#101B2C), Champagne Gold (#C3A477), Graphite (#242A32), Muted Taupe (#8C8275), dan Silver Mist (#D8E0E8).",
      "Mengaktifkan tombol sakelar Mode Gelap/Terang interaktif di Header dan halaman Pengaturan dengan jaminan kontras tinggi di seluruh komponen.",
    ],
  },
  {
    version: "1.5.0",
    date_id: "19 November 2026",
    title: "Integrasi Sistem Auto-Update, Manajemen Versi & Identitas Logo Baru",
    highlights: [
      "Menerapkan sistem Auto-Update versi aplikasi, Service Worker dinamis (/sw.js), dan endpoint pengecekan versi real-time (/api/version) setara dengan sistem Treasury Flow.",
      "Menambahkan halaman Pengaturan & Versi Aplikasi lengkap dengan Riwayat Pembaruan serta pemisahan tampilan khusus Developer dan Pengguna Biasa.",
      "Memperbarui seluruh identitas logo utama, favicon, Apple Touch Icon, dan PWA Manifest menggunakan logo resmi Fernando Capital terbaru.",
      "Mengaktifkan format titik ribuan Rupiah otomatis (auto-ribuan) pada Kalkulator Cepat konversi dana ke emas fisik.",
    ],
  },
  {
    version: "1.4.0",
    date_id: "21 Agustus 2026",
    title: "Optimasi Tata Letak Dashboard, Kalkulator Cepat & Sinkronisasi Cron Eksternal",
    highlights: [
      "Merombak tata letak grid utama menjadi 3 kolom proporsional dengan bagian Market Intelligence penuh di bagian bawah.",
      "Menambahkan widget Kalkulator Cepat untuk estimasi konversi dana Rupiah ke gramasi emas fisik.",
      "Mendukung otorisasi cron job eksternal setiap 5 menit untuk pembaruan harga emas global secara berkelanjutan.",
    ],
  },
  {
    version: "1.3.0",
    date_id: "21 Agustus 2026",
    title: "Tabel Harga Fisik Emas Antam Dinamis (0.5g - 100g) & Kalkulasi Pajak PPh 22",
    highlights: [
      "Menambahkan tabel harga emas batangan fisik Antam mulai pecahan 0.5 gram hingga 100 gram dengan koefisien premi akurat.",
      "Menghitung harga dasar dan harga termasuk pajak PPh 22 (0.25%) secara otomatis mengikuti pergerakan harga 1 gram.",
    ],
  },
  {
    version: "1.2.0",
    date_id: "15 Agustus 2026",
    title: "Transformasi Antarmuka Glassmorphism & Tema Dark-Gold Eksklusif",
    highlights: [
      "Menerapkan estetika glassmorphism modern dengan aksen emas menyala (Neon Gold) pada Header, kartu statistik, dan grafik utama.",
      "Menampilkan metrik Kinerja Emas (YTD), harga estimasi retail Antam (1g), dan harga Spot Emas Global (XAU/USD).",
    ],
  },
  {
    version: "1.1.0",
    date_id: "10 Agustus 2026",
    title: "Integrasi Database Neon PostgreSQL & Pelacak Harga Emas Real-Time",
    highlights: [
      "Menghubungkan penyimpanan riwayat harga emas ke database serverless Neon PostgreSQL menggunakan Drizzle ORM.",
      "Menampilkan grafik interaktif AreaChart pergerakan harga emas dalam Rupiah per gram.",
    ],
  },
  {
    version: "1.0.0",
    date_id: "1 Agustus 2026",
    title: "Rilis Perdana Fernando Capital",
    highlights: [
      "Peluncuran awal platform dashboard finansial Fernando Capital dengan fitur pelacak harga emas, kalkulator rasio saham (PER, PBV, ROE), dan ringkasan berita pasar.",
    ],
  },
];

export function formatReleaseDateId(isoDate: string): string {
  try {
    const parts = String(isoDate).slice(0, 10).split("-").map(Number);
    if (parts.length === 3) {
      const [y, m, d] = parts;
      if (m >= 1 && m <= 12) {
        return `${d} ${_BULAN_ID[m]} ${y}`;
      }
    }
  } catch {
    // ignore
  }
  return isoDate;
}

export function bumpSemverPatch(verStr: string, step = 1): string {
  const parts = String(verStr)
    .split(".")
    .map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : 0));
  while (parts.length < 3) {
    parts.push(0);
  }
  parts[2] += Math.max(0, step);
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export function cleanCommitSubject(subject: string): string {
  const cleaned = String(subject || "")
    .trim()
    .replace(/^(?:release\s+v?\d+\.\d+\.\d+\s*[:\-]\s*|[a-zA-Z]+(?:\([^)]+\))?\s*:\s*)/i, "")
    .trim();
  return cleaned || String(subject || "Pembaruan Aplikasi").trim();
}

export function detectBuildSha(): string {
  const envSha = (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    ""
  ).trim();
  if (envSha) {
    return envSha.slice(0, 7);
  }
  try {
    const out = execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1500,
    })
      .toString("utf-8")
      .trim();
    if (out) return out.slice(0, 7);
  } catch {
    // Git not available in serverless runtime
  }
  return "stable";
}

export function resolveVersionState() {
  const history: ReleaseHistoryItem[] = _BASE_RELEASE_HISTORY.map((item) => ({
    ...item,
    highlights: [...(item.highlights || [])],
  }));
  let version = _BASE_VERSION;
  let releaseDate = _BASE_RELEASE_DATE;
  let codename = _BASE_CODENAME;

  try {
    const diffOut = execSync("git status --porcelain -- src/lib/version.ts", {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1500,
    })
      .toString("utf-8")
      .trim();

    if (!diffOut) {
      const lastVerSha = execSync("git log -n 1 --format=%H -- src/lib/version.ts", {
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 1500,
      })
        .toString("utf-8")
        .trim();

      if (lastVerSha) {
        const newCommitsRaw = execSync(
          `git log --reverse --date=short --format=%ad|%s ${lastVerSha}..HEAD`,
          {
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 1500,
          }
        )
          .toString("utf-8")
          .trim();

        if (newCommitsRaw) {
          for (const line of newCommitsRaw.split(/\r?\n/)) {
            const sepIdx = line.indexOf("|");
            if (sepIdx === -1) continue;
            const cDate = line.slice(0, sepIdx).trim();
            const cSubj = line.slice(sepIdx + 1).trim();
            const cTitle = cleanCommitSubject(cSubj);
            version = bumpSemverPatch(version, 1);
            releaseDate = cDate || releaseDate;
            codename = cTitle.slice(0, 68);
            history.unshift({
              version,
              date_id: formatReleaseDateId(releaseDate),
              title: cTitle,
              highlights: [cTitle.endsWith(".") ? cTitle : `${cTitle}.`],
            });
          }
        }
      }
    }
  } catch {
    // Fallback to static base state on serverless runtime
  }

  return {
    version,
    release_date: releaseDate,
    codename,
    history,
  };
}

export function getVersionInfo(includeDetails = true): VersionInfo {
  const state = resolveVersionState();
  const ver = state.version;
  const rDate = state.release_date;
  const sha = detectBuildSha();

  const historyOut: ReleaseHistoryItem[] = includeDetails
    ? state.history
    : state.history.map((item) => ({
        version: item.version,
        date_id: item.date_id,
        title: "Pembaruan Sistem & Peningkatan Kualitas",
        highlights: [],
        public_label: "Pembaruan Sistem & Peningkatan Kualitas",
      }));

  const codenameOut = includeDetails ? state.codename : _PUBLIC_CODENAME;

  return {
    version: ver,
    build: sha,
    release_date: rDate,
    release_date_id: formatReleaseDateId(rDate),
    codename: codenameOut,
    display: `v${ver}`,
    full_display: `v${ver} (${sha})`,
    is_detailed: Boolean(includeDetails),
    history: historyOut,
  };
}
