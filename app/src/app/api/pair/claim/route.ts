import { NextRequest, NextResponse } from "next/server";
import { claimCode } from "@/lib/handover-pair-store";

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
 * Plugin claims a pair code, receives the sessionToken minted alongside it.
 * Single-use — codes are consumed on claim.
 */
export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json(
      { error: "code is required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  const sessionToken = claimCode(body.code);
  if (!sessionToken) {
    return NextResponse.json(
      { error: "Invalid or expired code" },
      { status: 404, headers: CORS_HEADERS }
    );
  }
  return NextResponse.json({ sessionToken }, { headers: CORS_HEADERS });
}
