import "server-only";
import { Redis } from "@upstash/redis";

let _client: Redis | null = null;

export function getRedis(): Redis {
  if (_client) return _client;
  _client = Redis.fromEnv();
  return _client;
}
