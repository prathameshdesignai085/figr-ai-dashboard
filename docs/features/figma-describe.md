# `/figma-describe` — first slash command (mock)

## Context

When designers paste a Figma link into Claude or Cursor today, they still have to *verbalize the screen* — "there's a hero with a CTA, two columns below, pricing cards." That manual translation is where intent leaks. Figred is different: it already owns the **product context** (Space description, instructions, attached docs, connected knowledge). So a describer running inside Figred can fuse a screen image with that context and produce a prompt-grade description an engineer could rebuild from — without the designer having to dictate it.

This is the **describer-as-middleware** pattern. `/figma-describe` is the first concrete instance, and the mock that sells the larger Figma In-Bot story to stakeholders.

## What we're shipping (this iteration)

- Designer pastes a **Figma link** OR drops/pastes/uploads a **screen image** into the Spaces chat composer.
- The pasted thing appears as a **pill chip** in the composer (Figma icon + filename for links; existing screenshot chip for images).
- Typing `/` opens a **slash command popover** anchored above the composer; commands filter as the user types.
- v1 has one entry: `/figma-describe`.
- On send, the chat panel detects the command and runs the describer:
  - **Image path** → real Gemini call (server-side route handler) → describer text streams into a chat assistant message.
  - **Figma link path** → canned mock describer output (no Figma MCP wired yet) — labelled honestly so stakeholders know it's a mock.
- The architecture is built around a **command registry**, so adding `/wireframe`, `/copy-doc`, etc. later is a one-row change.

**Out of scope for this iteration:** real Figma MCP integration, downstream "build" agent, Out-Bot back to Figma.

## User flow (happy path, image)

1. User is in a Space → Chat panel.
2. Drops a screenshot of a screen into the chat composer. A screenshot chip appears.
3. Types `/`. Popover opens above the input listing `/figma-describe`.
4. Hits Enter (or clicks). Composer textarea now reads `/figma-describe ` (trailing space). User may add a hint or just press Enter.
5. Send fires. The user message renders normally with the chip attached.
6. An assistant message appears immediately below with a "Describing screen using this Space's context…" header, then streams the describer output token-by-token.
7. Done. Output is a structured, concise description (Purpose, Layout, Components, Copy, Visual cues, Open questions).

## User flow (mock path, Figma link)

1. User pastes a Figma URL into the textarea (e.g. `https://www.figma.com/file/AbCdEf/Pricing?node-id=12-345`).
2. URL is detected, removed from the textarea, and rendered as a Figma pill chip showing parsed file name + frame name (best-effort from URL).
3. Same `/figma-describe` flow as above.
4. On send, server route returns a **mocked** describer payload (template populated with Space name + chip metadata + 1–2 actual context-item names so it looks intelligent). Streamed back the same way for visual parity.
5. A small badge or footnote on the assistant message indicates "Mock output — Figma MCP not yet connected." Honest, but doesn't undercut the demo.

## Architecture

### Composer changes

- **`app/src/components/chat/chat-composer.tsx`** — gain three behaviors:
  1. **Figma URL detection** on paste & input change: regex `^https?://(?:www\.)?figma\.com/(file|design|proto)/[^/]+/[^?]*` → strip from textarea, push a `figma-link` chip via a new `onAddFigmaLink` callback prop.
  2. **Image input**: `onPaste` (capture `image/*` clipboard items), `onDrop` (drag-drop), and a hidden `<input type="file">` triggered by the existing "+ Add contexts" button. Each path produces a base64 data URL → `onAddImage` callback prop.
  3. **Slash menu**: when textarea content matches `^/(\w*)$`, render the `SlashCommandMenu` component above the textarea, anchored to the input. Keyboard nav (↑↓, Enter, Esc), click-select. Selecting a command rewrites textarea to `/figma-describe `.

- **`app/src/components/workspace/chat-input.tsx`** — pass through the new callbacks and wire to chat-panel handlers.

### New types

- **`app/src/types/index.ts`** — extend `ContextChip` kind to include `"figma-link"` and `"image"` (or reuse `"screenshot"` for images — going with `"image"` for clarity since "screenshot" today specifically means a marquee-captured canvas region). Add fields `url`, `fileName`, `frameName` (optional) for `figma-link` chips.

### Slash command registry

- **New file: `app/src/lib/slash-commands.ts`**
  ```ts
  export type SlashCommand = {
    id: string;
    trigger: string;          // "figma-describe" — what the user types
    label: string;            // "/figma-describe"
    description: string;      // shown in popover
    icon: LucideIcon;
    requiresVisualContext?: boolean;  // true → grayed if no image/figma chip
  };
  export const SLASH_COMMANDS: SlashCommand[] = [
    { id: "figma-describe", trigger: "figma-describe", label: "/figma-describe",
      description: "Describe a screen using this Space's product context",
      icon: Eye, requiresVisualContext: true },
  ];
  ```

### Slash command menu

- **New file: `app/src/components/chat/slash-command-menu.tsx`**
  - Floating popover (absolute positioned, anchored above composer).
  - Filtered list of `SLASH_COMMANDS` by current query.
  - Keyboard nav + click select. Style consistent with existing dark surfaces (`#181818`, 16px radius, white/[0.06] borders).

### Server route — Gemini call

- **New file: `app/src/app/api/describe/route.ts`** (Next.js App Router POST handler)
  - Reads `GEMINI_API_KEY` from `process.env` (server-only — never reaches the browser).
  - Accepts JSON: `{ mode: "image" | "figma-link", imageBase64?, imageMimeType?, figmaUrl?, fileName?, frameName?, productContext: string, userHint?: string }`.
  - **Image mode:** calls Gemini `streamGenerateContent` REST endpoint with `?alt=sse`; multipart payload = system prompt + product context + user hint + inline image. Streams the SSE response back to the client unchanged.
  - **Figma link mode:** generates a mock response from a template (interpolating fileName, frameName, and Space context). Streams it character-by-character with small `await` delays so the UX matches the real call.
  - Model: `gemini-2.5-flash` (fast, multimodal, cheap).
  - No SDK install needed — direct `fetch` to the REST endpoint keeps deps clean.

### Client-side describer fetcher

- **New file: `app/src/lib/describer-client.ts`**
  - `streamDescribe(payload, onChunk)` — POSTs to `/api/describe`, reads the SSE stream, calls `onChunk(text)` on each token.

### Product-context builder

- **New file: `app/src/lib/space-context.ts`**
  - `buildSpaceContext(spaceId): string` — assembles markdown from:
    - Space name, description, instructions
    - `contextItems`: name + content (when present)
    - Connected knowledge items: name + content (when present)
  - Trims to ~6k chars to keep prompt compact.

### Chat panel integration

- **`app/src/components/workspace/chat-panel.tsx`** — `handleSend` learns:
  - If `content.startsWith("/figma-describe")` AND there's an image or figma-link chip in context:
    1. Push the user message (existing behavior) with the chip attached.
    2. Insert an assistant message placeholder with `streaming: true`.
    3. Build product context via `buildSpaceContext(activeSpaceId)`.
    4. Call `streamDescribe(...)`, appending each chunk into the placeholder.
    5. Mark `streaming: false` on completion.
  - If invalid (no visual context), show inline error in chat.

- **`app/src/types/index.ts`** — `ChatMessage` gets `streaming?: boolean` and possibly `mock?: boolean` (to power the "Mock output" badge for the Figma-link path).

- **`app/src/components/workspace/chat-message.tsx`** — render streaming cursor while `streaming === true`; render small "Mock output" badge when `mock === true`.

### Environment & gitignore

- **`/.gitignore`** — add `app/.env*.local` and `app/.env`.
- **New file: `app/.env.local`** (gitignored) — `GEMINI_API_KEY=…` and `GEMINI_MODEL=gemini-2.5-flash`.

## System prompt (verbatim)

This is the prompt used in the API route's image mode. Concise; the output it produces is also concise.

```
You describe product UI screens for engineers to rebuild.

First read the product context below — note product, audience, voice, components, and terminology. The screen belongs to *this* product, not a generic one.

Then describe the screen, using product language wherever possible:

1. **Purpose** — one sentence in product terms.
2. **Layout** — top-to-bottom regions and what each does.
3. **Components & states** — named components, variants, visible states.
4. **Copy** — exact strings for headings, labels, CTAs.
5. **Visual cues** — color/spacing/elevation only when they carry meaning.
6. **Open questions** — ambiguities a designer should resolve.

Rules:
- Bullets over paragraphs. No filler.
- Use the product's own terms when they apply; avoid generic UI jargon.
- Don't speculate beyond visible cues.
- If the image isn't a UI screen, say so in one line and stop.

---
PRODUCT CONTEXT:
{productContext}
---
```

## Mock template (Figma link path)

```
> Mock output — Figma MCP isn't connected yet. This is what a real describer call would produce, populated from your Space's context.

**Reading** {fileName} · {frameName} against this Space's context — {spaceName}, with attached: {firstTwoContextItemNames}.

1. **Purpose** — [one-line description inferred from frame name + space description]
2. **Layout** — Header / hero / primary action region / supporting content / footer.
3. **Components & states** — primary CTA, form group, [domain-specific component from instructions if present].
4. **Copy** — *(not visible without Figma MCP read)*
5. **Visual cues** — *(deferred to real read)*
6. **Open questions** — Confirm component variants and copy with the source frame once Figma MCP is wired.
```

## File-by-file changes

**New files**
- `app/src/lib/slash-commands.ts` — registry
- `app/src/lib/space-context.ts` — product context builder
- `app/src/lib/describer-client.ts` — SSE consumer
- `app/src/components/chat/slash-command-menu.tsx` — popover
- `app/src/app/api/describe/route.ts` — Gemini route handler
- `app/.env.local` — API key (gitignored)

**Edited files**
- `.gitignore` — ignore `app/.env*`
- `app/src/types/index.ts` — `ContextChip` kinds + `ChatMessage` flags
- `app/src/components/chat/chat-composer.tsx` — paste/drop/upload + slash menu trigger
- `app/src/components/workspace/chat-input.tsx` — wire callbacks through
- `app/src/components/workspace/chat-panel.tsx` — handle `/figma-describe` on send
- `app/src/components/workspace/chat-message.tsx` — streaming cursor + mock badge

## Verification (end-to-end test plan)

1. `cd app && npm run dev` — Next.js boots, no type errors.
2. Open a Space (e.g. "Checkout Redesign") → chat panel.
3. **Image path:**
   - Drop a screenshot of any UI into the composer → image chip appears.
   - Type `/` → popover opens with `/figma-describe`. Filters as we type `fi`.
   - Press Enter → textarea becomes `/figma-describe `. Press Enter again.
   - Confirm: user message appears with chip; assistant message appears below and streams a structured description that **references the Space's actual context** (e.g. "checkout flow", "cart abandonment").
4. **Figma link path:**
   - Paste `https://www.figma.com/design/AbC123/Pricing?node-id=12-345` → URL disappears from textarea, Figma pill chip appears with "Pricing" / frame guess.
   - Run `/figma-describe` same as above.
   - Confirm: assistant message streams the mock template, with Space name and context-item names interpolated in. "Mock output" badge visible.
5. **Edge cases:**
   - `/figma-describe` with no chip → inline error: "Attach a screen image or Figma link first."
   - Slash menu closes on Esc, on outside click, on selection.
   - Removing a chip works (existing `onRemoveContextChip`).

## Out of scope (explicit)

- Real Figma MCP integration (Out-Bot side).
- Downstream build agent producing JSX.
- Persisting describer output as a Space document or pushing to canvas.
- Auth / per-user API keys (single shared key for the demo).
- Cost/rate-limit handling.

---

Once approved, I'll execute top-to-bottom: gitignore → env → types → registry → menu → composer → route handler → context builder → client → chat-panel wiring → chat-message tweak → manual test.
