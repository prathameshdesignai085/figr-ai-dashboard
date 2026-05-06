import { NextRequest, NextResponse } from "next/server";
import {
  addComment,
  listComments,
  getHandover,
} from "@/lib/handover-server-store";
import type { HandoverCommentAnchor } from "@/types";

export const runtime = "nodejs";

const VALID_TOP_LEVEL = new Set([
  "summary",
  "prototype",
  "figma",
  "specs",
  "knowledge",
  "open-questions",
]);

function isValidAnchor(value: unknown): value is HandoverCommentAnchor {
  if (typeof value !== "string") return false;
  if (VALID_TOP_LEVEL.has(value)) return true;
  return value.startsWith("spec:") || value.startsWith("knowledge:");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getHandover(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ comments: listComments(slug) });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let body: { anchor?: unknown; body?: unknown; author?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidAnchor(body.anchor)) {
    return NextResponse.json({ error: "Invalid anchor" }, { status: 400 });
  }
  if (typeof body.body !== "string" || !body.body.trim()) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }
  const author =
    typeof body.author === "string" && body.author.trim()
      ? body.author.trim()
      : "you";

  const comment = addComment({
    slug,
    anchor: body.anchor,
    body: body.body.trim(),
    author,
  });
  if (!comment) {
    return NextResponse.json({ error: "Handover not found" }, { status: 404 });
  }

  return NextResponse.json({ comment });
}
