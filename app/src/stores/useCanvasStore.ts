import { create } from "zustand";

export type CanvasTool = "select" | "draw" | "pan" | "inspect" | "marquee";

interface CanvasState {
  activeTool: CanvasTool;
  setActiveTool: (tool: CanvasTool) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
