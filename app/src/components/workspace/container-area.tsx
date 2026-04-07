"use client";

import type { Space, Shell } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { ContainerTabBar } from "./container-tab-bar";
import { DocumentPreview } from "./document-preview";
import { PrototypeBrowser } from "./prototype-browser";
import { CodeView } from "./code-view";
import { CanvasPanel } from "./canvas-panel";
import { BuildPreviewPanel } from "./build-preview/build-preview-panel";
import { OutputHtmlPreview } from "./output-html-preview";
import { DesignEditorPanel } from "./design-editor/design-editor-panel";
import { ShellAppPreviewPanel } from "./shell-app-preview-panel";
import { motion, AnimatePresence } from "framer-motion";

function isLikelyHtml(content: string): boolean {
  const t = content.trim();
  return t.startsWith("<!") || t.startsWith("<html") || t.startsWith("<div") || t.startsWith("<body");
}

export function ContainerArea({ workspace }: { workspace: Space | Shell }) {
  const isSpace = "stage" in workspace;
  const { tabs, activeTabId } = useWorkspaceStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-foreground/20">No tab selected</p>
        </div>
      );
    }
    if (activeTab.type === "canvas") {
      return (
        <CanvasPanel
          spaceId={isSpace ? workspace.id : undefined}
          shellId={!isSpace ? workspace.id : undefined}
        />
      );
    }
    if (activeTab.type === "shell-app") {
      if (!isSpace) {
        return <ShellAppPreviewPanel shellId={workspace.id} />;
      }
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-foreground/30">App preview is only for shells</p>
        </div>
      );
    }
    if (activeTab.type === "preview" && activeTab.buildProjectId) {
      return <BuildPreviewPanel buildProjectId={activeTab.buildProjectId} />;
    }
    if (activeTab.type === "prototype") {
      return <PrototypeBrowser />;
    }
    if (activeTab.type === "code") {
      return <CodeView tab={activeTab} />;
    }
    if (activeTab.type === "design-editor") {
      return <DesignEditorPanel tab={activeTab} />;
    }
    if (activeTab.type === "output" && isLikelyHtml(activeTab.content)) {
      return <OutputHtmlPreview html={activeTab.content} />;
    }
    return <DocumentPreview tab={activeTab} />;
  };

  return (
    <div className="flex h-full flex-col">
      <ContainerTabBar />

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId || "empty"}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
