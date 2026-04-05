"use client";

import { useMemo } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/types";
import { useBuildStore } from "@/stores/useBuildStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

type TreeNode =
  | { kind: "dir"; path: string; name: string; children: TreeNode[] }
  | { kind: "file"; path: string; file: ProjectFile };

function buildTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  const dirMap = new Map<string, TreeNode & { kind: "dir" }>();

  function ensureDir(parts: string[], idx: number, parentList: TreeNode[]): TreeNode[] {
    if (idx >= parts.length - 1) return parentList;
    const name = parts[idx];
    const path = parts.slice(0, idx + 1).join("/");
    let dir = dirMap.get(path);
    if (!dir) {
      dir = { kind: "dir", path, name, children: [] };
      dirMap.set(path, dir);
      parentList.push(dir);
    }
    return ensureDir(parts, idx + 1, dir.children);
  }

  for (const file of files) {
    const parts = file.path.split("/").filter(Boolean);
    if (parts.length < 1) continue;
    if (parts.length === 1) {
      root.push({ kind: "file", path: file.path, file });
    } else {
      const parentList = ensureDir(parts, 0, root);
      parentList.push({ kind: "file", path: file.path, file });
    }
  }

  function sortNodes(nodes: TreeNode[]): TreeNode[] {
    return [...nodes]
      .map((n) =>
        n.kind === "dir" ? { ...n, children: sortNodes(n.children) } : n
      )
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
        return a.path.localeCompare(b.path);
      });
  }

  return sortNodes(root);
}

function FileIcon({ name }: { name: string }) {
  if (name.endsWith(".tsx") || name.endsWith(".ts"))
    return <FileCode size={14} className="shrink-0 text-foreground/40" />;
  if (name.endsWith(".json"))
    return <FileJson size={14} className="shrink-0 text-foreground/40" />;
  return <File size={14} className="shrink-0 text-foreground/40" />;
}

function DirRow({
  node,
  depth,
  projectId,
}: {
  node: TreeNode & { kind: "dir" };
  depth: number;
  projectId: string;
}) {
  const collapsed = useBuildStore((s) => s.isFolderCollapsed(projectId, node.path));
  const toggleFolder = useBuildStore((s) => s.toggleFolder);
  const Icon = collapsed ? Folder : FolderOpen;

  return (
    <div>
      <button
        type="button"
        onClick={() => toggleFolder(projectId, node.path)}
        className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-foreground/50 hover:bg-white/[0.04] hover:text-foreground/70"
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <Icon size={14} className="shrink-0 text-foreground/35" />
        <span className="truncate">{node.name}</span>
      </button>
      {!collapsed && (
        <TreeList nodes={node.children} depth={depth + 1} projectId={projectId} />
      )}
    </div>
  );
}

function TreeList({
  nodes,
  depth,
  projectId,
}: {
  nodes: TreeNode[];
  depth: number;
  projectId: string;
}) {
  const openTab = useWorkspaceStore((s) => s.openTab);

  return (
    <>
      {nodes.map((node) =>
        node.kind === "dir" ? (
          <DirRow key={node.path} node={node} depth={depth} projectId={projectId} />
        ) : (
          <button
            key={node.path}
            type="button"
            onClick={() =>
              openTab({
                id: `code-${projectId}-${node.path.replace(/\//g, "›")}`,
                type: "code",
                title: node.file.name,
                content: node.file.content,
                buildProjectId: projectId,
                filePath: node.path,
                closable: true,
                pinned: false,
              })
            }
            className={cn(
              "flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs text-foreground/50 hover:bg-white/[0.04] hover:text-foreground/80"
            )}
            style={{ paddingLeft: 8 + depth * 16 }}
          >
            <FileIcon name={node.file.name} />
            <span className="truncate">{node.file.name}</span>
          </button>
        )
      )}
    </>
  );
}

export function BuildFileTree({ projectId, files }: { projectId: string; files: ProjectFile[] }) {
  const tree = useMemo(() => buildTree(files), [files]);

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.08] bg-[#161616]">
      <div className="border-b border-white/[0.08] px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/35">
          Figred
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <TreeList nodes={tree} depth={0} projectId={projectId} />
      </div>
    </div>
  );
}
