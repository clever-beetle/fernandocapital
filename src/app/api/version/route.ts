import { NextRequest, NextResponse } from "next/server";
import { getVersionInfo } from "@/lib/version";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const isAdmin = await isAdminAuthenticated();
  const includeDetails = isAdmin && mode !== "public";
  const info = getVersionInfo(includeDetails);

  return NextResponse.json(info, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0",
      Pragma: "no-cache",
      Expires: "-1",
    },
  });
}
