import { Bookmark } from "lucide-react";

/**
 * ShelfAsDrawerDiagram
 *
 * A horizontal "drawer" shape with stacked output cards inside, communicating
 * the metaphor: kept ideas live in a drawer for "later" — not acted on now,
 * but easy to pull back out for a fresh round of brainstorming.
 */
export function ShelfAsDrawerDiagram() {
  const items = [
    "Three-step checkout — variant A",
    "Cart drawer with upsell",
    "Mobile checkout sheet",
    "Express pay row (Apple/G-Pay)",
  ];

  return (
    <div className="my-4 w-full">
      <div className="overflow-hidden rounded-md border border-white/[0.08] bg-[#1a1a1a]">
        {/* Drawer label */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Bookmark size={12} strokeWidth={1.6} className="text-foreground/55" />
            <span className="text-[10.5px] font-medium text-foreground/80">Shelf — set aside for later</span>
          </div>
          <span className="text-[9.5px] text-foreground/40">{items.length} kept</span>
        </div>

        {/* Stacked items */}
        <div className="flex flex-col gap-1.5 p-2.5">
          {items.map((label, i) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
            >
              <div className="h-2 w-2 rounded-sm bg-[#695be8]/[0.50]" />
              <span className="text-[10.5px] text-foreground/70">{label}</span>
              <span className="ml-auto text-[9px] text-foreground/35">
                kept · {i === 0 ? "today" : i === 1 ? "yesterday" : `${i + 1}d ago`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-center text-[10.5px] text-foreground/40">
        Same data as Canvas — list view, not spatial. A quiet inbox to revisit.
      </p>
    </div>
  );
}
