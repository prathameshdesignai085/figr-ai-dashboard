import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Space, TargetPlatform } from "@/types";

interface SpaceState {
  spaces: Space[];
  activeSpaceId: string | null;
  getActiveSpace: () => Space | undefined;
  setActiveSpace: (id: string | null) => void;
  addSpace: (space: Space) => void;
  createSpace: (
    name: string,
    description: string,
    targetPlatform?: TargetPlatform
  ) => Space;
  toggleFavorite: (id: string) => void;
  updateSpace: (id: string, updates: Partial<Space>) => void;
  setTargetPlatform: (id: string, platform: TargetPlatform) => void;
}

export const useSpaceStore = create<SpaceState>((set, get) => ({
  spaces: [
    {
      id: "space-1",
      name: "Checkout Redesign",
      description: "Redesigning the checkout flow for better conversion",
      stage: "wireframe",
      targetPlatform: "web",
      isFavorite: true,
      createdAt: "2026-03-28T10:00:00Z",
      updatedAt: "2026-04-02T14:30:00Z",
      chatIds: ["chat-1", "chat-2"],
      contextItems: [
        {
          id: "ctx-1",
          name: "Checkout PRD",
          type: "document",
          source: "google-docs",
          addedAt: "2026-03-28T10:00:00Z",
          fromProductKnowledge: true,
        },
        {
          id: "ctx-ds-draft",
          name: "Checkout design system (exploration)",
          type: "figma",
          source: "paste",
          addedAt: "2026-03-30T14:00:00Z",
          content:
            "# Checkout design system (draft)\n\nTokens, components, and layout rules being explored for this space only.",
        },
        {
          id: "ctx-2",
          name: "Cart analytics.csv",
          type: "spreadsheet",
          source: "upload",
          addedAt: "2026-03-29T09:00:00Z",
        },
        {
          id: "ctx-brainstorm",
          name: "Payment options brainstorm",
          type: "document",
          source: "paste",
          addedAt: "2026-03-31T11:20:00Z",
          content:
            "## Options\n- Card\n- Wallet\n- BNPL\n\nOpen questions: liability, regions…",
        },
        {
          id: "ctx-audit",
          name: "Competitor checkout audit",
          type: "document",
          source: "upload",
          addedAt: "2026-04-01T09:00:00Z",
          pushedToProductKnowledgeAt: "2026-04-01T16:00:00Z",
          content: "# Competitor audit\n\nSummary of 4 flows and takeaways.",
        },
      ],
      connectedKnowledge: [
        "about-company",
        "design-system",
        "customers-personas",
      ],
      instructions: "Focus on reducing cart abandonment. Target: 15% improvement in checkout completion rate.",
    },
    {
      id: "space-2",
      name: "Onboarding V2",
      description: "New user onboarding experience",
      stage: "brainstorm",
      targetPlatform: "web",
      isFavorite: true,
      createdAt: "2026-04-01T08:00:00Z",
      updatedAt: "2026-04-03T11:00:00Z",
      chatIds: ["chat-3"],
      contextItems: [],
      connectedKnowledge: ["about-company", "customers-personas"],
      instructions: "",
    },
    {
      id: "space-3",
      name: "Mobile App MVP",
      description: "First version of the mobile application",
      // Stage advanced to "build" because this space already has a working
      // RN prototype on the canvas (out-mvp-built → build-mobile-mvp-demo).
      stage: "build",
      targetPlatform: "mobile",
      isFavorite: false,
      createdAt: "2026-04-02T10:00:00Z",
      updatedAt: "2026-04-18T10:20:00Z",
      chatIds: ["chat-mvp-1"],
      contextItems: [],
      connectedKnowledge: [],
      instructions:
        "Mobile-first activity tracker. Optimize for one-handed use; prioritize today's progress over historical depth.",
    },
  ],
  activeSpaceId: null,

  getActiveSpace: () => {
    const state = get();
    return state.spaces.find((s) => s.id === state.activeSpaceId);
  },

  setActiveSpace: (id) => set({ activeSpaceId: id }),

  addSpace: (space) =>
    set((state) => ({ spaces: [...state.spaces, space] })),

  createSpace: (name, description, targetPlatform = "web") => {
    const now = new Date().toISOString();
    const space: Space = {
      id: `space-${nanoid(6)}`,
      name,
      description,
      stage: "brainstorm",
      targetPlatform,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      chatIds: [],
      contextItems: [],
      connectedKnowledge: [],
      instructions: "",
    };
    set((state) => ({ spaces: [...state.spaces, space] }));
    return space;
  },

  toggleFavorite: (id) =>
    set((state) => ({
      spaces: state.spaces.map((s) =>
        s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
      ),
    })),

  updateSpace: (id, updates) =>
    set((state) => ({
      spaces: state.spaces.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    })),

  setTargetPlatform: (id, platform) =>
    set((state) => ({
      spaces: state.spaces.map((s) =>
        s.id === id
          ? { ...s, targetPlatform: platform, updatedAt: new Date().toISOString() }
          : s
      ),
    })),
}));
