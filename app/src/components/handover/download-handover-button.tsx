"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function DownloadHandoverButton({
  filename,
  text,
  className,
}: {
  filename: string;
  text: string;
  className?: string;
}) {
  const onClick = () => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title="Download handover as markdown"
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-md bg-white/[0.06] px-3 text-xs font-medium text-foreground/70 transition-colors hover:bg-white/[0.1]",
        className
      )}
    >
      <Download size={13} />
      Download
    </button>
  );
}

/** Trigger a markdown download programmatically (used by per-doc download buttons). */
export function downloadMarkdown(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
