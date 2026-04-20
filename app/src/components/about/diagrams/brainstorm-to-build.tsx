import { ArrowRight, MessageSquare, Bookmark, LayoutGrid } from "lucide-react";

/**
 * BrainstormToBuildDiagram
 *
 * Four nodes connected by arrows showing the journey:
 *   Chat output → Kept → Variations → Built (Live).
 * The "bridge" visual that explains how exploration upgrades into a real
 * prototype on a single surface (Canvas).
 */
export function BrainstormToBuildDiagram() {
  return (
    <div className="my-4 w-full">
      <div className="flex items-stretch gap-2">
        <Node
          icon={<MessageSquare size={13} strokeWidth={1.6} className="text-foreground/55" />}
          label="Chat output"
          sub="from a prompt"
        />
        <Arrow />
        <Node
          icon={<Bookmark size={13} strokeWidth={1.6} className="text-foreground/55" />}
          label="Kept"
          sub="on the Shelf"
        />
        <Arrow />
        <Node
          icon={<LayoutGrid size={13} strokeWidth={1.6} className="text-foreground/55" />}
          label="Variations"
          sub="explore on canvas"
        />
        <Arrow />
        <BuiltNode />
      </div>
      <p className="mt-2 text-center text-[10.5px] text-foreground/40">
        One surface — no mode switch from sketch to live prototype.
      </p>
    </div>
  );
}

function Node({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] p-2.5">
      {icon}
      <span className="text-[10.5px] font-medium leading-tight text-foreground/80">{label}</span>
      <span className="text-[9.5px] leading-tight text-foreground/40">{sub}</span>
    </div>
  );
}

function BuiltNode() {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-md border border-emerald-400/[0.20] bg-emerald-400/[0.06] p-2.5">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[8.5px] font-medium uppercase tracking-wide text-emerald-300/90">
          Live
        </span>
      </div>
      <span className="text-[10.5px] font-medium leading-tight text-foreground/85">Built</span>
      <span className="text-[9.5px] leading-tight text-foreground/45">real project</span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex shrink-0 items-center justify-center px-0.5">
      <ArrowRight size={12} strokeWidth={1.5} className="text-foreground/30" />
    </div>
  );
}
