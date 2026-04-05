"use client";

import { useState, useRef, useEffect } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RotateCw,
  MousePointer2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectRoute } from "@/types";

type Device = "desktop" | "tablet" | "mobile";

export function PreviewUrlBar({
  routes,
  activePath,
  onRouteChange,
  device,
  onDeviceChange,
  inspectMode,
  onToggleInspect,
  onRefresh,
  onOpenExternal,
}: {
  routes: ProjectRoute[];
  activePath: string;
  onRouteChange: (path: string) => void;
  device: Device;
  onDeviceChange: (d: Device) => void;
  inspectMode: boolean;
  onToggleInspect: () => void;
  onRefresh: () => void;
  onOpenExternal: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 bg-background">
      <div className="flex items-center gap-0.5 rounded-md border border-white/[0.08] p-0.5">
        {(["desktop", "tablet", "mobile"] as Device[]).map((d) => {
          const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onDeviceChange(d)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded transition-colors",
                device === d
                  ? "bg-white/[0.08] text-foreground/70"
                  : "text-foreground/25 hover:text-foreground/40"
              )}
            >
              <Icon size={12} />
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 min-w-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full max-w-md items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 text-left"
        >
          <span className="truncate text-xs text-foreground/60">{activePath}</span>
          <ChevronDown size={12} className="shrink-0 text-foreground/35" />
        </button>
        {open && (
          <div className="absolute left-0 top-full z-30 mt-1 max-h-56 min-w-full overflow-auto rounded-lg border border-white/[0.08] bg-[#1a1a1a] py-1 shadow-xl">
            {routes.map((r) => (
              <button
                key={r.path}
                type="button"
                onClick={() => {
                  onRouteChange(r.path);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-xs hover:bg-white/[0.06]",
                  r.path === activePath ? "text-foreground/90" : "text-foreground/50"
                )}
              >
                <span className="font-mono text-foreground/70">{r.path}</span>
                <span className="text-foreground/40">{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onToggleInspect}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
            inspectMode
              ? "bg-primary/10 text-primary"
              : "text-foreground/25 hover:text-foreground/40"
          )}
          title="Inspect"
        >
          <MousePointer2 size={14} />
        </button>
        <button
          type="button"
          onClick={onOpenExternal}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink size={14} />
        </button>
        <button
          type="button"
          onClick={onRefresh}
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 transition-colors"
          title="Refresh"
        >
          <RotateCw size={14} />
        </button>
      </div>
    </div>
  );
}
