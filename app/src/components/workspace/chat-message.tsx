"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Message } from "@/types";
import { OutputCard } from "./output-card";

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

  return (
    <div className="py-3">
      {/* Role label */}
      <div className="mb-2">
        <span className="text-xs font-medium text-foreground/40">
          {isUser ? "You" : "Figred"}
        </span>
      </div>

      {/* Screenshot previews */}
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

      {/* Text content */}
      {message.content && (
        <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {message.content}
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
