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
          content:
            "# Checkout Redesign — PRD\n\n**Owner:** Alex Park (PM)  \n**Status:** Approved for build  \n**Target ship:** Q2 2026\n\n## Problem\nCart abandonment is at 38% on web (industry median ~28%). Top drop-off points from session replay:\n1. **Address step** — 19% leave without completing address fields\n2. **Payment selection** — 11% leave when redirected to processor\n3. **Order review** — 8% leave at the final confirm\n\n## Goals\n- **Primary:** lift checkout completion rate by **15%** (38% → 33% abandonment)\n- **Secondary:** reduce time-to-purchase from 124s median to <90s\n- **Guardrail:** no regression in fraud catch-rate\n\n## Out of scope\n- Native mobile checkout (separate Space)\n- Subscription plans (handled in Onboarding V2)\n- Merchant-facing dashboard\n\n## Solution direction\nThree changes, in priority order:\n1. **Single-page checkout** — collapse three steps into one with progressive disclosure\n2. **Smart address autofill** — Google Places API + saved addresses for returning users\n3. **Wallet-first payment** — Apple Pay / Google Pay / PayPal above card form\n\n## Success metrics\n- Completion rate (primary)\n- Time on each step\n- Wallet vs card mix (target: >40% wallet by week 4)\n- Field-level error rate on address inputs\n\n## Risks\n- Wallet APIs have flaky uptime — need card fallback always visible\n- Single-page form may overwhelm mobile users — A/B test before rollout\n- Compliance: BNPL options need legal review (deferred — see decision log)",
        },
        {
          id: "ctx-ds-draft",
          name: "Checkout design system (exploration)",
          type: "figma",
          source: "paste",
          addedAt: "2026-03-30T14:00:00Z",
          content:
            "# Checkout design system (exploration)\n\nLocal-only design tokens for this Space. Promote to product knowledge once stable.\n\n## Tokens\n- **Container width:** 480px desktop, full-bleed mobile\n- **Form field height:** 48px (was 40px) — easier mobile tap\n- **Primary CTA:** filled, 56px, full-width on mobile\n- **Error state:** red-500 border + helper text below field, no toasts\n\n## Components used\n- `<FormField>` — with built-in error/success states\n- `<WalletButtonRow>` — Apple/Google/PayPal in a horizontal row, 56px tall\n- `<OrderSummary>` — sticky on desktop right rail, collapsed at top on mobile\n- `<PromoCodeInput>` — collapsed by default; expand on click\n\n## Spacing rhythm\n12 / 16 / 24 / 32 — multiples of 4. No 14, no 18, no 20.",
        },
        {
          id: "ctx-2",
          name: "Cart analytics.csv",
          type: "spreadsheet",
          source: "upload",
          addedAt: "2026-03-29T09:00:00Z",
          content:
            "# Cart abandonment analytics — Q1 2026\n\nFunnel breakdown across 312k checkout sessions.\n\n| Step | Sessions | Drop-off | Rate |\n|---|---|---|---|\n| Cart → Checkout | 312,400 | 18,720 | 6.0% |\n| Checkout → Address | 293,680 | 55,799 | 19.0% |\n| Address → Payment | 237,881 | 26,167 | 11.0% |\n| Payment → Review | 211,714 | 16,937 | 8.0% |\n| Review → Complete | 194,777 | 0 | — |\n\n**Final completion rate: 62.3%** (target: 71.7%)\n\n## Notable\n- Mobile abandonment 11pp higher than desktop\n- Logged-in users 2.3x more likely to complete (autofill effect)\n- Promo code expand/collapse: only 4% engage but they convert at 91%",
        },
        {
          id: "ctx-brainstorm",
          name: "Payment options decisions",
          type: "document",
          source: "paste",
          addedAt: "2026-03-31T11:20:00Z",
          content:
            "# Payment options — decisions log\n\n## Decided\n- **Apple Pay, Google Pay, PayPal** as wallet row (top of payment section)\n- **Card form** always visible below wallet row — never collapsed\n- **Save card** opt-in checkbox, default unchecked\n\n## Deferred to v2\n- **BNPL (Klarna / Afterpay)** — legal review pending on EU/UK liability split\n- **Crypto** — under 0.1% of demand; not worth integration cost\n- **Bank transfer** — high abandonment, low completion rate; revisit if needed\n\n## Rejected\n- Hiding card behind 'show more' link — fails accessibility audit and surfaces user complaints\n- Auto-selecting last-used method — privacy concern on shared devices\n\n## Open questions\n- Wallet display order on mobile vs desktop — user research suggests platform parity wins\n- Error UX when wallet auth fails mid-flow — fall back to card or retry?",
        },
        {
          id: "ctx-audit",
          name: "Competitor checkout audit",
          type: "document",
          source: "upload",
          addedAt: "2026-04-01T09:00:00Z",
          pushedToProductKnowledgeAt: "2026-04-01T16:00:00Z",
          content:
            "# Competitor checkout audit — April 2026\n\n4 flows reviewed: Stripe Checkout, Shopify Pay, Apple.com, Notion's billing.\n\n## Key takeaways\n\n### Stripe Checkout\n- Hosted, single-page; wallet row dominant\n- Accordion sections expand on focus\n- Aggressive autofill via Link\n- **Adopt:** focus-driven section reveal\n\n### Shopify Pay\n- Pre-fills everything for logged-in shoppers (cross-merchant)\n- Mobile-optimized — full-bleed buttons, no card chrome\n- **Adopt:** treat returning users as a separate flow\n\n### Apple.com\n- Sticky order summary on desktop right rail\n- Quiet, high-contrast typography\n- **Adopt:** sticky right-rail summary\n\n### Notion billing\n- Inline error messaging without toasts\n- Address validation as user types (Google Places)\n- **Adopt:** typed address autocomplete + inline errors\n\n## What we won't copy\n- Stripe's 'pay with link' branding (we're not building cross-merchant identity)\n- Shopify's heavy 'remember me' nag — privacy concern",
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
