"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Loader2,
  PenTool,
  RefreshCw,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOKEN_KEY = "figred-figma-session-token";

/**
 * Hook for the Figred-side Figma plugin pairing state. The sessionToken in
 * localStorage means "we've confirmed the plugin claimed our code." Until
 * confirmed claim, the token is held in component state only.
 */
export function useFigmaPairing(): {
  sessionToken: string | null;
  setSessionToken: (next: string | null) => void;
} {
  const [sessionToken, setLocal] = useState<string | null>(null);

  useEffect(() => {
    setLocal(localStorage.getItem(TOKEN_KEY));
  }, []);

  const setSessionToken = (next: string | null) => {
    if (next) localStorage.setItem(TOKEN_KEY, next);
    else localStorage.removeItem(TOKEN_KEY);
    setLocal(next);
  };

  return { sessionToken, setSessionToken };
}

export function FigmaPairSection({
  enabled,
  onEnabledChange,
  sessionToken,
  onSessionTokenChange,
}: {
  enabled: boolean;
  onEnabledChange: (next: boolean) => void;
  sessionToken: string | null;
  onSessionTokenChange: (next: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Pending state — the code is shown, server has issued a token, but the
  // plugin hasn't claimed it yet. We persist the token only after claim.
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [codeExpiresAt, setCodeExpiresAt] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const paired = !!sessionToken;
  const waiting = !!pendingToken && !paired;

  // Auto-expand on first render so the affordance is visible.
  useEffect(() => {
    if (!paired) setExpanded(true);
  }, [paired]);

  // Poll pair-status while a pending code is outstanding.
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    if (!pendingToken || paired) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch(
          `/api/pair/status?token=${encodeURIComponent(pendingToken)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { claimed?: boolean };
        if (data.claimed && !cancelled) {
          // Plugin has claimed — persist token, flip to paired view.
          onSessionTokenChange(pendingToken);
          onEnabledChange(true);
          setPendingCode(null);
          setPendingToken(null);
          setCodeExpiresAt(null);
        }
      } catch {
        /* keep polling */
      }
    };

    // First tick right away, then every 2s.
    void tick();
    pollRef.current = window.setInterval(tick, 2000);
    return () => {
      cancelled = true;
      if (pollRef.current != null) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [pendingToken, paired, onSessionTokenChange, onEnabledChange]);

  const requestCode = async () => {
    setRequesting(true);
    setRequestError(null);
    try {
      const res = await fetch("/api/pair/new", { method: "POST" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as {
        code: string;
        sessionToken: string;
        expiresAt: string;
      };
      setPendingCode(data.code);
      setPendingToken(data.sessionToken);
      setCodeExpiresAt(data.expiresAt);
    } catch (e) {
      setRequestError(e instanceof Error ? e.message : String(e));
    } finally {
      setRequesting(false);
    }
  };

  const cancelPending = () => {
    setPendingCode(null);
    setPendingToken(null);
    setCodeExpiresAt(null);
  };

  const unpair = () => {
    onSessionTokenChange(null);
    setPendingCode(null);
    setPendingToken(null);
    setCodeExpiresAt(null);
    onEnabledChange(false);
  };

  const copyCode = async () => {
    if (!pendingCode) return;
    try {
      await navigator.clipboard.writeText(pendingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-md border border-white/[0.06] bg-[#161616]">
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
      >
        <span className="flex min-w-0 items-center gap-2">
          {expanded ? (
            <ChevronDown size={12} className="text-foreground/40" />
          ) : (
            <ChevronRight size={12} className="text-foreground/40" />
          )}
          <PenTool
            size={12}
            className={paired ? "text-emerald-400" : "text-foreground/55"}
          />
          <span className="text-[12px] font-medium text-foreground/85">
            Push to Figma plugin
          </span>
          {paired ? (
            <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-300">
              paired
            </span>
          ) : waiting ? (
            <span className="flex items-center gap-1 rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-amber-300">
              <Loader2 size={9} className="animate-spin" />
              waiting
            </span>
          ) : (
            <span className="text-[10px] text-foreground/35">optional</span>
          )}
        </span>
        {paired && (
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              e.stopPropagation();
              onEnabledChange(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-3.5 w-3.5 shrink-0 accent-primary"
            aria-label="Push this handover to the Figma plugin on publish"
          />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-white/[0.04] px-3 py-3">
          {paired ? (
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-foreground/65">
                Plugin is paired. Bundle will be queued on publish for the
                plugin to pull.
              </p>
              <button
                type="button"
                onClick={unpair}
                className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-foreground/45 hover:bg-white/[0.05] hover:text-foreground/75"
              >
                <Unlink size={10} />
                Unpair
              </button>
            </div>
          ) : pendingCode ? (
            <>
              <p className="text-[11px] leading-relaxed text-foreground/60">
                Paste this code into the Figred Handover plugin in Figma
                Desktop to pair.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md border border-primary/30 bg-primary/[0.08] px-3 py-2 text-center font-mono text-base font-bold tracking-[0.25em] text-primary">
                  {pendingCode}
                </code>
                <button
                  type="button"
                  onClick={copyCode}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded transition-colors",
                    copied
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/[0.06] text-foreground/65 hover:bg-white/[0.1]"
                  )}
                  title={copied ? "Copied" : "Copy code"}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-amber-300/80">
                  <Loader2 size={10} className="animate-spin" />
                  Waiting for the plugin to pair…
                </span>
                <button
                  type="button"
                  onClick={cancelPending}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-foreground/40 hover:bg-white/[0.05] hover:text-foreground/70"
                  title="Discard this code and get a new one"
                >
                  <RefreshCw size={9} />
                  Cancel
                </button>
              </div>
              {codeExpiresAt && (
                <p className="text-[10px] text-foreground/35">
                  Expires{" "}
                  {new Date(codeExpiresAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  . Single-use.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[11px] leading-relaxed text-foreground/60">
                On publish, your captured states get sent to the Figred plugin
                running in your open Figma file. The plugin builds them as a
                single labeled Section.
              </p>
              <ol className="list-decimal space-y-0.5 pl-5 text-[11px] text-foreground/55">
                <li>
                  Open the{" "}
                  <span className="font-medium text-foreground/80">
                    Figred Handover
                  </span>{" "}
                  plugin in Figma Desktop.
                </li>
                <li>Click &quot;Get pair code&quot; below.</li>
                <li>Paste the 6-char code into the plugin.</li>
              </ol>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={requestCode}
                  disabled={requesting}
                  className="flex h-7 w-fit items-center gap-1.5 rounded-md bg-primary/15 px-2.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/25 disabled:opacity-50"
                >
                  {requesting ? "Generating…" : "Get pair code"}
                </button>
                {requestError && (
                  <span className="text-[10px] text-red-400">
                    Failed: {requestError}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
