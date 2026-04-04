"use client";

import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Plus, X } from "lucide-react";
import { useShelfStore } from "@/stores/useShelfStore";
import { cn } from "@/lib/utils";

export function ChatInput({
  onSend,
  contextChips,
}: {
  onSend: (message: string) => void;
  contextChips: { id: string; title: string }[];
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toggleOutputSelection } = useShelfStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/[0.06] p-3">
      {/* Context chips */}
      {contextChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {contextChips.map((chip) => (
            <span
              key={chip.id}
              className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
            >
              {chip.title}
              <button
                onClick={() => toggleOutputSelection(chip.id)}
                className="hover:text-primary/80"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
        <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.04] transition-colors mb-0.5">
          <Plus size={16} />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-foreground/25 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors mb-0.5",
            value.trim()
              ? "bg-primary text-primary-foreground"
              : "text-foreground/20"
          )}
        >
          <CornerDownLeft size={14} />
        </button>
      </div>
    </div>
  );
}
