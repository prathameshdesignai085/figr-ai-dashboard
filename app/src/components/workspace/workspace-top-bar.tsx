"use client";

import { ArrowLeft, PanelRight, Layout, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Space } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";

const stageBadgeColors: Record<string, string> = {
  brainstorm: "bg-amber-400/10 text-amber-400",
  wireframe: "bg-blue-400/10 text-blue-400",
  prototype: "bg-teal-400/10 text-teal-400",
  build: "bg-green-400/10 text-green-400",
};

export function WorkspaceTopBar({
  space,
  onSettingsClick,
}: {
  space: Space;
  onSettingsClick: () => void;
}) {
  const router = useRouter();
  const { toggleSidebar, sidebarOpen, sidebarMode, openCanvasTab, containerOpen } =
    useWorkspaceStore();

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] bg-background px-3">
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/")}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/40 hover:text-foreground/70 hover:bg-white/[0.04] transition-colors"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          onClick={onSettingsClick}
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          {space.name}
        </button>
        <span
          className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
            stageBadgeColors[space.stage]
          )}
        >
          {space.stage}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => toggleSidebar("shelf")}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            sidebarOpen && sidebarMode === "shelf"
              ? "bg-white/[0.08] text-foreground/80"
              : "text-foreground/40 hover:text-foreground/60 hover:bg-white/[0.04]"
          )}
        >
          <PanelRight size={14} />
          Shelf
        </button>
        <button
          onClick={() => openCanvasTab()}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            containerOpen && useWorkspaceStore.getState().activeTabId === "canvas"
              ? "bg-white/[0.08] text-foreground/80"
              : "text-foreground/40 hover:text-foreground/60 hover:bg-white/[0.04]"
          )}
        >
          <Layout size={14} />
          Canvas
        </button>
        <button
          onClick={onSettingsClick}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/40 hover:text-foreground/60 hover:bg-white/[0.04] transition-colors"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
