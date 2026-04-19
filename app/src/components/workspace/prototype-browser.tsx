"use client";

import { useState } from "react";
import { Monitor, Tablet, Smartphone, ExternalLink, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { DeviceFrame, isPhoneFrame, type DeviceFrameVariant } from "./device-frame";

type DeviceTab = "desktop" | "tablet" | "mobile";

const tabToVariant: Record<DeviceTab, DeviceFrameVariant> = {
  desktop: "desktop",
  tablet: "tablet",
  mobile: "iphone-15-pro",
};

export function PrototypeBrowser() {
  const activeSpace = useSpaceStore((s) => s.getActiveSpace());
  const isMobileSpace = activeSpace?.targetPlatform === "mobile";
  const [device, setDevice] = useState<DeviceTab>(
    isMobileSpace ? "mobile" : "desktop"
  );
  const [url, setUrl] = useState("/");

  const variant = tabToVariant[device];
  const phone = isPhoneFrame(variant);

  return (
    <div className="flex h-full flex-col">
      {/* Browser bar */}
      <div className="flex h-10 items-center gap-2 border-b border-white/[0.06] px-3">
        {/* Device selector */}
        <div className="flex items-center gap-0.5 rounded-md border border-white/[0.08] p-0.5">
          {(["desktop", "tablet", "mobile"] as DeviceTab[]).map((d) => {
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
        {phone ? (
          <DeviceFrame variant={variant}>
            <PlaceholderScreen mobile />
          </DeviceFrame>
        ) : (
          <DeviceFrame
            variant={variant}
            className={variant === "tablet" ? undefined : "h-full"}
          >
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <PlaceholderScreen mobile={false} />
            </div>
          </DeviceFrame>
        )}
      </div>
    </div>
  );
}

function PlaceholderScreen({ mobile }: { mobile: boolean }) {
  if (!mobile) {
    return <p className="text-sm text-gray-400">Prototype preview</p>;
  }
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 h-12 w-12 rounded-2xl bg-violet-500" />
        <h2 className="mb-1 text-lg font-semibold text-zinc-900">
          Prototype preview
        </h2>
        <p className="text-xs text-zinc-500">
          Native screens render here when this space is built.
        </p>
      </div>
      <div className="grid grid-cols-4 border-t border-zinc-200 bg-white py-2 text-[10px] text-zinc-500">
        {["Home", "Search", "Activity", "Profile"].map((label) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <div className="h-4 w-4 rounded-md bg-zinc-200" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
