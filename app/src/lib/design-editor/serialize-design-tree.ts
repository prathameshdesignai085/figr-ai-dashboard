import type { DesignNode } from "@/types";

const VOID_TAGS = new Set(["img", "br", "hr", "input", "meta", "link"]);

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function buildStyleString(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join("; ");
}

function serializeNode(node: DesignNode): string {
  if (!node.visible) return "";

  const style = buildStyleString(node.styles);
  const styleAttr = style ? ` style="${style}"` : "";

  if (node.type === "image") {
    const src = node.src ? ` src="${node.src}"` : "";
    return `<img${src}${styleAttr} />`;
  }

  const tag = node.tag || "div";

  if (VOID_TAGS.has(tag)) {
    return `<${tag}${styleAttr} />`;
  }

  if (node.type === "text" && node.textContent != null) {
    return `<${tag}${styleAttr}>${escapeHtml(node.textContent)}</${tag}>`;
  }

  const children = node.children.map(serializeNode).filter(Boolean).join("\n");
  return `<${tag}${styleAttr}>${children ? `\n${children}\n` : ""}</${tag}>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Serializes a DesignNode tree back to a self-contained HTML document.
 */
export function serializeDesignTree(nodes: DesignNode[]): string {
  const body = nodes.map(serializeNode).filter(Boolean).join("\n");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}</style>
</head>
<body>
${body}
</body>
</html>`;
}

/**
 * Serializes a single node subtree (for component extraction).
 */
export function serializeSubtree(node: DesignNode): string {
  return serializeNode(node);
}
