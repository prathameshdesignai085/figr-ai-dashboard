"use client";

import { useState, useCallback, useRef } from "react";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Image,
  SquareDashed,
  Component,
} from "lucide-react";
import type { DesignNode } from "@/types";
import { useDesignEditorStore } from "@/stores/useDesignEditorStore";
import { cn } from "@/lib/utils";

const typeIcons: Record<DesignNode["type"], React.ComponentType<{ size?: number; className?: string }>> = {
  frame: SquareDashed,
  text: Type,
  image: Image,
  component: Component,
};

function LayerRow({
  node,
  depth,
  collapsed,
  onToggleCollapse,
}: {
  node: DesignNode;
  depth: number;
  collapsed: boolean;
  onToggleCollapse: (id: string) => void;
}) {
  const { selectedNodeId, hoveredNodeId, selectNode, hoverNode, updateNode, reorderNode } = useDesignEditorStore();
  const [editingName, setEditingName] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const hasChildren = node.children.length > 0;
  const Icon = typeIcons[node.type] || SquareDashed;

  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
  }, [node.id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== node.id) {
      reorderNode(draggedId, node.type === "frame" || node.type === "component" ? node.id : node.parentId, 0);
    }
  }, [node, reorderNode]);

  return (
    <div
      className={cn(
        "flex items-center h-7 px-1 gap-0.5 cursor-pointer transition-colors text-[11px] select-none",
        isSelected ? "bg-primary/10 text-foreground/90" : isHovered ? "bg-white/[0.03] text-foreground/70" : "text-foreground/45 hover:text-foreground/60 hover:bg-white/[0.02]",
        dragOver && "ring-1 ring-primary/40"
      )}
      style={{ paddingLeft: 4 + depth * 14 }}
      onClick={(e) => { e.stopPropagation(); selectNode(node.id); }}
      onMouseEnter={() => hoverNode(node.id)}
      onMouseLeave={() => hoverNode(null)}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Expand/collapse */}
      <button
        type="button"
        className={cn("flex h-4 w-4 items-center justify-center shrink-0", !hasChildren && "invisible")}
        onClick={(e) => { e.stopPropagation(); onToggleCollapse(node.id); }}
      >
        <ChevronRight
          size={10}
          className={cn("transition-transform", !collapsed && hasChildren && "rotate-90")}
        />
      </button>

      <Icon size={11} className="shrink-0 opacity-40" />

      {/* Name */}
      {editingName ? (
        <input
          ref={inputRef}
          defaultValue={node.name}
          className="flex-1 min-w-0 bg-transparent text-[11px] text-foreground/80 focus:outline-none border-b border-primary/40 px-0.5"
          autoFocus
          onBlur={(e) => { updateNode(node.id, { name: e.target.value || node.name }); setEditingName(false); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); }
            if (e.key === "Escape") { setEditingName(false); }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 min-w-0 truncate px-0.5"
          onDoubleClick={(e) => { e.stopPropagation(); setEditingName(true); }}
        >
          {node.name}
        </span>
      )}

      {/* Visibility toggle */}
      <button
        type="button"
        className="flex h-4 w-4 shrink-0 items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100"
        style={{ opacity: !node.visible ? 1 : undefined }}
        onClick={(e) => { e.stopPropagation(); updateNode(node.id, { visible: !node.visible }); }}
        title={node.visible ? "Hide" : "Show"}
      >
        {node.visible ? <Eye size={10} /> : <EyeOff size={10} />}
      </button>

      {/* Lock toggle */}
      <button
        type="button"
        className="flex h-4 w-4 shrink-0 items-center justify-center opacity-0 group-hover:opacity-100 hover:!opacity-100"
        style={{ opacity: node.locked ? 1 : undefined }}
        onClick={(e) => { e.stopPropagation(); updateNode(node.id, { locked: !node.locked }); }}
        title={node.locked ? "Unlock" : "Lock"}
      >
        {node.locked ? <Lock size={10} /> : <Unlock size={10} />}
      </button>
    </div>
  );
}

function LayerBranch({ nodes, depth }: { nodes: DesignNode[]; depth: number }) {
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <>
      {nodes.map((node) => {
        const isCollapsed = collapsedSet.has(node.id);
        return (
          <div key={node.id} className="group">
            <LayerRow
              node={node}
              depth={depth}
              collapsed={isCollapsed}
              onToggleCollapse={toggleCollapse}
            />
            {!isCollapsed && node.children.length > 0 && (
              <LayerBranch nodes={node.children} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </>
  );
}

export function LayerTree() {
  const { tree, selectNode } = useDesignEditorStore();

  return (
    <div
      className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.08] bg-[#111111] overflow-y-auto"
      onClick={() => selectNode(null)}
    >
      <div className="flex h-8 items-center border-b border-white/[0.08] px-3">
        <span className="text-[10px] font-medium uppercase tracking-wider text-foreground/30">Layers</span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {tree.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-xs text-foreground/15">
            No layers
          </div>
        ) : (
          <LayerBranch nodes={tree} depth={0} />
        )}
      </div>
    </div>
  );
}
