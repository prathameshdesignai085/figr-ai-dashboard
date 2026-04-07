import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Chat } from "@/types";

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  archivedChatIds: Set<string>;
  getActiveChat: () => Chat | undefined;
  setActiveChat: (id: string | null) => void;
  getChatsForSpace: (spaceId: string) => Chat[];
  getActiveChatsForSpace: (spaceId: string) => Chat[];
  getArchivedChatsForSpace: (spaceId: string) => Chat[];
  getIndependentChats: () => Chat[];
  getRecentChats: () => Chat[];
  createChat: (spaceId: string, name?: string) => Chat;
  createShellChat: (shellId: string, name?: string) => Chat;
  getChatsForShell: (shellId: string) => Chat[];
  getActiveChatsForShell: (shellId: string) => Chat[];
  getArchivedChatsForShell: (shellId: string) => Chat[];
  archiveChat: (chatId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [
    {
      id: "chat-1",
      spaceId: "space-1",
      shellId: null,
      name: "Checkout flow exploration",
      createdAt: "2026-03-28T10:30:00Z",
      updatedAt: "2026-04-02T14:30:00Z",
      messages: [
        {
          id: "msg-1",
          chatId: "chat-1",
          role: "user",
          content: "Help me redesign the checkout flow. Our cart abandonment rate is 68% and we need to bring it down to under 55%.",
          outputs: [],
          contextItemIds: ["ctx-1"],
          timestamp: "2026-03-28T10:30:00Z",
        },
        {
          id: "msg-2",
          chatId: "chat-1",
          role: "assistant",
          content: "I've analyzed the checkout PRD and cart analytics. Here are three approaches to reduce abandonment:",
          outputs: [
            {
              id: "out-1",
              messageId: "msg-2",
              chatId: "chat-1",
              spaceId: "space-1",
              shellId: null,
              type: "approach",
              fidelity: "exploration",
              title: "Single-page checkout",
              summary: "Consolidate all checkout steps into one scrollable page. Reduces perceived complexity and eliminates step-navigation friction.",
              content: "# Single-Page Checkout Approach\n\nConsolidate cart review, shipping, and payment into one scrollable page.\n\n## Key changes\n- Remove step indicator\n- Inline address autocomplete\n- Live order summary sidebar\n- Express payment buttons at top\n\n## Expected impact\n- 20-30% reduction in abandonment\n- Faster completion time",
              kept: true,
              keptAt: "2026-03-28T11:00:00Z",
              canvasPosition: { x: 100, y: 100 },
            },
            {
              id: "out-2",
              messageId: "msg-2",
              chatId: "chat-1",
              spaceId: "space-1",
              shellId: null,
              type: "approach",
              fidelity: "exploration",
              title: "Progressive disclosure wizard",
              summary: "A 3-step wizard with progress bar. Each step validates before proceeding. Reduces cognitive load per step.",
              content: "# Progressive Disclosure Wizard\n\nBreak checkout into 3 clear steps with smart defaults.\n\n## Steps\n1. Shipping (with address autocomplete)\n2. Payment (saved cards first)\n3. Review & confirm\n\n## Key features\n- Progress bar with step labels\n- Smart defaults from past orders\n- Back button preserves state",
              kept: false,
              keptAt: null,
              canvasPosition: null,
            },
            {
              id: "out-3",
              messageId: "msg-2",
              chatId: "chat-1",
              spaceId: "space-1",
              shellId: null,
              type: "approach",
              fidelity: "exploration",
              title: "Guest express checkout",
              summary: "Skip account creation entirely. Email-only checkout with optional account creation post-purchase.",
              content: "# Guest Express Checkout\n\nRemove account creation barrier entirely.\n\n## Flow\n1. Email only (no password)\n2. Shipping + payment in one view\n3. Post-purchase: 'Save for next time?' prompt\n\n## Expected impact\n- 15-25% reduction in abandonment\n- Higher guest conversion rate",
              kept: true,
              keptAt: "2026-03-28T11:05:00Z",
              canvasPosition: { x: 400, y: 100 },
            },
          ],
          contextItemIds: [],
          timestamp: "2026-03-28T10:35:00Z",
        },
        {
          id: "msg-3",
          chatId: "chat-1",
          role: "user",
          content: "I like the single-page approach. Can you create a wireframe for it?",
          outputs: [],
          contextItemIds: [],
          timestamp: "2026-03-28T11:10:00Z",
        },
        {
          id: "msg-4",
          chatId: "chat-1",
          role: "assistant",
          content: "Here's a wireframe for the single-page checkout:",
          outputs: [
            {
              id: "out-4",
              messageId: "msg-4",
              chatId: "chat-1",
              spaceId: "space-1",
              shellId: null,
              type: "wireframe",
              fidelity: "wireframe",
              title: "Single-page checkout wireframe",
              summary: "Full wireframe showing cart summary, shipping form, payment section, and order total in a single scrollable layout.",
              content: "# Single-Page Checkout Wireframe\n\n```\n┌─────────────────────────────────────────┐\n│ Logo            Cart (3)    Account     │\n├─────────────────────┬───────────────────┤\n│                     │ Order Summary     │\n│ Express Checkout    │ ┌───────────────┐ │\n│ [Apple Pay] [GPay]  │ │ Item 1  $29   │ │\n│                     │ │ Item 2  $49   │ │\n│ ─── or ───          │ │ Item 3  $19   │ │\n│                     │ ├───────────────┤ │\n│ Shipping            │ │ Subtotal $97  │ │\n│ ┌─────────────────┐ │ │ Shipping $5   │ │\n│ │ Address...      │ │ │ Tax      $8   │ │\n│ └─────────────────┘ │ │ ────────────  │ │\n│                     │ │ Total   $110  │ │\n│ Payment             │ └───────────────┘ │\n│ ┌─────────────────┐ │                   │\n│ │ Card number     │ │                   │\n│ │ MM/YY    CVC    │ │                   │\n│ └─────────────────┘ │                   │\n│                     │                   │\n│ [    Place Order   ]│                   │\n└─────────────────────┴───────────────────┘\n```",
              kept: true,
              keptAt: "2026-04-02T14:30:00Z",
              canvasPosition: { x: 250, y: 300 },
            },
          ],
          contextItemIds: [],
          timestamp: "2026-04-02T14:30:00Z",
        },
        {
          id: "msg-5a",
          chatId: "chat-1",
          role: "assistant",
          content: "Here's a hi-fi version of the checkout screen:",
          outputs: [
            {
              id: "out-5a",
              messageId: "msg-5a",
              chatId: "chat-1",
              spaceId: "space-1",
              shellId: null,
              type: "screen",
              fidelity: "hi-fi",
              title: "Checkout — Hi-fi",
              summary: "High-fidelity checkout screen with express payments, shipping form, and order summary.",
              content: `<div style="background:#0f0f0f;min-height:100%;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fff">
  <div style="max-width:600px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <span style="font-size:18px;font-weight:700">Checkout</span>
      <span style="font-size:13px;color:#888">Cart (3)</span>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:20px">
      <button style="flex:1;padding:10px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:13px;cursor:pointer">Apple Pay</button>
      <button style="flex:1;padding:10px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#fff;font-size:13px;cursor:pointer">Google Pay</button>
    </div>
    <div style="text-align:center;color:#444;font-size:11px;margin:12px 0">— or pay with card —</div>
    <div style="margin-bottom:16px">
      <label style="font-size:11px;color:#888;display:block;margin-bottom:4px">Email</label>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px 12px;font-size:13px;color:#666">you@email.com</div>
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:11px;color:#888;display:block;margin-bottom:4px">Shipping address</label>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px 12px;font-size:13px;color:#666">123 Main St, San Francisco, CA</div>
    </div>
    <div style="margin-bottom:16px">
      <label style="font-size:11px;color:#888;display:block;margin-bottom:4px">Card number</label>
      <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:10px 12px;font-size:13px;color:#666;display:flex;justify-content:space-between"><span>•••• •••• •••• 4242</span><span>09/28</span></div>
    </div>
    <div style="background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:14px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:6px"><span>Subtotal</span><span>$97.00</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:6px"><span>Shipping</span><span>$5.00</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#888;margin-bottom:8px"><span>Tax</span><span>$8.16</span></div>
      <div style="border-top:1px solid #333;padding-top:8px;display:flex;justify-content:space-between;font-size:14px;font-weight:600"><span>Total</span><span>$110.16</span></div>
    </div>
    <button style="width:100%;padding:14px;border-radius:10px;border:none;background:#7c6ef5;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Place Order — $110.16</button>
  </div>
</div>`,
              kept: true,
              keptAt: "2026-04-03T10:00:00Z",
              canvasPosition: { x: 700, y: 100 },
            },
          ],
          contextItemIds: [],
          timestamp: "2026-04-03T10:00:00Z",
        },
      ],
    },
    {
      id: "chat-2",
      spaceId: "space-1",
      shellId: null,
      name: "Payment UX research",
      createdAt: "2026-03-30T09:00:00Z",
      updatedAt: "2026-04-01T16:00:00Z",
      messages: [
        {
          id: "msg-5",
          chatId: "chat-2",
          role: "user",
          content: "What are the best practices for payment form UX in 2026?",
          outputs: [],
          contextItemIds: [],
          timestamp: "2026-03-30T09:00:00Z",
        },
        {
          id: "msg-6",
          chatId: "chat-2",
          role: "assistant",
          content: "Here's a comprehensive overview of modern payment UX best practices:",
          outputs: [
            {
              id: "out-5",
              messageId: "msg-6",
              chatId: "chat-2",
              spaceId: "space-1",
              shellId: null,
              type: "text_block",
              fidelity: "exploration",
              title: "Payment UX best practices 2026",
              summary: "Research summary covering express payments, card form patterns, error handling, and trust signals.",
              content: "# Payment UX Best Practices 2026\n\n## 1. Express payments first\n- Apple Pay, Google Pay, Shop Pay above the fold\n- 40% of mobile users prefer express checkout\n\n## 2. Smart card forms\n- Auto-detect card type from first digits\n- Inline validation (not on submit)\n- Format card number with spaces automatically\n\n## 3. Trust signals\n- Security badges near payment fields\n- 'Encrypted & secure' microcopy\n- Show accepted card logos\n\n## 4. Error handling\n- Highlight specific field with error\n- Clear, actionable error messages\n- Don't clear valid fields on error",
              kept: false,
              keptAt: null,
              canvasPosition: null,
            },
          ],
          contextItemIds: [],
          timestamp: "2026-03-30T09:05:00Z",
        },
      ],
    },
    {
      id: "chat-3",
      spaceId: "space-2",
      shellId: null,
      name: "Onboarding approaches",
      createdAt: "2026-04-01T08:30:00Z",
      updatedAt: "2026-04-03T11:00:00Z",
      messages: [],
    },
    {
      id: "chat-4",
      spaceId: null,
      shellId: null,
      name: "brainstorm pricing",
      createdAt: "2026-04-03T09:00:00Z",
      updatedAt: "2026-04-03T09:45:00Z",
      messages: [],
    },
    {
      id: "chat-5",
      spaceId: null,
      shellId: null,
      name: "quick wireframe idea",
      createdAt: "2026-04-02T15:00:00Z",
      updatedAt: "2026-04-02T15:30:00Z",
      messages: [],
    },
    {
      id: "chat-6",
      spaceId: "space-1",
      shellId: null,
      name: "Competitor analysis",
      createdAt: "2026-04-01T10:00:00Z",
      updatedAt: "2026-04-01T11:30:00Z",
      messages: [],
    },
    {
      id: "chat-shell-demo-1",
      spaceId: null,
      shellId: "shell-demo-1",
      name: "Shell exploration",
      createdAt: "2026-03-21T10:00:00Z",
      updatedAt: "2026-03-25T09:00:00Z",
      messages: [],
    },
  ],
  activeChatId: null,
  archivedChatIds: new Set<string>(),

  getActiveChat: () => {
    const state = get();
    return state.chats.find((c) => c.id === state.activeChatId);
  },

  setActiveChat: (id) => set({ activeChatId: id }),

  getChatsForSpace: (spaceId) => {
    return get().chats.filter((c) => c.spaceId === spaceId);
  },

  getActiveChatsForSpace: (spaceId) => {
    const state = get();
    return state.chats.filter(
      (c) => c.spaceId === spaceId && !state.archivedChatIds.has(c.id)
    );
  },

  getArchivedChatsForSpace: (spaceId) => {
    const state = get();
    return state.chats.filter(
      (c) => c.spaceId === spaceId && state.archivedChatIds.has(c.id)
    );
  },

  getIndependentChats: () => {
    return get().chats.filter((c) => c.spaceId === null);
  },

  getRecentChats: () => {
    return [...get().chats]
      .filter((c) => c.shellId === null)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  },

  createChat: (spaceId, name) => {
    const now = new Date().toISOString();
    const chat: Chat = {
      id: `chat-${nanoid(6)}`,
      spaceId,
      shellId: null,
      name: name || "New chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    set((state) => ({
      chats: [...state.chats, chat],
      activeChatId: chat.id,
    }));
    return chat;
  },

  createShellChat: (shellId, name) => {
    const now = new Date().toISOString();
    const chat: Chat = {
      id: `chat-${nanoid(6)}`,
      spaceId: null,
      shellId,
      name: name || "Shell chat",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    set((state) => ({
      chats: [...state.chats, chat],
      activeChatId: chat.id,
    }));
    return chat;
  },

  getChatsForShell: (shellId) => {
    return get().chats.filter((c) => c.shellId === shellId);
  },

  getActiveChatsForShell: (shellId) => {
    const state = get();
    return state.chats.filter(
      (c) => c.shellId === shellId && !state.archivedChatIds.has(c.id)
    );
  },

  getArchivedChatsForShell: (shellId) => {
    const state = get();
    return state.chats.filter(
      (c) => c.shellId === shellId && state.archivedChatIds.has(c.id)
    );
  },

  archiveChat: (chatId) => {
    set((state) => ({
      archivedChatIds: new Set([...state.archivedChatIds, chatId]),
    }));
  },
}));
