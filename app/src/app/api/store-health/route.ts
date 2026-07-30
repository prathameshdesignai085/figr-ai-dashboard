import { probeKv } from "@/lib/kv";
import { storeJson } from "@/lib/api-store-response";

export const runtime = "nodejs";
// Performs a live write/read against the store, so it must never be
// prerendered — GET handlers are static-eligible in this version of Next.
export const dynamic = "force-dynamic";

/**
 * Which backend is actually serving handovers right now, and does a
 * write/read round-trip work? First stop when publishing misbehaves.
 */
export async function GET() {
  const probe = await probeKv();
  return storeJson({
    ...probe,
    ok: probe.roundTripOk,
    note:
      probe.backend === "redis"
        ? "Upstash Redis is attached and reachable — handovers are durable and shareable across devices."
        : probe.configured
          ? "Upstash credentials are set but the database is unreachable, so handovers are being served from this container's memory. They may not survive a redeploy or reach another device."
          : "No Upstash credentials configured. Handovers live in this container's memory — fine for a local demo, not for sharing links across devices.",
  });
}
