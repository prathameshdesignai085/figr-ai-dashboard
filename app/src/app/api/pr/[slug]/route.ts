import { NextRequest, NextResponse } from "next/server";
import { getPr } from "@/lib/pr-server-store";
import { buildPrAiDigest } from "@/lib/pr-ai-digest";
import { storeFailure } from "@/lib/api-store-response";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const pr = await getPr(slug);
    if (!pr) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const origin = req.nextUrl.origin;
    return NextResponse.json({
      ...pr,
      aiDigest: buildPrAiDigest(pr, origin),
    });
  } catch (error) {
    return storeFailure("PR lookup", error);
  }
}
