"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutTemplate,
  Search,
  Bell,
  FolderTree,
  User,
  Share2,
} from "lucide-react";
import type { Chat, InspectedElement, Output, ProjectRoute } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import { PreviewUrlBar } from "./build-preview/preview-url-bar";
import {
  LivePreviewFrame,
  applyPreviewStyles,
  requestPreviewHtmlExport,
} from "./build-preview/live-preview-frame";
import { appendInspectBridge } from "./build-preview/inspect-bridge";
import { InspectorPanel } from "./inspector-panel";
import { ShellMockFileTree } from "./shell-mock-file-tree";
import { ShareOverlay } from "./share-overlay";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const PLACEHOLDER_IFRAME_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{margin:0;font-family:system-ui,sans-serif;padding:24px;background:#f8fafc;color:#64748b;font-size:14px;line-height:1.5}</style></head><body><p>Prototype route — keep an HTML output from chat to replace this with your UI.</p></body></html>`;

const SHELL_PROTOTYPE_ROUTES: ProjectRoute[] = [
  {
    path: "/",
    label: "Home",
    filePath: "app/page.tsx",
    previewHtml: PLACEHOLDER_IFRAME_HTML,
  },
  {
    path: "/dashboard",
    label: "Dashboard",
    filePath: "app/dashboard/page.tsx",
    previewHtml: PLACEHOLDER_IFRAME_HTML,
  },
  {
    path: "/orders",
    label: "Orders",
    filePath: "app/orders/page.tsx",
    previewHtml: PLACEHOLDER_IFRAME_HTML,
  },
  {
    path: "/settings",
    label: "Settings",
    filePath: "app/settings/page.tsx",
    previewHtml: PLACEHOLDER_IFRAME_HTML,
  },
];

function isLikelyHtml(content: string): boolean {
  const t = content.trim();
  return (
    t.startsWith("<!") ||
    t.startsWith("<html") ||
    t.startsWith("<div") ||
    t.startsWith("<body")
  );
}

function findFirstKeptHtmlOutput(chats: Chat[], shellId: string): Output | null {
  for (const chat of chats) {
    if (chat.shellId !== shellId) continue;
    for (const msg of chat.messages) {
      for (const out of msg.outputs) {
        if (!out.kept || !out.content?.trim()) continue;
        if (isLikelyHtml(out.content)) return out;
      }
    }
  }
  return null;
}

const NAV = [
  "Dashboard",
  "Orders",
  "Customers",
  "Analytics",
  "Settings",
] as const;

function DeviceChrome({
  device,
  children,
}: {
  device: Device;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white/[0.01] p-4">
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-[#f8fafc] text-slate-800 shadow-xl transition-[width] duration-200",
          device !== "desktop" && "mx-auto w-full"
        )}
        style={{
          width: device === "desktop" ? "100%" : DEVICE_WIDTHS[device],
          maxWidth: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function AcmeVisionMock() {
  return (
    <div className="flex h-full min-h-0 w-full flex-1">
      <aside className="flex h-full min-h-0 w-[min(200px,28vw)] shrink-0 flex-col border-r border-slate-200 bg-white sm:w-[200px]">
        <div className="flex h-11 items-center gap-2 border-b border-slate-100 px-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-[10px] font-bold text-white">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800">
              Acme Ops
            </p>
            <p className="truncate text-[10px] text-slate-400">Console</p>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV.map((item, i) => (
            <div
              key={item}
              className={cn(
                "rounded-md px-2.5 py-2 text-xs font-medium",
                i === 0
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {item}
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-2 text-[10px] text-slate-400">
          Vision mock — not live data
        </div>
      </aside>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#f1f5f9]/80">
        <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
          <span className="text-xs font-medium text-slate-600">Dashboard</span>
          <div className="flex items-center gap-2">
            <div className="flex h-7 max-w-[40%] items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 text-slate-400 sm:w-48">
              <Search className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate text-[11px]">Search…</span>
            </div>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500"
              aria-label="Notifications"
            >
              <Bell className="size-3.5" aria-hidden />
            </button>
            <div
              className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500"
              aria-hidden
            />
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-4 text-center sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <LayoutTemplate className="size-7" strokeWidth={1.25} />
          </div>
          <p className="text-sm font-medium text-slate-700">
            Nothing built in preview yet
          </p>
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
            Add context in the shelf, then describe the UI in chat. When you keep
            an HTML-capable output, it will show in the live frame above with
            device sizing and inspect.
          </p>
        </main>
      </div>
    </div>
  );
}

export function ShellAppPreviewPanel({ shellId }: { shellId: string }) {
  const chats = useChatStore((s) => s.chats);
  const previewOut = useMemo(
    () => findFirstKeptHtmlOutput(chats, shellId),
    [chats, shellId]
  );

  const [activePath, setActivePath] = useState("/");
  // Default device follows the kept output's platform — mobile shells should
  // open inside the phone DeviceFrame (same chrome Spaces uses), not desktop.
  // User can still switch via the device toggle in the URL bar.
  const initialDevice: Device =
    previewOut?.platform === "mobile" ? "mobile" : "desktop";
  const [device, setDevice] = useState<Device>(initialDevice);
  // Re-sync device on shell change (this component can persist across shells
  // depending on parent keying — explicit reset keeps the default predictable).
  useEffect(() => {
    setDevice(previewOut?.platform === "mobile" ? "mobile" : "desktop");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellId]);
  const [fileTreeOpen, setFileTreeOpen] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [draft, setDraft] = useState<InspectedElement | null>(null);
  // Pair-via-Expo-Go floating panel. Local to this surface (Spaces have
  // their own copy on the workspace store); no need to share state because
  // only one shell preview is mounted at a time.
  const [shareOverlayOpen, setShareOverlayOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const baselineRef = useRef<InspectedElement | null>(null);

  const htmlForPreview = previewOut?.content ?? PLACEHOLDER_IFRAME_HTML;

  const onInspectSelect = useCallback((el: InspectedElement, id: string) => {
    baselineRef.current = el;
    setInspectId(id);
    setDraft(el);
  }, []);

  const handleToggleInspect = useCallback(() => {
    if (inspectMode) {
      setInspectMode(false);
      setInspectId(null);
      setDraft(null);
      baselineRef.current = null;
    } else {
      setInspectMode(true);
    }
  }, [inspectMode]);

  const handleDraftChange = useCallback(
    (next: InspectedElement) => {
      setDraft(next);
      if (inspectId) {
        applyPreviewStyles(iframeRef, inspectId, next.styles);
      }
    },
    [inspectId]
  );

  const handleDiscard = useCallback(() => {
    const base = baselineRef.current;
    if (base && inspectId) {
      applyPreviewStyles(iframeRef, inspectId, base.styles);
    }
    if (base) setDraft({ ...base, styles: { ...base.styles } });
  }, [inspectId]);

  const handleSave = useCallback(() => {
    if (inspectId && draft) {
      applyPreviewStyles(iframeRef, inspectId, draft.styles);
    }
    requestPreviewHtmlExport(iframeRef);
    if (draft) baselineRef.current = draft;
  }, [inspectId, draft]);

  const openExternal = useCallback(() => {
    const blob = new Blob([appendInspectBridge(htmlForPreview)], {
      type: "text/html",
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [htmlForPreview]);

  const showInspector = inspectMode && draft != null;
  const frameKey = `${refreshKey}-${activePath}-${previewOut?.id ?? "stub"}`;

  return (
    // `relative` so the ShareOverlay's absolute positioning (right-3 top-12)
    // anchors to this preview surface — not the page or the parent shell layout.
    <div className="relative flex h-full min-h-0 min-w-0 flex-col bg-background">
      <div className="flex shrink-0 items-stretch border-b border-white/[0.06] bg-background">
        <div className="flex items-center gap-0.5 border-r border-white/[0.06] px-1.5 py-1">
          <button
            type="button"
            onClick={() => setFileTreeOpen((o) => !o)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              fileTreeOpen
                ? "bg-white/[0.08] text-foreground/75"
                : "text-foreground/35 hover:bg-white/[0.05] hover:text-foreground/55"
            )}
            title="Prototype file tree"
          >
            <FolderTree size={16} strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-foreground/45 transition-colors hover:bg-white/[0.05] hover:text-foreground/70"
            title="Auth (demo — not connected)"
          >
            <User size={14} aria-hidden />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <PreviewUrlBar
            className="border-b-0"
            routes={SHELL_PROTOTYPE_ROUTES}
            activePath={activePath}
            onRouteChange={setActivePath}
            device={device}
            onDeviceChange={setDevice}
            inspectMode={inspectMode}
            onToggleInspect={handleToggleInspect}
            onRefresh={() => setRefreshKey((k) => k + 1)}
            onOpenExternal={openExternal}
          />
        </div>
        {/* Right-side cluster — pair-via-Expo-Go entry point. Lives outside */}
        {/* `PreviewUrlBar` so we don't disturb that shared component, and so */}
        {/* the action stays visually distinct from URL/route concerns. */}
        <div className="flex items-center gap-0.5 border-l border-white/[0.06] px-1.5 py-1">
          <button
            type="button"
            onClick={() => setShareOverlayOpen((o) => !o)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium transition-colors",
              shareOverlayOpen
                ? "bg-violet-400/10 text-violet-300"
                : "text-foreground/45 hover:bg-white/[0.05] hover:text-foreground/70"
            )}
            title={shareOverlayOpen ? "Hide pairing panel" : "View on phone"}
          >
            <Share2 size={13} aria-hidden />
            <span className="hidden sm:inline">
              {shareOverlayOpen ? "Hide" : "View on phone"}
            </span>
          </button>
        </div>
      </div>

      <div className="flex h-full min-h-0 min-w-0 flex-1">
        <AnimatePresence initial={false}>
          {fileTreeOpen && (
            <motion.div
              key="shell-ft"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full min-h-0 shrink-0 overflow-hidden"
            >
              <ShellMockFileTree />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {previewOut ? (
            <LivePreviewFrame
              html={htmlForPreview}
              device={device}
              inspectMode={inspectMode}
              iframeKey={frameKey}
              onInspectSelect={onInspectSelect}
              iframeRef={iframeRef}
            />
          ) : (
            <DeviceChrome device={device}>
              <AcmeVisionMock />
            </DeviceChrome>
          )}
        </div>

        <AnimatePresence initial={false}>
          {showInspector && draft && (
            <motion.div
              key="shell-insp"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="shrink-0 overflow-hidden"
            >
              <InspectorPanel
                element={draft}
                onChange={handleDraftChange}
                onDiscard={handleDiscard}
                onSave={handleSave}
                onClose={() => {
                  setInspectMode(false);
                  setDraft(null);
                  setInspectId(null);
                  baselineRef.current = null;
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pair-via-Expo-Go floating panel. `showBackdrop={false}` is the key */}
      {/* difference from the Spaces variant — Shell users want to keep */}
      {/* tweaking the preview while the QR is up, so no dim scrim. */}
      {/* `isMobile` follows the device toggle so the panel's copy + mock */}
      {/* sessions match what's being previewed. */}
      {shareOverlayOpen && (
        <ShareOverlay
          isMobile={device === "mobile"}
          targetId={shellId}
          showBackdrop={false}
          onClose={() => setShareOverlayOpen(false)}
        />
      )}
    </div>
  );
}
