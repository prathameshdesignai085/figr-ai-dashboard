"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useShellStore } from "@/stores/useShellStore";
import { useChatStore } from "@/stores/useChatStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Tech stack",
  "Design system",
  "Tokens & layout",
] as const;

const STACK_CHIPS = [
  "Next.js",
  "React",
  "Vue",
  "Tailwind CSS",
  "shadcn/ui",
  "Radix UI",
] as const;

function splitStackParts(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function joinStackParts(parts: string[]): string {
  return parts.join(", ");
}

export default function NewShellPage() {
  const router = useRouter();
  const createShell = useShellStore((s) => s.createShell);
  const createShellChat = useChatStore((s) => s.createShellChat);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("");
  const [packageManager, setPackageManager] = useState("");
  const [appRouterNote, setAppRouterNote] = useState("");
  const [designFileLabel, setDesignFileLabel] = useState("");
  const [designSystemNote, setDesignSystemNote] = useState("");
  const [tokenPreferences, setTokenPreferences] = useState("");

  const canAdvanceFromStep0 = name.trim().length > 0;

  const toggleChip = useCallback((label: string) => {
    const parts = splitStackParts(techStack);
    const lower = label.toLowerCase();
    const idx = parts.findIndex((p) => p.toLowerCase() === lower);
    if (idx >= 0) {
      parts.splice(idx, 1);
    } else {
      parts.push(label);
    }
    setTechStack(joinStackParts(parts));
  }, [techStack]);

  const chipActive = useCallback(
    (label: string) =>
      splitStackParts(techStack).some(
        (p) => p.toLowerCase() === label.toLowerCase()
      ),
    [techStack]
  );

  const finish = () => {
    const fileHint = designFileLabel.trim()
      ? `Attached (stub): ${designFileLabel.trim()}`
      : "";
    const combinedDesign = [fileHint, designSystemNote.trim()]
      .filter(Boolean)
      .join("\n\n");
    const shell = createShell({
      name: name.trim(),
      description: description.trim(),
      techStack: techStack.trim(),
      designSystemNote: combinedDesign,
      tokenPreferences: tokenPreferences.trim(),
      packageManager: packageManager.trim() || undefined,
      appRouterNote: appRouterNote.trim() || undefined,
    });
    const chat = createShellChat(shell.id, "Main");
    router.replace(`/shells/${shell.id}/chat/${chat.id}`);
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-lg px-6 py-10">
        <button
          type="button"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : router.push("/shells"))}
          className="mb-6 flex items-center gap-1 text-xs text-foreground/45 transition-colors hover:text-foreground/70"
        >
          <ChevronLeft className="size-4" aria-hidden />
          {step > 0 ? "Back" : "Shells"}
        </button>

        <div className="mb-8 flex gap-1">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-violet-500/60" : "bg-white/[0.06]"
              )}
              title={label}
            />
          ))}
        </div>

        <h1 className="text-xl font-semibold text-foreground">
          {step === 0 && "Stack & identity"}
          {step === 1 && "Design system"}
          {step === 2 && "Tokens & layout"}
        </h1>
        <p className="mt-1 text-sm text-foreground/40">
          Step {step + 1} of {STEP_LABELS.length}
        </p>

        <div className="mt-8 space-y-5">
          {step === 0 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                The stack you set here drives{" "}
                <span className="text-foreground/70">scaffolding assumptions</span>{" "}
                and how the assistant reasons about components, file layout, and
                dependencies. Be specific—this becomes part of the shell&apos;s
                instructions.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Shell name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing landing shell"
                  className="bg-white/[0.03]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Description (optional)
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="One line about what this shell is for"
                  className="bg-white/[0.03]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground/45">
                  Quick stack
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STACK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        chipActive(chip)
                          ? "border-violet-500/50 bg-violet-500/15 text-violet-200/90"
                          : "border-white/[0.08] text-foreground/45 hover:border-white/[0.14] hover:text-foreground/65"
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Tech stack (detail)
                </label>
                <textarea
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  placeholder="Add frameworks, UI libs, testing tools, or anything else (comma-separated is fine)"
                  rows={3}
                  className={cn(
                    "w-full resize-none rounded-lg border border-input bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none",
                    "placeholder:text-foreground/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="shell-pm"
                    className="text-xs font-medium text-foreground/45"
                  >
                    Package manager
                  </label>
                  <select
                    id="shell-pm"
                    value={packageManager}
                    onChange={(e) => setPackageManager(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-white/[0.03] px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="npm">npm</option>
                    <option value="pnpm">pnpm</option>
                    <option value="yarn">Yarn</option>
                    <option value="bun">Bun</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="shell-router"
                    className="text-xs font-medium text-foreground/45"
                  >
                    Router / app structure (optional)
                  </label>
                  <Input
                    id="shell-router"
                    value={appRouterNote}
                    onChange={(e) => setAppRouterNote(e.target.value)}
                    placeholder="e.g. Next.js App Router, src/app, monorepo packages/ui"
                    className="bg-white/[0.03]"
                  />
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                Design-system context{" "}
                <span className="text-foreground/70">grounds the AI</span> when
                suggesting components, tokens, and layouts. Linking Figma or notes
                here reduces hallucinated patterns later.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Design file (stub)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-3 py-2.5 text-xs text-foreground/50 transition-colors hover:border-white/[0.2] hover:bg-white/[0.04]">
                    <Upload className="size-3.5 shrink-0" aria-hidden />
                    <span>Choose file</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setDesignFileLabel(f?.name ?? "");
                      }}
                    />
                  </label>
                  {designFileLabel ? (
                    <span className="truncate text-xs text-foreground/45">
                      {designFileLabel}
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] text-foreground/25">
                  Filename is stored locally for this session (no upload yet).
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Notes
                </label>
                <textarea
                  value={designSystemNote}
                  onChange={(e) => setDesignSystemNote(e.target.value)}
                  placeholder="Figma library, tokens repo, brand rules, component naming…"
                  rows={4}
                  className={cn(
                    "w-full resize-y rounded-lg border border-input bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none",
                    "placeholder:text-foreground/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  )}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs leading-relaxed text-foreground/50">
                Token and layout rules act as{" "}
                <span className="text-foreground/70">hard constraints</span> for
                generated UI and for the assistant when comparing options.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground/45">
                  Token & layout preferences
                </label>
                <textarea
                  value={tokenPreferences}
                  onChange={(e) => setTokenPreferences(e.target.value)}
                  placeholder="Radius, spacing scale, typography roles, grid, density…"
                  rows={5}
                  className={cn(
                    "w-full resize-y rounded-lg border border-input bg-white/[0.03] px-3 py-2.5 text-sm text-foreground outline-none",
                    "placeholder:text-foreground/25 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                  )}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-10 flex justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={cn(step === 0 && "invisible pointer-events-none")}
          >
            Previous
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button
              type="button"
              disabled={!canAdvanceFromStep0}
              onClick={() => setStep((s) => s + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="button" onClick={finish} className="gap-1">
              Finish
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
