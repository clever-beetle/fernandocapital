/**
 * Utilitas sinkronisasi otomatis src/lib/version.ts dari riwayat commit Git.
 * Memastikan setiap pembaruan yang belum masuk ke _BASE_RELEASE_HISTORY
 * otomatis menaikkan nomor versi dan tercatat di src/lib/version.ts (setara sync_version.py di Treasury Flow).
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const VERSION_FILE = path.join(ROOT_DIR, "src", "lib", "version.ts");

const BULAN_ID = [
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

function formatReleaseDateId(isoDate) {
  try {
    const [y, m, d] = String(isoDate).slice(0, 10).split("-").map(Number);
    if (m >= 1 && m <= 12) {
      return `${d} ${BULAN_ID[m]} ${y}`;
    }
  } catch {
    // ignore
  }
  return isoDate;
}

function bumpSemverPatch(verStr, step = 1) {
  const parts = String(verStr)
    .split(".")
    .map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : 0));
  while (parts.length < 3) parts.push(0);
  parts[2] += Math.max(0, step);
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

function cleanCommitSubject(subject) {
  const cleaned = String(subject || "")
    .trim()
    .replace(/^(?:release\s+v?\d+\.\d+\.\d+\s*[:\-]\s*|[a-zA-Z]+(?:\([^)]+\))?\s*:\s*)/i, "")
    .trim();
  return cleaned || String(subject || "Pembaruan Aplikasi").trim();
}

function syncVersionFile() {
  if (!fs.existsSync(VERSION_FILE)) return;
  let content = fs.readFileSync(VERSION_FILE, "utf-8");

  const baseVerMatch = content.match(/export const _BASE_VERSION\s*=\s*"([^"]+)"/);
  const baseDateMatch = content.match(/export const _BASE_RELEASE_DATE\s*=\s*"([^"]+)"/);
  if (!baseVerMatch || !baseDateMatch) return;

  let version = baseVerMatch[1];
  let releaseDate = baseDateMatch[1];

  try {
    const lastVerSha = execSync("git log -n 1 --format=%H -- src/lib/version.ts", {
      cwd: ROOT_DIR,
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 2000,
    })
      .toString("utf-8")
      .trim();

    if (!lastVerSha) {
      console.log(`Version file is initial -> v${version}`);
      return;
    }

    const newCommitsRaw = execSync(
      `git log --reverse --date=short --format=%ad|%s ${lastVerSha}..HEAD`,
      {
        cwd: ROOT_DIR,
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 2000,
      }
    )
      .toString("utf-8")
      .trim();

    if (!newCommitsRaw) {
      console.log(`Synced version.ts (up-to-date) -> v${version}`);
      return;
    }

    let entriesStr = "";
    let codename = "";
    for (const line of newCommitsRaw.split(/\r?\n/)) {
      const sepIdx = line.indexOf("|");
      if (sepIdx === -1) continue;
      const cDate = line.slice(0, sepIdx).trim();
      const cSubj = line.slice(sepIdx + 1).trim();
      const cTitle = cleanCommitSubject(cSubj).replace(/"/g, "'");
      version = bumpSemverPatch(version, 1);
      releaseDate = cDate || releaseDate;
      codename = cTitle.slice(0, 68);
      const dateId = formatReleaseDateId(releaseDate);
      const highlight = cTitle.endsWith(".") ? cTitle : `${cTitle}.`;

      if (!content.includes(`version: "${version}"`)) {
        entriesStr =
          `  {\n` +
          `    version: "${version}",\n` +
          `    date_id: "${dateId}",\n` +
          `    title: "${cTitle}",\n` +
          `    highlights: [\n` +
          `      "${highlight}",\n` +
          `    ],\n` +
          `  },\n` +
          entriesStr;
      }
    }

    if (entriesStr) {
      content = content.replace(
        /export const _BASE_VERSION\s*=\s*"[^"]+"/,
        `export const _BASE_VERSION = "${version}"`
      );
      content = content.replace(
        /export const _BASE_RELEASE_DATE\s*=\s*"[^"]+"/,
        `export const _BASE_RELEASE_DATE = "${releaseDate}"`
      );
      if (codename) {
        content = content.replace(
          /export const _BASE_CODENAME\s*=\s*"[^"]+"/,
          `export const _BASE_CODENAME = "${codename}"`
        );
      }
      content = content.replace(
        "export const _BASE_RELEASE_HISTORY: ReleaseHistoryItem[] = [\n",
        "export const _BASE_RELEASE_HISTORY: ReleaseHistoryItem[] = [\n" + entriesStr
      );
      fs.writeFileSync(VERSION_FILE, content, "utf-8");
      console.log(`Synced version.ts -> v${version}`);
    }
  } catch {
    console.log(`Skipped git version sync -> v${version}`);
  }
}

syncVersionFile();
