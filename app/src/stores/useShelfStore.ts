import { create } from "zustand";

export interface MarqueeCapture {
  id: string;
  dataUrl: string;
  label: string;
}

export interface CanvasInspectPick {
  /** Stable id for chips: `${outputId}::${inspectId}` */
  key: string;
  outputId: string;
  inspectId: string;
  componentName: string;
  tagName: string;
  outputTitle: string;
}

interface ShelfState {
  /** Kept output / screen cards — shape ids use createShapeId(outputId). */
  selectedOutputIds: Set<string>;
  /** Draw + highlight shapes — full TLShapeId strings (e.g. shape:…). */
  selectedAnnotationShapeIds: Set<string>;
  /** DOM elements picked in canvas inspect mode (multiple allowed). */
  canvasInspectPicks: CanvasInspectPick[];
  /** Screenshots captured via the marquee tool. */
  marqueeCaptures: MarqueeCapture[];
  toggleOutputSelection: (outputId: string) => void;
  clearSelection: () => void;
  getSelectedOutputIds: () => string[];
  addCanvasInspectPick: (pick: Omit<CanvasInspectPick, "key">) => void;
  removeCanvasInspectPick: (key: string) => void;
  clearCanvasInspectPicks: () => void;
  addMarqueeCapture: (capture: MarqueeCapture) => void;
  removeMarqueeCapture: (id: string) => void;
  clearMarqueeCaptures: () => void;
}

export const useShelfStore = create<ShelfState>((set, get) => ({
  selectedOutputIds: new Set<string>(),
  selectedAnnotationShapeIds: new Set<string>(),
  canvasInspectPicks: [],
  marqueeCaptures: [],

  addCanvasInspectPick: (pick) => {
    const key = `${pick.outputId}::${pick.inspectId}`;
    set((state) => {
      if (state.canvasInspectPicks.some((p) => p.key === key)) return state;
      return { canvasInspectPicks: [...state.canvasInspectPicks, { ...pick, key }] };
    });
  },

  removeCanvasInspectPick: (key) =>
    set((state) => ({
      canvasInspectPicks: state.canvasInspectPicks.filter((p) => p.key !== key),
    })),

  clearCanvasInspectPicks: () => set({ canvasInspectPicks: [] }),

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

  addMarqueeCapture: (capture) =>
    set((state) => ({
      marqueeCaptures: [...state.marqueeCaptures, capture],
    })),

  removeMarqueeCapture: (id) =>
    set((state) => ({
      marqueeCaptures: state.marqueeCaptures.filter((c) => c.id !== id),
    })),

  clearMarqueeCaptures: () => set({ marqueeCaptures: [] }),
}));
