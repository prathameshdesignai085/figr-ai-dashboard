/**
 * DeviceFramesRow
 *
 * Three device silhouettes side by side (desktop, tablet, phone) drawn in
 * pure CSS — illustrates that a Space's `targetPlatform` decides the device
 * frame and build target downstream.
 */
export function DeviceFramesRow() {
  return (
    <div className="my-4 w-full">
      <div className="flex items-end justify-center gap-6 rounded-md border border-white/[0.08] bg-[#1a1a1a] p-5">
        {/* Desktop */}
        <div className="flex flex-col items-center gap-2">
          <div className="overflow-hidden rounded-md border border-white/[0.12] bg-[#0f0f12]">
            <div className="h-1 w-[140px] border-b border-white/[0.06] bg-white/[0.03]" />
            <div className="flex h-[78px] w-[140px] items-center justify-center">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-3 w-7 rounded-sm bg-white/[0.06]" />
                ))}
              </div>
            </div>
          </div>
          <div className="h-1 w-[40px] rounded-b bg-white/[0.10]" />
          <span className="text-[9.5px] text-foreground/45">desktop</span>
        </div>

        {/* Tablet */}
        <div className="flex flex-col items-center gap-2">
          <div className="overflow-hidden rounded-md border-[2px] border-white/[0.14] bg-[#0f0f12] p-1">
            <div className="flex h-[100px] w-[78px] items-center justify-center">
              <div className="grid grid-cols-2 gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-5 w-7 rounded-sm bg-white/[0.06]" />
                ))}
              </div>
            </div>
          </div>
          <span className="text-[9.5px] text-foreground/45">tablet</span>
        </div>

        {/* Phone */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative overflow-hidden rounded-[14px] border-[2px] border-white/[0.18] bg-[#0f0f12] px-1 pb-1.5 pt-2">
            {/* Dynamic island */}
            <div className="absolute left-1/2 top-1 h-1.5 w-7 -translate-x-1/2 rounded-full bg-black" />
            <div className="flex h-[100px] w-[58px] flex-col items-stretch justify-end gap-1.5 pt-3">
              <div className="mx-auto h-7 w-7 rounded-full bg-[#695be8]/[0.40]" />
              <div className="grid grid-cols-2 gap-1">
                <div className="h-4 rounded bg-white/[0.06]" />
                <div className="h-4 rounded bg-white/[0.06]" />
              </div>
              <div className="mt-auto flex items-center justify-around border-t border-white/[0.06] pt-1.5">
                <div className="h-1 w-1 rounded-full bg-white/[0.30]" />
                <div className="h-1 w-1 rounded-full bg-white/[0.30]" />
                <div className="h-1 w-1 rounded-full bg-white/[0.30]" />
              </div>
            </div>
            {/* Home indicator */}
            <div className="mx-auto mt-1 h-0.5 w-6 rounded-full bg-white/[0.20]" />
          </div>
          <span className="text-[9.5px] text-foreground/45">iPhone 15 Pro</span>
        </div>
      </div>
      <p className="mt-2 text-center text-[10.5px] text-foreground/40">
        One DeviceFrame component · five variants · used everywhere a preview renders.
      </p>
    </div>
  );
}
