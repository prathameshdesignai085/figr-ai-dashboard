import { useSpaceStore } from "@/stores/useSpaceStore";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";

const MAX_CHARS = 6000;

/**
 * Build a markdown blob describing a Space's product context for prompt injection.
 * Pulls Space name/description/instructions, contextItems (with markdown content),
 * and all knowledge items in the Space's connected categories.
 */
export function buildSpaceContext(spaceId: string | null | undefined): string {
  if (!spaceId) return "(No active Space — no product context available.)";
  const space = useSpaceStore.getState().spaces.find((s) => s.id === spaceId);
  if (!space) return "(Space not found.)";

  const knowledgeItems = useKnowledgeStore.getState().items;

  const parts: string[] = [];

  parts.push(`# Space: ${space.name}`);
  if (space.description) parts.push(`**Description:** ${space.description}`);
  if (space.instructions)
    parts.push(`**Instructions / focus:** ${space.instructions}`);
  parts.push(`**Target platform:** ${space.targetPlatform}`);

  if (space.contextItems.length > 0) {
    parts.push("\n## Attached context items");
    for (const item of space.contextItems) {
      parts.push(`\n### ${item.name} (${item.type}, ${item.source})`);
      if (item.content) parts.push(item.content.trim());
    }
  }

  const linkedCategories = space.connectedKnowledge ?? [];
  if (linkedCategories.length > 0) {
    parts.push("\n## Connected product knowledge");
    for (const cat of linkedCategories) {
      const items = knowledgeItems.filter((k) => k.category === cat);
      if (items.length === 0) continue;
      parts.push(`\n### ${cat}`);
      for (const k of items) {
        parts.push(`- **${k.name}** (${k.type})`);
        if (k.content) parts.push(`  > ${k.content.trim().split("\n").join("\n  > ")}`);
      }
    }
  }

  let out = parts.join("\n");
  if (out.length > MAX_CHARS) {
    out = out.slice(0, MAX_CHARS) + "\n\n…(truncated)";
  }
  return out;
}

/** Pull the first two named context items for use in mock-template interpolation. */
export function getTopContextItemNames(spaceId: string | null | undefined): string[] {
  if (!spaceId) return [];
  const space = useSpaceStore.getState().spaces.find((s) => s.id === spaceId);
  if (!space) return [];
  return space.contextItems.slice(0, 2).map((c) => c.name);
}

export function getSpaceName(spaceId: string | null | undefined): string {
  if (!spaceId) return "this Space";
  const space = useSpaceStore.getState().spaces.find((s) => s.id === spaceId);
  return space?.name ?? "this Space";
}
