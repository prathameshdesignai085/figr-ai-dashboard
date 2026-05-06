"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ExternalLink,
  GitBranch,
  PenTool,
  Plus,
  X,
} from "lucide-react";
import { useShellStore } from "@/stores/useShellStore";
import { useChatStore } from "@/stores/useChatStore";
import { useDesignSystemStore } from "@/stores/useDesignSystemStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ShellFigmaFrameRef,
  ShellMappingReviewItem,
  ShellScaffoldPack,
} from "@/types";

const STEP_LABELS = [
  "Tech stack",
  "Sources",
  "DS binding",
  "Scaffolds",
  "Tokens & publish",
] as const;

const STACK_CHIPS = [
  "Next.js",
  "React",
  "Vue",
  "Tailwind CSS",
  "shadcn/ui",
  "Radix UI",
] as const;

function splitStackParts(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinStackParts(parts: string[]): string {
  return parts.join(", ");
}

function parseFigmaUrl(url: string) {
  const clean = url.trim();
  if (!clean) return null;
  if (!clean.includes("figma.com")) return null;

  let fileKey: string | undefined;
  let nodeId: string | undefined;
  try {
    const parsed = new URL(clean);
    const segs = parsed.pathname.split("/").filter(Boolean);
    const fileIndex = segs.findIndex((entry) => entry === "file");
    if (fileIndex >= 0 && segs[fileIndex + 1]) fileKey = segs[fileIndex + 1];
    nodeId = parsed.searchParams.get("node-id") ?? undefined;
  } catch {
    // fallback extraction for partial urls
    const fileMatch = clean.match(/\/file\/([^/?#]+)/);
    const nodeMatch = clean.match(/node-id=([^&#]+)/);
    fileKey = fileMatch?.[1];
    nodeId = nodeMatch?.[1];
  }
  if (!fileKey) return null;
  return { fileKey, nodeId };
}

function deriveScaffoldPacks(frames: ShellFigmaFrameRef[], componentIds: string[]) {
  if (frames.length === 0) return [];
  const byFlow = new Map<string, ShellFigmaFrameRef[]>();
  for (const frame of frames) {
    const key = frame.flowTag || "general";
    byFlow.set(key, [...(byFlow.get(key) ?? []), frame]);
  }
  const packs: ShellScaffoldPack[] = [];
  for (const [flow, flowFrames] of byFlow.entries()) {
    packs.push({
      id: `pack-${flow.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`,
      name:
        flow === "general"
          ? "General starter"
          : `${flow.charAt(0).toUpperCase()}${flow.slice(1)} starter`,
      description: `Generated from ${flowFrames.length} Figma frame(s).`,
      featureTag: flow,
      sourceFrameIds: flowFrames.map((frame) => frame.id),
      recommendedComponentIds: componentIds.slice(0, 5),
      selected: packs.length === 0,
    });
  }
  return packs;
}

function deriveMappingReviewItems(frames: ShellFigmaFrameRef[], componentNames: string[]) {
  return frames.map((frame, index): ShellMappingReviewItem => ({
    id: `map-${frame.id}`,
    frameRefId: frame.id,
    figmaName: frame.frameName || frame.label,
    componentName: componentNames[index % Math.max(componentNames.length, 1)] ?? null,
    confidence: Number((0.62 + (index % 3) * 0.13).toFixed(2)),
    status: index % 4 === 0 ? "open" : "resolved",
    resolution: index % 4 === 0 ? undefined : "accept",
  }));
}

export default function NewShellPage() {
  const router = useRouter();
  const createShell = useShellStore((s) => s.createShell);
  const createShellChat = useChatStore((s) => s.createShellChat);
  const dsSnapshots = useDesignSystemStore((s) => s.snapshots);
  const activeSnapshot = useDesignSystemStore((s) => s.getActiveSnapshot());
  const dsConnections = useDesignSystemStore((s) => s.connections);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [packageManager, setPackageManager] = useState("");
  const [appRouterNote, setAppRouterNote] = useState("");
  const [designSystemNote, setDesignSystemNote] = useState("");
  const [tokenPreferences, setTokenPreferences] = useState("");
  const [githubRepo, setGithubRepo] = useState("acme/monorepo");
  const [githubBranch, setGithubBranch] = useState("main");
  const [githubPaths, setGithubPaths] = useState("apps/web, packages/ui, packages/tokens");
  const [githubPackages, setGithubPackages] = useState("@acme/ui, @acme/tokens");
  const [figmaLinkInput, setFigmaLinkInput] = useState("");
  const [figmaLabelInput, setFigmaLabelInput] = useState("");
  const [figmaFlowTagInput, setFigmaFlowTagInput] = useState("general");
  const [figmaRoleInput, setFigmaRoleInput] = useState<"reference" | "scaffold" | "component-source">("scaffold");
  const [figmaFrames, setFigmaFrames] = useState<ShellFigmaFrameRef[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("");
  const [allowGenericFallback, setAllowGenericFallback] = useState(true);
  const [scaffoldPacks, setScaffoldPacks] = useState<ShellScaffoldPack[]>([]);
  const [mappingReviewItems, setMappingReviewItems] = useState<ShellMappingReviewItem[]>([]);

  const canAdvanceFromStep0 = name.trim().length > 0;
  const selectedSnapshot = useMemo(
    () => dsSnapshots.find((snapshot) => snapshot.id === selectedSnapshotId),
    [dsSnapshots, selectedSnapshotId]
  );
  const connectedDs = dsConnections.github.status === "connected" || dsConnections.figma.status === "connected";

  const toggleChip = (label: string) => {
    const parts = splitStackParts(techStack);
    const lower = label.toLowerCase();
    const idx = parts.findIndex((p) => p.toLowerCase() === lower);
    if (idx >= 0) {
      parts.splice(idx, 1);
    } else {
      parts.push(label);
    }
    setTechStack(joinStackParts(parts));
  };

  const chipActive = (label: string) =>
    splitStackParts(techStack).some((p) => p.toLowerCase() === label.toLowerCase());

  const canAdvanceByStep = useMemo(() => {
    if (step === 0) return canAdvanceFromStep0;
    if (step === 1) return githubRepo.trim().length > 0 || figmaFrames.length > 0;
    if (step === 2) return !!selectedSnapshot || allowGenericFallback;
    if (step === 3) {
      // Mock-first rule: mapping/scaffold review is informative, not blocking.
      // If packs exist, require at least one selection; if none exist, allow proceeding.
      return (
        scaffoldPacks.length === 0 ||
        scaffoldPacks.some((pack) => pack.selected)
      );
    }
    return true;
  }, [
    allowGenericFallback,
    canAdvanceFromStep0,
    figmaFrames.length,
    githubRepo,
    scaffoldPacks,
    selectedSnapshot,
    step,
  ]);

  const addFigmaFrame = () => {
    const parsed = parseFigmaUrl(figmaLinkInput);
    if (!parsed) return;
    const id = `frame-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const label = figmaLabelInput.trim() || `Frame ${figmaFrames.length + 1}`;
    const frame: ShellFigmaFrameRef = {
      id,
      label,
      url: figmaLinkInput.trim(),
      fileKey: parsed.fileKey,
      nodeId: parsed.nodeId,
      fileName: parsed.fileKey,
      frameName: label,
      role: figmaRoleInput,
      flowTag: figmaFlowTagInput.trim() || "general",
    };
    const nextFrames = [...figmaFrames, frame];
    setFigmaFrames(nextFrames);
    setFigmaLinkInput("");
    setFigmaLabelInput("");

    if (selectedSnapshot) {
      const packs = deriveScaffoldPacks(
        nextFrames,
        selectedSnapshot.components.map((component) => component.id)
      );
      const mappings = deriveMappingReviewItems(
        nextFrames,
        selectedSnapshot.components.map((component) => component.name)
      );
      setScaffoldPacks(packs);
      setMappingReviewItems(mappings);
    }
  };

  const bindSnapshot = (snapshotId: string) => {
    setSelectedSnapshotId(snapshotId);
    const snapshot = dsSnapshots.find((item) => item.id === snapshotId);
    if (!snapshot) return;
    setScaffoldPacks(
      deriveScaffoldPacks(
        figmaFrames,
        snapshot.components.map((component) => component.id)
      )
    );
    setMappingReviewItems(
      deriveMappingReviewItems(
        figmaFrames,
        snapshot.components.map((component) => component.name)
      )
    );
  };

  const finish = () => {
    const selectedPacks = scaffoldPacks.filter((pack) => pack.selected);
    const unresolvedMappings = mappingReviewItems.filter(
      (item) => item.status === "open"
    ).length;
    const totalMappings = mappingReviewItems.length || 1;
    const resolvedMappings = totalMappings - unresolvedMappings;
    const dsCoverage = Math.round((resolvedMappings / totalMappings) * 100);
    const tokenCompliance = selectedSnapshot ? 92 : allowGenericFallback ? 70 : 0;

    const combinedDesign = [
      designSystemNote.trim(),
      figmaFrames.length > 0
        ? `Figma source frames: ${figmaFrames.map((frame) => frame.label).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const shell = createShell({
      name: name.trim(),
      description: description.trim(),
      techStack: techStack.trim(),
      designSystemNote: combinedDesign,
      tokenPreferences: tokenPreferences.trim(),
      sourceRefs: {
        githubScopeRefs: githubRepo.trim()
          ? [
              {
                id: "gh-scope-primary",
                label: "Primary code scope",
                repo: githubRepo.trim(),
                branch: githubBranch.trim() || "main",
                paths: splitStackParts(githubPaths),
                packages: splitStackParts(githubPackages),
              },
            ]
          : [],
        figmaFrameRefs: figmaFrames,
      },
      dsSnapshotRef: selectedSnapshot
        ? {
            snapshotId: selectedSnapshot.id,
            name: selectedSnapshot.name,
            version: selectedSnapshot.version,
          }
        : undefined,
      scaffoldPacks: selectedPacks.length > 0 ? selectedPacks : scaffoldPacks,
      mappingReviewItems,
      dsUsageSummary: {
        snapshotId: selectedSnapshot?.id,
        componentIds: selectedSnapshot
          ? [...new Set(selectedPacks.flatMap((pack) => pack.recommendedComponentIds))]
          : [],
        componentNames: selectedSnapshot
          ? selectedSnapshot.components
              .filter((component) =>
                selectedPacks
                  .flatMap((pack) => pack.recommendedComponentIds)
                  .includes(component.id)
              )
              .map((component) => component.name)
          : [],
        notes: selectedSnapshot
          ? "Bound to Design System snapshot for shell generation."
          : "Generic fallback mode enabled (no snapshot bound).",
      },
      quality: {
        dsCoverage,
        tokenCompliance,
        unresolvedMappings,
        warnings: [
          ...(selectedSnapshot ? [] : ["No DS snapshot selected; fallback mode used."]),
          ...(unresolvedMappings > 0
            ? [`${unresolvedMappings} mapping review item(s) still open.`]
            : []),
        ],
      },
      packageManager: packageManager.trim() || undefined,
      appRouterNote: appRouterNote.trim() || undefined,
    });
    const chat = createShellChat(shell.id, "Main");
    router.replace(`/shells/${shell.id}/chat/${chat.id}`);
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-lg px-6 py-10">
        <button
          type="button"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : router.push("/shells"))}
          className="mb-6 flex items-center gap-1 text-xs text-foreground/45 transition-colors hover:text-foreground/70"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {step > 0 ? "Back" : "Shells"}
        </button>

        <div className="mb-8 flex gap-1">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-violet-500/60" : "bg-white/[0.06]"
              )}
              title={label}
            />
          ))}
        </div>

        <h1 className="text-xl font-semibold text-foreground">
          {step === 0 && "Stack & identity"}
          {step === 1 && "Sources"}
          {step === 2 && "Design system binding"}
          {step === 3 && "Scaffold packs & mapping review"}
          {step === 4 && "Tokens & publish"}
        </h1>
        <p className="mt-1 text-sm text-foreground/40">
          Step {step + 1} of {STEP_LABELS.length}
        </p>

        <div className="mt-8 space-y-5">
          {step === 0 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                The stack you set here drives{" "}
                <span className="text-foreground/70">scaffolding assumptions</span>{" "}
                and how the assistant reasons about components, file layout, and
                dependencies. Be specific—this becomes part of the shell&apos;s
                instructions.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Shell name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing landing shell"
                  className="bg-white/[0.03]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Description (optional)
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="One line about what this shell is for"
                  className="bg-white/[0.03]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground/45">
                  Quick stack
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STACK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        chipActive(chip)
                          ? "border-violet-500/50 bg-violet-500/15 text-violet-200/90"
                          : "border-white/[0.08] text-foreground/45 hover:border-white/[0.14] hover:text-foreground/65"
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Tech stack (detail)
                </label>
                <textarea
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="Add frameworks, UI libs, testing tools, or anything else (comma-separated is fine)"
                  rows={3}
                  className={cn(
                    "w-full resize-none rounded-lg border border-input bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none",
                    "placeholder:text-foreground/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="shell-pm"
                    className="text-xs font-medium text-foreground/45"
                  >
                    Package manager
                  </label>
                  <select
                    id="shell-pm"
                    value={packageManager}
                    onChange={(e) => setPackageManager(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="npm">npm</option>
                    <option value="pnpm">pnpm</option>
                    <option value="yarn">Yarn</option>
                    <option value="bun">Bun</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="shell-router"
                    className="text-xs font-medium text-foreground/45"
                  >
                    Router / app structure (optional)
                  </label>
                  <Input
                    id="shell-router"
                    value={appRouterNote}
                    onChange={(e) => setAppRouterNote(e.target.value)}
                    placeholder="e.g. Next.js App Router, src/app, monorepo packages/ui"
                    className="bg-white/[0.03]"
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                Add source references. These are the artifacts the shell agent uses
                to generate scaffold packs and map components.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">GitHub scope</label>
                <Input
                  value={githubRepo}
                  onChange={(event) => setGithubRepo(event.target.value)}
                  placeholder="repo, e.g. acme/monorepo"
                  className="bg-white/[0.03]"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={githubBranch}
                    onChange={(event) => setGithubBranch(event.target.value)}
                    placeholder="branch"
                    className="bg-white/[0.03]"
                  />
                  <Input
                    value={githubPackages}
                    onChange={(event) => setGithubPackages(event.target.value)}
                    placeholder="packages, comma separated"
                    className="bg-white/[0.03]"
                  />
                </div>
                <Input
                  value={githubPaths}
                  onChange={(event) => setGithubPaths(event.target.value)}
                  placeholder="paths, comma separated"
                  className="bg-white/[0.03]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">Figma frames / screens</label>
                <Input
                  value={figmaLinkInput}
                  onChange={(event) => setFigmaLinkInput(event.target.value)}
                  placeholder="Paste Figma frame URL with node-id"
                  className="bg-white/[0.03]"
                />
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    value={figmaLabelInput}
                    onChange={(event) => setFigmaLabelInput(event.target.value)}
                    placeholder="label"
                    className="bg-white/[0.03]"
                  />
                  <Input
                    value={figmaFlowTagInput}
                    onChange={(event) => setFigmaFlowTagInput(event.target.value)}
                    placeholder="flow tag"
                    className="bg-white/[0.03]"
                  />
                  <select
                    value={figmaRoleInput}
                    onChange={(event) =>
                      setFigmaRoleInput(
                        event.target.value as "reference" | "scaffold" | "component-source"
                      )
                    }
                    className="h-8 w-full rounded-lg border border-input bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <option value="scaffold">scaffold</option>
                    <option value="reference">reference</option>
                    <option value="component-source">component-source</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFigmaFrame}
                  disabled={!parseFigmaUrl(figmaLinkInput)}
                >
                  <Plus className="size-3.5" />
                  Add frame link
                </Button>
                {figmaFrames.length > 0 && (
                  <div className="space-y-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] p-2">
                    {figmaFrames.map((frame) => (
                      <div
                        key={frame.id}
                        className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-black/10 px-2 py-1.5"
                      >
                        <PenTool className="size-3.5 shrink-0 text-foreground/50" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs text-foreground/80">{frame.label}</p>
                          <p className="truncate text-[10px] text-foreground/35">
                            {frame.flowTag || "general"} • {frame.role}
                          </p>
                        </div>
                        <a
                          href={frame.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground/40 hover:text-foreground/65"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setFigmaFrames((prev) => prev.filter((entry) => entry.id !== frame.id))
                          }
                          className="text-foreground/35 hover:text-foreground/65"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                Bind the shell to a Design System snapshot so generated scaffolds use
                real DS components.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">Snapshot</label>
                <select
                  value={selectedSnapshotId}
                  onChange={(event) => bindSnapshot(event.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <option value="">Select snapshot</option>
                  {dsSnapshots.map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {snapshot.name} {snapshot.version}
                    </option>
                  ))}
                </select>
                {activeSnapshot && (
                  <p className="text-[11px] text-foreground/40">
                    Active snapshot: {activeSnapshot.name} {activeSnapshot.version}
                  </p>
                )}
                <label className="mt-2 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allowGenericFallback}
                    onChange={(event) => setAllowGenericFallback(event.target.checked)}
                    className="size-3.5 rounded border-white/25 bg-transparent"
                  />
                  <span className="text-xs text-foreground/65">
                    Allow generic fallback when no snapshot selected
                  </span>
                </label>
                {!connectedDs && (
                  <p className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                    <CircleAlert className="size-3.5" />
                    GitHub/Figma are not connected in Integrations.
                  </p>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                Select scaffold packs and resolve frame-to-component mappings before publish.
              </p>
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                  Scaffold packs
                </h3>
                {scaffoldPacks.length === 0 ? (
                  <p className="text-xs text-foreground/35">
                    Add Figma frame links and bind a DS snapshot to generate packs.
                  </p>
                ) : (
                  scaffoldPacks.map((pack) => (
                    <label
                      key={pack.id}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={pack.selected}
                        onChange={(event) =>
                          setScaffoldPacks((prev) =>
                            prev.map((entry) =>
                              entry.id === pack.id
                                ? { ...entry, selected: event.target.checked }
                                : entry
                            )
                          )
                        }
                        className="mt-0.5 size-3.5 rounded border-white/25 bg-transparent"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground/80">{pack.name}</p>
                        <p className="text-xs text-foreground/40">{pack.description}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                  Mapping review
                </h3>
                {mappingReviewItems.length === 0 ? (
                  <p className="text-xs text-foreground/35">No mapping items yet.</p>
                ) : (
                  mappingReviewItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-foreground/75">{item.figmaName}</p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] uppercase",
                            item.status === "resolved"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : item.status === "deferred"
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-rose-500/15 text-rose-300"
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-foreground/45">
                        {Math.round(item.confidence * 100)}% •{" "}
                        {item.componentName ?? "No component mapped"}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            setMappingReviewItems((prev) =>
                              prev.map((entry) =>
                                entry.id === item.id
                                  ? { ...entry, status: "resolved", resolution: "accept" }
                                  : entry
                              )
                            )
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            setMappingReviewItems((prev) =>
                              prev.map((entry) =>
                                entry.id === item.id
                                  ? {
                                      ...entry,
                                      status: "resolved",
                                      componentName: "Card",
                                      resolution: "remap",
                                    }
                                  : entry
                              )
                            )
                          }
                        >
                          Remap
                        </Button>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            setMappingReviewItems((prev) =>
                              prev.map((entry) =>
                                entry.id === item.id
                                  ? { ...entry, status: "deferred", resolution: "defer" }
                                  : entry
                              )
                            )
                          }
                        >
                          Defer
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                Final constraints and quality summary before publish.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Design system notes
                </label>
                <textarea
                  value={designSystemNote}
                  onChange={(event) => setDesignSystemNote(event.target.value)}
                  placeholder="Any shell-specific DS guidance for the agent..."
                  rows={3}
                  className={cn(
                    "w-full resize-y rounded-lg border border-input bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none",
                    "placeholder:text-foreground/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Token & layout preferences
                </label>
                <textarea
                  value={tokenPreferences}
                  onChange={(event) => setTokenPreferences(event.target.value)}
                  placeholder="Radius, spacing scale, typography roles, grid, density…"
                  rows={4}
                  className={cn(
                    "w-full resize-y rounded-lg border border-input bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none",
                    "placeholder:text-foreground/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  )}
                />
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-foreground/55">
                <p>
                  Selected packs:{" "}
                  {scaffoldPacks.filter((pack) => pack.selected).length}
                </p>
                <p className="mt-1">
                  Open mappings:{" "}
                  {mappingReviewItems.filter((item) => item.status === "open").length}
                </p>
                <p className="mt-1">
                  Bound snapshot:{" "}
                  {selectedSnapshot
                    ? `${selectedSnapshot.name} ${selectedSnapshot.version}`
                    : allowGenericFallback
                      ? "Generic fallback"
                      : "None"}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-10 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(step === 0 && "invisible pointer-events-none")}
          >
            Previous
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button
              type="button"
              disabled={!canAdvanceByStep}
              onClick={() => setStep((s) => s + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="button" onClick={finish} className="gap-1" disabled={!canAdvanceByStep}>
              <Check className="size-4" />
              Finish
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
