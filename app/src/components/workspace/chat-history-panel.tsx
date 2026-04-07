"use client";

import { Search, Plus, ChevronDown, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function ChatHistoryPanel({
  spaceId,
  shellId,
}: {
  spaceId?: string;
  shellId?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const {
    getActiveChatsForSpace,
    getArchivedChatsForSpace,
    getActiveChatsForShell,
    getArchivedChatsForShell,
    activeChatId,
    createChat,
    createShellChat,
  } = useChatStore();
  const { toggleChatHistory } = useWorkspaceStore();

  const activeChats = shellId
    ? getActiveChatsForShell(shellId)
    : getActiveChatsForSpace(spaceId!);
  const archivedChats = shellId
    ? getArchivedChatsForShell(shellId)
    : getArchivedChatsForSpace(spaceId!);

  const filteredChats = search
    ? activeChats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : activeChats;

  const handleNewChat = () => {
    if (shellId) {
      const chat = createShellChat(shellId);
      router.push(`/shells/${shellId}/chat/${chat.id}`);
    } else {
      const chat = createChat(spaceId!);
      router.push(`/space/${spaceId}/chat/${chat.id}`);
    }
    toggleChatHistory();
  };

  const handleSelectChat = (chatId: string) => {
    if (shellId) {
      router.push(`/shells/${shellId}/chat/${chatId}`);
    } else {
      router.push(`/space/${spaceId}/chat/${chatId}`);
    }
    toggleChatHistory();
  };

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-background">
      {/* Search */}
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5">
          <Search size={13} className="shrink-0 text-foreground/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-foreground/25 focus:outline-none"
          />
        </div>
      </div>

      {/* New Chat button */}
      <div className="px-3 mb-2">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] py-1.5 text-xs text-foreground/50 hover:bg-white/[0.04] hover:text-foreground/70 transition-colors"
        >
          <Plus size={12} />
          New Chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2">
        <span className="px-2 text-[10px] font-medium uppercase tracking-wider text-foreground/25">
          Chats
        </span>
        <div className="mt-1.5 space-y-0.5">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors",
                chat.id === activeChatId
                  ? "bg-white/[0.06] text-foreground"
                  : "text-foreground/50 hover:bg-white/[0.03] hover:text-foreground/70"
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  chat.id === activeChatId ? "bg-primary" : "bg-foreground/15"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{chat.name}</p>
                <p className="text-[10px] text-foreground/25">
                  {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Archived */}
        {archivedChats.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-1 px-2 text-[10px] font-medium uppercase tracking-wider text-foreground/25 hover:text-foreground/40"
            >
              <ChevronDown
                size={10}
                className={cn("transition-transform", !showArchived && "-rotate-90")}
              />
              Archived
            </button>
            {showArchived && (
              <div className="mt-1 space-y-0.5">
                {archivedChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-foreground/30 hover:bg-white/[0.03] hover:text-foreground/50 transition-colors"
                  >
                    <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/10" />
                    <p className="text-xs truncate">{chat.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
