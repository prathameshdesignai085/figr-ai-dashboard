"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Layers,
  Library,
  Link2,
  PenTool,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type {
  Handover,
  HandoverComment,
  HandoverCommentAnchor,
  HandoverVersionRef,
} from "@/types";
import { CopyForAIButton } from "@/components/handover/copy-for-ai-button";
import { HandoverStateGrid } from "@/components/handover/handover-state-grid";
import { SmartDocSection } from "@/components/handover/smart-doc-section";
import {
  DownloadHandoverButton,
  downloadMarkdown,
} from "@/components/handover/download-handover-button";
import { ConnectCodingAgentModal } from "@/components/handover/connect-coding-agent-modal";
import { CommentsThread } from "@/components/handover/comments-thread";
import { FigmaSectionPreview } from "@/components/handover/figma-section-preview";
import { readCachedHandover } from "@/lib/handover-local-cache";
import { buildHandoverAiDigest } from "@/lib/handover-ai-digest";
import { cn } from "@/lib/utils";

type HandoverWithDigest = Handover & {
  aiDigest: string;
  comments?: HandoverComment[];
  versions?: HandoverVersionRef[];
};

const statusColor: Record<Handover["status"], string> = {
  draft: "bg-white/[0.06] text-foreground/55",
  open: "bg-amber-400/15 text-amber-300",
  accepted: "bg-emerald-400/15 text-emerald-300",
  shipped: "bg-blue-400/15 text-blue-300",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export default function HandoverPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<HandoverWithDigest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  /** Set when we're rendering this device's local copy, not the server's. */
  const [servedLocally, setServedLocally] = useState(false);

  // Safe to read directly: every consumer sits below the `!data` early return,
  // which only clears once the client-side fetch has resolved. Keeping it out
  // of state avoids a setState-in-effect cascade.
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  useEffect(() => {
    const pageOrigin = window.location.origin;
    let cancelled = false;

    (async () => {
      let serverError: string | null = null;
      try {
        const res = await fetch(`/api/handover/${slug}`);
        if (res.ok) {
          const json = (await res.json()) as HandoverWithDigest;
          if (!cancelled) setData(json);
          return;
        }
        serverError =
          res.status === 404
            ? "The server has no record of this handover."
            : `The handover store returned HTTP ${res.status}.`;
      } catch (err) {
        serverError = `Couldn't reach the handover store (${String(err)}).`;
      }

      // Fall back to the copy cached when this device published — without a
      // database attached the server store is per-container memory, so a link
      // can 404 on a container that never saw the publish.
      const cached = await readCachedHandover(slug);
      if (cancelled) return;
      if (cached) {
        setData({
          ...cached,
          aiDigest: buildHandoverAiDigest(cached, pageOrigin),
          comments: cached.comments ?? [],
          versions: [],
        });
        setServedLocally(true);
        return;
      }
      setError(
        `${serverError} No local copy on this device either — handovers are only durable when an Upstash database is attached, and links can't cross devices without one.`
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const tldr = useMemo(() => {
    if (!data) return "";
    if (!data.summary) return "";
    // First 240 chars of the summary, or the first paragraph — whichever is shorter.
    const firstPara = data.summary.split(/\n\s*\n/)[0]?.trim() ?? "";
    return firstPara.length > 0 && firstPara.length <= 240
      ? firstPara
      : data.summary.slice(0, 240) + (data.summary.length > 240 ? "…" : "");
  }, [data]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70"
        >
          <ArrowLeft size={12} /> Back to Figred
        </Link>
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-6 text-sm text-foreground/65">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm text-foreground/40">Loading handover…</p>
      </div>
    );
  }

  const includesCount = {
    states: data.states.length,
    docs: data.contextItems.length,
    knowledge: data.knowledge.length,
    questions: data.openQuestions.trim() ? 1 : 0,
  };

  const downloadFilename = `${slugify(data.title) || "handover"}-v${data.version}.md`;

  const allComments = data.comments ?? [];
  const versions = data.versions ?? [];
  const supersededByVersion = data.supersededBy
    ? versions.find((v) => v.id === data.supersededBy)
    : undefined;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70"
      >
        <ArrowLeft size={12} /> Back to Figred
      </Link>

      {/* Local-copy banner — the server had no record, so this is the copy
          cached when this device published. Won't open for anyone else. */}
      {servedLocally && (
        <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5 text-[12px] text-amber-200">
          Showing this device&apos;s local copy — the server has no record of
          this handover. Attach an Upstash database so the link opens for
          everyone.
        </div>
      )}

      {/* Superseded banner */}
      {supersededByVersion && (
        <Link
          href={`/h/${supersededByVersion.slug}`}
          className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5 text-[12px] text-amber-200 transition-colors hover:bg-amber-500/[0.1]"
        >
          <span>
            This handover is superseded by{" "}
            <span className="font-semibold">v{supersededByVersion.version}</span>
            . Open the latest version →
          </span>
          <ArrowLeft size={12} className="rotate-180" />
        </Link>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-foreground/45">
          <span>{data.spaceName}</span>
          <span>·</span>
          <span>v{data.version}</span>
          <span>·</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 capitalize",
              statusColor[data.status]
            )}
          >
            {data.status}
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          {data.title}
        </h1>
        <p className="text-[12px] text-foreground/40">
          Published by {data.publishedBy} on{" "}
          {new Date(data.publishedAt).toLocaleString()}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <CopyForAIButton text={data.aiDigest} />
          <button
            type="button"
            onClick={() => setConnectOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded-md bg-white/[0.06] px-3 text-xs font-medium text-foreground/80 transition-colors hover:bg-white/[0.1]"
            title="Plug this handover into Claude Code, Cursor, or any MCP-aware tool"
          >
            <Sparkles size={13} className="text-primary" />
            Connect to coding agent
          </button>
          <DownloadHandoverButton
            filename={downloadFilename}
            text={data.aiDigest}
          />
          <button
            type="button"
            onClick={onShare}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
              shareCopied
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-white/[0.06] text-foreground/70 hover:bg-white/[0.1]"
            )}
          >
            <Link2 size={13} />
            {shareCopied ? "Link copied" : "Copy link"}
          </button>
        </div>

        {/* Version dropdown */}
        {versions.length > 1 && (
          <div className="mt-4">
            <VersionDropdown
              versions={versions}
              currentSlug={data.slug}
              currentVersion={data.version}
            />
          </div>
        )}
      </div>

      {/* TL;DR + What's included overview card */}
      <div className="mb-10 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
        {tldr && (
          <>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              TL;DR
            </div>
            <p className="mb-4 text-[14px] leading-relaxed text-foreground/85">
              {tldr}
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Stat icon={Layers} label="states" count={includesCount.states} />
          <Stat icon={FileText} label="docs" count={includesCount.docs} />
          <Stat
            icon={Library}
            label="knowledge"
            count={includesCount.knowledge}
          />
          <Stat
            icon={HelpCircle}
            label={includesCount.questions === 1 ? "open questions" : ""}
            count={includesCount.questions}
            hideZero
          />
        </div>
      </div>

      {/* Summary (if longer than the TL;DR captured) */}
      {data.summary && data.summary.length > tldr.length && (
        <Section
          title="Summary"
          icon={FileText}
          comments={
            <CommentsThread
              slug={data.slug}
              anchor="summary"
              comments={allComments}
            />
          }
        >
          <p className="whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">
            {data.summary}
          </p>
        </Section>
      )}

      {/* Prototype states */}
      <Section
        title="Prototype states"
        icon={Layers}
        count={data.states.length}
        comments={
          <CommentsThread
            slug={data.slug}
            anchor="prototype"
            comments={allComments}
          />
        }
      >
        <HandoverStateGrid states={data.states} />
      </Section>

      {/* Figma section */}
      <Section
        title="Figma section"
        icon={PenTool}
        comments={
          <CommentsThread
            slug={data.slug}
            anchor="figma"
            comments={allComments}
          />
        }
      >
        <FigmaSectionPreview
          spaceName={data.spaceName}
          version={data.version}
          states={data.states}
          figmaSectionUrl={data.figmaSectionUrl}
        />
      </Section>

      {/* Specs & decisions — smart-truncated cards with per-item comments */}
      {data.contextItems.length > 0 && (
        <Section
          title="Specs & decisions"
          icon={FileText}
          count={data.contextItems.length}
          comments={
            <CommentsThread
              slug={data.slug}
              anchor="specs"
              comments={allComments}
            />
          }
        >
          <div className="space-y-3">
            {data.contextItems.map((item) => (
              <div
                key={item.id}
                className="group/item relative"
              >
                <SmartDocSection
                  title={item.name}
                  hint={`${item.type} · ${item.source}`}
                  content={item.content}
                  onDownload={
                    item.content
                      ? () =>
                          downloadMarkdown(
                            `${slugify(item.name) || "doc"}.md`,
                            item.content!
                          )
                      : undefined
                  }
                />
                {/* Per-item comment trigger floats over the card's top-right corner */}
                <div className="absolute right-12 top-2.5 opacity-60 transition-opacity group-hover/item:opacity-100">
                  <CommentsThread
                    slug={data.slug}
                    anchor={`spec:${item.id}` as const}
                    comments={allComments}
                    anchorLabel={`Spec · ${item.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Knowledge — same treatment */}
      {data.knowledge.length > 0 && (
        <Section
          title="Connected knowledge"
          icon={Library}
          count={data.knowledge.length}
          comments={
            <CommentsThread
              slug={data.slug}
              anchor="knowledge"
              comments={allComments}
            />
          }
        >
          <div className="space-y-3">
            {data.knowledge.map((k) => (
              <div key={k.id} className="group/item relative">
                <SmartDocSection
                  title={k.name}
                  hint={k.category}
                  content={k.content}
                  onDownload={
                    k.content
                      ? () =>
                          downloadMarkdown(
                            `${slugify(k.name) || "knowledge"}.md`,
                            k.content!
                          )
                      : undefined
                  }
                />
                <div className="absolute right-12 top-2.5 opacity-60 transition-opacity group-hover/item:opacity-100">
                  <CommentsThread
                    slug={data.slug}
                    anchor={`knowledge:${k.id}` as const}
                    comments={allComments}
                    anchorLabel={`Knowledge · ${k.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Open questions */}
      {data.openQuestions.trim() && (
        <Section
          title="Open questions"
          icon={HelpCircle}
          comments={
            <CommentsThread
              slug={data.slug}
              anchor="open-questions"
              comments={allComments}
            />
          }
        >
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-4">
            <p className="whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">
              {data.openQuestions}
            </p>
          </div>
        </Section>
      )}

      <ConnectCodingAgentModal
        open={connectOpen}
        onOpenChange={setConnectOpen}
        scope={{ kind: "handover", slug: data.slug, title: data.title }}
        origin={origin}
      />
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  comments,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  count?: number;
  /** Optional comments thread rendered next to the section header. */
  comments?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between border-b border-white/[0.06] pb-2">
        <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-foreground/55">
          {Icon && <Icon size={12} />}
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {comments}
          {typeof count === "number" && (
            <span className="text-[11px] text-foreground/30">{count}</span>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function VersionDropdown({
  versions,
  currentSlug,
  currentVersion,
}: {
  versions: HandoverVersionRef[];
  currentSlug: string;
  currentVersion: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Sort newest first for the menu
  const sorted = [...versions].sort((a, b) => b.version - a.version);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.02] px-2.5 text-[11px] font-medium transition-colors hover:bg-white/[0.06]",
          open && "bg-white/[0.06]"
        )}
        aria-expanded={open}
      >
        <span className="text-foreground/35">Version</span>
        <span className="text-foreground/90">v{currentVersion}</span>
        <span className="text-foreground/35">of {versions.length}</span>
        <ChevronDown
          size={11}
          className={cn(
            "text-foreground/45 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-[260px] overflow-hidden rounded-lg border border-white/[0.08] bg-[#161616] shadow-2xl">
          <div className="max-h-72 overflow-y-auto py-1">
            {sorted.map((v) => {
              const isCurrent = v.slug === currentSlug;
              return (
                <Link
                  key={v.id}
                  href={`/h/${v.slug}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-white/[0.05]",
                    isCurrent && "bg-primary/10"
                  )}
                >
                  <span className="flex flex-col">
                    <span
                      className={cn(
                        "font-semibold",
                        isCurrent ? "text-primary" : "text-foreground/85"
                      )}
                    >
                      v{v.version}
                      {isCurrent && (
                        <span className="ml-1.5 rounded bg-primary/20 px-1 py-px text-[9px] uppercase tracking-wide">
                          current
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-foreground/40">
                      {new Date(v.publishedAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wide text-foreground/35 capitalize">
                    {v.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  count,
  hideZero,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  count: number;
  hideZero?: boolean;
}) {
  if (hideZero && count === 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-foreground/70",
        count === 0 && "opacity-50"
      )}
    >
      <Icon size={11} className="text-foreground/45" />
      <span className="font-semibold text-foreground/85">{count}</span>
      {label && <span className="text-foreground/45">{label}</span>}
    </span>
  );
}
