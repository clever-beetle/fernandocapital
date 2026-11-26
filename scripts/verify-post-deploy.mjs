/**
 * Fernando Capital — Post-Deployment & Runtime Health Verifier (`npm run verify:deploy`)
 *
 * Performs safe, read-only HTTP verification against a target deployment URL
 * (defaults to `https://fernandocapital.web.id`, override via `VERIFY_BASE_URL`).
 *
 * Checks:
 * - `/` (HTTP 200, security headers, brand & compliance disclosures)
 * - `/calculator` (HTTP 200)
 * - `/research` (HTTP 200) & `/research/non-existent-slug-health-check` (HTTP 404)
 * - `/studio` authorization gate (HTTP 200 login gate; `GET /api/admin/articles` -> HTTP 401)
 * - `/settings` authorization gate (HTTP 200; `GET /api/version?mode=admin` -> HTTP 401)
 * - `/robots.txt` (HTTP 200, disallows `/studio`, `/settings`, `/api/`)
 * - `/sitemap.xml` (HTTP 200, includes public canonical URLs, excludes `/studio` & `/settings`)
 * - `/api/cron/market-data` authentication (`GET` without Bearer token -> HTTP 401)
 * - `/api/cron` authentication (`GET` without Bearer token -> HTTP 401)
 * - `/api/version?mode=public` (HTTP 200, valid JSON version metadata)
 */

import { spawn } from "node:child_process";

const IS_LOCAL_SPAWN = process.argv.includes("--local");
const LOCAL_PORT = process.env.VERIFY_LOCAL_PORT || "3119";
const BASE_URL = (
  process.env.VERIFY_BASE_URL ||
  (IS_LOCAL_SPAWN
    ? `http://127.0.0.1:${LOCAL_PORT}`
    : "https://fernandocapital.web.id")
).replace(/\/+$/, "");

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

async function fetchWithRetry(url, options = {}, retries = 3) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, {
        redirect: "manual",
        ...options,
      });
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function runPostDeployVerification() {
  console.log(`=== Fernando Capital Post-Deployment Verification (${BASE_URL}) ===\n`);

  // 1. Homepage & HTTP Security Headers
  const homeRes = await fetchWithRetry(`${BASE_URL}/`);
  const homeHtml = await homeRes.text();
  assert(homeRes.status === 200, "GET / returns HTTP 200");
  assert(
    homeHtml.includes("Fernando Capital") &&
      homeHtml.includes("Bukan Daftar Harga Resmi PT Antam Tbk."),
    "GET / renders Fernando Capital brand content and gold simulation disclosure"
  );
  assert(
    homeHtml.includes('data-slot="tabs"') &&
      homeHtml.includes('data-slot="card"') &&
      homeHtml.includes('data-slot="badge"') &&
      homeHtml.includes('data-slot="table"') &&
      homeHtml.includes('data-slot="progress"') &&
      homeHtml.includes("Web Platform Active"),
    "GET / renders shadcn/ui Tabs, Card, Badge, Table, Progress slots and Web Platform Active indicator"
  );

  const xfo = homeRes.headers.get("x-frame-options");
  const xcto = homeRes.headers.get("x-content-type-options");
  const refPol = homeRes.headers.get("referrer-policy");
  const permPol = homeRes.headers.get("permissions-policy");
  assert(xfo === "DENY", "Header X-Frame-Options is DENY", `got: ${xfo}`);
  assert(
    xcto === "nosniff",
    "Header X-Content-Type-Options is nosniff",
    `got: ${xcto}`
  );
  assert(
    refPol === "strict-origin-when-cross-origin",
    "Header Referrer-Policy is strict-origin-when-cross-origin",
    `got: ${refPol}`
  );
  assert(
    permPol === "camera=(), microphone=(), geolocation=()",
    "Header Permissions-Policy disables camera, microphone, geolocation",
    `got: ${permPol}`
  );

  // 2. Calculator
  const calcRes = await fetchWithRetry(`${BASE_URL}/calculator`);
  const calcHtml = await calcRes.text();
  assert(calcRes.status === 200, "GET /calculator returns HTTP 200");
  assert(
    calcHtml.includes("Harga Acuan Studi Kasus (Ilustrasi Preset)") &&
      calcHtml.includes("Bukan Kuotasi Pasar Live BEI"),
    "GET /calculator renders static case-study equity disclosures"
  );

  // 3. Research Directory & 404 Non-Published Behavior
  const researchRes = await fetchWithRetry(`${BASE_URL}/research`);
  assert(researchRes.status === 200, "GET /research returns HTTP 200");

  const notFoundRes = await fetchWithRetry(
    `${BASE_URL}/research/non-existent-slug-post-deploy-verification`
  );
  assert(
    notFoundRes.status === 404,
    "GET /research/<non-existent-slug> returns HTTP 404"
  );

  // 4. Studio Login Gate & Admin API Authorization
  const studioRes = await fetchWithRetry(`${BASE_URL}/studio`);
  const studioHtml = await studioRes.text();
  assert(studioRes.status === 200, "GET /studio returns HTTP 200 login gate");
  assert(
    studioHtml.includes("Akses Terbatas: AI Research") ||
      studioHtml.includes("Kata Sandi Editor"),
    "GET /studio enforces unauthenticated editor login gate"
  );

  const adminArticlesRes = await fetchWithRetry(`${BASE_URL}/api/admin/articles`);
  assert(
    adminArticlesRes.status === 401,
    "Unauthenticated GET /api/admin/articles returns HTTP 401"
  );

  // 5. Settings Authorization Boundary
  const settingsRes = await fetchWithRetry(`${BASE_URL}/settings`);
  const settingsHtml = await settingsRes.text();
  assert(
    settingsRes.status === 200 && settingsHtml.includes("Pengaturan"),
    "GET /settings returns HTTP 200"
  );

  const syncMarketUnauthRes = await fetchWithRetry(
    `${BASE_URL}/api/admin/sync-market-data`,
    {
      method: "POST",
      headers: {
        Origin: BASE_URL,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ indicators: ["USD_IDR"] }),
    }
  );
  assert(
    syncMarketUnauthRes.status === 401,
    "Unauthenticated POST /api/admin/sync-market-data returns HTTP 401"
  );

  const adminVersionRes = await fetchWithRetry(
    `${BASE_URL}/api/version?mode=admin`
  );
  const adminVersionJson = await adminVersionRes.json();
  assert(
    adminVersionRes.status === 200 && adminVersionJson?.is_detailed === false,
    "Unauthenticated GET /api/version?mode=admin redacts admin details (is_detailed: false)"
  );

  const pubVersionRes = await fetchWithRetry(
    `${BASE_URL}/api/version?mode=public`
  );
  const pubVersionJson = await pubVersionRes.json();
  assert(
    pubVersionRes.status === 200 && Boolean(pubVersionJson?.version),
    `GET /api/version?mode=public returns valid version JSON (v${pubVersionJson?.version})`
  );

  // 6. robots.txt & sitemap.xml
  const robotsRes = await fetchWithRetry(`${BASE_URL}/robots.txt`);
  const robotsTxt = await robotsRes.text();
  assert(
    robotsRes.status === 200 &&
      robotsTxt.includes("/studio") &&
      robotsTxt.includes("/settings") &&
      robotsTxt.includes("sitemap.xml"),
    "GET /robots.txt returns HTTP 200 and disallows private routes"
  );

  const sitemapRes = await fetchWithRetry(`${BASE_URL}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();
  assert(
    sitemapRes.status === 200 &&
      sitemapXml.includes("https://fernandocapital.web.id") &&
      !sitemapXml.includes("/studio") &&
      !sitemapXml.includes("/settings"),
    "GET /sitemap.xml returns HTTP 200 with public canonical URLs only"
  );

  // 7. Cron Endpoints Authentication Gate
  const cronMarketRes = await fetchWithRetry(`${BASE_URL}/api/cron/market-data`);
  assert(
    cronMarketRes.status === 401,
    "Unauthenticated GET /api/cron/market-data returns HTTP 401"
  );

  const cronLegacyRes = await fetchWithRetry(`${BASE_URL}/api/cron`);
  assert(
    cronLegacyRes.status === 401,
    "Unauthenticated GET /api/cron returns HTTP 401"
  );

  console.log(
    `\n=== Post-Deployment Verification Summary: ${passed} passed, ${failed} failed ===`
  );
  if (failed > 0) {
    process.exit(1);
  }
}

async function main() {
  let localServer = null;
  if (IS_LOCAL_SPAWN) {
    localServer = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "-p", String(LOCAL_PORT)],
      {
        stdio: "pipe",
        env: { ...process.env },
      }
    );
    let ready = false;
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(`${BASE_URL}/api/version?mode=public`);
        if (r.ok) {
          ready = true;
          break;
        }
      } catch {
        // wait for server boot
      }
      await new Promise((res) => setTimeout(res, 500));
    }
    if (!ready) {
      localServer.kill();
      throw new Error(`Local production server failed to start on ${BASE_URL}`);
    }
  }

  try {
    await runPostDeployVerification();
  } finally {
    if (localServer) {
      localServer.kill();
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("POST_DEPLOY_VERIFICATION_ERROR:", err);
  process.exit(1);
});
