"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import type { Editor } from "tldraw";
import type { Output } from "@/types";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { cn } from "@/lib/utils";

/** Find the output-card or html-preview shape nearest to a drawn annotation */
function findNearestOutputShape(editor: Editor, drawShapeId: string, keptOutputs: Output[]): Output | null {
  const drawBounds = editor.getShapePageBounds(editor.getShape(drawShapeId as any)!);
  if (!drawBounds) return null;

  const drawCenter = { x: drawBounds.x + drawBounds.w / 2, y: drawBounds.y + drawBounds.h / 2 };
  let closest: Output | null = null;
  let closestDist = Infinity;

  for (const output of keptOutputs) {
    const shapeId = `shape:${output.id}`;
    const shape = editor.getShape(shapeId as any);
    if (!shape) continue;
    const bounds = editor.getShapePageBounds(shape);
    if (!bounds) continue;

    const cx = bounds.x + bounds.w / 2;
    const cy = bounds.y + bounds.h / 2;
    const dist = Math.hypot(drawCenter.x - cx, drawCenter.y - cy);
    if (dist < closestDist) {
      closestDist = dist;
      closest = output;
    }
  }
  return closest;
}

export function AnnotationPrompt({
  editor,
  keptOutputs,
  onSend,
}: {
  editor: Editor | null;
  keptOutputs: Output[];
  onSend?: (message: string, annotatedOutputId?: string) => void;
}) {
  const [value, setValue] = useState("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(false);
  const [nearestOutput, setNearestOutput] = useState<Output | null>(null);
  const { activeTool } = useCanvasStore();
  const lastDrawShapeCountRef = useRef(0);

  useEffect(() => {
    if (!editor || activeTool !== "draw") {
      setVisible(false);
      lastDrawShapeCountRef.current = 0;
      return;
    }

    const handleChange = () => {
      const shapes = editor.getCurrentPageShapes();
      const drawShapes = shapes.filter(
        (s) => s.type === "draw" || s.type === "highlight"
      );

      // Only show prompt when a new draw shape appears
      if (drawShapes.length > lastDrawShapeCountRef.current && drawShapes.length > 0) {
        lastDrawShapeCountRef.current = drawShapes.length;
        const lastShape = drawShapes[drawShapes.length - 1];
        const bounds = editor.getShapePageBounds(lastShape);
        if (bounds) {
          const screenPoint = editor.pageToScreen({
            x: bounds.x + bounds.w / 2,
            y: bounds.y + bounds.h + 8,
          });
          setPosition({ x: screenPoint.x, y: screenPoint.y });
          setVisible(true);

          // Find nearest output shape
          const nearest = findNearestOutputShape(editor, lastShape.id, keptOutputs);
          setNearestOutput(nearest);
        }
      }
    };

    editor.on("change", handleChange);
    return () => {
      editor.off("change", handleChange);
    };
  }, [editor, activeTool, keptOutputs]);

  if (!visible || !position || activeTool !== "draw") return null;

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSend?.(value.trim(), nearestOutput?.id);
    setValue("");
    setVisible(false);
  };

  return (
    <div
      className="absolute z-30 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-2.5 py-1.5 shadow-xl"
      style={{
        left: position.x,
        top: position.y,
        transform: "translateX(-50%)",
        minWidth: 220,
        maxWidth: 320,
      }}
    >
      {nearestOutput && (
        <div className="mb-1 text-[9px] text-foreground/25 truncate">
          on: {nearestOutput.title}
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
            if (e.key === "Escape") {
              setVisible(false);
            }
          }}
          placeholder="Describe your change..."
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground/70 placeholder:text-foreground/25 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
            value.trim()
              ? "bg-primary text-primary-foreground"
              : "bg-white/[0.06] text-foreground/20"
          )}
        >
          <ArrowUp size={12} />
        </button>
      </div>
    </div>
  );
}
