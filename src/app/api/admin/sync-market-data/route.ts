import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, verifySameOrigin } from "@/lib/auth";
import {
  DEFAULT_LIVE_INGESTION_INDICATORS,
  DEFAULT_MARKET_SYNC_COOLDOWN_SECONDS,
  executeMarketDataIngestion,
  getRecentMarketDataSyncHistory,
  PERMITTED_LIVE_INGESTION_INDICATORS,
} from "@/lib/market-data/ingestion";
import type { SupportedIndicatorCode } from "@/lib/market-data/providers";

export const dynamic = "force-dynamic";

/**
 * PHASE 3C-4 — PROTECTED ADMIN MARKET DATA SYNC HISTORY ENDPOINT
 *
 * `GET /api/admin/sync-market-data`
 * - Requires server-verified admin session cookie (`isAdminAuthenticated`).
 * - Returns the current `USD_IDR` snapshot and recent `automation_logs` history
 *   for inspection inside the admin workspace (`/studio`).
 * - Never exposed publicly.
 */
export async function GET() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json(
      {
        success: false,
        error: "Akses ditolak. Silakan login sebagai Editor/Admin terlebih dahulu.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const history = await getRecentMarketDataSyncHistory(10);
    return NextResponse.json(
      {
        success: true,
        ...history,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat riwayat sinkronisasi data pasar.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

/**
 * PHASE 3C-3 — PROTECTED MANUAL MARKET DATA SYNC ENDPOINT
 *
 * `POST /api/admin/sync-market-data`
 * - Enforces same-origin CSRF protection (`verifySameOrigin`).
 * - Enforces server-verified admin session cookie (`isAdminAuthenticated`).
 * - Rejects any client-supplied `providerUrl`, `url`, `endpoint`, or unpermitted indicator codes.
 * - Initially permits only `USD_IDR` (Frankfurter API v2).
 * - Supports `{ dryRun: true }` for zero-write validation.
 * - Enforces cooldown and concurrency protection.
 */
export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid request origin" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json(
      {
        success: false,
        error: "Akses ditolak. Silakan login sebagai Editor/Admin terlebih dahulu.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    const rawText = await request.text();
    if (rawText.trim().length > 0) {
      const parsed = JSON.parse(rawText);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json(
          { success: false, error: "Format payload JSON tidak valid." },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Format payload JSON tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Strictly forbid client-provided provider URLs or arbitrary endpoint overrides (SSRF protection)
  for (const forbiddenKey of [
    "providerUrl",
    "url",
    "endpoint",
    "baseUrl",
    "apiKey",
    "token",
  ]) {
    if (Object.prototype.hasOwnProperty.call(body, forbiddenKey)) {
      return NextResponse.json(
        {
          success: false,
          error: `Parameter "${forbiddenKey}" tidak diizinkan. Endpoint provider dikontrol sepenuhnya di sisi server.`,
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  // Validate requested indicator(s): USD_IDR, FED_FUNDS, and US_10Y are permitted in Phase 3D-2
  let targetIndicators: ReadonlyArray<SupportedIndicatorCode> =
    DEFAULT_LIVE_INGESTION_INDICATORS;

  if (body.indicatorCode !== undefined || body.indicators !== undefined) {
    const requestedList: unknown[] = Array.isArray(body.indicators)
      ? body.indicators
      : body.indicatorCode !== undefined
        ? [body.indicatorCode]
        : [];

    if (requestedList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Daftar indikator tidak boleh kosong.",
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const validatedCodes: SupportedIndicatorCode[] = [];
    for (const item of requestedList) {
      const code = typeof item === "string" ? item.trim().toUpperCase() : "";
      if (
        !PERMITTED_LIVE_INGESTION_INDICATORS.includes(
          code as SupportedIndicatorCode
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              code === "FED_FUNDS" || code === "US_10Y"
                ? `Indikator "${code}" dinonaktifkan sementara (Phase 3D-2A Legal & Compliance Review: FRED Terms of Use membatasi penyimpanan database & penggunaan AI). Hanya USD_IDR yang diaktifkan.`
                : `Indikator "${String(item)}" belum diizinkan untuk sinkronisasi live otomatis pada tahap ini. Hanya USD_IDR yang diaktifkan.`,
          },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }
      if (!validatedCodes.includes(code as SupportedIndicatorCode)) {
        validatedCodes.push(code as SupportedIndicatorCode);
      }
    }
    targetIndicators = validatedCodes;
  }

  const dryRun = body.dryRun === true;

  const result = await executeMarketDataIngestion({
    indicators: targetIndicators,
    dryRun,
    cooldownSeconds: DEFAULT_MARKET_SYNC_COOLDOWN_SECONDS,
  });

  if (!result.ok) {
    if (result.status === "cooldown") {
      return NextResponse.json(
        {
          success: false,
          status: "cooldown",
          error: `Sinkronisasi data pasar dalam masa jeda (cooldown). Silakan tunggu ${result.retryAfterSeconds} detik.`,
          retryAfterSeconds: result.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        status: "error",
        dryRun: result.dryRun,
        jobName: result.jobName,
        provider: result.provider,
        durationMs: result.durationMs,
        automationLogId: result.automationLogId,
        error: result.error,
        results: result.results,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      status: result.status,
      dryRun: result.dryRun,
      jobName: result.jobName,
      provider: result.provider,
      totalRecordsUpdated: result.totalRecordsUpdated,
      durationMs: result.durationMs,
      automationLogId: result.automationLogId,
      results: result.results,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
