"use client";

import type { Space } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { ContainerTabBar } from "./container-tab-bar";
import { DocumentPreview } from "./document-preview";
import { PrototypeBrowser } from "./prototype-browser";
import { CodeView } from "./code-view";
import { CanvasPanel } from "./canvas-panel";
import { motion, AnimatePresence } from "framer-motion";

export function ContainerArea({ space }: { space: Space }) {
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
      return <CanvasPanel spaceId={space.id} />;
    }
    if (activeTab.type === "prototype") {
      return <PrototypeBrowser />;
    }
    if (activeTab.type === "code") {
      return <CodeView tab={activeTab} />;
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
