"use client";

import {
  ArrowLeft,
  PanelRight,
  Layout,
  Save,
  Sparkles,
  MonitorPlay,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Shell } from "@/types";
import {
  SHELL_APP_PREVIEW_TAB_ID,
  useWorkspaceStore,
} from "@/stores/useWorkspaceStore";
import { useShellStore } from "@/stores/useShellStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ShellWorkspaceTopBar({ shell }: { shell: Shell }) {
  const router = useRouter();
  const updateShell = useShellStore((s) => s.updateShell);
  const remixToSpace = useShellStore((s) => s.remixToSpace);
  const {
    toggleSidebar,
    sidebarOpen,
    sidebarMode,
    toggleCanvasTab,
    openShellAppPreviewTab,
    containerOpen,
    activeTabId,
  } = useWorkspaceStore();

  const handleSave = () => {
    updateShell(shell.id, {});
  };

  const handleRemix = () => {
    const result = remixToSpace(shell.id);
    if (result) {
      router.push(`/space/${result.space.id}/chat/${result.chat.id}`);
    }
  };

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] bg-background px-3">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/shells")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/40 transition-colors hover:bg-white/[0.04] hover:text-foreground/70"
        >
          <ArrowLeft size={15} />
        </button>
        <span className="truncate text-sm font-medium text-foreground/80">
          {shell.name}
        </span>
        <span className="shrink-0 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300/90">
          Shell
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => toggleSidebar("shelf")}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            sidebarOpen && sidebarMode === "shelf"
              ? "bg-white/[0.08] text-foreground/80"
              : "text-foreground/40 hover:bg-white/[0.04] hover:text-foreground/60"
          )}
        >
          <PanelRight size={14} />
          Shelf
        </button>
        <button
          type="button"
          onClick={() => toggleCanvasTab()}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            containerOpen && activeTabId === "canvas"
              ? "bg-white/[0.08] text-foreground/80"
              : "text-foreground/40 hover:bg-white/[0.04] hover:text-foreground/60"
          )}
        >
          <Layout size={14} />
          Canvas
        </button>
        <button
          type="button"
          onClick={() => openShellAppPreviewTab()}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            containerOpen && activeTabId === SHELL_APP_PREVIEW_TAB_ID
              ? "bg-white/[0.08] text-foreground/80"
              : "text-foreground/40 hover:bg-white/[0.04] hover:text-foreground/60"
          )}
        >
          <MonitorPlay size={14} />
          Preview
        </button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs text-foreground/55 hover:text-foreground/80"
          onClick={handleSave}
        >
          <Save size={14} />
          Save shell
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleRemix}
        >
          <Sparkles size={14} />
          Remix
        </Button>
      </div>
    </div>
  );
}
