import { create } from "zustand";
import type { Output } from "@/types";

interface ShelfState {
  selectedOutputIds: Set<string>;
  toggleOutputSelection: (outputId: string) => void;
  clearSelection: () => void;
  getSelectedOutputIds: () => string[];
}

export const useShelfStore = create<ShelfState>((set, get) => ({
  selectedOutputIds: new Set<string>(),

  toggleOutputSelection: (outputId) => {
    set((state) => {
      const next = new Set(state.selectedOutputIds);
      if (next.has(outputId)) next.delete(outputId);
      else next.add(outputId);
      return { selectedOutputIds: next };
    });
  },

  clearSelection: () => set({ selectedOutputIds: new Set() }),

  getSelectedOutputIds: () => [...get().selectedOutputIds],
}));
