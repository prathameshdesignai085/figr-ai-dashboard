# 03 — Workspace Experience (Inside a Space)

*The core product surface where Chat, Container, and Shelf come together.*

---

## 1. Layout overview

When a user enters a space, the home left sidebar disappears. The workspace is a full-screen experience with:

- **Top Bar** — persistent, full width, independent of all panels
- **Three-panel system** below the top bar:
  1. **Chat Panel** (left) — always present, resizable
  2. **Container** (center) — tabbed previews, canvas — opens on demand
  3. **Context/Shelf Sidebar** (right) — space context or shelf items — opens on demand

### Panel states

| State | Chat | Container | Sidebar | Trigger |
|-------|------|-----------|---------|---------|
| Initial | full width | hidden | context mode (visible) | entering the space |
| Chatting | full width | hidden | hidden (auto-collapsed) | first message sent |
| Previewing | 30% | 70% | hidden | click output / open doc |
| Previewing + Shelf | 30% | flex (compressed) | shelf mode (visible) | toggle shelf |
| Chat + Shelf only | full width (compressed) | hidden | shelf mode (visible) | toggle shelf, no container |
| Canvas | 30% | 70% (canvas tab) | hidden | toggle canvas |

---

## 2. Top Bar

Height: ~44px. Background: `bg-background` with bottom `border-white/[0.06]`.

### Left section
- `←` Back arrow — returns to home (`/`)
- Space name — clickable, opens space settings overlay
- Stage badge — `brainstorm` / `wireframe` / `prototype` / `build` (colored pill, same as spaces page)

### Right section
- **Context/Shelf toggle** — opens/closes the right sidebar
- **Canvas toggle** — opens canvas as a tab in the container
- **⚙ Settings** — opens space settings overlay

---

## 3. Chat Panel

Default width: ~380px (resizable via drag handle on right edge). Expands to full width when container is hidden.

### 3.1 Chat top bar (Cursor-inspired)

A compact bar managing multiple chats within the space:

```
[≡] [Current Chat Name ▾]  [New Chat]  [+]  [🕐]  [...]
```

- **≡ Panel icon** — toggles chat history panel (slides in from left)
- **Current Chat Name** — active chat tab, highlighted background
- **New Chat** — text button, creates a new chat in this space
- **+** — alternative new chat trigger
- **🕐 Clock** — dropdown: search field, recent chats list, archived section
- **...** — more options (rename, archive, delete)

### 3.2 Chat history panel

When ≡ is toggled, a ~220px panel slides in from the left edge of the chat panel:

- Search field ("Search chats...")
- "New Chat" button (full width)
- **Chats** section header
- List items: `[status dot] [chat name] [time ago]` + subtitle (last action)
- **Archived** collapsible section
- Click a chat → switches active chat, panel auto-closes

### 3.3 Messages area

- Scrollable, auto-scrolls to bottom on new messages
- **User messages**: right-aligned or full-width block with user avatar
- **Assistant messages**: left-aligned with AI avatar, may contain:
  - Text content (markdown rendered)
  - **Output cards** (inline) — see section 4

### 3.4 Output cards (inline in chat)

When the AI generates an output (approach, wireframe, screen, flow, text_block, component), it appears as a card within the message:

- **Card**: rounded border, `bg-white/[0.03]`, `border-white/[0.08]`
- **Header**: output type label + title
- **Body**: summary text or thumbnail preview
- **Actions**:
  - **Keep** button — adds to shelf, shows checkmark when kept
  - **Click anywhere on card** → opens in container as a tab

### 3.5 Chat input

Fixed at bottom of chat panel:

- **Context chips** — above the input field, showing selected shelf items attached as context. Each chip: `[x] item name`. Chips come from shelf selection.
- **Input field** — text area, auto-grows, placeholder: "Ask anything..."
- **Left actions**: "Add context" button (opens shelf/context picker), attachment button
- **Right actions**: send button (primary color when input has text)

---

## 4. Container Area

The main preview/workspace area. Only visible when a tab is open.

### 4.1 Tab bar

Horizontal tab bar at top of the container:

```
[Preview ×]  [checkout-flow.md ×]  [Canvas]
```

- Regular tabs: closeable (× button), show file/output name
- Canvas tab: special, toggled from top bar. Pinned when open.
- Active tab: highlighted with `border-b-2 border-primary`
- Closing all tabs collapses the container entirely

### 4.2 Document preview

For markdown, PDF, text documents:

- Rendered content (markdown → HTML)
- Full reading experience with comfortable typography
- Scroll within container

### 4.3 Prototype browser

For interactive prototypes:

**Browser bar** (top of content area):
```
[📱 device selector]  [/checkout/cart]                    [↗ open external]  [↻ refresh]
```

- Device selector: desktop / tablet / mobile (changes iframe dimensions)
- URL path: editable, shows current route
- Open external: opens in new browser tab
- Refresh: reloads iframe

**Content**: sandboxed iframe rendering the prototype

**Inspector panel** (toggleable, slides from right edge):
- Element info: component name (e.g. "CardHeader") + delete + close
- **Text**: font size, font weight, alignment
- **Appearance**: text color, background color, opacity
- **Border**: color, width, radius
- Changes in inspector reflect live in the iframe

### 4.4 Code view

For source code files:

- Syntax-highlighted display (language auto-detected from extension)
- Line numbers
- Read-only by default
- File name shown in tab

### 4.5 Canvas

Spatial view of all kept outputs:

- Powered by tldraw (placeholder for initial build)
- All shelf items displayed as cards/nodes on an infinite canvas
- **Interactions**: drag, group, annotate, arrange spatially
- Click an output on canvas → opens focused tab for that item
- Select items on canvas → can attach as chat context
- Toggle back to canvas from focused view (zoom out effect)

---

## 5. Context/Shelf Sidebar

Width: ~280px. Appears on the right edge of the viewport. Slides in/out.

### 5.1 Context mode (default on space entry)

Shown when the user first enters a space, before they start chatting.

- **Section: Space Context**
  - List of context items attached to this space (documents, links, files)
  - Each item: `[type icon] [name] [source badge]`
  - Click item → opens as tab in container
- **Section: Instructions**
  - Shows space instructions for AI (read-only display)
  - "Edit" link → opens space settings
- **Section: Connected Knowledge**
  - Product knowledge categories connected to this space
  - Each: `[category icon] [category name] [item count]`
  - Status badges showing connection

**Auto-collapse**: when the user sends their first message, the context sidebar collapses automatically to give full width to chat.

### 5.2 Shelf mode

Toggled from top bar or explicitly. Shows kept outputs.

- **Header**: "Shelf" + item count + filter dropdown
- **List of kept outputs**:
  - `[checkbox] [type icon] [title]`
  - Subtitle: source chat name + "kept [time ago]"
  - Click title → opens as tab in container
  - Checkbox → selects for context attachment
- **Filter options**: by output type, by source chat, by date
- **Footer action**: "Use selected as context" button (adds selected to chat input chips)

---

## 6. Space settings (overlay)

Accessible via: clicking space name in top bar OR ⚙ gear icon.

Rendered as a dialog overlay:

- **Space name** (editable text field)
- **Description** (editable textarea)
- **Stage selector** (brainstorm / wireframe / prototype / build radio/segmented control)
- **Context items** (list with add/remove)
- **Connected product knowledge** (category toggles)
- **Instructions for AI** (editable textarea)
- **Save / Cancel** buttons

---

## 7. Responsive behavior

- Minimum chat panel width: ~280px
- Minimum container width: ~400px
- When viewport is too narrow for 30/70 split, container overlays chat (mobile/tablet)
- Context/Shelf sidebar can be dismissed on narrow viewports

---

## 8. Data flow

```
Chat Input → AI Response → Output Cards (inline)
                                 ↓ Keep
                           Shelf (sidebar)
                                 ↓ Select
                        Context Chips (chat input)
                                 ↓
                        Next AI Response (enriched)

Shelf Items ←→ Canvas (spatial view, same data)
Shelf Item click → Container Tab (preview)
Canvas Item click → Container Tab (preview)
Context Item click → Container Tab (preview)
```

---

## 9. Mock data needed

For the prototype, seed with:

- 2–3 chats per space with 4–6 messages each
- 3–4 output cards across messages (mix of types: approach, wireframe, screen, text_block)
- 2–3 kept outputs in the shelf
- Space context items already exist in store (Checkout PRD, Cart analytics)
- Connected knowledge categories already exist in store
