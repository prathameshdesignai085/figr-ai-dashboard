import "server-only";
import type { ComponentPR } from "@/types";
import { getKv } from "./kv";

/**
 * Persistent store for component PRs, backed by the KV adapter
 * (Upstash Redis when attached, in-memory otherwise — see `kv.ts`).
 *
 * Key shape:
 *   pr:{slug}              JSON ComponentPR
 *   pr:space:{spaceId}     SET of slugs
 */

const prKey = (slug: string) => `pr:${slug}`;
const spaceKey = (spaceId: string) => `pr:space:${spaceId}`;

export async function savePr(pr: ComponentPR): Promise<void> {
  const kv = getKv();
  await Promise.all([
    kv.set(prKey(pr.slug), pr),
    kv.sadd(spaceKey(pr.spaceId), pr.slug),
  ]);
}

export async function getPr(slug: string): Promise<ComponentPR | undefined> {
  const result = await getKv().get<ComponentPR>(prKey(slug));
  return result ?? undefined;
}

export async function listPrsForSpace(
  spaceId: string
): Promise<ComponentPR[]> {
  const kv = getKv();
  const slugs = await kv.smembers(spaceKey(spaceId));
  if (slugs.length === 0) return [];
  const prs = await Promise.all(
    slugs.map((slug) => kv.get<ComponentPR>(prKey(slug)))
  );
  return prs.filter((p): p is ComponentPR => p !== null);
}
