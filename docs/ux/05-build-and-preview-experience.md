# 05 — Build & Preview Experience

*The transition from prototype to real project — and the IDE-like environment for viewing, navigating, inspecting, and editing built outputs.*

---

## 1. Purpose

"Build" is the moment a prototype becomes a real, multi-file project. Before building, an output is a single content blob (HTML, markdown, or text). After building, it's a scaffolded codebase with components, pages, styles, routes, and dependencies — a project that could be exported, extended, or shipped.

The preview experience gives users an IDE-like environment to interact with their built project: see the live running app, browse the file tree, read and edit code in tabs, navigate between routes, and inspect individual elements visually.

**Key principle:** Users should feel like they're inside a real development environment, but without the complexity. No terminal, no build commands, no config files to manage. Just the app, the code, and the tools to understand and modify both.

---

## 2. Build Trigger & Flow

### 2.1 How build is triggered

Build is triggered from the canvas via the **"Build this"** button in the selection action bar (single item selected, screen/wireframe/component type).

```
Canvas item selected:
┌─────────────────────────────────────────────────────────┐
│ [Create variations]  [Build this]  [Full screen]  [Copy]│
└─────────────────────────────────────────────────────────┘
                          ↓ click
                    Build process
```

### 2.2 What happens on build

1. A new `Output` is created with fidelity `"built"`
2. A `BuildProject` is generated — a multi-file project structure with:
   - Framework scaffolding (package.json, config files)
   - Page/route files
   - Component files
   - Style files
   - Entry point
3. The built output appears on the canvas as an HTML preview shape (mini browser chrome, green "Live" badge with pulse)
4. A **Preview** tab automatically opens in the container area

### 2.3 Build project structure

A built project contains:

| Element | Example | Purpose |
|---------|---------|---------|
| Entry file | `src/App.tsx` | Main app component |
| Page files | `src/pages/Home.tsx`, `src/pages/Checkout.tsx` | Route-specific views |
| Components | `src/components/Header.tsx`, `Card.tsx` | Reusable UI components |
| Styles | `src/styles/globals.css` | Global and component styles |
| Config | `package.json`, `tsconfig.json` | Project configuration |
| Routes | `/`, `/checkout`, `/settings` | Navigable URL paths |

---

## 3. Container Tab Bar — Updated Behavior

When a build project exists, the tab bar gains new capabilities:

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Canvas]  [Preview]  [App.tsx ×]  [Header.tsx ×]              [📁]  │
└──────────────────────────────────────────────────────────────────────┘
  pinned     pinned      file tab     file tab              file tree
  (exists)   (new)       (closeable)  (closeable)           toggle
```

### Tab types in the bar

| Tab | Closeable | When it appears |
|-----|-----------|-----------------|
| Canvas | No (pinned) | Toggled from top bar, as before |
| Preview | No (pinned while build is active) | Auto-opens when a project is built |
| Code file tabs | Yes (×) | When user clicks a file in file tree |
| Other tabs (document, output) | Yes (×) | As before — clicking outputs, docs |

### File tree toggle

- **Position:** Rightmost side of the tab bar row, right-aligned
- **Icon:** `FolderTree` or `PanelRight` (lucide)
- **Behavior:** Click toggles the file tree panel (slides in from the left edge of the container area)
- **Style:** `text-foreground/25`, hover `text-foreground/40`, active (tree open) `text-foreground/70 bg-white/[0.06]`

---

## 4. Preview Layout

When the **Preview** tab is active, the container area renders the full preview experience:

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Canvas]  [Preview]  [App.tsx ×]  [Header.tsx ×]              [📁]  │
├──────────────────────────────────────────────────────────────────────┤
│ 🖥 / checkout ▾                              [🔍 inspect] [↗] [↻]  │
├──────────┬───────────────────────────────────────────┬───────────────┤
│          │                                           │               │
│  File    │                                           │   Inspect     │
│  Tree    │         LIVE APP PREVIEW                  │   Panel       │
│  (opt.)  │         (sandboxed iframe)                │   (opt.)      │
│          │                                           │               │
│  src/    │                                           │   CardHeader  │
│   app/   │                                           │   Font: 16   │
│   comp/  │                                           │   Color: #fff │
│   styles/│                                           │   Bg: #ff00.. │
│          │                                           │               │
│          │                                           │  [Discard]    │
│          │                                           │  [Save]       │
├──────────┴───────────────────────────────────────────┴───────────────┤
```

### Panel visibility

| Panel | Default | Trigger | Width |
|-------|---------|---------|-------|
| File tree | Hidden | 📁 icon in tab bar | ~220px |
| Live preview | Visible | Always shown in Preview tab | Flex (remaining) |
| Inspect panel | Hidden | 🔍 button in URL bar | ~260px |

All three panels can be visible simultaneously. The live preview flexes to fill remaining space.

---

## 5. URL Slug Bar

Sits directly below the tab bar, only visible when the **Preview** tab is active.

```
┌──────────────────────────────────────────────────────────────────┐
│  [🖥 📱 📲]    / checkout ▾                   [🔍]  [↗]  [↻]   │
└──────────────────────────────────────────────────────────────────┘
   device        route path                    inspect  ext  refresh
   selector      + dropdown                    toggle
```

### 5.1 Device selector

Compact button group (same pattern as existing prototype-browser):

| Device | Icon | Preview width |
|--------|------|---------------|
| Desktop | `Monitor` | 100% |
| Tablet | `Tablet` | 768px |
| Mobile | `Smartphone` | 375px |

Active device: `bg-white/[0.08] text-foreground/70`. Inactive: `text-foreground/25`.

### 5.2 Route path

- Displays the current active route (e.g., `/`, `/checkout`, `/checkout/confirm`)
- **Clickable** — opens a dropdown listing all available routes in the project
- Each dropdown item: `[path]  [label]` (e.g., `/checkout  Checkout Page`)
- Selecting a route navigates the preview iframe to that route's content
- Styled as a pill/rounded input: `border-white/[0.08] bg-white/[0.02]`

### 5.3 Action buttons (right side)

| Button | Icon | Behavior |
|--------|------|----------|
| Inspect | `MousePointer` or `Crosshair` | Toggles inspect mode + inspect panel |
| External | `ExternalLink` | Opens preview in a new browser tab |
| Refresh | `RotateCw` | Reloads the preview iframe |

All buttons: `text-foreground/25`, hover `text-foreground/40`. Inspect button when active: `text-primary bg-primary/10`.

---

## 6. Live Preview

The main content area when Preview tab is active.

### 6.1 Rendering

- Content rendered in a **sandboxed iframe** (`sandbox="allow-scripts"`)
- The iframe loads the built project's entry file content
- Route changes swap the iframe's `srcDoc` to the corresponding page file's content
- Device selector changes the iframe container width (centered, with subtle border)

### 6.2 Inspect mode interaction

When inspect mode is toggled on:

1. A script is injected into the iframe that:
   - Highlights elements on hover (blue outline, `2px solid #695be8`)
   - On click, captures computed styles and posts them to the parent via `postMessage`
2. The parent window receives the message and updates the inspect panel
3. Clicking another element updates the panel
4. Toggling inspect off removes highlights and clears selection

### 6.3 Device preview

When device is changed, the iframe container adjusts:

```
Desktop:                    Tablet:              Mobile:
┌──────────────────────┐    ┌──────────────┐     ┌────────┐
│                      │    │              │     │        │
│    100% width        │    │   768px      │     │ 375px  │
│                      │    │   centered   │     │centered│
│                      │    │              │     │        │
└──────────────────────┘    └──────────────┘     └────────┘
```

Non-desktop widths: centered in container with `bg-white/[0.01]` background, subtle rounded border.

---

## 7. File Tree

A VS Code-style file explorer panel that slides in from the left side of the preview area.

### 7.1 Appearance

```
┌──────────┐
│ FIGRED   │  ← project name header
├──────────┤
│ ▾ src/   │
│   ▾ app/ │
│     📄 layout.tsx
│     📄 page.tsx
│   ▸ components/
│   ▸ styles/
│ 📄 package.json
│ 📄 tsconfig.json
└──────────┘
```

### 7.2 Behavior

- **Folders**: click to expand/collapse. Icons: `FolderOpen` (expanded), `Folder` (collapsed)
- **Files**: click to open as a **new tab** in the container tab bar
  - If the file is already open as a tab, clicking switches to that tab
  - Tab title shows the filename (e.g., `Header.tsx`)
- **Active file**: highlighted with `bg-white/[0.06]` + `text-foreground/80`
- **Indentation**: 16px per depth level
- **File icons**: based on extension
  - `.tsx`, `.ts` → `FileCode` (lucide)
  - `.css` → `FileType` or palette icon
  - `.json` → `FileJson`
  - Other → `File`

### 7.3 Styling

- Background: `bg-[#161616]`
- Border right: `border-white/[0.08]`
- Width: ~220px, not resizable
- Text: `text-xs text-foreground/50`, active `text-foreground/80`
- Scrollable when content overflows

---

## 8. Code Tabs & Code View

When a file is opened from the file tree, it appears as a tab in the container tab bar and renders a syntax-highlighted code view.

### 8.1 Code tab in tab bar

```
[Canvas]  [Preview]  [App.tsx ×]  [Header.tsx ×]  [globals.css ×]    [📁]
                      ^^^^^^^^     ^^^^^^^^^^^^     ^^^^^^^^^^^^^
                      active        inactive         inactive
```

- Active code tab: `border-b-2 border-primary text-foreground/80`
- Inactive: `text-foreground/35`
- Close button (×): appears on hover, closes the tab
- Clicking a code tab shows the code view for that file (replaces preview in the content area)

### 8.2 Code view content

```
┌──────────────────────────────────────────────────────────────────┐
│  1 │ import React from "react";                                  │
│  2 │ import { Card } from "@/components/Card";                   │
│  3 │                                                             │
│  4 │ export default function CheckoutPage() {                    │
│  5 │   return (                                                  │
│  6 │     <div className="container mx-auto p-6">                │
│  7 │       <h1>Checkout</h1>                                     │
│  8 │       <Card />                                              │
│  9 │     </div>                                                  │
│ 10 │   );                                                        │
│ 11 │ }                                                           │
└──────────────────────────────────────────────────────────────────┘
```

- **Line numbers**: left gutter, `text-foreground/15`, right-aligned, `pr-4`
- **Syntax highlighting** (token colors):
  - Keywords (`import`, `export`, `const`, `return`, `function`): `#c792ea` (purple)
  - Strings: `#c3e88d` (green)
  - Comments: `text-foreground/25` (dim)
  - JSX tags: `#f07178` (coral)
  - Numbers: `#f78c6c` (orange)
  - Types/interfaces: `#ffcb6b` (yellow)
  - Default text: `text-foreground/60`
- **Font**: `'SF Mono', Monaco, 'Fira Code', 'Fira Mono', monospace`, 13px
- **Background**: `bg-[#1a1a1a]`
- **Read-only** by default
- **Scrollable** both vertically and horizontally

### 8.3 File tree visibility with code tabs

When viewing a code file tab, the file tree (if open) remains visible on the left. The code view fills the remaining space. This mirrors VS Code behavior — file tree is persistent across all views (preview and code).

---

## 9. Inspect Panel

A right sidebar within the preview area that shows properties of a selected element. Only visible when inspect mode is active and an element is selected.

### 9.1 Layout

```
┌──────────────────────────────────────────────┐
│ [⬡] CardHeader                    [🗑] [×]  │  ← component name + actions
├──────────────────────────────────────────────┤
│                                              │
│ Text                                         │
│ ┌──────────────────────────────────────────┐ │
│ │ Font size                                │ │
│ │ ┌──────────────────────────────────────┐ │ │
│ │ │ 16                                   │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ │ Font weight                              │ │
│ │ ┌──────────────────────────────────────┐ │ │
│ │ │ Regular                          ▾  │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ │ Alignment                                │ │
│ │ [≡ left] [≡ center] [≡ right] [≡ just]  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Appearance                                   │
│ ┌──────────────────────────────────────────┐ │
│ │ Text        [●] #ffffff                  │ │
│ │ Background  [●] #ff00bb0d               │ │
│ │ Opacity     [  ] 100        %            │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ Border                                       │
│ ┌──────────────────────────────────────────┐ │
│ │ Border color  [●] #ff00bb1a         [☐]  │ │
│ │ Border width                        [☐]  │ │
│ │ ┌─────┐ ┌─────┐                         │ │
│ │ │  0  │ │  0  │   (top, right)           │ │
│ │ ├─────┤ ├─────┤                          │ │
│ │ │  0  │ │  1  │   (bottom, left)         │ │
│ │ └─────┘ └─────┘                          │ │
│ │ Border radius               [☐]          │ │
│ │ ┌──────────────────────────────────────┐ │ │
│ │ │ 8                                    │ │ │
│ │ └──────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────┐  ┌────────────────────┐    │
│ │   Discard    │  │   Save changes     │    │
│ └──────────────┘  └────────────────────┘    │
└──────────────────────────────────────────────┘
```

### 9.2 Sections

| Section | Fields | Input type |
|---------|--------|------------|
| Header | Component name, delete button, close button | Display + actions |
| Text | Font size, font weight, alignment | Number input, dropdown, button group |
| Appearance | Text color, background color, opacity | Color picker, number input |
| Border | Border color, border width (4 sides), border radius | Color picker, number inputs |
| Actions | Discard, Save changes | Buttons |

### 9.3 Behavior

- **Opening**: Toggle inspect button in URL bar → inspect mode on → click element in preview → panel slides in from right
- **Closing**: Click × in panel header, or toggle inspect button off
- **Editing**: Modify any value → change reflects live in the preview iframe
- **Save changes**: Persists the style changes to the project file
- **Discard**: Reverts to original values
- **Width**: ~260px, fixed
- **Styling**: `bg-[#1a1a1a]`, `border-l border-white/[0.08]`

### 9.4 Color inputs

- Color swatch (circle, shows current color) + hex value text input
- Clicking the swatch opens a color picker popover
- Hex input is directly editable

---

## 10. Combine Flow

Combining multiple outputs uses the **existing multi-select floating prompt** on the canvas. No additional UI is required.

### Flow

1. User selects 2+ outputs on canvas (shift-click or marquee)
2. The floating prompt box appears below the selection (already implemented)
3. User describes what to combine: *"Take the header from V1, the card layout from V2, and the color scheme from V3"*
4. AI creates a new merged output on the canvas
5. The combined output can be further iterated on, or built via "Build this"

### Multi-select action bar addition

When 2+ items are selected, the action bar above the selection shows:

```
[Combine]  [Create variations]  [Copy]
```

- **Combine** (new) — `Merge` icon (lucide). Sends the selected outputs + user prompt to AI for merging
- The floating prompt below doubles as the combine instruction input

---

## 11. Build Project Data Model

### Types

```typescript
interface ProjectFile {
  id: string;
  path: string;           // "src/components/Header.tsx"
  name: string;           // "Header.tsx"
  content: string;        // file source code
  language: string;       // "tsx" | "css" | "json" | "html"
}

interface ProjectRoute {
  path: string;           // "/checkout"
  label: string;          // "Checkout"
  filePath: string;       // "src/pages/Checkout.tsx"
}

interface BuildProject {
  id: string;
  outputId: string;       // links back to the Output
  name: string;           // "checkout-flow"
  framework: string;      // "react" | "nextjs"
  files: ProjectFile[];
  routes: ProjectRoute[];
  dependencies: Record<string, string>;
  entryFile: string;      // "src/App.tsx"
}

interface InspectedElement {
  componentName: string;
  tagName: string;
  styles: {
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    color?: string;
    backgroundColor?: string;
    opacity?: string;
    borderColor?: string;
    borderWidth?: string;  // "0 0 1 0" (top right bottom left)
    borderRadius?: string;
  };
}
```

### State management

New Zustand store: `useBuildStore`

| State | Type | Purpose |
|-------|------|---------|
| `projects` | `BuildProject[]` | All built projects |
| `activeRoute` | `Record<string, string>` | Per-project active route path |
| `inspectMode` | `Record<string, boolean>` | Per-project inspect toggle |
| `inspectedElement` | `Record<string, InspectedElement \| null>` | Per-project selected element |
| `fileTreeOpen` | `boolean` | Whether file tree panel is visible |
| `collapsedFolders` | `Record<string, Set<string>>` | Per-project collapsed folder paths |

---

## 12. Data Flow

```
Canvas "Build this" → Create Output (fidelity: built)
                    → Generate BuildProject (files, routes, deps)
                    → Store in useBuildStore
                    → Open Preview tab in container
                    → Render live app in iframe

Preview tab active:
  URL bar route change → Update activeRoute → Swap iframe srcDoc
  Device selector → Change iframe container width
  Inspect toggle → Enable element highlighting in iframe
  Element click → postMessage to parent → Update inspectedElement → Show panel
  Inspect edit → postMessage to iframe → Live style update
  Save changes → Update ProjectFile content in store

File tree:
  📁 toggle → Show/hide file tree panel
  File click → Open as tab in container tab bar (type: "code")
  Already-open file → Switch to existing tab

Code tab active:
  Render syntax-highlighted code for active file
  File tree remains visible (if open)

Combine (canvas):
  Select 2+ items → Action bar shows [Combine]
  User writes prompt in floating input → AI merges → New output on canvas
```

---

## 13. Technology

- **Sandboxed iframe** — preview rendering with `srcDoc` and `postMessage` for inspect communication
- **tldraw** — canvas engine (existing)
- **Zustand** — `useBuildStore` for project state, IDE state
- **Framer Motion** — panel slide animations (file tree, inspect panel)
- **Lightweight syntax highlighting** — regex-based token coloring or `prism-react-renderer`
- **Lucide icons** — file type icons, toolbar icons
