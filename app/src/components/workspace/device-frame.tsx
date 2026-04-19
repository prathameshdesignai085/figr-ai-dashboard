"use client";

import { cn } from "@/lib/utils";

export type DeviceFrameVariant =
  | "desktop"
  | "tablet"
  | "iphone-15-pro"
  | "iphone-se"
  | "pixel-8";

const dimensions: Record<
  DeviceFrameVariant,
  { width: string; height: number; radius: number }
> = {
  desktop: { width: "100%", height: 0, radius: 8 },
  tablet: { width: "768px", height: 1024, radius: 24 },
  "iphone-15-pro": { width: "390px", height: 844, radius: 48 },
  "iphone-se": { width: "375px", height: 667, radius: 32 },
  "pixel-8": { width: "412px", height: 915, radius: 36 },
};

export const phoneFrameVariants: DeviceFrameVariant[] = [
  "iphone-15-pro",
  "iphone-se",
  "pixel-8",
];

export function isPhoneFrame(variant: DeviceFrameVariant): boolean {
  return phoneFrameVariants.includes(variant);
}

/**
 * Visual device chrome wrapper. Mobile variants render a bezel + status bar
 * + home indicator (iOS) or front-camera dot (Android). Desktop is just a
 * subtle browser-card border.
 */
export function DeviceFrame({
  variant,
  children,
  showStatusBar = true,
  className,
}: {
  variant: DeviceFrameVariant;
  children: React.ReactNode;
  showStatusBar?: boolean;
  className?: string;
}) {
  const dim = dimensions[variant];

  if (variant === "desktop") {
    return (
      <div
        className={cn(
          "h-full w-full overflow-hidden rounded-lg border border-white/[0.06] bg-white",
          className
        )}
      >
        {children}
      </div>
    );
  }

  if (variant === "tablet") {
    return (
      <div
        className={cn("flex flex-col items-center justify-start", className)}
        style={{ width: dim.width, maxWidth: "100%" }}
      >
        <div
          className="relative w-full overflow-hidden border-[10px] border-zinc-900 bg-white shadow-2xl"
          style={{ borderRadius: dim.radius, aspectRatio: "3 / 4" }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Phone variants — iPhone uses dynamic island, Pixel uses centered punch-hole
  const isIos = variant === "iphone-15-pro" || variant === "iphone-se";
  const showDynamicIsland = variant === "iphone-15-pro";
  const showNotch = variant === "iphone-se";

  return (
    <div
      className={cn("flex flex-col items-center justify-start", className)}
      style={{ width: dim.width, maxWidth: "100%" }}
    >
      <div
        className="relative overflow-hidden bg-zinc-950 shadow-2xl"
        style={{
          width: dim.width,
          aspectRatio: `${parseInt(dim.width)} / ${dim.height}`,
          borderRadius: dim.radius,
          padding: 8,
        }}
      >
        {/* Inner screen */}
        <div
          className="relative h-full w-full overflow-hidden bg-white"
          style={{ borderRadius: Math.max(dim.radius - 8, 16) }}
        >
          {/* Status bar overlay */}
          {showStatusBar && (
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex h-7 items-center justify-between px-6 text-[10px] font-semibold text-zinc-900">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </span>
            </div>
          )}

          {/* Notch (iPhone SE) */}
          {showNotch && (
            <div className="pointer-events-none absolute left-1/2 top-0 z-20 h-5 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-950" />
          )}

          {/* Dynamic island (iPhone 15 Pro) */}
          {showDynamicIsland && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-zinc-950" />
          )}

          {/* Front camera (Pixel 8) — centered top punch-hole */}
          {!isIos && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-zinc-950" />
          )}

          {/* Content */}
          <div
            className="absolute inset-0"
            style={{
              paddingTop: showStatusBar ? 28 : 0,
              paddingBottom: isIos ? 18 : 0,
            }}
          >
            {children}
          </div>

          {/* Home indicator (iOS) */}
          {isIos && (
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-20 h-1 w-28 -translate-x-1/2 rounded-full bg-zinc-900/40" />
          )}
        </div>
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
      <rect x="0" y="6" width="2" height="2" fill="currentColor" />
      <rect x="3" y="4" width="2" height="4" fill="currentColor" />
      <rect x="6" y="2" width="2" height="6" fill="currentColor" />
      <rect x="9" y="0" width="2" height="8" fill="currentColor" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
      <path
        d="M1 3.5a8 8 0 0 1 10 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M3 5.5a5 5 0 0 1 6 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="7.2" r="0.8" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="18" height="8" viewBox="0 0 18 8" fill="none">
      <rect
        x="0.5"
        y="0.5"
        width="14"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <rect x="2" y="2" width="11" height="4" rx="0.5" fill="currentColor" />
      <rect x="15.5" y="2.5" width="1.5" height="3" rx="0.5" fill="currentColor" />
    </svg>
  );
}
