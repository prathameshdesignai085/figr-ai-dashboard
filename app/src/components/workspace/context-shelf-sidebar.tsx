"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Globe,
  Image,
  FileSpreadsheet,
  Video,
  PenTool,
  Check,
  Lightbulb,
  LayoutTemplate,
  GitBranch,
  Monitor,
  Component,
  Plus,
  Upload,
  ClipboardPaste,
  Library,
} from "lucide-react";
import { nanoid } from "nanoid";
import type { Space, Shell, ContextItem, Output, KnowledgeCategory } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useShelfStore } from "@/stores/useShelfStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useShellStore } from "@/stores/useShellStore";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const contextTypeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  document: FileText,
  link: Globe,
  image: Image,
  spreadsheet: FileSpreadsheet,
  recording: Video,
  figma: PenTool,
};

const outputTypeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  approach: Lightbulb,
  wireframe: LayoutTemplate,
  flow: GitBranch,
  screen: Monitor,
  text_block: FileText,
  component: Component,
};

function inferContextType(file: File): ContextItem["type"] {
  if (file.type.startsWith("image/")) return "image";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["csv", "tsv", "xlsx", "xls"].includes(ext)) return "spreadsheet";
  return "document";
}

const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  "about-company": "About company",
  "feature-specs": "Feature specs",
  "business-logic": "Business logic",
  "customers-personas": "Customers & personas",
  "product-decisions": "Product decisions",
  "design-system": "Design system",
};

function contextItemNeedsPushIndicator(item: ContextItem) {
  return !item.fromProductKnowledge && !item.pushedToProductKnowledgeAt;
}

function contextItemIsSyncedToPk(item: ContextItem) {
  return !item.fromProductKnowledge && !!item.pushedToProductKnowledgeAt;
}

export function ContextShelfSidebar({
  workspace,
}: {
  workspace: Space | Shell;
}) {
  const isSpace = "stage" in workspace;
  const { sidebarMode, setSidebarMode, openTab } = useWorkspaceStore();
  const { selectedOutputIds, toggleOutputSelection } = useShelfStore();
  const { chats } = useChatStore();

  const keptOutputs: (Output & { chatName: string })[] = chats
    .filter((c) =>
      isSpace ? c.spaceId === workspace.id : c.shellId === workspace.id
    )
    .flatMap((c) =>
      c.messages
        .flatMap((m) => m.outputs)
        .filter((o) => o.kept)
        .map((o) => ({ ...o, chatName: c.name }))
    );

  const handleOpenContextItem = (item: ContextItem) => {
    const fallback =
      `# ${item.name}\n\n` +
      `Preview for **${item.type}** (${item.source}).\n\n` +
      `Connect storage to show the full document.`;
    openTab({
      id: `ctx-${item.id}`,
      type: "document",
      title: item.name,
      content: item.content ?? fallback,
      contextItemId: item.id,
    });
  };

  const handleOpenOutput = (output: Output) => {
    openTab({
      id: `output-${output.id}`,
      type: "output",
      title: output.title,
      content: output.content,
      outputId: output.id,
    });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Mode toggle */}
      <div className="flex h-9 items-center gap-0.5 border-b border-white/[0.06] px-2">
        <button
          onClick={() => setSidebarMode("context")}
          className={cn(
            "flex-1 rounded-md py-1 text-xs font-medium transition-colors",
            sidebarMode === "context"
              ? "bg-white/[0.06] text-foreground/70"
              : "text-foreground/30 hover:text-foreground/50"
          )}
        >
          Context
        </button>
        <button
          onClick={() => setSidebarMode("shelf")}
          className={cn(
            "flex-1 rounded-md py-1 text-xs font-medium transition-colors",
            sidebarMode === "shelf"
              ? "bg-white/[0.06] text-foreground/70"
              : "text-foreground/30 hover:text-foreground/50"
          )}
        >
          Shelf
          {keptOutputs.length > 0 && (
            <span className="ml-1 text-[10px] text-foreground/20">
              {keptOutputs.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {sidebarMode === "context" ? (
          <ContextView
            workspace={workspace}
            onOpenItem={handleOpenContextItem}
          />
        ) : (
          <ShelfView
            outputs={keptOutputs}
            selectedIds={selectedOutputIds}
            onToggleSelect={toggleOutputSelection}
            onOpenOutput={handleOpenOutput}
          />
        )}
      </div>
    </div>
  );
}

function ContextView({
  workspace,
  onOpenItem,
}: {
  workspace: Space | Shell;
  onOpenItem: (item: ContextItem) => void;
}) {
  const isSpace = "stage" in workspace;
  const updateSpace = useSpaceStore((s) => s.updateSpace);
  const updateShell = useShellStore((s) => s.updateShell);
  const promoteFromSpace = useKnowledgeStore((s) => s.promoteFromSpace);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pushPkOpen, setPushPkOpen] = useState(false);
  const [pushCategory, setPushCategory] = useState<KnowledgeCategory>("feature-specs");
  const [selectedPushIds, setSelectedPushIds] = useState<Set<string>>(new Set());
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteBody, setPasteBody] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pushableItems = useMemo(
    () => workspace.contextItems.filter(contextItemNeedsPushIndicator),
    [workspace.contextItems]
  );

  const linkedToProductKnowledgeCount = useMemo(
    () =>
      workspace.contextItems.filter(
        (i) => i.fromProductKnowledge || !!i.pushedToProductKnowledgeAt
      ).length,
    [workspace.contextItems]
  );

  const openPushDialog = useCallback(() => {
    const defaultCat =
      workspace.connectedKnowledge[0] ?? ("feature-specs" as KnowledgeCategory);
    setPushCategory(defaultCat);
    setSelectedPushIds(new Set(pushableItems.map((i) => i.id)));
    setPushPkOpen(true);
  }, [pushableItems, workspace.connectedKnowledge]);

  const togglePushSelect = useCallback((id: string) => {
    setSelectedPushIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handlePushToProductKnowledge = useCallback(() => {
    if (!isSpace) return;
    const toPush = workspace.contextItems.filter((i) =>
      selectedPushIds.has(i.id)
    );
    if (toPush.length === 0) return;
    const now = new Date().toISOString();
    promoteFromSpace(
      toPush.map((item) => ({
        category: pushCategory,
        name: item.name,
        type: item.type,
        source: "space-context",
        content:
          item.content ??
          `# ${item.name}\n\n_Exported from space context._`,
      }))
    );
    updateSpace(workspace.id, {
      contextItems: workspace.contextItems.map((item) =>
        selectedPushIds.has(item.id)
          ? { ...item, pushedToProductKnowledgeAt: now }
          : item
      ),
    });
    setPushPkOpen(false);
    setSelectedPushIds(new Set());
  }, [
    isSpace,
    promoteFromSpace,
    pushCategory,
    selectedPushIds,
    workspace.contextItems,
    workspace.id,
    updateSpace,
  ]);

  const appendItem = useCallback(
    (item: ContextItem) => {
      if (isSpace) {
        updateSpace(workspace.id, {
          contextItems: [...workspace.contextItems, item],
        });
      } else {
        updateShell(workspace.id, {
          contextItems: [...workspace.contextItems, item],
        });
      }
    },
    [isSpace, workspace.contextItems, workspace.id, updateSpace, updateShell]
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of [...files]) {
      const itemType = inferContextType(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const content =
          itemType === "image" && typeof result === "string"
            ? `![${file.name.replace(/[[\]]/g, "")}](${result})`
            : typeof result === "string"
              ? result
              : undefined;
        appendItem({
          id: `ctx-${nanoid(8)}`,
          name: file.name,
          type: itemType,
          source: "upload",
          addedAt: new Date().toISOString(),
          content,
        });
      };
      if (itemType === "image") reader.readAsDataURL(file);
      else reader.readAsText(file);
    }
  };

  const submitPaste = () => {
    const body = pasteBody.trim();
    if (!body) return;
    const derived =
      body
        .split("\n")
        .map((l) => l.trim())
        .find(Boolean) ?? "";
    const name =
      pasteTitle.trim() ||
      (derived.length > 72 ? `${derived.slice(0, 69)}…` : derived) ||
      "Pasted note";
    appendItem({
      id: `ctx-${nanoid(8)}`,
      name,
      type: "document",
      source: "paste",
      addedAt: new Date().toISOString(),
      content: body,
    });
    setPasteOpen(false);
    setPasteTitle("");
    setPasteBody("");
  };

  return (
    <div className="p-3 space-y-5">
      <div>
        <div className="relative mb-2 flex items-center gap-1" ref={menuRef}>
          <h4 className="min-w-0 flex-1 text-[10px] font-medium uppercase tracking-wider text-foreground/25">
            {isSpace ? "Space Context" : "Shell Context"}
          </h4>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="shrink-0 text-foreground/35 hover:bg-white/[0.06] hover:text-foreground/60"
            aria-label="Add context"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Plus className="size-3.5" strokeWidth={2} />
          </Button>
          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-20 mt-1 w-[9.75rem] overflow-hidden rounded-lg border border-white/[0.08] bg-[#141414] py-0.5 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-foreground/70 transition-colors hover:bg-white/[0.06]"
                onClick={() => {
                  setMenuOpen(false);
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="size-3.5 shrink-0 text-foreground/40" />
                Upload file
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-foreground/70 transition-colors hover:bg-white/[0.06]"
                onClick={() => {
                  setMenuOpen(false);
                  setPasteOpen(true);
                }}
              >
                <ClipboardPaste className="size-3.5 shrink-0 text-foreground/40" />
                Paste text
              </button>
            </div>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept=".txt,.md,.csv,.json,.tsv,text/plain,text/csv,text/markdown,image/*"
            multiple
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {workspace.contextItems.length > 0 ? (
          <>
            {workspace.contextItems.length > 1 ? (
              <p className="mb-1.5 text-[9px] leading-snug text-foreground/30">
                {workspace.contextItems.length} items
                {isSpace ? (
                  <>
                    {" · "}
                    {linkedToProductKnowledgeCount} in product knowledge
                    {pushableItems.length > 0
                      ? ` · ${pushableItems.length} to push`
                      : ""}
                  </>
                ) : null}
              </p>
            ) : null}
            <div
              className={cn(
                "space-y-1 overflow-x-hidden overflow-y-auto pr-0.5 [scrollbar-width:thin]",
                workspace.contextItems.length > 4
                  ? "max-h-[min(38vh,220px)]"
                  : "max-h-none"
              )}
            >
              {workspace.contextItems.map((item) => {
                const Icon = contextTypeIcons[item.type] || FileText;
                const pkTitle = item.fromProductKnowledge
                  ? "Linked from product knowledge"
                  : contextItemIsSyncedToPk(item)
                    ? "In product knowledge"
                    : "Not in product knowledge — push when finalized";
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={pkTitle}
                    onClick={() => onOpenItem(item)}
                    className="flex w-full min-h-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <span
                      className="flex w-4 shrink-0 justify-center"
                      aria-hidden
                    >
                      {item.fromProductKnowledge ? (
                        <Library size={11} className="text-foreground/25" />
                      ) : contextItemIsSyncedToPk(item) ? (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald-500/55"
                          title={pkTitle}
                        />
                      ) : (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-amber-500/65"
                          title={pkTitle}
                        />
                      )}
                    </span>
                    <Icon size={13} className="shrink-0 text-foreground/25" />
                    <span className="min-w-0 flex-1 truncate text-xs text-foreground/50">
                      {item.name}
                    </span>
                    <span className="max-w-[4.5rem] shrink-0 truncate text-right text-[10px] capitalize text-foreground/15">
                      {item.source.replace(/-/g, " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="px-0.5 text-xs text-foreground/20">No documents yet</p>
        )}

        {isSpace && pushableItems.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="mt-2.5 h-7 w-full border-white/[0.08] text-[11px] text-foreground/55 hover:bg-white/[0.04] hover:text-foreground/75"
            onClick={openPushDialog}
          >
            Update product knowledge
            <span className="ml-1 text-foreground/35">({pushableItems.length})</span>
          </Button>
        ) : null}
      </div>

      <Dialog
        open={pasteOpen}
        onOpenChange={(open) => {
          setPasteOpen(open);
          if (!open) {
            setPasteTitle("");
            setPasteBody("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Paste text</DialogTitle>
            <DialogDescription>
              Add a note or snippet as space context. It opens in a document tab
              like other context items.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="paste-context-title" className="text-xs text-foreground/45">
                Title (optional)
              </label>
              <Input
                id="paste-context-title"
                placeholder="e.g. Q2 checkout goals"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="paste-context-body" className="text-xs text-foreground/45">
                Content
              </label>
              <textarea
                id="paste-context-body"
                value={pasteBody}
                onChange={(e) => setPasteBody(e.target.value)}
                placeholder="Paste notes, requirements, or snippets…"
                className={cn(
                  "min-h-[120px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground outline-none transition-colors",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  "dark:bg-input/30"
                )}
              />
            </div>
          </div>
          <DialogFooter className="border-t-0 bg-transparent p-0 sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={submitPaste} disabled={!pasteBody.trim()}>
              Add to context
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pushPkOpen} onOpenChange={setPushPkOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Update product knowledge</DialogTitle>
            <DialogDescription>
              Choose space documents to add to the global source of truth. They
              remain in this space; Product Knowledge gets a copy for future
              projects.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="push-pk-category"
                className="text-xs text-foreground/45"
              >
                Category
              </label>
              <select
                id="push-pk-category"
                value={pushCategory}
                onChange={(e) =>
                  setPushCategory(e.target.value as KnowledgeCategory)
                }
                className="h-8 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {(Object.keys(KNOWLEDGE_CATEGORY_LABELS) as KnowledgeCategory[]).map(
                  (c) => (
                    <option key={c} value={c}>
                      {KNOWLEDGE_CATEGORY_LABELS[c]}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-foreground/45">Documents</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-[10px] text-foreground/35 hover:text-foreground/55"
                    onClick={() =>
                      setSelectedPushIds(new Set(pushableItems.map((i) => i.id)))
                    }
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    className="text-[10px] text-foreground/35 hover:text-foreground/55"
                    onClick={() => setSelectedPushIds(new Set())}
                  >
                    Clear
                  </button>
                </span>
              </div>
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-white/[0.06] p-1.5">
                {pushableItems.map((item) => {
                  const Icon = contextTypeIcons[item.type] || FileText;
                  const checked = selectedPushIds.has(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-white/[0.04]"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePushSelect(item.id)}
                        className="size-3.5 shrink-0 rounded border-white/20 bg-transparent accent-primary"
                      />
                      <Icon size={12} className="shrink-0 text-foreground/30" />
                      <span className="min-w-0 flex-1 truncate text-xs text-foreground/60">
                        {item.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="border-t-0 bg-transparent p-0 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPushPkOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePushToProductKnowledge}
              disabled={selectedPushIds.size === 0}
            >
              {selectedPushIds.size === 0
                ? "Push to product knowledge"
                : `Push ${selectedPushIds.size} ${
                    selectedPushIds.size === 1 ? "item" : "items"
                  }`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {workspace.instructions ? (
        <div>
          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-foreground/25">
            Instructions
          </h4>
          <p className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-xs leading-relaxed text-foreground/40">
            {workspace.instructions}
          </p>
        </div>
      ) : null}

      {workspace.connectedKnowledge.length > 0 ? (
        <div>
          <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-foreground/25">
            Connected Knowledge
          </h4>
          <div className="space-y-1">
            {workspace.connectedKnowledge.map((cat) => (
              <div key={cat} className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                <span className="text-xs capitalize text-foreground/40">
                  {cat.replace("-", " ").replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ShelfView({
  outputs,
  selectedIds,
  onToggleSelect,
  onOpenOutput,
}: {
  outputs: (Output & { chatName: string })[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpenOutput: (output: Output) => void;
}) {
  const selectedCount = [...selectedIds].filter((id) =>
    outputs.some((o) => o.id === id)
  ).length;

  if (outputs.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <p className="text-xs text-foreground/25">No kept outputs yet</p>
          <p className="mt-1 text-[10px] text-foreground/15">
            Click &quot;Keep&quot; on outputs in chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      {/* Header with count */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/25">
          {outputs.length} kept
        </span>
        {selectedCount > 0 && (
          <span className="text-[10px] text-primary">
            {selectedCount} selected
          </span>
        )}
      </div>

      {/* Output list */}
      <div className="space-y-0.5">
        {outputs.map((output) => {
          const Icon = outputTypeIcons[output.type] || FileText;
          const isSelected = selectedIds.has(output.id);

          return (
            <div
              key={output.id}
              className={cn(
                "flex items-start gap-2 rounded-lg px-2 py-2 transition-colors",
                isSelected ? "bg-primary/5" : "hover:bg-white/[0.03]"
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleSelect(output.id)}
                className={cn(
                  "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-white/[0.15] hover:border-white/[0.3]"
                )}
              >
                {isSelected && <Check size={8} className="text-white" />}
              </button>

              {/* Content */}
              <button
                onClick={() => onOpenOutput(output)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon size={11} className="shrink-0 text-foreground/25" />
                  <span className="text-xs font-medium text-foreground/60 truncate">
                    {output.title}
                  </span>
                </div>
                <p className="text-[10px] text-foreground/25">
                  {output.chatName} &middot;{" "}
                  {output.keptAt &&
                    formatDistanceToNow(new Date(output.keptAt), {
                      addSuffix: true,
                    })}
                </p>
              </button>
            </div>
          );
        })}
      </div>

      {/* Use as context button */}
      {selectedCount > 0 && (
        <div className="mt-3 px-2">
          <button className="w-full rounded-lg bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors">
            Use {selectedCount} as context
          </button>
        </div>
      )}
    </div>
  );
}
