/**
 * Fernando Capital — Autonomous Automated QA Gate (`npm run qa`)
 *
 * Executes:
 * 1. Static Security, License Compliance & UI Disclosure Gate
 * 2. Drizzle Migration File Integrity (LF & SHA-256 Hashes)
 * 3. Secret-Leak Prevention Audit across tracked source files
 * 4. Deterministic Unit Tests (Auth HMAC/Rate-Limiter, Gold Pricing Engine, Financial Valuation Engine)
 * 5. Isolated Development Database Integration Verification (ONLY on fc-phase2-dev / ep-polished-hall-azz9lc5a)
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const require = createRequire(path.join(ROOT, "package.json"));
const ts = require("typescript");

let passed = 0;
let failed = 0;

function assert(cond, label, detail = "") {
  if (cond) {
    passed++;
    console.log(`  [PASS] ${label}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function loadTsModule(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const source = fs
    .readFileSync(fullPath, "utf8")
    .replace(/import\s+\{\s*cookies\s*\}\s+from\s+["']next\/headers["'];?/g, "");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(
    transpiled.outputText
  ).toString("base64")}`;
  return import(dataUrl);
}

async function runQaGate() {
  console.log("=== Fernando Capital Automated QA & Compliance Gate ===\n");

  // -------------------------------------------------------------------------
  // 1. Static Security, Compliance & Disclosure Gate
  // -------------------------------------------------------------------------
  console.log("--- 1. Static Security, Compliance & Disclosure Gate ---");

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  assert(
    !pkg.dependencies?.["yahoo-finance2"] && !pkg.devDependencies?.["yahoo-finance2"],
    "yahoo-finance2 is removed from package.json"
  );

  const goldSyncSrc = fs.readFileSync(path.join(ROOT, "src/lib/gold-sync.ts"), "utf8");
  assert(
    !/from\s+["']yahoo-finance2["']/.test(goldSyncSrc) &&
      goldSyncSrc.includes('code: "YAHOO_FINANCE_DISABLED"'),
    "src/lib/gold-sync.ts fails closed with YAHOO_FINANCE_DISABLED"
  );

  const cronSrc = fs.readFileSync(path.join(ROOT, "src/app/api/cron/route.ts"), "utf8");
  assert(
    cronSrc.includes("timingSafeEqualString") &&
      cronSrc.includes('result.status === "disabled"') &&
      cronSrc.includes("status: 503"),
    "src/app/api/cron/route.ts preserves CRON_SECRET auth and returns 503 disabled"
  );

  const adminGoldSrc = fs.readFileSync(
    path.join(ROOT, "src/app/api/admin/sync-gold/route.ts"),
    "utf8"
  );
  assert(
    adminGoldSrc.includes("verifySameOrigin") &&
      adminGoldSrc.includes("isAdminAuthenticated") &&
      adminGoldSrc.includes("status: 503"),
    "src/app/api/admin/sync-gold/route.ts preserves CSRF + Admin auth and returns 503 disabled"
  );

  const vercelJson = JSON.parse(
    fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8")
  );
  assert(
    Array.isArray(vercelJson.crons) &&
      vercelJson.crons.length === 1 &&
      vercelJson.crons[0].path === "/api/cron/market-data" &&
      vercelJson.crons[0].schedule === "30 18 * * 1-5",
    "vercel.json schedules only /api/cron/market-data (30 18 * * 1-5)"
  );

  const nextConfigSrc = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");
  for (const hdr of [
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
  ]) {
    assert(
      nextConfigSrc.includes(hdr),
      `next.config.ts configures HTTP security header: ${hdr}`
    );
  }

  const ciYmlSrc = fs.readFileSync(
    path.join(ROOT, ".github/workflows/ci.yml"),
    "utf8"
  );
  assert(
    !ciYmlSrc.includes("--force") && ciYmlSrc.includes("contents: read"),
    ".github/workflows/ci.yml has read-only permissions and zero force-push automation"
  );

  const layoutSrc = fs.readFileSync(path.join(ROOT, "src/app/layout.tsx"), "utf8");
  assert(
    layoutSrc.includes(
      "Independent Financial Intelligence, Equity Research & Deterministic Valuation Platform."
    ),
    "src/app/layout.tsx includes canonical SEO description"
  );

  const goldChartSrc = fs.readFileSync(
    path.join(ROOT, "src/components/dashboard/gold-chart.tsx"),
    "utf8"
  );
  assert(
    goldChartSrc.includes(
      "Bukan Daftar Harga Resmi PT Antam Tbk."
    ) && goldChartSrc.includes('id="home-gold-ref-1g"'),
    "src/components/dashboard/gold-chart.tsx renders simulation disclosure and configurable 1g input"
  );

  const intelSrc = fs.readFileSync(
    path.join(ROOT, "src/lib/intelligence-data.ts"),
    "utf8"
  );
  assert(
    !intelSrc.includes("Q3/2026 • Terverifikasi Editor") &&
      !intelSrc.includes("Live • 5-Min Sync") &&
      intelSrc.includes(
        "Studi Kasus Statis & Preset Simulasi — Bukan Kuotasi Pasar Live BEI."
      ) &&
      intelSrc.includes("Daily EOD Reference Sync (ECB / Frankfurter)"),
    "src/lib/intelligence-data.ts enforces static case-study and daily EOD reference disclosures"
  );

  // -------------------------------------------------------------------------
  // 2. Drizzle Migration File Integrity (LF & SHA-256 Hashes)
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Drizzle Migration Hash & Line-Ending Integrity ---");
  const expectedMigrations = [
    [
      "drizzle/0000_careless_maverick.sql",
      "841d9ddb51ee7f3dde84492801f22682f02f12894b4b3f37290b2819b8bf395b",
    ],
    [
      "drizzle/0001_mushy_fat_cobra.sql",
      "48d4be18e4e1079f163eda7dedd1608a9bf7c16ba5fc13f082feb6516001a810",
    ],
  ];
  for (const [relFile, expectedHash] of expectedMigrations) {
    const buf = fs.readFileSync(path.join(ROOT, relFile));
    const str = buf.toString("utf8");
    const hash = crypto.createHash("sha256").update(buf).digest("hex");
    assert(!str.includes("\r\n"), `${relFile} uses pure LF line endings`);
    assert(
      hash === expectedHash,
      `${relFile} SHA-256 matches ${expectedHash.slice(0, 16)}...`
    );
  }

  // -------------------------------------------------------------------------
  // 3. Secret-Leak Prevention Audit Across Source Files
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Secret-Leak Prevention Audit ---");
  const secretPatterns = [/npg_[A-Za-z0-9]{8,}/, /postgresql:\/\/neondb_owner:[^@\s]+@/];
  let leakedFile = null;
  function scanDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === ".git" ||
        entry.name.startsWith(".env")
      ) {
        continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (/\.(ts|tsx|js|mjs|json|md|yml|yaml|sql)$/i.test(entry.name)) {
        const content = fs.readFileSync(full, "utf8");
        for (const pat of secretPatterns) {
          if (pat.test(content)) {
            leakedFile = path.relative(ROOT, full);
            break;
          }
        }
      }
    }
  }
  scanDir(ROOT);
  assert(
    leakedFile === null,
    "Zero hardcoded database passwords or Neon secrets in tracked project files",
    leakedFile ? `Found in ${leakedFile}` : ""
  );

  // -------------------------------------------------------------------------
  // 4. Deterministic Unit Tests (Auth, Gold Pricing, Financial Engine)
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Deterministic Unit Tests (Auth, Gold Pricing, Financial Engine) ---");
  process.env.ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD || "qa-unit-test-admin-password-32chars";
  process.env.SESSION_SECRET =
    process.env.SESSION_SECRET || "qa-unit-test-session-secret-key-64chars-long";
  process.env.CRON_SECRET =
    process.env.CRON_SECRET || "qa-unit-test-cron-secret-key-64chars-long";

  const authMod = await loadTsModule("src/lib/auth.ts");
  assert(
    authMod.verifyAdminPassword(process.env.ADMIN_PASSWORD) === true &&
      authMod.verifyAdminPassword("wrong-password") === false,
    "auth.ts: constant-time password verification accepts valid and rejects invalid password"
  );

  const token = authMod.createAdminSessionToken();
  assert(
    authMod.verifyAdminSessionToken(token) === true &&
      authMod.verifyAdminSessionToken(`${token}x`) === false,
    "auth.ts: HMAC-SHA256 session token signing and tamper rejection work deterministically"
  );

  const goldMod = await loadTsModule("src/lib/gold-pricing.ts");
  const tier1g = goldMod.calculateAntamTierPricing(1600000, 1, 1);
  const tier10g = goldMod.calculateAntamTierPricing(1600000, 10, 0.9815);
  assert(
    tier1g.basePrice === 1600000 &&
      tier1g.taxPrice === 1604000 &&
      tier10g.taxPrice === 15743260 &&
      tier10g.buybackEstimate === 15120000,
    "gold-pricing.ts: deterministic tier curve, +PPh 22 (0.25%), and buyback calculations match specification"
  );

  const engineMod = await loadTsModule("src/lib/financial-engine.ts");
  const pe = engineMod.calculatePer({
    stockPrice: 10250,
    eps: 512.5,
    periodType: "annual",
    priceCurrency: "IDR",
    epsCurrency: "IDR",
  });
  const pbv = engineMod.calculatePbv({
    stockPrice: 10250,
    bvps: 2050,
    priceCurrency: "IDR",
    bvpsCurrency: "IDR",
  });
  assert(
    pe.value === 20 && pbv.value === 5,
    "financial-engine.ts: deterministic P/E (20.0x) and P/BV (5.0x) calculations pass"
  );

  // -------------------------------------------------------------------------
  // 5. Isolated Development Database Check (ONLY when .env.local -> fc-phase2-dev)
  // -------------------------------------------------------------------------
  const envLocalPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(envLocalPath) && !process.argv.includes("--static-only")) {
    console.log("\n--- 5. Isolated Development Database Integration Check (fc-phase2-dev) ---");
    const dotenv = require("dotenv");
    const parsed = dotenv.parse(fs.readFileSync(envLocalPath, "utf8"));
    const dbUrl = parsed.DATABASE_URL;
    if (dbUrl && dbUrl.includes("ep-polished-hall-azz9lc5a")) {
      const { neon } = require("@neondatabase/serverless");
      const sql = neon(dbUrl);
      const summary = await sql`
        SELECT
          (SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema = 'public') AS tables_cnt,
          (SELECT COUNT(*)::int FROM public.market_indicators) AS indicators_cnt,
          (SELECT COUNT(*)::int FROM public.companies) AS companies_cnt,
          (SELECT COUNT(*)::int FROM drizzle.__drizzle_migrations) AS migrations_cnt
      `;
      assert(
        summary[0].tables_cnt === 7 &&
          summary[0].indicators_cnt === 10 &&
          summary[0].companies_cnt === 5 &&
          summary[0].migrations_cnt === 2,
        "fc-phase2-dev database has 7 tables, 10 market_indicators, 5 companies, and 2 Drizzle migrations"
      );
    } else {
      console.log(
        "  [INFO] Skipping live dev DB check because .env.local does not point to fc-phase2-dev."
      );
    }
  }

  console.log(`\n=== QA Gate Summary: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runQaGate().catch((err) => {
  console.error("QA_GATE_FATAL_ERROR:", err);
  process.exit(1);
});
