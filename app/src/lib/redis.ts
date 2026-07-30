import "server-only";
import { Redis } from "@upstash/redis";

let _client: Redis | null = null;

/**
 * Read the Upstash REST credentials from either the Vercel-marketplace env
 * names (`KV_REST_API_URL` / `KV_REST_API_TOKEN`, auto-injected when you
 * connect an Upstash database via the Vercel Storage tab) or the
 * @upstash/redis-native names (`UPSTASH_REDIS_REST_URL` /
 * `UPSTASH_REDIS_REST_TOKEN`). Either pair works.
 */
export function readRedisCredentials(): { url?: string; token?: string } {
  return {
    url: process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL,
    token:
      process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

/** True when both a well-formed URL and a token are present. */
export function isRedisConfigured(): boolean {
  const { url, token } = readRedisCredentials();
  if (!url || !token) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lazily-constructed Upstash Redis client, or `null` when credentials are
 * absent or malformed.
 *
 * Deliberately does NOT throw: a missing database is a degraded mode the KV
 * adapter handles (see `kv.ts`), not a crash. Retries are capped at 1 — the
 * default of 5 with exponential backoff turns an unreachable host into a
 * multi-second hang on every single request.
 */
export function getRedisOrNull(): Redis | null {
  if (_client) return _client;
  const { url, token } = readRedisCredentials();
  if (!isRedisConfigured() || !url || !token) return null;
  _client = new Redis({ url, token, retry: { retries: 1, backoff: () => 200 } });
  return _client;
}
