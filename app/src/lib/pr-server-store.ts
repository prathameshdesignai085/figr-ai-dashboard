import "server-only";
import type { ComponentPR } from "@/types";

/**
 * In-memory store for component PRs, keyed by slug. Same shape and
 * lifecycle as `handover-server-store.ts` — survives Next dev HMR via
 * globalThis, resets on full server restart.
 */
type Store = Map<string, ComponentPR>;

const GLOBAL_KEY = "__figredPrStore" as const;

function getStore(): Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map<string, ComponentPR>();
  }
  return g[GLOBAL_KEY] as Store;
}

export function savePr(pr: ComponentPR): void {
  getStore().set(pr.slug, pr);
}

export function getPr(slug: string): ComponentPR | undefined {
  return getStore().get(slug);
}

export function listPrsForSpace(spaceId: string): ComponentPR[] {
  return [...getStore().values()].filter((p) => p.spaceId === spaceId);
}
