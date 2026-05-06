import { NextRequest, NextResponse } from "next/server";
import {
  getHandover,
  listComments,
  listVersionsForHandover,
} from "@/lib/handover-server-store";
import { buildHandoverAiDigest } from "@/lib/handover-ai-digest";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const handover = getHandover(slug);
  if (!handover) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const origin = req.nextUrl.origin;
  const aiDigest = buildHandoverAiDigest(handover, origin);
  const comments = listComments(slug);
  const versions = listVersionsForHandover(slug);
  return NextResponse.json({
    ...handover,
    aiDigest,
    comments,
    versions,
  });
}
