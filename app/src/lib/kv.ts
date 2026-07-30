import "server-only";
import { getRedisOrNull, isRedisConfigured } from "./redis";

/**
 * Storage adapter for the handover / PR / Figma-pairing stores.
 *
 * Backed by Upstash Redis when it's configured *and* reachable, and by an
 * in-process Map otherwise. The fallback exists because the prototype has to
 * stay usable when there's no database attached — previously every store call
 * went straight to `getRedis()`, so an absent or deleted Upstash instance threw
 * an unhandled error inside the route handler and Next returned a bare 500 with
 * an empty body. Nothing downstream could tell you what went wrong.
 *
 * Trade-off of the memory backend: on Vercel each serverless container has its
 * own Map, so a handover published by one request may not be visible to a
 * later request served by a different container. That's why the client also
 * keeps a local copy of everything it publishes (see `handover-local-cache.ts`)
 * and why `/api/store-health` reports which backend is live. Attach a real
 * Upstash database to get durable, cross-device sharing back.
 */

export type KvBackend = "redis" | "memory";

export type KvStatus = {
  backend: KvBackend;
  configured: boolean;
  /** Set when Redis is configured but we've demoted it after a failure. */
  degradedReason?: string;
  degradedAt?: string;
};

type SetOptions = { ex?: number };

export interface KvClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: SetOptions): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<number>;
  sadd(key: string, member: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
  rpush(key: string, value: unknown): Promise<void>;
  lrange<T>(key: string, start: number, stop: number): Promise<T[]>;
}

// ---------- in-memory backend ----------

type Entry = { value: unknown; expiresAt?: number };

type MemoryStore = {
  entries: Map<string, Entry>;
  sets: Map<string, Set<string>>;
  lists: Map<string, unknown[]>;
};

type KvGlobals = {
  memory: MemoryStore;
  /** Epoch ms until which we skip Redis entirely after a failure. */
  redisDownUntil: number;
  degradedReason?: string;
  degradedAt?: string;
};

const GLOBAL_KEY = "__figredKv" as const;

/** Held on globalThis so dev-server HMR doesn't wipe published handovers. */
function globals(): KvGlobals {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: KvGlobals };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      memory: { entries: new Map(), sets: new Map(), lists: new Map() },
      redisDownUntil: 0,
    };
  }
  return g[GLOBAL_KEY];
}

/**
 * Round-trip through JSON so callers can't mutate stored objects by reference.
 * Matches Upstash's behaviour, where every value crosses a wire.
 */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

function readEntry(store: MemoryStore, key: string): Entry | undefined {
  const entry = store.entries.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    store.entries.delete(key);
    return undefined;
  }
  return entry;
}

const memoryClient: KvClient = {
  async get<T>(key: string): Promise<T | null> {
    const entry = readEntry(globals().memory, key);
    return entry ? clone(entry.value as T) : null;
  },
  async set(key, value, opts) {
    globals().memory.entries.set(key, {
      value: clone(value),
      expiresAt: opts?.ex ? Date.now() + opts.ex * 1000 : undefined,
    });
  },
  async del(key) {
    const { memory } = globals();
    memory.entries.delete(key);
    memory.sets.delete(key);
    memory.lists.delete(key);
  },
  async exists(key) {
    return readEntry(globals().memory, key) ? 1 : 0;
  },
  async sadd(key, member) {
    const { sets } = globals().memory;
    const existing = sets.get(key) ?? new Set<string>();
    existing.add(member);
    sets.set(key, existing);
  },
  async smembers(key) {
    return [...(globals().memory.sets.get(key) ?? [])];
  },
  async rpush(key, value) {
    const { lists } = globals().memory;
    const existing = lists.get(key) ?? [];
    existing.push(clone(value));
    lists.set(key, existing);
  },
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const list = (globals().memory.lists.get(key) ?? []) as T[];
    // Redis `stop` is inclusive and negative indices count from the end.
    const end = stop < 0 ? list.length + stop + 1 : stop + 1;
    return clone(list.slice(start < 0 ? list.length + start : start, end));
  },
};

// ---------- circuit breaker ----------

/** How long to stay on the memory backend after a Redis failure. */
const DEMOTE_WINDOW_MS = 30_000;

function demote(error: unknown): void {
  const g = globals();
  const reason = error instanceof Error ? error.message : String(error);
  g.redisDownUntil = Date.now() + DEMOTE_WINDOW_MS;
  g.degradedReason = reason;
  g.degradedAt = new Date().toISOString();
  console.error(
    `[kv] Redis unreachable — serving from in-memory store for the next ` +
      `${DEMOTE_WINDOW_MS / 1000}s. Reason: ${reason}`
  );
}

function redisUsable(): boolean {
  return isRedisConfigured() && Date.now() >= globals().redisDownUntil;
}

/** Current backend + why, for diagnostics endpoints and response headers. */
export function getKvStatus(): KvStatus {
  const g = globals();
  const configured = isRedisConfigured();
  return {
    backend: redisUsable() ? "redis" : "memory",
    configured,
    degradedReason: configured ? g.degradedReason : undefined,
    degradedAt: configured ? g.degradedAt : undefined,
  };
}

/**
 * Run `op` against Redis, falling back to the memory backend if Redis is
 * unavailable or the call throws. Connectivity failures never propagate.
 */
async function run<T>(
  op: (redis: NonNullable<ReturnType<typeof getRedisOrNull>>) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!redisUsable()) return fallback();
  const redis = getRedisOrNull();
  if (!redis) return fallback();
  try {
    return await op(redis);
  } catch (error) {
    demote(error);
    return fallback();
  }
}

// ---------- public client ----------

const kv: KvClient = {
  get<T>(key: string): Promise<T | null> {
    return run(
      (r) => r.get<T>(key),
      () => memoryClient.get<T>(key)
    );
  },
  set(key: string, value: unknown, opts?: SetOptions): Promise<void> {
    return run(
      async (r) => {
        if (opts?.ex) await r.set(key, value, { ex: opts.ex });
        else await r.set(key, value);
      },
      () => memoryClient.set(key, value, opts)
    );
  },
  del(key: string): Promise<void> {
    return run(
      async (r) => {
        await r.del(key);
      },
      () => memoryClient.del(key)
    );
  },
  exists(key: string): Promise<number> {
    return run(
      (r) => r.exists(key),
      () => memoryClient.exists(key)
    );
  },
  sadd(key: string, member: string): Promise<void> {
    return run(
      async (r) => {
        await r.sadd(key, member);
      },
      () => memoryClient.sadd(key, member)
    );
  },
  smembers(key: string): Promise<string[]> {
    return run(
      (r) => r.smembers(key),
      () => memoryClient.smembers(key)
    );
  },
  rpush(key: string, value: unknown): Promise<void> {
    return run(
      async (r) => {
        await r.rpush(key, value);
      },
      () => memoryClient.rpush(key, value)
    );
  },
  lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    return run(
      (r) => r.lrange<T>(key, start, stop),
      () => memoryClient.lrange<T>(key, start, stop)
    );
  },
};

export function getKv(): KvClient {
  return kv;
}

/**
 * Probe the live backend with a round-trip write/read. Used by
 * `/api/store-health` so the answer reflects reality rather than the last
 * cached breaker state.
 */
export async function probeKv(): Promise<KvStatus & { roundTripOk: boolean }> {
  const key = "kv:healthcheck";
  const stamp = new Date().toISOString();
  let roundTripOk = false;
  try {
    await kv.set(key, { stamp }, { ex: 60 });
    const read = await kv.get<{ stamp: string }>(key);
    roundTripOk = read?.stamp === stamp;
  } catch {
    roundTripOk = false;
  }
  return { ...getKvStatus(), roundTripOk };
}
