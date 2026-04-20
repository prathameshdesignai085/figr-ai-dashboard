/**
 * WorkspaceAnatomyDiagram
 *
 * Mini three-panel wireframe of a Space: Chat (left, ~30%), Container (center,
 * widest), Context/Shelf (right, ~25%). Just rectangles + labels — the goal is
 * "oh, that's the layout" recognition, not pixel accuracy.
 */
export function WorkspaceAnatomyDiagram() {
  return (
    <div className="my-4 w-full overflow-hidden rounded-md border border-white/[0.08] bg-[#1a1a1a]">
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-2.5 py-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-foreground/30" />
        <span className="text-[9.5px] text-foreground/40">Space › Checkout v2</span>
        <span className="ml-auto text-[9.5px] text-foreground/30">canvas · settings</span>
      </div>

      {/* Three panels */}
      <div className="flex h-[180px]">
        {/* Chat panel */}
        <div className="flex w-[30%] flex-col gap-1.5 border-r border-white/[0.06] bg-white/[0.015] p-2">
          <span className="text-[9px] font-medium uppercase tracking-wide text-foreground/40">
            Chat
          </span>
          <div className="h-3 w-3/4 rounded bg-white/[0.05]" />
          <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
          <div className="h-6 w-full rounded bg-[#695be8]/[0.10]" />
          <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
          <div className="mt-auto h-6 w-full rounded border border-white/[0.08] bg-white/[0.02]" />
        </div>

        {/* Container */}
        <div className="flex flex-1 flex-col gap-1.5 bg-[#212121] p-2">
          <span className="text-[9px] font-medium uppercase tracking-wide text-foreground/40">
            Container · Canvas / Preview
          </span>
          <div className="flex flex-1 items-center justify-center rounded border border-white/[0.06] bg-white/[0.02]">
            <div className="grid grid-cols-2 gap-1.5 p-2">
              <div className="h-8 w-12 rounded bg-white/[0.06]" />
              <div className="h-8 w-12 rounded bg-white/[0.06]" />
              <div className="h-8 w-12 rounded bg-[#695be8]/[0.18]" />
              <div className="h-8 w-12 rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex w-[25%] flex-col gap-1.5 border-l border-white/[0.06] bg-white/[0.015] p-2">
          <span className="text-[9px] font-medium uppercase tracking-wide text-foreground/40">
            Context / Shelf
          </span>
          <div className="h-3 w-full rounded bg-white/[0.05]" />
          <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
          <div className="h-3 w-2/3 rounded bg-white/[0.04]" />
          <div className="h-3 w-3/4 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}
