"use client";

import { useMemo } from "react";
import { ExternalLink, PenTool, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HandoverStateSnapshot } from "@/types";

/**
 * Compact, URL-first Figma-section card for the public handover page.
 *
 * The dev's primary need is the Figma URL — to open the section in their
 * file and start working. Thumbnails are decorative seasoning, not a
 * thumbnail explorer. Keep the card small.
 *
 * If `figmaSectionUrl` is set (plugin completed the round-trip), the CTA
 * becomes a real "Open in Figma" link. Otherwise a small honest hint.
 */

const COMING_NEXT_TEXT =
  "The Figred Figma plugin will pull these states and lay them out as a Section in your open Figma file. Wired in the next phase.";

const MAX_PREVIEW_THUMBS = 4;

export function FigmaSectionPreview({
  spaceName,
  version,
  states,
  figmaSectionUrl,
}: {
  spaceName: string;
  version: number;
  states: HandoverStateSnapshot[];
  figmaSectionUrl?: string;
}) {
  // Derive ordered, unique group names for the metadata line.
  const groupNames = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const s of states) {
      const g = s.group?.trim() || "Screens";
      if (!seen.has(g)) {
        seen.add(g);
        out.push(g);
      }
    }
    return out;
  }, [states]);

  const previewThumbs = states.slice(0, MAX_PREVIEW_THUMBS);
  const remaining = Math.max(0, states.length - MAX_PREVIEW_THUMBS);
  const sectionName = `${spaceName} · v${version}`;

  // Empty handover → original "Coming next" placeholder.
  if (states.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/[0.1] bg-white/[0.015] p-4">
        <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/35">
          <Sparkles size={11} /> Coming next
        </div>
        <p className="text-sm text-foreground/70">{COMING_NEXT_TEXT}</p>
      </div>
    );
  }

  const Wrapper = figmaSectionUrl ? "a" : "div";
  const wrapperProps = figmaSectionUrl
    ? {
        href: figmaSectionUrl,
        target: "_blank" as const,
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "block overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.02] transition-colors",
        figmaSectionUrl &&
          "hover:border-primary/40 hover:bg-primary/[0.03] cursor-pointer"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <PenTool size={14} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[13px] font-semibold text-foreground/95">
              {sectionName}
            </span>
            <span className="shrink-0 text-[11px] text-foreground/40">
              · {states.length} frame{states.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-foreground/45">
            {groupNames.join(" · ")}
          </div>
        </div>

        {/* Tiny thumb strip — decorative, not interactive */}
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {previewThumbs.map((s) => (
            <span
              key={s.id}
              title={s.name}
              className="h-9 w-7 overflow-hidden rounded-sm border border-white/[0.08] bg-black/30"
            >
              {s.dataUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={s.dataUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </span>
          ))}
          {remaining > 0 && (
            <span className="ml-0.5 text-[10px] text-foreground/40">
              +{remaining}
            </span>
          )}
        </div>

        {figmaSectionUrl ? (
          <span className="ml-1 flex shrink-0 items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
            Open in Figma
            <ExternalLink size={11} />
          </span>
        ) : (
          <span
            className="ml-1 shrink-0 text-[10.5px] text-foreground/40"
            title="Run the figr plugin in Figma Desktop, then publish a new handover."
          >
            Pair plugin to open
          </span>
        )}
      </div>
    </Wrapper>
  );
}
