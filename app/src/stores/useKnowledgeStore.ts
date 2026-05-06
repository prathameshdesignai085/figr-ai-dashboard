import { create } from "zustand";
import { nanoid } from "nanoid";
import type { KnowledgeItem, KnowledgeCategory } from "@/types";

export type PromoteToKnowledgeInput = {
  category: KnowledgeCategory;
  name: string;
  type: KnowledgeItem["type"];
  source: string;
  content?: string;
  metadata?: KnowledgeItem["metadata"];
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
      content:
        "# About Acme\n\nDirect-to-consumer commerce for premium home goods. Founded 2021, ~140 employees, profitable since Q3 2024.\n\n**Core product surfaces**\n- Web storefront (Next.js) — primary revenue channel\n- iOS + Android app (React Native) — ~22% of GMV\n- Merchant dashboard (internal)\n\n**Tech stack**\n- Web: Next.js 16, TypeScript, Tailwind 4, shadcn/ui\n- Mobile: Expo SDK 52, React Native\n- Backend: Node + Postgres + Redis; Stripe for payments\n- Analytics: Mixpanel + Amplitude session replay",
    },
    {
      id: "k-2",
      category: "about-company",
      name: "Brand Guidelines",
      type: "document",
      source: "google-docs",
      addedAt: "2026-03-01T10:00:00Z",
      content:
        "# Brand quick reference\n\n- **Tone:** confident, never showy. Direct, never blunt.\n- **Primary color:** indigo-600 (#4f46e5)\n- **Type:** Inter (UI), Söhne (marketing)\n- **Don't:** exclamation points, ALL CAPS shouting, emoji in product copy.\n- **Do:** sentence case, plain English, generous whitespace.",
    },
    {
      id: "k-3",
      category: "about-company",
      name: "Tone of Voice",
      type: "document",
      source: "upload",
      addedAt: "2026-03-05T10:00:00Z",
      content:
        "# Voice cheat sheet\n\nWrite like you'd talk to a smart friend. Specific over vague. Verbs over nouns.\n\n**Examples**\n- ❌ 'Your order has been successfully placed.'\n- ✅ 'Order placed. Tracking will email shortly.'\n- ❌ 'Please review the information below.'\n- ✅ 'Take a look — confirm or edit anything.'\n- ❌ 'An error occurred during checkout.'\n- ✅ 'Card was declined. Try another or call your bank.'",
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
      content:
        "# Persona — Pro Builder\n\n**Who:** independent contractor / small studio. 30–50.\n**Buys:** in bulk, repeatedly. Average order $850.\n**Needs:** speed, saved addresses (job sites + warehouse), invoice for tax.\n**Doesn't need:** marketing emails, gift wrap.\n**Critical for checkout:** tax ID field, multiple shipping addresses on one order.",
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
      metadata: {
        dsSnapshotId: "ds-snap-001",
        dsRunId: "ds-run-001",
      },
    },
    {
      id: "k-15",
      category: "design-system",
      name: "Color Tokens",
      type: "figma",
      source: "figma",
      addedAt: "2026-03-01T10:00:00Z",
      metadata: {
        dsSnapshotId: "ds-snap-002",
        dsRunId: "ds-run-002",
      },
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
      metadata: e.metadata,
    }));
    set((state) => ({ items: [...state.items, ...created] }));
    return created;
  },
}));
