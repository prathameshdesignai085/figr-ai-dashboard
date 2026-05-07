import { get, set, del } from "idb-keyval";
import type { StateStorage } from "zustand/middleware";

/**
 * Zustand `persist` adapter backed by IndexedDB (via idb-keyval).
 *
 * Replaces localStorage for stores that hold heavy payloads (e.g. captured
 * prototype frames carrying base64 PNG dataUrls). localStorage tops out at
 * ~5 MB per origin; IndexedDB allows hundreds of MB to GBs depending on the
 * browser, so two or three captures no longer saturate the quota.
 */
export const idbStorage: StateStorage = {
  getItem: async (name) => {
    const value = await get(name);
    return value ?? null;
  },
  setItem: async (name, value) => {
    await set(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};
