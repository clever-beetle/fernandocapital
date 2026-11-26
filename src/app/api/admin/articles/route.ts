import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, verifySameOrigin } from "@/lib/auth";
import { createArticle, listArticlesForAdmin } from "@/lib/research-cms";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    return NextResponse.json(
      {
        success: false,
        error: "Akses ditolak. Sesi Editor/Admin diperlukan untuk melihat daftar artikel CMS.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const category = searchParams.get("category") || "all";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  try {
    const result = await listArticlesForAdmin({
      search,
      status,
      category,
      page,
      pageSize,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar artikel riset." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

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
        error: "Akses ditolak. Sesi Editor/Admin diperlukan untuk membuat artikel.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Format payload JSON tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await createArticle(body);
  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        errors: result.errors || [result.error],
      },
      { status: result.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      article: result.article,
    },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
