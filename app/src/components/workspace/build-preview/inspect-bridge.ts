/** Injected into preview iframe for inspect mode (postMessage to parent). */

export const FIGRED_MSG = {
  INSPECT_MODE: "FIGRED_INSPECT_MODE",
  SELECT: "FIGRED_SELECT",
  APPLY_STYLES: "FIGRED_APPLY_STYLES",
  EXPORT_HTML: "FIGRED_EXPORT_HTML",
  HTML_EXPORT: "FIGRED_HTML_EXPORT",
} as const;

export function appendInspectBridge(html: string): string {
  if (html.includes("figred-inspect-bridge")) return html;
  const script = `<script data-figred-inspect-bridge>
(function(){
  var inspectOn=false, hoverEl=null, selectedEl=null, inspectId=0;
  function outline(el, on) {
    if (!el) return;
    el.style.outline = on ? "2px solid #695be8" : "";
    el.style.outlineOffset = on ? "2px" : "";
  }
  function pickName(el) {
    return el.getAttribute("data-figred-component") || el.tagName.toLowerCase();
  }
  function readStyles(el) {
    var cs = window.getComputedStyle(el);
    return {
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      textAlign: cs.textAlign,
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      opacity: cs.opacity,
      borderColor: cs.borderColor,
      borderWidth: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join(" "),
      borderRadius: cs.borderRadius
    };
  }
  function postSelect(el) {
    if (!el || el === document.body || el === document.documentElement) return;
    if (selectedEl) outline(selectedEl, false);
    selectedEl = el;
    outline(selectedEl, true);
    if (!selectedEl.getAttribute("data-figred-inspect-id")) {
      inspectId++;
      selectedEl.setAttribute("data-figred-inspect-id", "figred-" + inspectId);
    }
    window.parent.postMessage({
      type: "${FIGRED_MSG.SELECT}",
      componentName: pickName(selectedEl),
      tagName: selectedEl.tagName.toLowerCase(),
      inspectId: selectedEl.getAttribute("data-figred-inspect-id"),
      styles: readStyles(selectedEl)
    }, "*");
  }
  window.addEventListener("message", function(e) {
    var d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "${FIGRED_MSG.INSPECT_MODE}") {
      inspectOn = !!d.on;
      if (!inspectOn) {
        if (hoverEl) outline(hoverEl, false);
        if (selectedEl) outline(selectedEl, false);
        hoverEl = null;
        selectedEl = null;
      }
    }
    if (d.type === "${FIGRED_MSG.APPLY_STYLES}" && d.inspectId) {
      var el = document.querySelector('[data-figred-inspect-id="' + d.inspectId + '"]');
      if (el && el instanceof HTMLElement && d.styles) {
        var s = d.styles;
        if (s.fontSize) el.style.fontSize = s.fontSize;
        if (s.fontWeight) el.style.fontWeight = s.fontWeight;
        if (s.textAlign) el.style.textAlign = s.textAlign;
        if (s.color) el.style.color = s.color;
        if (s.backgroundColor) el.style.backgroundColor = s.backgroundColor;
        if (s.opacity != null) el.style.opacity = s.opacity;
        if (s.borderColor) el.style.borderColor = s.borderColor;
        if (s.borderWidth) {
          var parts = String(s.borderWidth).split(/\\s+/);
          if (parts.length >= 4) {
            el.style.borderTopWidth = parts[0];
            el.style.borderRightWidth = parts[1];
            el.style.borderBottomWidth = parts[2];
            el.style.borderLeftWidth = parts[3];
            el.style.borderStyle = "solid";
          }
        }
        if (s.borderRadius != null) el.style.borderRadius = s.borderRadius;
      }
    }
    if (d.type === "${FIGRED_MSG.EXPORT_HTML}") {
      window.parent.postMessage({
        type: "${FIGRED_MSG.HTML_EXPORT}",
        html: "<!DOCTYPE html>\\n" + document.documentElement.outerHTML
      }, "*");
    }
  });
  document.addEventListener("mousemove", function(ev) {
    if (!inspectOn) return;
    var el = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!el || el.closest("script")) return;
    if (hoverEl && hoverEl !== selectedEl) outline(hoverEl, false);
    hoverEl = el;
    if (hoverEl !== selectedEl) outline(hoverEl, true);
  }, true);
  document.addEventListener("click", function(ev) {
    if (!inspectOn) return;
    ev.preventDefault();
    ev.stopPropagation();
    var el = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!el || el === document.body || el === document.documentElement) return;
    postSelect(el);
  }, true);
})();
</script>`;
  return html.replace("</body>", `${script}</body>`);
}
