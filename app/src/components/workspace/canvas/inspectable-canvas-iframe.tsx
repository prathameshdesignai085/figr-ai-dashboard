"use client";

import { useRef, useEffect, useCallback } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { FIGRED_MSG } from "@/components/workspace/build-preview/inspect-bridge";

type Props = {
  srcDoc: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Canvas HTML iframe that syncs inspect mode from the left toolbar (pick elements inside the prototype).
 */
export function InspectableCanvasIframe({ srcDoc, title, className, style }: Props) {
  const ref = useRef<HTMLIFrameElement>(null);
  const inspectActive = useCanvasStore((s) => s.activeTool === "inspect");

  const postInspectMode = useCallback(() => {
    const win = ref.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: FIGRED_MSG.INSPECT_MODE, on: inspectActive }, "*");
  }, [inspectActive]);

  useEffect(() => {
    postInspectMode();
  }, [postInspectMode, srcDoc]);

  return (
    <iframe
      ref={ref}
      srcDoc={srcDoc}
      title={title}
      onLoad={postInspectMode}
      sandbox="allow-scripts"
      className={className}
      style={style}
    />
  );
}
