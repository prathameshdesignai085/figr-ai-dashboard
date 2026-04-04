"use client";

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
} from "lucide-react";
import type { Space, ContextItem, Output } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useShelfStore } from "@/stores/useShelfStore";
import { useChatStore } from "@/stores/useChatStore";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

export function ContextShelfSidebar({ space }: { space: Space }) {
  const { sidebarMode, setSidebarMode, openTab } = useWorkspaceStore();
  const { selectedOutputIds, toggleOutputSelection } = useShelfStore();
  const { chats } = useChatStore();
  const { getCategoryCount } = useKnowledgeStore();

  // Get all kept outputs in this space
  const keptOutputs: (Output & { chatName: string })[] = chats
    .filter((c) => c.spaceId === space.id)
    .flatMap((c) =>
      c.messages
        .flatMap((m) => m.outputs)
        .filter((o) => o.kept)
        .map((o) => ({ ...o, chatName: c.name }))
    );

  const handleOpenContextItem = (item: ContextItem) => {
    openTab({
      id: `ctx-${item.id}`,
      type: "document",
      title: item.name,
      content: `# ${item.name}\n\nThis is a preview of the ${item.type} from ${item.source}.\n\nIn a real implementation, this would render the actual document content.`,
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
          <ContextView space={space} onOpenItem={handleOpenContextItem} />
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
  space,
  onOpenItem,
}: {
  space: Space;
  onOpenItem: (item: ContextItem) => void;
}) {
  return (
    <div className="p-3 space-y-5">
      {/* Space Context Items */}
      {space.contextItems.length > 0 && (
        <div>
          <h4 className="text-[10px] font-medium uppercase tracking-wider text-foreground/25 mb-2">
            Space Context
          </h4>
          <div className="space-y-1">
            {space.contextItems.map((item) => {
              const Icon = contextTypeIcons[item.type] || FileText;
              return (
                <button
                  key={item.id}
                  onClick={() => onOpenItem(item)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/[0.04] transition-colors"
                >
                  <Icon size={13} className="shrink-0 text-foreground/25" />
                  <span className="text-xs text-foreground/50 truncate">
                    {item.name}
                  </span>
                  <span className="ml-auto text-[10px] text-foreground/15 capitalize shrink-0">
                    {item.source}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      {space.instructions && (
        <div>
          <h4 className="text-[10px] font-medium uppercase tracking-wider text-foreground/25 mb-2">
            Instructions
          </h4>
          <p className="text-xs text-foreground/40 leading-relaxed rounded-lg border border-white/[0.04] bg-white/[0.02] p-3">
            {space.instructions}
          </p>
        </div>
      )}

      {/* Connected Knowledge */}
      {space.connectedKnowledge.length > 0 && (
        <div>
          <h4 className="text-[10px] font-medium uppercase tracking-wider text-foreground/25 mb-2">
            Connected Knowledge
          </h4>
          <div className="space-y-1">
            {space.connectedKnowledge.map((cat) => (
              <div
                key={cat}
                className="flex items-center gap-2 rounded-md px-2 py-1.5"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                <span className="text-xs text-foreground/40 capitalize">
                  {cat.replace("-", " ").replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {space.contextItems.length === 0 && !space.instructions && space.connectedKnowledge.length === 0 && (
        <div className="flex h-32 items-center justify-center">
          <p className="text-xs text-foreground/20">No context added yet</p>
        </div>
      )}
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
