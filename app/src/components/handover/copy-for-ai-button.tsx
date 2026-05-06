"use client";

import { useState } from "react";
import { Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyForAIButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title="Copy a markdown bundle for Claude Code or Cursor"
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
        copied
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
          : "bg-primary/15 text-primary hover:bg-primary/25",
        className
      )}
    >
      {copied ? <Check size={13} /> : <Sparkles size={13} />}
      {copied ? "Copied" : "Copy for AI"}
    </button>
  );
}
