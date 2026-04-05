import type { DesignNode } from "@/types";
import { markdownToHtml } from "@/lib/markdown-to-html";

const PARSER_MSG = {
  PARSE: "FIGRED_DESIGN_PARSE",
  RESULT: "FIGRED_DESIGN_TREE_RESULT",
} as const;

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "META", "LINK", "NOSCRIPT", "HEAD", "BR", "HR"]);

/**
 * Parses an HTML string into a DesignNode tree by rendering it in a hidden
 * iframe and walking the DOM to capture geometry + computed styles.
 */
export function parseHtmlToDesignTree(html: string): Promise<DesignNode[]> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1280px;height:900px;border:none;opacity:0;pointer-events:none;";
    document.body.appendChild(iframe);

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === PARSER_MSG.RESULT) {
        window.removeEventListener("message", onMessage);
        iframe.remove();
        resolve(e.data.tree as DesignNode[]);
      }
    };
    window.addEventListener("message", onMessage);

    // Timeout fallback so we never hang
    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      iframe.remove();
      resolve([]);
    }, 5000);

    iframe.onload = () => {
      iframe.contentWindow?.postMessage({ type: PARSER_MSG.PARSE }, "*");
    };

    const parserScript = buildParserScript();
    const docHtml = ensureFullDocument(html, parserScript);
    iframe.srcdoc = docHtml;

    // Clear timeout when we get result
    const origOnMessage = onMessage;
    window.addEventListener("message", function cleanup(e: MessageEvent) {
      if (e.data?.type === PARSER_MSG.RESULT) {
        clearTimeout(timeout);
        window.removeEventListener("message", cleanup);
      }
    });
    void origOnMessage; // used above
  });
}

function isHtmlContent(s: string): boolean {
  const t = s.trim();
  return t.startsWith("<") || t.toLowerCase().startsWith("<!doctype");
}

function ensureFullDocument(html: string, script: string): string {
  const trimmed = html.trim();

  // Markdown / plain-text content — render through markdownToHtml first
  if (!isHtmlContent(trimmed)) {
    const rendered = markdownToHtml(trimmed);
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:12px 16px;background:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}</style></head><body>${rendered}${script}</body></html>`;
  }

  if (trimmed.toLowerCase().startsWith("<!doctype") || trimmed.toLowerCase().startsWith("<html")) {
    return trimmed.replace("</body>", `${script}</body>`);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}</style></head><body>${trimmed}${script}</body></html>`;
}

function buildParserScript(): string {
  return `<script data-figred-design-parser>
(function(){
  var counter = 0;
  var SKIP = ${JSON.stringify([...SKIP_TAGS])};

  function nodeType(el) {
    var tag = el.tagName.toLowerCase();
    if (tag === "img") return "image";
    var children = el.children;
    if (children.length === 0 && el.textContent && el.textContent.trim().length > 0) return "text";
    return "frame";
  }

  function nodeName(el, idx) {
    var attr = el.getAttribute("data-figred-component");
    if (attr) return attr;
    var tag = el.tagName.toLowerCase();
    var cls = el.className;
    if (typeof cls === "string" && cls.trim()) {
      var first = cls.trim().split(/\\s+/)[0];
      if (first.length < 30) return tag + "." + first;
    }
    return tag + "-" + idx;
  }

  function readStyles(el) {
    var cs = window.getComputedStyle(el);
    var s = {};
    var props = [
      "display","position","flexDirection","alignItems","justifyContent","gap",
      "width","height","minWidth","minHeight","maxWidth","maxHeight",
      "margin","marginTop","marginRight","marginBottom","marginLeft",
      "padding","paddingTop","paddingRight","paddingBottom","paddingLeft",
      "backgroundColor","color","fontSize","fontWeight","fontFamily",
      "lineHeight","letterSpacing","textAlign","textDecoration",
      "borderRadius","borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius",
      "borderWidth","borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth",
      "borderColor","borderStyle",
      "opacity","overflow","boxShadow","transform","zIndex"
    ];
    for (var i = 0; i < props.length; i++) {
      var v = cs.getPropertyValue(props[i].replace(/[A-Z]/g, function(m){ return "-" + m.toLowerCase(); }));
      if (v && v !== "" && v !== "none" && v !== "normal" && v !== "auto" && v !== "0px" && v !== "rgba(0, 0, 0, 0)" && v !== "transparent") {
        s[props[i]] = v;
      }
    }
    return s;
  }

  function walk(el, parentId, parentRect) {
    if (el.nodeType !== 1) return null;
    if (SKIP.indexOf(el.tagName) >= 0) return null;
    if (el.hasAttribute("data-figred-design-parser")) return null;

    counter++;
    var id = "dn-" + counter;
    var rect = el.getBoundingClientRect();
    var type = nodeType(el);
    var node = {
      id: id,
      tag: el.tagName.toLowerCase(),
      name: nodeName(el, counter),
      type: type,
      x: Math.round(rect.left - (parentRect ? parentRect.left : 0)),
      y: Math.round(rect.top - (parentRect ? parentRect.top : 0)),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      styles: readStyles(el),
      children: [],
      parentId: parentId,
      locked: false,
      visible: true
    };

    if (type === "text") {
      node.textContent = el.textContent.trim();
    }
    if (type === "image") {
      node.src = el.getAttribute("src") || "";
    }

    var children = el.children;
    for (var c = 0; c < children.length; c++) {
      var child = walk(children[c], id, rect);
      if (child) node.children.push(child);
    }

    return node;
  }

  window.addEventListener("message", function(e) {
    if (e.data && e.data.type === "${PARSER_MSG.PARSE}") {
      counter = 0;
      var roots = [];
      var body = document.body;
      for (var i = 0; i < body.children.length; i++) {
        var n = walk(body.children[i], null, null);
        if (n) roots.push(n);
      }
      window.parent.postMessage({ type: "${PARSER_MSG.RESULT}", tree: roots }, "*");
    }
  });
})();
</script>`;
}
