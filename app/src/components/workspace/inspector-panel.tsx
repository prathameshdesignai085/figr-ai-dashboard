"use client";

import { Trash2, X } from "lucide-react";
import type { InspectedElement } from "@/types";
import { cn } from "@/lib/utils";

export function InspectorPanel({
  element,
  onChange,
  onDiscard,
  onSave,
  onClose,
}: {
  element: InspectedElement;
  onChange: (next: InspectedElement) => void;
  onDiscard: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { styles } = element;

  const patch = (partial: Partial<InspectedElement["styles"]>) => {
    onChange({
      ...element,
      styles: { ...element.styles, ...partial },
    });
  };

  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-l border-white/[0.08] bg-[#1a1a1a] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-2.5">
        <span className="text-xs font-medium text-foreground/60 truncate pr-2">
          {element.componentName}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded text-foreground/25 hover:text-foreground/40 transition-colors"
            title="Remove"
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-foreground/25 hover:text-foreground/40 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4">
        <div>
          <h4 className="text-xs font-medium text-foreground/50 mb-2">Text</h4>
          <div className="space-y-2">
            <PropertyField
              label="Font size"
              value={styles.fontSize ?? ""}
              onChange={(v) => patch({ fontSize: v })}
            />
            <PropertyField
              label="Font weight"
              value={styles.fontWeight ?? ""}
              onChange={(v) => patch({ fontWeight: v })}
            />
            <div>
              <span className="text-[10px] text-foreground/30 mb-1 block">Alignment</span>
              <div className="flex gap-1">
                {(["left", "center", "right", "justify"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => patch({ textAlign: a })}
                    className={cn(
                      "flex h-7 flex-1 items-center justify-center rounded border border-white/[0.08] text-[10px] transition-colors",
                      styles.textAlign === a
                        ? "bg-primary/10 border-primary/30 text-foreground/80"
                        : "text-foreground/30 hover:bg-white/[0.04]"
                    )}
                  >
                    {a.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-foreground/50 mb-2">Appearance</h4>
          <div className="space-y-2">
            <ColorField
              label="Text"
              value={hexFromColor(styles.color)}
              onChange={(v) => patch({ color: v })}
            />
            <ColorField
              label="Background"
              value={hexFromColor(styles.backgroundColor)}
              onChange={(v) => patch({ backgroundColor: v })}
            />
            <PropertyField
              label="Opacity"
              value={opacityPercent(styles.opacity)}
              onChange={(v) => {
                const n = parseFloat(v.replace("%", "").trim());
                if (Number.isFinite(n)) {
                  patch({ opacity: String(Math.min(100, Math.max(0, n)) / 100) });
                }
              }}
              suffix="%"
            />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-foreground/50 mb-2">Border</h4>
          <div className="space-y-2">
            <ColorField
              label="Border color"
              value={hexFromColor(styles.borderColor)}
              onChange={(v) => patch({ borderColor: v })}
            />
            <PropertyField
              label="Border width"
              value={styles.borderWidth ?? "0"}
              onChange={(v) => patch({ borderWidth: v })}
            />
            <PropertyField
              label="Radius"
              value={styles.borderRadius ?? "0"}
              onChange={(v) => patch({ borderRadius: v })}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] py-2 text-xs text-foreground/60 hover:bg-white/[0.06] transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 rounded-md bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function opacityPercent(opacity: string | undefined): string {
  const n = parseFloat(opacity ?? "1");
  if (!Number.isFinite(n)) return "100";
  return String(Math.round(n * 100));
}

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

function PropertyField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <span className="text-[10px] text-foreground/30 mb-1 block">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-xs text-foreground/60 focus:outline-none"
        />
        {suffix && <span className="text-xs text-foreground/25 shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-[10px] text-foreground/30 mb-1 block">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5">
        <input
          type="color"
          value={value.startsWith("#") && value.length >= 7 ? value.slice(0, 7) : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 shrink-0 cursor-pointer rounded-full border border-white/[0.15] bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-xs text-foreground/60 focus:outline-none font-mono"
        />
      </div>
    </div>
  );
}
