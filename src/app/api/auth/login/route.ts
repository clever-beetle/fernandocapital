import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  checkLoginRateLimit,
  clearLoginFailures,
  createAdminSessionToken,
  getAdminCookieOptions,
  getClientRateLimitKey,
  isAdminAuthConfigured,
  recordFailedLogin,
  verifyAdminPassword,
  verifySameOrigin,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { success: false, error: "Invalid request origin" },
      { status: 403 }
    );
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: "Editor authentication is not configured on the server",
      },
      { status: 503 }
    );
  }

  const clientKey = getClientRateLimitKey(request);
  const rateStatus = checkLoginRateLimit(clientKey);
  if (!rateStatus.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${rateStatus.retryAfterSeconds} detik.`,
        retryAfterSeconds: rateStatus.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateStatus.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body?.password === "string") {
      password = body.password;
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400 }
    );
  }

  if (!password || !verifyAdminPassword(password)) {
    const failState = recordFailedLogin(clientKey);
    if (failState.locked) {
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan gagal. Akses dikunci selama ${failState.retryAfterSeconds} detik.`,
          retryAfterSeconds: failState.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(failState.retryAfterSeconds),
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.json(
      { success: false, error: "Kredensial editor tidak valid" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  clearLoginFailures(clientKey);
  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Authentication service unavailable" },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());

  return NextResponse.json(
    { success: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
