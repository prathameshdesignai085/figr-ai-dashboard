"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { appendInspectBridge, FIGRED_MSG } from "./inspect-bridge";
import type { InspectedElement } from "@/types";

type Device = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function LivePreviewFrame({
  html,
  device,
  inspectMode,
  iframeKey,
  onInspectSelect,
  iframeRef,
}: {
  html: string;
  device: Device;
  inspectMode: boolean;
  /** Remount iframe when route/refresh changes */
  iframeKey: string;
  onInspectSelect: (el: InspectedElement, inspectId: string) => void;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}) {
  const srcDoc = appendInspectBridge(html);

  const postInspectMode = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: FIGRED_MSG.INSPECT_MODE, on: inspectMode }, "*");
  }, [inspectMode, iframeRef]);

  useEffect(() => {
    postInspectMode();
  }, [postInspectMode, iframeKey, srcDoc]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type === FIGRED_MSG.SELECT) {
        onInspectSelect(
          {
            componentName: d.componentName ?? "Element",
            tagName: d.tagName ?? "div",
            styles: d.styles ?? {},
          },
          d.inspectId ?? ""
        );
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeRef, onInspectSelect]);

  return (
    <div className="flex flex-1 items-start justify-center overflow-auto bg-white/[0.01] p-4 min-h-0">
      <div
        className={cn(
          "rounded-lg border border-white/[0.06] bg-white shadow-sm min-h-[400px] transition-[width] duration-200",
          device !== "desktop" && "mx-auto"
        )}
        style={{
          width: deviceWidths[device],
          maxWidth: "100%",
        }}
      >
        <iframe
          key={iframeKey}
          ref={iframeRef}
          title="Preview"
          className="block h-full min-h-[400px] w-full rounded-lg bg-white"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={srcDoc}
          onLoad={postInspectMode}
        />
      </div>
    </div>
  );
}

export function requestPreviewHtmlExport(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  iframeRef.current?.contentWindow?.postMessage({ type: FIGRED_MSG.EXPORT_HTML }, "*");
}

export function applyPreviewStyles(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  inspectId: string,
  styles: InspectedElement["styles"]
) {
  iframeRef.current?.contentWindow?.postMessage(
    { type: FIGRED_MSG.APPLY_STYLES, inspectId, styles },
    "*"
  );
}
