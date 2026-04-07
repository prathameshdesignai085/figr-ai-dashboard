"use client";

import { FigredCanvas } from "./canvas/figred-canvas";

export function CanvasPanel({
  spaceId,
  shellId,
}: {
  spaceId?: string;
  shellId?: string;
}) {
  return <FigredCanvas spaceId={spaceId} shellId={shellId} />;
}
