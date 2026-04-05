import { create } from "zustand";
import type { Output } from "@/types";

interface ShelfState {
  /** Kept output / screen cards — shape ids use createShapeId(outputId). */
  selectedOutputIds: Set<string>;
  /** Draw + highlight shapes — full TLShapeId strings (e.g. shape:…). */
  selectedAnnotationShapeIds: Set<string>;
  toggleOutputSelection: (outputId: string) => void;
  clearSelection: () => void;
  getSelectedOutputIds: () => string[];
}

export const useShelfStore = create<ShelfState>((set, get) => ({
  selectedOutputIds: new Set<string>(),
  selectedAnnotationShapeIds: new Set<string>(),

  toggleOutputSelection: (outputId) => {
    set((state) => {
      const next = new Set(state.selectedOutputIds);
      if (next.has(outputId)) next.delete(outputId);
      else next.add(outputId);
      return { selectedOutputIds: next };
    });
  },

  clearSelection: () =>
    set({
      selectedOutputIds: new Set(),
      selectedAnnotationShapeIds: new Set(),
    }),

  getSelectedOutputIds: () => [...get().selectedOutputIds],
}));
