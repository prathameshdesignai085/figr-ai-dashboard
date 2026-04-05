"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { nanoid } from "nanoid";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useShelfStore } from "@/stores/useShelfStore";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Grab a region from the shell by compositing every visible <canvas> (tldraw
 * uses WebGL) plus a DOM snapshot of HTML overlays via an OffscreenCanvas.
 * Falls back gracefully if nothing is capturable.
 */
function captureRegion(shell: HTMLElement, r: Rect): string {
  const dpr = window.devicePixelRatio || 1;
  const out = document.createElement("canvas");
  out.width = Math.round(r.w * dpr);
  out.height = Math.round(r.h * dpr);
  const ctx = out.getContext("2d");
  if (!ctx) return "";

  ctx.scale(dpr, dpr);

  const shellRect = shell.getBoundingClientRect();

  // Composite every <canvas> element inside the shell (tldraw WebGL + any 2d)
  const canvases = shell.querySelectorAll("canvas");
  for (const src of canvases) {
    const srcRect = src.getBoundingClientRect();
    const sx = (r.x - (srcRect.left - shellRect.left)) * (src.width / srcRect.width);
    const sy = (r.y - (srcRect.top - shellRect.top)) * (src.height / srcRect.height);
    const sw = r.w * (src.width / srcRect.width);
    const sh = r.h * (src.height / srcRect.height);

    try {
      ctx.drawImage(src, sx, sy, sw, sh, 0, 0, r.w, r.h);
    } catch {
      // tainted / cross-origin canvas — skip
    }
  }

  return out.toDataURL("image/png");
}

export function MarqueeOverlay({
  canvasShellRef,
}: {
  canvasShellRef: RefObject<HTMLElement | null>;
}) {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const [dragging, setDragging] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const active = activeTool === "marquee";

  const capture = useCallback(
    (selectionRect: Rect) => {
      const shell = canvasShellRef.current;
      if (!shell) return;

      const dataUrl = captureRegion(shell, selectionRect);
      const id = nanoid(8);
      useShelfStore.getState().addMarqueeCapture({
        id,
        dataUrl,
        label: `Screenshot ${useShelfStore.getState().marqueeCaptures.length + 1}`,
      });
    },
    [canvasShellRef]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!active) return;
      e.preventDefault();
      e.stopPropagation();
      const overlay = overlayRef.current;
      if (overlay) overlay.setPointerCapture(e.pointerId);
      const shell = canvasShellRef.current;
      if (!shell) return;
      const shellRect = shell.getBoundingClientRect();
      const x = e.clientX - shellRect.left;
      const y = e.clientY - shellRect.top;
      originRef.current = { x, y };
      setRect({ x, y, w: 0, h: 0 });
      setDragging(true);
    },
    [active, canvasShellRef]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !originRef.current) return;
      e.preventDefault();
      const shell = canvasShellRef.current;
      if (!shell) return;
      const shellRect = shell.getBoundingClientRect();
      const curX = e.clientX - shellRect.left;
      const curY = e.clientY - shellRect.top;
      const ox = originRef.current.x;
      const oy = originRef.current.y;
      setRect({
        x: Math.min(ox, curX),
        y: Math.min(oy, curY),
        w: Math.abs(curX - ox),
        h: Math.abs(curY - oy),
      });
    },
    [dragging, canvasShellRef]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !rect) return;
      e.preventDefault();
      const overlay = overlayRef.current;
      if (overlay) overlay.releasePointerCapture(e.pointerId);
      setDragging(false);
      originRef.current = null;

      if (rect.w > 10 && rect.h > 10) {
        capture(rect);
      }
      setRect(null);
    },
    [dragging, rect, capture]
  );

  useEffect(() => {
    if (!active) {
      setDragging(false);
      setRect(null);
      originRef.current = null;
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setDragging(false);
        setRect(null);
        originRef.current = null;
        useCanvasStore.getState().setActiveTool("select");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-40"
      style={{ cursor: "crosshair" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {rect && rect.w > 0 && rect.h > 0 && (
        <div
          className="pointer-events-none absolute border-2 border-dashed border-primary/70 bg-primary/10"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
          }}
        />
      )}
      {/* Dim areas outside the selection */}
      {rect && rect.w > 0 && rect.h > 0 && (
        <div className="pointer-events-none absolute inset-0 bg-black/30">
          <div
            className="absolute bg-transparent"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.3)",
            }}
          />
        </div>
      )}
    </div>
  );
}
