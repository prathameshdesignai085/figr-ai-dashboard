import { create } from "zustand";
import type { ContainerTab } from "@/types";

type SidebarMode = "context" | "shelf";

function sortTabsPinnedOrder(tabs: ContainerTab[]): ContainerTab[] {
  const canvas = tabs.filter((t) => t.type === "canvas");
  const preview = tabs.filter((t) => t.type === "preview");
  const rest = tabs.filter((t) => t.type !== "canvas" && t.type !== "preview");
  return [...canvas, ...preview, ...rest];
}

function isTabPinned(tab: ContainerTab): boolean {
  if (tab.pinned) return true;
  if (tab.type === "canvas" || tab.type === "preview") return true;
  return false;
}

interface WorkspaceState {
  // Panel visibility
  containerOpen: boolean;
  sidebarOpen: boolean;
  sidebarMode: SidebarMode;
  chatHistoryOpen: boolean;

  // Container tabs
  tabs: ContainerTab[];
  activeTabId: string | null;

  // Actions — panels
  openContainer: () => void;
  closeContainer: () => void;
  toggleSidebar: (mode?: SidebarMode) => void;
  closeSidebar: () => void;
  setSidebarMode: (mode: SidebarMode) => void;
  toggleChatHistory: () => void;

  // Actions — tabs
  openTab: (tab: ContainerTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  openCanvasTab: () => void;
  /** Open/focus canvas, or collapse the container when canvas is already active (top-bar toggle). */
  toggleCanvasTab: () => void;
  /** Opens or focuses Preview tab for a build project (pinned, after Canvas). */
  openPreviewTab: (buildProjectId: string, projectName?: string) => void;
  removeTabsForBuildProject: (buildProjectId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  containerOpen: false,
  sidebarOpen: true,
  sidebarMode: "context",
  chatHistoryOpen: false,

  tabs: [],
  activeTabId: null,

  openContainer: () => set({ containerOpen: true }),

  closeContainer: () =>
    set({ containerOpen: false, tabs: [], activeTabId: null }),

  toggleSidebar: (mode) => {
    const state = get();
    if (state.sidebarOpen && (!mode || state.sidebarMode === mode)) {
      set({ sidebarOpen: false });
    } else {
      set({ sidebarOpen: true, sidebarMode: mode || state.sidebarMode });
    }
  },

  closeSidebar: () => set({ sidebarOpen: false }),

  setSidebarMode: (mode) => set({ sidebarMode: mode }),

  toggleChatHistory: () =>
    set((state) => ({ chatHistoryOpen: !state.chatHistoryOpen })),

  openTab: (tab) => {
    const state = get();
    const existing = state.tabs.find((t) => t.id === tab.id);
    if (existing) {
      set({ activeTabId: tab.id, containerOpen: true });
    } else {
      const merged = sortTabsPinnedOrder([...state.tabs, tab]);
      set({
        tabs: merged,
        activeTabId: tab.id,
        containerOpen: true,
      });
    }
  },

  closeTab: (tabId) => {
    const state = get();
    const tab = state.tabs.find((t) => t.id === tabId);
    if (!tab || isTabPinned(tab)) return;

    const newTabs = state.tabs.filter((t) => t.id !== tabId);
    const newActiveId =
      state.activeTabId === tabId
        ? newTabs.length > 0
          ? newTabs[newTabs.length - 1].id
          : null
        : state.activeTabId;

    if (newTabs.length === 0) {
      set({ tabs: [], activeTabId: null, containerOpen: false });
    } else {
      set({ tabs: newTabs, activeTabId: newActiveId });
    }
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  openCanvasTab: () => {
    const state = get();
    const canvasTab = state.tabs.find((t) => t.type === "canvas");
    if (canvasTab) {
      set({ activeTabId: canvasTab.id, containerOpen: true });
    } else {
      const tab: ContainerTab = {
        id: "canvas",
        type: "canvas",
        title: "Canvas",
        content: "",
        pinned: true,
        closable: false,
      };
      set({
        tabs: sortTabsPinnedOrder([...state.tabs, tab]),
        activeTabId: tab.id,
        containerOpen: true,
      });
    }
  },

  toggleCanvasTab: () => {
    const state = get();
    if (state.containerOpen && state.activeTabId === "canvas") {
      set({ containerOpen: false });
      return;
    }
    get().openCanvasTab();
  },

  openPreviewTab: (buildProjectId, projectName) => {
    const id = `preview-${buildProjectId}`;
    const state = get();
    const existing = state.tabs.find((t) => t.id === id);
    if (existing) {
      set({ activeTabId: id, containerOpen: true });
      return;
    }
    const tab: ContainerTab = {
      id,
      type: "preview",
      title: projectName ? `Preview · ${projectName}` : "Preview",
      content: "",
      pinned: true,
      closable: false,
      buildProjectId,
    };
    set({
      tabs: sortTabsPinnedOrder([...state.tabs, tab]),
      activeTabId: tab.id,
      containerOpen: true,
    });
  },

  removeTabsForBuildProject: (buildProjectId) => {
    const state = get();
    const prefix = `code-${buildProjectId}-`;
    const newTabs = state.tabs.filter(
      (t) =>
        t.id !== `preview-${buildProjectId}` &&
        !t.id.startsWith(prefix)
    );
    let activeTabId = state.activeTabId;
    if (!newTabs.some((t) => t.id === activeTabId)) {
      activeTabId = newTabs.length ? newTabs[newTabs.length - 1].id : null;
    }
    set({
      tabs: newTabs,
      activeTabId,
      containerOpen: newTabs.length > 0,
    });
  },
}));
