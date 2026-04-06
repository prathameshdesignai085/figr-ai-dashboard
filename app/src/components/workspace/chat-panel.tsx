"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { createShapeId } from "tldraw";
import {
  PanelLeft,
  Plus,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import type { Space } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useShelfStore } from "@/stores/useShelfStore";
import { useCanvasDeselectStore } from "@/stores/useCanvasDeselectStore";
import { useRouter } from "next/navigation";
import { ChatMessage } from "./chat-message";
import { ChatInput, type ContextChip } from "./chat-input";
import { ChatHistoryPanel } from "./chat-history-panel";

export function ChatPanel({ space }: { space: Space }) {
  const router = useRouter();
  const { getActiveChat, activeChatId, createChat, chats } = useChatStore();
  const { chatHistoryOpen, toggleChatHistory, closeSidebar } = useWorkspaceStore();
  const selectedOutputIds = useShelfStore((s) => s.selectedOutputIds);
  const selectedAnnotationShapeIds = useShelfStore(
    (s) => s.selectedAnnotationShapeIds
  );
  const canvasInspectPicks = useShelfStore((s) => s.canvasInspectPicks);
  const marqueeCaptures = useShelfStore((s) => s.marqueeCaptures);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentMessage = useRef(false);

  const activeChat = getActiveChat();
  const messages = activeChat?.messages || [];

  // Collect all outputs across all chats in this space for shelf context chips
  const allOutputs = chats
    .filter((c) => c.spaceId === space.id)
    .flatMap((c) => c.messages.flatMap((m) => m.outputs));

  const contextChips = useMemo((): ContextChip[] => {
    const outputChips: ContextChip[] = allOutputs
      .filter((o) => selectedOutputIds.has(o.id))
      .map((o) => ({
        id: o.id,
        title: o.title,
        kind: "output" as const,
      }));
    const inspectChips: ContextChip[] = canvasInspectPicks.map((p) => ({
      id: p.key,
      title: `${p.outputTitle} › ${p.componentName}`,
      kind: "inspect" as const,
    }));
    const sortedAnn = [...selectedAnnotationShapeIds].sort();
    const annotationChips: ContextChip[] = sortedAnn.map((shapeId, i) => ({
      id: shapeId,
      title: `Annotation ${i + 1}`,
      kind: "annotation" as const,
    }));
    const screenshotChips: ContextChip[] = marqueeCaptures.map((cap) => ({
      id: cap.id,
      title: cap.label,
      kind: "screenshot" as const,
      dataUrl: cap.dataUrl,
    }));
    return [...outputChips, ...inspectChips, ...annotationChips, ...screenshotChips];
  }, [allOutputs, selectedOutputIds, canvasInspectPicks, selectedAnnotationShapeIds, marqueeCaptures]);

  const handleRemoveContextChip = useCallback((chip: ContextChip) => {
    if (chip.kind === "screenshot") {
      useShelfStore.getState().removeMarqueeCapture(chip.id);
      return;
    }
    if (chip.kind === "inspect") {
      useShelfStore.getState().removeCanvasInspectPick(chip.id);
      return;
    }
    if (chip.kind === "output") {
      useCanvasDeselectStore
        .getState()
        .enqueueDeselect([createShapeId(chip.id)]);
      return;
    }
    useCanvasDeselectStore.getState().enqueueDeselect([chip.id]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleKeepOutput = useCallback(
    (outputId: string) => {
      // Toggle kept status on the output in the chat store
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            outputs: msg.outputs.map((out) =>
              out.id === outputId
                ? {
                    ...out,
                    kept: !out.kept,
                    keptAt: out.kept ? null : new Date().toISOString(),
                  }
                : out
            ),
          })),
        })),
      }));
    },
    []
  );

  const handleSend = useCallback(
    (content: string) => {
      if (!activeChat) return;

      // Auto-collapse context sidebar on first message
      if (!hasSentMessage.current) {
        hasSentMessage.current = true;
        closeSidebar();
      }

      const {
        selectedOutputIds: outIds,
        selectedAnnotationShapeIds: annIds,
        canvasInspectPicks: inspectPicks,
        marqueeCaptures: captures,
      } = useShelfStore.getState();
      const outputTitles = allOutputs
        .filter((o) => outIds.has(o.id))
        .map((o) => o.title);
      const inspectLabels = inspectPicks.map(
        (p) => `${p.outputTitle} › ${p.componentName} (${p.tagName})`
      );
      const annLabels = [...annIds]
        .sort()
        .map((_, i) => `Annotation ${i + 1}`);
      const screenshotLabels = captures.map((c) => c.label);
      const canvasLabels = [...outputTitles, ...inspectLabels, ...annLabels, ...screenshotLabels];
      const fullContent =
        canvasLabels.length > 0
          ? `${content}\n\n— Selected on canvas: ${canvasLabels.join(", ")}`
          : content;

      const screenshotUrls = captures
        .map((c) => c.dataUrl)
        .filter((url) => url.length > 0);

      const msgId = `msg-${Date.now()}`;
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...chat.messages,
                  {
                    id: msgId,
                    chatId: activeChat.id,
                    role: "user" as const,
                    content: fullContent,
                    outputs: [],
                    contextItemIds: [],
                    screenshotUrls:
                      screenshotUrls.length > 0 ? screenshotUrls : undefined,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : chat
        ),
      }));

      // Clear marquee captures after sending
      if (captures.length > 0) {
        useShelfStore.getState().clearMarqueeCaptures();
      }
    },
    [activeChat, closeSidebar, allOutputs]
  );

  const handleNewChat = () => {
    const chat = createChat(space.id);
    router.push(`/space/${space.id}/chat/${chat.id}`);
  };

  return (
    <div className="flex h-full">
      {/* Chat history panel (slide-out) */}
      {chatHistoryOpen && <ChatHistoryPanel spaceId={space.id} />}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat top bar — fixed row height; title truncates instead of wrapping */}
        <div className="flex h-9 shrink-0 min-h-9 min-w-0 flex-nowrap items-center gap-1 border-b border-white/[0.06] px-2">
          <div className="flex min-h-7 min-w-0 flex-1 items-center gap-1 overflow-hidden">
            <button
              type="button"
              onClick={toggleChatHistory}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.04] transition-colors"
            >
              <PanelLeft size={15} />
            </button>
            <div
              className="min-w-0 flex-1 overflow-hidden rounded-md bg-white/[0.04] px-2 py-1.5 text-xs font-medium leading-none text-foreground/70"
              title={activeChat?.name || "New Chat"}
            >
              <span className="block truncate whitespace-nowrap">
                {activeChat?.name || "New Chat"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs leading-none text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.04] transition-colors"
            >
              New Chat
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors"
            >
              <Clock size={14} />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Messages — centered column (ChatGPT-style readable line length) */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-foreground/30">
                    Start a conversation
                  </p>
                  <p className="mt-1 text-xs text-foreground/15">
                    Ask anything about {space.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onKeepOutput={handleKeepOutput}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input — same max width as thread */}
        <div className="mx-auto w-full max-w-3xl shrink-0 px-4">
          <ChatInput
            onSend={handleSend}
            contextChips={contextChips}
            onRemoveContextChip={handleRemoveContextChip}
          />
        </div>
      </div>
    </div>
  );
}
