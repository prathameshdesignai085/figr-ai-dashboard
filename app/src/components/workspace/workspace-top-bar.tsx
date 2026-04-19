"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, PanelRight, Layout, Settings, Check, ChevronDown, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Space, TargetPlatform } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { cn } from "@/lib/utils";
import {
  platformBadgeColors,
  platformOptions,
  PlatformIcon,
} from "@/lib/platform";

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
    sidebarMode,
    toggleCanvasTab,
    toggleOnDeviceTab,
    containerOpen,
    activeTabId,
  } = useWorkspaceStore();
  const setTargetPlatform = useSpaceStore((s) => s.setTargetPlatform);

  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  const platformMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!platformMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (!platformMenuRef.current?.contains(e.target as Node)) {
        setPlatformMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [platformMenuOpen]);

  const handleSelectPlatform = (platform: TargetPlatform) => {
    setTargetPlatform(space.id, platform);
    setPlatformMenuOpen(false);
  };

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

        {/* Platform badge + quick-switch popover */}
        <div ref={platformMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setPlatformMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1 rounded-full pl-1.5 pr-1 py-0.5 text-[10px] font-medium capitalize transition-opacity hover:opacity-80",
              platformBadgeColors[space.targetPlatform]
            )}
            title="Switch target platform"
          >
            <PlatformIcon platform={space.targetPlatform} size={10} />
            {space.targetPlatform}
            <ChevronDown size={9} className="opacity-70" />
          </button>
          {platformMenuOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-white/[0.08] bg-[#161616] p-1 shadow-xl">
              {platformOptions.map((opt) => {
                const selected = opt.id === space.targetPlatform;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectPlatform(opt.id)}
                    className="flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/[0.06]"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded",
                        platformBadgeColors[opt.id]
                      )}
                    >
                      <PlatformIcon platform={opt.id} size={11} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-xs font-medium text-foreground/80">
                        {opt.label}
                      </span>
                      <span className="text-[10px] leading-snug text-foreground/40">
                        {opt.description}
                      </span>
                    </span>
                    {selected && (
                      <Check size={12} className="mt-1 shrink-0 text-foreground/70" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
          type="button"
          onClick={() => toggleOnDeviceTab()}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
            containerOpen && activeTabId === "on-device"
              ? "bg-white/[0.08] text-foreground/80"
              : "text-foreground/40 hover:text-foreground/60 hover:bg-white/[0.04]"
          )}
          title="Open On Device preview"
        >
          <Smartphone size={14} />
          On Device
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
