import type { Handover } from "@/types";

/**
 * Build the markdown blob the "Copy for AI" button copies to the clipboard.
 * Designed to paste directly into Claude Code or Cursor: title + product
 * context + every included spec/decision + open questions.
 *
 * Image data URLs from captured states are NOT inlined (would explode the
 * paste size); instead we list state names and link back to the public page
 * so the AI can fetch them via tool use if needed.
 */
export function buildHandoverAiDigest(h: Handover, origin: string): string {
  const lines: string[] = [];

  lines.push(`# ${h.title}`);
  lines.push("");
  lines.push(`**Space:** ${h.spaceName}`);
  lines.push(`**Version:** v${h.version} · ${h.status}`);
  lines.push(`**Published:** ${h.publishedAt} by ${h.publishedBy}`);
  lines.push("");

  if (h.summary.trim()) {
    lines.push("## Summary");
    lines.push(h.summary.trim());
    lines.push("");
  }

  if (h.states.length > 0) {
    lines.push("## Captured prototype states");
    for (const s of h.states) {
      lines.push(`- **${s.name}**${s.group ? ` (${s.group})` : ""}`);
    }
    lines.push("");
    lines.push(`See thumbnails at ${origin}/h/${h.slug}`);
    lines.push("");
  }

  if (h.contextItems.length > 0) {
    lines.push("## Specs & decisions");
    for (const item of h.contextItems) {
      lines.push(`### ${item.name}`);
      lines.push(`*Source: ${item.source} · type: ${item.type}*`);
      if (item.content) {
        lines.push("");
        lines.push(item.content.trim());
      }
      lines.push("");
    }
  }

  if (h.knowledge.length > 0) {
    lines.push("## Connected product knowledge");
    for (const k of h.knowledge) {
      lines.push(`### ${k.name}`);
      lines.push(`*Category: ${k.category}*`);
      if (k.content) {
        lines.push("");
        lines.push(k.content.trim());
      }
      lines.push("");
    }
  }

  if (h.openQuestions.trim()) {
    lines.push("## Open questions");
    lines.push(h.openQuestions.trim());
    lines.push("");
  }

  if (h.figmaSectionUrl) {
    lines.push("## Figma section");
    lines.push(`[Open in Figma](${h.figmaSectionUrl})`);
    lines.push("");
  }

  lines.push("---");
  lines.push(`View full handover: ${origin}/h/${h.slug}`);
  return lines.join("\n");
}
