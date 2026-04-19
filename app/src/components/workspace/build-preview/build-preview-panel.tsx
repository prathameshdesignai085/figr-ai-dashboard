"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBuildStore } from "@/stores/useBuildStore";
import { useSpaceStore } from "@/stores/useSpaceStore";
import type { InspectedElement } from "@/types";
import { PreviewUrlBar } from "./preview-url-bar";
import { BuildFileTree } from "./build-file-tree";
import {
  LivePreviewFrame,
  requestPreviewHtmlExport,
  applyPreviewStyles,
} from "./live-preview-frame";
import { InspectorPanel } from "../inspector-panel";
import { FIGRED_MSG, appendInspectBridge } from "./inspect-bridge";

type Device = "desktop" | "tablet" | "mobile";

export function BuildPreviewPanel({ buildProjectId }: { buildProjectId: string }) {
  const project = useBuildStore((s) => s.getProject(buildProjectId));
  const activeSpace = useSpaceStore((s) => s.getActiveSpace());
  const activeRoutePath =
    useBuildStore((s) => s.activeRouteByProject[buildProjectId]) ??
    project?.routes[0]?.path ??
    "/";
  const setActiveRoute = useBuildStore((s) => s.setActiveRoute);
  const inspectMode = useBuildStore((s) => s.inspectModeByProject[buildProjectId] ?? false);
  const setInspectMode = useBuildStore((s) => s.setInspectMode);
  const setInspectedElement = useBuildStore((s) => s.setInspectedElement);
  const updateRoutePreviewHtml = useBuildStore((s) => s.updateRoutePreviewHtml);
  const fileTreeOpen = useBuildStore((s) => s.fileTreeOpen);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const baselineRef = useRef<InspectedElement | null>(null);
  const isMobileSpace =
    project?.targetPlatform === "mobile" ||
    activeSpace?.targetPlatform === "mobile";
  const [device, setDevice] = useState<Device>(isMobileSpace ? "mobile" : "desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [draft, setDraft] = useState<InspectedElement | null>(null);

  const activeRoute = project?.routes.find((r) => r.path === activeRoutePath) ?? project?.routes[0];
  const html = activeRoute?.previewHtml ?? "<!DOCTYPE html><html><body></body></html>";

  const onInspectSelect = useCallback((el: InspectedElement, id: string) => {
    baselineRef.current = el;
    setInspectId(id);
    setDraft(el);
  }, []);

  const handleToggleInspect = useCallback(() => {
    if (inspectMode) {
      setInspectMode(buildProjectId, false);
      setInspectedElement(buildProjectId, null);
      setInspectId(null);
      setDraft(null);
      baselineRef.current = null;
    } else {
      setInspectMode(buildProjectId, true);
    }
  }, [inspectMode, buildProjectId, setInspectMode, setInspectedElement]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === FIGRED_MSG.HTML_EXPORT && typeof d.html === "string") {
        updateRoutePreviewHtml(buildProjectId, activeRoutePath, d.html);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [buildProjectId, activeRoutePath, updateRoutePreviewHtml]);

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
    if (draft) {
      baselineRef.current = draft;
      setInspectedElement(buildProjectId, draft);
    }
  }, [inspectId, draft, buildProjectId, setInspectedElement]);

  const openExternal = useCallback(() => {
    const blob = new Blob([appendInspectBridge(html)], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [html]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-foreground/30">
        Build project not found
      </div>
    );
  }

  const showInspector = inspectMode && draft != null;
  const frameKey = `${refreshKey}-${activeRoutePath}`;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <PreviewUrlBar
        routes={project.routes}
        activePath={activeRoutePath}
        onRouteChange={(path) => setActiveRoute(buildProjectId, path)}
        device={device}
        onDeviceChange={setDevice}
        inspectMode={inspectMode}
        onToggleInspect={handleToggleInspect}
        onRefresh={() => setRefreshKey((k) => k + 1)}
        onOpenExternal={openExternal}
      />

      <div className="flex min-h-0 flex-1">
        <AnimatePresence initial={false}>
          {fileTreeOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="shrink-0 overflow-hidden"
            >
              <BuildFileTree projectId={buildProjectId} files={project.files} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <LivePreviewFrame
            html={html}
            device={device}
            inspectMode={inspectMode}
            iframeKey={frameKey}
            onInspectSelect={onInspectSelect}
            iframeRef={iframeRef}
          />
        </div>

        <AnimatePresence initial={false}>
          {showInspector && draft && (
            <motion.div
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
                  setInspectMode(buildProjectId, false);
                  setInspectedElement(buildProjectId, null);
                  setDraft(null);
                  setInspectId(null);
                  baselineRef.current = null;
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
