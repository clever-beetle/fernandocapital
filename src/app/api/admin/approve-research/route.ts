import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, verifySameOrigin } from "@/lib/auth";

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
        error: "Akses ditolak. Sesi Editor/Admin diperlukan untuk menyetujui publikasi riset.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: {
    checks?: {
      numbersVerified?: boolean;
      macroValidated?: boolean;
      methodologyAttached?: boolean;
      disclaimerIncluded?: boolean;
    };
    editorNote?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const c = body.checks;
  if (
    !c?.numbersVerified ||
    !c?.macroValidated ||
    !c?.methodologyAttached ||
    !c?.disclaimerIncluded
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Seluruh ceklis validasi editor (Human Oversight) wajib dilengkapi.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const approvedAt = new Date().toISOString();

  return NextResponse.json(
    {
      success: true,
      approvedAt,
      status: "approved",
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
