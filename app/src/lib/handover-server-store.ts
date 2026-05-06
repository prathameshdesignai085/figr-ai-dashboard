import "server-only";
import { customAlphabet } from "nanoid";
import type {
  Handover,
  HandoverComment,
  HandoverCommentAnchor,
  HandoverVersionRef,
} from "@/types";

/**
 * In-memory store for published handovers, keyed by slug.
 * Survives Next dev HMR via globalThis. Resets on full server restart —
 * acceptable for the demo prototype.
 */
type Store = {
  handovers: Map<string, Handover>;
  /** Comments keyed by handover slug → array of comments. */
  commentsBySlug: Map<string, HandoverComment[]>;
};

const GLOBAL_KEY = "__figredHandoverStore" as const;
const commentId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

function getStore(): Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      handovers: new Map<string, Handover>(),
      commentsBySlug: new Map<string, HandoverComment[]>(),
    };
  } else if (!g[GLOBAL_KEY].commentsBySlug) {
    // Migrate older shape (Map of handovers) into the new wrapper without losing data.
    const previous = g[GLOBAL_KEY] as Map<string, Handover>;
    g[GLOBAL_KEY] = {
      handovers: previous,
      commentsBySlug: new Map<string, HandoverComment[]>(),
    };
  }
  return g[GLOBAL_KEY] as Store;
}

export function saveHandover(h: Handover): void {
  getStore().handovers.set(h.slug, h);
}

export function getHandover(slug: string): Handover | undefined {
  return getStore().handovers.get(slug);
}

export function listHandoversForSpace(spaceId: string): Handover[] {
  return [...getStore().handovers.values()].filter(
    (h) => h.spaceId === spaceId
  );
}

export function nextVersionForSpace(spaceId: string): number {
  return listHandoversForSpace(spaceId).length + 1;
}

/** The most-recent (highest-version) handover for a Space, or undefined. */
export function findLatestHandoverForSpace(
  spaceId: string
): Handover | undefined {
  const list = listHandoversForSpace(spaceId);
  if (list.length === 0) return undefined;
  return list.reduce((acc, h) => (h.version > acc.version ? h : acc), list[0]);
}

/**
 * Mark `prevId` as superseded by `newId`. Returns true if the previous
 * handover existed and was updated.
 */
export function markSuperseded(prevId: string, newId: string): boolean {
  const store = getStore();
  for (const h of store.handovers.values()) {
    if (h.id === prevId) {
      h.supersededBy = newId;
      store.handovers.set(h.slug, h);
      return true;
    }
  }
  return false;
}

/** All version rows for the Space the given handover belongs to, ascending by version. */
export function listVersionsForHandover(slug: string): HandoverVersionRef[] {
  const h = getHandover(slug);
  if (!h) return [];
  return listHandoversForSpace(h.spaceId)
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
export function attachFigmaSection(slug: string, sectionUrl: string): boolean {
  const handover = getHandover(slug);
  if (!handover) return false;
  handover.figmaSectionUrl = sectionUrl;
  saveHandover(handover);
  return true;
}

// ---------- Comments ----------

export function listComments(slug: string): HandoverComment[] {
  return getStore().commentsBySlug.get(slug) ?? [];
}

export function addComment(input: {
  slug: string;
  anchor: HandoverCommentAnchor;
  body: string;
  author: string;
}): HandoverComment | null {
  const store = getStore();
  const handover = store.handovers.get(input.slug);
  if (!handover) return null;
  const comment: HandoverComment = {
    id: `cmt-${commentId()}`,
    handoverId: handover.id,
    anchor: input.anchor,
    body: input.body,
    author: input.author,
    createdAt: new Date().toISOString(),
  };
  const list = store.commentsBySlug.get(input.slug) ?? [];
  list.push(comment);
  store.commentsBySlug.set(input.slug, list);
  return comment;
}
