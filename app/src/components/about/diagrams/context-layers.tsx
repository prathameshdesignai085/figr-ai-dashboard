/**
 * ContextLayersDiagram
 *
 * Three stacked horizontal bands showing how the AI's view of context narrows
 * from company-wide down to a single message: Knowledge → Space Context → Chips.
 * The widest band sits on top; each subsequent band is narrower, suggesting scope.
 */
export function ContextLayersDiagram() {
  return (
    <div className="my-4 flex w-full flex-col items-stretch gap-1.5">
      {/* Layer 1 — Product Knowledge (widest) */}
      <div className="flex items-center justify-between rounded-md border border-white/[0.08] bg-[#695be8]/[0.10] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#695be8]" />
          <span className="text-[12px] font-medium text-foreground/85">Product Knowledge</span>
        </div>
        <span className="text-[10px] text-foreground/45">source of truth · global</span>
      </div>

      {/* Layer 2 — Space Context */}
      <div className="mx-auto flex w-[88%] items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/55" />
          <span className="text-[12px] font-medium text-foreground/80">Space Context</span>
        </div>
        <span className="text-[10px] text-foreground/45">this project</span>
      </div>

      {/* Layer 3 — Message chips (narrowest) */}
      <div className="mx-auto flex w-[68%] items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/35" />
          <span className="text-[12px] font-medium text-foreground/70">Message chips</span>
        </div>
        <span className="text-[10px] text-foreground/45">this message</span>
      </div>

      <p className="mt-1 text-center text-[10.5px] text-foreground/40">
        Every chat reads all three. Specificity grows top → bottom.
      </p>
    </div>
  );
}
