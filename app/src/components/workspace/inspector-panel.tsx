"use client";

import { Trash2, X } from "lucide-react";

export function InspectorPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col border-l border-white/[0.06] bg-background overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
        <span className="text-xs font-medium text-foreground/60">CardHeader</span>
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded text-foreground/25 hover:text-foreground/40 transition-colors">
            <Trash2 size={13} />
          </button>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-foreground/25 hover:text-foreground/40 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="p-3 space-y-4">
        {/* Text section */}
        <div>
          <h4 className="text-xs font-medium text-foreground/50 mb-2">Text</h4>
          <div className="space-y-2">
            <PropertyField label="Font size" value="16" />
            <PropertyField label="Font weight" value="Regular" type="select" />
            <div>
              <span className="text-[10px] text-foreground/30 mb-1 block">Alignment</span>
              <div className="flex gap-1">
                {["left", "center", "right", "justify"].map((a) => (
                  <button
                    key={a}
                    className="flex h-7 w-7 items-center justify-center rounded border border-white/[0.08] text-foreground/30 hover:bg-white/[0.04] text-[10px]"
                  >
                    ≡
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appearance section */}
        <div>
          <h4 className="text-xs font-medium text-foreground/50 mb-2">Appearance</h4>
          <div className="space-y-2">
            <PropertyField label="Text" value="#ffffff" color="#ffffff" />
            <PropertyField label="Background" value="transparent" color="transparent" />
            <PropertyField label="Opacity" value="100" suffix="%" />
          </div>
        </div>

        {/* Border section */}
        <div>
          <h4 className="text-xs font-medium text-foreground/50 mb-2">Border</h4>
          <div className="space-y-2">
            <PropertyField label="Color" value="#ffffff" color="#ffffff" />
            <PropertyField label="Width" value="0" />
            <PropertyField label="Radius" value="0" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyField({
  label,
  value,
  type = "text",
  color,
  suffix,
}: {
  label: string;
  value: string;
  type?: "text" | "select";
  color?: string;
  suffix?: string;
}) {
  return (
    <div>
      <span className="text-[10px] text-foreground/30 mb-1 block">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5">
        {color && (
          <div
            className="h-4 w-4 rounded-full border border-white/[0.15]"
            style={{ backgroundColor: color === "transparent" ? undefined : color }}
          />
        )}
        <input
          defaultValue={value}
          className="flex-1 bg-transparent text-xs text-foreground/60 focus:outline-none"
        />
        {suffix && <span className="text-xs text-foreground/25">{suffix}</span>}
        {type === "select" && (
          <span className="text-foreground/25 text-xs">▾</span>
        )}
      </div>
    </div>
  );
}
