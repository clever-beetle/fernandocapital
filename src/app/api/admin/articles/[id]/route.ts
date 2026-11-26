import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, verifySameOrigin } from "@/lib/auth";
import { deleteArticle, updateArticle } from "@/lib/research-cms";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
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
        error: "Akses ditolak. Sesi Editor/Admin diperlukan untuk mengubah artikel.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { id } = await ctx.params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return NextResponse.json(
      { success: false, error: "ID artikel tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "Format payload JSON tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const isExplicitPublishAction = body?.action === "publish";
  const result = await updateArticle(articleId, body, { isExplicitPublishAction });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      article: result.article,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
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
        error: "Akses ditolak. Sesi Editor/Admin diperlukan untuk menghapus artikel.",
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { id } = await ctx.params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return NextResponse.json(
      { success: false, error: "ID artikel tidak valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const result = await deleteArticle(articleId);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { success: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
