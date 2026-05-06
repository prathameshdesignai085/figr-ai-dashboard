"use client";

import { useState } from "react";
import { Bot, Check, Copy, Terminal, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Tab = "claude-code" | "cursor" | "mcp" | "prompt";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "claude-code", label: "Claude Code", icon: Terminal },
  { id: "cursor", label: "Cursor", icon: Bot },
  { id: "mcp", label: "Generic MCP", icon: Wand2 },
  { id: "prompt", label: "Plain prompt", icon: Copy },
];

/**
 * "Connect to coding agent" — gives the dev (or designer prepping the dev)
 * config snippets they paste into Claude Code, Cursor, or any MCP-aware tool
 * to bring this Space's context (or this handover's bundle) into their loop.
 *
 * Accepts either a Space scope or a Handover scope so the same component
 * works from both the workspace top bar and the public handover page.
 */
export function ConnectCodingAgentModal({
  open,
  onOpenChange,
  scope,
  origin,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  scope:
    | { kind: "space"; spaceId: string; spaceName: string }
    | { kind: "handover"; slug: string; title: string };
  /** window.location.origin equivalent. Falls back to "" — caller can pass "" if rendering server-side. */
  origin: string;
}) {
  const [tab, setTab] = useState<Tab>("claude-code");

  const id = scope.kind === "space" ? scope.spaceId : scope.slug;
  const name = scope.kind === "space" ? scope.spaceName : scope.title;
  const mcpUrl =
    scope.kind === "space"
      ? `${origin}/api/mcp/space/${id}`
      : `${origin}/api/mcp/handover/${id}`;

  const claudeCodeJson = JSON.stringify(
    {
      mcpServers: {
        [`figred-${scope.kind}`]: {
          type: "http",
          url: mcpUrl,
          headers: { "X-Figred-Scope": id },
        },
      },
    },
    null,
    2
  );

  const claudeCodeCli = `claude mcp add figred-${scope.kind} --transport http ${mcpUrl}`;

  const cursorJson = JSON.stringify(
    {
      mcpServers: {
        [`figred-${scope.kind}`]: {
          url: mcpUrl,
        },
      },
    },
    null,
    2
  );

  const promptText =
    scope.kind === "handover"
      ? `Use the handover at ${origin}/h/${id} as your single source of truth. Read the Copy-for-AI digest there for product context, design intent, captured prototype states, specs, and open questions.`
      : `Use the Figred Space "${name}" (${origin}/space/${id}) as your single source of truth. It contains the PRD, design decisions, captured prototype states, and connected product knowledge. Pull context via the MCP server at ${mcpUrl}.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>Connect to coding agent</DialogTitle>
        </DialogHeader>

        <p className="-mt-2 text-[12px] text-foreground/55">
          Hand the {scope.kind === "space" ? "Space" : "handover"} to your
          coding agent so it has the same source of truth you do.
        </p>

        {/* Tabs */}
        <div className="flex min-w-0 gap-1 rounded-lg bg-[#161616] p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors",
                  active
                    ? "bg-white/[0.08] text-foreground/90"
                    : "text-foreground/45 hover:text-foreground/70"
                )}
              >
                <Icon size={12} className="shrink-0" />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content per tab */}
        <div className="min-w-0 space-y-3">
          {tab === "claude-code" && (
            <>
              <Snippet
                title="One-line CLI"
                language="bash"
                code={claudeCodeCli}
              />
              <Snippet
                title="Or paste into ~/.claude.json"
                language="json"
                code={claudeCodeJson}
              />
            </>
          )}

          {tab === "cursor" && (
            <Snippet
              title=".cursor/mcp.json"
              language="json"
              code={cursorJson}
            />
          )}

          {tab === "mcp" && (
            <>
              <Snippet
                title="MCP HTTP endpoint"
                language="text"
                code={mcpUrl}
              />
              <p className="rounded-md bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-300">
                The MCP server endpoint is scaffolded but not yet live in this
                build — config is real, the server lights up in Phase 3.
              </p>
            </>
          )}

          {tab === "prompt" && (
            <Snippet
              title="Paste into any AI chat"
              language="text"
              code={promptText}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Snippet({
  title,
  language,
  code,
}: {
  title: string;
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d0d0d]">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.04] px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2 text-[11px] text-foreground/55">
          <span className="truncate">{title}</span>
          <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-px text-[9px] uppercase tracking-wide text-foreground/40">
            {language}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "flex h-6 shrink-0 items-center gap-1 rounded px-2 text-[10px] font-medium transition-colors",
            copied
              ? "bg-emerald-500/15 text-emerald-300"
              : "bg-white/[0.06] text-foreground/65 hover:bg-white/[0.1] hover:text-foreground/85"
          )}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-all px-3 py-3 text-[11.5px] leading-relaxed text-foreground/80">
        {code}
      </pre>
    </div>
  );
}
