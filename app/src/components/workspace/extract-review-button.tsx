"use client";

import { Package } from "lucide-react";
import { useExtractStore } from "@/stores/useExtractStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { cn } from "@/lib/utils";

/**
 * "Review N components →" button rendered in the chat message footer when
 * /extract-components has finished. Click → opens a tab in the canvas
 * container that hosts the ExtractComponentsPanel.
 */
export function ExtractReviewButton({
  extractionId,
  className,
}: {
  extractionId: string;
  className?: string;
}) {
  const extraction = useExtractStore((s) => s.extractions[extractionId]);
  const openTab = useWorkspaceStore((s) => s.openTab);

  if (!extraction) return null;

  const count = extraction.components.length;

  const handleOpen = () => {
    openTab({
      id: `extract-${extractionId}`,
      type: "component-extract",
      title: `Components · ${extraction.spaceName}`,
      content: "",
      extractionId,
      closable: true,
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-md bg-primary/15 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/25",
        className
      )}
    >
      <Package size={13} />
      Review {count} component{count === 1 ? "" : "s"} →
    </button>
  );
}
