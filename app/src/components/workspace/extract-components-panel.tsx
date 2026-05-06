"use client";

import { useMemo, useState } from "react";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Send,
  Sparkles,
} from "lucide-react";
import { useExtractStore } from "@/stores/useExtractStore";
import { cn } from "@/lib/utils";
import { ExtractRaisePrModal } from "./extract-raise-pr-modal";
import { ComponentPreview } from "./component-previews";
import type { ExtractedComponent } from "@/types";

const codeTheme: PrismTheme = {
  plain: { color: "rgba(255,255,255,0.7)", backgroundColor: "#0e0e0e" },
  styles: [
    { types: ["keyword", "operator"], style: { color: "#c792ea" } },
    { types: ["string", "char"], style: { color: "#c3e88d" } },
    { types: ["comment"], style: { color: "rgba(255,255,255,0.3)" } },
    { types: ["tag", "constant", "symbol"], style: { color: "#f07178" } },
    { types: ["number"], style: { color: "#f78c6c" } },
    {
      types: ["function", "class-name", "maybe-class-name"],
      style: { color: "#ffcb6b" },
    },
    { types: ["punctuation"], style: { color: "rgba(255,255,255,0.5)" } },
    { types: ["property", "attr-name"], style: { color: "#7fdbca" } },
  ],
};

export function ExtractComponentsPanel({
  extractionId,
}: {
  extractionId: string;
}) {
  const extraction = useExtractStore((s) => s.extractions[extractionId]);
  const toggleSelect = useExtractStore((s) => s.toggleSelect);
  const [raiseOpen, setRaiseOpen] = useState(false);

  const selectedCount = useMemo(() => {
    if (!extraction) return 0;
    return Object.values(extraction.selected).filter(Boolean).length;
  }, [extraction]);

  if (!extraction) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-foreground/40">Extraction not found.</p>
      </div>
    );
  }

  const total = extraction.components.length;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.06] px-6 py-4">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles size={11} />
          Extracted by Figred
        </div>
        <h2 className="mb-1 text-lg font-semibold text-foreground">
          {extraction.spaceName} · component review
        </h2>
        <p className="text-[12px] text-foreground/50">
          {total} candidate{total === 1 ? "" : "s"} found. Pick the ones you
          want to ship as a PR — defaults follow AI quality scores.
          {extraction.raisedPrSlug && (
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
              <Check size={10} />
              PR raised
              <a
                href={`/pr/${extraction.raisedPrSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-0.5 underline"
              >
                view <ExternalLink size={10} />
              </a>
            </span>
          )}
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-3">
          {extraction.components.map((c) => (
            <CandidateCard
              key={c.id}
              component={c}
              checked={!!extraction.selected[c.id]}
              onToggle={() => toggleSelect(extractionId, c.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#0e0e0e] px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] text-foreground/65">
            <span className="font-semibold text-foreground/85">
              {selectedCount}
            </span>{" "}
            of <span className="font-semibold text-foreground/85">{total}</span>{" "}
            selected
          </div>
          <button
            type="button"
            onClick={() => setRaiseOpen(true)}
            disabled={selectedCount === 0}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-4 text-[12px] font-semibold transition-colors",
              selectedCount === 0
                ? "cursor-not-allowed bg-white/[0.04] text-foreground/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <Send size={13} />
            Raise PR
          </button>
        </div>
      </div>

      <ExtractRaisePrModal
        open={raiseOpen}
        onOpenChange={setRaiseOpen}
        extractionId={extractionId}
      />
    </div>
  );
}

function CandidateCard({
  component,
  checked,
  onToggle,
}: {
  component: ExtractedComponent;
  checked: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const qualityColor =
    component.qualityScore >= 80
      ? "bg-emerald-500"
      : component.qualityScore >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border transition-colors",
        checked
          ? "border-primary/40 bg-primary/[0.04]"
          : "border-white/[0.08] bg-white/[0.02]"
      )}
    >
      <div className="flex items-stretch gap-4 p-3">
        {/* Thumbnail */}
        <div className="h-[120px] w-[180px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.06]">
          <ComponentPreview previewKey={component.previewKey} />
        </div>

        {/* Body */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-semibold text-foreground/95">
                  {component.name}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-foreground/35">
                  used {component.usageCount}×
                </span>
              </div>
              <p className="mt-0.5 text-[12.5px] text-foreground/70">
                {component.description}
              </p>
            </div>
            {/* Toggle */}
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/[0.15] text-transparent hover:border-white/[0.3]"
              )}
              aria-label={checked ? "Skip this component" : "Include this component"}
            >
              <Check size={12} />
            </button>
          </div>

          {/* Reasoning */}
          <p className="mt-2 text-[11.5px] leading-relaxed text-foreground/55">
            {component.reasoning}
          </p>

          {/* Quality + sources */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10.5px] text-foreground/50">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className={cn("block h-full rounded-full", qualityColor)}
                  style={{ width: `${component.qualityScore}%` }}
                />
              </span>
              <span className="font-semibold text-foreground/75">
                {component.qualityScore}
              </span>
              <span>quality</span>
            </div>
            <span className="text-foreground/25">·</span>
            <span className="truncate">
              From: {component.sourceStateNames.join(", ")}
            </span>
          </div>

          {/* Expand */}
          <button
            type="button"
            onClick={() => setExpanded((o) => !o)}
            className="mt-2 inline-flex w-fit items-center gap-1 rounded text-[11px] font-medium text-foreground/55 hover:text-foreground/85"
          >
            {expanded ? (
              <ChevronDown size={11} />
            ) : (
              <ChevronRight size={11} />
            )}
            {expanded ? "Hide code" : "Show code"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] bg-[#0e0e0e]">
          <div className="border-b border-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
            Props
          </div>
          <pre className="px-4 py-2.5 font-mono text-[11.5px] leading-relaxed text-foreground/70 whitespace-pre-wrap">
            {component.propsDefinition}
          </pre>
          <div className="border-t border-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
            {component.code.language}
          </div>
          <Highlight
            theme={codeTheme}
            code={component.code.content}
            language={component.code.language}
          >
            {({ style, tokens, getLineProps, getTokenProps }) => (
              <pre
                style={{
                  ...style,
                  margin: 0,
                  padding: "12px 16px",
                  fontSize: 12,
                  lineHeight: 1.55,
                }}
                className="overflow-x-auto"
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      )}
    </div>
  );
}
