import { ArrowRight, Boxes, Palette, Layers } from "lucide-react";

/**
 * ShellRemixDiagram
 *
 * Shell card on the left (with stack/tokens/knowledge chips) → arrow →
 * Space card on the right inheriting the same chips. Communicates: a Shell
 * is a reusable scaffold; remixing it stamps its opinion onto a fresh Space.
 */
export function ShellRemixDiagram() {
  return (
    <div className="my-4 w-full">
      <div className="flex items-stretch gap-3">
        <Card title="B2B admin shell" subtitle="Shell · scaffold" tone="shell" />
        <div className="flex shrink-0 flex-col items-center justify-center gap-1">
          <ArrowRight size={14} strokeWidth={1.5} className="text-foreground/35" />
          <span className="text-[9px] uppercase tracking-wide text-foreground/40">Remix</span>
        </div>
        <Card title="Permissions revamp" subtitle="Space · inherits everything" tone="space" />
      </div>
      <p className="mt-2 text-center text-[10.5px] text-foreground/40">
        Stack, design system, tokens, knowledge — all carried over to the new Space.
      </p>
    </div>
  );
}

function Card({
  title,
  subtitle,
  tone,
}: {
  title: string;
  subtitle: string;
  tone: "shell" | "space";
}) {
  const accent =
    tone === "shell"
      ? "border-[#695be8]/[0.30] bg-[#695be8]/[0.06]"
      : "border-white/[0.10] bg-white/[0.03]";
  return (
    <div className={`flex flex-1 flex-col gap-2 rounded-md border ${accent} p-3`}>
      <span className="text-[9px] font-medium uppercase tracking-wide text-foreground/45">
        {subtitle}
      </span>
      <span className="text-[12px] font-medium leading-tight text-foreground/85">{title}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <Chip icon={<Boxes size={9} strokeWidth={1.7} />} label="Next.js" />
        <Chip icon={<Palette size={9} strokeWidth={1.7} />} label="Acme DS v3" />
        <Chip icon={<Layers size={9} strokeWidth={1.7} />} label="Tokens" />
      </div>
    </div>
  );
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-foreground/65">
      {icon}
      {label}
    </span>
  );
}
