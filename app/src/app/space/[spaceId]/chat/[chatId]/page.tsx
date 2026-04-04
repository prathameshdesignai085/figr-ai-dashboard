"use client";

import { use } from "react";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { WorkspaceLayout } from "@/components/workspace/workspace-layout";

export default function SpaceChatPage({
  params,
}: {
  params: Promise<{ spaceId: string; chatId: string }>;
}) {
  const { spaceId, chatId } = use(params);
  const { spaces } = useSpaceStore();
  const space = spaces.find((s) => s.id === spaceId);

  if (!space) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-foreground/30">Space not found</p>
      </div>
    );
  }

  return <WorkspaceLayout space={space} chatId={chatId} />;
}
