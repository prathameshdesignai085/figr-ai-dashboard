"use client";

import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { createShapeId } from "tldraw";
import {
  PanelLeft,
  Plus,
  Clock,
  MoreHorizontal,
  MonitorPlay,
  PenTool,
  Scan,
  Paperclip,
} from "lucide-react";
import type { Space, Shell } from "@/types";
import { useChatStore } from "@/stores/useChatStore";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useShelfStore } from "@/stores/useShelfStore";
import { useCanvasDeselectStore } from "@/stores/useCanvasDeselectStore";
import { useRouter } from "next/navigation";
import { ChatMessage } from "./chat-message";
import {
  ChatInput,
  type ContextChip,
  type FigmaLinkInfo,
  type ImageAttachmentInfo,
} from "./chat-input";
import { ChatHistoryPanel } from "./chat-history-panel";
import { matchInvocation } from "@/lib/slash-commands";
import {
  buildSpaceContext,
  getSpaceName,
  getTopContextItemNames,
} from "@/lib/space-context";
import {
  buildShellContext,
  getShellName,
  getTopShellSourceLabels,
} from "@/lib/shell-context";
import { streamDescribe, streamSkill } from "@/lib/describer-client";
import { buildPayloadForSkill } from "@/lib/skill-payloads";
import { runExtraction } from "@/lib/extract-runner";

const shellQuickActions = [
  { icon: MonitorPlay, label: "Record your screen" },
  { icon: PenTool, label: "Attach Figma frames" },
  { icon: Scan, label: "Capture webpage" },
  { icon: Paperclip, label: "Upload an image" },
] as const;

export function ChatPanel(
  props:
    | { mode: "space"; space: Space }
    | { mode: "shell"; shell: Shell }
) {
  const router = useRouter();
  const isShell = props.mode === "shell";
  const space = props.mode === "space" ? props.space : null;
  const shell = props.mode === "shell" ? props.shell : null;
  const { getActiveChat, activeChatId, createChat, createShellChat, chats } =
    useChatStore();
  const { chatHistoryOpen, toggleChatHistory, closeSidebar } = useWorkspaceStore();
  const selectedOutputIds = useShelfStore((s) => s.selectedOutputIds);
  const selectedAnnotationShapeIds = useShelfStore(
    (s) => s.selectedAnnotationShapeIds
  );
  const canvasInspectPicks = useShelfStore((s) => s.canvasInspectPicks);
  const marqueeCaptures = useShelfStore((s) => s.marqueeCaptures);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentMessage = useRef(false);

  // Composer-local chips (figma links + uploaded/pasted images).
  // Kept here rather than in useShelfStore because they're tied to the
  // composer session, not the canvas.
  const [composerChips, setComposerChips] = useState<ContextChip[]>([]);

  const activeChat = getActiveChat();
  const messages = activeChat?.messages || [];

  const allOutputs = chats
    .filter((c) =>
      isShell ? c.shellId === shell!.id : c.spaceId === space!.id
    )
    .flatMap((c) => c.messages.flatMap((m) => m.outputs));

  const contextChips = useMemo((): ContextChip[] => {
    const outputChips: ContextChip[] = allOutputs
      .filter((o) => selectedOutputIds.has(o.id))
      .map((o) => ({
        id: o.id,
        title: o.title,
        kind: "output" as const,
      }));
    const inspectChips: ContextChip[] = canvasInspectPicks.map((p) => ({
      id: p.key,
      title: `${p.outputTitle} › ${p.componentName}`,
      kind: "inspect" as const,
    }));
    const sortedAnn = [...selectedAnnotationShapeIds].sort();
    const annotationChips: ContextChip[] = sortedAnn.map((shapeId, i) => ({
      id: shapeId,
      title: `Annotation ${i + 1}`,
      kind: "annotation" as const,
    }));
    const screenshotChips: ContextChip[] = marqueeCaptures.map((cap) => ({
      id: cap.id,
      title: cap.label,
      kind: "screenshot" as const,
      dataUrl: cap.dataUrl,
    }));
    return [
      ...outputChips,
      ...inspectChips,
      ...annotationChips,
      ...screenshotChips,
      ...composerChips,
    ];
  }, [
    allOutputs,
    selectedOutputIds,
    canvasInspectPicks,
    selectedAnnotationShapeIds,
    marqueeCaptures,
    composerChips,
  ]);

  const handleRemoveContextChip = useCallback((chip: ContextChip) => {
    if (chip.kind === "figma-link" || chip.kind === "image") {
      setComposerChips((prev) => prev.filter((c) => c.id !== chip.id));
      return;
    }
    if (chip.kind === "screenshot") {
      useShelfStore.getState().removeMarqueeCapture(chip.id);
      return;
    }
    if (chip.kind === "inspect") {
      useShelfStore.getState().removeCanvasInspectPick(chip.id);
      return;
    }
    if (chip.kind === "output") {
      useCanvasDeselectStore
        .getState()
        .enqueueDeselect([createShapeId(chip.id)]);
      return;
    }
    useCanvasDeselectStore.getState().enqueueDeselect([chip.id]);
  }, []);

  const handleAddFigmaLink = useCallback((info: FigmaLinkInfo) => {
    const title = info.fileName
      ? info.frameName
        ? `${info.fileName} · ${info.frameName}`
        : info.fileName
      : info.url;
    setComposerChips((prev) => [
      ...prev,
      {
        id: `figma-${nanoid(6)}`,
        kind: "figma-link",
        title,
        url: info.url,
        fileName: info.fileName,
        frameName: info.frameName,
      },
    ]);
  }, []);

  const handleAddImage = useCallback((info: ImageAttachmentInfo) => {
    setComposerChips((prev) => [
      ...prev,
      {
        id: `img-${nanoid(6)}`,
        kind: "image",
        title: info.name,
        dataUrl: info.dataUrl,
        mimeType: info.mimeType,
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleKeepOutput = useCallback(
    (outputId: string) => {
      // Toggle kept status on the output in the chat store
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((msg) => ({
            ...msg,
            outputs: msg.outputs.map((out) =>
              out.id === outputId
                ? {
                    ...out,
                    kept: !out.kept,
                    keptAt: out.kept ? null : new Date().toISOString(),
                  }
                : out
            ),
          })),
        })),
      }));
    },
    []
  );

  const appendAssistantChunk = useCallback(
    (chatId: string, msgId: string, chunk: string) => {
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === msgId ? { ...m, content: m.content + chunk } : m
                ),
              }
            : chat
        ),
      }));
    },
    []
  );

  const setAssistantStreaming = useCallback(
    (chatId: string, msgId: string, streaming: boolean) => {
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === msgId ? { ...m, streaming } : m
                ),
              }
            : chat
        ),
      }));
    },
    []
  );

  const handleSend = useCallback(
    (content: string) => {
      if (!activeChat) return;

      // Auto-collapse context sidebar on first message
      if (!hasSentMessage.current) {
        hasSentMessage.current = true;
        closeSidebar();
      }

      const {
        selectedOutputIds: outIds,
        selectedAnnotationShapeIds: annIds,
        canvasInspectPicks: inspectPicks,
        marqueeCaptures: captures,
      } = useShelfStore.getState();
      const outputTitles = allOutputs
        .filter((o) => outIds.has(o.id))
        .map((o) => o.title);
      const inspectLabels = inspectPicks.map(
        (p) => `${p.outputTitle} › ${p.componentName} (${p.tagName})`
      );
      const annLabels = [...annIds]
        .sort()
        .map((_, i) => `Annotation ${i + 1}`);
      const screenshotLabels = captures.map((c) => c.label);
      const canvasLabels = [...outputTitles, ...inspectLabels, ...annLabels, ...screenshotLabels];
      const shellLine =
        isShell && shell
          ? (() => {
              const selectedPacks =
                shell.scaffoldPacks
                  ?.filter((pack) => pack.selected)
                  .map((pack) => pack.name) ?? [];
              const snapshot = shell.dsSnapshotRef
                ? `${shell.dsSnapshotRef.name} ${shell.dsSnapshotRef.version}`
                : "generic fallback";
              const packLabel =
                selectedPacks.length > 0 ? selectedPacks.join(", ") : "none";
              return `— Shell context: snapshot ${snapshot}; packs ${packLabel}`;
            })()
          : null;
      const fullContent =
        canvasLabels.length > 0
          ? `${content}\n\n— Selected on canvas: ${canvasLabels.join(", ")}${
              shellLine ? `\n${shellLine}` : ""
            }`
          : shellLine
            ? `${content}\n\n${shellLine}`
            : content;

      const marqueeUrls = captures
        .map((c) => c.dataUrl)
        .filter((url) => url.length > 0);
      const composerImageUrls = composerChips
        .filter((c) => c.kind === "image" && c.dataUrl)
        .map((c) => c.dataUrl as string);
      const screenshotUrls = [...marqueeUrls, ...composerImageUrls];

      const figmaAttachments = composerChips
        .filter((c) => c.kind === "figma-link" && c.url)
        .map((c) => ({
          url: c.url as string,
          fileName: c.fileName,
          frameName: c.frameName,
        }));

      const userMsgId = `msg-${Date.now()}`;
      const chatId = activeChat.id;

      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...chat.messages,
                  {
                    id: userMsgId,
                    chatId,
                    role: "user" as const,
                    content: fullContent,
                    outputs: [],
                    contextItemIds: [],
                    screenshotUrls:
                      screenshotUrls.length > 0 ? screenshotUrls : undefined,
                    figmaAttachments:
                      figmaAttachments.length > 0
                        ? figmaAttachments
                        : undefined,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : chat
        ),
      }));

      // Clear marquee captures after sending
      if (captures.length > 0) {
        useShelfStore.getState().clearMarqueeCaptures();
      }

      // Detect /figma-describe invocation
      const invocation = matchInvocation(content);
      if (invocation && invocation.command.id === "figma-describe") {
        const imageChip = composerChips.find((c) => c.kind === "image");
        const figmaChip = composerChips.find((c) => c.kind === "figma-link");

        if (!imageChip && !figmaChip) {
          const errId = `msg-${Date.now()}-err`;
          useChatStore.setState((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: [
                      ...chat.messages,
                      {
                        id: errId,
                        chatId,
                        role: "assistant" as const,
                        content:
                          "Attach a screen image or paste a Figma link before running `/figma-describe`.",
                        outputs: [],
                        contextItemIds: [],
                        timestamp: new Date().toISOString(),
                      },
                    ],
                  }
                : chat
            ),
          }));
          setComposerChips([]);
          return;
        }

        const assistantMsgId = `msg-${Date.now()}-asst`;
        const isMock = !imageChip && !!figmaChip;
        useChatStore.setState((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: assistantMsgId,
                      chatId,
                      role: "assistant" as const,
                      content: "",
                      outputs: [],
                      contextItemIds: [],
                      streaming: true,
                      mock: isMock,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : chat
          ),
        }));

        const spaceId = space?.id ?? null;
        const shellId = shell?.id ?? null;
        const productContext = isShell
          ? buildShellContext(shellId)
          : buildSpaceContext(spaceId);
        const userHint = invocation.hint || undefined;

        const finish = () => {
          setAssistantStreaming(chatId, assistantMsgId, false);
        };

        if (imageChip && imageChip.dataUrl) {
          streamDescribe(
            {
              mode: "image",
              imageBase64: imageChip.dataUrl,
              imageMimeType: imageChip.mimeType || "image/png",
              productContext,
              userHint,
            },
            {
              onChunk: (text) => appendAssistantChunk(chatId, assistantMsgId, text),
              onDone: finish,
              onError: (msg) => {
                appendAssistantChunk(
                  chatId,
                  assistantMsgId,
                  `\n\n_Describer error: ${msg}_`
                );
                finish();
              },
            }
          );
        } else if (figmaChip && figmaChip.url) {
          streamDescribe(
            {
              mode: "figma-link",
              figmaUrl: figmaChip.url,
              fileName: figmaChip.fileName,
              frameName: figmaChip.frameName,
              productContext,
              userHint,
              spaceName: isShell ? getShellName(shellId) : getSpaceName(spaceId),
              contextItemNames: isShell
                ? getTopShellSourceLabels(shellId)
                : getTopContextItemNames(spaceId),
            },
            {
              onChunk: (text) => appendAssistantChunk(chatId, assistantMsgId, text),
              onDone: finish,
              onError: (msg) => {
                appendAssistantChunk(
                  chatId,
                  assistantMsgId,
                  `\n\n_Describer error: ${msg}_`
                );
                finish();
              },
            }
          );
        }
      } else if (
        invocation &&
        !isShell &&
        space &&
        invocation.command.id === "extract-components"
      ) {
        // Client-side mock extraction — runs the loader timing + populates
        // useExtractStore + tags the assistant message with extractionId.
        void runExtraction(space.id, chatId);
      } else if (
        invocation &&
        !isShell &&
        space &&
        ["prd", "user-flow", "states", "check-design-system-compliance", "edge-cases-check"].includes(
          invocation.command.id
        )
      ) {
        // Generator-style skill (Space-context only).
        const skillId = invocation.command.id;
        const payload = buildPayloadForSkill(
          skillId,
          space.id,
          invocation.hint || undefined
        );
        if (!payload) {
          // Shouldn't happen — id was just whitelisted above. Defensive.
          return;
        }

        const assistantMsgId = `msg-${Date.now()}-asst`;
        useChatStore.setState((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      id: assistantMsgId,
                      chatId,
                      role: "assistant" as const,
                      content: "",
                      outputs: [],
                      contextItemIds: [],
                      streaming: true,
                      skillName: skillId,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : chat
          ),
        }));

        const finish = () => {
          setAssistantStreaming(chatId, assistantMsgId, false);
        };

        streamSkill(
          skillId,
          payload,
          {
            onChunk: (text) =>
              appendAssistantChunk(chatId, assistantMsgId, text),
            onDone: finish,
            onError: (msg) => {
              appendAssistantChunk(
                chatId,
                assistantMsgId,
                `\n\n_Skill error: ${msg}_`
              );
              finish();
            },
          }
        );
      }

      // Clear composer chips after sending
      setComposerChips([]);
    },
    [
      activeChat,
      closeSidebar,
      allOutputs,
      composerChips,
      space,
      shell,
      isShell,
      appendAssistantChunk,
      setAssistantStreaming,
    ]
  );

  const handleNewChat = () => {
    if (isShell) {
      const chat = createShellChat(shell!.id);
      router.push(`/shells/${shell!.id}/chat/${chat.id}`);
    } else {
      const chat = createChat(space!.id);
      router.push(`/space/${space!.id}/chat/${chat.id}`);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat history panel (slide-out) */}
      {chatHistoryOpen &&
        (isShell ? (
          <ChatHistoryPanel shellId={shell!.id} />
        ) : (
          <ChatHistoryPanel spaceId={space!.id} />
        ))}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat top bar — fixed row height; title truncates instead of wrapping */}
        <div className="flex h-9 shrink-0 min-h-9 min-w-0 flex-nowrap items-center gap-1 border-b border-white/[0.06] px-2">
          <div className="flex min-h-7 min-w-0 flex-1 items-center gap-1 overflow-hidden">
            <button
              type="button"
              onClick={toggleChatHistory}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.04] transition-colors"
            >
              <PanelLeft size={15} />
            </button>
            <div
              className="min-w-0 flex-1 overflow-hidden rounded-md bg-white/[0.04] px-2 py-1.5 text-xs font-medium leading-none text-foreground/70"
              title={activeChat?.name || "New Chat"}
            >
              <span className="block truncate whitespace-nowrap">
                {activeChat?.name || "New Chat"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="shrink-0 whitespace-nowrap rounded-md px-2 py-1.5 text-xs leading-none text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.04] transition-colors"
            >
              New Chat
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors"
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors"
            >
              <Clock size={14} />
            </button>
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/25 hover:text-foreground/40 hover:bg-white/[0.04] transition-colors"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Messages — centered column (ChatGPT-style readable line length) */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm text-foreground/30">
                    Start a conversation
                  </p>
                  <p className="mt-1 text-xs text-foreground/15">
                    {isShell
                      ? `Describe layout, tokens, and components for ${shell!.name}`
                      : `Ask anything about ${space!.name}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    onKeepOutput={handleKeepOutput}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input — same max width as thread */}
        <div className="mx-auto w-full max-w-3xl shrink-0 px-4 pb-1">
          {isShell ? (
            <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {shellQuickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="flex h-[72px] flex-col items-start justify-between rounded-xl border border-white/10 bg-transparent p-3 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.02]"
                >
                  <action.icon
                    size={18}
                    strokeWidth={1.75}
                    className="shrink-0 text-foreground/35"
                  />
                  <span className="text-[10px] leading-snug text-foreground/45">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
          <ChatInput
            onSend={handleSend}
            contextChips={contextChips}
            onRemoveContextChip={handleRemoveContextChip}
            onAddFigmaLink={handleAddFigmaLink}
            onAddImage={handleAddImage}
          />
        </div>
      </div>
    </div>
  );
}
