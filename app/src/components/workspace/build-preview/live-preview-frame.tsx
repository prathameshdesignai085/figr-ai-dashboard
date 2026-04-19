"use client";

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { appendInspectBridge, FIGRED_MSG } from "./inspect-bridge";
import type { InspectedElement } from "@/types";
import {
  DeviceFrame,
  isPhoneFrame,
  type DeviceFrameVariant,
} from "../device-frame";

// Backwards-compatible alias for existing callers that still pass the old union.
type LegacyDevice = "desktop" | "tablet" | "mobile";
export type Device = LegacyDevice | DeviceFrameVariant;

function resolveVariant(device: Device): DeviceFrameVariant {
  if (device === "mobile") return "iphone-15-pro";
  if (device === "desktop" || device === "tablet") return device;
  return device;
}

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
  const variant = resolveVariant(device);
  const isPhone = isPhoneFrame(variant);

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

  const iframe = (
    <iframe
      key={iframeKey}
      ref={iframeRef}
      title="Preview"
      className={cn("block h-full w-full bg-white", !isPhone && "min-h-[400px]")}
      sandbox="allow-scripts allow-same-origin"
      srcDoc={srcDoc}
      onLoad={postInspectMode}
    />
  );

  return (
    <div className="flex flex-1 items-start justify-center overflow-auto bg-white/[0.01] p-4 min-h-0">
      {isPhone ? (
        <DeviceFrame variant={variant} showStatusBar={false}>
          {iframe}
        </DeviceFrame>
      ) : (
        <div
          className={cn(
            "rounded-lg border border-white/[0.06] bg-white shadow-sm min-h-[400px] transition-[width] duration-200",
            variant !== "desktop" && "mx-auto"
          )}
          style={{
            width: variant === "desktop" ? "100%" : "768px",
            maxWidth: "100%",
          }}
        >
          {iframe}
        </div>
      )}
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
