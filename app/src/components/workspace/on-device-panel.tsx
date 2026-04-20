"use client";

import { Smartphone, RefreshCw, Share2 } from "lucide-react";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";
import { ShareOverlay } from "./share-overlay";

/**
 * "On Device" tab — Expo Go-style preview pairing surface.
 *
 * Layout:
 *  - Inline (always shown): top bar (title + Share button) + Snack runner placeholder
 *  - Floating overlay (toggled by Share / View on phone button): QR + connected devices + event log
 *
 * The overlay defaults to open every time the on-device tab opens (set by
 * `openOnDeviceTab` in the workspace store), and is dismissable via the X /
 * backdrop / Esc key. The "Share" button re-opens it.
 *
 * Phase 1 (this iteration): mocked Snack runner placeholder, mocked QR,
 * mocked connected-devices strip, mocked event log. Phase 2 wires real
 * Snack persistence + a real Expo Go QR.
 */
export function OnDevicePanel() {
  const space = useSpaceStore((s) => s.getActiveSpace());
  const isMobile = space?.targetPlatform === "mobile";
  const overlayOpen = useWorkspaceStore((s) => s.mobileShareOverlayOpen);
  const toggleOverlay = useWorkspaceStore((s) => s.toggleMobileShareOverlay);
  const setOverlayOpen = useWorkspaceStore((s) => s.setMobileShareOverlayOpen);

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background">
      {/* Top bar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] px-3">
        <div className="flex items-center gap-2 text-xs text-foreground/60">
          <Smartphone size={13} className="text-violet-400" />
          <span className="font-medium text-foreground/80">Mobile preview</span>
          <span className="text-foreground/30">·</span>
          <span className="capitalize text-foreground/40">
            {isMobile ? "Expo Go runtime" : "Embedded preview"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-foreground/40">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live · last sync 2s ago
          </span>
          <button
            type="button"
            onClick={() => toggleOverlay()}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
              overlayOpen
                ? "bg-violet-400/10 text-violet-300"
                : "text-foreground/40 hover:bg-white/[0.04] hover:text-foreground/70"
            )}
            title={overlayOpen ? "Hide pairing panel" : "View on phone"}
          >
            <Share2 size={13} />
            {overlayOpen ? "Hide" : "View on phone"}
          </button>
        </div>
      </div>

      {/* Body — Snack runner takes the full panel */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5 text-[11px] text-foreground/40">
          <span>{isMobile ? "Embedded Snack runner" : "Embedded preview"}</span>
          <button
            type="button"
            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-foreground/40 hover:bg-white/[0.04] hover:text-foreground/70"
          >
            <RefreshCw size={11} />
            Reload
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0a0a0a] p-4">
          <SnackRunnerPlaceholder mobile={isMobile} />
        </div>
      </div>

      {/* Floating overlay — QR + connected devices + event log. Spaces use */}
      {/* the dim-scrim variant for that "modal inside the tab" feel. */}
      {overlayOpen && (
        <ShareOverlay
          isMobile={isMobile}
          targetId={space?.id ?? "demo"}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </div>
  );
}

function SnackRunnerPlaceholder({ mobile }: { mobile: boolean }) {
  if (!mobile) {
    return (
      <div className="flex h-full max-h-[500px] w-full max-w-[640px] flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-white shadow-2xl">
        <div className="flex h-7 items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[10px] text-zinc-500">localhost:5173</span>
        </div>
        <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
          Web preview renders here
        </div>
      </div>
    );
  }
  // Mobile: phone-shaped Snack runner placeholder
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[40px] border-[10px] border-zinc-900 bg-white shadow-2xl"
      style={{ width: 280, height: 580 }}
    >
      {/* Status bar */}
      <div className="flex h-7 items-center justify-between bg-white px-5 text-[10px] font-semibold text-zinc-900">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-3 rounded-sm bg-zinc-900" />
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
        </span>
      </div>
      {/* App content */}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-zinc-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Welcome back</h2>
          <p className="text-[11px] text-zinc-500">React Native via Expo Snack</p>
        </div>
        <div className="flex flex-1 flex-col gap-2 px-4 py-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5"
            >
              <div className="text-xs font-medium text-zinc-800">Card {i}</div>
              <div className="text-[10px] text-zinc-500">Tap to open</div>
            </div>
          ))}
        </div>
        {/* Tab bar */}
        <div className="grid grid-cols-4 border-t border-zinc-200 bg-white py-2 text-[10px] text-zinc-500">
          {["Home", "Search", "Activity", "Profile"].map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex flex-col items-center gap-0.5",
                i === 0 && "text-violet-500"
              )}
            >
              <div
                className={cn(
                  "h-3.5 w-3.5 rounded-md",
                  i === 0 ? "bg-violet-500" : "bg-zinc-300"
                )}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center bg-white pb-1.5">
          <div className="h-1 w-24 rounded-full bg-zinc-300" />
        </div>
      </div>
    </div>
  );
}

