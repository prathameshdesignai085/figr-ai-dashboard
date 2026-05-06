"use client";

import { useState, useRef, useEffect, type RefObject } from "react";
import { Pin, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { captureElementAsPng } from "@/lib/capture";
import { useHandoverStore } from "@/stores/useHandoverStore";
import type { CapturedState } from "@/types";

type Props = {
  /** The DOM element to snapshot. */
  targetRef: RefObject<HTMLElement | null>;
  spaceId: string;
  sourceKind: CapturedState["sourceKind"];
  sourceOutputId?: string;
  sourceShellId?: string;
  /** Auto-suggested name (e.g. the output title). User can edit. */
  defaultName?: string;
  className?: string;
};

type Phase = "idle" | "naming" | "capturing" | "done";

export function CaptureStateButton({
  targetRef,
  spaceId,
  sourceKind,
  sourceOutputId,
  sourceShellId,
  defaultName = "Captured state",
  className,
}: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);
  const addCapturedState = useHandoverStore((s) => s.addCapturedState);

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  useEffect(() => {
    if (phase === "naming") {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [phase]);

  const handleCapture = async () => {
    const el = targetRef.current;
    if (!el || !name.trim()) return;
    setPhase("capturing");
    try {
      const dataUrl = await captureElementAsPng(el);
      addCapturedState({
        spaceId,
        name: name.trim(),
        dataUrl,
        sourceKind,
        sourceOutputId,
        sourceShellId,
      });
      setPhase("done");
      setTimeout(() => setPhase("idle"), 1400);
    } catch (err) {
      console.error("Capture failed:", err);
      setPhase("idle");
    }
  };

  if (phase === "naming") {
    return (
      <div
        className={cn(
          "flex h-7 items-center gap-1 rounded-md bg-[#181818] px-1.5 shadow-lg ring-1 ring-white/[0.08]",
          className
        )}
      >
        <Pin size={11} className="shrink-0 text-primary" />
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCapture();
            if (e.key === "Escape") setPhase("idle");
          }}
          className="h-6 w-36 bg-transparent text-[11px] text-foreground/90 placeholder:text-foreground/30 focus:outline-none"
          placeholder="Name this state…"
        />
        <button
          type="button"
          onClick={handleCapture}
          disabled={!name.trim()}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/80 text-primary-foreground hover:bg-primary disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-foreground/30"
          aria-label="Capture"
        >
          <Check size={11} />
        </button>
      </div>
    );
  }

  if (phase === "capturing") {
    return (
      <div
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md bg-[#181818] px-2 text-[11px] text-foreground/70 shadow-lg ring-1 ring-white/[0.08]",
          className
        )}
      >
        <Loader2 size={11} className="animate-spin text-primary" />
        Capturing…
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 text-[11px] font-medium text-emerald-300 shadow-lg ring-1 ring-emerald-500/30",
          className
        )}
      >
        <Check size={11} />
        Captured
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPhase("naming")}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-md bg-[#181818]/90 px-2 text-[11px] font-medium text-foreground/85 shadow-lg ring-1 ring-white/[0.08] backdrop-blur-sm transition-colors hover:bg-[#222] hover:text-foreground",
        className
      )}
      title="Capture this state for handover"
    >
      <Pin size={11} className="text-primary" />
      Capture state
    </button>
  );
}
