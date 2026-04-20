# Figred — Product Overview for the Team

A short pitch of what we built, in the order it makes sense for someone who already knows the problem.

The whole product is one idea with three layers:

1. **Knowledge** is what we know about the product (global, persistent).
2. **Spaces** are where we think about a single problem (project-scoped, with their own context).
3. **Chats, Canvas, and the Shelf** are how we actually do the thinking — talking, exploring, and keeping what's good.

Everything else (Shells, Integrations, Mobile, Design system, Inspector) hangs off this spine.

---

## 1. Product Knowledge — the source of truth

Lives at `/knowledge`. This is **the source of truth** for the whole app — the "what does the company already know about itself" layer. Every Space and every Chat reads from it. If something is true about the product, it lives here first.

**Categories are user-configurable.** Each company organises Knowledge the way it actually thinks about itself — there's no fixed taxonomy. The defaults we ship with as a starting point are *About Company, Feature Specs, Business Logic, Customers & Personas, Product Decisions, Design System* — but users add, rename, split, or remove categories to match their own structure (e.g. a research-heavy team might add "User Interviews"; a brand-led team might split "Brand" out of Design System).

**Anything goes inside.** A Knowledge item is any factual or visual asset the company wants the AI (and the team) to treat as ground truth:

- Written docs (PRDs, specs, decision logs, FAQs)
- Sheets, dashboards, analytics exports
- PDFs, presentations, brand guidelines
- Figma files, prototypes, design tokens
- Videos, screen recordings, walkthroughs
- Web links, Notion pages, GitHub repos
- Audio notes, interview recordings

The page shows a nav grid of categories with item counts; each opens to a detail view of its items, source badges, and timestamps.

**How things get in:**
- Direct add from the Knowledge page (Upload / Website link / Google Doc / Sheet / Figma / GitHub / Record / Capture). The buttons exist; most intake is stubbed for the prototype.
- **Push from Space** — the one promotion path that *is* fully wired. From a Space's Shelf, the user picks a kept output or context item, picks a category, and we append it to Knowledge with source + timestamp. This is how a Space's good ideas graduate into long-term memory.

**Why it matters for the pitch:** Knowledge is the canonical layer the rest of the product defers to. A new Space connects to whichever categories are relevant and instantly inherits that institutional context — the AI is never amnesiac across projects.

---

## 2. Spaces — one project, one room

A Space is a workspace for a single problem ("Checkout v2", "Pricing page redesign", "New onboarding"). Created from `/spaces`.

Each Space has:

- A **name, description, and stage** (`brainstorm` / `wireframe` / `prototype` / `build`) — the stage is just a hint for the team and the AI; nothing is locked.
- A **target platform** (`web` / `mobile` / `universal`), **chosen at creation and immutable**. This decides the device frames, the build target (Next.js vs. Expo), and which scaffolds the AI pulls.
- A **Space Context** — documents, links, files attached to *this* Space only.
- **Connected Knowledge** — toggles for which Knowledge categories this Space pulls from.
- **Instructions for the AI** — free-text rules the AI follows in every chat in this Space.
- A list of **Chats** belonging to it.

Entering a Space replaces the home sidebar with the workspace shell (top bar + chat panel + container + right sidebar).

**Spaces are collaborative.** A Space isn't a single user's notebook — multiple product stakeholders (PM, designer, eng, research) work in the same Space. The Space Context, Shelf, and Canvas are shared and **keep evolving and growing** as people add docs, keep outputs, and push promotions back to Knowledge. The longer a Space lives, the richer its context gets for everyone in it.

**Why it matters for the pitch:** A Space is the unit of project memory *and* of cross-functional collaboration. The AI in a Chat sees three layers — Product Knowledge → Space Context → message-level chips — and that's how answers get specific without anyone re-explaining the company every prompt.

---

## 3. Chats — linear conversations inside a Space

A Space has many Chats. Each Chat is a normal AI conversation, but with two special behaviors:

- **Output cards.** When the AI generates a wireframe, screen, approach, component, or built prototype, it shows up as a card *inline* in the message. Each card has a **Keep** button. Keeping pins it to the Shelf for this Space.
- **Context chips.** Above the input, the user can attach Shelf items, Knowledge categories, or other context as chips. Whatever is chipped is sent with the next message — explicit, visible, removable.

Chats can also live outside Spaces (top-level chats from the home page) but most of the time they live inside one. The Cursor-style chat top bar lets the user switch chats, search, archive, and start a new one without leaving the Space.

**Why it matters for the pitch:** This is the *seat* the user spends 80% of their time in. The Keep gesture is what turns a stream of AI noise into a deliberate set of artifacts the user wants to keep exploring.

---

## 4. Canvas — exploration as a spatial surface

Canvas is the second view of the same Shelf data. It's a tab in the container (toggled from the top bar). Where Chat is linear and sequential, Canvas is **spatial and parallel**.

Every kept output appears as a card on an infinite tldraw canvas:

- **Exploration outputs** (loose HTML sketches, approach cards) sit alongside **wireframes**, **hi-fi screens**, and **built prototypes** — all on the same surface, distinguished by a fidelity badge in the corner.
- **Built prototypes** render as a live mini-browser shape with a green "Live" pulse — the actual app, embedded in the canvas.
- Users can draw, annotate, group, and write inline prompts on the canvas.

**The exploration → prototype bridge.** This is the bit to call out clearly in the pitch: a PM or designer doesn't need to commit to fidelity up front. They can ask for three approaches, get three rough HTML mocks on the canvas, dismiss two, ask the AI to "build this one out," and that single card upgrades into a full multi-file project — same canvas, same tab, no mode switch. The same flow works in reverse: a built prototype can be dismissed back down to a sketch by branching off it.

The selection actions on a single card make this concrete:

| Action | What it does |
|---|---|
| **Create variations** | AI generates N variants, auto-arranged in a row |
| **Build this** | Promotes a sketch/wireframe into a real built project (files + routes + a Preview tab) |
| **Combine** (multi-select) | Merges 2+ outputs into a new one |

**Why it matters for the pitch:** This is *the* differentiator from "ChatGPT for designers." The role-agnostic flow — brainstorm in chat, explore on canvas, ideate by selecting/combining/varying, prototype by clicking Build — happens on one surface, with no separate "prototyping tool" to context-switch into.

---

## 5. Context Shelf — approaches set aside to come back to

The right sidebar of a Space has two modes:

- **Context mode** (default when entering a Space) — shows Space Context items, Instructions, and Connected Knowledge. Auto-collapses when the user sends their first message.
- **Shelf mode** — the **set-aside drawer**. Every approach the user *kept* from a chat lands here: things they don't want to act on right now but want to brainstorm on later. Filterable by type, source chat, and date. Selecting items here lights them up as chips in the chat input, ready to feed back into a fresh round of thinking.

Shelf mode and Canvas are the **same data, two views** of the kept set: Canvas is the spatial view (lay them out, compare, combine, build); the Shelf is the list view (a quiet inbox of approaches to revisit). Promote-to-Knowledge is triggered from here when something graduates from "interesting to brainstorm on" to "this is now true about the product."

**Why it matters for the pitch:** The Shelf reflects how product thinking actually works — most ideas aren't acted on the moment they appear; they're parked, returned to, recombined. Keep is the gesture that says "not now, but later," and the Shelf is where *later* lives.

---

## 6. Shells — reusable scaffolds

A Shell is a project template with opinion. It lives at `/shells` and has:

- **Tech stack** (e.g., "Next.js 16, Tailwind, shadcn" or "React Native, Expo, NativeWind")
- **Design system note** (e.g., "Acme DS — Figma library v3")
- **Token preferences** (radius, surface, accents)
- **Connected Knowledge** + **instructions** (just like a Space)
- **Context items** (mobile primitives, component cheatsheets, etc.)

A Shell can be **remixed into a new Space** in one click — the new Space inherits all of the above, so the AI starts producing on-brand, on-stack outputs from message one.

**The Shell workspace** has its own pinned tabs: Canvas + **App preview**. Opening a Shell lands directly on App preview — the live UI, in the right device frame. We seed two: a B2B admin shell (web) and a mobile activity shell (RN/Expo, phone-frame preview). The mobile one demonstrates that Shells are not web-only.

**Why it matters for the pitch:** Shells are how we encode "this is how *we* build at this company" once and reuse it forever. They're the bridge between Knowledge (what we know) and Spaces (what we're working on right now) — the *house style* layer.

---

## 7. Integrations + Settings (state of the world)

- **`/integrations`** lists Figma, Google Docs, Google Sheets, GitHub, Linear. Two are mocked as "Connected"; the rest show "Connect" buttons. **Today this is a placeholder surface** — the feature shape is right, the wiring is phase-2.
- **`/settings`** is a stub.

Worth saying out loud in the pitch so the team doesn't over-promise: integrations are the next big build-out, not something to demo today.

---

## 8. Design language

We're dark-first, on a Cursor + Figma reference: warm-dark surfaces (`#282826` base), indigo/violet accent (`#695be8`), Inter throughout, 10px base radius, Lucide icons at 16px / 1.5 stroke. Layered backgrounds for elevation, borders only when separation needs to be loud. Animations are 150–250ms, framer-motion, never gratuitous.

The principle is **"quiet UI, loud outputs"** — the chrome stays out of the way so the AI-generated content is what the eye lands on. Full token map and component patterns live in `docs/ux/02-design-system.md`.

**Live editing.** Inside a built prototype's Preview tab, the **Inspector** panel lets the user click any element in the live iframe and tweak font size, weight, color, border, radius — changes apply live via a postMessage bridge into the sandboxed iframe. Currently web-only; mobile previews use Expo Snack and don't support inspect.

---

## 9. Mobile-first direction

Mobile is a first-class target, not a responsive afterthought. The shape:

- **Per-Space `targetPlatform`** decides everything downstream — locked at Space creation so the AI, the device frames, and the build pipeline stay aligned.
- **Device frames** — `DeviceFrame` is one component with five variants (desktop, tablet, iPhone 15 Pro, iPhone SE, Pixel 8). Phone variants render the dynamic island / punch-hole, status bar, and home indicator. Used by Canvas, the Shell App preview, and the Preview tab.
- **On Device tab** — for mobile Spaces, the container has an On Device tab with an inline Expo Snack runner placeholder and a Share overlay (QR + pairing event log). The pairing is mocked for the prototype; the UI is real.
- **Mock RN builds** — `mockBuildFromOutput` emits a real `BuildProject` with `framework: "expo"` and a `snackSource` string for mobile outputs. Our seeded Activity Tracker demo ships with full RN code (SafeAreaView, ScrollView, Pressable, inline StyleSheet) so the demo runs end-to-end.
- **Mobile shell + auto-seeded mobile spaces** — there's a "Mobile activity shell" seed and an auto-seed for new mobile Spaces so the demo always has something to show.

**Why it matters for the pitch:** the same brainstorm → explore → build flow works for a fitness app's home screen as for a B2B admin console. The platform is metadata; the workflow is one.

---

## What to demo, in order

If you're walking someone through the product cold:

1. **Open `/knowledge`** — show the categories and item counts (mention they're user-configured per company). "This is the source of truth — what the AI always knows about us."
2. **Open `/shells`** — open the Mobile activity shell. App preview lands first; phone frame, dark fitness UI. "This is the *house style* layer."
3. **Open a Space** — show the three context layers in the right sidebar. Send a message. Show that the answer is on-brand because of the layers above.
4. **Keep an output** → **switch to Canvas** → **select two cards, "Combine"** → **select one, "Build this"**. Walk through the brainstorm → explore → prototype journey on a single surface.
5. **Open the Preview tab** of the built output → toggle the Inspector → tweak a color live.
6. **Open a mobile Space** → On Device tab → show the Snack runner + Share QR.

That's the whole product in six clicks.
