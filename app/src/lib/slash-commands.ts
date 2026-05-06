import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Eye,
  FileText,
  GitBranch,
  Layers,
  Package,
  Palette,
} from "lucide-react";

/**
 * Captures what a slash command needs to be useful. The slash menu uses this
 * to enable/disable entries against the active Space's state.
 */
export type SlashRequirement =
  | "none"
  | "visual-context" // image OR figma-link chip in the composer
  | "captured-states" // ≥ 1 captured state in the active Space
  | "captured-states-2" // ≥ 2 captured states in the active Space
  | "ds-knowledge"; // ≥ 1 connected design-system knowledge item

export type SlashCommand = {
  id: string;
  /** What the user types after `/` (no leading slash). */
  trigger: string;
  /** Display label shown in the popover (with leading slash). */
  label: string;
  description: string;
  icon: LucideIcon;
  requirement?: SlashRequirement;
  /**
   * When true, the command runs against the In-Bot describer (image / Figma link path).
   * Otherwise the command runs against `/api/skill/[id]` (Space-context path).
   */
  isFigmaDescribe?: boolean;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "figma-describe",
    trigger: "figma-describe",
    label: "/figma-describe",
    description: "Describe a screen using this Space's product context",
    icon: Eye,
    requirement: "visual-context",
    isFigmaDescribe: true,
  },
  {
    id: "prd",
    trigger: "prd",
    label: "/prd",
    description: "Draft a Product Requirements Doc from this Space",
    icon: FileText,
    requirement: "none",
  },
  {
    id: "user-flow",
    trigger: "user-flow",
    label: "/user-flow",
    description: "Generate a Mermaid flow diagram from captured states",
    icon: GitBranch,
    requirement: "captured-states-2",
  },
  {
    id: "states",
    trigger: "states",
    label: "/states",
    description:
      "State catalog (empty / loading / error / success) + gap finder",
    icon: Layers,
    requirement: "captured-states",
  },
  {
    id: "check-design-system-compliance",
    trigger: "check-design-system-compliance",
    label: "/check-design-system-compliance",
    description: "Audit captured screens against connected design-system",
    icon: Palette,
    requirement: "ds-knowledge",
  },
  {
    id: "edge-cases-check",
    trigger: "edge-cases-check",
    label: "/edge-cases-check",
    description: "List edge cases the dev should handle, per screen",
    icon: AlertTriangle,
    requirement: "captured-states",
  },
  {
    id: "extract-components",
    trigger: "extract-components",
    label: "/extract-components",
    description:
      "AI surfaces reusable components from your prototype — review and raise as PR",
    icon: Package,
    requirement: "captured-states",
  },
];

export function filterSlashCommands(query: string): SlashCommand[] {
  const q = query.toLowerCase();
  if (!q) return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter(
    (c) =>
      c.trigger.toLowerCase().includes(q) ||
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  );
}

/** Context the slash menu uses to evaluate command requirements. */
export type SlashContext = {
  hasVisualContext: boolean;
  capturedStateCount: number;
  hasDsKnowledge: boolean;
};

/** Returns null if the command is enabled; a reason string if it should be disabled. */
export function disabledReason(
  cmd: SlashCommand,
  ctx: SlashContext
): string | null {
  switch (cmd.requirement) {
    case "visual-context":
      return ctx.hasVisualContext
        ? null
        : "Attach an image or paste a Figma link first";
    case "captured-states":
      return ctx.capturedStateCount >= 1
        ? null
        : "Capture at least one prototype state first";
    case "captured-states-2":
      return ctx.capturedStateCount >= 2
        ? null
        : "Capture at least two prototype states first";
    case "ds-knowledge":
      return ctx.hasDsKnowledge
        ? null
        : "Connect a design-system knowledge item to this Space first";
    case "none":
    case undefined:
      return null;
    default:
      return null;
  }
}

/** Detect if textarea content matches a slash command trigger pattern (e.g. "/", "/fi"). */
export function parseSlashQuery(input: string): string | null {
  const m = input.match(/^\/([\w-]*)$/);
  return m ? m[1] : null;
}

/** Detect if a sent message starts with a known slash command. Returns the command + remaining hint. */
export function matchInvocation(
  input: string
): { command: SlashCommand; hint: string } | null {
  const trimmed = input.trimStart();
  if (!trimmed.startsWith("/")) return null;
  for (const c of SLASH_COMMANDS) {
    const prefix = `/${c.trigger}`;
    if (trimmed === prefix || trimmed.startsWith(prefix + " ")) {
      const hint = trimmed.slice(prefix.length).trim();
      return { command: c, hint };
    }
  }
  return null;
}
