"use client";

import { Check, Loader2, Search, Puzzle, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { EXTRACTION_STEPS } from "@/lib/extract-runner";

const STEP_ICONS: LucideIcon[] = [Search, Puzzle, BarChart3];

export function ExtractionLoaderView({
  progress,
}: {
  progress: {
    currentStepIndex: number;
    done: boolean;
    summary?: string;
  };
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
      <ul className="space-y-1.5">
        {EXTRACTION_STEPS.map((label, i) => {
          const Icon = STEP_ICONS[i] ?? Search;
          const isComplete = progress.done || i < progress.currentStepIndex;
          const isActive = !progress.done && i === progress.currentStepIndex;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2.5 text-[12.5px] transition-colors",
                isComplete && "text-foreground/85",
                isActive && "text-foreground/90",
                !isComplete && !isActive && "text-foreground/35"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors",
                  isComplete && "bg-emerald-500/15 text-emerald-300",
                  isActive && "bg-primary/15 text-primary",
                  !isComplete && !isActive && "bg-white/[0.04] text-foreground/30"
                )}
              >
                {isComplete ? (
                  <Check size={12} />
                ) : isActive ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Icon size={12} />
                )}
              </span>
              <span className="leading-tight">{label}</span>
            </li>
          );
        })}
      </ul>
      {progress.done && progress.summary && (
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.04] pt-2.5 text-[12.5px] text-foreground/85">
          <Sparkles size={12} className="text-primary" />
          <span>{progress.summary}</span>
        </div>
      )}
    </div>
  );
}
