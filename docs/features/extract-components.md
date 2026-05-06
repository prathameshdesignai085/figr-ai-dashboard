# Extract Components → Raise PR

## Why
Designers iterate on full prototypes in Figred. The whole prototype is rarely useful to the dev team — too much mock data, one-off code, low reuse value. But individual components inside the prototype often *are* reusable. This feature has AI surface those reusable bits, lets the designer curate them, and ships them as a PR-style artifact the dev can pick up.

The strategic positioning: **designer becomes a contributor to the design system.** Not "ship the prototype" — ship the patterns. AI does the curation.

## Decisions confirmed
- **Trigger:** slash command `/extract-components` only (consistent with `/figma-describe`, `/prd`, etc.)
- **Loader:** multi-step progressive simulation in the chat message — feels like AI is doing real work (no instant snap)
- **Review surface:** opens as a **tab in the canvas container** (not a modal). User clicks the "Review" button on the chat message → tab opens
- **Raise PR:** mints a public `/pr/[slug]` URL (mirrors `/h/[slug]` handover page) — opens in a new tab
- **Skipped for v1:** browse-past-PRs index, real GitHub integration, comments/reviewers (placeholder only). Focus on a single high-quality flow.

---

## User flow (5 steps)

1. **Designer types `/extract-components` in the Space chat → Enter.**
2. **Chat assistant message streams a progressive loader** (~6 seconds total):
   - `🔍 Reading captured prototype states…` (1.5s)
   - `🧩 Identifying recurring patterns across screens…` (2s)
   - `📊 Scoring component quality and reusability…` (1.5s)
   - `✨ Found N candidates ready for review.` (instant final)
   - Below the streamed text: a **"Review N components →"** primary button.
3. **Click Review** → opens a new tab in the canvas container titled e.g. *"Components · Checkout Redesign"*. Chat stays put.
4. **Review tab UI** — list of candidate component cards:
   - Per card: thumbnail, name (editable), 1-line description, AI reasoning, quality score (0–100), "from screens" trace, expand-to-see-code.
   - Each has an include/skip toggle. Default include if quality ≥ 70.
   - Sticky footer: "Selected M of N · Raise PR".
5. **Click Raise PR** → small modal to confirm title + description (auto-drafted, editable) → publish → mints `/pr/[slug]` → opens in new tab. Toast in workspace confirms.

The published PR page mirrors the handover page architecture:
- Header: title, status pill (`draft / open / merged`), author, date
- "Copy for AI" button (sticky in header — same pattern as handover)
- Description (rendered markdown)
- Components list — each as an expandable card showing thumbnail + code (syntax-highlighted via existing `prism-react-renderer`) + props definition
- Reviewers + Comments sections shown as Phase-2 placeholders

---

## Architecture

### Mock-only extraction (client-side)
For the demo we don't actually run AI extraction. The slash command triggers a client-side runner that:
1. Pushes a new assistant message into the chat with `streaming: true`
2. Appends the 4 progress lines on a timer (matching the timings above)
3. Reads a hand-authored mock candidate set for the active Space (or a fallback set)
4. Stores the result in a new `useExtractStore` keyed by an `extractionId`
5. Marks the message with `extractionId` so the chat-message component renders the Review button

No new API route for the *extraction* itself — fully client-side mock. Same trick as the Figma-link path on `/figma-describe`.

### Server-side PR storage
The PR page DOES need server storage so the URL is shareable across tabs. Same shape as handovers:
- `app/src/lib/pr-server-store.ts` — in-memory `Map<slug, ComponentPR>` via globalThis
- `POST /api/pr/raise` — accepts `{ spaceId, title, description, components: [...], publishedBy }` → returns `{ slug }`
- `GET /api/pr/[slug]` — returns the PR + a server-derived `aiDigest` for the Copy-for-AI button

### New tab type
- `ContainerTab.type` union gains `"component-extract"`
- `ContainerTab` gains `extractionId?: string`
- `useWorkspaceStore.openTab({ id: "extract-<id>", type: "component-extract", title, extractionId, content: "" })`
- `container-area.tsx` renders `<ExtractComponentsPanel extractionId={tab.extractionId} />` for that tab type

### Mock data shape

```ts
type ExtractedComponent = {
  id: string;
  name: string;                 // "PrimaryButton"
  description: string;          // 1-line, designer-friendly
  reasoning: string;            // 2-3 lines, AI-flavored
  qualityScore: number;         // 0..100
  sourceStateNames: string[];   // ["Cart with items", "Order review"]
  usageCount: number;           // 6
  defaultInclude: boolean;      // true if quality ≥ 70
  // Visual + code:
  previewBg: string;            // CSS bg gradient/color for the card thumbnail
  previewIcon: string;          // emoji or short label rendered in the thumbnail
  code: { language: "tsx"; content: string };
  propsDefinition: string;      // TypeScript-ish snippet
};
```

Hand-authored set for `space-1` (Checkout Redesign):
1. **PrimaryButton** (q=92, used 5×) — Cart, Address, Payment, Review CTAs
2. **WalletButtonRow** (q=88, used 1×) — Apple/Google/PayPal triple
3. **OrderSummary** (q=85, used 2×) — sticky right-rail / collapsed top
4. **CartItem** (q=82, used 3×) — product row with qty + price
5. **StepIndicator** (q=80, used 3×) — "Step 1 of 3" eyebrow
6. **FormField** (q=78, used 6×) — label + input pair
7. **EmptyStateIllustration** (q=64, used 1×) — quality just below threshold, default-skipped
8. **StatusBar** (q=22, used 6×) — phone chrome, marked low-quality with reasoning "this is mock OS chrome, not a real product component"

Other Spaces get a generic fallback set (3 simple candidates) so the command never produces zero results.

---

## File-by-file

### New (10)
- `app/src/lib/extract-mock-data.ts` — hand-authored candidate sets per Space + fallback
- `app/src/stores/useExtractStore.ts` — client store: `extractions: Record<id, Extraction>` with selection state per candidate
- `app/src/lib/extract-runner.ts` — `runExtraction(spaceId, chatId): Promise<extractionId>` — does the timed loader + populates store
- `app/src/components/workspace/extract-components-panel.tsx` — the review tab UI (cards, selection, footer with Raise PR)
- `app/src/components/workspace/extract-review-button.tsx` — button rendered in chat-message footer when `message.extractionId` is set
- `app/src/components/workspace/extract-raise-pr-modal.tsx` — small confirm modal (title + description preview)
- `app/src/lib/pr-server-store.ts` — server in-memory PR store + helpers
- `app/src/lib/pr-ai-digest.ts` — builds the "Copy for AI" markdown for a PR
- `app/src/app/api/pr/raise/route.ts` — POST raise PR
- `app/src/app/api/pr/[slug]/route.ts` — GET PR
- `app/src/app/pr/[slug]/page.tsx` — public PR page
- `app/src/app/pr/[slug]/layout.tsx` — minimal chrome (matches `/h/[slug]/layout.tsx`)

### Edited (6)
- `app/src/lib/slash-commands.ts` — add `/extract-components` entry
- `app/src/types/index.ts` —
  - `Message` gains `extractionId?: string`
  - `ContainerTab.type` union gains `"component-extract"`; gains `extractionId?: string`
  - New types: `ExtractedComponent`, `Extraction`, `ComponentPR`
- `app/src/components/workspace/chat-panel.tsx` — `handleSend` recognizes `/extract-components` and calls the runner
- `app/src/components/workspace/chat-message.tsx` — when `message.extractionId` is set and not streaming, render `<ExtractReviewButton extractionId={...} />`
- `app/src/components/workspace/container-area.tsx` — render `<ExtractComponentsPanel>` for tab type `"component-extract"`
- `app/src/components/layout/app-shell.tsx` — bypass app-shell for `/pr/*` routes (matching the existing `/h/*` bypass)

---

## Visual + interaction notes

### Loader styling
- Each progress line streams in character-by-character, cumulative
- After each line completes, a brief 600ms pause before the next starts (gives the eye time to track)
- Use a small spinner (Lucide `Loader2`) prefixed to the current line until it's done; flip to checkmark when next line starts

### Review tab card
- 320×140 thumbnail using `previewBg` gradient + centered `previewIcon`
- Right column: name (12px medium), description (11px muted), quality bar (small horizontal indicator with gradient red→amber→green by score), "From: Cart with items, Order review" trace
- Bottom of card: "Show code ▼" button → expands to show the code block (prism-rendered) + props block
- Top-right of card: include/skip toggle (checkbox)

### Sticky footer in review tab
- "Selected M of N components" left, "Raise PR" primary button right
- Disabled when M = 0

### Raise PR modal
- Title input (auto-drafted: "Add M components from <Space name> v<n>")
- Description textarea (auto-drafted summary of selected components)
- Cancel / Raise PR buttons

### PR page
- Same dark theme as handover page
- Same layout primitives reused: `Section`, `CopyForAIButton`, `DownloadHandoverButton` (rename or duplicate? — duplicate as `DownloadPrButton` for clarity, no shared filename mismatch)
- Each component card on the PR page: thumbnail + name + expand for code (prism)
- Status pill in header (draft/open/merged), interactive in v1 (single-user demo, just toggle)

---

## Verification

1. Open Space "Checkout Redesign" → chat → type `/extract-components` → Enter.
2. Watch the chat assistant message stream the 4 progress lines over ~6 seconds. Final line ends with the count.
3. **Review** button appears at the bottom of the message. Click it.
4. New tab opens in the canvas container titled "Components · Checkout Redesign". 8 cards visible. Default selections look right (low-quality ones default-unchecked).
5. Toggle a few include/skip selections. Expand one card to see code + props.
6. Click **Raise PR** → modal shows title + description pre-filled. Confirm.
7. New tab opens at `/pr/[slug]` with title, status pill, "Copy for AI" button, expandable component cards with code.
8. Refresh the PR page in incognito → same data renders (server-side persistence works).
9. Type-check clean. Smoke test `/api/pr/raise` and `/api/pr/[slug]` via curl.

---

## Out of scope (v1)
- Real AI extraction (entirely client-side mock)
- Past-PRs index / browse history
- Real GitHub integration / OAuth
- Reviewers + comments on PR page (placeholders only)
- Component dedup against existing design system (mock list is hand-curated)

## Future expansion (v2+)
- Comments + status workflow on PR pages (mirror handover Phase 3)
- Connect to repo via GitHub App, propose real PR diffs
- AI quality scoring tied to actual code analysis (LSP / AST)
- Dedup against connected design-system knowledge — propose updates to existing components rather than new ones
- Push selected components to product knowledge as a "design system contributions" stream
