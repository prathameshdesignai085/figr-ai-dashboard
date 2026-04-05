"use client";

import { useDesignEditorStore } from "@/stores/useDesignEditorStore";
import { cn } from "@/lib/utils";

function hexFromColor(css: string | undefined): string {
  if (!css || css === "transparent" || css === "rgba(0, 0, 0, 0)") return "#ffffff";
  const m = css.match(/#([0-9a-f]{3,8})/i);
  if (m) return m[0].length === 4 ? expandShortHex(m[0]) : m[0];
  const rgb = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgb) {
    const r = Number(rgb[1]).toString(16).padStart(2, "0");
    const g = Number(rgb[2]).toString(16).padStart(2, "0");
    const b = Number(rgb[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return "#ffffff";
}

function expandShortHex(h: string): string {
  if (h.length !== 4) return h;
  return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
}

function NumField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-foreground/30 w-6 shrink-0">{label}</span>
      <div className="flex flex-1 items-center rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1">
        <input
          type="number"
          value={value}
          onChange={(e) => { const n = parseFloat(e.target.value); if (Number.isFinite(n)) onChange(n); }}
          className="w-full min-w-0 bg-transparent text-xs text-foreground/60 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {suffix && <span className="text-[10px] text-foreground/20 shrink-0 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function StyleField({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-foreground/30 w-14 shrink-0">{label}</span>
      <div className="flex flex-1 items-center rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-xs text-foreground/60 focus:outline-none"
        />
        {suffix && <span className="text-[10px] text-foreground/20 shrink-0 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = hexFromColor(value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-foreground/30 w-14 shrink-0">{label}</span>
      <div className="flex flex-1 items-center gap-2 rounded border border-white/[0.08] bg-white/[0.03] px-2 py-1">
        <input
          type="color"
          value={hex.startsWith("#") && hex.length >= 7 ? hex.slice(0, 7) : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-5 w-5 shrink-0 cursor-pointer rounded-full border border-white/[0.15] bg-transparent p-0"
        />
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-xs text-foreground/60 focus:outline-none font-mono"
        />
      </div>
    </div>
  );
}

function AlignButtons({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-foreground/30 w-14 shrink-0">Align</span>
      <div className="flex gap-1">
        {(["left", "center", "right", "justify"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onChange(a)}
            className={cn(
              "flex h-6 flex-1 items-center justify-center rounded border border-white/[0.08] text-[9px] transition-colors min-w-[32px]",
              value === a
                ? "bg-primary/10 border-primary/30 text-foreground/80"
                : "text-foreground/30 hover:bg-white/[0.04]"
            )}
          >
            {a.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DesignInspector() {
  const { selectedNodeId, getNode, updateNode } = useDesignEditorStore();
  const node = selectedNodeId ? getNode(selectedNodeId) : null;

  if (!node) {
    return (
      <div className="flex h-full w-[260px] shrink-0 flex-col border-l border-white/[0.08] bg-[#111111]">
        <div className="flex h-8 items-center border-b border-white/[0.08] px-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/30">Inspector</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-foreground/15">Select a layer</p>
        </div>
      </div>
    );
  }

  const patchStyle = (partial: Record<string, string>) => {
    updateNode(node.id, { styles: { ...node.styles, ...partial } });
  };

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-l border-white/[0.08] bg-[#111111] overflow-y-auto">
      <div className="flex h-8 items-center justify-between border-b border-white/[0.08] px-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/30">Inspector</span>
        <span className="text-[10px] text-foreground/20 truncate ml-2 max-w-[120px]">{node.name}</span>
      </div>

      <div className="p-3 space-y-4">
        {/* Layout */}
        <section>
          <h4 className="text-[10px] font-medium text-foreground/40 mb-2 uppercase tracking-wider">Layout</h4>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="X" value={node.x} onChange={(v) => updateNode(node.id, { x: v })} suffix="px" />
            <NumField label="Y" value={node.y} onChange={(v) => updateNode(node.id, { y: v })} suffix="px" />
            <NumField label="W" value={node.width} onChange={(v) => updateNode(node.id, { width: v })} suffix="px" />
            <NumField label="H" value={node.height} onChange={(v) => updateNode(node.id, { height: v })} suffix="px" />
          </div>
        </section>

        {/* Text */}
        {(node.type === "text" || node.styles.fontSize) && (
          <section>
            <h4 className="text-[10px] font-medium text-foreground/40 mb-2 uppercase tracking-wider">Text</h4>
            <div className="space-y-2">
              <StyleField label="Size" value={node.styles.fontSize || ""} onChange={(v) => patchStyle({ fontSize: v })} />
              <StyleField label="Weight" value={node.styles.fontWeight || ""} onChange={(v) => patchStyle({ fontWeight: v })} />
              <StyleField label="Family" value={node.styles.fontFamily || ""} onChange={(v) => patchStyle({ fontFamily: v })} />
              <StyleField label="Line H" value={node.styles.lineHeight || ""} onChange={(v) => patchStyle({ lineHeight: v })} />
              <StyleField label="Spacing" value={node.styles.letterSpacing || ""} onChange={(v) => patchStyle({ letterSpacing: v })} />
              <AlignButtons value={node.styles.textAlign} onChange={(v) => patchStyle({ textAlign: v })} />
            </div>
          </section>
        )}

        {/* Fill */}
        <section>
          <h4 className="text-[10px] font-medium text-foreground/40 mb-2 uppercase tracking-wider">Fill</h4>
          <div className="space-y-2">
            <ColorField label="Background" value={node.styles.backgroundColor || ""} onChange={(v) => patchStyle({ backgroundColor: v })} />
            <ColorField label="Text" value={node.styles.color || ""} onChange={(v) => patchStyle({ color: v })} />
            <StyleField
              label="Opacity"
              value={node.styles.opacity ? String(Math.round(parseFloat(node.styles.opacity) * 100)) : "100"}
              onChange={(v) => {
                const n = parseFloat(v);
                if (Number.isFinite(n)) patchStyle({ opacity: String(Math.min(100, Math.max(0, n)) / 100) });
              }}
              suffix="%"
            />
          </div>
        </section>

        {/* Border */}
        <section>
          <h4 className="text-[10px] font-medium text-foreground/40 mb-2 uppercase tracking-wider">Border</h4>
          <div className="space-y-2">
            <ColorField label="Color" value={node.styles.borderColor || ""} onChange={(v) => patchStyle({ borderColor: v, borderStyle: "solid" })} />
            <StyleField label="Width" value={node.styles.borderWidth || node.styles.borderTopWidth || "0"} onChange={(v) => patchStyle({ borderWidth: v, borderStyle: "solid" })} />
            <StyleField label="Radius" value={node.styles.borderRadius || "0"} onChange={(v) => patchStyle({ borderRadius: v })} />
          </div>
        </section>

        {/* Spacing */}
        <section>
          <h4 className="text-[10px] font-medium text-foreground/40 mb-2 uppercase tracking-wider">Spacing</h4>
          <div className="space-y-2">
            <StyleField label="Padding" value={node.styles.padding || ""} onChange={(v) => patchStyle({ padding: v })} />
            <div className="grid grid-cols-2 gap-2">
              <StyleField label="Top" value={node.styles.paddingTop || ""} onChange={(v) => patchStyle({ paddingTop: v })} />
              <StyleField label="Right" value={node.styles.paddingRight || ""} onChange={(v) => patchStyle({ paddingRight: v })} />
              <StyleField label="Bottom" value={node.styles.paddingBottom || ""} onChange={(v) => patchStyle({ paddingBottom: v })} />
              <StyleField label="Left" value={node.styles.paddingLeft || ""} onChange={(v) => patchStyle({ paddingLeft: v })} />
            </div>
            <StyleField label="Margin" value={node.styles.margin || ""} onChange={(v) => patchStyle({ margin: v })} />
          </div>
        </section>

        {/* Display / Flex */}
        {(node.styles.display === "flex" || node.styles.display === "grid") && (
          <section>
            <h4 className="text-[10px] font-medium text-foreground/40 mb-2 uppercase tracking-wider">Flex</h4>
            <div className="space-y-2">
              <StyleField label="Direction" value={node.styles.flexDirection || ""} onChange={(v) => patchStyle({ flexDirection: v })} />
              <StyleField label="Align" value={node.styles.alignItems || ""} onChange={(v) => patchStyle({ alignItems: v })} />
              <StyleField label="Justify" value={node.styles.justifyContent || ""} onChange={(v) => patchStyle({ justifyContent: v })} />
              <StyleField label="Gap" value={node.styles.gap || ""} onChange={(v) => patchStyle({ gap: v })} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
