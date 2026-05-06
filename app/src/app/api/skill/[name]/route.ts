import { NextRequest, NextResponse } from "next/server";
import { getSkill } from "@/lib/skill-registry";
import { streamGeminiSSE } from "@/lib/gemini-stream";

export const runtime = "nodejs";

type SkillRequestBody = {
  /** Skill-specific user-message text built client-side. */
  contextText: string;
  /** Inline images for multimodal skills. data:<mime>;base64,<...> data URLs OK. */
  images?: { mime: string; base64: string }[];
};

/**
 * Single dynamic route for all Generator-style skills (PRD, user-flow,
 * states, DS compliance, edge cases…). Looks up the skill in the registry,
 * validates the body, and delegates to the shared Gemini streaming helper.
 *
 * The wire format on the response matches /api/describe so the existing
 * SSE consumer works unchanged.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const skill = getSkill(name);
  if (!skill) {
    return NextResponse.json(
      { error: `Unknown skill: ${name}` },
      { status: 404 }
    );
  }

  let body: SkillRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.contextText !== "string" || !body.contextText.trim()) {
    return NextResponse.json(
      { error: "contextText is required" },
      { status: 400 }
    );
  }

  // Multimodal skills must have at least one image.
  if (skill.multimodal && (!body.images || body.images.length === 0)) {
    return NextResponse.json(
      { error: `Skill "${skill.id}" requires at least one image` },
      { status: 400 }
    );
  }

  return streamGeminiSSE({
    systemPrompt: skill.systemPrompt,
    userText: body.contextText,
    images: body.images,
  });
}
