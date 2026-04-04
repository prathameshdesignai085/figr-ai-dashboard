"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, ExternalLink, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function PrototypeBrowser() {
  const [device, setDevice] = useState<Device>("desktop");
  const [url, setUrl] = useState("/");

  return (
    <div className="flex h-full flex-col">
      {/* Browser bar */}
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-3">
        {/* Device selector */}
        <div className="flex items-center gap-0.5 rounded-md border border-white/[0.08] p-0.5">
          {(["desktop", "tablet", "mobile"] as Device[]).map((d) => {
            const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded transition-colors",
                  device === d
                    ? "bg-white/[0.08] text-foreground/70"
                    : "text-foreground/25 hover:text-foreground/40"
                )}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>

        {/* URL bar */}
        <div className="flex flex-1 items-center rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent text-xs text-foreground/50 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <button className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 transition-colors">
          <ExternalLink size={12} />
        </button>
        <button className="flex h-6 w-6 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 transition-colors">
          <RotateCw size={12} />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-white/[0.01] p-4">
        <div
          className="h-full rounded-lg border border-white/[0.06] bg-white"
          style={{
            width: deviceWidths[device],
            maxWidth: "100%",
            minHeight: "400px",
          }}
        >
          {/* Placeholder prototype content */}
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">Prototype preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}
