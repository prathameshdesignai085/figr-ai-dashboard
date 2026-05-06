"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { type SlashCommand, type SlashContext } from "@/lib/slash-commands";

/**
 * Gating temporarily disabled while the rest of the workspace runs on mock
 * data — it's hard to satisfy every command's requirement (captured states,
 * connected DS knowledge, etc.) just to flip a single command on. Flip this
 * to `true` to re-enable per-command requirements + tooltip text.
 */
const ENFORCE_REQUIREMENTS = false;

export function SlashCommandMenu({
  commands,
  activeIndex,
  onSelect,
  // context is kept on the prop type for forward-compat — currently unused
  // because requirement enforcement is off (see ENFORCE_REQUIREMENTS).
  context: _context,
}: {
  commands: SlashCommand[];
  activeIndex: number;
  onSelect: (command: SlashCommand) => void;
  context: SlashContext;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (commands.length === 0) {
    return (
      <div className="absolute bottom-full left-0 right-0 mb-2 rounded-[12px] border border-white/[0.06] bg-[#181818] p-3 text-xs text-foreground/40 shadow-xl">
        No matching commands.
      </div>
    );
  }

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-[12px] border border-white/[0.06] bg-[#181818] shadow-xl">
      <div className="border-b border-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-wider text-foreground/35">
        Commands
      </div>
      <div ref={listRef} className="max-h-72 overflow-y-auto py-1">
        {commands.map((cmd, i) => {
          const Icon = cmd.icon;
          const active = i === activeIndex;
          return (
            <button
              key={cmd.id}
              type="button"
              onMouseDown={(e) => {
                // Prevent textarea blur before click fires
                e.preventDefault();
              }}
              onClick={() => onSelect(cmd)}
              className={cn(
                "flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors",
                active ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                  active
                    ? "bg-primary/20 text-primary"
                    : "bg-white/[0.06] text-foreground/60"
                )}
              >
                <Icon size={12} strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-tight text-foreground/90">
                  {cmd.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-tight text-foreground/45">
                  {cmd.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Suppress unused var warning when ENFORCE_REQUIREMENTS is false
void ENFORCE_REQUIREMENTS;
