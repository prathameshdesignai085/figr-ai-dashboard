import "server-only";
import { customAlphabet } from "nanoid";
import type {
  Handover,
  HandoverComment,
  HandoverCommentAnchor,
  HandoverVersionRef,
} from "@/types";
import { getKv } from "./kv";

/**
 * Persistent store for published handovers, backed by the KV adapter
 * (Upstash Redis when attached, in-memory otherwise — see `kv.ts`).
 *
 * Key shape:
 *   handover:{slug}            JSON Handover
 *   handover:space:{spaceId}   SET of slugs (for listing by space)
 *   handover:comments:{slug}   LIST of JSON HandoverComment
 */

const commentId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

const handoverKey = (slug: string) => `handover:${slug}`;
const spaceKey = (spaceId: string) => `handover:space:${spaceId}`;
const commentsKey = (slug: string) => `handover:comments:${slug}`;

export async function saveHandover(h: Handover): Promise<void> {
  const kv = getKv();
  await Promise.all([
    kv.set(handoverKey(h.slug), h),
    kv.sadd(spaceKey(h.spaceId), h.slug),
  ]);
}

export async function getHandover(slug: string): Promise<Handover | undefined> {
  const result = await getKv().get<Handover>(handoverKey(slug));
  return result ?? undefined;
}

export async function listHandoversForSpace(
  spaceId: string
): Promise<Handover[]> {
  const kv = getKv();
  const slugs = await kv.smembers(spaceKey(spaceId));
  if (slugs.length === 0) return [];
  const handovers = await Promise.all(
    slugs.map((slug) => kv.get<Handover>(handoverKey(slug)))
  );
  return handovers.filter((h): h is Handover => h !== null);
}

export async function nextVersionForSpace(spaceId: string): Promise<number> {
  const list = await listHandoversForSpace(spaceId);
  return list.length + 1;
}

/** The most-recent (highest-version) handover for a Space, or undefined. */
export async function findLatestHandoverForSpace(
  spaceId: string
): Promise<Handover | undefined> {
  const list = await listHandoversForSpace(spaceId);
  if (list.length === 0) return undefined;
  return list.reduce((acc, h) => (h.version > acc.version ? h : acc), list[0]);
}

/**
 * Mark `prevId` as superseded by `newId`. Returns true if the previous
 * handover existed and was updated.
 */
export async function markSuperseded(
  prevId: string,
  newId: string
): Promise<boolean> {
  // We don't have an id→slug index; fan out via the same set lookup pattern
  // by finding which space the old handover lives in. The caller already
  // knows the space (it called nextVersionForSpace), but the old contract
  // didn't pass it, so we walk the new handover's space set instead.
  const newHandover = await getKv().get<Handover>(
    // ids are `ho-{slug}`; derive slug to find the new record's space
    handoverKey(newId.replace(/^ho-/, ""))
  );
  if (!newHandover) return false;
  const list = await listHandoversForSpace(newHandover.spaceId);
  const previous = list.find((h) => h.id === prevId);
  if (!previous) return false;
  previous.supersededBy = newId;
  await getKv().set(handoverKey(previous.slug), previous);
  return true;
}

/** All version rows for the Space the given handover belongs to, ascending by version. */
export async function listVersionsForHandover(
  slug: string
): Promise<HandoverVersionRef[]> {
  const handover = await getHandover(slug);
  if (!handover) return [];
  const list = await listHandoversForSpace(handover.spaceId);
  return list
    .map((v) => ({
      id: v.id,
      slug: v.slug,
      version: v.version,
      publishedAt: v.publishedAt,
      status: v.status,
    }))
    .sort((a, b) => a.version - b.version);
}

/**
 * Attach a generated Figma section URL to a handover.
 */
export async function attachFigmaSection(
  slug: string,
  sectionUrl: string
): Promise<boolean> {
  const handover = await getHandover(slug);
  if (!handover) return false;
  handover.figmaSectionUrl = sectionUrl;
  await saveHandover(handover);
  return true;
}

// ---------- Comments ----------

export async function listComments(slug: string): Promise<HandoverComment[]> {
  const items = await getKv().lrange<HandoverComment>(
    commentsKey(slug),
    0,
    -1
  );
  return items;
}

export async function addComment(input: {
  slug: string;
  anchor: HandoverCommentAnchor;
  body: string;
  author: string;
}): Promise<HandoverComment | null> {
  const kv = getKv();
  const handover = await kv.get<Handover>(handoverKey(input.slug));
  if (!handover) return null;
  const comment: HandoverComment = {
    id: `cmt-${commentId()}`,
    handoverId: handover.id,
    anchor: input.anchor,
    body: input.body,
    author: input.author,
    createdAt: new Date().toISOString(),
  };
  await kv.rpush(commentsKey(input.slug), comment);
  return comment;
}
