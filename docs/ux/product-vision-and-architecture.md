# Product Vision & Architecture Document

**AI-native product development environment**
For designers, product managers, and builders

*Confidential — Working Draft | April 2026*

---

## 1. The problem

### 1.1 Tool fragmentation in the AI era

The AI wave has fractured product development workflows. Every role in the product lifecycle — PMs, designers, engineers, solo builders — now hops across 8–12 tools to go from idea to shipped feature. A designer who used to live in Figma now brainstorms in Claude, prototypes in v0 or Bolt, refines in Figma, then hands off to code. A PM who lived in Notion now bounces between Claude for PRDs, Miro for flows, Figma for reviews, and Linear for tracking.

AI made each individual step faster, but it multiplied the number of steps. The total elapsed time from idea to output has not meaningfully improved — and context is destroyed at every tool boundary.

### 1.2 The "tool hop tax"

Every time work crosses a tool boundary, context is lost. The PM's insight captured in Claude doesn't carry forward to the designer's Figma file. The designer's intent doesn't survive the handoff to code. When code doesn't match design, or metrics reveal the spec was wrong, you re-enter the same fragmented pipeline from scratch.

The biggest friction isn't within roles — it's between them. And the loop-back cost is brutal.

### 1.3 The linear chat problem

Beyond tool fragmentation, there's a deeper UX problem with how humans interact with AI today. Current AI chat is a single linear thread — you go down one path, and if you want to explore a different direction, you either lose context or start over. If you edit an earlier message, the old path disappears.

But creative and product work is fundamentally non-linear. You need to diverge, explore multiple approaches simultaneously, compare them, and converge on the best one. The same person with the same context will reach completely different outputs depending on how the conversation unfolds — yet there's no way to explore multiple paths at once.

The output you get from AI is entirely path-dependent, and current tools offer no way to manage that.

### 1.4 What we're building

A unified, AI-native product development environment where designers, PMs, and solo builders can go from idea to shipped product in one place. AI is a core collaborator throughout — not a tool you visit, but a partner that understands your product, your project, and exactly where you are in the process.

The tool solves three nested problems:

1. **Context ingestion** — How each role brings their world into the tool (customer data, design systems, analytics, existing code).
2. **Divergent exploration** — How users explore multiple approaches within a single workspace, compare them, and combine the best parts.
3. **Stage progression** — How work evolves from brainstorm to prototype to hi-fi to code, with context carrying forward at every step.

---

## 2. Target users

### 2.1 Primary users

- **Product designers** — Need to brainstorm, explore visual directions, prototype, and push toward production-quality output. Currently fragment across Claude, Figma, v0/Bolt, and handoff tools.
- **Product managers** — Need to research, define requirements, validate with prototypes, and track through delivery. Currently fragment across Claude/ChatGPT, Notion, Miro, Figma (for reviews), and Linear/Jira.
- **Solo builders / new-age makers** — Non-engineers who want to take an idea end-to-end to a working product. They don't fit neatly into a single role — they do everything. They need the simplest possible path from idea to output.

### 2.2 Collaboration model

While each role has different context needs, the experience should feel the same for everyone. The tool is role-agnostic in its core UX. Collaboration is native — multiple stakeholders can work on a single project because context lives in one place rather than scattered across tools. It also serves as the source of truth for the initiative.

---

## 3. Core UX: Chat, Shelf, Canvas

The user-facing experience is built on three primitives. These are the only concepts a user needs to understand.

### 3.1 Chat

The chat is where users talk to the AI and generate outputs. It's the familiar linear conversation — a single input box, sequential messages, AI responds with text and visual outputs.

The chat is the primary workspace for most users. It preserves the simplicity that people love about talking to AI — low cognitive load, one thread, natural flow.

Key behaviors:

- The AI produces outputs inline — approaches, wireframes, screens, flows, copy, logic.
- Each output has a "Keep" action. One tap sends it to the shelf.
- The chat continues linearly regardless of what's on the shelf.
- Users can attach shelf items to any message as context (appears as chips above the message input). This doesn't branch or reset the chat — it just enriches that specific message.
- Multiple chats can exist within a single project. Users can start a new chat anytime for focused work, or keep one long chat for continuity.

### 3.2 Shelf

The shelf is a persistent side panel visible alongside the chat. It collects every output the user chooses to keep. Think of it as a pinboard — a curated collection of things the user liked from across all their explorations.

Key behaviors:

- Appears as a vertical panel on the right side of the screen.
- Every AI-generated output (approach, variation, screen, flow, text block) can be "kept" with one tap. It moves to the shelf.
- Shelf items have checkboxes for selection. Users check items, then hit "Use selected as context" to attach them to their next prompt.
- The shelf is the bridge between exploration and synthesis — you explore in chat, collect on the shelf, combine via selection.
- The shelf is project-scoped. All chats within a project share the same shelf.

### 3.3 Canvas

The canvas is the spatial view of the project. It shows all kept outputs arranged visually — brainstorm ideas, wireframes, prototype screens, combined outputs — everything the user has generated and kept, across all chats.

Key behaviors:

- The canvas is project-level, not stage-level. It shows everything regardless of what stage or chat produced it. Brainstorm-level outputs and prototype-level outputs coexist, because that's how real product work happens.
- Same items as the shelf, but laid out spatially. Users can drag, group, annotate, and arrange.
- Users can select items on the canvas and use them as context for the next chat prompt — same as selecting from the shelf.
- The canvas is where comparison and synthesis happen visually. Users see all their explorations at once and can identify what to combine.
- Toggle between chat and canvas views at any time. They are two lenses on the same underlying project, not separate workspaces.

### 3.4 The relationship between chat, shelf, and canvas

Chat produces. Shelf collects. Canvas composes.

- **Chat → Shelf:** User keeps outputs they like. One tap.
- **Shelf → Chat:** User selects shelf items as context for the next prompt. Items appear as chips in the input area.
- **Canvas → Chat:** User selects items spatially on the canvas and continues in chat with those as context.
- **Chat → Canvas:** Every kept output automatically appears on the canvas.

The toggle between chat view and canvas view is the product's signature interaction. Chat for depth (sequential brainstorming, flow state). Canvas for breadth (compare outputs, see the whole picture, combine pieces).

---

## 4. The Figma pages analogy

The structure maps directly to how designers already work in Figma.

In Figma, a designer creates a page called "Checkout Exploration." Inside it, they make dozens of frames — wild ideas, refined versions, abandoned halfway attempts. It's messy, divergent, creative. Nobody expects it to be clean. Then when they've found the direction, they create a new page called "Checkout — Final" and build the polished version there, pulling from the best of their explorations.

In this product:

- **The exploration phase** = chatting with AI, generating lots of outputs, keeping the ones you like to the shelf, seeing them all on the canvas. Messy, divergent, creative.
- **The build phase** = selecting the outputs you're happy with, starting a focused chat (or continuing the existing one), and building on top of the chosen direction with AI as collaborator.

The difference from Figma: in Figma, the designer manually recreates everything in the final page. Here, the AI builds on the promoted context. The transition from exploration to building is a selection, not a reconstruction.

---

## 5. Context architecture

### 5.1 Three layers of context

At any point in a conversation, the AI has access to three layers of context:

**Layer 1: Product knowledge (global, optional)**
The canonical truth about the user's entire product — design system, shipped features, tech architecture, user personas, brand guidelines. This is the source of truth that persists across all projects.

Product knowledge is optional. Users can choose to connect it when starting a project, or work without it entirely. A solo builder experimenting with a side idea might start blank. A designer working on an existing product feature would connect the product knowledge base.

Analogy: the main branch in git. The production database.

**Layer 2: Project knowledge (project-scoped, optional)**
Context specific to this initiative — the checkout PRD, cart abandonment analytics, competitor audit, user research. Users add documents and resources when starting a project, similar to how Claude/ChatGPT projects let you add docs and then create multiple chats within that project.

Project knowledge is also optional. Users can choose to work without it. They can add or remove documents at any time during the project.

Project knowledge is shared across all collaborators on that project. A PM adds the PRD, a designer adds visual references, and both benefit from each other's context.

**Layer 3: Per-message context (ephemeral, user-selected)**
Shelf items the user attaches to a specific message. These are the context chips that appear above the chat input. They only apply to that one message — the next message can have different items or none at all.

### 5.2 What the AI knows at each message

The AI's full context for any given response is:

- Product knowledge (if connected) — always in the background
- Project knowledge (if added) — always in the background
- Full chat history — automatic, everything said before in this chat
- Attached shelf items — only for this specific message, user-selected

The user can see what the AI knows via a persistent context panel. This solves the biggest trust problem with AI tools: not knowing what it's considering.

### 5.3 Context visibility

The UI shows product knowledge and project knowledge as persistent banners at the top of the workspace. Product knowledge shows a connection status (active/disconnected) and a summary of what it contains. Project knowledge shows added documents with options to add more or edit.

This transparency ensures users always know what's informing the AI's responses.

---

## 6. Knowledge lifecycle: the commit model

### 6.1 How knowledge flows

The flow of knowledge follows a deliberate, user-controlled cycle:

1. **Product knowledge exists** as the global source of truth (or doesn't — it's optional).
2. **User starts a project**, optionally connecting product knowledge and adding project-specific documents.
3. **Work happens** in chat/canvas. Outputs are generated, kept, compared, combined.
4. **User saves to project knowledge** at any point — "this navigation pattern is finalized, save it." This is an explicit action, not automatic. The user might finalize the nav pattern early while still exploring the content layout.
5. **When the project completes**, the user can push selected project knowledge up to product knowledge — "update our product source of truth with the new checkout flow."

### 6.2 The git analogy

This mirrors how git works:

- **Product knowledge = main branch.** The stable, committed truth. Only changes through explicit user action.
- **Project = feature branch.** A workspace for an initiative. Pulls from main at creation, pushes back when complete.
- **Saving to project knowledge = committing.** Making something official within the project scope.
- **Pushing to product knowledge = merging to main.** Making project outcomes part of the global truth.

### 6.3 Key principle: never automatic

Knowledge never auto-updates. Only users decide what's final. This is critical because:

- Only users know if an output is truly finalized or still in flux.
- Premature commits create false truths that mislead future projects.
- The explicit action forces intentionality — "yes, this is how our product works now."

---

## 7. Exploration and variations

### 7.1 How users explore different directions

In the chat, exploration happens naturally. The user asks for approaches, the AI generates them as output cards. The user keeps the ones they like, goes deeper on one, asks for variations, pivots to a new direction — all in the same linear chat.

The key insight: users don't need to think about "threads" or "branches." They just chat, keep what they like, and the shelf/canvas accumulates their exploration naturally.

When the user wants to combine outputs from different explorations, they select items from the shelf, attach them as context, and prompt. The AI synthesizes. The new output goes back to the shelf and canvas. No thread management, no hierarchy to navigate.

### 7.2 How variations work

When the AI generates multiple options (e.g., "here are 3 layout variations for the wizard"), each variation is a discrete, selectable object — not just paragraphs in a response. Each has a "Keep" action. Each can be selected independently as context for future prompts.

In the chat, variations appear as cards or thumbnails inline. On the canvas, they appear as individual nodes that can be arranged, compared, and grouped.

### 7.3 Combining outputs across explorations

The most powerful interaction: the user selects a navigation pattern from one exploration, a layout from another, and a copy direction from a third. They attach all three as context and prompt: "Combine these into one cohesive design."

The AI generates a synthesis. This is the moment that replaces what designers do manually today — copying between Figma frames, reconstructing from scattered references. Here, it's: select, prompt, done.

### 7.4 The system tracks what the user doesn't need to

Under the hood, the system tracks lineage — which outputs were combined, what context was active when each output was generated, which explorations led to the final direction. The user never sees this complexity unless they specifically ask for it (e.g., a "journey" or "history" view that shows how the project evolved).

This is essential for collaboration: when a new team member joins, they can trace how the current direction was reached without needing to read through hundreds of chat messages.

---

## 8. Stages: fluid, not rigid

### 8.1 Stages are modes, not gates

Work naturally moves through phases — brainstorming, wireframing, prototyping, building. But these aren't separate tabs or workspaces. They're modes the work flows through organically.

A user might be brainstorming and say "actually, wireframe this one real quick." That's not a stage switch — it's the work evolving. The output happens to be higher fidelity. On the canvas, brainstorm outputs and wireframe outputs coexist because that's how real product work happens.

### 8.2 The build transition

The meaningful transition is when the user decides: "I'm done exploring. I want to build this." At that point, they select the outputs they're happy with and the system offers choices:

- **Build this further** — Continue in the current chat with full exploration history as context. Richest context, most continuity.
- **Start a new focused chat** — Clean workspace, carrying only the selected outputs and project knowledge as context. Less noise, more focus.
- **Create a design system from this** — Extract patterns, tokens, and components and store them in project knowledge for consistency.
- **Generate code** — Move toward a deployable output.

### 8.3 No mandatory stage progression

Users can skip stages, revisit earlier work, or work across fidelity levels simultaneously. A solo builder might go straight from a rough brainstorm to code. A designer might oscillate between wireframes and hi-fi for hours. The tool accommodates all patterns without forcing a linear pipeline.

---

## 9. Collaboration

### 9.1 Shared project workspace

When multiple stakeholders work on a project, they share:

- **Project knowledge** — PM adds the PRD, designer adds visual references, both benefit.
- **The shelf** — Outputs kept by anyone are visible to everyone. A PM's brainstorm output can be selected by the designer as context for their prototype.
- **The canvas** — All outputs from all collaborators, arranged spatially. The canvas becomes the shared view of "where are we."

### 9.2 Individual chats within shared context

Each collaborator can have their own chats within the project. A PM brainstorms requirements in one chat. A designer explores visual directions in another. Both chats reference the same project knowledge. Both contribute outputs to the same shelf and canvas.

This means collaboration happens through shared artifacts and context, not through real-time co-editing of a single conversation. Each person works in their own flow, but the outputs converge on the shared canvas.

---

## 10. Key design decisions

### 10.1 Decided

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chat vs. canvas | Two views of the same project, toggle between them | Users need both depth (chat) and breadth (canvas). Neither alone is sufficient. |
| Stage structure | Fluid modes, not rigid tabs | Real product work doesn't follow a linear pipeline. Forcing it creates friction. |
| Product knowledge | Optional, user-connected | Not everyone works on an existing product. Solo builders need a blank-slate option. |
| Project knowledge | Optional, user-added | Same reasoning. Some projects need heavy context, others start from scratch. |
| Knowledge updates | Always explicit, never automatic | Only users know what's finalized. Auto-updates create false truths. |
| Shelf scope | Project-level, shared across chats | Outputs from any chat should be composable with outputs from any other chat in the project. |
| Canvas scope | Project-level, all fidelities | Separating canvas by stage fragments the exploration view. Everything coexists. |
| Variation model | Discrete selectable objects, not paragraphs | Users need to select, compare, and recombine individual variations as first-class items. |
| Exploration tracking | System tracks lineage silently, user sees simplicity | The complexity is real but should be invisible unless explicitly requested. |
| Context attachment | Per-message, via shelf selection | Keeps the chat clean. Users control exactly what context each prompt carries. |

### 10.2 Open questions

| Question | Tension | Notes |
|----------|---------|-------|
| How granular should shelf selection be? | Whole output vs. section vs. single component. More granularity = more power but more complexity. | Start with whole-output selection. Add sub-selection later if users need it. |
| Should the context tray persist across messages? | Persistent = build up context over time. Per-message = clean but requires reassembly. | Leaning toward per-message with easy re-selection. |
| How does the AI signal which context it used? | If you attach 5 items and it uses 3, should you know? | Yes — trust requires transparency. Show which context influenced each response. |
| How does canvas handle very large projects? | Hundreds of outputs on one canvas could overwhelm. | Need grouping, filtering, search. Canvas should support zoom levels — overview vs. detail. |
| How does the tool handle real-time collaboration? | Shared shelf/canvas is async. Do we need real-time co-cursors? | Start async. Real-time adds massive complexity for unclear value in early versions. |
| Export and ecosystem integration | Teams still use Figma, GitHub, Linear. How does work leave this tool? | Critical for adoption. Export to code (GitHub), export designs (Figma), sync tasks (Linear). |
| Mobile experience | Chat works on mobile, canvas doesn't. | Chat-first on mobile, canvas on desktop/tablet. |

---

## 11. What this replaces

| Current workflow | In this product |
|-----------------|-----------------|
| Brainstorm in Claude/ChatGPT, lose context when moving to design tool | Brainstorm in chat, keep outputs to shelf, build on them directly |
| Prototype in v0/Bolt, then recreate in Figma | Prototype in the same workspace, iterate with AI, no recreation needed |
| PM writes PRD in Notion, designer interprets separately | PM and designer share project knowledge, AI maintains consistency |
| Designer explores in Figma pages, manually reconstructs the winner | Explore in chat, keep to shelf, select and combine, AI builds the synthesis |
| Handoff from design to code via screenshots and specs | Output evolves from wireframe to prototype to code in the same workspace |
| Product documentation gets stale in Confluence/Notion | Product knowledge stays current through the commit model — projects write back to the source of truth |

---

## 12. Success criteria

The product is working if:

1. A solo builder can go from idea to working prototype without leaving the tool.
2. A PM and designer can collaborate on a feature without any context being lost at handoff points.
3. Users explore 3+ different directions for a problem and combine the best parts without manual reconstruction.
4. Project knowledge accumulates naturally as a byproduct of working, not as a separate documentation task.
5. A new team member can understand how the current direction was reached by looking at the canvas and project history.
6. The tool feels as simple as chatting with AI for basic use, while supporting deep exploration and composition for power users.

---

*This is a living document. Key decisions will be updated as the product evolves through design and user testing.*
