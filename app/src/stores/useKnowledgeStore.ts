import { create } from "zustand";
import { nanoid } from "nanoid";
import type { KnowledgeItem, KnowledgeCategory } from "@/types";

export type PromoteToKnowledgeInput = {
  category: KnowledgeCategory;
  name: string;
  type: KnowledgeItem["type"];
  source: string;
  content?: string;
};

interface KnowledgeState {
  items: KnowledgeItem[];
  getItemsByCategory: (category: KnowledgeCategory) => KnowledgeItem[];
  getCategoryCount: (category: KnowledgeCategory) => number;
  /** Append items promoted from a space (source of truth update). */
  promoteFromSpace: (entries: PromoteToKnowledgeInput[]) => KnowledgeItem[];
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  items: [
    {
      id: "k-1",
      category: "about-company",
      name: "Company Overview",
      type: "document",
      source: "upload",
      addedAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "k-2",
      category: "about-company",
      name: "Brand Guidelines",
      type: "document",
      source: "google-docs",
      addedAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "k-3",
      category: "about-company",
      name: "Tone of Voice",
      type: "document",
      source: "upload",
      addedAt: "2026-03-05T10:00:00Z",
    },
    {
      id: "k-4",
      category: "feature-specs",
      name: "Authentication Flow",
      type: "document",
      source: "google-docs",
      addedAt: "2026-02-15T10:00:00Z",
    },
    {
      id: "k-5",
      category: "feature-specs",
      name: "Dashboard Spec",
      type: "document",
      source: "google-docs",
      addedAt: "2026-02-20T10:00:00Z",
    },
    {
      id: "k-6",
      category: "business-logic",
      name: "Pricing Rules",
      type: "spreadsheet",
      source: "google-sheets",
      addedAt: "2026-03-10T10:00:00Z",
    },
    {
      id: "k-7",
      category: "business-logic",
      name: "Validation Rules",
      type: "document",
      source: "upload",
      addedAt: "2026-03-12T10:00:00Z",
    },
    {
      id: "k-8",
      category: "customers-personas",
      name: "User Research Q1",
      type: "document",
      source: "google-docs",
      addedAt: "2026-01-20T10:00:00Z",
    },
    {
      id: "k-9",
      category: "customers-personas",
      name: "Persona: Pro Builder",
      type: "document",
      source: "upload",
      addedAt: "2026-02-01T10:00:00Z",
    },
    {
      id: "k-10",
      category: "customers-personas",
      name: "Persona: PM Lead",
      type: "document",
      source: "upload",
      addedAt: "2026-02-01T10:00:00Z",
    },
    {
      id: "k-11",
      category: "customers-personas",
      name: "Customer Interviews",
      type: "document",
      source: "upload",
      addedAt: "2026-03-15T10:00:00Z",
    },
    {
      id: "k-12",
      category: "product-decisions",
      name: "Why we chose Next.js",
      type: "document",
      source: "upload",
      addedAt: "2026-01-10T10:00:00Z",
    },
    {
      id: "k-13",
      category: "product-decisions",
      name: "Auth approach decision",
      type: "document",
      source: "upload",
      addedAt: "2026-02-05T10:00:00Z",
    },
    {
      id: "k-14",
      category: "design-system",
      name: "Component Library",
      type: "figma",
      source: "figma",
      addedAt: "2026-03-01T10:00:00Z",
    },
    {
      id: "k-15",
      category: "design-system",
      name: "Color Tokens",
      type: "figma",
      source: "figma",
      addedAt: "2026-03-01T10:00:00Z",
    },
  ],

  getItemsByCategory: (category) => {
    return get().items.filter((i) => i.category === category);
  },

  getCategoryCount: (category) => {
    return get().items.filter((i) => i.category === category).length;
  },

  promoteFromSpace: (entries) => {
    const now = new Date().toISOString();
    const created: KnowledgeItem[] = entries.map((e) => ({
      id: `k-${nanoid(8)}`,
      category: e.category,
      name: e.name,
      type: e.type,
      source: e.source,
      addedAt: now,
      content: e.content,
    }));
    set((state) => ({ items: [...state.items, ...created] }));
    return created;
  },
}));
