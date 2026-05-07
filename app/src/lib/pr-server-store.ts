import "server-only";
import type { ComponentPR } from "@/types";
import { getRedis } from "./redis";

/**
 * Persistent store for component PRs, backed by Upstash Redis.
 *
 * Key shape:
 *   pr:{slug}              JSON ComponentPR
 *   pr:space:{spaceId}     SET of slugs
 */

const prKey = (slug: string) => `pr:${slug}`;
const spaceKey = (spaceId: string) => `pr:space:${spaceId}`;

export async function savePr(pr: ComponentPR): Promise<void> {
  const redis = getRedis();
  await Promise.all([
    redis.set(prKey(pr.slug), pr),
    redis.sadd(spaceKey(pr.spaceId), pr.slug),
  ]);
}

export async function getPr(slug: string): Promise<ComponentPR | undefined> {
  const result = await getRedis().get<ComponentPR>(prKey(slug));
  return result ?? undefined;
}

export async function listPrsForSpace(
  spaceId: string
): Promise<ComponentPR[]> {
  const redis = getRedis();
  const slugs = await redis.smembers(spaceKey(spaceId));
  if (slugs.length === 0) return [];
  const prs = await Promise.all(
    slugs.map((slug) => redis.get<ComponentPR>(prKey(slug)))
  );
  return prs.filter((p): p is ComponentPR => p !== null);
}
