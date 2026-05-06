"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MessageCircle, Plus, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { HandoverComment, HandoverCommentAnchor } from "@/types";

const POLL_MS = 5000;
const COMMENT_AUTHOR = "you";
/** Window event used to close other open panels when one opens. */
const ACTIVE_ANCHOR_EVENT = "figred:active-comment-anchor";

/**
 * Inline comment trigger anchored to a section. The actual thread renders
 * in a portal'd side panel on the right edge of the viewport, so it never
 * collapses or distorts the section's content. Only one panel is open at
 * a time across the page (cross-instance broadcast via window event).
 */
export function CommentsThread({
  slug,
  anchor,
  /** Initial comments hydrated from the page-level GET. */
  comments,
  /** Optional friendly label for the panel header (e.g. "Summary"). */
  anchorLabel,
  className,
}: {
  slug: string;
  anchor: HandoverCommentAnchor;
  comments: HandoverComment[];
  anchorLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<HandoverComment[]>(comments);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  // Keep local list in sync if parent re-hydrates initial comments.
  useEffect(() => {
    setList(comments);
  }, [comments]);

  const filtered = useMemo(
    () => list.filter((c) => c.anchor === anchor),
    [list, anchor]
  );

  // Cross-instance "only one open at a time" — broadcast on open, listen always.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { anchor?: string } | null;
      if (detail?.anchor !== anchor) setOpen(false);
    };
    window.addEventListener(ACTIVE_ANCHOR_EVENT, handler);
    return () => window.removeEventListener(ACTIVE_ANCHOR_EVENT, handler);
  }, [anchor]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Poll while open
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/handover/${slug}/comments`);
        if (!res.ok) return;
        const data = (await res.json()) as { comments: HandoverComment[] };
        if (!cancelled) setList(data.comments);
      } catch {
        /* ignore polling failures */
      }
    };
    void tick();
    pollRef.current = window.setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      if (pollRef.current != null) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [open, slug]);

  const openPanel = () => {
    window.dispatchEvent(
      new CustomEvent(ACTIVE_ANCHOR_EVENT, { detail: { anchor } })
    );
    setOpen(true);
  };

  const submit = async () => {
    const body = draft.trim();
    if (!body) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/handover/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anchor, body, author: COMMENT_AUTHOR }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Failed (${res.status}): ${t.slice(0, 200)}`);
      }
      const data = (await res.json()) as { comment: HandoverComment };
      setList((prev) => [...prev, data.comment]);
      setDraft("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className={cn(
          "flex h-6 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium transition-colors",
          open
            ? "bg-primary/15 text-primary"
            : filtered.length > 0
              ? "bg-white/[0.06] text-foreground/75 hover:bg-white/[0.1]"
              : "text-foreground/35 hover:bg-white/[0.05] hover:text-foreground/65",
          className
        )}
        aria-expanded={open}
        aria-label={
          filtered.length > 0
            ? `${filtered.length} comment${filtered.length === 1 ? "" : "s"}`
            : "Add comment"
        }
      >
        {filtered.length > 0 ? (
          <>
            <MessageCircle size={11} />
            <span>{filtered.length}</span>
          </>
        ) : (
          <>
            <Plus size={11} />
            <span className="hidden sm:inline">Comment</span>
          </>
        )}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <SidePanel
            anchorLabel={anchorLabel ?? anchorPrettyName(anchor)}
            comments={filtered}
            draft={draft}
            posting={posting}
            error={error}
            onDraftChange={setDraft}
            onSubmit={submit}
            onClose={() => setOpen(false)}
          />,
          document.body
        )}
    </>
  );
}

function SidePanel({
  anchorLabel,
  comments,
  draft,
  posting,
  error,
  onDraftChange,
  onSubmit,
  onClose,
}: {
  anchorLabel: string;
  comments: HandoverComment[];
  draft: string;
  posting: boolean;
  error: string | null;
  onDraftChange: (next: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  // Auto-focus the composer when the panel opens.
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    requestAnimationFrame(() => taRef.current?.focus());
  }, []);

  return (
    <>
      {/* Mobile backdrop only — desktop shows side rail without dimming */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-white/[0.08] bg-[#0e0e0e] shadow-2xl lg:right-6 lg:top-10 lg:bottom-10 lg:max-h-[80vh] lg:rounded-xl lg:border lg:border-white/[0.08]"
        role="dialog"
        aria-label={`Comments — ${anchorLabel}`}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
              Comments
            </div>
            <div className="truncate text-sm font-medium text-foreground/90">
              {anchorLabel}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/40 hover:bg-white/[0.06] hover:text-foreground/85"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="px-4 py-6 text-center text-[12px] text-foreground/40">
              No comments yet.
              <br />
              Be the first.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {comments.map((c) => (
                <li key={c.id} className="px-4 py-3">
                  <div className="mb-1 flex items-baseline justify-between gap-2 text-[11px]">
                    <span className="font-medium text-foreground/85">
                      {c.author}
                    </span>
                    <span className="text-foreground/35">
                      {formatRelative(c.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/85">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-white/[0.06] p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="Add a comment… ⌘↵ to send"
              rows={3}
              className="min-h-[64px] flex-1 resize-none rounded-md border border-white/[0.08] bg-[#161616] px-2.5 py-2 text-[13px] text-foreground/90 placeholder:text-foreground/35 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <button
              type="button"
              onClick={onSubmit}
              disabled={!draft.trim() || posting}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
                draft.trim() && !posting
                  ? "bg-primary/85 text-primary-foreground hover:bg-primary"
                  : "cursor-not-allowed bg-white/[0.06] text-foreground/35"
              )}
              aria-label="Post comment"
            >
              {posting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
          {error && (
            <p className="mt-1.5 text-[10px] text-red-400">{error}</p>
          )}
        </div>
      </aside>
    </>
  );
}

function formatRelative(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

function anchorPrettyName(anchor: HandoverCommentAnchor): string {
  if (anchor.startsWith("spec:")) return "Spec";
  if (anchor.startsWith("knowledge:")) return "Knowledge";
  switch (anchor) {
    case "summary":
      return "Summary";
    case "prototype":
      return "Prototype states";
    case "figma":
      return "Figma section";
    case "specs":
      return "Specs & decisions";
    case "knowledge":
      return "Connected knowledge";
    case "open-questions":
      return "Open questions";
    default:
      return anchor;
  }
}
