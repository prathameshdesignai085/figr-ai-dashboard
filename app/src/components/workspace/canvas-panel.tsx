"use client";

import { FigredCanvas } from "./canvas/figred-canvas";

export function CanvasPanel({ spaceId }: { spaceId: string }) {
  return <FigredCanvas spaceId={spaceId} />;
}
