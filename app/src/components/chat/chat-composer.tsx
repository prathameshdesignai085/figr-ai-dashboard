"use client";

import {
  type ClipboardEvent as ReactClipboardEvent,
  type DragEvent as ReactDragEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CornerDownLeft,
  ImageIcon,
  PenTool,
  Mic,
  Orbit,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TargetPlatform } from "@/types";
import { platformBadgeColors, PlatformIcon, platformLabel } from "@/lib/platform";
import {
  filterSlashCommands,
  parseSlashQuery,
  type SlashCommand,
  type SlashContext,
} from "@/lib/slash-commands";
import { SlashCommandMenu } from "./slash-command-menu";
import { useHandoverStore } from "@/stores/useHandoverStore";
import { useSpaceStore } from "@/stores/useSpaceStore";

export type ComposerContextChip = {
  id: string;
  title: string;
  kind:
    | "output"
    | "annotation"
    | "inspect"
    | "screenshot"
    | "figma-link"
    | "image";
  /** Base64 data URL for screenshot / image thumbnails. */
  dataUrl?: string;
  /** Figma URL for figma-link chips. */
  url?: string;
  /** Parsed Figma file name (best-effort from URL). */
  fileName?: string;
  /** Parsed Figma frame name (best-effort from URL). */
  frameName?: string;
  /** MIME type for image chips (e.g. "image/png"). */
  mimeType?: string;
};

const FIGMA_URL_RE =
  /https?:\/\/(?:www\.)?figma\.com\/(file|design|proto)\/[^/\s]+\/([^?\s]+)(?:\?[^\s]*)?/i;

export type FigmaLinkInfo = {
  url: string;
  fileName?: string;
  frameName?: string;
};

export type ImageAttachmentInfo = {
  dataUrl: string;
  mimeType: string;
  name: string;
};

/** Pull the first Figma URL out of a string and return parsed metadata. */
function parseFigmaUrl(text: string): FigmaLinkInfo | null {
  const m = text.match(FIGMA_URL_RE);
  if (!m) return null;
  const url = m[0];
  const slug = m[2];
  let fileName: string | undefined;
  if (slug) {
    try {
      fileName = decodeURIComponent(slug).replace(/[-_]+/g, " ").trim();
    } catch {
      fileName = slug;
    }
  }
  return { url, fileName, frameName: undefined };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

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
  onAddFigmaLink,
  onAddImage,
  onSubmit,
  canSubmit,
  className,
  platform,
  onPlatformClick,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  contextChips?: ComposerContextChip[];
  onRemoveContextChip?: (chip: ComposerContextChip) => void;
  /** Called when a Figma URL is detected on paste; chip is added by caller. */
  onAddFigmaLink?: (info: FigmaLinkInfo) => void;
  /** Called when an image is attached via paste, drop, or upload. */
  onAddImage?: (info: ImageAttachmentInfo) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  className?: string;
  /** When set, renders a small platform chip in the toolbar mirroring the active space. */
  platform?: TargetPlatform;
  onPlatformClick?: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlashIndex, setActiveSlashIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const slashQuery = useMemo(() => parseSlashQuery(value), [value]);
  const filteredCommands = useMemo(
    () => (slashQuery !== null ? filterSlashCommands(slashQuery) : []),
    [slashQuery]
  );
  const slashMenuOpen = slashQuery !== null;

  // Reset highlight when filter changes
  useEffect(() => {
    setActiveSlashIndex(0);
  }, [slashQuery, filteredCommands.length]);

  const hasVisualContext = useMemo(
    () => contextChips.some((c) => c.kind === "figma-link" || c.kind === "image"),
    [contextChips]
  );

  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const allCapturedStates = useHandoverStore((s) => s.capturedStates);
  const capturedStateCount = useMemo(
    () =>
      activeSpaceId
        ? allCapturedStates.filter((c) => c.spaceId === activeSpaceId).length
        : 0,
    [allCapturedStates, activeSpaceId]
  );
  const hasDsKnowledge = useSpaceStore((s) => {
    if (!activeSpaceId) return false;
    const space = s.spaces.find((sp) => sp.id === activeSpaceId);
    return !!space?.connectedKnowledge.includes("design-system");
  });
  const slashContext: SlashContext = useMemo(
    () => ({ hasVisualContext, capturedStateCount, hasDsKnowledge }),
    [hasVisualContext, capturedStateCount, hasDsKnowledge]
  );

  const selectSlashCommand = (cmd: SlashCommand) => {
    onChange(`/${cmd.trigger} `);
    // Focus textarea after selection so user can keep typing or press Enter
    requestAnimationFrame(() => {
      const el = textareaRef?.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        try {
          el.setSelectionRange(len, len);
        } catch {
          /* ignore */
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMenuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSlashIndex((i) =>
          Math.min(i + 1, Math.max(0, filteredCommands.length - 1))
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSlashIndex((i) => Math.max(0, i - 1));
        return;
      }
      if (e.key === "Enter" && !e.shiftKey && filteredCommands.length > 0) {
        e.preventDefault();
        const cmd = filteredCommands[activeSlashIndex];
        if (cmd) selectSlashCommand(cmd);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        // "Close" menu by clearing the textarea (since menu is value-driven)
        onChange("");
        return;
      }
    }
    onKeyDown?.(e);
  };

  const handlePaste = async (e: ReactClipboardEvent<HTMLTextAreaElement>) => {
    // 1) Check for Figma URL in clipboard text
    const text = e.clipboardData.getData("text/plain");
    if (text) {
      const figma = parseFigmaUrl(text);
      if (figma) {
        e.preventDefault();
        onAddFigmaLink?.(figma);
        return;
      }
    }
    // 2) Check for image in clipboard items
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((it) => it.type.startsWith("image/"));
    if (imageItem && onAddImage) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        try {
          const dataUrl = await readFileAsDataURL(file);
          onAddImage({
            dataUrl,
            mimeType: file.type || "image/png",
            name: file.name || "Pasted image",
          });
        } catch {
          /* ignore */
        }
      }
    }
  };

  const handleDrop = async (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = Array.from(e.dataTransfer.files).find((f) =>
      f.type.startsWith("image/")
    );
    if (file && onAddImage) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        onAddImage({
          dataUrl,
          mimeType: file.type || "image/png",
          name: file.name,
        });
      } catch {
        /* ignore */
      }
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && onAddImage) {
      try {
        const dataUrl = await readFileAsDataURL(file);
        onAddImage({
          dataUrl,
          mimeType: file.type || "image/png",
          name: file.name,
        });
      } catch {
        /* ignore */
      }
    }
    // Reset so same file can be picked again
    e.target.value = "";
  };

  return (
    <div className={cn("relative flex flex-col", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {contextChips.length > 0 && onRemoveContextChip && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {contextChips.map((chip) => {
            if (chip.kind === "screenshot" || chip.kind === "image") {
              return (
                <span
                  key={`${chip.kind}-${chip.id}`}
                  title={chip.title}
                  className="relative inline-flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-black/50"
                >
                  {chip.dataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={chip.dataUrl}
                      alt={chip.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-0.5">
                      <ImageIcon size={14} className="text-foreground/25" />
                      <span className="text-[8px] text-foreground/25">
                        {chip.kind === "image" ? "image" : "capture"}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveContextChip(chip)}
                    className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white/70 hover:bg-black hover:text-white"
                    aria-label={`Remove ${chip.title}`}
                  >
                    <X size={8} />
                  </button>
                  <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-px text-center text-[8px] leading-tight text-foreground/50">
                    {chip.title}
                  </span>
                </span>
              );
            }
            if (chip.kind === "figma-link") {
              return (
                <span
                  key={`${chip.kind}-${chip.id}`}
                  title={chip.url || chip.title}
                  className="inline-flex h-6 max-w-full min-w-0 items-center gap-1 overflow-hidden rounded bg-[#2a2a2a] pl-1.5 pr-0.5 text-[10px] text-foreground/85"
                >
                  <PenTool size={10} className="shrink-0 text-foreground/70" />
                  <span className="min-w-0 max-w-[min(220px,100%)] truncate">
                    {chip.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveContextChip(chip)}
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded hover:bg-white/[0.08]"
                    aria-label={`Remove ${chip.title}`}
                  >
                    <X size={9} />
                  </button>
                </span>
              );
            }
            // output / annotation / inspect — original chip style
            return (
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
            );
          })}
        </div>
      )}

      {slashMenuOpen && (
        <SlashCommandMenu
          commands={filteredCommands}
          activeIndex={activeSlashIndex}
          onSelect={selectSlashCommand}
          context={slashContext}
        />
      )}

      <div
        onDragOver={(e) => {
          if (Array.from(e.dataTransfer.items).some((it) => it.type.startsWith("image/"))) {
            e.preventDefault();
            setIsDragging(true);
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex h-[102px] flex-col rounded-[16px] bg-[#181818] px-3 py-3 shadow-none outline-none ring-0 transition-colors",
          isDragging && "ring-1 ring-primary/60"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          rows={1}
          className="min-h-0 w-full flex-1 resize-none overflow-y-auto border-0 bg-transparent text-sm leading-snug text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
        />

        <div className="mt-1.5 flex h-[27px] shrink-0 items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-[27px] items-center gap-1.5 rounded-[8px] bg-[#0f0f0f] px-2.5 text-xs font-medium text-[#f5f5f5] transition-colors hover:bg-[#2a2a2a]"
            >
              <Plus size={13} strokeWidth={2} className="shrink-0 text-[#f5f5f5]" />
              <span>Add contexts</span>
            </button>
            {platform && (
              <button
                type="button"
                onClick={onPlatformClick}
                title={`Generating for ${platformLabel(platform)} — click badge in top bar to switch`}
                className={cn(
                  "flex h-[27px] items-center gap-1 rounded-[8px] px-2 text-[11px] font-medium capitalize transition-opacity hover:opacity-80",
                  platformBadgeColors[platform]
                )}
              >
                <PlatformIcon platform={platform} size={11} />
                {platformLabel(platform)}
              </button>
            )}
          </div>

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
