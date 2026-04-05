import { create } from "zustand";
import type { BuildProject, InspectedElement } from "@/types";

interface BuildState {
  projects: BuildProject[];
  activeProjectId: string | null;
  activeRouteByProject: Record<string, string>;
  inspectModeByProject: Record<string, boolean>;
  inspectedElementByProject: Record<string, InspectedElement | null>;
  fileTreeOpen: boolean;
  /** projectId -> set of collapsed folder paths (e.g. "src/components") */
  collapsedFoldersByProject: Record<string, Set<string>>;

  upsertProject: (project: BuildProject) => void;
  removeProject: (projectId: string) => void;
  setActiveProject: (id: string | null) => void;
  getProject: (id: string) => BuildProject | undefined;
  setActiveRoute: (projectId: string, routePath: string) => void;
  toggleInspect: (projectId: string) => void;
  setInspectMode: (projectId: string, on: boolean) => void;
  setInspectedElement: (projectId: string, el: InspectedElement | null) => void;
  updateFileContent: (projectId: string, filePath: string, content: string) => void;
  updateRoutePreviewHtml: (projectId: string, routePath: string, previewHtml: string) => void;
  toggleFileTree: () => void;
  setFileTreeOpen: (open: boolean) => void;
  toggleFolder: (projectId: string, folderPath: string) => void;
  isFolderCollapsed: (projectId: string, folderPath: string) => boolean;
}

export const useBuildStore = create<BuildState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  activeRouteByProject: {},
  inspectModeByProject: {},
  inspectedElementByProject: {},
  fileTreeOpen: false,
  collapsedFoldersByProject: {},

  upsertProject: (project) => {
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === project.id);
      const projects =
        idx >= 0
          ? state.projects.map((p, i) => (i === idx ? project : p))
          : [...state.projects, project];
      const defaultRoute = project.routes[0]?.path ?? "/";
      return {
        projects,
        activeProjectId: project.id,
        activeRouteByProject: {
          ...state.activeRouteByProject,
          [project.id]: state.activeRouteByProject[project.id] ?? defaultRoute,
        },
      };
    });
  },

  removeProject: (projectId) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      activeProjectId:
        state.activeProjectId === projectId ? null : state.activeProjectId,
    }));
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  getProject: (id) => get().projects.find((p) => p.id === id),

  setActiveRoute: (projectId, routePath) =>
    set((state) => ({
      activeRouteByProject: { ...state.activeRouteByProject, [projectId]: routePath },
    })),

  toggleInspect: (projectId) =>
    set((state) => {
      const on = !state.inspectModeByProject[projectId];
      return {
        inspectModeByProject: { ...state.inspectModeByProject, [projectId]: on },
        inspectedElementByProject: on
          ? state.inspectedElementByProject
          : { ...state.inspectedElementByProject, [projectId]: null },
      };
    }),

  setInspectMode: (projectId, on) =>
    set((state) => ({
      inspectModeByProject: { ...state.inspectModeByProject, [projectId]: on },
      inspectedElementByProject: on
        ? state.inspectedElementByProject
        : { ...state.inspectedElementByProject, [projectId]: null },
    })),

  setInspectedElement: (projectId, el) =>
    set((state) => ({
      inspectedElementByProject: { ...state.inspectedElementByProject, [projectId]: el },
    })),

  updateFileContent: (projectId, filePath, content) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id !== projectId
          ? p
          : {
              ...p,
              files: p.files.map((f) =>
                f.path === filePath ? { ...f, content } : f
              ),
            }
      ),
    })),

  updateRoutePreviewHtml: (projectId, routePath, previewHtml) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id !== projectId
          ? p
          : {
              ...p,
              routes: p.routes.map((r) =>
                r.path === routePath ? { ...r, previewHtml } : r
              ),
            }
      ),
    })),

  toggleFileTree: () => set((s) => ({ fileTreeOpen: !s.fileTreeOpen })),

  setFileTreeOpen: (open) => set({ fileTreeOpen: open }),

  toggleFolder: (projectId, folderPath) =>
    set((state) => {
      const byProj = { ...state.collapsedFoldersByProject };
      const setForProj = new Set(byProj[projectId] ?? []);
      if (setForProj.has(folderPath)) setForProj.delete(folderPath);
      else setForProj.add(folderPath);
      byProj[projectId] = setForProj;
      return { collapsedFoldersByProject: byProj };
    }),

  isFolderCollapsed: (projectId, folderPath) => {
    return get().collapsedFoldersByProject[projectId]?.has(folderPath) ?? false;
  },
}));
