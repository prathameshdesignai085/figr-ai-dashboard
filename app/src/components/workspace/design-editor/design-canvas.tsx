"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DesignNode } from "@/types";
import { useDesignEditorStore } from "@/stores/useDesignEditorStore";

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 3;
const HANDLE_SIZE = 7;

type HandleDir = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLE_CURSORS: Record<HandleDir, string> = {
  nw: "nwse-resize", n: "ns-resize", ne: "nesw-resize", e: "ew-resize",
  se: "nwse-resize", s: "ns-resize", sw: "nesw-resize", w: "ew-resize",
};

export function DesignCanvas() {
  const { tree, selectedNodeId, hoveredNodeId, selectNode, hoverNode, moveNode, resizeNode, updateNode, deleteNode, undo, redo } = useDesignEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const [dragState, setDragState] = useState<{ nodeId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ nodeId: string; dir: HandleDir; startMX: number; startMY: number; origX: number; origY: number; origW: number; origH: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") { setSpaceHeld(true); return; }
      if (editingTextId) return;
      const meta = e.metaKey || e.ctrlKey;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
      if (meta && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if (meta && e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
      if (selectedNodeId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const node = useDesignEditorStore.getState().getNode(selectedNodeId);
        if (!node || node.locked) return;
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        moveNode(selectedNodeId, node.x + dx, node.y + dy);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("keyup", onKeyUp); };
  }, [selectedNodeId, editingTextId, deleteNode, undo, redo, moveNode]);

  // Wheel zoom
  const onWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.002)));
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  // Pan via middle-click or space+drag
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && spaceHeld)) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [spaceHeld, pan]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: panStart.current.px + (e.clientX - panStart.current.x),
        y: panStart.current.py + (e.clientY - panStart.current.y),
      });
    }
  }, [isPanning]);

  const onPointerUp = useCallback(() => {
    if (isPanning) setIsPanning(false);
  }, [isPanning]);

  // Background click deselects
  const onBgClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.designBg) {
      selectNode(null);
      setEditingTextId(null);
    }
  }, [selectNode]);

  // Node drag
  const startDrag = useCallback((e: React.PointerEvent, node: DesignNode) => {
    if (node.locked || editingTextId === node.id) return;
    e.stopPropagation();
    e.preventDefault();
    selectNode(node.id);
    setDragState({ nodeId: node.id, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [selectNode, editingTextId]);

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    const dx = (e.clientX - dragState.startX) / zoom;
    const dy = (e.clientY - dragState.startY) / zoom;
    moveNode(dragState.nodeId, Math.round(dragState.origX + dx), Math.round(dragState.origY + dy));
  }, [dragState, zoom, moveNode]);

  const onDragUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Resize
  const startResize = useCallback((e: React.PointerEvent, node: DesignNode, dir: HandleDir) => {
    e.stopPropagation();
    e.preventDefault();
    setResizeState({ nodeId: node.id, dir, startMX: e.clientX, startMY: e.clientY, origX: node.x, origY: node.y, origW: node.width, origH: node.height });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeState) return;
    const dx = (e.clientX - resizeState.startMX) / zoom;
    const dy = (e.clientY - resizeState.startMY) / zoom;
    let { origX: x, origY: y, origW: w, origH: h } = resizeState;
    const dir = resizeState.dir;
    if (dir.includes("e")) w = Math.max(20, w + dx);
    if (dir.includes("w")) { w = Math.max(20, w - dx); x = x + (resizeState.origW - Math.max(20, w - dx + dx) + dx); }
    if (dir.includes("s")) h = Math.max(20, h + dy);
    if (dir.includes("n")) { h = Math.max(20, h - dy); y = y + (resizeState.origH - Math.max(20, h - dy + dy) + dy); }
    if (dir.includes("w")) x = resizeState.origX + dx;
    if (dir.includes("n")) y = resizeState.origY + dy;
    // Simplified: just update width/height
    resizeNode(resizeState.nodeId, Math.round(Math.max(20, resizeState.origW + (dir.includes("e") ? dx : dir.includes("w") ? -dx : 0))), Math.round(Math.max(20, resizeState.origH + (dir.includes("s") ? dy : dir.includes("n") ? -dy : 0))));
  }, [resizeState, zoom, resizeNode]);

  const onResizeUp = useCallback(() => {
    setResizeState(null);
  }, []);

  // Render a single node
  const renderNode = useCallback((node: DesignNode): React.ReactNode => {
    if (!node.visible) return null;
    const isSelected = selectedNodeId === node.id;
    const isHovered = hoveredNodeId === node.id && !isSelected;
    const isEditing = editingTextId === node.id;

    return (
      <div
        key={node.id}
        data-node-id={node.id}
        style={{
          position: "absolute",
          left: node.x,
          top: node.y,
          width: node.width,
          height: node.height,
          ...Object.fromEntries(
            Object.entries(node.styles).filter(([k]) =>
              ![
                "width", "height", "position", "left", "top", "right", "bottom",
                "display", "flexDirection", "alignItems", "justifyContent", "gap",
                "margin", "marginTop", "marginRight", "marginBottom", "marginLeft",
                "minWidth", "minHeight", "maxWidth", "maxHeight",
                "overflow", "transform", "zIndex",
              ].includes(k)
            )
          ),
          outline: isSelected ? "2px solid #695be8" : isHovered ? "1px dashed rgba(105,91,232,0.5)" : "none",
          outlineOffset: isSelected ? "1px" : "0px",
          cursor: node.locked ? "default" : spaceHeld ? "grab" : "move",
          userSelect: isEditing ? "text" : "none",
          overflow: node.type === "text" && isEditing ? "visible" : "hidden",
        }}
        onClick={(e) => { e.stopPropagation(); selectNode(node.id); }}
        onPointerDown={(e) => { if (!isEditing && e.button === 0 && !spaceHeld) startDrag(e, node); }}
        onPointerMove={(e) => { if (dragState?.nodeId === node.id) onDragMove(e); }}
        onPointerUp={() => { if (dragState?.nodeId === node.id) onDragUp(); }}
        onMouseEnter={() => hoverNode(node.id)}
        onMouseLeave={() => hoverNode(null)}
        onDoubleClick={(e) => {
          if (node.type === "text") { e.stopPropagation(); setEditingTextId(node.id); }
        }}
      >
        {node.type === "text" && isEditing ? (
          <span
            contentEditable
            suppressContentEditableWarning
            style={{ display: "block", width: "100%", height: "100%", outline: "none", cursor: "text" }}
            onBlur={(e) => {
              updateNode(node.id, { textContent: e.currentTarget.textContent || "" });
              setEditingTextId(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setEditingTextId(null); e.currentTarget.blur(); }
            }}
            dangerouslySetInnerHTML={{ __html: node.textContent || "" }}
          />
        ) : node.type === "text" ? (
          <span style={{ pointerEvents: "none" }}>{node.textContent}</span>
        ) : node.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={node.src} alt={node.name} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
        ) : (
          node.children.map(renderNode)
        )}

        {/* Resize handles */}
        {isSelected && !node.locked && (
          <>
            {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as HandleDir[]).map((dir) => {
              const isCorner = dir.length === 2;
              const hw = HANDLE_SIZE;
              const posStyle: React.CSSProperties = {
                position: "absolute", width: hw, height: hw, background: "#695be8",
                border: "1px solid #fff", borderRadius: isCorner ? 1 : "50%",
                cursor: HANDLE_CURSORS[dir], zIndex: 10, pointerEvents: "auto",
              };
              if (dir.includes("n")) { posStyle.top = -hw / 2; }
              if (dir.includes("s")) { posStyle.bottom = -hw / 2; }
              if (dir.includes("w")) { posStyle.left = -hw / 2; }
              if (dir.includes("e")) { posStyle.right = -hw / 2; }
              if (dir === "n" || dir === "s") { posStyle.left = "50%"; posStyle.marginLeft = -hw / 2; }
              if (dir === "w" || dir === "e") { posStyle.top = "50%"; posStyle.marginTop = -hw / 2; }
              if (dir === "nw") { posStyle.top = -hw / 2; posStyle.left = -hw / 2; }
              if (dir === "ne") { posStyle.top = -hw / 2; posStyle.right = -hw / 2; }
              if (dir === "se") { posStyle.bottom = -hw / 2; posStyle.right = -hw / 2; }
              if (dir === "sw") { posStyle.bottom = -hw / 2; posStyle.left = -hw / 2; }
              return (
                <div
                  key={dir}
                  style={posStyle}
                  onPointerDown={(e) => startResize(e, node, dir)}
                  onPointerMove={(e) => { if (resizeState?.nodeId === node.id) onResizeMove(e); }}
                  onPointerUp={() => { if (resizeState?.nodeId === node.id) onResizeUp(); }}
                />
              );
            })}
          </>
        )}
      </div>
    );
  }, [selectedNodeId, hoveredNodeId, editingTextId, spaceHeld, dragState, resizeState, selectNode, hoverNode, startDrag, onDragMove, onDragUp, startResize, onResizeMove, onResizeUp, updateNode, zoom]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-[#0d0d0d]"
      style={{ cursor: isPanning || spaceHeld ? "grabbing" : "default" }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onBgClick}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Zoom info */}
      <div className="absolute left-3 bottom-3 z-10 rounded-md bg-[#1a1a1a] border border-white/[0.08] px-2 py-1 text-[10px] text-foreground/30">
        {Math.round(zoom * 100)}%
      </div>

      {/* Transformed layer */}
      <div
        data-design-bg="true"
        style={{
          position: "absolute",
          transformOrigin: "0 0",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          willChange: "transform",
        }}
        onClick={onBgClick}
      >
        {tree.map(renderNode)}
      </div>
    </div>
  );
}
