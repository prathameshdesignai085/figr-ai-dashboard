import { create } from "zustand";
import type { Extraction, ExtractedComponent } from "@/types";

interface ExtractState {
  /** Extractions keyed by id. */
  extractions: Record<string, Extraction>;
  addExtraction: (extraction: Extraction) => void;
  toggleSelect: (extractionId: string, componentId: string) => void;
  setSelected: (
    extractionId: string,
    componentId: string,
    next: boolean
  ) => void;
  renameComponent: (
    extractionId: string,
    componentId: string,
    name: string
  ) => void;
  setRaisedPr: (extractionId: string, slug: string) => void;
  getExtraction: (id: string) => Extraction | undefined;
  getSelectedComponents: (extractionId: string) => ExtractedComponent[];
}

export const useExtractStore = create<ExtractState>((set, get) => ({
  extractions: {},

  addExtraction: (extraction) => {
    set((s) => ({
      extractions: { ...s.extractions, [extraction.id]: extraction },
    }));
  },

  toggleSelect: (extractionId, componentId) => {
    set((s) => {
      const ex = s.extractions[extractionId];
      if (!ex) return s;
      const next: Record<string, boolean> = { ...ex.selected };
      next[componentId] = !next[componentId];
      return {
        extractions: {
          ...s.extractions,
          [extractionId]: { ...ex, selected: next },
        },
      };
    });
  },

  setSelected: (extractionId, componentId, next) => {
    set((s) => {
      const ex = s.extractions[extractionId];
      if (!ex) return s;
      return {
        extractions: {
          ...s.extractions,
          [extractionId]: {
            ...ex,
            selected: { ...ex.selected, [componentId]: next },
          },
        },
      };
    });
  },

  renameComponent: (extractionId, componentId, name) => {
    set((s) => {
      const ex = s.extractions[extractionId];
      if (!ex) return s;
      return {
        extractions: {
          ...s.extractions,
          [extractionId]: {
            ...ex,
            components: ex.components.map((c) =>
              c.id === componentId ? { ...c, name } : c
            ),
          },
        },
      };
    });
  },

  setRaisedPr: (extractionId, slug) => {
    set((s) => {
      const ex = s.extractions[extractionId];
      if (!ex) return s;
      return {
        extractions: {
          ...s.extractions,
          [extractionId]: { ...ex, raisedPrSlug: slug },
        },
      };
    });
  },

  getExtraction: (id) => get().extractions[id],

  getSelectedComponents: (extractionId) => {
    const ex = get().extractions[extractionId];
    if (!ex) return [];
    return ex.components.filter((c) => ex.selected[c.id]);
  },
}));
