"use client";

import { useRef, useEffect, useCallback } from "react";
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
import { useRouter } from "next/navigation";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatHistoryPanel } from "./chat-history-panel";

export function ChatPanel({ space }: { space: Space }) {
  const router = useRouter();
  const { getActiveChat, activeChatId, createChat, chats } = useChatStore();
  const { chatHistoryOpen, toggleChatHistory, closeSidebar } = useWorkspaceStore();
  const { selectedOutputIds } = useShelfStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentMessage = useRef(false);

  const activeChat = getActiveChat();
  const messages = activeChat?.messages || [];

  // Collect all outputs across all chats in this space for shelf context chips
  const allOutputs = chats
    .filter((c) => c.spaceId === space.id)
    .flatMap((c) => c.messages.flatMap((m) => m.outputs));

  const contextChips = allOutputs
    .filter((o) => selectedOutputIds.has(o.id))
    .map((o) => ({ id: o.id, title: o.title }));

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

      // Add user message (mock — in real app this would call AI)
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
                    content,
                    outputs: [],
                    contextItemIds: [],
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : chat
        ),
      }));
    },
    [activeChat, closeSidebar]
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
        {/* Chat top bar */}
        <div className="flex h-10 shrink-0 items-center gap-1 border-b border-white/[0.06] px-2">
          <button
            onClick={toggleChatHistory}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.04] transition-colors"
          >
            <PanelLeft size={15} />
          </button>
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.04] text-xs font-medium text-foreground/70">
            {activeChat?.name || "New Chat"}
          </div>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.04] transition-colors"
          >
            New Chat
          </button>
          <div className="flex-1" />
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors">
            <Plus size={14} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors">
            <Clock size={14} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
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

        {/* Input */}
        <ChatInput onSend={handleSend} contextChips={contextChips} />
      </div>
    </div>
  );
}
