import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  Shell,
  Space,
  KnowledgeCategory,
  ShellDsSnapshotRef,
  ShellDsUsageSummary,
  ShellFigmaFrameRef,
  ShellGithubScopeRef,
  ShellMappingReviewItem,
  ShellQuality,
  ShellScaffoldPack,
  ShellSourceRefs,
} from "@/types";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useChatStore } from "@/stores/useChatStore";

export type CreateShellInput = {
  name: string;
  description: string;
  techStack: string;
  designSystemNote: string;
  tokenPreferences: string;
  sourceRefs?: ShellSourceRefs;
  dsSnapshotRef?: ShellDsSnapshotRef;
  scaffoldPacks?: ShellScaffoldPack[];
  mappingReviewItems?: ShellMappingReviewItem[];
  dsUsageSummary?: ShellDsUsageSummary;
  quality?: ShellQuality;
  /** e.g. npm, pnpm, yarn — informs scaffolding assumptions */
  packageManager?: string;
  /** App Router, pages router, monorepo package, etc. */
  appRouterNote?: string;
};

interface ShellState {
  shells: Shell[];
  getShell: (id: string) => Shell | undefined;
  createShell: (input: CreateShellInput) => Shell;
  updateShell: (id: string, updates: Partial<Shell>) => void;
  /** Copy a space into a new shell (Save as Shell). */
  createShellFromSpace: (
    space: Space,
    name: string,
    description?: string
  ) => Shell;
  /** Create a new space from a shell and a main chat; returns space + chat. */
  remixToSpace: (shellId: string) => { space: Space; chat: import("@/types").Chat } | null;
}

function toInstructionsMarkdown(input: CreateShellInput) {
  const scaffoldLines = [
    `Scaffold / implementation target: ${input.techStack.trim() || "(not specified)"}`,
    input.packageManager?.trim() &&
      `Package manager: ${input.packageManager.trim()}`,
    input.appRouterNote?.trim() &&
      `Routing / app structure: ${input.appRouterNote.trim()}`,
  ].filter(Boolean);
  const designBlock = input.designSystemNote.trim()
    ? `Design system (grounds the assistant and future codegen):\n${input.designSystemNote.trim()}`
    : "";
  const tokenBlock = input.tokenPreferences.trim()
    ? `Tokens & layout (UI constraints for the assistant):\n${input.tokenPreferences.trim()}`
    : "";

  const sourceLines: string[] = [];
  if (input.sourceRefs?.githubScopeRefs.length) {
    sourceLines.push("GitHub scopes:");
    for (const scope of input.sourceRefs.githubScopeRefs) {
      sourceLines.push(
        `- ${scope.repo} (${scope.branch}) • ${scope.paths.join(", ") || "root"}`
      );
    }
  }
  if (input.sourceRefs?.figmaFrameRefs.length) {
    sourceLines.push("Figma frames:");
    for (const frame of input.sourceRefs.figmaFrameRefs.slice(0, 6)) {
      sourceLines.push(
        `- ${frame.label} [${frame.role}]${frame.flowTag ? ` • ${frame.flowTag}` : ""}`
      );
    }
  }
  const sourceBlock =
    sourceLines.length > 0 ? `Source references:\n${sourceLines.join("\n")}` : "";

  const dsBlock = input.dsSnapshotRef
    ? `Bound Design System snapshot: ${input.dsSnapshotRef.name} ${input.dsSnapshotRef.version}`
    : "";
  const qualityBlock = input.quality
    ? `Quality gates: DS coverage ${input.quality.dsCoverage}%, token compliance ${input.quality.tokenCompliance}%, unresolved mappings ${input.quality.unresolvedMappings}`
    : "";

  return [scaffoldLines.join("\n"), designBlock, tokenBlock, sourceBlock, dsBlock, qualityBlock]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

function buildSourceContextItems(sourceRefs?: ShellSourceRefs) {
  if (!sourceRefs) return [];
  const items: Shell["contextItems"] = [];

  for (const scope of sourceRefs.githubScopeRefs) {
    items.push({
      id: `ctx-${nanoid(8)}`,
      name: `GitHub scope · ${scope.label}`,
      type: "document",
      source: "github",
      addedAt: new Date().toISOString(),
      content: `# ${scope.label}\n\nRepo: ${scope.repo}\nBranch: ${scope.branch}\nPaths: ${
        scope.paths.join(", ") || "(none)"
      }\nPackages: ${scope.packages.join(", ") || "(none)"}`,
    });
  }
  for (const frame of sourceRefs.figmaFrameRefs) {
    items.push({
      id: `ctx-${nanoid(8)}`,
      name: `Figma frame · ${frame.label}`,
      type: "figma",
      source: "figma-link",
      addedAt: new Date().toISOString(),
      content: `# ${frame.label}\n\nRole: ${frame.role}\nURL: ${frame.url}\nFlow: ${
        frame.flowTag || "general"
      }`,
    });
  }

  return items;
}

function defaultSourceRefs(
  githubScopeRefs: ShellGithubScopeRef[],
  figmaFrameRefs: ShellFigmaFrameRef[]
): ShellSourceRefs {
  return { githubScopeRefs, figmaFrameRefs };
}

export const useShellStore = create<ShellState>((set, get) => ({
  shells: [
    {
      id: "shell-demo-1",
      name: "B2B admin shell",
      description: "Sidebar + top bar, dense tables, token set for internal tools.",
      createdAt: "2026-03-20T12:00:00Z",
      updatedAt: "2026-03-25T09:00:00Z",
      contextItems: [
        {
          id: "shctx-1",
          name: "Layout primitives",
          type: "document",
          source: "paste",
          addedAt: "2026-03-20T12:00:00Z",
          content: "# Layout\n- AppShell, SidebarNav, PageHeader\n- Max width 1280, 8px grid",
        },
      ],
      connectedKnowledge: ["design-system"],
      instructions:
        "Use the admin shell components. Prefer data-dense tables and filter bars.",
      techStack: "Next.js, React, Tailwind",
      designSystemNote: "Internal DS — Figma library v3",
      tokenPreferences: "Radius sm/md, neutral grays, single accent",
      sourceRefs: defaultSourceRefs(
        [
          {
            id: "gh-scope-admin-1",
            label: "Admin platform",
            repo: "acme/monorepo",
            branch: "main",
            paths: ["apps/admin", "packages/ui", "packages/tokens"],
            packages: ["@acme/ui", "@acme/tokens"],
          },
        ],
        [
          {
            id: "fig-admin-frame-1",
            label: "Dashboard home",
            url: "https://www.figma.com/file/ACMEADMIN/Admin-System?node-id=120%3A450",
            fileKey: "ACMEADMIN",
            nodeId: "120:450",
            fileName: "Admin System",
            pageName: "Web App",
            frameName: "Dashboard home",
            role: "scaffold",
            flowTag: "dashboard",
          },
          {
            id: "fig-admin-frame-2",
            label: "Fleet table",
            url: "https://www.figma.com/file/ACMEADMIN/Admin-System?node-id=121%3A1020",
            fileKey: "ACMEADMIN",
            nodeId: "121:1020",
            fileName: "Admin System",
            pageName: "Components",
            frameName: "Fleet table",
            role: "component-source",
            flowTag: "data-table",
          },
        ]
      ),
      dsSnapshotRef: {
        snapshotId: "ds-snap-002",
        name: "Acme DS canonical",
        version: "v1.0.0",
      },
      scaffoldPacks: [
        {
          id: "pack-admin-dashboard",
          name: "Dashboard + tables",
          description: "Top nav, metrics strip, data table, filter rail.",
          featureTag: "dashboard",
          sourceFrameIds: ["fig-admin-frame-1", "fig-admin-frame-2"],
          recommendedComponentIds: ["cmp-button", "cmp-table", "cmp-tabs", "cmp-badge"],
          selected: true,
        },
        {
          id: "pack-admin-settings",
          name: "Settings + policy",
          description: "Settings nav, forms, and permission cards.",
          featureTag: "settings",
          sourceFrameIds: ["fig-admin-frame-1"],
          recommendedComponentIds: ["cmp-input", "cmp-card", "cmp-button"],
          selected: false,
        },
      ],
      mappingReviewItems: [
        {
          id: "map-admin-1",
          frameRefId: "fig-admin-frame-1",
          figmaName: "Dashboard KPI card",
          componentName: "Card",
          confidence: 0.94,
          status: "resolved",
          resolution: "accept",
        },
        {
          id: "map-admin-2",
          frameRefId: "fig-admin-frame-2",
          figmaName: "Dense data table",
          componentName: "Table",
          confidence: 0.88,
          status: "resolved",
          resolution: "accept",
        },
      ],
      dsUsageSummary: {
        snapshotId: "ds-snap-002",
        componentIds: ["cmp-button", "cmp-table", "cmp-tabs", "cmp-badge", "cmp-input"],
        componentNames: ["Button", "Table", "Tabs", "Badge", "Input"],
        notes: "Optimized for dense internal tooling flows.",
      },
      quality: {
        dsCoverage: 92,
        tokenCompliance: 96,
        unresolvedMappings: 0,
        warnings: [],
      },
    },
    {
      id: "shell-demo-mobile-1",
      name: "Mobile activity shell",
      description:
        "Bottom nav + card stack, RN/Expo defaults for fitness-style mobile apps.",
      createdAt: "2026-04-05T12:00:00Z",
      updatedAt: "2026-04-12T09:00:00Z",
      contextItems: [
        {
          id: "shctx-mobile-1",
          name: "Mobile primitives",
          type: "document",
          source: "paste",
          addedAt: "2026-04-05T12:00:00Z",
          content:
            "# Mobile primitives\n- BottomTabBar, ScreenScaffold, StatTile\n- Safe-area aware, one-handed reach (CTAs in bottom 1/3)",
        },
      ],
      connectedKnowledge: ["design-system"],
      instructions:
        "Use the mobile shell components. Optimize for one-handed use; prioritize today's progress over historical depth.",
      techStack: "React Native, Expo, NativeWind",
      designSystemNote: "Mobile DS — Figma library v1 (sport/fitness)",
      tokenPreferences: "Radius lg, dark surface, single accent (violet)",
      sourceRefs: defaultSourceRefs(
        [
          {
            id: "gh-scope-mobile-1",
            label: "Mobile experience",
            repo: "acme/monorepo",
            branch: "mobile-shells",
            paths: ["apps/mobile", "packages/ui-mobile", "packages/tokens"],
            packages: ["@acme/ui-mobile", "@acme/tokens"],
          },
        ],
        [
          {
            id: "fig-mobile-frame-1",
            label: "Activity home",
            url: "https://www.figma.com/file/ACMEMOBILE/Mobile-Fitness?node-id=310%3A2200",
            fileKey: "ACMEMOBILE",
            nodeId: "310:2200",
            fileName: "Mobile Fitness",
            pageName: "Core flows",
            frameName: "Activity home",
            role: "scaffold",
            flowTag: "home",
          },
          {
            id: "fig-mobile-frame-2",
            label: "Workout details",
            url: "https://www.figma.com/file/ACMEMOBILE/Mobile-Fitness?node-id=311%3A1810",
            fileKey: "ACMEMOBILE",
            nodeId: "311:1810",
            fileName: "Mobile Fitness",
            pageName: "Core flows",
            frameName: "Workout details",
            role: "reference",
            flowTag: "details",
          },
        ]
      ),
      dsSnapshotRef: {
        snapshotId: "ds-snap-003",
        name: "Acme DS onboarding refresh",
        version: "v1.1.0-rc1",
      },
      scaffoldPacks: [
        {
          id: "pack-mobile-home",
          name: "Home + progress feed",
          description: "Hero stats, daily goal ring, activity cards, bottom tab.",
          featureTag: "home",
          sourceFrameIds: ["fig-mobile-frame-1"],
          recommendedComponentIds: ["cmp-card", "cmp-badge", "cmp-button"],
          selected: true,
        },
        {
          id: "pack-mobile-detail",
          name: "Workout detail",
          description: "Session timeline with metrics and call-to-action footer.",
          featureTag: "detail",
          sourceFrameIds: ["fig-mobile-frame-2"],
          recommendedComponentIds: ["cmp-card", "cmp-button", "cmp-tabs"],
          selected: false,
        },
      ],
      mappingReviewItems: [
        {
          id: "map-mobile-1",
          frameRefId: "fig-mobile-frame-1",
          figmaName: "Daily ring card",
          componentName: "Card",
          confidence: 0.78,
          status: "open",
        },
        {
          id: "map-mobile-2",
          frameRefId: "fig-mobile-frame-2",
          figmaName: "Sticky CTA footer",
          componentName: null,
          confidence: 0.41,
          status: "open",
        },
      ],
      dsUsageSummary: {
        snapshotId: "ds-snap-003",
        componentIds: ["cmp-card", "cmp-button", "cmp-badge"],
        componentNames: ["Card", "Button", "Badge"],
        notes: "Mobile widgets still need 2 custom primitives.",
      },
      quality: {
        dsCoverage: 74,
        tokenCompliance: 88,
        unresolvedMappings: 2,
        warnings: [
          "Two mobile frame mappings unresolved.",
          "Custom sticky footer pattern not in DS yet.",
        ],
      },
    },
    {
      id: "shell-demo-web-variation-1",
      name: "Revenue command shell",
      description:
        "Top-nav + glass cards + kanban lane. Optimized for growth and revenue operations workflows.",
      createdAt: "2026-04-21T12:10:00Z",
      updatedAt: "2026-05-01T09:40:00Z",
      contextItems: [
        {
          id: "shctx-rev-1",
          name: "Revenue dashboard primitives",
          type: "document",
          source: "paste",
          addedAt: "2026-04-21T12:10:00Z",
          content:
            "# Revenue shell primitives\n- KPI strip\n- Forecast chart module\n- Opportunity kanban\n- Alerts rail",
        },
      ],
      connectedKnowledge: ["design-system", "business-logic"],
      instructions:
        "Prefer horizontal navigation, high-contrast KPI cards, and compact action rails for operations teams.",
      techStack: "Next.js, React, Tailwind",
      designSystemNote: "Growth DS — Figma revenue system v2",
      tokenPreferences: "Glass surfaces, cool gradients, compact radius",
      sourceRefs: defaultSourceRefs(
        [
          {
            id: "gh-scope-revenue-1",
            label: "Revenue surfaces",
            repo: "acme/monorepo",
            branch: "growth-shells",
            paths: ["apps/revenue", "packages/ui", "packages/charts"],
            packages: ["@acme/ui", "@acme/charts", "@acme/tokens"],
          },
        ],
        [
          {
            id: "fig-revenue-frame-1",
            label: "Revenue command center",
            url: "https://www.figma.com/file/ACMEREV/Revenue-OS?node-id=442%3A890",
            fileKey: "ACMEREV",
            nodeId: "442:890",
            fileName: "Revenue OS",
            pageName: "Web App",
            frameName: "Revenue command center",
            role: "scaffold",
            flowTag: "dashboard",
          },
          {
            id: "fig-revenue-frame-2",
            label: "Opportunities board",
            url: "https://www.figma.com/file/ACMEREV/Revenue-OS?node-id=443%3A1108",
            fileKey: "ACMEREV",
            nodeId: "443:1108",
            fileName: "Revenue OS",
            pageName: "Web App",
            frameName: "Opportunities board",
            role: "component-source",
            flowTag: "pipeline",
          },
        ]
      ),
      dsSnapshotRef: {
        snapshotId: "ds-snap-002",
        name: "Acme DS canonical",
        version: "v1.0.0",
      },
      scaffoldPacks: [
        {
          id: "pack-revenue-dashboard",
          name: "KPI + forecast shell",
          description: "KPI strip, forecast chart block, and alert summaries.",
          featureTag: "dashboard",
          sourceFrameIds: ["fig-revenue-frame-1"],
          recommendedComponentIds: ["cmp-card", "cmp-tabs", "cmp-badge", "cmp-button"],
          selected: true,
        },
        {
          id: "pack-revenue-pipeline",
          name: "Pipeline board",
          description: "Stage columns with opportunity cards and quick actions.",
          featureTag: "pipeline",
          sourceFrameIds: ["fig-revenue-frame-2"],
          recommendedComponentIds: ["cmp-card", "cmp-badge", "cmp-button", "cmp-input"],
          selected: true,
        },
      ],
      mappingReviewItems: [
        {
          id: "map-revenue-1",
          frameRefId: "fig-revenue-frame-1",
          figmaName: "KPI glass tile",
          componentName: "Card",
          confidence: 0.91,
          status: "resolved",
          resolution: "accept",
        },
        {
          id: "map-revenue-2",
          frameRefId: "fig-revenue-frame-2",
          figmaName: "Pipeline stage card",
          componentName: "Card",
          confidence: 0.84,
          status: "resolved",
          resolution: "accept",
        },
      ],
      dsUsageSummary: {
        snapshotId: "ds-snap-002",
        componentIds: ["cmp-card", "cmp-tabs", "cmp-badge", "cmp-button", "cmp-input"],
        componentNames: ["Card", "Tabs", "Badge", "Button", "Input"],
        notes: "Uses DS base components with growth-oriented layout composition.",
      },
      quality: {
        dsCoverage: 89,
        tokenCompliance: 94,
        unresolvedMappings: 0,
        warnings: [],
      },
    },
  ],

  getShell: (id) => get().shells.find((s) => s.id === id),

  createShell: (input) => {
    const now = new Date().toISOString();
    const instructions = toInstructionsMarkdown(input);
    const sourceContextItems = buildSourceContextItems(input.sourceRefs);

    const shell: Shell = {
      id: `shell-${nanoid(6)}`,
      name: input.name,
      description: input.description,
      createdAt: now,
      updatedAt: now,
      contextItems: sourceContextItems,
      connectedKnowledge: [],
      instructions,
      techStack: input.techStack.trim(),
      designSystemNote: input.designSystemNote,
      tokenPreferences: input.tokenPreferences,
      sourceRefs: input.sourceRefs,
      dsSnapshotRef: input.dsSnapshotRef,
      scaffoldPacks: input.scaffoldPacks,
      mappingReviewItems: input.mappingReviewItems,
      dsUsageSummary: input.dsUsageSummary,
      quality: input.quality,
    };
    set((state) => ({ shells: [...state.shells, shell] }));
    return shell;
  },

  updateShell: (id, updates) =>
    set((state) => ({
      shells: state.shells.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  createShellFromSpace: (space, name, description) => {
    const now = new Date().toISOString();
    const inferredFigmaRefs = space.contextItems
      .filter((item) => item.type === "figma")
      .map((item) => ({
        id: `fig-${nanoid(6)}`,
        label: item.name,
        url: item.content?.match(/https?:\/\/\S+/)?.[0] ?? "https://www.figma.com/",
        role: "reference" as const,
      }));
    const shell: Shell = {
      id: `shell-${nanoid(6)}`,
      name,
      description: description ?? space.description,
      createdAt: now,
      updatedAt: now,
      contextItems: space.contextItems.map((c) => ({ ...c })),
      connectedKnowledge: [...space.connectedKnowledge] as KnowledgeCategory[],
      instructions: space.instructions,
      techStack: "",
      designSystemNote: "",
      tokenPreferences: "",
      sourceRefs: {
        githubScopeRefs: [],
        figmaFrameRefs: inferredFigmaRefs,
      },
      scaffoldPacks: [],
      mappingReviewItems: [],
      quality: {
        dsCoverage: 0,
        tokenCompliance: 0,
        unresolvedMappings: inferredFigmaRefs.length,
        warnings:
          inferredFigmaRefs.length > 0
            ? ["Review imported Figma refs and map them to DS components."]
            : ["No source references inferred from this space."],
      },
      sourceSpaceId: space.id,
    };
    set((state) => ({ shells: [...state.shells, shell] }));
    return shell;
  },

  remixToSpace: (shellId) => {
    const shell = get().shells.find((s) => s.id === shellId);
    if (!shell) return null;
    const now = new Date().toISOString();
    const sourceSummaryLines: string[] = [];
    if (shell.sourceRefs?.githubScopeRefs.length) {
      sourceSummaryLines.push("## GitHub scopes");
      for (const scope of shell.sourceRefs.githubScopeRefs) {
        sourceSummaryLines.push(
          `- ${scope.label}: ${scope.repo}@${scope.branch} (${scope.paths.join(", ") || "root"})`
        );
      }
    }
    if (shell.sourceRefs?.figmaFrameRefs.length) {
      sourceSummaryLines.push("\n## Figma frames");
      for (const frame of shell.sourceRefs.figmaFrameRefs) {
        sourceSummaryLines.push(`- ${frame.label} [${frame.role}]`);
      }
    }
    if (shell.dsUsageSummary?.componentNames.length) {
      sourceSummaryLines.push(
        `\n## DS components\n- ${shell.dsUsageSummary.componentNames.join(", ")}`
      );
    }
    if (shell.quality) {
      sourceSummaryLines.push(
        `\n## Quality\n- DS coverage: ${shell.quality.dsCoverage}%\n- Token compliance: ${shell.quality.tokenCompliance}%\n- Unresolved mappings: ${shell.quality.unresolvedMappings}`
      );
    }
    const metadataContext =
      sourceSummaryLines.length > 0
        ? [
            ...shell.contextItems,
            {
              id: `ctx-${nanoid(8)}`,
              name: "Shell source summary",
              type: "document" as const,
              source: "shell",
              addedAt: now,
              content: `# ${shell.name} source summary\n\n${sourceSummaryLines.join("\n")}`,
            },
          ]
        : shell.contextItems.map((c) => ({ ...c }));

    const space: Space = {
      id: `space-${nanoid(6)}`,
      name: `${shell.name} (remix)`,
      description: shell.description,
      stage: "brainstorm",
      targetPlatform: "web",
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      chatIds: [],
      contextItems: metadataContext.map((c) => ({ ...c })),
      connectedKnowledge: [...shell.connectedKnowledge] as KnowledgeCategory[],
      instructions: shell.instructions,
      remixedFromShellId: shell.id,
    };
    useSpaceStore.getState().addSpace(space);
    const chat = useChatStore.getState().createChat(space.id, "Main");
    return { space, chat };
  },
}));
