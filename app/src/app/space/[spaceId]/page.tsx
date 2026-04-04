"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useChatStore } from "@/stores/useChatStore";

export default function SpacePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = use(params);
  const router = useRouter();
  const { spaces, setActiveSpace } = useSpaceStore();
  const { getChatsForSpace } = useChatStore();

  useEffect(() => {
    setActiveSpace(spaceId);
    const spaceChats = getChatsForSpace(spaceId);
    if (spaceChats.length > 0) {
      const newest = [...spaceChats].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      router.replace(`/space/${spaceId}/chat/${newest.id}`);
    }
  }, [spaceId, router, setActiveSpace, getChatsForSpace]);

  const space = spaces.find((s) => s.id === spaceId);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">{space?.name || "Space"}</h2>
        <p className="text-sm text-muted-foreground">
          No chats yet. Start a new conversation.
        </p>
      </div>
    </div>
  );
}
