import "server-only";

/**
 * Server-side skill registry. Each skill has only:
 * - a system prompt
 * - a friendly name (for the "Save to Space" affordance)
 * - whether it's multimodal (so the route handler can validate)
 *
 * The user-message text + image bytes are built CLIENT-SIDE (from Zustand
 * stores in localStorage that the server has no access to) and sent in the
 * request body. The route handler just orchestrates the Gemini call.
 */

export type Skill = {
  id: string;
  niceName: string;
  systemPrompt: string;
  multimodal: boolean;
};

const PRD_PROMPT = `Draft a Product Requirements Document for the active product/feature using the Space's context.

Output sections (use them all, omit a section only if there is no signal):
1. **Problem** — one sentence on what we're solving and why now.
2. **Goals** — measurable, prioritized.
3. **Scope** — what's in.
4. **Out of scope** — what's not.
5. **Success metrics** — primary metric + guardrails.
6. **Risks** — likely failure modes.
7. **Open questions** — things the designer/PM should clarify.

Rules:
- Bullets over paragraphs.
- Use product-grounded language drawn from the context. Reuse the product's own terminology.
- No filler, no padding, no marketing voice.
- Don't invent metrics. Say "TBD" if context is silent on a section.`;

const USER_FLOW_PROMPT = `Output a Mermaid \`flowchart TD\` representing the user journey across the captured prototype screens.

Rules:
- Use the captured-state names as node labels in [brackets].
- Use {decision?} diamonds where the user can branch.
- Label edges with the action: -->|tap CTA|.
- Do not invent screens that aren't in the captured set.
- After the diagram, add 2–3 short bullets calling out key branches or surprising paths.

Output format (no other text outside this):
1. ONE fenced \`\`\`mermaid block.
2. A blank line.
3. 2–3 bullets prefixed with "- ".`;

const STATES_PROMPT = `Force completeness on every captured screen.

For each captured screen output a markdown table with columns:
| State | Captured | Note |
Rows: empty / loading / success / error / disabled / partial-data / offline.
Mark each row's "Captured" column ✓ (yes) or ○ (no). Skip rows that genuinely don't apply (e.g. confirmation screens have no "empty"). The "Note" should describe what that state should look like in product terms.

After all per-screen tables, output a single section:
**Recommended additional captures** — bulleted list of specific named states the designer should go back and capture (e.g. "Cart with items — error: payment declined").

Use product terminology from the Space context. No filler.`;

const DS_COMPLIANCE_PROMPT = `Audit each captured screen against the connected design-system knowledge.

For each screen attached as an image, output:
- **Components used** — name them as best you can (use DS terminology when applicable).
- **Tokens used** — colors, spacing, type signals you can read off the image.
- **Deviations** — anything that doesn't seem to match the DS reference.
- **Recommendation** — specific change to align (one or two).

If the DS reference is sparse or silent on something, say so explicitly. Don't fabricate component or token names. Describe what you actually see.

End with a one-paragraph **Overall** verdict: how compliant the captured set looks (high / mixed / low) and what to fix first.`;

const EDGE_CASES_PROMPT = `List edge cases the dev should handle for this feature. Group output by screen.

For each screen, list edge cases covering at minimum:
- Network failure / timeout
- Empty data
- Overflow / very long content (long names, large numbers, many items)
- Race conditions / fast double-taps
- Accessibility (keyboard nav, screen reader, focus management)
- Error recovery (what does retry look like)
- Partial connectivity / slow connection

For each edge case, write one line: "**[scenario]** — what could happen → what the system should do."
Skip categories that genuinely don't apply to a given screen.
Use product terms from the context. No filler.`;

export const SKILLS: Record<string, Skill> = {
  prd: {
    id: "prd",
    niceName: "PRD",
    systemPrompt: PRD_PROMPT,
    multimodal: false,
  },
  "user-flow": {
    id: "user-flow",
    niceName: "User flow",
    systemPrompt: USER_FLOW_PROMPT,
    multimodal: false,
  },
  states: {
    id: "states",
    niceName: "State catalog",
    systemPrompt: STATES_PROMPT,
    multimodal: false,
  },
  "check-design-system-compliance": {
    id: "check-design-system-compliance",
    niceName: "DS compliance audit",
    systemPrompt: DS_COMPLIANCE_PROMPT,
    multimodal: true,
  },
  "edge-cases-check": {
    id: "edge-cases-check",
    niceName: "Edge cases check",
    systemPrompt: EDGE_CASES_PROMPT,
    multimodal: false,
  },
};

export function getSkill(name: string): Skill | undefined {
  return SKILLS[name];
}
