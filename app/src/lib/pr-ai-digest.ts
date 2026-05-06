import type { ComponentPR } from "@/types";

/**
 * Server-derived markdown digest for a Component PR — pasted into Claude
 * Code / Cursor by the dev. Includes title, description, and each
 * component's name + reasoning + props + code, in dev-friendly order.
 */
export function buildPrAiDigest(pr: ComponentPR, origin: string): string {
  const lines: string[] = [];

  lines.push(`# ${pr.title}`);
  lines.push("");
  lines.push(`**Space:** ${pr.spaceName}`);
  lines.push(`**Status:** ${pr.status}`);
  lines.push(`**Published:** ${pr.publishedAt} by ${pr.publishedBy}`);
  lines.push("");

  if (pr.description.trim()) {
    lines.push("## Description");
    lines.push(pr.description.trim());
    lines.push("");
  }

  lines.push("## Components");
  for (const c of pr.components) {
    lines.push(`### ${c.name}`);
    lines.push(`*Quality ${c.qualityScore} · used ${c.usageCount}× · from: ${c.sourceStateNames.join(", ")}*`);
    lines.push("");
    lines.push(c.description);
    lines.push("");
    lines.push("_Why it's reusable:_ " + c.reasoning);
    lines.push("");
    lines.push("**Props**");
    lines.push("```");
    lines.push(c.propsDefinition);
    lines.push("```");
    lines.push("");
    lines.push("**Code**");
    lines.push("```" + c.code.language);
    lines.push(c.code.content);
    lines.push("```");
    lines.push("");
  }

  lines.push("---");
  lines.push(`View full PR: ${origin}/pr/${pr.slug}`);
  return lines.join("\n");
}
