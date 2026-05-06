import { useDesignSystemStore } from "@/stores/useDesignSystemStore";
import { useShellStore } from "@/stores/useShellStore";

const MAX_CHARS = 6000;

export function buildShellContext(shellId: string | null | undefined): string {
  if (!shellId) return "(No active Shell — no shell context available.)";
  const shell = useShellStore.getState().shells.find((entry) => entry.id === shellId);
  if (!shell) return "(Shell not found.)";

  const dsStore = useDesignSystemStore.getState();
  const boundSnapshot = shell.dsSnapshotRef
    ? dsStore.snapshots.find((snapshot) => snapshot.id === shell.dsSnapshotRef?.snapshotId)
    : dsStore.getActiveSnapshot();

  const parts: string[] = [];
  parts.push(`# Shell: ${shell.name}`);
  if (shell.description) parts.push(`**Description:** ${shell.description}`);
  if (shell.instructions) parts.push(`**Instructions / style:** ${shell.instructions}`);
  if (shell.techStack) parts.push(`**Tech stack:** ${shell.techStack}`);
  if (shell.designSystemNote)
    parts.push(`**Design system note:** ${shell.designSystemNote}`);
  if (shell.tokenPreferences)
    parts.push(`**Token preferences:** ${shell.tokenPreferences}`);

  if (shell.sourceRefs?.githubScopeRefs.length) {
    parts.push("\n## GitHub scopes");
    for (const scope of shell.sourceRefs.githubScopeRefs) {
      parts.push(
        `- ${scope.label}: ${scope.repo}@${scope.branch} • paths: ${
          scope.paths.join(", ") || "(root)"
        }`
      );
    }
  }

  if (shell.sourceRefs?.figmaFrameRefs.length) {
    parts.push("\n## Figma frame references");
    for (const frame of shell.sourceRefs.figmaFrameRefs.slice(0, 8)) {
      parts.push(
        `- ${frame.label} [${frame.role}]${frame.flowTag ? ` • ${frame.flowTag}` : ""}`
      );
    }
  }

  if (shell.scaffoldPacks?.length) {
    parts.push("\n## Selected scaffold packs");
    for (const pack of shell.scaffoldPacks.filter((entry) => entry.selected)) {
      parts.push(
        `- ${pack.name}: ${pack.description} (feature: ${pack.featureTag})`
      );
    }
  }

  if (shell.mappingReviewItems?.length) {
    const open = shell.mappingReviewItems.filter((item) => item.status === "open");
    const deferred = shell.mappingReviewItems.filter(
      (item) => item.status === "deferred"
    );
    parts.push(
      `\n## Mapping review\n- Open: ${open.length}\n- Deferred: ${deferred.length}`
    );
  }

  if (shell.dsUsageSummary?.componentNames.length) {
    parts.push(
      `\n## DS components used\n${shell.dsUsageSummary.componentNames
        .map((name) => `- ${name}`)
        .join("\n")}`
    );
  }

  if (boundSnapshot) {
    parts.push(
      `\n## Bound DS snapshot\n- ${boundSnapshot.name} ${boundSnapshot.version}\n- Components available: ${boundSnapshot.components.length}`
    );
  }

  if (shell.quality) {
    parts.push(
      `\n## Quality signals\n- DS coverage: ${shell.quality.dsCoverage}%\n- Token compliance: ${shell.quality.tokenCompliance}%\n- Unresolved mappings: ${shell.quality.unresolvedMappings}`
    );
    if (shell.quality.warnings.length > 0) {
      parts.push(
        shell.quality.warnings.map((warning) => `- Warning: ${warning}`).join("\n")
      );
    }
  }

  let out = parts.join("\n");
  if (out.length > MAX_CHARS) out = `${out.slice(0, MAX_CHARS)}\n\n…(truncated)`;
  return out;
}

export function getShellName(shellId: string | null | undefined): string {
  if (!shellId) return "this shell";
  const shell = useShellStore.getState().shells.find((entry) => entry.id === shellId);
  return shell?.name ?? "this shell";
}

export function getTopShellSourceLabels(shellId: string | null | undefined): string[] {
  if (!shellId) return [];
  const shell = useShellStore.getState().shells.find((entry) => entry.id === shellId);
  if (!shell) return [];
  const figmaLabels =
    shell.sourceRefs?.figmaFrameRefs.slice(0, 2).map((frame) => frame.label) ?? [];
  const githubLabels =
    shell.sourceRefs?.githubScopeRefs.slice(0, 1).map((scope) => scope.label) ?? [];
  return [...figmaLabels, ...githubLabels];
}
