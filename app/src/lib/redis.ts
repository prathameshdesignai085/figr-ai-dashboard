import "server-only";
import { Redis } from "@upstash/redis";

let _client: Redis | null = null;

/**
 * Lazily-constructed Upstash Redis client.
 *
 * Reads from either the Vercel-marketplace env names (`KV_REST_API_URL` /
 * `KV_REST_API_TOKEN`, auto-injected when you connect an Upstash database
 * via the Vercel Storage tab) or the @upstash/redis-native names
 * (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`). Either pair works.
 */
export function getRedis(): Redis {
  if (_client) return _client;

  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Redis credentials missing. Set KV_REST_API_URL + KV_REST_API_TOKEN " +
        "(Vercel Upstash marketplace) or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN."
    );
  }

  _client = new Redis({ url, token });
  return _client;
}
