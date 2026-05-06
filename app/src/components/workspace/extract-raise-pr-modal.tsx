"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useExtractStore } from "@/stores/useExtractStore";

const PUBLISHED_BY = "you";

export function ExtractRaisePrModal({
  open,
  onOpenChange,
  extractionId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  extractionId: string;
}) {
  const extraction = useExtractStore((s) => s.extractions[extractionId]);
  const setRaisedPr = useExtractStore((s) => s.setRaisedPr);

  const selectedComponents = useMemo(() => {
    if (!extraction) return [];
    return extraction.components.filter((c) => extraction.selected[c.id]);
  }, [extraction]);

  const defaultTitle = useMemo(() => {
    if (!extraction) return "";
    return `Add ${selectedComponents.length} component${selectedComponents.length === 1 ? "" : "s"} from ${extraction.spaceName}`;
  }, [extraction, selectedComponents.length]);

  const defaultDescription = useMemo(() => {
    if (!extraction) return "";
    const lines = [
      `Extracted ${selectedComponents.length} reusable component${selectedComponents.length === 1 ? "" : "s"} from the **${extraction.spaceName}** prototype:`,
      "",
      ...selectedComponents.map(
        (c) =>
          `- **${c.name}** (quality ${c.qualityScore}, used ${c.usageCount}×) — ${c.description}`
      ),
      "",
      "Each component is a draft — review props, naming, and styling against your codebase conventions before merging.",
    ];
    return lines.join("\n");
  }, [extraction, selectedComponents]);

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(defaultTitle);
    setDescription(defaultDescription);
    setError(null);
  }, [open, defaultTitle, defaultDescription]);

  if (!extraction) return null;

  const handleRaise = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch("/api/pr/raise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: extraction.spaceId,
          spaceName: extraction.spaceName,
          title: title.trim(),
          description,
          publishedBy: PUBLISHED_BY,
          components: selectedComponents.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            reasoning: c.reasoning,
            qualityScore: c.qualityScore,
            sourceStateNames: c.sourceStateNames,
            usageCount: c.usageCount,
            previewKey: c.previewKey,
            code: c.code,
            propsDefinition: c.propsDefinition,
          })),
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Raise PR failed: ${t.slice(0, 200)}`);
      }
      const data = (await res.json()) as { slug: string };
      setRaisedPr(extractionId, data.slug);

      const url = `${window.location.origin}/pr/${data.slug}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
      window.open(url, "_blank", "noopener,noreferrer");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Raise component PR</DialogTitle>
          <p className="text-[11px] text-foreground/50">
            Mints a public PR page with the selected components, ready to share
            with your dev.
          </p>
        </DialogHeader>

        <div className="space-y-3.5">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-foreground/55">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="PR title"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-foreground/55">
              Description (markdown)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={9}
              className="w-full resize-none rounded-md border border-white/[0.08] bg-[#181818] px-2.5 py-2 text-[13px] text-foreground/85 placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedComponents.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded bg-white/[0.04] px-2 py-0.5 text-[10.5px] text-foreground/70"
              >
                {c.name}
                <span className="text-foreground/40">·</span>
                <span className="text-foreground/40">{c.qualityScore}</span>
              </span>
            ))}
          </div>
          {error && (
            <p className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRaise} disabled={publishing}>
            {publishing ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Raising…
              </>
            ) : (
              <>
                <Send size={13} />
                Raise PR ({selectedComponents.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
