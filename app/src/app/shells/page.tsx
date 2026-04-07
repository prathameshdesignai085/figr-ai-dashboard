"use client";

import { useRouter } from "next/navigation";
import { Plus, Layers, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useShellStore } from "@/stores/useShellStore";
import { useChatStore } from "@/stores/useChatStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ShellsPage() {
  const router = useRouter();
  const shells = useShellStore((s) => s.shells);
  const remixToSpace = useShellStore((s) => s.remixToSpace);
  const getActiveChatsForShell = useChatStore((s) => s.getActiveChatsForShell);
  const createShellChat = useChatStore((s) => s.createShellChat);

  const sorted = [...shells].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const openShell = (shellId: string) => {
    const active = getActiveChatsForShell(shellId);
    if (active.length > 0) {
      const latest = [...active].sort(
        (x, y) =>
          new Date(y.updatedAt).getTime() - new Date(x.updatedAt).getTime()
      )[0];
      router.push(`/shells/${shellId}/chat/${latest.id}`);
    } else {
      const chat = createShellChat(shellId);
      router.push(`/shells/${shellId}/chat/${chat.id}`);
    }
  };

  const remixShell = (shellId: string) => {
    const result = remixToSpace(shellId);
    if (result) {
      router.push(`/space/${result.space.id}/chat/${result.chat.id}`);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-foreground/50">
              <Layers className="size-5" strokeWidth={1.5} aria-hidden />
              <span className="text-sm font-medium uppercase tracking-wider">
                Library
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Shells
            </h1>
            <p className="mt-1 max-w-xl text-sm text-foreground/45">
              Reusable layout and context presets. Open a shell to iterate in
              the builder, then remix into a space when you are ready to ship.
            </p>
          </div>
          <Button
            type="button"
            className="gap-1.5"
            onClick={() => router.push("/shells/new")}
          >
            <Plus className="size-4" strokeWidth={2} aria-hidden />
            New shell
          </Button>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-8 py-16 text-center">
            <p className="text-sm text-foreground/40">No shells yet.</p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => router.push("/shells/new")}
            >
              Create your first shell
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {sorted.map((shell) => (
              <li key={shell.id}>
                <div
                  className={cn(
                    "group flex w-full items-stretch overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-colors",
                    "hover:border-white/[0.1] hover:bg-white/[0.04]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openShell(shell.id)}
                    className="flex min-w-0 flex-1 items-start gap-4 p-4 text-left transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300/90">
                      <Layers className="size-5" strokeWidth={1.5} aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground/90">
                          {shell.name}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-foreground/25">
                          Updated{" "}
                          {formatDistanceToNow(new Date(shell.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      {shell.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-foreground/40">
                          {shell.description}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-foreground/25">
                          No description
                        </p>
                      )}
                    </div>
                  </button>
                  <div className="flex shrink-0 flex-col gap-1 border-l border-white/[0.06] p-2 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => remixShell(shell.id)}
                    >
                      <Sparkles className="mr-1 size-3.5" aria-hidden />
                      Remix
                    </Button>
                    <span className="rounded-md bg-white/[0.06] px-2 py-1 text-[10px] font-medium text-foreground/45">
                      Open
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
