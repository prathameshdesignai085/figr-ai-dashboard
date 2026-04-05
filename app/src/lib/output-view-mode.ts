import type { Output } from "@/types";

/**
 * App-like outputs: prototypes, hi-fi, built, HTML screens — use Preview (sandbox / coded product).
 */
export function isAppLikeOutput(o: Output): boolean {
  if (o.fidelity === "built" || o.fidelity === "hi-fi") return true;
  if (o.type === "screen" || o.type === "wireframe" || o.type === "component") return true;
  if (o.content.trim().startsWith("<")) return true;
  return false;
}

/** Documents, diagrams, frameworks — use Full screen focus, not device Preview. */
export function isDocumentLikeOutput(o: Output): boolean {
  return !isAppLikeOutput(o);
}

export function isBuiltOutput(o: Output): boolean {
  return o.fidelity === "built";
}
