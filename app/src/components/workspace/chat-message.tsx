"use client";

import { useState } from "react";
import { X, PenTool } from "lucide-react";
import type { Message } from "@/types";
import { OutputCard } from "./output-card";
import { SaveToSpaceButton } from "@/components/handover/save-to-space-button";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { ExtractReviewButton } from "./extract-review-button";
import { ExtractionLoaderView } from "./extraction-loader-view";

function shortenFigmaLink(f: {
  url: string;
  fileName?: string;
  frameName?: string;
}): string {
  if (f.fileName && f.frameName) return `${f.fileName} · ${f.frameName}`;
  if (f.fileName) return f.fileName;
  try {
    const u = new URL(f.url);
    const path = u.pathname.length > 28 ? u.pathname.slice(0, 28) + "…" : u.pathname;
    return `${u.hostname.replace(/^www\./, "")}${path}`;
  } catch {
    return f.url;
  }
}

function ScreenshotLightbox({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80"
        aria-label="Close"
      >
        <X size={16} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Screenshot preview"
        className="max-h-[85vh] max-w-[90vw] rounded-lg border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function ChatMessage({
  message,
  onKeepOutput,
}: {
  message: Message;
  onKeepOutput: (outputId: string) => void;
}) {
  const isUser = message.role === "user";
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const screenshots = message.screenshotUrls ?? [];
  const figmaAttachments = message.figmaAttachments ?? [];

  return (
    <div className="py-3">
      {/* Role label + assistant flags */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-foreground/40">
          {isUser ? "You" : "Figred"}
        </span>
        {message.mock && !isUser && (
          <span className="inline-flex h-[18px] items-center rounded bg-amber-500/15 px-1.5 text-[10px] font-medium uppercase tracking-wide text-amber-300/90">
            Mock
          </span>
        )}
        {message.streaming && !isUser && (
          <span className="text-[10px] text-foreground/35">describing…</span>
        )}
      </div>

      {/* Screenshot / image previews */}
      {screenshots.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {screenshots.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxSrc(url)}
              className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/30 transition-colors hover:border-primary/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Screenshot ${i + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {/* Extraction loader takes the place of free-form content while running. */}
      {message.extractionProgress ? (
        <ExtractionLoaderView progress={message.extractionProgress} />
      ) : (message.content || message.streaming || figmaAttachments.length > 0) ? (
        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {figmaAttachments.map((f, i) => (
            <span key={i}>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                title={f.url}
                className="inline-flex max-w-[280px] items-center gap-1.5 align-middle rounded-md bg-primary/10 px-2 py-1 text-[13px] font-medium text-primary no-underline hover:bg-primary/20"
              >
                <PenTool size={12} className="shrink-0" />
                <span className="truncate">{shortenFigmaLink(f)}</span>
              </a>
              {(i < figmaAttachments.length - 1 || message.content) && " "}
            </span>
          ))}
          {message.content}
          {message.streaming && (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-foreground/50 align-baseline" />
          )}
        </div>
      ) : null}

      {/* Save-to-Space affordance for completed skill outputs */}
      {message.skillName && !message.streaming && message.content && (
        <SaveToSpaceMessageFooter message={message} />
      )}

      {/* Review-components affordance after /extract-components completes */}
      {message.extractionId && !message.streaming && (
        <div className="mt-3">
          <ExtractReviewButton extractionId={message.extractionId} />
        </div>
      )}

      {/* Output cards */}
      {message.outputs.length > 0 && (
        <div className="mt-3 space-y-2">
          {message.outputs.map((output) => (
            <OutputCard
              key={output.id}
              output={output}
              onKeep={onKeepOutput}
            />
          ))}
        </div>
      )}

      {/* Full-size lightbox */}
      {lightboxSrc && (
        <ScreenshotLightbox
          src={lightboxSrc}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}

/**
 * Small footer rendered after a completed skill message — promotes the
 * streamed markdown to a Space context item via SaveToSpaceButton.
 */
function SaveToSpaceMessageFooter({ message }: { message: Message }) {
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  if (!activeSpaceId || !message.skillName) return null;
  return (
    <div className="mt-3 flex items-center gap-2">
      <SaveToSpaceButton
        chatId={message.chatId}
        messageId={message.id}
        spaceId={activeSpaceId}
        skillId={message.skillName}
        content={message.content}
        alreadySaved={!!message.savedAsContextItemId}
      />
    </div>
  );
}
