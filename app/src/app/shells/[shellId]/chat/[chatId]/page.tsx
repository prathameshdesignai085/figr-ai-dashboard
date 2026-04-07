"use client";

import { use } from "react";
import { useShellStore } from "@/stores/useShellStore";
import { useChatStore } from "@/stores/useChatStore";
import { ShellWorkspaceLayout } from "@/components/workspace/shell-workspace-layout";

export default function ShellChatPage({
  params,
}: {
  params: Promise<{ shellId: string; chatId: string }>;
}) {
  const { shellId, chatId } = use(params);
  const shell = useShellStore((s) => s.getShell(shellId));
  const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));

  if (!shell || !chat || chat.shellId !== shellId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-foreground/30">Shell or chat not found</p>
      </div>
    );
  }

  return <ShellWorkspaceLayout shell={shell} chatId={chatId} />;
}
