import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import type { Handover } from "@/types";
import {
  saveHandover,
  nextVersionForSpace,
  markSuperseded,
} from "@/lib/handover-server-store";
import {
  queueBundle,
  type HandoverBundle,
} from "@/lib/handover-pair-store";

export const runtime = "nodejs";

// 8-char URL-friendly slug (no ambiguous chars).
const slugId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 8);

type PublishPayload = {
  spaceId: string;
  spaceName: string;
  title: string;
  summary: string;
  publishedBy: string;
  states: Handover["states"];
  contextItems: Handover["contextItems"];
  knowledge: Handover["knowledge"];
  openQuestions: string;
  /** When set, server queues the bundle for this paired Figma plugin session. */
  figmaSessionToken?: string;
  /** When publishing a new version, the previous handover's id (so we can chain). */
  previousVersionId?: string;
};

export async function POST(req: NextRequest) {
  let body: PublishPayload;
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
  const id = `ho-${slug}`;
  const version = nextVersionForSpace(body.spaceId);

  const handover: Handover = {
    id,
    slug,
    spaceId: body.spaceId,
    spaceName: body.spaceName,
    version,
    title: body.title,
    summary: body.summary ?? "",
    status: "open",
    publishedAt: new Date().toISOString(),
    publishedBy: body.publishedBy || "you",
    states: body.states ?? [],
    contextItems: body.contextItems ?? [],
    knowledge: body.knowledge ?? [],
    openQuestions: body.openQuestions ?? "",
    comments: [],
    previousVersionId: body.previousVersionId,
  };

  saveHandover(handover);

  // Mark the parent handover as superseded so its public page shows a
  // banner pointing readers to this new version.
  if (body.previousVersionId) {
    markSuperseded(body.previousVersionId, handover.id);
  }

  const statesReceived = body.states?.length ?? 0;
  console.log(
    `[publish] slug=${slug} v${version} states=${statesReceived} pushToFigma=${
      !!body.figmaSessionToken
    }`
  );

  // If user has paired a Figma plugin, queue the bundle so the plugin can
  // pull it on demand and lay it out as a Section.
  let queuedToFigma = false;
  let queuedStates = 0;
  if (body.figmaSessionToken) {
    const bundle: HandoverBundle = {
      slug: handover.slug,
      sectionName: `${body.spaceName} · v${version}`,
      states: handover.states.map((s) => ({
        id: s.id,
        name: s.name,
        group: s.group,
        dataUrl: s.dataUrl,
      })),
    };
    queuedStates = bundle.states.length;
    queuedToFigma = queueBundle(body.figmaSessionToken, bundle);
    console.log(
      `[publish] queued ${queuedStates} state(s) to figma session token=${body.figmaSessionToken.slice(
        0,
        8
      )}… queuedToFigma=${queuedToFigma}`
    );
  }

  return NextResponse.json({
    slug,
    version,
    id,
    queuedToFigma,
    statesReceived,
    queuedStates,
  });
}
