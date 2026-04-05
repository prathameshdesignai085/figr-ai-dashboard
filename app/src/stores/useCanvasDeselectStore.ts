import { create } from "zustand";

/**
 * Queue TL shape ids to deselect on the canvas (e.g. when user removes a context chip in chat).
 * FigredCanvas drains this when the editor is mounted.
 */
interface CanvasDeselectState {
  queue: string[];
  enqueueDeselect: (shapeIds: string[]) => void;
}

export const useCanvasDeselectStore = create<CanvasDeselectState>((set) => ({
  queue: [],
  enqueueDeselect: (shapeIds) =>
    set((s) => ({ queue: [...s.queue, ...shapeIds] })),
}));
