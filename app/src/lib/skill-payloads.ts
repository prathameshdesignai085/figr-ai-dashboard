"use client";

import { useSpaceStore } from "@/stores/useSpaceStore";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";
import { useHandoverStore } from "@/stores/useHandoverStore";
import { buildSpaceContext } from "@/lib/space-context";
import type { SkillRequest } from "@/lib/describer-client";

/**
 * Per-skill client-side payload builders. Each reads from the Zustand
 * stores (Space, captured states, knowledge) and produces the
 * `SkillRequest` body the server route expects.
 *
 * The server-side skill registry only holds prompts — the captured
 * states + knowledge live in localStorage / the client store, so the
 * client must be the one to assemble what gets sent.
 */

type ImagePart = { mime: string; base64: string };

function readDataUrl(s: string): ImagePart | null {
  const m = s.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

function listCapturedStates(spaceId: string) {
  return useHandoverStore
    .getState()
    .capturedStates.filter((c) => c.spaceId === spaceId);
}

function listConnectedDsKnowledge(spaceId: string) {
  const space = useSpaceStore.getState().spaces.find((s) => s.id === spaceId);
  if (!space || !space.connectedKnowledge.includes("design-system")) return [];
  return useKnowledgeStore
    .getState()
    .items.filter((k) => k.category === "design-system");
}

function userHintLine(hint?: string): string {
  return hint?.trim() ? `\n\n---\nUser hint: ${hint.trim()}\n` : "";
}

// ---------- /prd ----------

export function buildPrdPayload(
  spaceId: string,
  userHint?: string
): SkillRequest {
  const productContext = buildSpaceContext(spaceId);
  return {
    contextText: `PRODUCT CONTEXT:\n${productContext}\n\n---\nDraft the PRD now, following the rules above.${userHintLine(userHint)}`,
  };
}

// ---------- /user-flow ----------

export function buildUserFlowPayload(
  spaceId: string,
  userHint?: string
): SkillRequest {
  const productContext = buildSpaceContext(spaceId);
  const captures = listCapturedStates(spaceId);
  const captureLines = captures
    .map(
      (c, i) =>
        `${i + 1}. ${c.name}${c.group ? ` (group: ${c.group})` : ""}`
    )
    .join("\n");
  return {
    contextText: `PRODUCT CONTEXT:\n${productContext}\n\nCAPTURED STATES (in capture order):\n${captureLines}\n\n---\nProduce the flowchart now, following the rules above.${userHintLine(userHint)}`,
  };
}

// ---------- /states ----------

export function buildStatesPayload(
  spaceId: string,
  userHint?: string
): SkillRequest {
  const productContext = buildSpaceContext(spaceId);
  const captures = listCapturedStates(spaceId);
  const grouped: Record<string, string[]> = {};
  for (const c of captures) {
    const key = c.group?.trim() || "Screens";
    (grouped[key] = grouped[key] ?? []).push(c.name);
  }
  const captureLines = Object.entries(grouped)
    .map(
      ([group, names]) => `Group "${group}":\n  - ${names.join("\n  - ")}`
    )
    .join("\n");
  return {
    contextText: `PRODUCT CONTEXT:\n${productContext}\n\nCAPTURED STATES (grouped):\n${captureLines}\n\n---\nProduce the state catalog now.${userHintLine(userHint)}`,
  };
}

// ---------- /check-design-system-compliance ----------

export function buildDsCompliancePayload(
  spaceId: string,
  userHint?: string
): SkillRequest {
  const productContext = buildSpaceContext(spaceId);
  const captures = listCapturedStates(spaceId);
  const dsItems = listConnectedDsKnowledge(spaceId);

  const dsLines = dsItems.length
    ? dsItems
        .map(
          (k) =>
            `- ${k.name} (${k.type}): ${k.content?.slice(0, 400) ?? "(no inline content)"}`
        )
        .join("\n")
    : "(No connected design-system knowledge — note this in the audit.)";

  const images: ImagePart[] = [];
  const captureLines: string[] = [];
  for (const c of captures) {
    const img = readDataUrl(c.dataUrl);
    if (img) {
      images.push(img);
      captureLines.push(`- ${c.name}${c.group ? ` (${c.group})` : ""}`);
    }
  }

  return {
    contextText: `PRODUCT CONTEXT:\n${productContext}\n\nDESIGN SYSTEM REFERENCE:\n${dsLines}\n\nCAPTURED SCREENS (in order, each attached as image below):\n${captureLines.join("\n")}\n\n---\nAudit each screen now, in the order listed.${userHintLine(userHint)}`,
    images,
  };
}

// ---------- /edge-cases-check ----------

export function buildEdgeCasesPayload(
  spaceId: string,
  userHint?: string
): SkillRequest {
  const productContext = buildSpaceContext(spaceId);
  const captures = listCapturedStates(spaceId);
  const captureLines = captures
    .map((c) => `- ${c.name}${c.group ? ` (group: ${c.group})` : ""}`)
    .join("\n");
  return {
    contextText: `PRODUCT CONTEXT:\n${productContext}\n\nCAPTURED SCREENS:\n${captureLines}\n\n---\nProduce the edge-case checklist, grouped by screen.${userHintLine(userHint)}`,
  };
}

// ---------- Dispatch by skill id ----------

export function buildPayloadForSkill(
  skillId: string,
  spaceId: string,
  userHint?: string
): SkillRequest | null {
  switch (skillId) {
    case "prd":
      return buildPrdPayload(spaceId, userHint);
    case "user-flow":
      return buildUserFlowPayload(spaceId, userHint);
    case "states":
      return buildStatesPayload(spaceId, userHint);
    case "check-design-system-compliance":
      return buildDsCompliancePayload(spaceId, userHint);
    case "edge-cases-check":
      return buildEdgeCasesPayload(spaceId, userHint);
    default:
      return null;
  }
}

/** Friendly name for the "Save to Space" affordance, mirroring the server registry. */
export const SKILL_NICE_NAME: Record<string, string> = {
  prd: "PRD",
  "user-flow": "User flow",
  states: "State catalog",
  "check-design-system-compliance": "DS compliance audit",
  "edge-cases-check": "Edge cases check",
};
