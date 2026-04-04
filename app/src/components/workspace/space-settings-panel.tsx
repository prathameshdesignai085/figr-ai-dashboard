"use client";

import { useState, useEffect } from "react";
import type { Space, Stage } from "@/types";
import { useSpaceStore } from "@/stores/useSpaceStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const { updateSpace } = useSpaceStore();
  const [name, setName] = useState(space.name);
  const [description, setDescription] = useState(space.description);
  const [stage, setStage] = useState<Stage>(space.stage);
  const [instructions, setInstructions] = useState(space.instructions);

  useEffect(() => {
    setName(space.name);
    setDescription(space.description);
    setStage(space.stage);
    setInstructions(space.instructions);
  }, [space, open]);

  const handleSave = () => {
    updateSpace(space.id, { name, description, stage, instructions });
    onOpenChange(false);
  };

  return (
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
  );
}
