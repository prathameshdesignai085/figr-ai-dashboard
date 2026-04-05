import { create } from "zustand";
import type { DesignNode } from "@/types";

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function findAndRemove(
  nodes: DesignNode[],
  id: string
): { remaining: DesignNode[]; removed: DesignNode | null } {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      const removed = nodes[i];
      return { remaining: [...nodes.slice(0, i), ...nodes.slice(i + 1)], removed };
    }
    const result = findAndRemove(nodes[i].children, id);
    if (result.removed) {
      const updated = { ...nodes[i], children: result.remaining };
      return {
        remaining: [...nodes.slice(0, i), updated, ...nodes.slice(i + 1)],
        removed: result.removed,
      };
    }
  }
  return { remaining: nodes, removed: null };
}

function updateInTree(
  nodes: DesignNode[],
  id: string,
  patch: Partial<DesignNode>
): DesignNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch, children: patch.children ?? n.children };
    if (n.children.length > 0) {
      const updated = updateInTree(n.children, id, patch);
      if (updated !== n.children) return { ...n, children: updated };
    }
    return n;
  });
}

function findInTree(nodes: DesignNode[], id: string): DesignNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findInTree(n.children, id);
    if (found) return found;
  }
  return null;
}

function insertInTree(
  nodes: DesignNode[],
  parentId: string | null,
  node: DesignNode,
  index: number
): DesignNode[] {
  if (parentId === null) {
    const clamped = Math.min(index, nodes.length);
    return [...nodes.slice(0, clamped), node, ...nodes.slice(clamped)];
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      const clamped = Math.min(index, n.children.length);
      return {
        ...n,
        children: [
          ...n.children.slice(0, clamped),
          { ...node, parentId },
          ...n.children.slice(clamped),
        ],
      };
    }
    if (n.children.length > 0) {
      const updated = insertInTree(n.children, parentId, node, index);
      if (updated !== n.children) return { ...n, children: updated };
    }
    return n;
  });
}

const MAX_HISTORY = 50;

interface DesignEditorState {
  tree: DesignNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  sourceOutputId: string | null;
  history: DesignNode[][];
  future: DesignNode[][];

  loadTree: (tree: DesignNode[], outputId: string) => void;
  selectNode: (id: string | null) => void;
  hoverNode: (id: string | null) => void;
  updateNode: (id: string, patch: Partial<DesignNode>) => void;
  moveNode: (id: string, x: number, y: number) => void;
  resizeNode: (id: string, width: number, height: number) => void;
  reorderNode: (id: string, newParentId: string | null, index: number) => void;
  deleteNode: (id: string) => void;
  undo: () => void;
  redo: () => void;
  getTree: () => DesignNode[];
  getNode: (id: string) => DesignNode | null;
  clear: () => void;
}

export const useDesignEditorStore = create<DesignEditorState>((set, get) => ({
  tree: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  sourceOutputId: null,
  history: [],
  future: [],

  loadTree: (tree, outputId) =>
    set({ tree: deepClone(tree), sourceOutputId: outputId, selectedNodeId: null, hoveredNodeId: null, history: [], future: [] }),

  selectNode: (id) => set({ selectedNodeId: id }),
  hoverNode: (id) => set({ hoveredNodeId: id }),

  updateNode: (id, patch) => {
    const { tree, history } = get();
    const newHistory = [...history.slice(-(MAX_HISTORY - 1)), deepClone(tree)];
    const newTree = updateInTree(tree, id, patch);
    set({ tree: newTree, history: newHistory, future: [] });
  },

  moveNode: (id, x, y) => {
    get().updateNode(id, { x, y });
  },

  resizeNode: (id, width, height) => {
    get().updateNode(id, { width, height });
  },

  reorderNode: (id, newParentId, index) => {
    const { tree, history } = get();
    const newHistory = [...history.slice(-(MAX_HISTORY - 1)), deepClone(tree)];
    const { remaining, removed } = findAndRemove(tree, id);
    if (!removed) return;
    const inserted = insertInTree(remaining, newParentId, removed, index);
    set({ tree: inserted, history: newHistory, future: [] });
  },

  deleteNode: (id) => {
    const { tree, history, selectedNodeId } = get();
    const newHistory = [...history.slice(-(MAX_HISTORY - 1)), deepClone(tree)];
    const { remaining } = findAndRemove(tree, id);
    set({
      tree: remaining,
      history: newHistory,
      future: [],
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    });
  },

  undo: () => {
    const { tree, history, future } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({
      tree: prev,
      history: history.slice(0, -1),
      future: [deepClone(tree), ...future.slice(0, MAX_HISTORY - 1)],
    });
  },

  redo: () => {
    const { tree, history, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      tree: next,
      history: [...history.slice(-(MAX_HISTORY - 1)), deepClone(tree)],
      future: future.slice(1),
    });
  },

  getTree: () => get().tree,
  getNode: (id) => findInTree(get().tree, id),
  clear: () => set({ tree: [], selectedNodeId: null, hoveredNodeId: null, sourceOutputId: null, history: [], future: [] }),
}));
