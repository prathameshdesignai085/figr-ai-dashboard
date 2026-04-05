"use client";

import type { Message } from "@/types";
import { OutputCard } from "./output-card";

export function ChatMessage({
  message,
  onKeepOutput,
}: {
  message: Message;
  onKeepOutput: (outputId: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className="py-3">
      {/* Role label */}
      <div className="mb-2">
        <span className="text-xs font-medium text-foreground/40">
          {isUser ? "You" : "Figred"}
        </span>
      </div>

      {/* Text content */}
      {message.content && (
        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      )}

      {/* Output cards */}
      {message.outputs.length > 0 && (
        <div className="mt-3 space-y-2">
          {message.outputs.map((output) => (
            <OutputCard
              key={output.id}
              output={output}
              onKeep={onKeepOutput}
            />
          ))}
        </div>
      )}
    </div>
  );
}
