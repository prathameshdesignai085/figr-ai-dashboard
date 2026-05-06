"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { HandoverStateSnapshot } from "@/types";

export function HandoverStateGrid({
  states,
}: {
  states: HandoverStateSnapshot[];
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (states.length === 0) {
    return (
      <p className="text-sm text-foreground/35">
        No prototype states attached.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {states.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setLightboxIdx(i)}
            className="group flex flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-black/30 text-left transition-colors hover:border-primary/40"
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.dataUrl}
                alt={s.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            </div>
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium text-foreground/90">
                {s.name}
              </p>
              {s.group && (
                <p className="text-[11px] text-foreground/40">{s.group}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-[92vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={states[lightboxIdx].dataUrl}
              alt={states[lightboxIdx].name}
              className="max-h-[82vh] w-auto rounded-lg border border-white/10 shadow-2xl"
            />
            <p className="mt-3 text-center text-sm font-medium text-foreground/90">
              {states[lightboxIdx].name}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
