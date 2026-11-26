import { NextResponse } from "next/server";
import { timingSafeEqualString } from "@/lib/auth";
import {
  DEFAULT_LIVE_INGESTION_INDICATORS,
  DEFAULT_MARKET_SYNC_COOLDOWN_SECONDS,
  executeMarketDataIngestion,
} from "@/lib/market-data/ingestion";

export const dynamic = "force-dynamic";

const FORBIDDEN_QUERY_PARAMS = [
  "providerUrl",
  "url",
  "endpoint",
  "baseUrl",
  "apiKey",
  "token",
  "indicator",
  "indicators",
  "indicatorCode",
] as const;

/**
 * PHASE 3C-4 — DEDICATED VERCEL CRON ENDPOINT FOR MARKET DATA (`USD_IDR`)
 *
 * `GET /api/cron/market-data`
 * - Server-to-server scheduled cron endpoint (recommended schedule: `30 18 * * 1-5` UTC).
 * - Requires `Authorization: Bearer <CRON_SECRET>` verified in constant time via `timingSafeEqualString`.
 * - Fails closed (`401 Unauthorized`) if `CRON_SECRET` is missing, empty, or invalid.
 * - Rejects any client-controlled provider URL, endpoint, or arbitrary indicator parameters.
 * - Delegates execution to `executeMarketDataIngestion()` for `USD_IDR` (Frankfurter API v2).
 * - Never exposes secrets, tokens, or raw upstream/database internals.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const expectedHeader = `Bearer ${cronSecret}`;

  if (!timingSafeEqualString(authHeader, expectedHeader)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Reject any attempt to supply arbitrary provider URLs or indicator overrides via query string
  const parsedUrl = new URL(request.url);
  for (const param of FORBIDDEN_QUERY_PARAMS) {
    if (parsedUrl.searchParams.has(param)) {
      return NextResponse.json(
        {
          success: false,
          error: `Query parameter "${param}" is not permitted on scheduled cron endpoint.`,
        },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  // Task 7 (Phase 3D-2): Scheduled cron executes USD_IDR only (FRED is manual-sync only)
  const result = await executeMarketDataIngestion({
    indicators: DEFAULT_LIVE_INGESTION_INDICATORS,
    jobName: "cron_market_data_usd_idr",
    cooldownSeconds: DEFAULT_MARKET_SYNC_COOLDOWN_SECONDS,
  });

  if (!result.ok) {
    if (result.status === "cooldown") {
      return NextResponse.json(
        {
          success: false,
          status: "cooldown",
          error: "Market data sync cooldown active",
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

    const firstResult = result.results[0];
    return NextResponse.json(
      {
        success: false,
        status: "error",
        indicatorCode: firstResult?.indicatorCode ?? "USD_IDR",
        provider: result.provider,
        recordsUpdated: 0,
        durationMs: result.durationMs,
        executionRef: result.automationLogId,
        error: "Scheduled market data ingestion failed",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  const usdIdrItem = result.results[0];
  const obsIso =
    usdIdrItem?.observation?.observedAt ||
    usdIdrItem?.indicatorSnapshot?.asOfTimestamp ||
    null;
  const sourceDate = obsIso ? obsIso.slice(0, 10) : null;
  const currentValue =
    usdIdrItem?.observation?.value ||
    usdIdrItem?.indicatorSnapshot?.value ||
    null;

  return NextResponse.json(
    {
      success: true,
      status: result.status,
      indicatorCode: usdIdrItem?.indicatorCode ?? "USD_IDR",
      value: currentValue,
      sourceDate,
      provider: result.provider,
      recordsUpdated: result.totalRecordsUpdated,
      historyAction: usdIdrItem?.historyAction ?? "none",
      snapshotAction: usdIdrItem?.snapshotAction ?? "none",
      durationMs: result.durationMs,
      executionRef: result.automationLogId,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
