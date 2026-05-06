"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown-to-html";

/**
 * Doc card. Collapsed by default — shows a plain-text preview snippet so
 * the user can skim. Clicking the header expands to a fully rendered
 * markdown view (headers, bold, lists). No raw markdown ever shows.
 */
export function SmartDocSection({
  title,
  hint,
  content,
  onDownload,
  defaultOpen = false,
}: {
  title: string;
  hint?: string;
  content?: string;
  onDownload?: () => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const { previewText, wordCount } = useMemo(() => {
    if (!content) return { previewText: "", wordCount: 0 };
    // Strip markdown syntax for the preview line.
    const stripped = content
      .replace(/^#+\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/\|/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = content.trim().split(/\s+/).length;
    return {
      previewText: stripped.slice(0, 180) + (stripped.length > 180 ? "…" : ""),
      wordCount: words,
    };
  }, [content]);

  const renderedHtml = useMemo(
    () => (content ? markdownToHtml(content) : ""),
    [content]
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white/[0.02] transition-colors",
        open
          ? "border-white/[0.12]"
          : "border-white/[0.06] hover:border-white/[0.12]"
      )}
    >
      {/* Header row — entire row is clickable */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-foreground/55">
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline flex-wrap gap-2">
            <span className="text-sm font-medium text-foreground/90">
              {title}
            </span>
            {hint && (
              <span className="text-[10px] uppercase tracking-wide text-foreground/35">
                {hint}
              </span>
            )}
            {wordCount > 0 && (
              <span className="text-[10px] text-foreground/35">
                {wordCount} words
              </span>
            )}
          </span>
          {!open && previewText && (
            <span className="mt-1 block truncate text-[12px] leading-snug text-foreground/45">
              {previewText}
            </span>
          )}
          {!open && !content && (
            <span className="mt-1 block text-[12px] text-foreground/30">
              No inline content — connect the source to view.
            </span>
          )}
        </span>
        {onDownload && content && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onDownload();
              }
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-foreground/35 hover:bg-white/[0.06] hover:text-foreground/70"
            title="Download as markdown"
            aria-label={`Download ${title}`}
          >
            <Download size={12} />
          </span>
        )}
      </button>

      {/* Expanded body — rendered markdown */}
      {open && content && (
        <div className="border-t border-white/[0.06] px-5 py-4">
          <div
            className="figred-md text-foreground/85"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      )}
      {open && !content && (
        <div className="border-t border-white/[0.06] px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-foreground/40">
            <FileText size={13} />
            No inline content stored — open the source link to view.
          </p>
        </div>
      )}
    </div>
  );
}
