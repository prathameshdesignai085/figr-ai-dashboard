"use client";

import { useCallback, useRef } from "react";
import {
  Tldraw,
  Editor,
  createShapeId,
  TLComponents,
} from "tldraw";
import "tldraw/tldraw.css";
import type { Output } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import { useShelfStore } from "@/stores/useShelfStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { CanvasToolbar } from "./canvas-toolbar";
import { SelectionActionBar } from "./selection-action-bar";
import { AnnotationPrompt } from "./annotation-prompt";
import { OutputCardShapeUtil } from "./output-shape";
import { HtmlPreviewShapeUtil } from "./html-preview-shape";
import { nanoid } from "nanoid";

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
  const { chats } = useChatStore();
  const { openTab } = useWorkspaceStore();
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

  /** Handle "Build this" */
  const handleBuildThis = useCallback(
    (sourceOutput: Output) => {
      const editor = editorRef.current;
      if (!editor) return;

      const id = `out-${nanoid(6)}`;
      const hifi: Output = {
        id,
        messageId: "",
        chatId: useChatStore.getState().activeChatId || "",
        spaceId,
        type: sourceOutput.type,
        fidelity: "hi-fi",
        title: `${sourceOutput.title} (Hi-fi)`,
        summary: `High-fidelity version of "${sourceOutput.title}".`,
        content: sourceOutput.content,
        kept: true,
        keptAt: new Date().toISOString(),
        canvasPosition: {
          x: (sourceOutput.canvasPosition?.x ?? 200) + 520,
          y: sourceOutput.canvasPosition?.y ?? 200,
        },
      };
      addOutputToCanvasAndChat(hifi);
    },
    [spaceId, addOutputToCanvasAndChat]
  );

  /** Handle "Full screen" — opens output in focused tab */
  const handleFullScreen = useCallback(
    (output: Output) => {
      openTab({
        id: `output-${output.id}`,
        type: "output",
        title: output.title,
        content: output.content,
        outputId: output.id,
      });
    },
    [openTab]
  );

  /** Handle prompt from floating selection bar */
  const handleCanvasPrompt = useCallback(
    (message: string) => {
      const editor = editorRef.current;
      const activeChatId = useChatStore.getState().activeChatId;
      if (!activeChatId) return;

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
                    content: message,
                    outputs: [],
                    contextItemIds: [],
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : chat
        ),
      }));

      // Mock AI response
      const id = `out-${nanoid(6)}`;
      const viewport = editor?.getViewportScreenBounds();
      const centerX = viewport ? viewport.w / 2 : 400;
      const centerY = viewport ? viewport.h / 2 : 300;
      const pageCenter = editor?.screenToPage({ x: centerX, y: centerY }) ?? { x: 400, y: 300 };

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
    [spaceId, addOutputToCanvasAndChat]
  );

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Set dark mode
      editor.user.updateUserPreferences({ colorScheme: "dark" });

      // Create shapes for kept outputs
      if (!shapesCreatedRef.current && keptOutputs.length > 0) {
        shapesCreatedRef.current = true;

        keptOutputs.forEach((output, index) => {
          const x = output.canvasPosition?.x ?? (index % 3) * 460 + 50;
          const y = output.canvasPosition?.y ?? Math.floor(index / 3) * 380 + 50;
          addOutputShape(editor, output, x, y);
        });

        setTimeout(() => {
          editor.zoomToFit({ animation: { duration: 300 } });
        }, 100);
      }

      // Selection → shelf store sync
      const handleSelectionChange = () => {
        const selectedShapes = editor.getSelectedShapes();
        const selectedIds = new Set(
          selectedShapes
            .map((s) => s.id.replace("shape:", ""))
            .filter((id) => keptOutputs.some((o) => o.id === id))
        );

        const currentSelected = useShelfStore.getState().selectedOutputIds;
        const currentArr = [...currentSelected].sort().join(",");
        const newArr = [...selectedIds].sort().join(",");
        if (currentArr !== newArr) {
          useShelfStore.setState({ selectedOutputIds: selectedIds });
        }
      };

      // Double-click → full screen
      const handleDoubleClick = () => {
        const selectedShapes = editor.getSelectedShapes();
        if (selectedShapes.length === 1) {
          const shapeId = selectedShapes[0].id.replace("shape:", "");
          const output = keptOutputs.find((o) => o.id === shapeId);
          if (output) {
            openTab({
              id: `output-${output.id}`,
              type: "output",
              title: output.title,
              content: output.content,
              outputId: output.id,
            });
          }
        }
      };

      editor.on("change", handleSelectionChange);
      editor.on("event", (event) => {
        if (event.name === "double_click" && event.type === "click") {
          handleDoubleClick();
        }
      });
    },
    [keptOutputs, openTab]
  );

  return (
    <div className="relative h-full">
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

      {/* Custom toolbar (left edge) */}
      <CanvasToolbar editor={editorRef.current} />

      {/* Annotation prompt (draw mode) */}
      <AnnotationPrompt
        editor={editorRef.current}
        keptOutputs={keptOutputs}
        onSend={handleCanvasPrompt}
      />

      {/* Selection action bar + prompt (floating, below selection) */}
      <SelectionActionBar
        editor={editorRef.current}
        keptOutputs={keptOutputs}
        onCreateVariations={handleCreateVariations}
        onBuildThis={handleBuildThis}
        onSend={handleCanvasPrompt}
        onFullScreen={handleFullScreen}
      />
    </div>
  );
}
