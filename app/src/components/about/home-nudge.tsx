"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

// First-time-this-session nudge that points at the "What's in this
// prototype" pill in the home page's top-right. The bubble itself is the
// primary CTA — clicking anywhere on the body opens the overlay; the
// caret + position make it visually anchored to the pill above.
//
// Persistence is `sessionStorage`, not `localStorage`, deliberately:
//   - Each fresh demo session shows the nudge once (no need to clear flags
//     between pitches).
//   - A real user reopening within the same tab session doesn't get re-pestered.
// If we ever need a more permanent "seen" flag, switch the helper below.

const SESSION_KEY = "figred:about-nudge-seen";
const APPEAR_DELAY_MS = 1200;
const AUTO_DISMISS_MS = 12000;
const EXIT_TRANSITION_MS = 220;

type Props = {
  onOpen: () => void;
  // Called when the nudge mounts/unmounts, so the parent can pause the
  // pill's halo animation while the nudge is on-screen (two pulsing
  // signals fighting for the same attention reads as visual noise).
  onVisibleChange?: (visible: boolean) => void;
};

export function HomeNudge({ onOpen, onVisibleChange }: Props) {
  // Two-stage state so we can run an exit transition before unmounting:
  //   render  — does the node exist in the tree at all?
  //   entered — is it in its visible (settled) position?
  //
  // Enter:  render→true, then on next frame entered→true (transition runs).
  // Exit:   entered→false (transition runs), then after EXIT_TRANSITION_MS
  //         render→false (unmount).
  const [render, setRender] = useState(false);
  const [entered, setEntered] = useState(false);

  const dismiss = useCallback(() => {
    setEntered(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }
    window.setTimeout(() => setRender(false), EXIT_TRANSITION_MS);
  }, []);

  const handleOpen = () => {
    dismiss();
    onOpen();
  };

  // Schedule the appearance on mount — but skip entirely if this session
  // has already seen (or dismissed) the nudge.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;

    const appearTimer = window.setTimeout(() => {
      setRender(true);
      // requestAnimationFrame ensures the initial (off-screen) styles
      // flush before we flip `entered`, so the transition actually runs
      // instead of jumping straight to the final state.
      requestAnimationFrame(() => setEntered(true));
    }, APPEAR_DELAY_MS);

    return () => window.clearTimeout(appearTimer);
  }, []);

  // Auto-dismiss after the nudge has been on screen long enough that we
  // can assume the user is ignoring it (or hasn't noticed). Twelve seconds
  // is enough for a "huh, what's that" beat without overstaying.
  useEffect(() => {
    if (!entered) return;
    const dismissTimer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(dismissTimer);
  }, [entered, dismiss]);

  // Notify parent on mount/unmount so it can pause the pill halo.
  useEffect(() => {
    onVisibleChange?.(render);
  }, [render, onVisibleChange]);

  if (!render) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`absolute right-6 top-[64px] z-20 w-[240px] transition-all duration-200 ease-out ${
        entered ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      {/* Caret pointing up at the pill. A 10×10 div rotated 45° so its */}
      {/* background + border match the bubble seamlessly — no SVG needed. */}
      {/* Anchored to right-4 so it sits under the right portion of the pill */}
      {/* (both pill and bubble are right-anchored to right-6). */}
      <div
        aria-hidden
        className="absolute -top-[5px] right-4 h-[10px] w-[10px] rotate-45 rounded-[2px] border-l border-t border-[#695be8]/45 bg-[#15131f]"
      />

      <div className="relative overflow-hidden rounded-lg border border-[#695be8]/45 bg-[#15131f] shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
        {/* Body — the entire bubble body is the primary CTA. pr-8 leaves */}
        {/* room for the absolutely-positioned dismiss button on the right. */}
        <button
          type="button"
          onClick={handleOpen}
          className="flex w-full items-center gap-2.5 px-3 py-2.5 pr-8 text-left transition-colors hover:bg-white/[0.025]"
        >
          <span aria-hidden className="text-[15px] leading-none">
            👋
          </span>
          <span className="flex-1 text-[12px] leading-tight">
            <span className="text-foreground/55">First time? </span>
            <span className="font-medium text-foreground">
              Take the 5-min tour
            </span>
          </span>
        </button>

        {/* Dismiss — sibling to the body button (button-in-button is invalid */}
        {/* HTML), absolutely positioned so it doesn't grow the body's hit area. */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-1 top-1 rounded-sm p-1 text-foreground/40 transition-colors hover:bg-white/[0.06] hover:text-foreground/80"
        >
          <X size={11} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
