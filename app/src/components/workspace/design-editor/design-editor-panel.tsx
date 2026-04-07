"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, PackagePlus, Loader2 } from "lucide-react";
import type { ContainerTab } from "@/types";
import { useDesignEditorStore } from "@/stores/useDesignEditorStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useChatStore } from "@/stores/useChatStore";
import { parseHtmlToDesignTree } from "@/lib/design-editor/parse-html-to-design-tree";
import { serializeDesignTree, serializeSubtree } from "@/lib/design-editor/serialize-design-tree";
import { DesignCanvas } from "./design-canvas";
import { LayerTree } from "./layer-tree";
import { DesignInspector } from "./design-inspector";
import { nanoid } from "nanoid";

export function DesignEditorPanel({ tab }: { tab: ContainerTab }) {
  const { tree, selectedNodeId, getNode, loadTree, clear } = useDesignEditorStore();
  const [loading, setLoading] = useState(true);
  const parsedRef = useRef(false);

  useEffect(() => {
    if (parsedRef.current) return;
    parsedRef.current = true;

    parseHtmlToDesignTree(tab.content).then((nodes) => {
      loadTree(nodes, tab.outputId || "");
      setLoading(false);
    });

    return () => {
      clear();
    };
  }, [tab.content, tab.outputId, loadTree, clear]);

  const handleBackToCanvas = () => {
    useWorkspaceStore.getState().closeTab(tab.id);
  };

  const handleCheckIn = () => {
    const currentTree = useDesignEditorStore.getState().getTree();
    const html = serializeDesignTree(currentTree);
    const outputId = tab.outputId;

    if (outputId) {
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            outputs: msg.outputs.map((o) =>
              o.id === outputId ? { ...o, content: html } : o
            ),
          })),
        })),
      }));

      window.dispatchEvent(
        new CustomEvent("figred:design-checkin", {
          detail: { outputId, html },
        })
      );
    }

    useWorkspaceStore.getState().closeTab(tab.id);
    clear();
  };

  const handleExtractComponent = () => {
    if (!selectedNodeId) return;
    const node = getNode(selectedNodeId);
    if (!node) return;

    const componentHtml = serializeSubtree(node);
    const activeChatId = useChatStore.getState().activeChatId;
    if (!activeChatId) return;

    const newOutputId = `out-${nanoid(6)}`;
    const msgId = `msg-${nanoid(6)}`;

    useChatStore.setState((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              updatedAt: new Date().toISOString(),
              messages: [
                ...chat.messages,
                {
                  id: msgId,
                  chatId: activeChatId,
                  role: "assistant" as const,
                  content: `Extracted component **${node.name}** from the design editor.`,
                  outputs: [
                    {
                      id: newOutputId,
                      messageId: msgId,
                      chatId: activeChatId,
                      spaceId: chat.spaceId,
                      shellId: chat.shellId,
                      type: "component" as const,
                      fidelity: "hi-fi" as const,
                      title: node.name,
                      summary: `Component extracted from design: ${node.tag} element`,
                      content: componentHtml,
                      kept: true,
                      keptAt: new Date().toISOString(),
                      canvasPosition: null,
                    },
                  ],
                  contextItemIds: [],
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : chat
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0d0d0d]">
        <div className="flex items-center gap-3 text-foreground/30">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Parsing design…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0d0d0d]">
      {/* Main 3-column layout */}
      <div className="flex flex-1 min-h-0">
        <LayerTree />
        <DesignCanvas />
        <DesignInspector />
      </div>

      {/* Bottom toolbar */}
      <div className="flex h-10 shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#111111] px-3">
        <button
          type="button"
          onClick={handleBackToCanvas}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/50 hover:bg-white/[0.06] hover:text-foreground/80 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Canvas</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExtractComponent}
            disabled={!selectedNodeId}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/50 hover:bg-white/[0.06] hover:text-foreground/80 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <PackagePlus size={13} />
            <span>Extract Component</span>
          </button>

          <button
            type="button"
            onClick={handleCheckIn}
            className="flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors"
          >
            <Check size={13} />
            <span>Check In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
