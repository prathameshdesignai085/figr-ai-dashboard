import { get, set, del } from "idb-keyval";
import type { Handover } from "@/types";

/**
 * Browser-side cache of handovers this device has published.
 *
 * The server store is only durable when an Upstash database is attached.
 * Without one it falls back to per-container memory, so a published link can
 * 404 on the very next request if a different serverless container answers it.
 * Caching a copy locally means the designer who published can always reopen
 * their own `/h/{slug}` link and demo the flow end-to-end.
 *
 * This is a fallback, not the source of truth: the server copy always wins, and
 * cross-device sharing still needs a real database.
 */

const entryKey = (slug: string) => `figred:handover:${slug}`;
const INDEX_KEY = "figred:handover-index";

type Index = {
  /** slug → spaceId, so we can count versions per Space offline. */
  bySlug: Record<string, string>;
};

function available(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

async function readIndex(): Promise<Index> {
  const stored = await get<Index>(INDEX_KEY);
  return stored ?? { bySlug: {} };
}

/** Store a published handover so its public page works offline / cross-container. */
export async function cacheHandover(handover: Handover): Promise<void> {
  if (!available()) return;
  try {
    await set(entryKey(handover.slug), handover);
    const index = await readIndex();
    index.bySlug[handover.slug] = handover.spaceId;
    await set(INDEX_KEY, index);
  } catch (error) {
    // A quota error here must never break publishing — the server copy may
    // well be fine, and this is only a convenience layer.
    console.warn("[handover-cache] could not cache handover locally", error);
  }
}

export async function readCachedHandover(
  slug: string
): Promise<Handover | null> {
  if (!available()) return null;
  try {
    return (await get<Handover>(entryKey(slug))) ?? null;
  } catch {
    return null;
  }
}

/** Handovers this device published for a Space, ascending by version. */
export async function listCachedHandoversForSpace(
  spaceId: string
): Promise<Handover[]> {
  if (!available()) return [];
  try {
    const index = await readIndex();
    const slugs = Object.entries(index.bySlug)
      .filter(([, id]) => id === spaceId)
      .map(([slug]) => slug);
    const entries = await Promise.all(slugs.map((s) => readCachedHandover(s)));
    return entries
      .filter((h): h is Handover => h !== null)
      .sort((a, b) => a.version - b.version);
  } catch {
    return [];
  }
}

export async function clearCachedHandover(slug: string): Promise<void> {
  if (!available()) return;
  try {
    await del(entryKey(slug));
    const index = await readIndex();
    delete index.bySlug[slug];
    await set(INDEX_KEY, index);
  } catch {
    /* best-effort */
  }
}
