"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { BookmarkPlus, Check } from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { SKILL_NICE_NAME } from "@/lib/skill-payloads";
import { cn } from "@/lib/utils";
import type { ContextItem } from "@/types";

/**
 * Promotes a streamed skill output to a Space context item so it lands in
 * the next handover. Mutates the parent message with `savedAsContextItemId`
 * so the button flips to a "Saved" state.
 */
export function SaveToSpaceButton({
  chatId,
  messageId,
  spaceId,
  skillId,
  content,
  alreadySaved,
  className,
}: {
  chatId: string;
  messageId: string;
  spaceId: string | null;
  skillId: string;
  content: string;
  alreadySaved: boolean;
  className?: string;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!spaceId || alreadySaved || saving) return;
    setSaving(true);
    setError(null);
    try {
      const niceName = SKILL_NICE_NAME[skillId] ?? skillId;
      const newItem: ContextItem = {
        id: `ctx-${nanoid(8)}`,
        name: `${niceName} (generated)`,
        type: "document",
        source: `skill:${skillId}`,
        addedAt: new Date().toISOString(),
        content,
      };
      // Append to the active Space's contextItems
      const space = useSpaceStore.getState().spaces.find((s) => s.id === spaceId);
      if (!space) throw new Error("Space not found");
      useSpaceStore
        .getState()
        .updateSpace(spaceId, {
          contextItems: [...space.contextItems, newItem],
        });

      // Mark the message so the button flips to "Saved"
      useChatStore.setState((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, savedAsContextItemId: newItem.id }
                    : m
                ),
              }
            : chat
        ),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (alreadySaved) {
    return (
      <span
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 text-[11px] font-medium text-emerald-300",
          className
        )}
        title="Saved as a Space context item — included in the next handover"
      >
        <Check size={12} />
        Saved to Space
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !spaceId}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md bg-primary/15 px-2.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/25",
          (saving || !spaceId) && "cursor-not-allowed opacity-50"
        )}
        title="Promote this output to a Space context item so it joins the next handover"
      >
        <BookmarkPlus size={12} />
        {saving ? "Saving…" : "Save to Space"}
      </button>
      {error && (
        <span className="text-[10px] text-red-400">{error}</span>
      )}
    </span>
  );
}
