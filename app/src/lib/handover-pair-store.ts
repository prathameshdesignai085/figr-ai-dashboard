import "server-only";
import { customAlphabet } from "nanoid";

// Avoid lookalike chars (0/O, 1/I/L) in the user-typed code.
const codeId = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);
const tokenId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 32);

const PAIR_TTL_MS = 15 * 60 * 1000;

export type HandoverBundleState = {
  id: string;
  name: string;
  group?: string;
  /** base64 PNG data URL (with `data:image/png;base64,` prefix). */
  dataUrl: string;
};

export type HandoverBundle = {
  slug: string;
  sectionName: string;
  states: HandoverBundleState[];
};

type Pairing = {
  code: string;
  sessionToken: string;
  expiresAt: number;
};

type Session = {
  token: string;
  /** Set when the plugin has claimed the matching pair code. */
  claimedAt?: string;
  lastBundle?: HandoverBundle;
  lastBundleAt?: string;
  sectionUrlsBySlug: Map<string, string>;
};

type Store = {
  pairCodes: Map<string, Pairing>;
  sessions: Map<string, Session>;
};

const GLOBAL_KEY = "__figredHandoverPairStore" as const;

function getStore(): Store {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      pairCodes: new Map<string, Pairing>(),
      sessions: new Map<string, Session>(),
    };
  }
  return g[GLOBAL_KEY] as Store;
}

function expireOldCodes(s: Store): void {
  const now = Date.now();
  for (const [code, pairing] of s.pairCodes) {
    if (pairing.expiresAt < now) s.pairCodes.delete(code);
  }
}

/**
 * Issue a fresh pair code. Returns both the code (shown to the user) and the
 * sessionToken (stored locally by the Figred webapp so it can later queue
 * bundles for this session).
 */
export function issueCode(): {
  code: string;
  sessionToken: string;
  expiresAt: string;
} {
  const s = getStore();
  expireOldCodes(s);
  const code = codeId();
  const sessionToken = tokenId();
  const expiresAt = Date.now() + PAIR_TTL_MS;
  s.pairCodes.set(code, { code, sessionToken, expiresAt });
  s.sessions.set(sessionToken, {
    token: sessionToken,
    sectionUrlsBySlug: new Map(),
  });
  return { code, sessionToken, expiresAt: new Date(expiresAt).toISOString() };
}

/**
 * Claim a code (single-use). Returns the sessionToken that was minted alongside
 * the code, or null if the code is unknown / expired / already claimed.
 */
export function claimCode(code: string): string | null {
  const s = getStore();
  expireOldCodes(s);
  const normalized = code.trim().toUpperCase();
  const pairing = s.pairCodes.get(normalized);
  if (!pairing) return null;
  if (pairing.expiresAt < Date.now()) {
    s.pairCodes.delete(normalized);
    return null;
  }
  s.pairCodes.delete(normalized); // single-use
  // Mark the matching session as claimed so the webapp can detect it.
  const session = s.sessions.get(pairing.sessionToken);
  if (session) session.claimedAt = new Date().toISOString();
  return pairing.sessionToken;
}

/** Has the plugin claimed the code for this session yet? */
export function isClaimed(sessionToken: string): { claimed: boolean; claimedAt?: string } {
  const s = getStore();
  const session = s.sessions.get(sessionToken);
  if (!session) return { claimed: false };
  return { claimed: !!session.claimedAt, claimedAt: session.claimedAt };
}

/** Stash a bundle for the paired plugin to pull next. */
export function queueBundle(
  sessionToken: string,
  bundle: HandoverBundle
): boolean {
  const s = getStore();
  const session = s.sessions.get(sessionToken);
  if (!session) return false;
  session.lastBundle = bundle;
  session.lastBundleAt = new Date().toISOString();
  return true;
}

/** Plugin-side pull. Does NOT clear the bundle — re-pulls are allowed. */
export function pullLatest(
  sessionToken: string
): { bundle: HandoverBundle; lastBundleAt: string } | null {
  const s = getStore();
  const session = s.sessions.get(sessionToken);
  if (!session?.lastBundle || !session.lastBundleAt) return null;
  return { bundle: session.lastBundle, lastBundleAt: session.lastBundleAt };
}

export function recordSectionUrl(
  sessionToken: string,
  slug: string,
  sectionUrl: string
): boolean {
  const s = getStore();
  const session = s.sessions.get(sessionToken);
  if (!session) return false;
  session.sectionUrlsBySlug.set(slug, sectionUrl);
  return true;
}

/** Verify a session token exists (for endpoints that need auth). */
export function isValidSession(sessionToken: string): boolean {
  return getStore().sessions.has(sessionToken);
}
