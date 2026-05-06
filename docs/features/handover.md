# Handover — design doc

## Why
The dev's job in 2026 isn't translating a spec to code — it's giving Claude/Cursor enough context to *build* the spec. Today, design→dev handoff is fragmented across BRDs, Figma files, prototype links, decision docs, and Slack threads. Figred owns all of that context already (Space description, instructions, attached docs, connected knowledge, captured states). A handover lets the designer publish a single versioned, URL-addressable artifact that bundles everything — readable by humans, copy-pasteable into AI.

The metaphor: **Linear Issue × Notion Page × AI-ready bundle.** Versioned. Inline-commentable. Sharable as a URL.

## Product decisions (confirmed)
- **Plugin:** own plugin, screenshot-based converter (Phase 2). Not future-proof for fidelity, intentionally so.
- **"Copy for AI":** first-class, small button in the handover header.
- **Comments:** inline (per section), Notion-style.
- **Scope:** Space-level Handover. Many handovers per Space. At publish, designer curates which captured states + context items + knowledge entries go in.
- **Capture UX:** explicit ("📌 Capture state" button), shown in a "States to publish" tray.

## Phasing
| Phase | Scope | Sitting |
|---|---|---|
| **0** | Capture UX | this |
| **1** | Docs portal + publish flow + "Copy for AI" | this |
| **2** | Figma plugin + paired-code transport | next |
| **3** | Inline comments, version chains, push-to-knowledge, real persistence | later |

## Phase 0 — Capture UX

**Hosts**
- Each output card (`output-card.tsx`) gets a hover-revealed capture button.
- The shell-app preview panel (`shell-app-preview-panel.tsx`) gets one for live previews.

**Mechanism**
- `html2canvas` snapshots the target element to a PNG data URL.
- Designer names the state inline ("Empty cart"), it lands in `useHandoverStore.capturedStates`.

**Tray**
- New "States to publish" section inside `context-shelf-sidebar.tsx`. Shows thumbnails + names; designer can rename or remove. Persists via Zustand's `persist` (localStorage).

## Phase 1 — Docs portal

**Top bar** gains a "Publish handover" button (workspace-top-bar.tsx).

**Publish modal** (shadcn Dialog):
- Title (auto-drafted), summary
- States to include — checkbox grid with thumbnails (default all checked)
- Documents to include — Space `contextItems` (default all checked)
- Knowledge to include — items from Space's `connectedKnowledge` (default unchecked)
- Open questions — markdown textarea
- Publish v{n} primary action

**On publish:**
1. Bundle snapshot (state dataUrls + included content) → POST `/api/handover/publish`
2. Server stores in an in-memory map keyed by 8-char slug, returns `{ slug }`
3. Client copies `${origin}/h/${slug}` to clipboard, navigates to that page

**Public page** at `/h/[slug]`:
- Header: title, version, status, "Copy for AI" button (sticky)
- Sections: Summary · Prototype states (thumbnail grid) · Figma section (Phase 2 placeholder) · Specs & decisions · Knowledge · Open questions · Comments (Phase 3 placeholder)
- App shell bypassed — minimal chrome only

**"Copy for AI"** uses a server-derived markdown digest built from the stored Handover (so the button works regardless of client state).

## Limitations of this iteration (acknowledged)
- Server store is in-memory — URLs reset on dev-server restart (Phase 3 swaps in real persistence).
- No comments yet (Phase 3).
- No Figma section yet — placeholder card with "wired in Phase 2" copy.
- No version supersede chain UI (Phase 3).
- Single-user demo; no auth on handover URLs.

## System prompt for "Copy for AI" digest
The server-side digest builder constructs:
```
# {handover.title}
**Space:** {space.name}
**Version:** v{handover.version} · Published {handover.publishedAt}

## Summary
{handover.summary}

## Captured states
- {state.name}{group ? ` (${group})` : ""}
…

## Specs & decisions
### {contextItem.name}
{contextItem.content}
…

## Connected knowledge
### {knowledgeItem.name}
{knowledgeItem.content}
…

## Open questions
{handover.openQuestions}

---
View full handover at {origin}/h/{slug}
```
This is what lands in the dev's clipboard. Pasted into Claude Code or Cursor, it gives the AI everything needed to start building.
