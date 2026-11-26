import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, verifySameOrigin } from "@/lib/auth";
import { executeGoldSync } from "@/lib/gold-sync";

export const dynamic = "force-dynamic";

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
        error: `Sinkronisasi dalam masa jeda (cooldown). Silakan tunggu ${result.retryAfterSeconds} detik.`,
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
