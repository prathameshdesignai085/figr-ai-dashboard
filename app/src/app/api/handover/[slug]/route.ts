import { NextRequest } from "next/server";
import {
  getHandover,
  listComments,
  listVersionsForHandover,
} from "@/lib/handover-server-store";
import { buildHandoverAiDigest } from "@/lib/handover-ai-digest";
import { storeFailure, storeJson } from "@/lib/api-store-response";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const handover = await getHandover(slug);
    if (!handover) {
      return storeJson({ error: "Not found" }, { status: 404 });
    }
    const origin = req.nextUrl.origin;
    const aiDigest = buildHandoverAiDigest(handover, origin);
    const [comments, versions] = await Promise.all([
      listComments(slug),
      listVersionsForHandover(slug),
    ]);
    return storeJson({
      ...handover,
      aiDigest,
      comments,
      versions,
    });
  } catch (error) {
    return storeFailure("Handover lookup", error);
  }
}
