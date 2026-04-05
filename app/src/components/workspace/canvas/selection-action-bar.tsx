"use client";

import { useState, useEffect, useCallback, useRef, type RefObject } from "react";
import {
  Hammer,
  Layers,
  Maximize2,
  ArrowUp,
  Merge,
  MonitorPlay,
  MoreVertical,
  Pencil,
} from "lucide-react";
import type { Editor } from "tldraw";
import type { Output } from "@/types";
import { cn } from "@/lib/utils";
import { isAppLikeOutput, isBuiltOutput } from "@/lib/output-view-mode";

/** Screen-like: can build / vary (not already built). */
function isBuildableScreen(output: Output): boolean {
  if (isBuiltOutput(output)) return false;
  return (
    output.type === "screen" ||
    output.type === "wireframe" ||
    output.type === "component" ||
    output.content.trim().startsWith("<")
  );
}

export type SelectionMoreMenuAction =
  | "design-system"
  | "figma"
  | "remix";

/** Outer: overflow visible so kebab dropdown is not clipped. */
const SELECTION_BAR_OUTER =
  "absolute left-1/2 top-3 z-20 flex w-max min-w-0 max-w-[calc(100%-20px)] -translate-x-1/2 items-center gap-0.5 overflow-visible rounded-[10px] border border-white/[0.09] bg-[#141414]/95 p-0.5 shadow-lg backdrop-blur-md";

/** Inner: only action buttons scroll; kebab stays outside this node. */
const SELECTION_BAR_SCROLL =
  "flex min-w-0 flex-1 flex-nowrap items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const SELECTION_ACTION_BTN =
  "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium leading-none text-foreground/70 hover:bg-white/[0.08] hover:text-foreground transition-colors whitespace-nowrap";

function SelectionMoreMenu({
  outputs,
  onAction,
}: {
  outputs: Output[];
  onAction?: (action: SelectionMoreMenuAction, outputs: Output[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closePointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const closeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closePointer);
    document.addEventListener("keydown", closeKey);
    return () => {
      document.removeEventListener("mousedown", closePointer);
      document.removeEventListener("keydown", closeKey);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-start rounded-md px-2.5 py-2 text-left text-xs text-foreground/80 hover:bg-white/[0.06] transition-colors";

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="More options"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/55 hover:bg-white/[0.08] hover:text-foreground/90 transition-colors"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-[100] min-w-[min(280px,calc(100vw-24px))] rounded-lg border border-white/[0.08] bg-[#252525] py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              onAction?.("design-system", outputs);
              setOpen(false);
            }}
          >
            Create a design system out of this
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              onAction?.("figma", outputs);
              setOpen(false);
            }}
          >
            Copy to Figma
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => {
              onAction?.("remix", outputs);
              setOpen(false);
            }}
          >
            Remix in a new space
          </button>
        </div>
      )}
    </div>
  );
}

export function SelectionActionBar({
  editor,
  overlayContainerRef,
  keptOutputs,
  onCreateVariations,
  onBuildThis,
  onSend,
  onFullScreen,
  onPreview,
  onEdit,
  onMoreMenuAction,
}: {
  editor: Editor | null;
  /** Same element that wraps Tldraw + overlays; converts pageToScreen (viewport) → local absolute coords */
  overlayContainerRef: RefObject<HTMLElement | null>;
  keptOutputs: Output[];
  onCreateVariations?: (output: Output) => void;
  onBuildThis?: (output: Output) => void;
  onSend?: (message: string) => void;
  /** Documents / diagrams — focused reading */
  onFullScreen?: (output: Output) => void;
  /** Prototypes / built — sandbox or Preview tab */
  onPreview?: (output: Output) => void;
  /** Open design editor for a single output */
  onEdit?: (output: Output) => void;
  /** Kebab menu: design system, Figma, remix */
  onMoreMenuAction?: (
    action: SelectionMoreMenuAction,
    outputs: Output[]
  ) => void;
}) {
  const [selectedOutputs, setSelectedOutputs] = useState<Output[]>([]);
  const [bottomCenter, setBottomCenter] = useState<{ x: number; y: number } | null>(null);
  const [prompt, setPrompt] = useState("");
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const updatePosition = useCallback(() => {
    if (!editor) return;

    const shapes = editor.getSelectedShapes();
    const outputs = shapes
      .map((s) => {
        const id = s.id.replace("shape:", "");
        return keptOutputs.find((o) => o.id === id);
      })
      .filter((o): o is Output => !!o);

    setSelectedOutputs(outputs);

    if (shapes.length > 0) {
      const bounds = editor.getSelectionPageBounds();
      const shell = overlayContainerRef.current;
      if (bounds && shell) {
        const rect = shell.getBoundingClientRect();
        // pageToScreen is viewport (client) space; overlay uses position:absolute inside shell
        const bottom = editor.pageToScreen({
          x: bounds.x + bounds.w / 2,
          y: bounds.y + bounds.h,
        });

        setBottomCenter({ x: bottom.x - rect.left, y: bottom.y - rect.top });
      }
    } else {
      setBottomCenter(null);
      setSelectedOutputs([]);
    }
  }, [editor, keptOutputs, overlayContainerRef]);

  useEffect(() => {
    if (!editor) return;
    editor.on("change", updatePosition);
    return () => {
      editor.off("change", updatePosition);
    };
  }, [editor, updatePosition]);

  useEffect(() => {
    const shell = overlayContainerRef.current;
    if (!shell) return;
    const ro = new ResizeObserver(() => updatePosition());
    ro.observe(shell);
    window.addEventListener("resize", updatePosition);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updatePosition);
    };
  }, [overlayContainerRef, updatePosition]);

  if (!bottomCenter || selectedOutputs.length === 0) return null;

  const handleSend = () => {
    if (!prompt.trim()) return;
    onSend?.(prompt.trim());
    setPrompt("");
  };

  const singleOutput = selectedOutputs.length === 1 ? selectedOutputs[0] : null;
  const singleBuildable =
    singleOutput && isBuildableScreen(singleOutput) ? singleOutput : null;
  const singleAppLike = singleOutput && isAppLikeOutput(singleOutput) ? singleOutput : null;
  const singleDocumentLike =
    singleOutput && !isAppLikeOutput(singleOutput) ? singleOutput : null;

  return (
    <>
      {/* Multi-select — combine + copy */}
      {selectedOutputs.length > 1 && (
        <div className={SELECTION_BAR_OUTER}>
          <div className={SELECTION_BAR_SCROLL}>
            <button
              type="button"
              onClick={() => {
                promptRef.current?.focus();
              }}
              className={SELECTION_ACTION_BTN}
            >
              <Merge size={12} className="shrink-0 opacity-80" />
              <span>Combine</span>
            </button>
          </div>
          <SelectionMoreMenu
            outputs={selectedOutputs}
            onAction={onMoreMenuAction}
          />
        </div>
      )}

      {/* Single-select action bar */}
      {selectedOutputs.length === 1 && (
        <div className={SELECTION_BAR_OUTER}>
          <div className={SELECTION_BAR_SCROLL}>
            {singleBuildable && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit?.(singleBuildable)}
                  className={SELECTION_ACTION_BTN}
                >
                  <Pencil size={12} className="shrink-0 opacity-80" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onCreateVariations?.(singleBuildable)}
                  className={SELECTION_ACTION_BTN}
                >
                  <Layers size={12} className="shrink-0 opacity-80" />
                  <span>Create variations</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBuildThis?.(singleBuildable)}
                  className={SELECTION_ACTION_BTN}
                >
                  <Hammer size={12} className="shrink-0 opacity-80" />
                  <span>Build this</span>
                </button>
              </>
            )}
            {singleBuildable && (singleAppLike || singleDocumentLike) && (
              <span
                className="mx-0.5 h-4 w-px shrink-0 bg-white/[0.1]"
                aria-hidden
              />
            )}
            {singleAppLike && (
              <button
                type="button"
                onClick={() => onPreview?.(singleAppLike)}
                className={SELECTION_ACTION_BTN}
              >
                <MonitorPlay size={12} className="shrink-0 opacity-80" />
                <span>Preview</span>
              </button>
            )}
            {singleDocumentLike && (
              <button
                type="button"
                onClick={() => onFullScreen?.(singleDocumentLike)}
                className={SELECTION_ACTION_BTN}
              >
                <Maximize2 size={12} className="shrink-0 opacity-80" />
                <span>Full screen</span>
              </button>
            )}
          </div>
          <SelectionMoreMenu
            outputs={selectedOutputs}
            onAction={onMoreMenuAction}
          />
        </div>
      )}

      {/* Floating prompt — BELOW the selection */}
      <div
        className="absolute z-20 flex h-[46px] w-[337px] items-center gap-2.5 overflow-visible rounded-xl border border-white/[0.08] bg-[#0f0f0f] pl-[10px] pr-[6px] shadow-xl"
        style={{
          left: bottomCenter.x,
          top: bottomCenter.y + 8,
          transform: "translateX(-50%)",
        }}
      >
        <textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="What would you like to change or create?"
          rows={1}
          className="min-h-0 min-w-0 flex-1 resize-none self-stretch overflow-hidden border-0 bg-transparent py-0 text-sm leading-[46px] text-foreground/70 placeholder:text-foreground/25 focus:outline-none focus:ring-0"
        />
        <button
          onClick={handleSend}
          disabled={!prompt.trim()}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
            prompt.trim()
              ? "bg-primary text-primary-foreground"
              : "bg-white/[0.06] text-foreground/20"
          )}
        >
          <ArrowUp size={14} />
        </button>
      </div>
    </>
  );
}
