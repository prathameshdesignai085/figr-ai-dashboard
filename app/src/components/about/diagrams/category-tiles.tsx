import {
  FileText,
  Image as ImageIcon,
  Video,
  PenTool,
  Link as LinkIcon,
  Mic,
  FileSpreadsheet,
  Plus,
} from "lucide-react";

/**
 * CategoryTilesDiagram
 *
 * A loose grid of Knowledge category tiles + an explicit "+ Add" tile to
 * communicate user-configurability. Each tile shows a category name and an
 * asset-type icon to convey breadth (docs, sheets, Figma, video, audio,
 * images, links). Visual, not literal — order/labels are illustrative.
 */
export function CategoryTilesDiagram() {
  const tiles = [
    { label: "About Company", icon: FileText, count: "12" },
    { label: "Design System", icon: PenTool, count: "8" },
    { label: "Personas", icon: ImageIcon, count: "5" },
    { label: "Walkthroughs", icon: Video, count: "3" },
    { label: "Metrics", icon: FileSpreadsheet, count: "9" },
    { label: "Brand", icon: LinkIcon, count: "6" },
    { label: "Interviews", icon: Mic, count: "11" },
  ];

  return (
    <div className="my-4 grid w-full grid-cols-4 gap-2">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.label}
            className="flex flex-col items-start justify-between gap-3 rounded-md border border-white/[0.08] bg-white/[0.02] p-2.5"
          >
            <Icon size={14} strokeWidth={1.6} className="text-foreground/55" />
            <div className="flex w-full items-end justify-between gap-1">
              <span className="line-clamp-1 text-[10.5px] font-medium leading-tight text-foreground/80">
                {tile.label}
              </span>
              <span className="shrink-0 text-[9px] text-foreground/40">{tile.count}</span>
            </div>
          </div>
        );
      })}
      {/* Add tile — communicates configurability */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-md border border-dashed border-white/[0.10] bg-transparent p-2.5">
        <Plus size={14} strokeWidth={1.6} className="text-foreground/45" />
        <span className="text-[10.5px] font-medium leading-tight text-foreground/55">
          Add category
        </span>
      </div>
    </div>
  );
}
