"use client";

import { X, Layout, MonitorPlay, FolderTree, Pencil, AppWindow, Smartphone } from "lucide-react";
import type { Space } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useBuildStore } from "@/stores/useBuildStore";
import { cn } from "@/lib/utils";

export function ContainerTabBar({ space }: { space?: Space }) {
  const { tabs, activeTabId, setActiveTab, closeTab, toggleOnDeviceTab, containerOpen } =
    useWorkspaceStore();
  const toggleFileTree = useBuildStore((s) => s.toggleFileTree);
  const fileTreeOpen = useBuildStore((s) => s.fileTreeOpen);
  const hasPreview = tabs.some((t) => t.type === "preview");
  const isMobileSpace =
    space?.targetPlatform === "mobile" || space?.targetPlatform === "universal";
  const onDeviceActive = containerOpen && activeTabId === "on-device";

  return (
    <div className="flex h-9 items-center gap-0.5 border-b border-white/[0.06] bg-background px-1 overflow-x-auto">
      <div className="flex min-w-0 flex-1 items-center gap-0.5">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tab"
            tabIndex={0}
            className={cn(
              "group flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs cursor-pointer transition-colors shrink-0 border-b-2 border-transparent -mb-px",
              tab.id === activeTabId
                ? tab.type === "code"
                  ? "bg-white/[0.06] text-foreground/80 border-primary"
                  : "bg-white/[0.06] text-foreground/80"
                : "text-foreground/35 hover:text-foreground/55 hover:bg-white/[0.03]"
            )}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveTab(tab.id);
              }
            }}
          >
            {tab.type === "canvas" && <Layout size={12} className="shrink-0" />}
            {tab.type === "shell-app" && <AppWindow size={12} className="shrink-0" />}
            {tab.type === "preview" && <MonitorPlay size={12} className="shrink-0" />}
            {tab.type === "on-device" && <Smartphone size={12} className="shrink-0 text-violet-400" />}
            {tab.type === "design-editor" && <Pencil size={12} className="shrink-0" />}
            <span className="truncate max-w-[120px]">{tab.title}</span>
            {tab.closable !== false &&
              tab.type !== "canvas" &&
              tab.type !== "preview" &&
              tab.type !== "shell-app" &&
              tab.type !== "on-device" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-1 opacity-0 group-hover:opacity-100 text-foreground/25 hover:text-foreground/50 transition-all"
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isMobileSpace && (
        <button
          type="button"
          onClick={() => toggleOnDeviceTab()}
          className={cn(
            "ml-auto flex h-7 items-center gap-1.5 shrink-0 rounded-md px-2 text-xs transition-colors",
            onDeviceActive
              ? "bg-white/[0.06] text-foreground/80"
              : "text-foreground/40 hover:text-foreground/60 hover:bg-white/[0.03]"
          )}
          title="Mobile preview"
        >
          <Smartphone size={13} className="text-violet-400" />
          Mobile
        </button>
      )}

      {hasPreview && (
        <button
          type="button"
          onClick={() => toggleFileTree()}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
            isMobileSpace ? "" : "ml-auto",
            "mr-1",
            fileTreeOpen
              ? "bg-white/[0.06] text-foreground/70"
              : "text-foreground/25 hover:text-foreground/40"
          )}
          title="File tree"
        >
          <FolderTree size={14} />
        </button>
      )}
    </div>
  );
}
