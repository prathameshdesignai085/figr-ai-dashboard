"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Highlight, type PrismTheme } from "prism-react-renderer";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  GitPullRequest,
  Link2,
  Package,
} from "lucide-react";
import { CopyForAIButton } from "@/components/handover/copy-for-ai-button";
import { ComponentPreview } from "@/components/workspace/component-previews";
import { cn } from "@/lib/utils";
import type { ComponentPR, ComponentPRSnapshotComponent } from "@/types";

type PrWithDigest = ComponentPR & { aiDigest: string };

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

const statusColor: Record<ComponentPR["status"], string> = {
  draft: "bg-white/[0.06] text-foreground/55",
  open: "bg-amber-400/15 text-amber-300",
  merged: "bg-emerald-400/15 text-emerald-300",
};

export default function PrPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<PrWithDigest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/pr/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        const json = (await res.json()) as PrWithDigest;
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error && err.message === "404"
              ? "PR not found — the link may have expired (in-memory store resets when the dev server restarts)."
              : `Failed to load: ${String(err)}`
          );
      });
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
        <p className="text-sm text-foreground/40">Loading PR…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70"
      >
        <ArrowLeft size={12} /> Back to Figred
      </Link>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-foreground/45">
          <GitPullRequest size={11} className="text-primary" />
          <span>{data.spaceName}</span>
          <span>·</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 capitalize",
              statusColor[data.status]
            )}
          >
            {data.status}
          </span>
          <span>·</span>
          <span>
            {data.components.length} component
            {data.components.length === 1 ? "" : "s"}
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-foreground">
          {data.title}
        </h1>
        <p className="text-[12px] text-foreground/40">
          Raised by {data.publishedBy} on{" "}
          {new Date(data.publishedAt).toLocaleString()}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <CopyForAIButton text={data.aiDigest} />
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
      </div>

      {data.description && (
        <Section title="Description" icon={Package}>
          <p className="whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">
            {data.description}
          </p>
        </Section>
      )}

      <Section
        title="Components"
        icon={Package}
        count={data.components.length}
      >
        <div className="space-y-3">
          {data.components.map((c) => (
            <PrComponentCard key={c.id} component={c} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-baseline justify-between border-b border-white/[0.06] pb-2">
        <h2 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-foreground/55">
          {Icon && <Icon size={12} />}
          {title}
        </h2>
        {typeof count === "number" && (
          <span className="text-[11px] text-foreground/30">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function PrComponentCard({
  component,
}: {
  component: ComponentPRSnapshotComponent;
}) {
  const [open, setOpen] = useState(false);
  const qualityColor =
    component.qualityScore >= 80
      ? "bg-emerald-500"
      : component.qualityScore >= 60
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-stretch gap-4 p-3 text-left"
      >
        <div className="h-[80px] w-[120px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/[0.06]">
          <ComponentPreview previewKey={component.previewKey} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-semibold text-foreground/95">
              {component.name}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-foreground/35">
              used {component.usageCount}×
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-foreground/65">
            {component.description}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10.5px] text-foreground/45">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className={cn("block h-full rounded-full", qualityColor)}
                style={{ width: `${component.qualityScore}%` }}
              />
            </span>
            <span className="font-semibold text-foreground/75">
              {component.qualityScore}
            </span>
            <span className="text-foreground/25">·</span>
            <span className="truncate">
              From: {component.sourceStateNames.join(", ")}
            </span>
          </div>
        </div>
        <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center self-start rounded-md text-foreground/45">
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#0e0e0e]">
          <div className="border-b border-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
            Why it's reusable
          </div>
          <p className="px-4 py-2.5 text-[12px] leading-relaxed text-foreground/70">
            {component.reasoning}
          </p>
          <div className="border-t border-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
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
                  lineHeight: 1.6,
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
