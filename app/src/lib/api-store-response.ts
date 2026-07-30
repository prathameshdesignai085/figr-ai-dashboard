import "server-only";
import { NextResponse } from "next/server";
import { getKvStatus } from "./kv";

/**
 * Helpers for API routes that touch the KV store.
 *
 * Every store-backed route used to call into Redis with no try/catch, so any
 * failure surfaced as a Next 500 with an *empty body*. The Publish modal read
 * that body and rendered a bare "Publish failed:" with nothing after it. These
 * helpers guarantee there's always a readable reason on the wire.
 */

/** Advertise which backend served the request — visible in devtools. */
export function storeHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const status = getKvStatus();
  headers.set("x-figred-store", status.backend);
  if (status.degradedReason) headers.set("x-figred-store-degraded", "1");
  return headers;
}

/** JSON response that carries the store-backend headers. */
export function storeJson(body: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, {
    ...init,
    headers: storeHeaders(init?.headers),
  });
}

/**
 * 503 with a human-readable reason. Never returns an empty body — that was the
 * whole reason "Publish failed:" showed up blank.
 */
export function storeFailure(
  context: string,
  error: unknown,
  extraHeaders?: HeadersInit
): NextResponse {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[api] ${context} failed:`, error);
  return storeJson(
    {
      error: `${context} failed`,
      detail,
      backend: getKvStatus().backend,
      hint:
        "The handover store is unavailable. Check /api/store-health, and " +
        "attach an Upstash database (KV_REST_API_URL + KV_REST_API_TOKEN) " +
        "for durable, cross-device handovers.",
    },
    { status: 503, headers: extraHeaders }
  );
}
