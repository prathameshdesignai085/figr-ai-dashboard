import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Chat } from "@/types";
import {
  MOBILE_MVP_BUILD_PROJECT_ID,
  MOBILE_MVP_BUILT_OUTPUT_ID,
} from "@/lib/seed/mobile-mvp-demo-build";

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
    // ── Mobile App MVP demo — completed chat that walks from prompt → exploration → hi-fi → built RN prototype.
    // Backed by `mobileMvpDemoBuildProject` in useBuildStore so the Built output's
    // buildProjectId resolves and the On Device tab + Build preview both light up.
    {
      id: "chat-mvp-1",
      spaceId: "space-3",
      shellId: null,
      name: "Activity tracker — kickoff",
      createdAt: "2026-04-15T09:30:00Z",
      updatedAt: "2026-04-18T10:20:00Z",
      messages: [
        {
          id: "msg-mvp-1",
          chatId: "chat-mvp-1",
          role: "user",
          content:
            "I want to start a daily activity tracker. Just a phone home screen for now — show me a couple of directions.",
          outputs: [],
          contextItemIds: [],
          timestamp: "2026-04-15T09:30:00Z",
        },
        {
          id: "msg-mvp-2",
          chatId: "chat-mvp-1",
          role: "assistant",
          content:
            "Two directions for the home screen. The first leans on a single hero ring (Apple-Health-style), the second on stacked activity cards (Strava-style).",
          outputs: [
            {
              id: "out-mvp-explore-a",
              messageId: "msg-mvp-2",
              chatId: "chat-mvp-1",
              spaceId: "space-3",
              shellId: null,
              type: "approach",
              fidelity: "exploration",
              title: "A · Hero ring + recent",
              summary:
                "One big progress ring above the fold (steps + active min), three stat tiles, and a short recent-activity list. Glanceable in 1s.",
              content:
                "# A · Hero ring + recent\n\n**Goal:** make today's progress legible in one glance.\n\n## Layout\n- Hero ring card (steps · % of goal) — full width, gradient fill\n- 3-tile row: active min · kcal · km\n- Recent activity (2-3 entries)\n- Primary 'Log workout' CTA\n- 4-tab bottom nav: Home · Activity · Insights · Profile\n\n## Why this works\n- Big, friendly hero — feels rewarding\n- Lower-screen CTA reachable with thumb\n- Tab bar instead of a drawer keeps chrome out of the way",
              kept: true,
              keptAt: "2026-04-15T09:36:00Z",
              canvasPosition: { x: 80, y: 80 },
              platform: "mobile",
            },
            {
              id: "out-mvp-explore-b",
              messageId: "msg-mvp-2",
              chatId: "chat-mvp-1",
              spaceId: "space-3",
              shellId: null,
              type: "approach",
              fidelity: "exploration",
              title: "B · Activity feed-first",
              summary:
                "Lead with a chronological feed of workouts. Today's totals live in a sticky header. Better for power users, denser visually.",
              content:
                "# B · Activity feed-first\n\n**Goal:** privilege history over today's snapshot.\n\n## Layout\n- Sticky header: today's steps + kcal + minutes (compact)\n- Vertical feed of workouts (cards with map/route thumbnails)\n- Floating action button: Log workout\n- 4-tab bottom nav\n\n## Trade-offs\n- Denser, more for power users\n- Less of a 'wow on open' moment\n- Hero stats compete with feed visually",
              kept: false,
              keptAt: null,
              canvasPosition: null,
              platform: "mobile",
            },
          ],
          contextItemIds: [],
          timestamp: "2026-04-15T09:35:00Z",
        },
        {
          id: "msg-mvp-3",
          chatId: "chat-mvp-1",
          role: "user",
          content:
            "Let's go with A — hero ring. Make it a hi-fi screen and a working RN prototype I can preview on my phone.",
          outputs: [],
          contextItemIds: [],
          timestamp: "2026-04-17T16:40:00Z",
        },
        {
          id: "msg-mvp-4",
          chatId: "chat-mvp-1",
          role: "assistant",
          content:
            "Done. Here's a hi-fi mock of the home screen plus a live RN prototype — open the Mobile tab to scan and run it on Expo Go.",
          outputs: [
            {
              id: "out-mvp-hi-fi",
              messageId: "msg-mvp-4",
              chatId: "chat-mvp-1",
              spaceId: "space-3",
              shellId: null,
              type: "screen",
              fidelity: "hi-fi",
              title: "Activity Home — Hi-fi",
              summary:
                "Polished home screen with hero ring, stat tiles, recent workouts, and Log workout CTA.",
              content: `<div style="background:#0f0f0f;min-height:100%;padding:18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fff;display:flex;justify-content:center">
  <div style="width:360px;background:#fff;border-radius:36px;border:10px solid #0a0a0a;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,0.5);position:relative">
    <div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);width:96px;height:24px;border-radius:999px;background:#0a0a0a;z-index:5"></div>
    <div style="display:flex;justify-content:space-between;padding:12px 24px 8px;font-size:11px;font-weight:600;color:#18181b">
      <span>9:41</span><span>● ▮ ▮▮</span>
    </div>
    <div style="padding:8px 18px 18px">
      <div style="font-size:12px;color:#71717a">Good morning</div>
      <div style="font-size:22px;font-weight:700;color:#18181b;margin-bottom:16px">Pratea</div>
      <div style="display:flex;gap:14px;padding:16px;border-radius:18px;background:linear-gradient(135deg,#7c6ef5,#a294fb);color:#fff;margin-bottom:14px;align-items:center">
        <div style="width:78px;height:78px;border-radius:50%;border:8px solid rgba(255,255,255,0.25);border-top-color:#fff;transform:rotate(-30deg)"></div>
        <div style="flex:1">
          <div style="font-size:24px;font-weight:700">7,420</div>
          <div style="font-size:11px;opacity:0.85">steps · 62% of goal</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px">
        <div style="background:#f4f4f5;border-radius:12px;padding:10px;text-align:center"><div style="font-weight:700;color:#18181b">38</div><div style="font-size:10px;color:#71717a">active min</div></div>
        <div style="background:#f4f4f5;border-radius:12px;padding:10px;text-align:center"><div style="font-weight:700;color:#18181b">412</div><div style="font-size:10px;color:#71717a">kcal</div></div>
        <div style="background:#f4f4f5;border-radius:12px;padding:10px;text-align:center"><div style="font-weight:700;color:#18181b">5.2</div><div style="font-size:10px;color:#71717a">km</div></div>
      </div>
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#71717a;margin:8px 0">Recent activity</div>
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e4e4e7;border-radius:12px;margin-bottom:6px">
        <div style="width:28px;height:28px;border-radius:50%;background:#ede9fe;color:#7c6ef5;display:flex;align-items:center;justify-content:center;font-weight:700">R</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600;color:#18181b">Morning run</div><div style="font-size:11px;color:#71717a">3.2 km · 18 min · today</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e4e4e7;border-radius:12px;margin-bottom:6px">
        <div style="width:28px;height:28px;border-radius:50%;background:#ede9fe;color:#7c6ef5;display:flex;align-items:center;justify-content:center;font-weight:700">Y</div>
        <div style="flex:1"><div style="font-size:13px;font-weight:600;color:#18181b">Yoga</div><div style="font-size:11px;color:#71717a">25 min · yesterday</div></div>
      </div>
      <button style="width:100%;padding:12px;border:none;border-radius:14px;background:#18181b;color:#fff;font-weight:600;font-size:13px;margin-top:8px">Log workout</button>
    </div>
  </div>
</div>`,
              kept: true,
              keptAt: "2026-04-18T10:18:00Z",
              canvasPosition: { x: 480, y: 80 },
              platform: "mobile",
            },
            {
              id: MOBILE_MVP_BUILT_OUTPUT_ID,
              messageId: "msg-mvp-4",
              chatId: "chat-mvp-1",
              spaceId: "space-3",
              shellId: null,
              type: "screen",
              fidelity: "built",
              title: "Activity Home — RN prototype",
              summary:
                "Working Expo Snack scaffold (Home + bottom tab bar). Live in the Mobile preview — scan QR with Expo Go to run on a phone.",
              content:
                "# Activity Home — RN prototype\n\nReact Native (Expo) scaffold of the hero-ring home screen. Includes the bottom tab bar shell. Generated by Figred · ready to preview in Expo Go.",
              kept: true,
              keptAt: "2026-04-18T10:20:00Z",
              canvasPosition: { x: 880, y: 80 },
              platform: "mobile",
              buildProjectId: MOBILE_MVP_BUILD_PROJECT_ID,
            },
          ],
          contextItemIds: [],
          timestamp: "2026-04-18T10:20:00Z",
        },
      ],
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
    // ── Mobile shell demo — seed chat that backs `shell-demo-mobile-1` with one
    // kept HTML output. `shell-app-preview-panel.tsx` (`findFirstKeptHtmlOutput`)
    // picks this up so the App preview tab renders a phone-frame mock instead of
    // falling back to the static AcmeVisionMock admin sidebar.
    {
      id: "chat-shell-demo-mobile-1",
      spaceId: null,
      shellId: "shell-demo-mobile-1",
      name: "Mobile shell — kickoff",
      createdAt: "2026-04-05T13:00:00Z",
      updatedAt: "2026-04-12T09:00:00Z",
      messages: [
        {
          id: "msg-shell-mobile-1",
          chatId: "chat-shell-demo-mobile-1",
          role: "assistant",
          content:
            "Bootstrapped the mobile shell with a phone-frame home screen — bottom tab bar, hero card, and one-handed CTA in the lower third.",
          outputs: [
            {
              id: "out-shell-mobile-home",
              messageId: "msg-shell-mobile-1",
              chatId: "chat-shell-demo-mobile-1",
              spaceId: null,
              shellId: "shell-demo-mobile-1",
              type: "screen",
              fidelity: "built",
              title: "Activity home — mobile shell",
              summary:
                "Phone-frame home screen scaffold for the mobile shell. Bottom tab bar, hero card, primary CTA in the lower third for one-handed reach.",
              // Screen content only — no outer device chrome / status bar / home
              // indicator. The shell App preview wraps this iframe in <DeviceFrame
               // variant="iphone-15-pro"> (see shell-app-preview-panel.tsx +
              // build-preview/live-preview-frame.tsx) which provides bezel,
              // dynamic island, status bar, and home indicator.
              content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Mobile shell — Home</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; background: #0f0f12; color: #f4f4f5; }
    .app { display: flex; flex-direction: column; height: 100%; }
    .content { flex: 1; overflow-y: auto; padding: 18px 18px 12px; }
    .greeting { font-size: 12px; color: #a1a1aa; margin: 0 0 2px; }
    .name { font-size: 22px; font-weight: 700; margin: 0 0 16px; color: #fafafa; }
    .hero-card { padding: 18px; border-radius: 18px; background: linear-gradient(135deg, #7c6ef5 0%, #5b4ef0 100%); color: #fff; margin-bottom: 14px; }
    .hero-card .label { font-size: 11px; opacity: 0.85; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.06em; }
    .hero-card .value { font-size: 28px; font-weight: 700; line-height: 1.05; margin: 0 0 6px; }
    .hero-card .meta { font-size: 12px; opacity: 0.85; margin: 0; }
    .row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 14px; }
    .stat { background: #1f1f24; border: 1px solid #27272a; border-radius: 14px; padding: 12px; }
    .stat .v { font-size: 16px; font-weight: 700; color: #fafafa; }
    .stat .k { font-size: 11px; color: #a1a1aa; margin-top: 2px; }
    .section { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin: 10px 0 8px; }
    .row-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #27272a; border-radius: 12px; margin-bottom: 6px; background: #18181b; }
    .row-card .icon { width: 28px; height: 28px; border-radius: 8px; background: #2e2740; color: #b8aafd; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .row-card .meta .title { font-size: 13px; font-weight: 600; color: #fafafa; }
    .row-card .meta .sub { font-size: 11px; color: #a1a1aa; margin-top: 1px; }
    .cta { display: block; width: 100%; padding: 14px; border: none; border-radius: 14px; background: #7c6ef5; color: #fff; font-weight: 600; font-size: 14px; margin-top: 12px; cursor: pointer; }
    .tabbar { display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 0 6px; border-top: 1px solid #27272a; background: #0f0f12; font-size: 10px; color: #a1a1aa; }
    .tab { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .tab .dot { width: 14px; height: 14px; border-radius: 4px; background: #3f3f46; }
    .tab.active { color: #b8aafd; }
    .tab.active .dot { background: #7c6ef5; }
  </style>
</head>
<body>
  <div class="app" data-figred-component="App">
    <div class="content">
      <p class="greeting">Today</p>
      <p class="name">Ready to move</p>
      <div class="hero-card" data-figred-component="HeroCard">
        <p class="label">Daily streak</p>
        <p class="value">12 days</p>
        <p class="meta">Keep going — 2 more for a personal best.</p>
      </div>
      <div class="row">
        <div class="stat"><div class="v">3</div><div class="k">workouts this week</div></div>
        <div class="stat"><div class="v">82%</div><div class="k">weekly goal</div></div>
      </div>
      <div class="section">Pick up where you left off</div>
      <div class="row-card">
        <div class="icon">▶</div>
        <div class="meta"><div class="title">Resume — Lower body</div><div class="sub">12 min · 6 exercises left</div></div>
      </div>
      <div class="row-card">
        <div class="icon">★</div>
        <div class="meta"><div class="title">Saved — Mobility flow</div><div class="sub">8 min · stretch &amp; recover</div></div>
      </div>
      <button class="cta" data-figred-component="StartWorkoutCTA">Start workout</button>
    </div>
    <div class="tabbar" data-figred-component="BottomTabBar">
      <div class="tab active"><div class="dot"></div><span>Home</span></div>
      <div class="tab"><div class="dot"></div><span>Workouts</span></div>
      <div class="tab"><div class="dot"></div><span>Stats</span></div>
      <div class="tab"><div class="dot"></div><span>Profile</span></div>
    </div>
  </div>
</body>
</html>`,
              kept: true,
              keptAt: "2026-04-05T13:05:00Z",
              canvasPosition: { x: 80, y: 80 },
              platform: "mobile",
            },
          ],
          contextItemIds: [],
          timestamp: "2026-04-05T13:01:00Z",
        },
      ],
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
