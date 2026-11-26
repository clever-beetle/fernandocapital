import { NextResponse } from "next/server";
import { timingSafeEqualString } from "@/lib/auth";
import { executeGoldSync } from "@/lib/gold-sync";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Fail-closed: require a non-empty server-side CRON_SECRET
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

  const result = await executeGoldSync({ cooldownSeconds: 60 });

  if (result.status === "disabled") {
    return NextResponse.json(
      {
        success: false,
        status: "disabled",
        code: result.code,
        error: result.error,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (result.status === "cooldown") {
    return NextResponse.json(
      {
        success: false,
        error: "Sync cooldown active",
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
    { success: false, error: result.error },
    { status: 500, headers: { "Cache-Control": "no-store" } }
  );
}
