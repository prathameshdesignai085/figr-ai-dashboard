import { NextRequest, NextResponse } from "next/server";
import {
  findLatestHandoverForSpace,
  listHandoversForSpace,
} from "@/lib/handover-server-store";

export const runtime = "nodejs";

/**
 * Lightweight summary of handovers for a Space — used by the Publish modal
 * to compute the next version label and link the new handover to its parent.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const { spaceId } = await params;
  const all = listHandoversForSpace(spaceId);
  const latest = findLatestHandoverForSpace(spaceId);
  return NextResponse.json({
    count: all.length,
    nextVersion: all.length + 1,
    latest: latest
      ? {
          id: latest.id,
          slug: latest.slug,
          version: latest.version,
          title: latest.title,
          publishedAt: latest.publishedAt,
        }
      : null,
  });
}
