"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Space, Stage } from "@/types";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useShellStore } from "@/stores/useShellStore";
import { useChatStore } from "@/stores/useChatStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const stages: { id: Stage; label: string }[] = [
  { id: "brainstorm", label: "Brainstorm" },
  { id: "wireframe", label: "Wireframe" },
  { id: "prototype", label: "Prototype" },
  { id: "build", label: "Build" },
];

export function SpaceSettingsPanel({
  space,
  open,
  onOpenChange,
}: {
  space: Space;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { updateSpace } = useSpaceStore();
  const createShellFromSpace = useShellStore((s) => s.createShellFromSpace);
  const createShellChat = useChatStore((s) => s.createShellChat);
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description);
  const [stage, setStage] = useState<Stage>(space.stage);
  const [instructions, setInstructions] = useState(space.instructions);
  const [saveAsShellOpen, setSaveAsShellOpen] = useState(false);
  const [shellName, setShellName] = useState("");
  const [shellDescription, setShellDescription] = useState("");

  useEffect(() => {
    setName(space.name);
    setDescription(space.description);
    setStage(space.stage);
    setInstructions(space.instructions);
  }, [space, open]);

  useEffect(() => {
    if (!saveAsShellOpen) return;
    setShellName(`${space.name} shell`);
    setShellDescription(space.description);
  }, [saveAsShellOpen, space.name, space.description]);

  const handleSave = () => {
    updateSpace(space.id, { name, description, stage, instructions });
    onOpenChange(false);
  };

  const handleConfirmSaveAsShell = () => {
    const n = shellName.trim();
    if (!n) return;
    const shell = createShellFromSpace(
      space,
      n,
      shellDescription.trim() || undefined
    );
    const chat = createShellChat(shell.id, "Main");
    setSaveAsShellOpen(false);
    onOpenChange(false);
    router.push(`/shells/${shell.id}/chat/${chat.id}`);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg !gap-0" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-lg">Space Settings</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1.5 block">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-white/[0.2]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1.5 block">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-white/[0.2]"
            />
          </div>

          {/* Stage */}
          <div>
            <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1.5 block">
              Stage
            </label>
            <div className="flex gap-1.5">
              {stages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-medium transition-colors",
                    stage === s.id
                      ? "bg-white/[0.08] text-foreground"
                      : "text-foreground/30 hover:text-foreground/50 hover:bg-white/[0.03]"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="text-xs font-medium text-foreground/40 uppercase tracking-wider mb-1.5 block">
              Instructions for AI
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe goals, constraints, or specific instructions..."
              rows={3}
              className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-white/[0.2]"
            />
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-5">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-foreground/35">
            Shells
          </p>
          <p className="mb-3 text-xs text-foreground/40">
            Copy this space&apos;s context and instructions into a reusable shell
            in the library.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-white/[0.1] text-foreground/70"
            onClick={() => setSaveAsShellOpen(true)}
          >
            Save as Shell
          </Button>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-4 py-2 text-sm text-foreground/40 hover:text-foreground/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={saveAsShellOpen} onOpenChange={setSaveAsShellOpen}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Save as Shell</DialogTitle>
          <DialogDescription>
            Creates a new shell with this space&apos;s context items, connected
            knowledge, and instructions. You can open it from Shells anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <label
              htmlFor="save-shell-name"
              className="text-xs font-medium text-foreground/45"
            >
              Shell name
            </label>
            <Input
              id="save-shell-name"
              value={shellName}
              onChange={(e) => setShellName(e.target.value)}
              placeholder="My shell"
              className="bg-white/[0.03]"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="save-shell-desc"
              className="text-xs font-medium text-foreground/45"
            >
              Description (optional)
            </label>
            <Input
              id="save-shell-desc"
              value={shellDescription}
              onChange={(e) => setShellDescription(e.target.value)}
              className="bg-white/[0.03]"
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSaveAsShellOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!shellName.trim()}
            onClick={handleConfirmSaveAsShell}
          >
            Create shell
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
