"use client";

import {
  Lightbulb,
  LayoutTemplate,
  GitBranch,
  Monitor,
  FileText,
  Component,
  Check,
  Bookmark,
  Smartphone,
} from "lucide-react";
import type { Output } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";

const outputTypeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  approach: Lightbulb,
  wireframe: LayoutTemplate,
  flow: GitBranch,
  screen: Monitor,
  text_block: FileText,
  component: Component,
};

const outputTypeLabels: Record<string, string> = {
  approach: "Approach",
  wireframe: "Wireframe",
  flow: "Flow",
  screen: "Screen",
  text_block: "Document",
  component: "Component",
};

export function OutputCard({
  output,
  onKeep,
}: {
  output: Output;
  onKeep: (outputId: string) => void;
}) {
  const { openTab } = useWorkspaceStore();
  const Icon = outputTypeIcons[output.type] || FileText;

  const handleClick = () => {
    openTab({
      id: `output-${output.id}`,
      type: "output",
      title: output.title,
      content: output.content,
      outputId: output.id,
    });
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon size={13} className="shrink-0 text-foreground/30" />
          <span className="text-[10px] uppercase tracking-wider text-foreground/30 font-medium">
            {outputTypeLabels[output.type]}
          </span>
          {output.platform === "mobile" && (
            <span className="flex h-4 items-center gap-0.5 rounded-full bg-violet-400/10 px-1.5 text-[9px] font-medium text-violet-400">
              <Smartphone size={9} />
              Mobile
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onKeep(output.id);
          }}
          className={cn(
            "flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-medium transition-colors",
            output.kept
              ? "bg-primary/10 text-primary"
              : "text-foreground/30 hover:bg-white/[0.06] hover:text-foreground/60"
          )}
        >
          {output.kept ? (
            <>
              <Check size={11} />
              Kept
            </>
          ) : (
            <>
              <Bookmark size={11} />
              Keep
            </>
          )}
        </button>
      </div>
      <h4 className="text-sm font-medium text-foreground/80 mb-1">
        {output.title}
      </h4>
      <p className="text-xs text-foreground/40 line-clamp-2">{output.summary}</p>
    </div>
  );
}
