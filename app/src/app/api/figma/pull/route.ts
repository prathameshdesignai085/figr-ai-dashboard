import { NextRequest, NextResponse } from "next/server";
import { pullLatest } from "@/lib/handover-pair-store";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Plugin pulls the latest queued handover bundle for its sessionToken.
 * 204 = no bundle queued yet. 200 = bundle in body.
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "token query param required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  const result = pullLatest(token);
  if (!result) {
    console.log(
      `[pull] no bundle queued for token=${token.slice(0, 8)}…`
    );
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }
  const count = result.bundle.states.length;
  console.log(
    `[pull] token=${token.slice(0, 8)}… returning slug=${result.bundle.slug} states=${count} lastBundleAt=${result.lastBundleAt}`
  );
  return NextResponse.json(
    {
      bundle: result.bundle,
      slug: result.bundle.slug,
      lastBundleAt: result.lastBundleAt,
      bundleStatesCount: count,
    },
    { headers: CORS_HEADERS }
  );
}
