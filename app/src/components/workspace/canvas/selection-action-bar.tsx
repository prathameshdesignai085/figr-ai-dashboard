"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Hammer,
  Layers,
  Maximize2,
  Copy,
  ArrowUp,
} from "lucide-react";
import type { Editor } from "tldraw";
import type { Output } from "@/types";
import { cn } from "@/lib/utils";

/** Check if an output is a screen/HTML type (shows Build/Variations) */
function isScreenType(output: Output): boolean {
  return (
    output.type === "screen" ||
    output.type === "wireframe" ||
    output.type === "component" ||
    output.content.trim().startsWith("<")
  );
}

export function SelectionActionBar({
  editor,
  keptOutputs,
  onCreateVariations,
  onBuildThis,
  onSend,
  onFullScreen,
}: {
  editor: Editor | null;
  keptOutputs: Output[];
  onCreateVariations?: (output: Output) => void;
  onBuildThis?: (output: Output) => void;
  onSend?: (message: string) => void;
  onFullScreen?: (output: Output) => void;
}) {
  const [selectedOutputs, setSelectedOutputs] = useState<Output[]>([]);
  const [topCenter, setTopCenter] = useState<{ x: number; y: number } | null>(null);
  const [bottomCenter, setBottomCenter] = useState<{ x: number; y: number } | null>(null);
  const [prompt, setPrompt] = useState("");

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
      if (bounds) {
        // Top center of selection (for action bar)
        const top = editor.pageToScreen({
          x: bounds.x + bounds.w / 2,
          y: bounds.y,
        });
        // Bottom center of selection (for prompt)
        const bottom = editor.pageToScreen({
          x: bounds.x + bounds.w / 2,
          y: bounds.y + bounds.h,
        });

        setTopCenter({ x: top.x, y: top.y });
        setBottomCenter({ x: bottom.x, y: bottom.y });
      }
    } else {
      setTopCenter(null);
      setBottomCenter(null);
      setSelectedOutputs([]);
    }
  }, [editor, keptOutputs]);

  useEffect(() => {
    if (!editor) return;
    // Update on any change (selection, pan, zoom)
    editor.on("change", updatePosition);
    return () => {
      editor.off("change", updatePosition);
    };
  }, [editor, updatePosition]);

  if (!topCenter || !bottomCenter || selectedOutputs.length === 0) return null;

  const handleSend = () => {
    if (!prompt.trim()) return;
    onSend?.(prompt.trim());
    setPrompt("");
  };

  const isSingleScreen =
    selectedOutputs.length === 1 && isScreenType(selectedOutputs[0]);
  const singleOutput = selectedOutputs.length === 1 ? selectedOutputs[0] : null;

  return (
    <>
      {/* Action buttons — ABOVE the selection */}
      {selectedOutputs.length === 1 && (
        <div
          className="absolute z-20 flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-1.5 py-1 shadow-xl"
          style={{
            left: topCenter.x,
            top: topCenter.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          {isSingleScreen && singleOutput && (
            <>
              <button
                onClick={() => onCreateVariations?.(singleOutput)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
              >
                <Layers size={13} />
                <span>Create variations</span>
              </button>
              <button
                onClick={() => onBuildThis?.(singleOutput)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
              >
                <Hammer size={13} />
                <span>Build this</span>
              </button>
            </>
          )}
          <button
            onClick={() => singleOutput && onFullScreen?.(singleOutput)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
          >
            <Maximize2 size={13} />
            <span>Full screen</span>
          </button>
          <button
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-foreground/60 hover:bg-white/[0.06] hover:text-foreground/90 transition-colors whitespace-nowrap"
          >
            <Copy size={13} />
            <span>Copy</span>
          </button>
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
