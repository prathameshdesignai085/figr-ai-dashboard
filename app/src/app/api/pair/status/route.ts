import { NextRequest, NextResponse } from "next/server";
import { isClaimed } from "@/lib/handover-pair-store";
import { storeFailure } from "@/lib/api-store-response";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Webapp polls this after issuing a pair code to detect when the plugin
 * has claimed it. Once claimed, the webapp persists the sessionToken to
 * localStorage and switches to the paired view.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "token query param required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  try {
    const status = await isClaimed(token);
    return NextResponse.json(status, { headers: CORS_HEADERS });
  } catch (error) {
    return storeFailure("Pair status lookup", error, CORS_HEADERS);
  }
}
