"use client";

/**
 * Snapshot a DOM element to a base64 image data URL.
 *
 * Uses `html-to-image` (SVG foreignObject under the hood) so all modern CSS
 * — including Tailwind 4's oklch colors — round-trips without a custom CSS parser.
 *
 * Output format defaults to JPEG (`image/jpeg`). JPEGs are ~30-50% smaller
 * than equivalent PNGs and Figma's plugin image decoder handles them
 * reliably; PNGs produced by `canvas.toDataURL` sometimes silently fail to
 * decode in the Figma sandbox. PNG remains available via `format: "png"`
 * for cases that need transparency (none in handover so far).
 *
 * If the element contains a same-origin iframe (rare in our app — sandboxed
 * iframes block this), we capture the iframe body for a cleaner thumbnail.
 */
export async function captureElementAsPng(
  el: HTMLElement,
  opts: {
    pixelRatio?: number;
    backgroundColor?: string;
    format?: "png" | "jpeg";
    quality?: number;
  } = {}
): Promise<string> {
  const mod = await import("html-to-image");
  const format = opts.format ?? "jpeg";
  const encoder = format === "png" ? mod.toPng : mod.toJpeg;
  const pixelRatio =
    opts.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);
  const quality = opts.quality ?? 0.92;

  // Try same-origin iframe body for a cleaner shot of just the rendered prototype.
  const iframe =
    el.tagName === "IFRAME"
      ? (el as HTMLIFrameElement)
      : el.querySelector("iframe");
  if (iframe) {
    try {
      const doc = iframe.contentDocument;
      if (doc && doc.body) {
        return await encoder(doc.body, {
          pixelRatio,
          backgroundColor: opts.backgroundColor ?? "#ffffff",
          quality,
          cacheBust: true,
        });
      }
    } catch {
      /* sandboxed iframe — fall through */
    }
  }

  return encoder(el, {
    pixelRatio,
    backgroundColor: opts.backgroundColor ?? "#ffffff",
    quality,
    cacheBust: true,
  });
}
