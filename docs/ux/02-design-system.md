# Design System & Visual Direction

*Figred AI — UX Specification*

---

## Design Philosophy

Inspired by **Cursor** (AI-native, dark, focused workspace) and **Figma** (spatial, precise, design-tool confidence). The visual language should feel:

- **Dark and focused** — dark mode first, minimal visual noise
- **Comfortable density** — generous spacing, readable text, breathing room
- **Precise but warm** — not cold/clinical like an IDE, not playful like Notion. Professional creative tool energy.
- **Quiet UI, loud outputs** — the chrome fades back, user-generated and AI-generated content is the star

---

## Color System

Extracted from existing Figr codebase. Two themes defined (dark mode is primary).

### Dark Mode (Primary)

| Token | Value | Usage |
|-------|-------|-------|
| **--background** | `#282826` | App background, main surfaces |
| **--foreground** | `#fff` | Primary text |
| **--card** | `#212121` | Card backgrounds, elevated surfaces |
| **--card-foreground** | `#fff` | Text on cards |
| **--popover** | `#444` | Dropdowns, tooltips, popovers |
| **--border** | `#252536` | Default borders |
| **--border-subtle** | `#1c1c2d` | Subtle dividers, section separators |
| **--input** | `#333` | Input field backgrounds |
| **--muted** | `#757575` | Muted/disabled text |
| **--muted-foreground** | `#fff` | Text on muted backgrounds |

### Accent Colors

| Token | Value | Usage |
|-------|-------|-------|
| **--primary** | `#695be8` | Primary buttons, active states, brand |
| **--primary-hover** | `#695be8cc` | Primary hover state |
| **--primary-foreground** | `#fff` | Text on primary buttons |
| **--accent** | `#6366f1` | Accent highlights, links, interactive elements |
| **--accent-light** | `#818cf8` | Lighter accent for hover/focus states |
| **--accent-subtle** | `rgba(99,102,241,0.12)` | Subtle accent backgrounds (selected states, badges) |
| **--accent-glow** | `rgba(99,102,241,0.25)` | Focus rings, glow effects |
| **--ring** | `#695be8` | Focus ring color |

### Secondary & Functional Colors

| Token | Value | Usage |
|-------|-------|-------|
| **--secondary** | `#545454` | Secondary buttons, less emphasis |
| **--secondary-foreground** | `#ffffff99` | Text on secondary (60% white) |
| **--secondary-hover** | `#545454cc` | Secondary hover |
| **--destructive** | `#60332a` | Destructive action backgrounds (dark) |
| **--destructive-foreground** | `#fca397` | Destructive text (warm red) |

### Semantic Colors (from Radix palette used in codebase)

| Color | Hex | Usage |
|-------|-----|-------|
| **Blue** | `#2781f6` | Links, informational, connected states |
| **Teal** | `#0d9b8a` / `#12a594` | Success, positive, active integrations |
| **Ruby/Red** | `#e54666` / `#dc3b5d` | Errors, destructive, warnings |
| **Amber** | `#ffba18` / `#ffc53d` | Caution, pending states |
| **Indigo** | `#6366f1` | Primary accent (same as --accent) |

### Slate Scale (text hierarchy in dark mode)

| Token | Hex | Usage |
|-------|-----|-------|
| **slate-12** | `#fff` / near-white | Primary text, headings |
| **slate-11** | ~`#b0b4ba` | Secondary text, descriptions |
| **slate-10** | ~`#8b8d98` | Tertiary text, timestamps |
| **slate-9** | ~`#80838d` | Placeholder text |
| **slate-6** | ~`#55556a` | Borders, dividers |
| **slate-3** | ~`#252536` | Subtle backgrounds, hover states |
| **slate-1** | ~`#14141e` | Deepest background layer |

### Light Mode (Secondary — for later)

| Token | Value |
|-------|-------|
| --background | `#f4f3f1` |
| --foreground | `#1e1919` |
| --card | `#faf9f8` |
| --border | `#e6e6e6` |
| --primary | `#8e82ff` |
| --accent | `#eeebff` |
| --secondary | `#d2cec6` |
| --input | `#e6e6e6` |

---

## Typography

### Font Family

**Inter** — used throughout the entire application. Variable weight (100–900).

```css
font-family: 'Inter', sans-serif;
```

### Type Scale

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| **Display** | 36px / 2.25rem | 600 | Hero text, empty state headings |
| **H1** | 24px / 1.5rem | 600 | Page titles, major section heads |
| **H2** | 20px / 1.25rem | 600 | Section headings, card titles |
| **H3** | 18px / 1.125rem | 600 | Subsection headings |
| **Body** | 14px / 0.875rem | 400 | Default text, chat messages, descriptions |
| **Body Small** | 13px | 400 | Secondary info, metadata, timestamps |
| **Caption** | 12px / 0.75rem | 400 | Labels, badges, hints |

### Weight Usage

| Weight | Value | When to use |
|--------|-------|-------------|
| Regular | 400 | Body text, descriptions, chat messages |
| Medium | 500 | Buttons, navigation items, interactive labels |
| Semibold | 600 | Headings, card titles, emphasis |

---

## Spacing

Base spacing unit: **4px** (`--spacing: 0.25rem`)

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-0.5` | 2px | Tight gaps (icon-to-text inline) |
| `spacing-1` | 4px | Minimal padding (badges, chips) |
| `spacing-1.5` | 6px | Small padding (compact buttons) |
| `spacing-2` | 8px | Default gap, input padding-block |
| `spacing-2.5` | 10px | Button padding-block |
| `spacing-3` | 12px | Card inner padding, section gaps |
| `spacing-4` | 16px | Section padding, comfortable gaps |
| `spacing-5` | 20px | Large section spacing |

### Comfortable Density Guidelines

- Left panel width: `16rem` (256px) — `--sidebar-width: 16rem`
- Left panel collapsed: `3rem` (48px) — `--sidebar-width-icon: 3rem`
- Chat message padding: 16px horizontal, 12px vertical
- Card padding: 16px
- Section gaps: 20–24px
- Button min-height: 36px (comfortable touch target)

---

## Border Radius

Base radius: **10px** (`--radius: 0.625rem`)

| Token | Value | Usage |
|-------|-------|-------|
| `radius-xs` | 2px | Tiny elements (inline badges) |
| `radius-sm` | 4px | Small elements (tags, chips) |
| `radius-md` | 8px (`radius - 2px`) | Inputs, small cards, buttons |
| `radius` | 10px | Default cards, panels, containers |
| `radius-lg` | 10px (same as base) | Large cards, modals |
| `radius-2xl` | 16px | Large containers, feature cards |
| `radius-3xl` | 24px | Hero elements, prominent cards |
| `radius-full` | 9999px | Pills, avatars, circular buttons |

### Border Style

- Default borders: 1px solid `--border` (#252536 dark)
- Subtle dividers: 1px solid `--border-subtle` (#1c1c2d dark)
- Input borders: 1px solid `--input` (#333 dark)
- Focus: 2px ring using `--ring` (#695be8) with `--accent-glow` spread
- Cards: often borderless (relying on background color difference) OR 1px `--border`

---

## Buttons

### Variants

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| **Primary** | `--primary` (#695be8) | `--primary-foreground` (#fff) | none | Main CTAs: "Create space", "Send", "Keep" |
| **Secondary** | `--secondary` (#545454) | `--secondary-foreground` (#fff 60%) | none | Secondary actions: "Cancel", "Back" |
| **Ghost** | transparent | `--foreground` | none | Toolbar items, icon buttons, nav items |
| **Outline** | transparent | `--foreground` | 1px `--border` | Alternative secondary: filter pills, toggles |
| **Destructive** | `--destructive` (#60332a) | `--destructive-foreground` (#fca397) | none | Delete, remove actions |

### States

| State | Treatment |
|-------|-----------|
| **Default** | Base styles |
| **Hover** | Opacity shift (cc suffix = 80% opacity on bg), slight brightness |
| **Disabled** | 50% opacity on both bg and text (4d suffix) |
| **Focus** | `--ring` outline with `--accent-glow` shadow |
| **Active/Pressed** | Slight scale down or darker shade |

### Sizes

For comfortable density:

| Size | Padding | Font | Min Height | Usage |
|------|---------|------|------------|-------|
| **sm** | 6px 12px | 13px / 500 | 28px | Compact actions, toolbar |
| **default** | 10px 16px | 14px / 500 | 36px | Standard buttons |
| **lg** | 12px 24px | 14px / 500 | 40px | Prominent CTAs |
| **icon** | 8px | — | 32px | Icon-only buttons (square) |

---

## Icons

**Lucide React** — consistent line icon set used throughout.

### Common Icons in the Product

| Icon | Context |
|------|---------|
| `chevron-down` | Dropdowns, collapsibles |
| `chevron-right` | Navigation, breadcrumbs |
| `plus` | Create new (chat, space, context) |
| `x` | Close, dismiss |
| `check` | Confirmation, selection |
| `folders` / `folder` | Spaces, projects |
| `message-square` | Chat |
| `workflow` | Flows, stages |
| `git-branch` | Knowledge lifecycle, versions |
| `brain` | AI, brainstorming |
| `pencil` / `pen-tool` | Edit, design mode |
| `sparkles` | AI-generated content |
| `clock` | Recents, timestamps |
| `arrow-right` | Navigation, proceed |
| `text-search` | Search, explore |
| `upload` | File upload |
| `external-link` | External links, integrations |
| `info` | Tooltips, help |
| `trash` | Delete |
| `users` / `users-round` | Collaborators |
| `swatch-book` | Design system |
| `zap` | Quick actions, integrations |
| `maximize` | Expand, fullscreen, canvas |

### Icon Sizing

| Context | Size | Stroke |
|---------|------|--------|
| Navigation items | 16px | 1.5px |
| Buttons (with text) | 16px | 1.5px |
| Button (icon-only) | 18px | 1.5px |
| Section headers | 18px | 1.5px |
| Empty states | 24–32px | 1.5px |

---

## Surfaces & Elevation

Dark mode uses layered backgrounds instead of shadows for elevation.

| Layer | Background | Usage |
|-------|-----------|-------|
| **Base** | `#08080d` or `#14141e` | App background behind everything |
| **Surface 1** | `#1a1a27` | Left panel, sidebars |
| **Surface 2** | `#212121` | Cards, chat area, main content |
| **Surface 3** | `#282826` | Elevated cards, modals |
| **Surface 4** | `#333` / `#3e3e3e` | Input fields, hover states |
| **Overlay** | `rgba(0,0,0,0.3–0.4)` | Modal backdrops, dimming |

### When to use borders vs. background difference

- **Borders**: Between same-level surfaces that need visual separation (e.g., left panel border with main area)
- **Background difference**: For elevation (e.g., card floating on page)
- **Both**: For strong emphasis (e.g., selected card with border + different bg)

---

## Component Patterns

### Outline vs. Filled

| Pattern | Treatment | Examples |
|---------|-----------|---------|
| **Filled (solid bg)** | Background color, no border | Primary buttons, active nav items, badges |
| **Outlined** | Transparent bg, 1px border | Filter pills, inactive toggles, input fields |
| **Ghost** | No bg, no border | Toolbar buttons, icon actions, nav items on hover |
| **Subtle** | Tinted transparent bg (accent-subtle) | Selected states, active tabs, hover cards |

### Cards

- Background: `--card` (#212121)
- Border: optional, 1px `--border` when needed for definition
- Radius: `--radius` (10px)
- Padding: 16px (comfortable)
- Hover: slight background lighten or border appear

### Input Fields

- Background: `--input` (#333)
- Border: 1px `--border`, changes to `--ring` on focus
- Radius: `--radius-md` (8px)
- Padding: 8px 12px (comfortable)
- Placeholder: `--slate-9` (~#80838d)
- Focus: ring with `--accent-glow` spread

### Chat Input (special)

- Larger than standard input
- Background: `--input` (#333)
- Padding: 12px 16px
- Radius: `--radius` (10px) or larger
- Contains: context chips above, action buttons (mic, send) inside right side
- "+ Add contexts" link inside input area

---

## Quick Action Cards

Seen on the home/welcome screen (from Figr reference):

- Grid layout (4 across)
- Background: `--card` with subtle border
- Radius: `--radius` (10px)
- Contain: colored icon (top-left) + label
- Icon colors: use semantic colors (red for record, purple for Figma, blue for capture, green for upload)
- Hover: border color changes to `--accent-subtle` or slight bg shift

---

## Animation Principles

Using Framer Motion. Keep animations subtle and fast.

| Animation | Duration | Easing | Notes |
|-----------|----------|--------|-------|
| Hover transitions | 150ms | ease-out | Background, border color changes |
| Panel slide (shelf) | 200ms | ease-out | Shelf open/close |
| View toggle (chat/canvas) | 250ms | ease-in-out | Crossfade or slide |
| Keep action | 300ms | spring (damping 20) | Scale pulse on card + fly indicator |
| Modal open | 200ms | ease-out | Fade + slight scale up |
| Context chip appear | 150ms | ease-out | Fade + slide up |

---

## Summary: Visual Identity

- **Dark, warm, focused** — not cold gray, slightly warm undertones (#282826 not #2a2a2e)
- **Indigo/purple accent** — #695be8 primary, #6366f1 accent. Creative, modern, differentiated.
- **Inter font** — clean, professional, excellent readability at small sizes
- **Lucide icons** — consistent 16px line icons, 1.5px stroke
- **10px base radius** — rounded but not bubbly. Professional, modern.
- **Layered backgrounds** for elevation, borders for separation
- **Subtle animations** — fast, purposeful, never gratuitous
