"use client";

import type { RefObject } from "react";
import { CornerDownLeft, Mic, Orbit, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComposerContextChip = {
  id: string;
  title: string;
  kind: "output" | "annotation";
};

/**
 * Chat shell: optional chips above a fixed 102px-tall card (#181818, 16px radius).
 * Inner controls stay 27px / 8px radius on primary actions; horizontal padding 12px, vertical 8px.
 */
export function ChatComposer({
  value,
  onChange,
  onKeyDown,
  placeholder,
  textareaRef,
  contextChips = [],
  onRemoveContextChip,
  onSubmit,
  canSubmit,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  contextChips?: ComposerContextChip[];
  onRemoveContextChip?: (chip: ComposerContextChip) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      {contextChips.length > 0 && onRemoveContextChip && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {contextChips.map((chip) => (
            <span
              key={`${chip.kind}-${chip.id}`}
              title={chip.title}
              className="inline-flex h-6 max-w-full min-w-0 items-center gap-1 overflow-hidden rounded bg-primary/15 pl-1.5 pr-0.5 text-[10px] text-primary"
            >
              <span className="min-w-0 max-w-[min(180px,100%)] truncate">
                {chip.title}
              </span>
              <button
                type="button"
                onClick={() => onRemoveContextChip(chip)}
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded hover:bg-primary/25 hover:text-primary"
                aria-label={`Remove ${chip.title}`}
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div
        className={cn(
          "flex h-[102px] flex-col rounded-[16px] bg-[#181818] px-3 py-3 shadow-none outline-none ring-0"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          className="min-h-0 w-full flex-1 resize-none overflow-y-auto border-0 bg-transparent text-sm leading-snug text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
        />

        <div className="mt-1.5 flex h-[27px] shrink-0 items-center justify-between gap-2">
          <button
            type="button"
            className="flex h-[27px] items-center gap-1.5 rounded-[8px] bg-[#0f0f0f] px-2.5 text-xs font-medium text-[#f5f5f5] transition-colors hover:bg-[#2a2a2a]"
          >
            <Plus size={13} strokeWidth={2} className="shrink-0 text-[#f5f5f5]" />
            <span>Add contexts</span>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              className="flex h-[27px] items-center gap-1 rounded px-2.5 text-xs text-zinc-100 transition-colors hover:text-white"
            >
              <Orbit size={13} className="shrink-0 text-zinc-100" />
              <span>Auto</span>
            </button>
            <button
              type="button"
              className="flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded bg-[#252525] text-zinc-100 transition-colors hover:bg-[#2a2a2a]"
              aria-label="Voice input"
            >
              <Mic size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(
                "flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded transition-colors",
                canSubmit
                  ? "bg-primary/75 text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-[#2a2a2a] text-zinc-600"
              )}
              aria-label="Send message"
            >
              <CornerDownLeft size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
