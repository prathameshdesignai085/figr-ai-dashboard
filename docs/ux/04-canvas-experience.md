# 04 — Canvas Experience

*The spatial synthesis layer where users explore, compare, annotate, combine, and build.*

---

## 1. Purpose

Canvas is one of three core primitives (Chat, Shelf, Canvas). While chat is linear and sequential, canvas is spatial and parallel. Users see all kept outputs arranged visually, compare variations side-by-side, annotate directly, prompt inline, and progress from exploration to high-fidelity to built prototype — all on the same surface.

**No lineage shown.** What matters is the output. Users don't need to see how things were created — just the current state of their explorations.

---

## 2. Layout

Canvas renders as a tab in the container area (30/70 split with chat panel).

```
┌──────────────────────────────────────────────────────────┐
│ Container Tab Bar: [Canvas] [Wireframe ×]                │
├────┬─────────────────────────────────────────────────────┤
│ T  │                                                     │
│ O  │         Infinite Canvas (tldraw)                    │
│ O  │                                                     │
│ L  │   ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│ B  │   │Approach A│  │Approach B│  │Approach C│        │
│ A  │   └──────────┘  └──────────┘  └──────────┘        │
│ R  │                                                     │
│    │        ┌──────────┐  ┌──────────────┐              │
│    │        │Wireframe │  │ Hi-fi  ★Live │              │
│    │        └──────────┘  └──────────────┘              │
│    │                                                     │
├────┴─────────────────────────────────────────────────────┤
│ [+] [📎]  What would you like to change or create? [↑]  │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Canvas Toolbar

Vertical bar on the left edge of the canvas:

| Tool | Icon | Behavior |
|------|------|----------|
| Select | ↗ cursor | Click to select items. Default mode. |
| Marquee | ⬚ dotted rect | Drag to select multiple items |
| Draw | ✏ pen | Freeform annotation on canvas items |
| Pan | ✋ hand | Click-drag to pan around canvas |

- One tool active at a time
- Active tool: `bg-white/[0.08]` highlight
- Bar styling: `bg-[#161616]`, `border-white/[0.08]`, rounded

---

## 4. Canvas Items

Each kept output appears as a custom tldraw shape.

### 4.1 Output card shape

- Size: ~240×160px default, user-resizable
- Background: `bg-[#1a1a1a]`, `border-white/[0.08]`, rounded-lg
- Header: output type icon + label (e.g. "Wireframe") + title
- Body: summary text, truncated
- Corner badge: fidelity indicator (see section 8)

### 4.2 HTML preview shape

For built prototypes:
- Renders HTML content in a sandboxed container
- Mini browser frame around it
- "Live" badge with green pulsing dot

---

## 5. Selection Behavior

### 5.1 Single item selected

Floating action bar appears above the item:
```
[Create variations] [Build this] [Copy to Figma] [...]
```

- "Create variations" → AI prompt, generates variants auto-arranged horizontally
- "Build this" → AI prompt, creates hi-fi version with upgraded badge
- "Copy to Figma" → direct action (export mock)

### 5.2 Multiple items selected

Minimal floating prompt box near selection bounding box:
```
┌───────────────────────────────────────┐
│ What would you like to change or      │
│ create?                          [↑]  │
└───────────────────────────────────────┘
```

- No chips shown (user sees visual selection)
- Typing sends message to active chat
- AI response creates new canvas item

### 5.3 Selection ↔ Chat sync

- Canvas selection updates `useShelfStore.selectedOutputIds`
- Selected items appear as context chips in chat panel input
- Deselecting on canvas removes chips
- Same state, two views

---

## 6. Annotation System

### 6.1 Drawing

In draw mode, users draw freeform strokes/shapes over canvas items using tldraw's built-in tools (pen, highlighter, arrow, text).

Annotations persist on canvas until user removes them.

### 6.2 Inline annotation prompt

When user completes an annotation, a small prompt bubble appears near it:
```
[Describe your change...]
```

User types → sends prompt to chat with annotated item + annotation as context.

Multiple annotations can be selected together for a combined prompt.

---

## 7. Canvas Prompt Bar

Always visible at the bottom of the canvas:

```
[+] [📎]  What would you like to change or create?  [↑]
```

- Same behavior as chat input — sends message in active chat
- Selected canvas items reflected as chips in **chat panel input** (not here)
- AI response appears in chat AND as new item on canvas
- Minimal: input + send + attach

---

## 8. Fidelity Indicators

All fidelities coexist on canvas. Visual distinction via corner badges:

| Fidelity | Badge | Color |
|----------|-------|-------|
| Exploration | none | — |
| Wireframe | "Wireframe" | blue/10 |
| Hi-fi | "Hi-fi" | teal/10 |
| Built | "Live ●" | green/10 + pulse |

---

## 9. Variation Auto-Layout

When AI creates multiple variations:
- Items auto-arranged **horizontally** in a row
- ~32px gap between items
- Positioned near source item or center of viewport
- User can freely rearrange after

---

## 10. Canvas ↔ Focused Tab Transition

- **Double-click** canvas item → opens as focused tab in container
- Tab bar shows: `[Canvas] [Item Name ×]`
- **Click "Canvas" tab** → zooms out from focused item back to canvas position
- Animated with framer-motion

---

## 11. Data Flow

```
Canvas Selection → useShelfStore.selectedOutputIds → Chat Input chips
Canvas Prompt Bar → Chat message → AI response → New canvas item
Annotation + prompt → Chat message → AI response → Updated canvas item
Single item "Build this" → Chat prompt → Hi-fi output on canvas
Single item "Create variations" → Chat prompt → 3 variants auto-arranged
Double-click → Focused tab (zoom in)
Canvas tab click → Back to canvas (zoom out)
```

---

## 12. Technology

- **tldraw** — infinite canvas engine (custom shapes, drawing, selection, pan/zoom)
- **framer-motion** — zoom in/out transitions
- **zustand** — canvas state (tool mode, annotations)
