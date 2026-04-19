import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Shell, Space, ContextItem, KnowledgeCategory } from "@/types";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useChatStore } from "@/stores/useChatStore";

export type CreateShellInput = {
  name: string;
  description: string;
  techStack: string;
  designSystemNote: string;
  tokenPreferences: string;
  /** e.g. npm, pnpm, yarn — informs scaffolding assumptions */
  packageManager?: string;
  /** App Router, pages router, monorepo package, etc. */
  appRouterNote?: string;
};

interface ShellState {
  shells: Shell[];
  getShell: (id: string) => Shell | undefined;
  createShell: (input: CreateShellInput) => Shell;
  updateShell: (id: string, updates: Partial<Shell>) => void;
  /** Copy a space into a new shell (Save as Shell). */
  createShellFromSpace: (
    space: Space,
    name: string,
    description?: string
  ) => Shell;
  /** Create a new space from a shell and a main chat; returns space + chat. */
  remixToSpace: (shellId: string) => { space: Space; chat: import("@/types").Chat } | null;
}

export const useShellStore = create<ShellState>((set, get) => ({
  shells: [
    {
      id: "shell-demo-1",
      name: "B2B admin shell",
      description: "Sidebar + top bar, dense tables, token set for internal tools.",
      createdAt: "2026-03-20T12:00:00Z",
      updatedAt: "2026-03-25T09:00:00Z",
      contextItems: [
        {
          id: "shctx-1",
          name: "Layout primitives",
          type: "document",
          source: "paste",
          addedAt: "2026-03-20T12:00:00Z",
          content: "# Layout\n- AppShell, SidebarNav, PageHeader\n- Max width 1280, 8px grid",
        },
      ],
      connectedKnowledge: ["design-system"],
      instructions:
        "Use the admin shell components. Prefer data-dense tables and filter bars.",
      techStack: "Next.js, React, Tailwind",
      designSystemNote: "Internal DS — Figma library v3",
      tokenPreferences: "Radius sm/md, neutral grays, single accent",
    },
  ],

  getShell: (id) => get().shells.find((s) => s.id === id),

  createShell: (input) => {
    const now = new Date().toISOString();
    const scaffoldLines = [
      `Scaffold / implementation target: ${input.techStack.trim() || "(not specified)"}`,
      input.packageManager?.trim() &&
        `Package manager: ${input.packageManager.trim()}`,
      input.appRouterNote?.trim() &&
        `Routing / app structure: ${input.appRouterNote.trim()}`,
    ].filter(Boolean);
    const designBlock = input.designSystemNote.trim()
      ? `Design system (grounds the assistant and future codegen):\n${input.designSystemNote.trim()}`
      : "";
    const tokenBlock = input.tokenPreferences.trim()
      ? `Tokens & layout (UI constraints for the assistant):\n${input.tokenPreferences.trim()}`
      : "";
    const instructions = [scaffoldLines.join("\n"), designBlock, tokenBlock]
      .filter(Boolean)
      .join("\n\n---\n\n");

    const shell: Shell = {
      id: `shell-${nanoid(6)}`,
      name: input.name,
      description: input.description,
      createdAt: now,
      updatedAt: now,
      contextItems: [],
      connectedKnowledge: [],
      instructions,
      techStack: input.techStack.trim(),
      designSystemNote: input.designSystemNote,
      tokenPreferences: input.tokenPreferences,
    };
    set((state) => ({ shells: [...state.shells, shell] }));
    return shell;
  },

  updateShell: (id, updates) =>
    set((state) => ({
      shells: state.shells.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      ),
    })),

  createShellFromSpace: (space, name, description) => {
    const now = new Date().toISOString();
    const shell: Shell = {
      id: `shell-${nanoid(6)}`,
      name,
      description: description ?? space.description,
      createdAt: now,
      updatedAt: now,
      contextItems: space.contextItems.map((c) => ({ ...c })),
      connectedKnowledge: [...space.connectedKnowledge] as KnowledgeCategory[],
      instructions: space.instructions,
      techStack: "",
      designSystemNote: "",
      tokenPreferences: "",
      sourceSpaceId: space.id,
    };
    set((state) => ({ shells: [...state.shells, shell] }));
    return shell;
  },

  remixToSpace: (shellId) => {
    const shell = get().shells.find((s) => s.id === shellId);
    if (!shell) return null;
    const now = new Date().toISOString();
    const space: Space = {
      id: `space-${nanoid(6)}`,
      name: `${shell.name} (remix)`,
      description: shell.description,
      stage: "brainstorm",
      targetPlatform: "web",
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      chatIds: [],
      contextItems: shell.contextItems.map((c) => ({ ...c })),
      connectedKnowledge: [...shell.connectedKnowledge] as KnowledgeCategory[],
      instructions: shell.instructions,
      remixedFromShellId: shell.id,
    };
    useSpaceStore.getState().addSpace(space);
    const chat = useChatStore.getState().createChat(space.id, "Main");
    return { space, chat };
  },
}));
