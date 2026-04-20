"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Smartphone,
  Wifi,
  Activity,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Share2,
  X,
} from "lucide-react";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";

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

      {/* Floating overlay — QR + connected devices + event log */}
      {overlayOpen && (
        <ShareOverlay
          isMobile={isMobile}
          spaceId={space?.id ?? "demo"}
          onClose={() => setOverlayOpen(false)}
        />
      )}
    </div>
  );
}

function ShareOverlay({
  isMobile,
  spaceId,
  onClose,
}: {
  isMobile: boolean;
  spaceId: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const pairingUrl = useMemo(() => {
    const base = isMobile
      ? "exp://figred.dev/preview/"
      : "https://figred.dev/preview/";
    return base + spaceId;
  }, [isMobile, spaceId]);

  const sessions = mockSessions(isMobile);
  const events = mockEvents();

  // Esc-to-close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pairingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Backdrop — click to dismiss */}
      <div
        className="absolute inset-0 z-10 bg-black/30"
        onClick={onClose}
        aria-hidden
      />
      {/* Floating card anchored top-right under the trigger */}
      <div
        className="absolute right-3 top-12 z-20 flex w-[340px] flex-col rounded-lg border border-white/[0.08] bg-[#161616] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-foreground/40">
            <Share2 size={11} />
            {isMobile ? "Pair via Expo Go" : "Open on your phone"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded text-foreground/30 hover:bg-white/[0.06] hover:text-foreground/70"
            aria-label="Close"
          >
            <X size={11} />
          </button>
        </div>

        {/* QR card */}
        <div className="border-b border-white/[0.06] p-4">
          <div className="flex justify-center">
            <FauxQrCode />
          </div>
          <div className="mt-3 flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
            <span className="flex-1 truncate font-mono text-[10px] text-foreground/50">
              {pairingUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-5 w-5 items-center justify-center rounded text-foreground/40 hover:bg-white/[0.06] hover:text-foreground/70"
              aria-label="Copy pairing URL"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded text-foreground/40 hover:bg-white/[0.06] hover:text-foreground/70"
              aria-label="Open externally"
            >
              <ExternalLink size={11} />
            </button>
          </div>
          {isMobile && (
            <p className="mt-2 text-[10px] leading-snug text-foreground/40">
              Open Expo Go on your phone and scan. Live-reloads on every keep.
            </p>
          )}
        </div>

        {/* Connected devices */}
        <div className="border-b border-white/[0.06] p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-foreground/40">
            <Wifi size={11} />
            Connected devices
          </div>
          <div className="flex flex-col gap-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-md border border-white/[0.04] bg-white/[0.02] px-2 py-1.5"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    s.status === "live"
                      ? "bg-emerald-400"
                      : s.status === "paired"
                      ? "bg-amber-400"
                      : "bg-foreground/30"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-foreground/70">
                    {s.deviceLabel}
                  </div>
                  <div className="text-[10px] text-foreground/40">
                    {s.os.toUpperCase()} · {s.lastPing}
                  </div>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="rounded-md border border-dashed border-white/[0.06] px-2 py-3 text-center text-[10px] text-foreground/30">
                No devices paired yet
              </div>
            )}
          </div>
        </div>

        {/* Event log */}
        <div className="flex max-h-44 min-h-0 flex-col p-3">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-foreground/40">
            <Activity size={11} />
            Event log
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed text-foreground/50">
            {events.map((e) => (
              <div key={e.id} className="flex gap-2 py-0.5">
                <span className="shrink-0 text-foreground/30">{e.timestamp}</span>
                <span className="flex-1 text-foreground/60">{e.message}</span>
                {e.durationMs != null && (
                  <span className="shrink-0 text-emerald-400/70">
                    {e.durationMs}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
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

/**
 * QR-shaped SVG placeholder. Visually convincing finder patterns + a deterministic
 * pseudo-random module grid. Does not actually encode the URL — Phase 2 will
 * swap this for a real QR generated from the Snack pairing URL.
 */
function FauxQrCode() {
  const size = 21;
  const cells: boolean[][] = useMemo(() => {
    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array(size).fill(false)
    );
    // Deterministic noise based on coordinates
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        grid[y][x] = ((x * 73 + y * 19 + (x ^ y) * 31) % 7) < 3;
      }
    }
    // Carve out finder patterns (top-left, top-right, bottom-left)
    const carveFinder = (ox: number, oy: number) => {
      for (let dy = 0; dy < 7; dy++) {
        for (let dx = 0; dx < 7; dx++) {
          const isBorder = dx === 0 || dy === 0 || dx === 6 || dy === 6;
          const isCenter = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
          grid[oy + dy][ox + dx] = isBorder || isCenter;
        }
      }
      // White ring around finder
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          if (dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6) continue;
          const x = ox + dx;
          const y = oy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) grid[y][x] = false;
        }
      }
    };
    carveFinder(0, 0);
    carveFinder(size - 7, 0);
    carveFinder(0, size - 7);
    return grid;
  }, []);

  const pixel = 7;
  return (
    <div className="rounded-lg bg-white p-2.5">
      <svg
        width={size * pixel}
        height={size * pixel}
        viewBox={`0 0 ${size * pixel} ${size * pixel}`}
        className="block"
      >
        {cells.flatMap((row, y) =>
          row.map((on, x) =>
            on ? (
              <rect
                key={`${x}-${y}`}
                x={x * pixel}
                y={y * pixel}
                width={pixel}
                height={pixel}
                fill="#0a0a0a"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

function mockSessions(isMobile: boolean) {
  if (!isMobile) {
    return [
      {
        id: "s-web-1",
        deviceLabel: "Pratea's MacBook · Safari",
        os: "web" as const,
        status: "live" as const,
        lastPing: "live · 1s ago",
      },
    ];
  }
  return [
    {
      id: "s-1",
      deviceLabel: "iPhone 15 Pro · Expo Go",
      os: "ios" as const,
      status: "live" as const,
      lastPing: "live · 1s ago",
    },
    {
      id: "s-2",
      deviceLabel: "Pixel 8 · Expo Go",
      os: "android" as const,
      status: "paired" as const,
      lastPing: "paired · 2m ago",
    },
  ];
}

function mockEvents() {
  return [
    { id: "e-1", timestamp: "09:41:02", message: "v3 sent · iPhone 15 Pro received", durationMs: 218 },
    { id: "e-2", timestamp: "09:40:51", message: "Hot reload · Home.tsx", durationMs: 84 },
    { id: "e-3", timestamp: "09:40:43", message: "Pixel 8 paired", durationMs: undefined },
    { id: "e-4", timestamp: "09:40:30", message: "Snack session started · platform: ios,android", durationMs: undefined },
    { id: "e-5", timestamp: "09:40:14", message: "Bundle compiled · 2.1s", durationMs: 2103 },
  ];
}
