"use client";

import { useState, useRef } from "react";
import {
  ChatComposer,
  type ComposerContextChip,
} from "@/components/chat/chat-composer";

export type ContextChip = ComposerContextChip;

export function ChatInput({
  onSend,
  contextChips,
  onRemoveContextChip,
}: {
  onSend: (message: string) => void;
  contextChips: ContextChip[];
  onRemoveContextChip: (chip: ContextChip) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Text area height is fixed in ChatComposer (112px); no auto-resize override needed

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="pb-3 pt-1">
      <ChatComposer
        value={value}
        onChange={setValue}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        textareaRef={textareaRef}
        contextChips={contextChips}
        onRemoveContextChip={onRemoveContextChip}
        onSubmit={handleSubmit}
        canSubmit={!!value.trim()}
      />
    </div>
  );
}
