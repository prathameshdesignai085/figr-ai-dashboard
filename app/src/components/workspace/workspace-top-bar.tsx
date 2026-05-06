"use client";

import { useState } from "react";
import { ArrowLeft, PanelRight, Layout, Settings, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Space } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useHandoverStore } from "@/stores/useHandoverStore";
import { cn } from "@/lib/utils";
import { platformBadgeColors, PlatformIcon, platformLabel } from "@/lib/platform";
import { HandoverPublishModal } from "@/components/handover/handover-publish-modal";

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
  const {
    toggleSidebar,
    sidebarOpen,
    toggleCanvasTab,
    containerOpen,
    activeTabId,
  } = useWorkspaceStore();
  const captureCount = useHandoverStore(
    (s) => s.capturedStates.filter((c) => c.spaceId === space.id).length
  );
  const [publishOpen, setPublishOpen] = useState(false);

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

        {/* Read-only platform pill — locked at space creation. */}
        <span
          className={cn(
            "flex items-center gap-1 rounded-full pl-1.5 pr-2 py-0.5 text-[10px] font-medium",
            platformBadgeColors[space.targetPlatform]
          )}
          title="Platform is locked at space creation"
        >
          <PlatformIcon platform={space.targetPlatform} size={10} />
          {platformLabel(space.targetPlatform)}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPublishOpen(true)}
          className="flex h-7 items-center gap-1.5 rounded-md bg-primary/15 px-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
          title="Publish a handover for this Space"
        >
          <Send size={13} />
          Publish handover
          {captureCount > 0 && (
            <span className="ml-0.5 rounded bg-primary/25 px-1 py-px text-[9px] font-semibold leading-none">
              {captureCount}
            </span>
          )}
        </button>
        <button
          onClick={() => toggleSidebar()}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            sidebarOpen
              ? "bg-white/[0.08] text-foreground/80"
              : "text-foreground/40 hover:text-foreground/60 hover:bg-white/[0.04]"
          )}
        >
          <PanelRight size={14} />
          Context
        </button>
        <button
          type="button"
          onClick={() => toggleCanvasTab()}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            containerOpen && activeTabId === "canvas"
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

      <HandoverPublishModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        spaceId={space.id}
      />
    </div>
  );
}
