"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  LayoutGrid,
  List,
  Star,
  MoreVertical,
  Upload,
  Globe,
  FileText,
  FileSpreadsheet,
  PenTool,
  GitBranch,
  Monitor,
  Camera,
  Check,
  ChevronDown,
} from "lucide-react";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useChatStore } from "@/stores/useChatStore";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";
import type { KnowledgeCategory, KnowledgeItem, TargetPlatform } from "@/types";
import { platformOptions, platformBadgeColors, PlatformIcon } from "@/lib/platform";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const knowledgeCategories: { id: KnowledgeCategory; label: string }[] = [
  { id: "about-company", label: "About Company" },
  { id: "feature-specs", label: "Feature Specs" },
  { id: "business-logic", label: "Business Logic" },
  { id: "customers-personas", label: "Customers & Personas" },
  { id: "product-decisions", label: "Product Decisions" },
  { id: "design-system", label: "Design System" },
];

const contextMethods = [
  { icon: Upload, label: "Upload files" },
  { icon: Globe, label: "Website link" },
  { icon: FileText, label: "Google Docs" },
  { icon: FileSpreadsheet, label: "Google Sheets" },
  { icon: PenTool, label: "Figma" },
  { icon: GitBranch, label: "GitHub" },
  { icon: Monitor, label: "Record screen" },
  { icon: Camera, label: "Capture screen" },
];

const stageBadgeColors: Record<string, string> = {
  brainstorm: "bg-amber-400/10 text-amber-400",
  wireframe: "bg-blue-400/10 text-blue-400",
  prototype: "bg-teal-400/10 text-teal-400",
  build: "bg-green-400/10 text-green-400",
};

export default function SpacesPage() {
  const router = useRouter();
  const { spaces, createSpace, toggleFavorite } = useSpaceStore();
  const { getChatsForSpace } = useChatStore();
  const { getCategoryCount, getItemsByCategory, items: allKnowledgeItems } = useKnowledgeStore();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPlatform, setNewPlatform] = useState<TargetPlatform>("web");
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<KnowledgeCategory>>(new Set());
  const [instructions, setInstructions] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCategory = (catId: KnowledgeCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleAllInCategory = (catId: KnowledgeCategory) => {
    const items = getItemsByCategory(catId);
    const allSelected = items.every((i) => selectedDocIds.has(i.id));
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      items.forEach((i) => {
        if (allSelected) next.delete(i.id);
        else next.add(i.id);
      });
      return next;
    });
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const space = createSpace(newName.trim(), newDescription.trim(), newPlatform);
    // In a real app we'd also save selectedKnowledge and instructions to the space
    setNewName("");
    setNewDescription("");
    setNewPlatform("web");
    setSelectedDocIds(new Set());
    setExpandedCategories(new Set());
    setInstructions("");
    setDialogOpen(false);
    router.push(`/space/${space.id}`);
  };

  const resetAndOpenDialog = () => {
    setNewName("");
    setNewDescription("");
    setNewPlatform("web");
    setSelectedDocIds(new Set());
    setExpandedCategories(new Set());
    setInstructions("");
    setDialogOpen(true);
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-4xl px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Spaces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {spaces.length} {spaces.length === 1 ? "space" : "spaces"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center rounded-lg border border-white/[0.08] p-0.5">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  view === "grid"
                    ? "bg-white/[0.08] text-foreground"
                    : "text-foreground/40 hover:text-foreground/60"
                )}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  view === "list"
                    ? "bg-white/[0.08] text-foreground"
                    : "text-foreground/40 hover:text-foreground/60"
                )}
              >
                <List size={14} />
              </button>
            </div>
            {/* Create button */}
            <button
              onClick={resetAndOpenDialog}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              <Plus size={14} />
              Create space
            </button>
          </div>
        </div>

        {/* Grid view */}
        {view === "grid" && (
          <div className="grid grid-cols-3 gap-4">
            {spaces.map((space) => (
                <div
                  key={space.id}
                  onClick={() => router.push(`/space/${space.id}`)}
                  className="relative flex flex-col items-start rounded-xl border border-white/[0.08] p-5 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all text-left group cursor-pointer"
                >
                  <div className="flex w-full items-start justify-between mb-3">
                    <span className="text-sm font-medium group-hover:text-foreground">
                      {space.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(space.id);
                        }}
                      >
                        <Star
                          size={14}
                          className={cn(
                            "transition-colors",
                            space.isFavorite
                              ? "text-amber-400 fill-amber-400"
                              : "text-foreground/20 hover:text-foreground/40"
                          )}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === space.id ? null : space.id);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/20 hover:text-foreground/50 transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Kebab dropdown */}
                  {menuOpenId === space.id && (
                    <div
                      className="absolute top-12 right-4 z-10 w-36 rounded-lg border border-white/[0.08] bg-[#161616] py-1 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setMenuOpenId(null)}
                        className="flex w-full px-3 py-1.5 text-xs text-foreground/70 hover:bg-white/[0.06] transition-colors"
                      >
                        Edit name
                      </button>
                      <button
                        onClick={() => setMenuOpenId(null)}
                        className="flex w-full px-3 py-1.5 text-xs text-foreground/70 hover:bg-white/[0.06] transition-colors"
                      >
                        Edit description
                      </button>
                      <button
                        onClick={() => setMenuOpenId(null)}
                        className="flex w-full px-3 py-1.5 text-xs text-red-400/70 hover:bg-white/[0.06] transition-colors"
                      >
                        Delete space
                      </button>
                    </div>
                  )}
                  {space.description && (
                    <p className="text-xs text-foreground/40 line-clamp-1 mb-4">
                      {space.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-auto">
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                        stageBadgeColors[space.stage]
                      )}
                    >
                      {space.stage}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize",
                        platformBadgeColors[space.targetPlatform]
                      )}
                    >
                      {space.targetPlatform}
                    </span>
                    <span className="text-xs text-foreground/30 ml-auto">
                      {formatDistanceToNow(new Date(space.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
            ))}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="space-y-1">
            {spaces.map((space) => (
                <div
                  key={space.id}
                  onClick={() => router.push(`/space/${space.id}`)}
                  className="flex w-full items-center gap-4 rounded-lg px-4 py-3 hover:bg-white/[0.03] transition-colors text-left cursor-pointer"
                >
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">
                    {space.name}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0",
                      stageBadgeColors[space.stage]
                    )}
                  >
                    {space.stage}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize shrink-0",
                      platformBadgeColors[space.targetPlatform]
                    )}
                  >
                    {space.targetPlatform}
                  </span>
                  <span className="text-xs text-foreground/30 shrink-0 w-24 text-right">
                    {formatDistanceToNow(new Date(space.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(space.id);
                    }}
                    className="shrink-0"
                  >
                    <Star
                      size={14}
                      className={cn(
                        "transition-colors",
                        space.isFavorite
                          ? "text-amber-400 fill-amber-400"
                          : "text-foreground/20 hover:text-foreground/40"
                      )}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="shrink-0 text-foreground/20 hover:text-foreground/50 transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Space Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl !gap-0" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg">Create a new space</DialogTitle>
          </DialogHeader>

          <div className="py-4 max-h-[65vh] overflow-y-auto">
            {/* Top row: Name + Description side by side */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1.5 block">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Checkout Redesign"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-white/[0.2]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1.5 block">
                  Description
                  <span className="text-foreground/20 ml-1 normal-case tracking-normal">optional</span>
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What is this space about?"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-white/[0.2]"
                />
              </div>
            </div>

            {/* Target Platform — drives prompts, default device chrome, On Device tab */}
            <div className="mb-6">
              <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-2.5 block">
                Target Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {platformOptions.map((opt) => {
                  const selected = newPlatform === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNewPlatform(opt.id)}
                      className={cn(
                        "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all",
                        selected
                          ? "border-white/[0.25] bg-white/[0.04]"
                          : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-md",
                            platformBadgeColors[opt.id]
                          )}
                        >
                          <PlatformIcon platform={opt.id} size={13} />
                        </span>
                        {selected && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.7]">
                            <Check size={10} className="text-black" />
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground/80">
                        {opt.label}
                      </span>
                      <span className="text-[11px] leading-snug text-foreground/40">
                        {opt.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Knowledge — expandable categories with docs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider">
                  Product Knowledge
                </label>
                {selectedDocIds.size > 0 && (
                  <span className="text-xs text-foreground/30">
                    {selectedDocIds.size} selected
                  </span>
                )}
              </div>
              <div className="rounded-lg border border-white/[0.06] divide-y divide-white/[0.04]">
                {knowledgeCategories.map((cat) => {
                  const items = getItemsByCategory(cat.id);
                  const expanded = expandedCategories.has(cat.id);
                  const selectedInCat = items.filter((i) => selectedDocIds.has(i.id)).length;
                  const allSelected = items.length > 0 && selectedInCat === items.length;

                  return (
                    <div key={cat.id}>
                      {/* Category header */}
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => toggleAllInCategory(cat.id)}
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            allSelected
                              ? "bg-white/[0.7] border-white/[0.7]"
                              : selectedInCat > 0
                                ? "border-white/[0.3] bg-white/[0.15]"
                                : "border-white/[0.12]"
                          )}
                        >
                          {(allSelected || selectedInCat > 0) && (
                            <Check size={10} className={allSelected ? "text-black" : "text-white/60"} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className="flex flex-1 items-center justify-between min-w-0"
                        >
                          <span className="text-sm text-foreground/70">{cat.label}</span>
                          <div className="flex items-center gap-2">
                            {selectedInCat > 0 && (
                              <span className="text-xs text-foreground/30">{selectedInCat}/{items.length}</span>
                            )}
                            {selectedInCat === 0 && (
                              <span className="text-xs text-foreground/20">{items.length}</span>
                            )}
                            <ChevronDown
                              size={14}
                              className={cn(
                                "text-foreground/25 transition-transform",
                                expanded && "rotate-180"
                              )}
                            />
                          </div>
                        </button>
                      </div>

                      {/* Expanded docs list */}
                      {expanded && items.length > 0 && (
                        <div className="pb-2 px-3">
                          <div className="ml-7 space-y-0.5">
                            {items.map((item) => {
                              const checked = selectedDocIds.has(item.id);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => toggleDoc(item.id)}
                                  className={cn(
                                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                                    checked
                                      ? "bg-white/[0.04]"
                                      : "hover:bg-white/[0.02]"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                                      checked
                                        ? "bg-white/[0.6] border-white/[0.6]"
                                        : "border-white/[0.12]"
                                    )}
                                  >
                                    {checked && <Check size={8} className="text-black" />}
                                  </div>
                                  <span className={cn(
                                    "text-[13px] truncate",
                                    checked ? "text-foreground/70" : "text-foreground/40"
                                  )}>
                                    {item.name}
                                  </span>
                                  <span className="ml-auto text-[11px] text-foreground/15 capitalize">
                                    {item.source.replace("-", " ")}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Context */}
            <div className="mb-6">
              <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-2.5 block">
                Add Context
              </label>
              <div className="flex flex-wrap gap-2">
                {contextMethods.map((method) => (
                  <button
                    key={method.label}
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs text-foreground/40 hover:border-white/[0.12] hover:text-foreground/60 transition-all"
                  >
                    <method.icon size={12} />
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1.5 block">
                Instructions for AI
                <span className="text-foreground/20 ml-1 normal-case tracking-normal">optional</span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe goals, constraints, or specific instructions for how the AI should behave in this space..."
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-white/[0.2]"
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="rounded-lg px-4 py-2 text-sm text-foreground/40 hover:text-foreground/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Create space
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
