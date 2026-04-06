"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TLShapeId } from "@tldraw/tlschema";
import {
  Tldraw,
  Editor,
  createShapeId,
  TLComponents,
} from "tldraw";
import "tldraw/tldraw.css";
import type { Output } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import { useCanvasStore, type CanvasTool } from "@/stores/useCanvasStore";
import { cn } from "@/lib/utils";
import { useShelfStore } from "@/stores/useShelfStore";
import { FIGRED_MSG } from "@/components/workspace/build-preview/inspect-bridge";
import { useCanvasDeselectStore } from "@/stores/useCanvasDeselectStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { CanvasToolbar } from "./canvas-toolbar";
import {
  SelectionActionBar,
  type SelectionMoreMenuAction,
} from "./selection-action-bar";
import { AnnotationPrompt } from "./annotation-prompt";
import { MarqueeOverlay } from "./marquee-overlay";
import { OutputCardShapeUtil } from "./output-shape";
import { HtmlPreviewShapeUtil } from "./html-preview-shape";
import { nanoid } from "nanoid";
import { useBuildStore } from "@/stores/useBuildStore";
import { mockBuildFromOutput } from "@/lib/build-project/mock-build-from-output";
import { isAppLikeOutput } from "@/lib/output-view-mode";

// Hide all default tldraw UI — we provide our own
const components: TLComponents = {
  Toolbar: null,
  PageMenu: null,
  MainMenu: null,
  StylePanel: null,
  NavigationPanel: null,
  HelpMenu: null,
  ActionsMenu: null,
  QuickActions: null,
  HelperButtons: null,
  DebugPanel: null,
  DebugMenu: null,
  SharePanel: null,
  TopPanel: null,
  MenuPanel: null,
};

// Custom shape utils for tldraw
const customShapeUtils = [OutputCardShapeUtil, HtmlPreviewShapeUtil];

/** Create a tldraw shape for an output */
function addOutputShape(editor: Editor, output: Output, x: number, y: number) {
  if (output.fidelity === "built") {
    editor.createShape({
      id: createShapeId(output.id),
      type: "html-preview",
      x,
      y,
      props: {
        w: 320,
        h: 240,
        title: output.title,
        htmlContent: output.content,
      },
    });
  } else {
    const isHtml = output.content.trim().startsWith("<");
    const w = isHtml ? 480 : 420;
    const h = isHtml ? 380 : 340;

    editor.createShape({
      id: createShapeId(output.id),
      type: "output-card",
      x,
      y,
      props: {
        w,
        h,
        outputType: output.type,
        title: output.title,
        content: output.content,
        fidelity: output.fidelity,
      },
    });
  }
}

export function FigredCanvas({ spaceId }: { spaceId: string }) {
  const editorRef = useRef<Editor | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const { chats } = useChatStore();
  const shapesCreatedRef = useRef(false);

  // Get all kept outputs
  const keptOutputs: Output[] = chats
    .filter((c) => c.spaceId === spaceId)
    .flatMap((c) => c.messages.flatMap((m) => m.outputs))
    .filter((o) => o.kept);

  /** Add a mock AI output to chat store and create its canvas shape */
  const addOutputToCanvasAndChat = useCallback(
    (newOutput: Output) => {
      const editor = editorRef.current;
      const activeChatId = useChatStore.getState().activeChatId;
      if (activeChatId) {
        const msgId = `msg-${nanoid(6)}`;
        useChatStore.setState((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  updatedAt: new Date().toISOString(),
                  messages: [
                    ...chat.messages,
                    {
                      id: msgId,
                      chatId: activeChatId,
                      role: "assistant" as const,
                      content: `Here's what I created:`,
                      outputs: [newOutput],
                      contextItemIds: [],
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : chat
          ),
        }));
      }
      if (editor) {
        addOutputShape(editor, newOutput, newOutput.canvasPosition?.x ?? 400, newOutput.canvasPosition?.y ?? 300);
      }
    },
    []
  );

  /** Handle "Create variations" */
  const handleCreateVariations = useCallback(
    (sourceOutput: Output) => {
      const editor = editorRef.current;
      if (!editor) return;

      const sourceX = sourceOutput.canvasPosition?.x ?? 200;
      const sourceY = (sourceOutput.canvasPosition?.y ?? 200) + 420;

      for (let i = 0; i < 3; i++) {
        const id = `out-${nanoid(6)}`;
        const variant: Output = {
          id,
          messageId: "",
          chatId: useChatStore.getState().activeChatId || "",
          spaceId,
          type: sourceOutput.type,
          fidelity: sourceOutput.fidelity,
          title: `${sourceOutput.title} — V${i + 1}`,
          summary: `Variation ${i + 1} of "${sourceOutput.title}".`,
          content: sourceOutput.content,
          kept: true,
          keptAt: new Date().toISOString(),
          canvasPosition: { x: sourceX + i * 512, y: sourceY },
        };
        addOutputToCanvasAndChat(variant);
      }

      setTimeout(() => {
        editor.zoomToFit({ animation: { duration: 300 } });
      }, 100);
    },
    [spaceId, addOutputToCanvasAndChat]
  );

  /** Handle "Build this" — user + assistant messages in chat, scaffold project, canvas card, Preview tab */
  const handleBuildThis = useCallback(
    (sourceOutput: Output) => {
      const editor = editorRef.current;
      if (!editor) return;

      const project = mockBuildFromOutput(sourceOutput);
      useBuildStore.getState().upsertProject(project);
      useWorkspaceStore.getState().openPreviewTab(project.id, project.name);

      const primaryHtml = project.routes[0]?.previewHtml ?? "";
      const id = `out-${nanoid(6)}`;
      const activeChatId = useChatStore.getState().activeChatId;
      const built: Output = {
        id,
        messageId: "",
        chatId: activeChatId || "",
        spaceId,
        type: sourceOutput.type,
        fidelity: "built",
        title: `${sourceOutput.title} (Built)`,
        summary: `Coded product — ${project.files.length} files, ${project.routes.length} routes.`,
        content: primaryHtml,
        kept: true,
        keptAt: new Date().toISOString(),
        buildProjectId: project.id,
        canvasPosition: {
          x: (sourceOutput.canvasPosition?.x ?? 200) + 520,
          y: sourceOutput.canvasPosition?.y ?? 200,
        },
      };

      if (activeChatId) {
        const userMsgId = `msg-${nanoid(6)}`;
        const asstMsgId = `msg-${nanoid(6)}`;
        useChatStore.setState((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  updatedAt: new Date().toISOString(),
                  messages: [
                    ...chat.messages,
                    {
                      id: userMsgId,
                      chatId: activeChatId,
                      role: "user" as const,
                      content: `Build **${sourceOutput.title}** into a coded product.`,
                      outputs: [],
                      contextItemIds: [],
                      timestamp: new Date().toISOString(),
                    },
                    {
                      id: asstMsgId,
                      chatId: activeChatId,
                      role: "assistant" as const,
                      content:
                        "Added a **Built** card on the canvas with a full-file scaffold. Use **Preview** on that card (or this tab) to explore the live preview and codebase.",
                      outputs: [built],
                      contextItemIds: [],
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : chat
          ),
        }));
      }

      addOutputShape(
        editor,
        built,
        built.canvasPosition?.x ?? 400,
        built.canvasPosition?.y ?? 300
      );
    },
    [spaceId]
  );

  /** Documents / diagrams — focused tab */
  const handleFullScreen = useCallback((output: Output) => {
    useWorkspaceStore.getState().openTab({
      id: `output-${output.id}`,
      type: "output",
      title: output.title,
      content: output.content,
      outputId: output.id,
    });
  }, []);

  /** Prototypes / built — Preview tab (coded) or output iframe */
  const handlePreview = useCallback((output: Output) => {
    if (output.fidelity === "built" && output.buildProjectId) {
      const proj = useBuildStore.getState().getProject(output.buildProjectId);
      useWorkspaceStore.getState().openPreviewTab(
        output.buildProjectId,
        proj?.name
      );
      return;
    }
    useWorkspaceStore.getState().openTab({
      id: `output-${output.id}`,
      type: "output",
      title: output.title,
      content: output.content,
      outputId: output.id,
    });
  }, []);

  /** Handle "Edit" — open a design-editor tab for an output */
  const handleEdit = useCallback((output: Output) => {
    useWorkspaceStore.getState().openTab({
      id: `design-${output.id}`,
      type: "design-editor",
      title: `Edit: ${output.title}`,
      content: output.content,
      outputId: output.id,
    });
  }, []);

  /** Kebab menu on selection bar — design system, Figma, remix (chat + mock assistant) */
  const handleSelectionMoreMenu = useCallback(
    (action: SelectionMoreMenuAction, outputs: Output[]) => {
      const activeChatId = useChatStore.getState().activeChatId;
      if (!activeChatId || outputs.length === 0) return;

      const names = outputs.map((o) => o.title).join(", ");
      const userLines: Record<SelectionMoreMenuAction, string> = {
        "design-system": `Create a design system out of **${names}**.`,
        figma: `Copy **${names}** to Figma.`,
        remix: `Remix **${names}** in a new space.`,
      };
      const assistLines: Record<SelectionMoreMenuAction, string> = {
        "design-system":
          "I will extract tokens, components, and usage from this screen into a structured design system. (Mock — connect generation when backend is ready.)",
        figma:
          "Preparing a Figma-ready handoff for this screen. (Mock — connect Figma export when available.)",
        remix:
          "Cloning this design into a new space with its own chat and canvas. (Mock — wire space creation next.)",
      };

      const userMsgId = `msg-${nanoid(6)}`;
      const asstMsgId = `msg-${nanoid(6)}`;
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...chat.messages,
                  {
                    id: userMsgId,
                    chatId: activeChatId,
                    role: "user" as const,
                    content: userLines[action],
                    outputs: [],
                    contextItemIds: [],
                    timestamp: new Date().toISOString(),
                  },
                  {
                    id: asstMsgId,
                    chatId: activeChatId,
                    role: "assistant" as const,
                    content: assistLines[action],
                    outputs: [],
                    contextItemIds: [],
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : chat
        ),
      }));
    },
    []
  );

  /** Handle prompt from floating selection bar (single prompt or multi combine) */
  const handleCanvasPrompt = useCallback(
    (message: string) => {
      const editor = editorRef.current;
      const activeChatId = useChatStore.getState().activeChatId;
      if (!activeChatId) return;

      const {
        selectedOutputIds: selectedIds,
        selectedAnnotationShapeIds: annSet,
        canvasInspectPicks: inspectPicks,
      } = useShelfStore.getState();
      const selected = keptOutputs.filter((o) => selectedIds.has(o.id));
      const annCount = annSet.size;
      const contextBits: string[] = [];
      if (selected.length) contextBits.push(`${selected.length} screen(s)`);
      if (inspectPicks.length) {
        contextBits.push(
          `inspected: ${inspectPicks.map((p) => `${p.outputTitle} › ${p.componentName}`).join("; ")}`
        );
      }
      if (annCount) contextBits.push(`${annCount} annotation(s)`);
      const userContent =
        contextBits.length > 0
          ? `${message}\n\n— Canvas context: ${contextBits.join(", ")}`
          : message;

      // Add user message
      const userMsgId = `msg-${nanoid(6)}`;
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...chat.messages,
                  {
                    id: userMsgId,
                    chatId: activeChatId,
                    role: "user" as const,
                    content: userContent,
                    outputs: [],
                    contextItemIds: [],
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : chat
        ),
      }));

      const viewport = editor?.getViewportScreenBounds();
      const centerX = viewport ? viewport.w / 2 : 400;
      const centerY = viewport ? viewport.h / 2 : 300;
      const pageCenter = editor?.screenToPage({ x: centerX, y: centerY }) ?? { x: 400, y: 300 };

      if (selected.length >= 2) {
        const id = `out-${nanoid(6)}`;
        const merged: Output = {
          id,
          messageId: "",
          chatId: activeChatId,
          spaceId,
          type: "screen",
          fidelity: "hi-fi",
          title: `Combined (${selected.length})`,
          summary: `Merged with instruction: "${message.slice(0, 120)}${message.length > 120 ? "…" : ""}"`,
          content: selected.map((o) => `<!-- ${o.title} -->\n${o.content}`).join("\n\n"),
          kept: true,
          keptAt: new Date().toISOString(),
          canvasPosition: { x: pageCenter.x - 240, y: pageCenter.y - 190 },
        };
        addOutputToCanvasAndChat(merged);
        editor?.setSelectedShapes([]);
        useShelfStore.getState().clearSelection();
        setTimeout(() => editor?.zoomToFit({ animation: { duration: 300 } }), 100);
        return;
      }

      const id = `out-${nanoid(6)}`;
      const newOutput: Output = {
        id,
        messageId: "",
        chatId: activeChatId,
        spaceId,
        type: "screen",
        fidelity: "wireframe",
        title: message.slice(0, 50),
        summary: `Generated from prompt: "${message}"`,
        content: `# ${message}\n\nGenerated content based on your prompt.`,
        kept: true,
        keptAt: new Date().toISOString(),
        canvasPosition: { x: pageCenter.x - 210, y: pageCenter.y - 170 },
      };
      addOutputToCanvasAndChat(newOutput);
    },
    [spaceId, keptOutputs, addOutputToCanvasAndChat]
  );

  const handleMount = useCallback(
    (mounted: Editor) => {
      editorRef.current = mounted;
      setEditor(mounted);

      const getKeptOutputs = () =>
        useChatStore
          .getState()
          .chats.filter((c) => c.spaceId === spaceId)
          .flatMap((c) => c.messages.flatMap((m) => m.outputs))
          .filter((o) => o.kept);

      // Set dark mode
      mounted.user.updateUserPreferences({ colorScheme: "dark" });

      // Create shapes for kept outputs
      const initialKept = getKeptOutputs();
      if (!shapesCreatedRef.current && initialKept.length > 0) {
        shapesCreatedRef.current = true;

        initialKept.forEach((output, index) => {
          const x = output.canvasPosition?.x ?? (index % 3) * 460 + 50;
          const y = output.canvasPosition?.y ?? Math.floor(index / 3) * 380 + 50;
          addOutputShape(mounted, output, x, y);
        });

        setTimeout(() => {
          mounted.zoomToFit({ animation: { duration: 300 } });
        }, 100);
      }

      // Selection → shelf store sync
      const handleSelectionChange = () => {
        const list = getKeptOutputs();
        const selectedShapes = mounted.getSelectedShapes();
        const selectedIds = new Set(
          selectedShapes
            .map((s) => s.id.replace("shape:", ""))
            .filter((id) => list.some((o) => o.id === id))
        );

        const annotationIds = new Set(
          selectedShapes
            .filter((s) => s.type === "draw" || s.type === "highlight")
            .map((s) => s.id)
        );

        const currentSelected = useShelfStore.getState().selectedOutputIds;
        const currentArr = [...currentSelected].sort().join(",");
        const newArr = [...selectedIds].sort().join(",");

        const currentAnn = useShelfStore.getState().selectedAnnotationShapeIds;
        const annArr = [...currentAnn].sort().join(",");
        const newAnnArr = [...annotationIds].sort().join(",");

        if (currentArr !== newArr || annArr !== newAnnArr) {
          useShelfStore.setState({
            ...(currentArr !== newArr ? { selectedOutputIds: selectedIds } : {}),
            ...(annArr !== newAnnArr
              ? { selectedAnnotationShapeIds: annotationIds }
              : {}),
          });
        }
      };

      // Double-click → Preview (app-like) or Full screen (documents)
      const handleDoubleClick = () => {
        const selectedShapes = mounted.getSelectedShapes();
        if (selectedShapes.length === 1) {
          const shapeId = selectedShapes[0].id.replace("shape:", "");
          const output = getKeptOutputs().find((o) => o.id === shapeId);
          if (!output) return;
          if (isAppLikeOutput(output)) {
            if (output.fidelity === "built" && output.buildProjectId) {
              const proj = useBuildStore.getState().getProject(output.buildProjectId);
              useWorkspaceStore.getState().openPreviewTab(
                output.buildProjectId,
                proj?.name
              );
            } else {
              useWorkspaceStore.getState().openTab({
                id: `output-${output.id}`,
                type: "output",
                title: output.title,
                content: output.content,
                outputId: output.id,
              });
            }
          } else {
            useWorkspaceStore.getState().openTab({
              id: `output-${output.id}`,
              type: "output",
              title: output.title,
              content: output.content,
              outputId: output.id,
            });
          }
        }
      };

      mounted.on("change", handleSelectionChange);
      mounted.on("event", (event) => {
        if (event.name === "double_click" && event.type === "click") {
          handleDoubleClick();
        }
      });
    },
    [spaceId]
  );

  const canvasShellRef = useRef<HTMLDivElement>(null);

  /** Canvas inspect tool: iframe posts SELECT with outputId → add chips for chat context. */
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const d = e.data;
      if (!d || typeof d !== "object") return;
      if (d.type !== FIGRED_MSG.SELECT) return;
      if (!d.outputId || typeof d.outputId !== "string") return;
      if (useCanvasStore.getState().activeTool !== "inspect") return;
      const inspectId = d.inspectId;
      if (!inspectId || typeof inspectId !== "string") return;

      const outputs = useChatStore
        .getState()
        .chats.filter((c) => c.spaceId === spaceId)
        .flatMap((c) => c.messages.flatMap((m) => m.outputs));
      const out = outputs.find((o) => o.id === d.outputId);
      const outputTitle = out?.title ?? "Screen";

      useShelfStore.getState().addCanvasInspectPick({
        outputId: d.outputId,
        inspectId,
        componentName: String(d.componentName ?? "element"),
        tagName: String(d.tagName ?? "div"),
        outputTitle,
      });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [spaceId]);

  // Listen for design-editor check-in events and update tldraw shapes
  useEffect(() => {
    if (!editor) return;
    const onCheckIn = (e: Event) => {
      const { outputId, html } = (e as CustomEvent).detail as { outputId: string; html: string };
      const shapeId = `shape:${outputId}` as TLShapeId;
      const shape = editor.getShape(shapeId);
      if (shape) {
        if (shape.type === "output-card") {
          editor.updateShape({ id: shapeId, type: "output-card", props: { content: html } });
        } else if (shape.type === "html-preview") {
          editor.updateShape({ id: shapeId, type: "html-preview", props: { htmlContent: html } });
        }
      }
    };
    window.addEventListener("figred:design-checkin", onCheckIn);
    return () => window.removeEventListener("figred:design-checkin", onCheckIn);
  }, [editor]);

  // Keyboard shortcuts for canvas tools
  useEffect(() => {
    const focusWorkspaceChat = () => {
      queueMicrotask(() => {
        window.dispatchEvent(new CustomEvent("figred:focus-workspace-chat-composer"));
      });
    };

    const applyTldrawTool = (tool: CanvasTool) => {
      if (!editor) return;
      const tldrawTool =
        tool === "draw" ? "draw" : tool === "pan" ? "hand" : "select";
      editor.setCurrentTool(tldrawTool);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const modM =
        (e.metaKey || e.ctrlKey) &&
        key === "m" &&
        !e.altKey &&
        !e.repeat;

      if (modM) {
        e.preventDefault();
        useCanvasStore.getState().setActiveTool("marquee");
        applyTldrawTool("marquee");
        focusWorkspaceChat();
        return;
      }

      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const toolMap: Record<string, CanvasTool> = {
        v: "select",
        i: "inspect",
        d: "draw",
        h: "pan",
      };
      const tool = toolMap[key];
      if (!tool) return;

      e.preventDefault();
      useCanvasStore.getState().setActiveTool(tool);
      applyTldrawTool(tool);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  const activeTool = useCanvasStore((s) => s.activeTool);

  useEffect(() => {
    if (!editor) return;
    const drainDeselectQueue = () => {
      const { queue } = useCanvasDeselectStore.getState();
      if (queue.length === 0) return;
      const ids = [...queue];
      useCanvasDeselectStore.setState({ queue: [] });
      for (const id of ids) {
        try {
          editor.deselect(id as TLShapeId);
        } catch {
          /* shape removed */
        }
      }
    };
    const unsub = useCanvasDeselectStore.subscribe(drainDeselectQueue);
    drainDeselectQueue();
    return unsub;
  }, [editor]);

  return (
    <div
      ref={canvasShellRef}
      className={cn("relative h-full min-h-0", activeTool === "marquee" && "cursor-crosshair")}
    >
      {/* tldraw instance */}
      <div className="absolute inset-0">
        <Tldraw
          onMount={handleMount}
          shapeUtils={customShapeUtils}
          components={components}
          options={{
            maxPages: 1,
          }}
        />
      </div>

      {/* Marquee screenshot overlay */}
      <MarqueeOverlay canvasShellRef={canvasShellRef} />

      {/* Custom toolbar (left edge) */}
      <CanvasToolbar editor={editor} />

      {/* Annotation prompt (draw mode) */}
      <AnnotationPrompt
        editor={editor}
        overlayContainerRef={canvasShellRef}
        keptOutputs={keptOutputs}
        onSend={handleCanvasPrompt}
      />

      {/* Selection action bar + prompt (floating, below selection) */}
      <SelectionActionBar
        editor={editor}
        overlayContainerRef={canvasShellRef}
        keptOutputs={keptOutputs}
        onCreateVariations={handleCreateVariations}
        onBuildThis={handleBuildThis}
        onSend={handleCanvasPrompt}
        onFullScreen={handleFullScreen}
        onPreview={handlePreview}
        onEdit={handleEdit}
        onMoreMenuAction={handleSelectionMoreMenu}
      />
    </div>
  );
}
