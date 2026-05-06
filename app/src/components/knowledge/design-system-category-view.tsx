"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleAlert,
  Component,
  Copy,
  GitBranch,
  Loader2,
  PenTool,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useDesignSystemStore } from "@/stores/useDesignSystemStore";
import type {
  DsComponentDefinition,
  DsFoundationSection,
  DsProvider,
  DsRun,
  DsRunStatus,
  DsSnapshot,
} from "@/types";

type DsTab = "foundations" | "components" | "mappings" | "runs";

const TABS: { id: DsTab; label: string }[] = [
  { id: "foundations", label: "Foundations" },
  { id: "components", label: "Components" },
  { id: "mappings", label: "Mappings" },
  { id: "runs", label: "Runs" },
];

const statusClasses: Record<DsRunStatus, string> = {
  queued: "bg-amber-400/10 text-amber-300",
  running: "bg-blue-400/10 text-blue-300",
  completed: "bg-emerald-400/10 text-emerald-300",
  needs_review: "bg-orange-400/10 text-orange-300",
  failed: "bg-rose-400/10 text-rose-300",
};

function SourceChip({
  provider,
  connected,
}: {
  provider: DsProvider;
  connected: boolean;
}) {
  const Icon = provider === "github" ? GitBranch : PenTool;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        connected
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-white/[0.12] bg-white/[0.04] text-foreground/50"
      )}
    >
      <Icon size={11} />
      {provider}
    </span>
  );
}

function isHexColor(value: string) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

function getReadableTextColor(hex: string) {
  const clean = hex.replace("#", "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : clean;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? "#121212" : "#F8F8F8";
}

function renderFoundationsSection(section: DsFoundationSection) {
  if (section.title.toLowerCase() === "color") {
    const grouped = section.tokens.reduce<Record<string, typeof section.tokens>>(
      (acc, token) => {
        const [group] = token.name.split("/");
        const key = group || "other";
        acc[key] = acc[key] ? [...acc[key], token] : [token];
        return acc;
      },
      {}
    );

    return (
      <div className="rounded-2xl border border-white/[0.08] bg-surface-2 p-5">
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-base font-semibold tracking-tight">Color Scales</h3>
          <p className="text-xs text-foreground/40">Primary, semantic, and surface ramps</p>
        </div>
        <div className="space-y-4">
          {Object.entries(grouped).map(([groupName, tokens]) => (
            <div
              key={groupName}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                  {groupName}
                </p>
                <span className="text-[10px] text-foreground/30">{tokens.length} tokens</span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="rounded-xl border border-white/[0.08] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    style={{
                      background: isHexColor(token.value) ? token.value : "#1f1f1f",
                      color: isHexColor(token.value)
                        ? getReadableTextColor(token.value)
                        : undefined,
                    }}
                  >
                    <p className="text-[10px] font-semibold leading-tight">{token.name}</p>
                    <p className="mt-2 text-[10px] opacity-90">{token.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.title.toLowerCase() === "typography") {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-surface-2 p-5">
        <div className="mb-4 flex items-end justify-between">
          <h3 className="text-base font-semibold tracking-tight">Typography</h3>
          <p className="text-xs text-foreground/40">Type roles and reading rhythm</p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#111217] p-4">
          <p className="text-xl font-semibold leading-tight text-foreground/90">
            Build faster with a consistent visual system
          </p>
          <p className="mt-2 text-sm text-foreground/55">
            Foundations define predictable behavior across components.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {section.tokens.map((token) => (
            <div
              key={token.id}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5"
            >
              <p className="text-sm font-medium text-foreground/75">{token.name}</p>
              <span className="text-sm text-foreground/50">{token.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-surface-2 p-5">
      <div className="mb-4 flex items-end justify-between">
        <h3 className="text-base font-semibold tracking-tight">{section.title}</h3>
        <p className="text-xs text-foreground/40">{section.tokens.length} tokens</p>
      </div>
      <div className="space-y-2.5">
        {section.tokens.map((token) => (
          <div
            key={token.id}
            className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground/80">{token.name}</p>
              {token.description && (
                <p className="truncate text-[11px] text-foreground/40">{token.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {section.title.toLowerCase().includes("radius") && (
                <span
                  className="inline-flex h-7 w-12 border border-white/[0.14] bg-white/[0.04]"
                  style={{
                    borderRadius: token.value.includes("px") ? token.value : "8px",
                  }}
                />
              )}
              {section.title.toLowerCase().includes("spacing") && (
                <span className="inline-flex h-2.5 w-16 items-center rounded bg-white/[0.06]">
                  <span
                    className="h-2.5 rounded bg-violet-400/80"
                    style={{
                      width: token.value.includes("px")
                        ? `${Math.min(64, Math.max(8, Number.parseInt(token.value, 10) * 2))}px`
                        : "24px",
                    }}
                  />
                </span>
              )}
              <span className="text-sm text-foreground/55">{token.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderComponentPreview(component: DsComponentDefinition) {
  const name = component.name.toLowerCase();

  if (name.includes("button")) {
    return (
      <div className="space-y-2 rounded-lg border border-white/[0.08] bg-[#0f1014] p-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Add mission</Button>
          <Button size="sm" variant="secondary">
            Secondary
          </Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
          <Button size="sm" variant="destructive">
            Danger
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="icon-sm" variant="outline">
            +
          </Button>
          <Button size="icon-sm">+</Button>
          <Button size="sm" disabled>
            Disabled
          </Button>
        </div>
      </div>
    );
  }

  if (name.includes("badge")) {
    return (
      <div className="flex flex-wrap gap-2 rounded-lg border border-white/[0.08] bg-[#0f1014] p-3">
        {[
          "bg-violet-500/20 text-violet-200",
          "bg-emerald-500/20 text-emerald-200",
          "bg-amber-500/20 text-amber-200",
          "bg-rose-500/20 text-rose-200",
        ].map((className, index) => (
          <span
            key={className}
            className={cn(
              "rounded-full border border-white/[0.12] px-2.5 py-1 text-[11px] font-medium",
              className
            )}
          >
            {["Primary", "Success", "Warning", "Error"][index]}
          </span>
        ))}
      </div>
    );
  }

  if (name.includes("input")) {
    return (
      <div className="space-y-2 rounded-lg border border-white/[0.08] bg-[#0f1014] p-3">
        <Input value="alex@sampleco.dev" readOnly className="bg-white/[0.04]" />
        <Input placeholder="Search component..." className="bg-white/[0.04]" />
        <Input value="Invalid email" readOnly className="border-rose-400/40 bg-white/[0.04]" />
      </div>
    );
  }

  if (name.includes("table")) {
    return (
      <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0f1014]">
        <div className="grid grid-cols-3 border-b border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-wider text-foreground/45">
          <span>Aircraft</span>
          <span>Status</span>
          <span>Updated</span>
        </div>
        <div className="grid grid-cols-3 px-3 py-2 text-xs text-foreground/75">
          <span>A-320</span>
          <span className="text-emerald-300">Ready</span>
          <span>2m ago</span>
        </div>
        <div className="grid grid-cols-3 border-t border-white/[0.06] px-3 py-2 text-xs text-foreground/75">
          <span>B-737</span>
          <span className="text-amber-300">Pending</span>
          <span>8m ago</span>
        </div>
      </div>
    );
  }

  if (name.includes("tabs")) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#0f1014] p-3">
        <div className="inline-flex items-center rounded-md border border-white/[0.1] bg-white/[0.02] p-1">
          <span className="rounded px-2 py-1 text-xs text-foreground/45">Overview</span>
          <span className="rounded bg-white/[0.1] px-2 py-1 text-xs text-foreground/85">
            Components
          </span>
          <span className="rounded px-2 py-1 text-xs text-foreground/45">Tokens</span>
        </div>
      </div>
    );
  }

  if (name.includes("modal")) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#0f1014] p-3">
        <div className="mx-auto max-w-[260px] rounded-lg border border-white/[0.1] bg-[#171922] p-3">
          <p className="text-xs font-medium text-foreground/80">Confirm style update</p>
          <p className="mt-1 text-[11px] text-foreground/45">
            Push token changes to Design System snapshot?
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="xs" variant="outline">
              Cancel
            </Button>
            <Button size="xs">Publish</Button>
          </div>
        </div>
      </div>
    );
  }

  if (name.includes("card")) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-[#0f1014] p-3">
        <div className="rounded-lg border border-white/[0.1] bg-[#1a1c28] p-3">
          <p className="text-xs font-medium text-foreground/85">Fleet Health</p>
          <p className="mt-1 text-[11px] text-foreground/45">11 aircraft active today</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.08]">
            <div className="h-full w-2/3 rounded-full bg-violet-400/80" />
          </div>
        </div>
      </div>
    );
  }

  if (name.includes("appshell") || name.includes("shell")) {
    return (
      <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-[#0f1014]">
        <div className="h-7 border-b border-white/[0.08] bg-white/[0.03]" />
        <div className="flex h-24">
          <div className="w-16 border-r border-white/[0.08] bg-white/[0.04]" />
          <div className="flex-1 bg-[#171922]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#0f1014] p-3 text-xs text-foreground/55">
      Preview fixture for {component.name}
    </div>
  );
}

export function DesignSystemCategoryView() {
  const router = useRouter();
  const timersRef = useRef<number[]>([]);
  const [activeTab, setActiveTab] = useState<DsTab>("foundations");
  const [createOpen, setCreateOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [runName, setRunName] = useState("");
  const [scopeLabel, setScopeLabel] = useState("acme/ui + acme/tokens + figma library");
  const [strictMatching, setStrictMatching] = useState(true);
  const [selectedSources, setSelectedSources] = useState<Record<DsProvider, boolean>>({
    github: false,
    figma: true,
  });

  const {
    connections,
    runs,
    snapshots,
    activeSnapshotId,
    reviewItems,
    createRun,
    setRunStatus,
    completeRunWithMockResult,
    resolveReviewItem,
    activateSnapshot,
    canActivateSnapshot,
    getActiveSnapshot,
  } = useDesignSystemStore();

  const activeSnapshot = getActiveSnapshot();
  const connectedSources = (Object.keys(connections) as DsProvider[]).filter(
    (provider) => connections[provider].status === "connected"
  );

  const sortedRuns = useMemo(
    () =>
      [...runs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [runs]
  );

  const reviewSnapshot = useMemo(() => {
    const snapshotWithOpenReview = snapshots.find((snapshot) =>
      reviewItems.some(
        (item) => item.snapshotId === snapshot.id && item.status === "open"
      )
    );
    return snapshotWithOpenReview ?? activeSnapshot ?? snapshots[0];
  }, [activeSnapshot, reviewItems, snapshots]);

  const openReviewItems = useMemo(
    () =>
      reviewItems.filter(
        (item) => item.snapshotId === reviewSnapshot?.id && item.status === "open"
      ),
    [reviewItems, reviewSnapshot]
  );

  const canCreate = Object.values(selectedSources).some(Boolean);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const queueRunSimulation = (run: DsRun) => {
    const toRunning = window.setTimeout(() => {
      setRunStatus(run.id, "running");
    }, 650);
    const toComplete = window.setTimeout(() => {
      completeRunWithMockResult(run.id);
    }, 1900);
    timersRef.current.push(toRunning, toComplete);
  };

  const handleCreateRun = () => {
    const sources = (Object.keys(selectedSources) as DsProvider[]).filter(
      (provider) => selectedSources[provider]
    );
    if (sources.length === 0) return;
    const run = createRun({
      name: runName.trim() || `Design System Sync ${new Date().toLocaleTimeString()}`,
      sources,
      scopeLabel,
      strictMatching,
    });
    setCreateOpen(false);
    setStep(0);
    setRunName("");
    setActiveTab("runs");
    queueRunSimulation(run);
  };

  const triggerQuickSync = () => {
    const sources = connectedSources.length > 0 ? connectedSources : (["figma"] as DsProvider[]);
    const run = createRun({
      name: "Quick sync",
      sources,
      scopeLabel: "default sync scope",
      strictMatching: false,
    });
    setActiveTab("runs");
    queueRunSimulation(run);
  };

  const manageIntegrations = () => {
    router.push(
      `/integrations?from=knowledge-design-system&returnTo=${encodeURIComponent(
        "/knowledge/design-system"
      )}`
    );
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-5xl px-8 py-12">
        <button
          onClick={() => router.push("/knowledge")}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Product Knowledge
        </button>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Design System</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Code-ready foundations and components generated from GitHub + Figma.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={triggerQuickSync}>
              <RefreshCw size={13} />
              Sync now
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} />
              Create new
            </Button>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-white/[0.08] bg-surface-2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-foreground/35">
                Active snapshot
              </p>
              {activeSnapshot ? (
                <>
                  <p className="mt-1 text-sm font-medium text-foreground/90">
                    {activeSnapshot.name}{" "}
                    <span className="text-foreground/40">{activeSnapshot.version}</span>
                  </p>
                  <p className="mt-1 text-xs text-foreground/50">{activeSnapshot.summary}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground/50">No active snapshot yet.</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SourceChip
                provider="github"
                connected={connections.github.status === "connected"}
              />
              <SourceChip
                provider="figma"
                connected={connections.figma.status === "connected"}
              />
              <Button variant="ghost" size="sm" onClick={manageIntegrations}>
                Manage
                <ArrowUpRight size={13} />
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center rounded-lg border border-white/[0.08] p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white/[0.08] text-foreground"
                  : "text-foreground/45 hover:text-foreground/70"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "foundations" &&
          activeSnapshot &&
          activeSnapshot.foundations.length > 0 && (
          <div className="space-y-5">
            <div>{renderFoundationsSection(activeSnapshot.foundations[0])}</div>
            <div className="grid grid-cols-2 gap-5">
              {activeSnapshot.foundations.slice(1).map((section) => (
                <div key={section.id}>{renderFoundationsSection(section)}</div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "foundations" && activeSnapshot && activeSnapshot.foundations.length === 0 && (
          <div className="rounded-xl border border-white/[0.08] bg-surface-2 px-4 py-10 text-center text-sm text-foreground/50">
            No foundation tokens available in this snapshot.
          </div>
        )}
        {activeTab === "foundations" && activeSnapshot && activeSnapshot.foundations.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3">
            <p className="text-xs text-foreground/45">
              Tip: use <span className="text-foreground/70">Create new</span> to run another DS extraction and compare token evolution between snapshots.
            </p>
          </div>
        )}
        {activeTab === "foundations" && !activeSnapshot && (
          <div className="rounded-xl border border-white/[0.08] bg-surface-2 px-4 py-10 text-center text-sm text-foreground/50">
            No active snapshot yet. Run the Design System Agent to generate one.
          </div>
        )}

        {activeTab === "components" && activeSnapshot && (
          <div className="grid grid-cols-2 gap-4">
            {activeSnapshot.components.map((component) => (
              <div
                key={component.id}
                className="rounded-xl border border-white/[0.08] bg-surface-2 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Component size={14} className="text-foreground/50" />
                    <p className="text-sm font-medium">{component.name}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                      component.status === "ready"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : "bg-amber-400/10 text-amber-300"
                    )}
                  >
                    {component.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground/45">{component.description}</p>
                <div className="mt-3">{renderComponentPreview(component)}</div>
                <div className="mt-3 rounded-lg border border-white/[0.08] bg-black/20 px-2.5 py-2 text-[11px] text-foreground/65">
                  {component.importPath}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-foreground/45">
                  <span>{component.variants.length} variants</span>
                  <span>{component.props.length} props</span>
                  <button className="inline-flex items-center gap-1 hover:text-foreground/75">
                    <Copy size={11} />
                    copy import
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "components" && !activeSnapshot && (
          <div className="rounded-xl border border-white/[0.08] bg-surface-2 px-4 py-10 text-center text-sm text-foreground/50">
            No components available yet.
          </div>
        )}

        {activeTab === "mappings" && reviewSnapshot && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-surface-2 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{reviewSnapshot.name}</p>
                <p className="text-xs text-foreground/45">
                  {openReviewItems.length} open review{" "}
                  {openReviewItems.length === 1 ? "item" : "items"}
                </p>
              </div>
              {openReviewItems.length === 0 ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                  <Check size={13} />
                  All mappings resolved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                  <CircleAlert size={13} />
                  Review required
                </span>
              )}
            </div>

            {reviewSnapshot.mappings.map((mapping) => {
              const pendingReview = openReviewItems.find(
                (item) => item.mappingId === mapping.id
              );
              return (
                <div
                  key={mapping.id}
                  className="rounded-lg border border-white/[0.08] bg-surface-2 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{mapping.figmaName}</p>
                      <p className="truncate text-xs text-foreground/45">
                        {mapping.codeComponent
                          ? `Mapped to ${mapping.codeComponent}`
                          : "No code component mapped yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground/45">
                        {(mapping.confidence * 100).toFixed(0)}%
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                          mapping.status === "matched" &&
                            "bg-emerald-400/10 text-emerald-300",
                          mapping.status === "needs_review" &&
                            "bg-amber-400/10 text-amber-300",
                          mapping.status === "unmatched" &&
                            "bg-rose-400/10 text-rose-300"
                        )}
                      >
                        {mapping.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  {mapping.note && (
                    <p className="mt-2 text-xs text-foreground/45">{mapping.note}</p>
                  )}
                  {pendingReview && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          resolveReviewItem({
                            reviewItemId: pendingReview.id,
                            resolution: "accept",
                          })
                        }
                      >
                        Accept match
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          resolveReviewItem({
                            reviewItemId: pendingReview.id,
                            resolution: "remap",
                            remappedComponent: "AppShell",
                          })
                        }
                      >
                        Remap to AppShell
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          resolveReviewItem({
                            reviewItemId: pendingReview.id,
                            resolution: "mark_unmatched",
                          })
                        }
                      >
                        Keep unmatched
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "mappings" && !reviewSnapshot && (
          <div className="rounded-xl border border-white/[0.08] bg-surface-2 px-4 py-10 text-center text-sm text-foreground/50">
            No mapping data yet.
          </div>
        )}

        {activeTab === "runs" && (
          <div className="space-y-2">
            {sortedRuns.length === 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-surface-2 px-4 py-10 text-center text-sm text-foreground/50">
                No runs yet. Start a new Design System run.
              </div>
            )}
            {sortedRuns.map((run) => {
              const snapshot = run.snapshotId
                ? snapshots.find((item) => item.id === run.snapshotId)
                : undefined;
              const isActive = snapshot?.id === activeSnapshotId;
              const activatable = snapshot ? canActivateSnapshot(snapshot.id) : false;

              return (
                <div
                  key={run.id}
                  className="rounded-lg border border-white/[0.08] bg-surface-2 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{run.name}</p>
                      <p className="mt-0.5 text-xs text-foreground/45">
                        {run.scopeLabel} • {new Date(run.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        {run.sources.map((source) => (
                          <SourceChip
                            key={`${run.id}-${source}`}
                            provider={source}
                            connected={true}
                          />
                        ))}
                      </div>
                      {run.notes && (
                        <p className="mt-2 text-xs text-foreground/45">{run.notes}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                          statusClasses[run.status]
                        )}
                      >
                        {(run.status === "queued" || run.status === "running") && (
                          <Loader2 size={11} className="animate-spin" />
                        )}
                        {run.status.replace("_", " ")}
                      </span>
                      {snapshot && !isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!activatable}
                          onClick={() => activateSnapshot(snapshot.id)}
                        >
                          <Play size={12} />
                          Activate snapshot
                        </Button>
                      )}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                          <Check size={12} />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl !gap-0" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg">Create Design System run</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-5 flex gap-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    index <= step ? "bg-violet-500/70" : "bg-white/[0.08]"
                  )}
                />
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-foreground/45">
                  Choose the sources the Design System Agent should read.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(["github", "figma"] as DsProvider[]).map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() =>
                        setSelectedSources((prev) => ({
                          ...prev,
                          [provider]: !prev[provider],
                        }))
                      }
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all",
                        selectedSources[provider]
                          ? "border-violet-400/40 bg-violet-500/10"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]"
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        {provider === "github" ? (
                          <GitBranch size={14} className="text-foreground/65" />
                        ) : (
                          <PenTool size={14} className="text-foreground/65" />
                        )}
                        <span className="text-sm font-medium capitalize">{provider}</span>
                      </div>
                      <p className="text-xs text-foreground/45">
                        {provider === "github"
                          ? "Read components, exports, and token files."
                          : "Read styles, components, and variants from Figma."}
                      </p>
                    </button>
                  ))}
                </div>
                {!canCreate && (
                  <p className="inline-flex items-center gap-1 text-xs text-amber-300">
                    <CircleAlert size={12} />
                    Select at least one source to continue.
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <p className="text-xs text-foreground/45">
                  Define the source scope for this run.
                </p>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/50">Run name</label>
                  <Input
                    value={runName}
                    onChange={(event) => setRunName(event.target.value)}
                    placeholder="e.g. Checkout foundations sync"
                    className="bg-white/[0.03]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/50">
                    Scope (repo path / figma file)
                  </label>
                  <Input
                    value={scopeLabel}
                    onChange={(event) => setScopeLabel(event.target.value)}
                    className="bg-white/[0.03]"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-foreground/45">
                  Configure how strict component matching should be.
                </p>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={strictMatching}
                    onChange={(event) => setStrictMatching(event.target.checked)}
                    className="h-4 w-4 rounded border-white/[0.2] bg-transparent"
                  />
                  <span className="text-sm text-foreground/75">
                    Strict matching mode (higher precision, more review prompts)
                  </span>
                </label>
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                  <p className="text-xs text-foreground/45">
                    <span className="font-medium text-foreground/70">Sources:</span>{" "}
                    {(Object.keys(selectedSources) as DsProvider[])
                      .filter((provider) => selectedSources[provider])
                      .join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-foreground/45">
                    <span className="font-medium text-foreground/70">Scope:</span> {scopeLabel}
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => (step === 0 ? setCreateOpen(false) : setStep((prev) => prev - 1))}
            >
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep((prev) => prev + 1)} disabled={step === 0 && !canCreate}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateRun} disabled={!canCreate}>
                <Sparkles size={14} />
                Start run
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
