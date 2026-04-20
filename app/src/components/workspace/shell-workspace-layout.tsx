"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Shell } from "@/types";
import {
  SHELL_APP_PREVIEW_TAB_ID,
  useWorkspaceStore,
} from "@/stores/useWorkspaceStore";
import { useChatStore } from "@/stores/useChatStore";
import { ShellWorkspaceTopBar } from "./shell-workspace-top-bar";
import { ChatPanel } from "./chat-panel";
import { ContainerArea } from "./container-area";
import { ContextShelfSidebar } from "./context-shelf-sidebar";

export function ShellWorkspaceLayout({
  shell,
  chatId,
}: {
  shell: Shell;
  chatId: string;
}) {
  const { containerOpen, sidebarOpen } = useWorkspaceStore();
  const replaceShellWorkspacePinnedTabs = useWorkspaceStore(
    (s) => s.replaceShellWorkspacePinnedTabs
  );
  const { setActiveChat } = useChatStore();
  const [chatWidth, setChatWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveChat(chatId);
  }, [chatId, setActiveChat]);

  useEffect(() => {
    replaceShellWorkspacePinnedTabs(SHELL_APP_PREVIEW_TAB_ID);
  }, [shell.id, replaceShellWorkspacePinnedTabs]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = chatWidth;

      const handleMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newWidth = Math.max(280, Math.min(600, startWidth + delta));
        setChatWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [chatWidth]
  );

  return (
    <div className="flex h-full flex-col">
      <ShellWorkspaceTopBar shell={shell} />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        <div
          className={
            containerOpen
              ? "flex shrink-0 flex-col overflow-hidden"
              : "flex min-w-0 flex-1 flex-col overflow-hidden"
          }
          style={
            containerOpen
              ? {
                  width: `${chatWidth}px`,
                  transition: isResizing ? "none" : "width 200ms ease",
                }
              : undefined
          }
        >
          <ChatPanel mode="shell" shell={shell} />
        </div>

        {containerOpen && (
          <div
            onMouseDown={handleMouseDown}
            className="relative z-10 w-px shrink-0 cursor-col-resize bg-white/[0.06] transition-colors hover:bg-primary/50 active:bg-primary"
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        )}

        {containerOpen && (
          <div className="flex-1 overflow-hidden">
            <ContainerArea workspace={shell} />
          </div>
        )}

        {sidebarOpen && (
          <div className="w-[280px] shrink-0 overflow-hidden border-l border-white/[0.06]">
            <ContextShelfSidebar workspace={shell} />
          </div>
        )}
      </div>
    </div>
  );
}
