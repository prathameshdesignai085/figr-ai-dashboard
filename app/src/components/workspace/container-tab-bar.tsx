"use client";

import { X, Layout } from "lucide-react";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";

export function ContainerTabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useWorkspaceStore();

  return (
    <div className="flex h-9 items-center gap-0.5 border-b border-white/[0.06] bg-background px-1 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs cursor-pointer transition-colors shrink-0",
            tab.id === activeTabId
              ? "bg-white/[0.06] text-foreground/80"
              : "text-foreground/35 hover:text-foreground/55 hover:bg-white/[0.03]"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.type === "canvas" && <Layout size={12} className="shrink-0" />}
          <span className="truncate max-w-[120px]">{tab.title}</span>
          {tab.type !== "canvas" && (
            <button
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
  );
}
