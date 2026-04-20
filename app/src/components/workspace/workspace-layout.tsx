"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Space } from "@/types";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useChatStore } from "@/stores/useChatStore";
import { WorkspaceTopBar } from "./workspace-top-bar";
import { ChatPanel } from "./chat-panel";
import { ContainerArea } from "./container-area";
import { ContextShelfSidebar } from "./context-shelf-sidebar";
import { SpaceSettingsPanel } from "./space-settings-panel";

export function WorkspaceLayout({
  space,
  chatId,
}: {
  space: Space;
  chatId: string;
}) {
  const { containerOpen, sidebarOpen } = useWorkspaceStore();
  const removeShellAppPreviewTabFromWorkspace = useWorkspaceStore(
    (s) => s.removeShellAppPreviewTabFromWorkspace
  );
  const openOnDeviceTab = useWorkspaceStore((s) => s.openOnDeviceTab);
  const { setActiveChat, chats } = useChatStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveChat(chatId);
  }, [chatId, setActiveChat]);

  useEffect(() => {
    removeShellAppPreviewTabFromWorkspace();
  }, [space.id, removeShellAppPreviewTabFromWorkspace]);

  // Mobile (or universal) spaces with at least one Built mobile output land
  // straight on the On Device tab + share overlay the first time the user
  // visits them in a session. After that the user's last interaction sticks.
  useEffect(() => {
    const isMobileLike =
      space.targetPlatform === "mobile" || space.targetPlatform === "universal";
    if (!isMobileLike) return;
    if (typeof window === "undefined") return;

    const sessionKey = `figred:mobile-autopreview:${space.id}`;
    if (window.sessionStorage.getItem(sessionKey)) return;

    const hasBuiltMobileOutput = chats.some(
      (c) =>
        c.spaceId === space.id &&
        c.messages.some((m) =>
          m.outputs.some(
            (o) => o.fidelity === "built" && o.platform === "mobile"
          )
        )
    );
    if (!hasBuiltMobileOutput) return;

    window.sessionStorage.setItem(sessionKey, "1");
    openOnDeviceTab();
  }, [space.id, space.targetPlatform, chats, openOnDeviceTab]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX = e.clientX;
      const startWidth = chatWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startX;
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
      <WorkspaceTopBar
        space={space}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div
        ref={containerRef}
        className="flex flex-1 overflow-hidden"
      >
        {/* Chat Panel — flex-1 when canvas closed so shelf shares the row (100% width would clip the sidebar) */}
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
          <ChatPanel mode="space" space={space} />
        </div>

        {/* Resize handle */}
        {containerOpen && (
          <div
            onMouseDown={handleMouseDown}
            className="relative z-10 w-px shrink-0 cursor-col-resize bg-white/[0.06] hover:bg-primary/50 active:bg-primary transition-colors"
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>
        )}

        {/* Container Area */}
        {containerOpen && (
          <div className="flex-1 overflow-hidden">
            <ContainerArea workspace={space} />
          </div>
        )}

        {/* Context/Shelf Sidebar */}
        {sidebarOpen && (
          <div className="w-[280px] shrink-0 overflow-hidden border-l border-white/[0.06]">
            <ContextShelfSidebar workspace={space} />
          </div>
        )}
      </div>

      {/* Space Settings Dialog */}
      <SpaceSettingsPanel
        space={space}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
