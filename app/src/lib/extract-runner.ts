"use client";

import { nanoid } from "nanoid";
import { useChatStore } from "@/stores/useChatStore";
import { useExtractStore } from "@/stores/useExtractStore";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { getMockCandidatesForSpace } from "@/lib/extract-mock-data";
import type { ExtractedComponent } from "@/types";

/**
 * Stage labels for the simulated extraction. Icons + active-step animation
 * are owned by the renderer (ExtractionLoaderView in chat-message). Order
 * here is significant — the runner advances `extractionProgress.currentStepIndex`
 * through this list.
 */
export const EXTRACTION_STEPS = [
  "Reading captured prototype states",
  "Identifying recurring patterns across screens",
  "Scoring component quality and reusability",
] as const;

const STEP_DELAYS_MS = [1500, 2000, 1500];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function patchMessage(
  chatId: string,
  msgId: string,
  patch: Record<string, unknown>
) {
  useChatStore.setState((state) => ({
    chats: state.chats.map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            messages: chat.messages.map((m) =>
              m.id === msgId ? { ...m, ...patch } : m
            ),
          }
        : chat
    ),
  }));
}

/**
 * Push a fresh assistant message into the active chat, simulate the AI
 * extraction (loader steps with realistic delays), populate the extract
 * store with the candidate set, and tag the message with its extractionId
 * so the chat-message component can render the Review button.
 */
export async function runExtraction(
  spaceId: string,
  chatId: string
): Promise<string> {
  const space = useSpaceStore.getState().spaces.find((s) => s.id === spaceId);
  const spaceName = space?.name ?? "this Space";

  // 1. Insert a streaming assistant message with progress at step 0.
  const msgId = `msg-${Date.now()}-extract`;
  useChatStore.setState((state) => ({
    chats: state.chats.map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            messages: [
              ...chat.messages,
              {
                id: msgId,
                chatId,
                role: "assistant" as const,
                content: "",
                outputs: [],
                contextItemIds: [],
                streaming: true,
                extractionProgress: { currentStepIndex: 0, done: false },
                timestamp: new Date().toISOString(),
              },
            ],
          }
        : chat
    ),
  }));

  // 2. Walk the steps with real delays.
  for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
    await sleep(STEP_DELAYS_MS[i]);
    // Move past step i — except at the end where we fall through to "done".
    if (i < EXTRACTION_STEPS.length - 1) {
      patchMessage(chatId, msgId, {
        extractionProgress: { currentStepIndex: i + 1, done: false },
      });
    }
  }

  // 3. Build the extraction from the mock candidate set.
  const rawCandidates = getMockCandidatesForSpace(spaceId);
  const components: ExtractedComponent[] = rawCandidates.map((c) => ({
    ...c,
    id: `cmp-${nanoid(6)}`,
  }));
  const selected: Record<string, boolean> = {};
  for (const c of components) selected[c.id] = c.defaultInclude;

  const extractionId = `ext-${nanoid(8)}`;
  useExtractStore.getState().addExtraction({
    id: extractionId,
    spaceId,
    spaceName,
    createdAt: new Date().toISOString(),
    components,
    selected,
  });

  // 4. Mark the message done.
  const includedCount = components.filter((c) => c.defaultInclude).length;
  const summary = `Found ${components.length} candidates — ${includedCount} look strong, the rest are flagged for review.`;
  patchMessage(chatId, msgId, {
    streaming: false,
    extractionId,
    extractionProgress: {
      currentStepIndex: EXTRACTION_STEPS.length,
      done: true,
      summary,
    },
  });

  return extractionId;
}
