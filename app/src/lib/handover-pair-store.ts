import "server-only";
import { customAlphabet } from "nanoid";
import { getKv } from "./kv";

// Avoid lookalike chars (0/O, 1/I/L) in the user-typed code.
const codeId = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);
const tokenId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 32);

const PAIR_TTL_SECONDS = 15 * 60; // 15 minutes
const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24h, generous for demo flows

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
};

type Session = {
  token: string;
  /** Set when the plugin has claimed the matching pair code. */
  claimedAt?: string;
  lastBundle?: HandoverBundle;
  lastBundleAt?: string;
  /** Plain object instead of Map — Redis can't store nested Maps. */
  sectionUrlsBySlug: Record<string, string>;
};

const codeKey = (code: string) => `pair:code:${code}`;
const sessionKey = (token: string) => `pair:session:${token}`;

/**
 * Issue a fresh pair code. Returns both the code (shown to the user) and the
 * sessionToken (stored locally by the Figred webapp so it can later queue
 * bundles for this session).
 */
export async function issueCode(): Promise<{
  code: string;
  sessionToken: string;
  expiresAt: string;
}> {
  const kv = getKv();
  const code = codeId();
  const sessionToken = tokenId();
  const pairing: Pairing = { code, sessionToken };
  const session: Session = {
    token: sessionToken,
    sectionUrlsBySlug: {},
  };
  await Promise.all([
    kv.set(codeKey(code), pairing, { ex: PAIR_TTL_SECONDS }),
    kv.set(sessionKey(sessionToken), session, { ex: SESSION_TTL_SECONDS }),
  ]);
  const expiresAt = new Date(Date.now() + PAIR_TTL_SECONDS * 1000).toISOString();
  return { code, sessionToken, expiresAt };
}

/**
 * Claim a code (single-use). Returns the sessionToken that was minted alongside
 * the code, or null if the code is unknown / expired / already claimed.
 */
export async function claimCode(code: string): Promise<string | null> {
  const kv = getKv();
  const normalized = code.trim().toUpperCase();
  const pairing = await kv.get<Pairing>(codeKey(normalized));
  if (!pairing) return null;

  // Single-use: delete the code regardless of what happens next.
  await kv.del(codeKey(normalized));

  // Mark the matching session as claimed so the webapp can detect it.
  const session = await kv.get<Session>(sessionKey(pairing.sessionToken));
  if (session) {
    session.claimedAt = new Date().toISOString();
    await kv.set(sessionKey(pairing.sessionToken), session, {
      ex: SESSION_TTL_SECONDS,
    });
  }
  return pairing.sessionToken;
}

/** Has the plugin claimed the code for this session yet? */
export async function isClaimed(
  sessionToken: string
): Promise<{ claimed: boolean; claimedAt?: string }> {
  const session = await getKv().get<Session>(sessionKey(sessionToken));
  if (!session) return { claimed: false };
  return { claimed: !!session.claimedAt, claimedAt: session.claimedAt };
}

/** Stash a bundle for the paired plugin to pull next. */
export async function queueBundle(
  sessionToken: string,
  bundle: HandoverBundle
): Promise<boolean> {
  const kv = getKv();
  const session = await kv.get<Session>(sessionKey(sessionToken));
  if (!session) return false;
  session.lastBundle = bundle;
  session.lastBundleAt = new Date().toISOString();
  await kv.set(sessionKey(sessionToken), session, {
    ex: SESSION_TTL_SECONDS,
  });
  return true;
}

/** Plugin-side pull. Does NOT clear the bundle — re-pulls are allowed. */
export async function pullLatest(
  sessionToken: string
): Promise<{ bundle: HandoverBundle; lastBundleAt: string } | null> {
  const session = await getKv().get<Session>(sessionKey(sessionToken));
  if (!session?.lastBundle || !session.lastBundleAt) return null;
  return { bundle: session.lastBundle, lastBundleAt: session.lastBundleAt };
}

export async function recordSectionUrl(
  sessionToken: string,
  slug: string,
  sectionUrl: string
): Promise<boolean> {
  const kv = getKv();
  const session = await kv.get<Session>(sessionKey(sessionToken));
  if (!session) return false;
  session.sectionUrlsBySlug[slug] = sectionUrl;
  await kv.set(sessionKey(sessionToken), session, {
    ex: SESSION_TTL_SECONDS,
  });
  return true;
}

/** Verify a session token exists (for endpoints that need auth). */
export async function isValidSession(sessionToken: string): Promise<boolean> {
  const exists = await getKv().exists(sessionKey(sessionToken));
  return exists > 0;
}
