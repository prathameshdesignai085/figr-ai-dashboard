import { create } from "zustand";
import type { ContainerTab } from "@/types";

type SidebarMode = "context" | "shelf";

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
      set({
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
        containerOpen: true,
      });
    }
  },

  closeTab: (tabId) => {
    const state = get();
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
      };
      set({
        tabs: [...state.tabs, tab],
        activeTabId: tab.id,
        containerOpen: true,
      });
    }
  },
}));
