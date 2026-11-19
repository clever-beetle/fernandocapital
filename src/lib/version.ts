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

export const _BASE_VERSION = "1.5.0";
export const _BASE_RELEASE_DATE = "2026-11-19";
export const _BASE_CODENAME = "Integrasi Sistem Auto-Update, Manajemen Versi & Identitas Logo Baru";
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
