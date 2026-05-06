import { NextResponse } from "next/server";
import { issueCode } from "@/lib/handover-pair-store";

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
 * Issue a fresh pair code. Returns both the human-readable code (shown to
 * the designer in the Publish modal) and the sessionToken (stored in
 * localStorage by the Figred webapp so it can queue bundles later).
 */
export async function POST() {
  const result = issueCode();
  return NextResponse.json(result, { headers: CORS_HEADERS });
}
