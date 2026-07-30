import { NextRequest, NextResponse } from "next/server";
import { recordSectionUrl, isValidSession } from "@/lib/handover-pair-store";
import { attachFigmaSection } from "@/lib/handover-server-store";
import { storeFailure } from "@/lib/api-store-response";

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
 * Plugin reports the URL of the section it just built. Server attaches the
 * URL to the matching handover record so the public page reflects it.
 */
export async function POST(req: NextRequest) {
  let body: { token?: string; slug?: string; sectionUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  if (!body.token || !body.slug || !body.sectionUrl) {
    return NextResponse.json(
      { error: "token, slug, sectionUrl required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
  try {
    if (!(await isValidSession(body.token))) {
      return NextResponse.json(
        { error: "Invalid session token" },
        { status: 401, headers: CORS_HEADERS }
      );
    }
    await recordSectionUrl(body.token, body.slug, body.sectionUrl);
    const attached = await attachFigmaSection(body.slug, body.sectionUrl);
    return NextResponse.json({ ok: true, attached }, { headers: CORS_HEADERS });
  } catch (error) {
    return storeFailure("Figma section attach", error, CORS_HEADERS);
  }
}
