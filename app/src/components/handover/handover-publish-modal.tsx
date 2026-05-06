"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useKnowledgeStore } from "@/stores/useKnowledgeStore";
import { useHandoverStore } from "@/stores/useHandoverStore";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FigmaPairSection,
  useFigmaPairing,
} from "@/components/handover/figma-pair-section";
import type {
  HandoverContextItemSnapshot,
  HandoverKnowledgeSnapshot,
  HandoverStateSnapshot,
} from "@/types";

const PUBLISHED_BY = "you"; // single-user demo placeholder

export function HandoverPublishModal({
  open,
  onOpenChange,
  spaceId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  spaceId: string;
}) {
  const space = useSpaceStore((s) =>
    s.spaces.find((sp) => sp.id === spaceId)
  );
  const allKnowledge = useKnowledgeStore((s) => s.items);
  const allCapturedStates = useHandoverStore((s) => s.capturedStates);
  const capturedStates = useMemo(
    () => allCapturedStates.filter((c) => c.spaceId === spaceId),
    [allCapturedStates, spaceId]
  );
  const clearStates = useHandoverStore((s) => s.clearStatesForSpace);

  const linkedKnowledge = useMemo(() => {
    if (!space) return [];
    const cats = new Set(space.connectedKnowledge);
    return allKnowledge.filter((k) => cats.has(k.category));
  }, [allKnowledge, space]);

  const defaultTitle = space ? `${space.name} · Handover` : "Handover";

  const [title, setTitle] = useState(defaultTitle);
  const [summary, setSummary] = useState("");
  const [openQuestions, setOpenQuestions] = useState("");
  const [stateIds, setStateIds] = useState<Set<string>>(new Set());
  const [contextItemIds, setContextItemIds] = useState<Set<string>>(new Set());
  const [knowledgeIds, setKnowledgeIds] = useState<Set<string>>(new Set());
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Figma plugin pairing
  const { sessionToken: figmaToken, setSessionToken: setFigmaToken } =
    useFigmaPairing();
  const [pushToFigma, setPushToFigma] = useState(false);

  // Version lookup — populated when modal opens.
  type LatestVersion = {
    id: string;
    slug: string;
    version: number;
    title: string;
  };
  const [versionInfo, setVersionInfo] = useState<{
    nextVersion: number;
    latest: LatestVersion | null;
  } | null>(null);

  // Default selections every time the modal opens.
  useEffect(() => {
    if (!open || !space) return;
    setTitle(defaultTitle);
    setSummary("");
    setOpenQuestions("");
    setStateIds(new Set(capturedStates.map((c) => c.id)));
    setContextItemIds(new Set(space.contextItems.map((i) => i.id)));
    setKnowledgeIds(new Set()); // opt-in
    setError(null);
    setPushToFigma(!!figmaToken);
    // Fetch the next version + latest predecessor so we can label the
    // Publish button accurately and chain handovers.
    setVersionInfo(null);
    let cancelled = false;
    fetch(`/api/handover/space/${space.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return;
        setVersionInfo({
          nextVersion: d.nextVersion ?? 1,
          latest: d.latest ?? null,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, space, capturedStates, defaultTitle, figmaToken]);

  if (!space) return null;

  const toggle = (set: Set<string>, id: string, write: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write(next);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setPublishing(true);
    setError(null);

    const states: HandoverStateSnapshot[] = capturedStates
      .filter((c) => stateIds.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.name,
        group: c.group,
        dataUrl: c.dataUrl,
        sourceKind: c.sourceKind,
      }));

    const contextItems: HandoverContextItemSnapshot[] = space.contextItems
      .filter((i) => contextItemIds.has(i.id))
      .map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        source: i.source,
        content: i.content,
      }));

    const knowledge: HandoverKnowledgeSnapshot[] = linkedKnowledge
      .filter((k) => knowledgeIds.has(k.id))
      .map((k) => ({
        id: k.id,
        name: k.name,
        category: k.category,
        type: k.type,
        content: k.content,
      }));

    try {
      const payloadObj = {
        spaceId: space.id,
        spaceName: space.name,
        title: title.trim(),
        summary,
        publishedBy: PUBLISHED_BY,
        states,
        contextItems,
        knowledge,
        openQuestions,
        // Only send the token if user wants to push AND we have one paired.
        figmaSessionToken:
          pushToFigma && figmaToken ? figmaToken : undefined,
        // Chain to the previous handover so it gets superseded on publish.
        previousVersionId: versionInfo?.latest?.id,
      };
      const payloadJson = JSON.stringify(payloadObj);
      console.log(
        `[publish-modal] POST /api/handover/publish sending states=${states.length} contextItems=${contextItems.length} payloadBytes=${payloadJson.length}`
      );
      const res = await fetch("/api/handover/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payloadJson,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Publish failed: ${t.slice(0, 200)}`);
      }
      const data = (await res.json()) as {
        slug: string;
        version: number;
        queuedToFigma?: boolean;
        statesReceived?: number;
        queuedStates?: number;
      };
      console.log(
        `[publish-modal] response slug=${data.slug} v${data.version} statesReceived=${data.statesReceived} queuedStates=${data.queuedStates} queuedToFigma=${data.queuedToFigma}`
      );

      // If the server received fewer states than we sent, surface that loudly
      // — that's the body-truncation symptom we're hunting.
      if (
        typeof data.statesReceived === "number" &&
        data.statesReceived !== states.length
      ) {
        setError(
          `Server received ${data.statesReceived} of ${states.length} states sent. ` +
            `Likely body-size truncation (payload was ${(payloadJson.length / 1024).toFixed(0)} KB). ` +
            `Reduce capture resolution.`
        );
        setPublishing(false);
        return;
      }

      // If we asked to push to Figma but the server didn't recognize the
      // token, our local token is stale (server restart, expired session,
      // or the plugin re-paired with a fresh token). Clear ours and stop
      // here so the user can re-pair without losing the published handover.
      if (pushToFigma && figmaToken && data.queuedToFigma === false) {
        setFigmaToken(null);
        setError(
          "Figma plugin pairing is stale (likely token mismatch). Cleared local pairing — re-pair and re-publish to push to Figma. The handover itself is still published."
        );
        setPublishing(false);
        // Still clear captures + open the page so the publish isn't lost.
        clearStates(space.id);
        const staleUrl = `${window.location.origin}/h/${data.slug}`;
        window.open(staleUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const url = `${window.location.origin}/h/${data.slug}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* clipboard may be blocked; URL still works */
      }
      // Clear captures so the next handover starts fresh.
      clearStates(space.id);
      // Open the published handover in a new tab so the designer keeps their
      // workspace state and can keep iterating.
      window.open(url, "_blank", "noopener,noreferrer");
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Publish handover
            {versionInfo && (
              <span className="ml-2 text-[12px] font-normal text-foreground/45">
                · v{versionInfo.nextVersion}
              </span>
            )}
          </DialogTitle>
          {versionInfo?.latest && (
            <p className="text-[11px] text-foreground/45">
              Will supersede{" "}
              <span className="font-medium text-foreground/65">
                v{versionInfo.latest.version} · {versionInfo.latest.title}
              </span>
            </p>
          )}
        </DialogHeader>

        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          <Field label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of this handover"
            />
          </Field>

          <Field label="Summary">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Why this handover, what's in it, anything to flag for the dev"
              className="min-h-[80px] w-full rounded-md border border-white/[0.08] bg-[#181818] px-2.5 py-2 text-sm text-foreground/85 placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </Field>

          <Field
            label="States to include"
            hint={
              capturedStates.length === 0
                ? "Capture states from prototype previews to add them here."
                : `${stateIds.size} of ${capturedStates.length} selected`
            }
          >
            {capturedStates.length === 0 ? (
              <div className="rounded-md border border-dashed border-white/[0.08] px-3 py-4 text-xs text-foreground/40">
                No captured states yet — open a prototype output and click 📌
                Capture state.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {capturedStates.map((s) => {
                  const checked = stateIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(stateIds, s.id, setStateIds)}
                      className={cn(
                        "group flex flex-col overflow-hidden rounded-md border text-left transition-colors",
                        checked
                          ? "border-primary/60 ring-1 ring-primary/40"
                          : "border-white/[0.08] hover:border-white/[0.16]"
                      )}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-black/30">
                        {s.dataUrl && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={s.dataUrl}
                            alt={s.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <span className="truncate text-[11px] text-foreground/80">
                          {s.name}
                        </span>
                        <span
                          className={cn(
                            "h-3 w-3 shrink-0 rounded-sm border",
                            checked
                              ? "bg-primary border-primary"
                              : "border-white/[0.2]"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Field>

          <Field
            label="Documents to include"
            hint={`${contextItemIds.size} of ${space.contextItems.length} selected`}
          >
            {space.contextItems.length === 0 ? (
              <div className="rounded-md border border-dashed border-white/[0.08] px-3 py-3 text-xs text-foreground/40">
                No context items in this Space.
              </div>
            ) : (
              <CheckboxList
                items={space.contextItems.map((i) => ({
                  id: i.id,
                  label: i.name,
                  hint: `${i.type} · ${i.source}`,
                }))}
                selected={contextItemIds}
                onToggle={(id) => toggle(contextItemIds, id, setContextItemIds)}
              />
            )}
          </Field>

          <Field
            label="Connected knowledge"
            hint={`${knowledgeIds.size} of ${linkedKnowledge.length} selected · opt-in`}
          >
            {linkedKnowledge.length === 0 ? (
              <div className="rounded-md border border-dashed border-white/[0.08] px-3 py-3 text-xs text-foreground/40">
                No knowledge connected to this Space.
              </div>
            ) : (
              <CheckboxList
                items={linkedKnowledge.map((k) => ({
                  id: k.id,
                  label: k.name,
                  hint: k.category,
                }))}
                selected={knowledgeIds}
                onToggle={(id) => toggle(knowledgeIds, id, setKnowledgeIds)}
              />
            )}
          </Field>

          <Field label="Open questions">
            <textarea
              value={openQuestions}
              onChange={(e) => setOpenQuestions(e.target.value)}
              placeholder="Anything the dev should clarify before building (markdown ok)"
              className="min-h-[60px] w-full rounded-md border border-white/[0.08] bg-[#181818] px-2.5 py-2 text-sm text-foreground/85 placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </Field>

          <FigmaPairSection
            enabled={pushToFigma}
            onEnabledChange={setPushToFigma}
            sessionToken={figmaToken}
            onSessionTokenChange={setFigmaToken}
          />

          {error && (
            <p className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* Live summary of what will be published — makes empty-state mistakes obvious. */}
          <div className="text-[11px] text-foreground/55">
            {pushToFigma && figmaToken && stateIds.size === 0 ? (
              <span className="text-amber-300">
                ⚠ Push to Figma is on but no states selected — Figma section
                will be empty.
              </span>
            ) : (
              <>
                Publishing{" "}
                <span className="font-semibold text-foreground/85">
                  {stateIds.size}
                </span>{" "}
                state{stateIds.size === 1 ? "" : "s"},{" "}
                <span className="font-semibold text-foreground/85">
                  {contextItemIds.size}
                </span>{" "}
                doc{contextItemIds.size === 1 ? "" : "s"}
                {pushToFigma && figmaToken && (
                  <>
                    {" · "}
                    <span className="text-emerald-300">
                      → Figma plugin
                    </span>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={
                publishing ||
                (pushToFigma && !!figmaToken && stateIds.size === 0)
              }
            >
              {publishing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Send size={13} />
                  Publish v{versionInfo?.nextVersion ?? "?"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-medium uppercase tracking-wide text-foreground/55">
          {label}
        </label>
        {hint && <span className="text-[10px] text-foreground/35">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function CheckboxList({
  items,
  selected,
  onToggle,
}: {
  items: Array<{ id: string; label: string; hint?: string }>;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="space-y-1 rounded-md border border-white/[0.06] bg-[#161616] p-1.5">
      {items.map((item) => {
        const checked = selected.has(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]",
                checked && "bg-white/[0.04]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border",
                  checked
                    ? "bg-primary border-primary"
                    : "border-white/[0.2]"
                )}
              >
                {checked && (
                  <span className="text-[9px] leading-none text-primary-foreground">
                    ✓
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs text-foreground/85">
                  {item.label}
                </span>
                {item.hint && (
                  <span className="block truncate text-[10px] text-foreground/35">
                    {item.hint}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
