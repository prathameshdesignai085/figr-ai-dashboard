"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChatComposer,
  type ComposerContextChip,
} from "@/components/chat/chat-composer";
import { useSpaceStore } from "@/stores/useSpaceStore";

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
  const space = useSpaceStore((s) => s.getActiveSpace());
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onFocusComposer = () => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener(
      "figred:focus-workspace-chat-composer",
      onFocusComposer
    );
    return () =>
      window.removeEventListener(
        "figred:focus-workspace-chat-composer",
        onFocusComposer
      );
  }, []);

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

  const placeholder =
    space?.targetPlatform === "mobile"
      ? "Describe a screen, flow, or interaction…"
      : "Ask anything...";

  return (
    <div className="pb-3 pt-1">
      <ChatComposer
        value={value}
        onChange={setValue}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        textareaRef={textareaRef}
        contextChips={contextChips}
        onRemoveContextChip={onRemoveContextChip}
        onSubmit={handleSubmit}
        canSubmit={!!value.trim()}
        platform={space?.targetPlatform}
      />
    </div>
  );
}
