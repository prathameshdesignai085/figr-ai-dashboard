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
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title="More options"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-[30] min-w-[min(280px,calc(100vw-24px))] rounded-lg border border-white/[0.08] bg-[#252525] py-1 shadow-xl"
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
  /** Kebab menu: design system, Figma, remix */
  onMoreMenuAction?: (
    action: SelectionMoreMenuAction,
    outputs: Output[]
  ) => void;
}) {
  const [selectedOutputs, setSelectedOutputs] = useState<Output[]>([]);
  const [topCenter, setTopCenter] = useState<{ x: number; y: number } | null>(null);
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
        const top = editor.pageToScreen({
          x: bounds.x + bounds.w / 2,
          y: bounds.y,
        });
        const bottom = editor.pageToScreen({
          x: bounds.x + bounds.w / 2,
          y: bounds.y + bounds.h,
        });

        setTopCenter({ x: top.x - rect.left, y: top.y - rect.top });
        setBottomCenter({ x: bottom.x - rect.left, y: bottom.y - rect.top });
      }
    } else {
      setTopCenter(null);
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

  if (!topCenter || !bottomCenter || selectedOutputs.length === 0) return null;

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
        <div
          className="absolute z-20 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-1.5 py-1 shadow-xl"
          style={{
            left: topCenter.x,
            top: topCenter.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              promptRef.current?.focus();
            }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
          >
            <Merge size={13} />
            <span>Combine</span>
          </button>
          <SelectionMoreMenu
            outputs={selectedOutputs}
            onAction={onMoreMenuAction}
          />
        </div>
      )}

      {/* Single-select action bar */}
      {selectedOutputs.length === 1 && (
        <div
          className="absolute z-20 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-1.5 py-1 shadow-xl"
          style={{
            left: topCenter.x,
            top: topCenter.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          {singleBuildable && (
            <>
              <button
                type="button"
                onClick={() => onCreateVariations?.(singleBuildable)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
              >
                <Layers size={13} />
                <span>Create variations</span>
              </button>
              <button
                type="button"
                onClick={() => onBuildThis?.(singleBuildable)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
              >
                <Hammer size={13} />
                <span>Build this</span>
              </button>
            </>
          )}
          {singleAppLike && (
            <button
              type="button"
              onClick={() => onPreview?.(singleAppLike)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
            >
              <MonitorPlay size={13} />
              <span>Preview</span>
            </button>
          )}
          {singleDocumentLike && (
            <button
              type="button"
              onClick={() => onFullScreen?.(singleDocumentLike)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
            >
              <Maximize2 size={13} />
              <span>Full screen</span>
            </button>
          )}
          <SelectionMoreMenu
            outputs={selectedOutputs}
            onAction={onMoreMenuAction}
          />
        </div>
      )}

      {/* Floating prompt — BELOW the selection */}
      <div
        className="absolute z-20 flex items-end gap-2 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-3 py-2 shadow-xl"
        style={{
          left: bottomCenter.x,
          top: bottomCenter.y + 8,
          transform: "translateX(-50%)",
          minWidth: 300,
          maxWidth: 420,
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
          className="min-h-[28px] flex-1 resize-none bg-transparent text-sm text-foreground/70 placeholder:text-foreground/20 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!prompt.trim()}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
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
