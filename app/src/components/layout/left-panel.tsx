"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Plus,
  Star,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  BookOpen,
  Plug,
  Settings,
} from "lucide-react";
import { useSpaceStore } from "@/stores/useSpaceStore";
import { useChatStore } from "@/stores/useChatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
interface LeftPanelProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function LeftPanel({ collapsed, onToggle }: LeftPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { spaces } = useSpaceStore();
  const { getRecentChats } = useChatStore();

  const favoriteSpaces = spaces.filter((s) => s.isFavorite);
  const otherSpaces = spaces.filter((s) => !s.isFavorite);
  const recentChats = getRecentChats().slice(0, 8);
  const spaceMap = Object.fromEntries(spaces.map((s) => [s.id, s]));

  const isActive = (path: string) => pathname === path;
  const isActivePrefix = (prefix: string) => pathname.startsWith(prefix);

  if (collapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center border-r border-border bg-background py-3 gap-2">
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
        >
          <PanelLeftOpen size={16} />
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          title="New chat"
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="relative flex h-7 shrink-0 items-center hover:opacity-90 transition-opacity"
          aria-label="Figred home"
        >
          <Image
            src="/figred.png"
            alt="Figred"
            width={351}
            height={155}
            unoptimized
            className="h-7 w-[58px] object-contain object-left brightness-[0.85]"
            priority
          />
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="New chat"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Collapse panel"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Spaces */}
        <div className="py-2 space-y-0.5">
          <button
            type="button"
            onClick={() => router.push("/spaces")}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive("/spaces")
                ? "bg-white/[0.06] text-foreground"
                : "text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]"
            )}
          >
            <LayoutGrid size={14} className="shrink-0" strokeWidth={1.75} aria-hidden />
            Spaces
          </button>
          <div className="space-y-0.5">
            {favoriteSpaces.map((space) => (
              <button
                key={space.id}
                onClick={() => router.push(`/space/${space.id}`)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActivePrefix(`/space/${space.id}`)
                    ? "bg-white/[0.06] text-foreground"
                    : "text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]"
                )}
              >
                <Star size={12} className="shrink-0 text-amber-400 fill-amber-400" />
                <span className="truncate">{space.name}</span>
              </button>
            ))}
            {otherSpaces.map((space) => (
              <button
                key={space.id}
                onClick={() => router.push(`/space/${space.id}`)}
                className={cn(
                  "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActivePrefix(`/space/${space.id}`)
                    ? "bg-white/[0.06] text-foreground"
                    : "text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]"
                )}
              >
                <span className="truncate">{space.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator className="mx-2 bg-white/[0.06]" />

        {/* Nav links */}
        <div className="py-2 space-y-0.5">
          <button
            type="button"
            onClick={() => router.push("/knowledge")}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActivePrefix("/knowledge")
                ? "bg-white/[0.06] text-foreground"
                : "text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]"
            )}
          >
            <BookOpen size={14} className="shrink-0" strokeWidth={1.75} aria-hidden />
            Product Knowledge
          </button>
          <button
            type="button"
            onClick={() => router.push("/integrations")}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive("/integrations")
                ? "bg-white/[0.06] text-foreground"
                : "text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]"
            )}
          >
            <Plug size={14} className="shrink-0" strokeWidth={1.75} aria-hidden />
            Integrations
          </button>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive("/settings")
                ? "bg-white/[0.06] text-foreground"
                : "text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04]"
            )}
          >
            <Settings size={14} className="shrink-0" strokeWidth={1.75} aria-hidden />
            Settings
          </button>
        </div>

        <Separator className="mx-2 bg-white/[0.06]" />

        {/* Recent Chats */}
        <div className="py-2">
          <div className="px-2 py-1">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Recent Chats
            </span>
          </div>
          <div className="mt-1 space-y-0.5">
            {recentChats.map((chat) => {
              const linkedSpace = chat.spaceId
                ? spaceMap[chat.spaceId]
                : null;
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    if (chat.spaceId) {
                      router.push(
                        `/space/${chat.spaceId}/chat/${chat.id}`
                      );
                    } else {
                      router.push(`/chat/${chat.id}`);
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/60 hover:text-foreground/90 hover:bg-white/[0.04] transition-colors"
                >
                  <span className="truncate">{chat.name}</span>
                  {linkedSpace && (
                    <span
                      className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-primary/50"
                      title={linkedSpace.name}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </ScrollArea>

      {/* User profile */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            P
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">Prathamesh</span>
          </div>
          <span className="text-xs rounded-full bg-primary/20 px-2 py-0.5 text-primary font-medium">
            Pro
          </span>
        </div>
      </div>
    </div>
  );
}
