"use client";

import { use } from "react";
import { MessageSquare } from "lucide-react";

export default function IndependentChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <MessageSquare size={32} className="text-muted-foreground mb-3" />
      <h2 className="text-lg font-semibold">Independent chat</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Chat {chatId} — workspace coming soon
      </p>
    </div>
  );
}
