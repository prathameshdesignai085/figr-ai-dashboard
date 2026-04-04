"use client";

import { MousePointer2, Pencil, Hand } from "lucide-react";
import { useCanvasStore, type CanvasTool } from "@/stores/useCanvasStore";
import { cn } from "@/lib/utils";
import type { Editor } from "tldraw";

const tools: {
  id: CanvasTool;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  shortcut: string;
}[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "draw", icon: Pencil, label: "Draw / Annotate", shortcut: "D" },
  { id: "pan", icon: Hand, label: "Pan", shortcut: "H" },
];

export function CanvasToolbar({ editor }: { editor: Editor | null }) {
  const { activeTool, setActiveTool } = useCanvasStore();

  const handleToolChange = (tool: CanvasTool) => {
    setActiveTool(tool);
    if (!editor) return;

    switch (tool) {
      case "select":
        editor.setCurrentTool("select");
        break;
      case "draw":
        editor.setCurrentTool("draw");
        break;
      case "pan":
        editor.setCurrentTool("hand");
        break;
    }
  };

  return (
    <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-0.5 rounded-lg border border-white/[0.08] bg-[#161616] p-1">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => handleToolChange(tool.id)}
            title={`${tool.label} (${tool.shortcut})`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-white/[0.08] text-foreground/90"
                : "text-foreground/40 hover:bg-white/[0.04] hover:text-foreground/60"
            )}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
