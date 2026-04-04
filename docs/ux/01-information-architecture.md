# Information Architecture & Navigation

*Figred AI — UX Specification*

---

## Terminology

| Term | Definition |
|------|-----------|
| **Product Knowledge** | Global source of truth about the user's entire product. Persists across all spaces. |
| **Space** | A focused initiative (formerly "project"). Has its own context, chats, shelf, and canvas. |
| **Chat** | A conversation with AI. Can be independent or linked to a space. |
| **Shelf** | Curated collection of kept outputs. Space-scoped. |
| **Canvas** | Spatial view of kept outputs. Space-scoped. |

---

## Application States

The app has two primary states:

### 1. Home State (browsing, managing)
The user is navigating between spaces, managing product knowledge, configuring integrations. The main area shows page content based on left panel selection.

### 2. Workspace State (working)
The user has entered a space or started a chat. The layout shifts to a chat-focused workspace (Cursor-style). The left panel context changes to show chats within that space.

---

## Left Panel Structure

The left panel is always visible (collapsible). Its contents shift based on context.

### Home State — Left Panel

```
┌─────────────────────────────┐
│ figred                [+] ← new chat
│                             │
│ ─── Spaces ──────────────── │
│ ★ Checkout Redesign         │  ← favorited/pinned (max 2-3)
│ ★ Onboarding V2             │
│   Mobile App MVP            │  ← other spaces
│   Analytics Dashboard       │
│   + New space               │
│                             │
│ ─── Product Knowledge ───── │
│   About Company             │
│   Feature Specs             │
│   Business Logic            │
│   Customers & Personas      │
│   Product Decisions         │
│   Design System             │
│                             │
│ ─── ─── ─── ─── ─── ─── ── │
│ ⚡ Integrations              │
│ ⚙ Settings                  │
│                             │
│ ─── Recent Chats ────────── │
│ Today                       │
│   "brainstorm pricing"  [⬡] │ ← [⬡] = linked to space
│   "quick wireframe idea"    │ ← no icon = independent
│ Yesterday                   │
│   "competitor analysis" [⬡] │
│   "random exploration"      │
│ Last week                   │
│   ...                       │
│                             │
│ ─────────────────────────── │
│ 👤 Prathamesh         [Pro] │
└─────────────────────────────┘
```

**Key behaviors:**
- Spaces section shows favorites/pinned at top (2-3 max), then other spaces
- Recent Chats is a mixed timeline (all chats sorted by recency)
- Chats linked to a space show a small indicator icon (e.g., colored dot or space icon)
- Clicking a space → navigates to the newest chat in that space (workspace state)
- Clicking an independent chat → opens it directly (workspace state)
- Clicking a linked chat → opens it within its space context (workspace state)

### Workspace State — Left Panel

When inside a space, the left panel transforms:

```
┌─────────────────────────────┐
│ ← Back to home    figred    │
│                             │
│ Checkout Redesign           │ ← space name
│ [Brainstorm] ← stage mode  │
│                             │
│ ─── Space Chats ─────────── │
│ ● Checkout flow exploration │ ← active chat
│   Payment UX research       │
│   Final direction           │
│   + New chat                │
│                             │
│ ─── Space Context ───────── │
│   📄 Checkout PRD           │
│   📊 Cart analytics.csv     │
│   🔗 Competitor: Stripe     │
│   + Add context             │
│                             │
│ ─── Product Knowledge ───── │
│   ✓ Connected               │
│   (About Company, Design    │
│    System, Personas)        │
│                             │
│ ─────────────────────────── │
│ 👤 Prathamesh         [Pro] │
└─────────────────────────────┘
```

**Key behaviors:**
- "Back to home" returns to home state
- Shows all chats within this space
- Shows space-specific context (documents, links, files added to this space)
- Shows which product knowledge is connected
- Stage mode indicator (brainstorm/wireframe/prototype/build)

---

## Main Area — Pages

### When in Home State

| Left panel click | Main area shows |
|-----------------|-----------------|
| **Default (home)** | Welcome screen with chat input + quick actions (like current Figr) |
| **A space** | Navigates to workspace state (newest chat) |
| **Product Knowledge** | Product knowledge management page |
| **A subcategory** (e.g., "Feature Specs") | That specific knowledge section |
| **Integrations** | Connected services, add new integrations |
| **Settings** | Account, preferences, billing |
| **A recent chat** | Opens that chat in workspace state |

### When in Workspace State

The main area is the chat interface (or canvas, when toggled).

---

## Product Knowledge Page

When the user clicks "Product Knowledge" from the left panel, the main area shows the global knowledge management interface.

### Categories

| Category | What it contains | Example sources |
|----------|-----------------|-----------------|
| **About Company** | Company description, mission, brand guidelines, tone of voice | Uploaded docs, website link |
| **Feature Specs** | Shipped feature documentation, how things currently work | Google Docs, uploaded specs, screen recordings |
| **Business Logic** | Rules, workflows, constraints, edge cases, validation logic | Google Sheets, uploaded docs |
| **Customers & Personas** | User research, personas, pain points, needs, segments | Google Docs, uploaded research |
| **Product Decisions** | Past decisions and rationale, trade-offs, why things are the way they are | Pushed from spaces, uploaded docs |
| **Design System** | Colors, typography, spacing, components, patterns | Figma integration, manual upload |

### Layout

Each category is a card showing: name, description, document count, last updated. Clicking a card opens that category's detail view where users can browse, add, edit, and remove knowledge items.

Below the categories grid: a section showing all available input methods for adding knowledge.

---

## Knowledge Input Methods

These apply to both product knowledge and space context.

| Method | How it works |
|--------|-------------|
| **Upload from computer** | Drag-and-drop or file picker. Supports PDF, images, docs, spreadsheets. |
| **Website link** | Paste URL → system scrapes/captures the page content. |
| **Google Docs** | OAuth integration → browse and select documents to pull in. |
| **Google Sheets** | OAuth integration → browse and select spreadsheets (data, business rules, etc.). |
| **Figma** | OAuth integration → pull frames, components, design system tokens. |
| **Record screen** | In-app screen recorder → captures video + transcript as context. |
| **Capture screen** | Screenshot tool → captures current screen state as image context. |
| **Push from space** | When a space completes, user selects outputs to push to product knowledge (git merge analogy). |

---

## Space Context

A space has its own context layer, separate from product knowledge. Space context can come from:

1. **Pulled from product knowledge** — user selects which categories/items to connect when creating the space
2. **Added manually** — upload files, paste links, record screen, etc. (same input methods as product knowledge)
3. **Built during work** — outputs saved to space context from chats (git commit analogy)

Space context is visible in the left panel when inside the workspace state.

---

## Navigation Flows

### Creating a new space
1. User clicks "+ New space" in left panel
2. Modal/dialog: name, description
3. Option to connect product knowledge (select which categories)
4. Option to add initial context (upload, link, pull from product knowledge)
5. Space created → enters workspace state with empty first chat

### Starting an independent chat
1. User clicks "+ New chat" (top of left panel)
2. Enters workspace state with a fresh chat
3. No space context — can still reference product knowledge and design system
4. Can link this chat to a space later if desired

### Entering a space
1. Click space name in left panel
2. Switches to workspace state
3. Left panel transforms to show space chats + context
4. Main area shows most recent chat

### Navigating from chat to its space
1. User is in an independent chat linked to a space
2. Clicks the space indicator on the chat
3. Enters that space's workspace state

---

## URL Structure

```
/                           → Home (welcome + chat input)
/space/[spaceId]            → Redirects to newest chat in space
/space/[spaceId]/chat/[id]  → Chat within space
/space/[spaceId]/canvas     → Canvas view for space
/chat/[chatId]              → Independent chat
/knowledge                  → Product knowledge page
/knowledge/[category]       → Specific knowledge category
/integrations               → Integrations page
/settings                   → Settings page
```

---

## Open Questions

- How does the left panel behave on smaller screens?
- Should there be a search/command palette (Cmd+K) for quick navigation?
- How many chats should show in the "Recent Chats" section before pagination/scroll?
- Should independent chats have access to the shelf/canvas, or only space chats?
- Can a chat be moved from independent to a space after creation?
