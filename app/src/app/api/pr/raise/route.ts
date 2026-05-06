import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import type {
  ComponentPR,
  ComponentPRSnapshotComponent,
} from "@/types";
import { savePr } from "@/lib/pr-server-store";

export const runtime = "nodejs";

const slugId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);

type RaisePrPayload = {
  spaceId: string;
  spaceName: string;
  title: string;
  description: string;
  publishedBy: string;
  components: ComponentPRSnapshotComponent[];
};

export async function POST(req: NextRequest) {
  let body: RaisePrPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.spaceId || !body.title) {
    return NextResponse.json(
      { error: "spaceId and title are required" },
      { status: 400 }
    );
  }

  const slug = slugId();
  const id = `pr-${slug}`;

  const pr: ComponentPR = {
    id,
    slug,
    spaceId: body.spaceId,
    spaceName: body.spaceName,
    title: body.title,
    description: body.description ?? "",
    status: "open",
    publishedAt: new Date().toISOString(),
    publishedBy: body.publishedBy || "you",
    components: body.components ?? [],
  };

  savePr(pr);

  console.log(
    `[pr/raise] slug=${slug} space=${body.spaceId} components=${body.components?.length ?? 0}`
  );

  return NextResponse.json({ slug, id });
}
