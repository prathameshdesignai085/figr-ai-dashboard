"use client";

import { useState } from "react";
import { ChevronRight, FileCode, FileJson, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Entry =
  | { kind: "dir"; name: string; children: Entry[] }
  | { kind: "file"; name: string };

const MOCK_TREE: Entry[] = [
  {
    kind: "dir",
    name: "app",
    children: [
      { kind: "file", name: "layout.tsx" },
      { kind: "file", name: "page.tsx" },
      {
        kind: "dir",
        name: "(shell)",
        children: [
          { kind: "file", name: "layout.tsx" },
          { kind: "file", name: "loading.tsx" },
        ],
      },
    ],
  },
  {
    kind: "dir",
    name: "components",
    children: [
      { kind: "file", name: "app-shell.tsx" },
      { kind: "file", name: "sidebar-nav.tsx" },
      { kind: "file", name: "data-table.tsx" },
    ],
  },
  { kind: "dir", name: "lib", children: [{ kind: "file", name: "utils.ts" }] },
  { kind: "file", name: "package.json" },
];

function FileIcon({ name }: { name: string }) {
  if (name.endsWith(".json"))
    return <FileJson size={14} className="shrink-0 text-foreground/40" />;
  return <FileCode size={14} className="shrink-0 text-foreground/40" />;
}

function Row({
  depth,
  children,
}: {
  depth: number;
  children: React.ReactNode;
}) {
  return (
    <div className="select-none" style={{ paddingLeft: depth * 12 }}>
      {children}
    </div>
  );
}

function DirNode({
  node,
  depth,
}: {
  node: Extract<Entry, { kind: "dir" }>;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  return (
    <div>
      <Row depth={depth}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1 rounded-md py-1 pr-2 text-left text-xs text-foreground/55 hover:bg-white/[0.04]"
        >
          <ChevronRight
            size={12}
            className={cn(
              "shrink-0 text-foreground/30 transition-transform",
              open && "rotate-90"
            )}
          />
          {open ? (
            <FolderOpen size={14} className="shrink-0 text-amber-500/50" />
          ) : (
            <Folder size={14} className="shrink-0 text-amber-500/40" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
      </Row>
      {open &&
        node.children.map((c, i) =>
          c.kind === "dir" ? (
            <DirNode key={`${node.name}/${c.name}`} node={c} depth={depth + 1} />
          ) : (
            <Row key={`${node.name}/${c.name}-${i}`} depth={depth + 1}>
              <div className="flex items-center gap-1.5 rounded-md py-1 pr-2 text-xs text-foreground/45 hover:bg-white/[0.03]">
                <span className="w-3 shrink-0" />
                <FileIcon name={c.name} />
                <span className="truncate font-mono">{c.name}</span>
              </div>
            </Row>
          )
        )}
    </div>
  );
}

export function ShellMockFileTree() {
  return (
    <div className="flex h-full min-h-0 w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-[#141414]">
      <div className="border-b border-white/[0.06] px-3 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/35">
          Prototype files
        </span>
        <p className="mt-0.5 text-[10px] text-foreground/25">
          Demo tree — not synced to a build
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {MOCK_TREE.map((e, i) =>
          e.kind === "dir" ? (
            <DirNode key={e.name + i} node={e} depth={0} />
          ) : (
            <Row key={e.name + i} depth={0}>
              <div className="flex items-center gap-1.5 rounded-md py-1 text-xs text-foreground/45">
                <FileIcon name={e.name} />
                <span className="truncate font-mono">{e.name}</span>
              </div>
            </Row>
          )
        )}
      </div>
    </div>
  );
}
