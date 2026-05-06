import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  DsConnection,
  DsConnectionStatus,
  DsFoundationSection,
  DsProvider,
  DsReviewItem,
  DsRun,
  DsRunStatus,
  DsSnapshot,
} from "@/types";

type CreateDsRunInput = {
  name: string;
  sources: DsProvider[];
  scopeLabel: string;
  strictMatching: boolean;
};

type ResolveReviewInput = {
  reviewItemId: string;
  resolution: "accept" | "remap" | "mark_unmatched";
  remappedComponent?: string;
};

interface DesignSystemState {
  connections: Record<DsProvider, DsConnection>;
  runs: DsRun[];
  snapshots: DsSnapshot[];
  reviewItems: DsReviewItem[];
  activeSnapshotId: string | null;
  getConnection: (provider: DsProvider) => DsConnection;
  setConnectionStatus: (
    provider: DsProvider,
    status: DsConnectionStatus,
    details?: Partial<Omit<DsConnection, "provider" | "status">>
  ) => void;
  getSnapshotById: (snapshotId: string) => DsSnapshot | undefined;
  getActiveSnapshot: () => DsSnapshot | undefined;
  getRunById: (runId: string) => DsRun | undefined;
  getOpenReviewItems: (snapshotId?: string) => DsReviewItem[];
  createRun: (input: CreateDsRunInput) => DsRun;
  setRunStatus: (
    runId: string,
    status: DsRunStatus,
    options?: { snapshotId?: string; issueCount?: number; notes?: string }
  ) => void;
  completeRunWithMockResult: (runId: string) => { run: DsRun; snapshot?: DsSnapshot };
  resolveReviewItem: (input: ResolveReviewInput) => void;
  canActivateSnapshot: (snapshotId: string) => boolean;
  activateSnapshot: (snapshotId: string) => void;
}

const defaultFoundations: DsFoundationSection[] = [
  {
    id: "fdn-colors",
    title: "Color",
    tokens: [
      { id: "c-p-50", name: "primary/50", value: "#92A7DE" },
      { id: "c-p-100", name: "primary/100", value: "#6D8AD3" },
      { id: "c-p-200", name: "primary/200", value: "#496DC8" },
      { id: "c-p-300", name: "primary/300", value: "#365396" },
      { id: "c-p-400", name: "primary/400", value: "#243764" },
      { id: "c-s-50", name: "success/50", value: "#62EEC0" },
      { id: "c-s-100", name: "success/100", value: "#2FDC98" },
      { id: "c-s-200", name: "success/200", value: "#14C263" },
      { id: "c-s-300", name: "success/300", value: "#0D9149" },
      { id: "c-s-400", name: "success/400", value: "#086333" },
      { id: "c-w-50", name: "warning/50", value: "#FFD84D" },
      { id: "c-w-100", name: "warning/100", value: "#FFC53D" },
      { id: "c-w-200", name: "warning/200", value: "#F4A100" },
      { id: "c-w-300", name: "warning/300", value: "#A97000" },
      { id: "c-w-400", name: "warning/400", value: "#634100" },
      { id: "c-e-50", name: "error/50", value: "#FFB3B6" },
      { id: "c-e-100", name: "error/100", value: "#FF6D74" },
      { id: "c-e-200", name: "error/200", value: "#F63D50" },
      { id: "c-e-300", name: "error/300", value: "#B21F30" },
      { id: "c-e-400", name: "error/400", value: "#70101D" },
      { id: "c-i-50", name: "info/50", value: "#94CDFF" },
      { id: "c-i-100", name: "info/100", value: "#63B6FF" },
      { id: "c-i-200", name: "info/200", value: "#1E8FFF" },
      { id: "c-i-300", name: "info/300", value: "#0F69C2" },
      { id: "c-i-400", name: "info/400", value: "#0B4780" },
      { id: "c-bg", name: "surface/background", value: "#282826" },
      { id: "c-fg", name: "surface/foreground", value: "#FFFFFF" },
      { id: "c-border", name: "surface/border", value: "#252536" },
    ],
  },
  {
    id: "fdn-type",
    title: "Typography",
    tokens: [
      { id: "t-font", name: "font-family", value: "Inter, sans-serif" },
      { id: "t-body", name: "body", value: "14px / 400" },
      { id: "t-h1", name: "h1", value: "24px / 600" },
      { id: "t-caption", name: "caption", value: "12px / 400" },
    ],
  },
  {
    id: "fdn-spacing",
    title: "Spacing",
    tokens: [
      { id: "s-1", name: "space-1", value: "4px" },
      { id: "s-2", name: "space-2", value: "8px" },
      { id: "s-3", name: "space-3", value: "12px" },
      { id: "s-4", name: "space-4", value: "16px" },
    ],
  },
  {
    id: "fdn-radius",
    title: "Radius",
    tokens: [
      { id: "r-md", name: "radius-md", value: "8px" },
      { id: "r-base", name: "radius", value: "10px" },
      { id: "r-lg", name: "radius-lg", value: "12px" },
    ],
  },
];

const defaultComponents = [
  {
    id: "cmp-button",
    name: "Button",
    description: "Primary action trigger with semantic variants.",
    importPath: "@acme/ui/button",
    status: "ready" as const,
    variants: [
      { name: "variant", options: ["default", "secondary", "outline", "ghost"] },
      { name: "size", options: ["sm", "default", "lg", "icon"] },
    ],
    props: [
      { name: "variant", type: "string", required: false, defaultValue: "default" },
      { name: "size", type: "string", required: false, defaultValue: "default" },
      { name: "disabled", type: "boolean", required: false, defaultValue: "false" },
    ],
  },
  {
    id: "cmp-input",
    name: "Input",
    description: "Text input with field-level validation states.",
    importPath: "@acme/ui/input",
    status: "ready" as const,
    variants: [{ name: "state", options: ["default", "error", "disabled"] }],
    props: [
      { name: "placeholder", type: "string", required: false },
      { name: "value", type: "string", required: false },
      { name: "onChange", type: "(event) => void", required: false },
    ],
  },
  {
    id: "cmp-card",
    name: "Card",
    description: "Container with optional header and footer slots.",
    importPath: "@acme/ui/card",
    status: "ready" as const,
    variants: [{ name: "elevation", options: ["flat", "raised"] }],
    props: [{ name: "children", type: "ReactNode", required: true }],
  },
  {
    id: "cmp-modal",
    name: "Modal",
    description: "Dialog surface with backdrop and close actions.",
    importPath: "@acme/ui/dialog",
    status: "ready" as const,
    variants: [{ name: "size", options: ["sm", "md", "lg"] }],
    props: [
      { name: "open", type: "boolean", required: true },
      { name: "onOpenChange", type: "(open:boolean) => void", required: true },
    ],
  },
  {
    id: "cmp-tabs",
    name: "Tabs",
    description: "Horizontal tab control for section switching.",
    importPath: "@acme/ui/tabs",
    status: "ready" as const,
    variants: [{ name: "density", options: ["comfortable", "compact"] }],
    props: [{ name: "value", type: "string", required: true }],
  },
  {
    id: "cmp-badge",
    name: "Badge",
    description: "Status and metadata chip component.",
    importPath: "@acme/ui/badge",
    status: "ready" as const,
    variants: [{ name: "variant", options: ["neutral", "success", "warning", "error"] }],
    props: [{ name: "children", type: "ReactNode", required: true }],
  },
  {
    id: "cmp-table",
    name: "Table",
    description: "Data table with sticky header and density controls.",
    importPath: "@acme/ui/table",
    status: "ready" as const,
    variants: [{ name: "density", options: ["compact", "default"] }],
    props: [{ name: "columns", type: "ColumnDef[]", required: true }],
  },
  {
    id: "cmp-shell-layout",
    name: "AppShell",
    description: "Page layout primitive with nav and content slots.",
    importPath: "@acme/ui/layout/app-shell",
    status: "draft" as const,
    variants: [{ name: "mode", options: ["workspace", "home"] }],
    props: [{ name: "children", type: "ReactNode", required: true }],
  },
];

const createMappings = (mode: "clean" | "review-heavy") => [
  {
    id: `map-${nanoid(5)}`,
    figmaName: "Button/Primary",
    codeComponent: "Button",
    confidence: 0.98,
    status: "matched" as const,
  },
  {
    id: `map-${nanoid(5)}`,
    figmaName: "Input/Text",
    codeComponent: "Input",
    confidence: 0.95,
    status: "matched" as const,
  },
  {
    id: `map-${nanoid(5)}`,
    figmaName: "Modal/Base",
    codeComponent: "Modal",
    confidence: 0.9,
    status: "matched" as const,
  },
  {
    id: `map-${nanoid(5)}`,
    figmaName: "Sidebar/Workspace",
    codeComponent: mode === "clean" ? "AppShell" : null,
    confidence: mode === "clean" ? 0.82 : 0.46,
    status: mode === "clean" ? ("matched" as const) : ("needs_review" as const),
    note:
      mode === "clean"
        ? undefined
        : "Multiple possible matches in monorepo (`SidebarShell`, `WorkspaceSidebar`).",
  },
  {
    id: `map-${nanoid(5)}`,
    figmaName: "Toast/Success",
    codeComponent: mode === "clean" ? "Toast" : null,
    confidence: mode === "clean" ? 0.78 : 0.31,
    status: mode === "clean" ? ("matched" as const) : ("unmatched" as const),
    note:
      mode === "clean"
        ? undefined
        : "No export found from `@acme/ui` for toast primitives.",
  },
];

const createSnapshot = ({
  id,
  name,
  version,
  createdAt,
  sourceRunId,
  active,
  summary,
  mode,
}: {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  sourceRunId: string;
  active: boolean;
  summary: string;
  mode: "clean" | "review-heavy";
}): DsSnapshot => ({
  id,
  name,
  version,
  createdAt,
  sourceRunId,
  active,
  summary,
  foundations: defaultFoundations,
  components: defaultComponents,
  mappings: createMappings(mode),
});

const seededSnapshots: DsSnapshot[] = [
  createSnapshot({
    id: "ds-snap-001",
    name: "Acme DS baseline",
    version: "v0.9.0",
    createdAt: "2026-03-26T10:00:00Z",
    sourceRunId: "ds-run-001",
    active: false,
    summary: "Initial migration from monorepo UI package.",
    mode: "clean",
  }),
  createSnapshot({
    id: "ds-snap-002",
    name: "Acme DS canonical",
    version: "v1.0.0",
    createdAt: "2026-04-05T09:30:00Z",
    sourceRunId: "ds-run-002",
    active: true,
    summary: "Validated foundations and component exports from GitHub + Figma.",
    mode: "clean",
  }),
  createSnapshot({
    id: "ds-snap-003",
    name: "Acme DS onboarding refresh",
    version: "v1.1.0-rc1",
    createdAt: "2026-04-19T14:20:00Z",
    sourceRunId: "ds-run-003",
    active: false,
    summary: "Run needs mapping review before activation.",
    mode: "review-heavy",
  }),
];

const seededReviewItems: DsReviewItem[] = (() => {
  const target = seededSnapshots.find((s) => s.id === "ds-snap-003");
  if (!target) return [];
  return target.mappings
    .filter((m) => m.status !== "matched")
    .map((m) => ({
      id: `ds-review-${nanoid(6)}`,
      snapshotId: target.id,
      mappingId: m.id,
      title: `${m.figmaName} needs confirmation`,
      recommendation:
        m.status === "needs_review"
          ? "Pick the right code component or accept the best guess."
          : "Either map this to an existing component or keep it unmatched.",
      status: "open" as const,
    }));
})();

export const useDesignSystemStore = create<DesignSystemState>((set, get) => ({
  connections: {
    github: {
      provider: "github",
      status: "disconnected",
    },
    figma: {
      provider: "figma",
      status: "connected",
      accountLabel: "Figred Team",
      resourceLabel: "Core UI Library",
      lastSyncedAt: "2026-04-19T14:20:00Z",
    },
  },
  runs: [
    {
      id: "ds-run-001",
      name: "Initial GitHub import",
      createdAt: "2026-03-26T09:52:00Z",
      completedAt: "2026-03-26T10:00:00Z",
      status: "completed",
      sources: ["github"],
      scopeLabel: "acme/ui + acme/tokens",
      strictMatching: false,
      snapshotId: "ds-snap-001",
      issueCount: 0,
    },
    {
      id: "ds-run-002",
      name: "GitHub + Figma sync",
      createdAt: "2026-04-05T09:08:00Z",
      completedAt: "2026-04-05T09:30:00Z",
      status: "completed",
      sources: ["github", "figma"],
      scopeLabel: "main branch + Figma Core UI",
      strictMatching: true,
      snapshotId: "ds-snap-002",
      issueCount: 0,
    },
    {
      id: "ds-run-003",
      name: "Onboarding refresh candidate",
      createdAt: "2026-04-19T13:57:00Z",
      completedAt: "2026-04-19T14:20:00Z",
      status: "needs_review",
      sources: ["figma", "github"],
      scopeLabel: "onboarding package + mobile kit",
      strictMatching: true,
      snapshotId: "ds-snap-003",
      issueCount: 2,
      notes: "Resolve component mappings before activation.",
    },
    {
      id: "ds-run-004",
      name: "Nightly sync",
      createdAt: "2026-04-25T02:00:00Z",
      completedAt: "2026-04-25T02:06:00Z",
      status: "failed",
      sources: ["github"],
      scopeLabel: "main branch",
      strictMatching: false,
      issueCount: 1,
      notes: "Could not read package exports in `packages/ui`.",
    },
  ],
  snapshots: seededSnapshots,
  reviewItems: seededReviewItems,
  activeSnapshotId: seededSnapshots.find((s) => s.active)?.id ?? null,

  getConnection: (provider) => get().connections[provider],

  setConnectionStatus: (provider, status, details) =>
    set((state) => ({
      connections: {
        ...state.connections,
        [provider]: {
          ...state.connections[provider],
          status,
          ...details,
          provider,
        },
      },
    })),

  getSnapshotById: (snapshotId) =>
    get().snapshots.find((snapshot) => snapshot.id === snapshotId),

  getActiveSnapshot: () => {
    const state = get();
    if (!state.activeSnapshotId) return undefined;
    return state.snapshots.find((snapshot) => snapshot.id === state.activeSnapshotId);
  },

  getRunById: (runId) => get().runs.find((run) => run.id === runId),

  getOpenReviewItems: (snapshotId) =>
    get().reviewItems.filter(
      (item) =>
        item.status === "open" &&
        (snapshotId ? item.snapshotId === snapshotId : true)
    ),

  createRun: (input) => {
    const run: DsRun = {
      id: `ds-run-${nanoid(6)}`,
      name: input.name.trim() || "Design system sync",
      createdAt: new Date().toISOString(),
      status: "queued",
      sources: input.sources,
      scopeLabel: input.scopeLabel,
      strictMatching: input.strictMatching,
      issueCount: 0,
    };
    set((state) => ({ runs: [run, ...state.runs] }));
    return run;
  },

  setRunStatus: (runId, status, options) =>
    set((state) => ({
      runs: state.runs.map((run) =>
        run.id === runId
          ? {
              ...run,
              status,
              completedAt:
                status === "completed" || status === "needs_review" || status === "failed"
                  ? new Date().toISOString()
                  : run.completedAt,
              snapshotId: options?.snapshotId ?? run.snapshotId,
              issueCount: options?.issueCount ?? run.issueCount,
              notes: options?.notes ?? run.notes,
            }
          : run
      ),
    })),

  completeRunWithMockResult: (runId) => {
    const state = get();
    const run = state.runs.find((item) => item.id === runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    const now = new Date().toISOString();
    const reviewHeavy =
      run.sources.includes("figma") &&
      (!run.sources.includes("github") || run.strictMatching);

    const snapshot: DsSnapshot = createSnapshot({
      id: `ds-snap-${nanoid(6)}`,
      name: `${run.name} snapshot`,
      version: reviewHeavy ? "vNext-rc" : "vNext",
      createdAt: now,
      sourceRunId: run.id,
      active: false,
      summary: reviewHeavy
        ? "Agent found token/component parity issues. Review recommended."
        : "Agent produced a clean sync candidate.",
      mode: reviewHeavy ? "review-heavy" : "clean",
    });

    const newReviewItems: DsReviewItem[] = snapshot.mappings
      .filter((mapping) => mapping.status !== "matched")
      .map((mapping) => ({
        id: `ds-review-${nanoid(6)}`,
        snapshotId: snapshot.id,
        mappingId: mapping.id,
        title: `${mapping.figmaName} needs confirmation`,
        recommendation:
          mapping.status === "needs_review"
            ? "Confirm or remap this component."
            : "Mark unmatched or map to an existing code component.",
        status: "open",
      }));

    const nextStatus: DsRunStatus = newReviewItems.length > 0 ? "needs_review" : "completed";

    const updatedRun: DsRun = {
      ...run,
      status: nextStatus,
      completedAt: now,
      snapshotId: snapshot.id,
      issueCount: newReviewItems.length,
      notes:
        nextStatus === "needs_review"
          ? "Resolve mapping issues before activation."
          : "Snapshot ready to activate.",
    };

    set((current) => ({
      snapshots: [snapshot, ...current.snapshots.map((item) => ({ ...item, active: false }))],
      runs: current.runs.map((item) => (item.id === run.id ? updatedRun : item)),
      reviewItems: [...current.reviewItems, ...newReviewItems],
    }));

    return { run: updatedRun, snapshot };
  },

  resolveReviewItem: ({ reviewItemId, resolution, remappedComponent }) =>
    set((state) => {
      const item = state.reviewItems.find((entry) => entry.id === reviewItemId);
      if (!item || item.status === "resolved") return state;

      const resolvedAt = new Date().toISOString();
      const reviewItems = state.reviewItems.map((entry) =>
        entry.id === reviewItemId
          ? { ...entry, status: "resolved" as const, resolution, resolvedAt }
          : entry
      );

      const snapshots = state.snapshots.map((snapshot) => {
        if (snapshot.id !== item.snapshotId) return snapshot;
        return {
          ...snapshot,
          mappings: snapshot.mappings.map((mapping) => {
            if (mapping.id !== item.mappingId) return mapping;
            if (resolution === "accept") {
              return {
                ...mapping,
                status: "matched" as const,
                resolvedAt,
              };
            }
            if (resolution === "remap") {
              return {
                ...mapping,
                status: "matched" as const,
                codeComponent: remappedComponent ?? mapping.codeComponent,
                resolvedAt,
              };
            }
            return {
              ...mapping,
              status: "unmatched" as const,
              codeComponent: null,
              resolvedAt,
            };
          }),
        };
      });

      const runForSnapshot = state.runs.find(
        (run) => run.snapshotId && run.snapshotId === item.snapshotId
      );
      const openCount = reviewItems.filter(
        (entry) => entry.snapshotId === item.snapshotId && entry.status === "open"
      ).length;
      const runs = state.runs.map((run) =>
        run.id === runForSnapshot?.id
          ? {
              ...run,
              status: openCount === 0 ? ("completed" as const) : run.status,
              issueCount: openCount,
            }
          : run
      );

      return { reviewItems, snapshots, runs };
    }),

  canActivateSnapshot: (snapshotId) =>
    get().reviewItems.every(
      (item) => !(item.snapshotId === snapshotId && item.status === "open")
    ),

  activateSnapshot: (snapshotId) => {
    if (!get().canActivateSnapshot(snapshotId)) return;
    set((state) => ({
      activeSnapshotId: snapshotId,
      snapshots: state.snapshots.map((snapshot) => ({
        ...snapshot,
        active: snapshot.id === snapshotId,
      })),
    }));
  },
}));
