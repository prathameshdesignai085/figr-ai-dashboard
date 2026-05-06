"use client";

import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import * as React from "react";
import { useHandoverStore } from "@/stores/useHandoverStore";
import { captureElementAsPng } from "@/lib/capture";
import {
  DEMO_SCREENS,
  DEMO_SCREEN_DIMENSIONS,
} from "@/components/handover/demo-screens";

/**
 * Renders each DEMO_SCREEN into a real on-page DOM container, captures it as
 * a PNG, and adds a corresponding CapturedState to the handover store.
 *
 * Why on-screen with opacity:0 instead of `left:-99999px`:
 * Browsers skip layout/paint of off-screen containers under some conditions,
 * which causes html-to-image to capture an empty box. Keeping the container
 * in the visual viewport (with opacity:0 + pointer-events:none) forces real
 * layout while staying invisible to the user.
 *
 * A fresh container + root per screen avoids React reconciliation surprises
 * (component-A → component-B with same parent root sometimes leaves the
 * previous DOM state for an extra frame).
 */
export async function seedDemoStatesForSpace(spaceId: string): Promise<{
  added: number;
  failed: Array<{ name: string; error: string }>;
}> {
  let added = 0;
  const failed: Array<{ name: string; error: string }> = [];

  // Wipe prior captures for this Space so the demo set is clean.
  useHandoverStore.getState().clearStatesForSpace(spaceId);
  const { addCapturedState } = useHandoverStore.getState();

  for (const screen of DEMO_SCREENS) {
    const container = document.createElement("div");
    // On-screen position (forces layout) but visually invisible.
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = `${DEMO_SCREEN_DIMENSIONS.width}px`;
    container.style.height = `${DEMO_SCREEN_DIMENSIONS.height}px`;
    container.style.background = "#ffffff";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "-9999";
    document.body.appendChild(container);

    const root = createRoot(container);

    try {
      // flushSync forces React to commit synchronously — no reconciliation lag.
      flushSync(() => {
        root.render(React.createElement(screen.Component));
      });

      // Force layout by reading bounding rect — guarantees the browser has
      // computed positions before we capture.
      void container.getBoundingClientRect();

      // Small wait to allow web fonts / images / first paint.
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 30))
        )
      );

      const dataUrl = await captureElementAsPng(container, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      // Diagnostic: log first 60 chars + length so we can verify each
      // capture is genuinely different.
      console.log(
        `[seeder] captured "${screen.name}": length=${dataUrl.length} head=${dataUrl.slice(0, 60)}…`
      );

      addCapturedState({
        spaceId,
        name: screen.name,
        group: screen.group,
        dataUrl,
        sourceKind: "output",
      });
      added += 1;
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      console.error(`[seeder] capture failed for "${screen.name}":`, e);
      failed.push({ name: screen.name, error: err });
    } finally {
      root.unmount();
      if (container.parentNode) container.parentNode.removeChild(container);
    }
  }

  return { added, failed };
}
