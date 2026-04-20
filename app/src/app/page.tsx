"use client";

import { useState } from "react";
import {
  MonitorPlay,
  PenTool,
  Scan,
  Paperclip,
  Sparkles,
} from "lucide-react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { AboutOverlay } from "@/components/about/about-overlay";

const quickActions = [
  {
    icon: MonitorPlay,
    label: "Record your screen",
    iconClassName: "shrink-0 text-white",
  },
  {
    icon: PenTool,
    label: "Attach Figma frames",
    iconClassName: "shrink-0 text-[rgba(0,82,59,0.8)]",
  },
  {
    icon: Scan,
    label: "Capture webpage",
    iconClassName: "shrink-0 text-[rgba(170,0,47,1)]",
  },
  {
    icon: Paperclip,
    label: "Upload PRD or image",
    iconClassName: "shrink-0 text-[rgba(0,82,59,0.8)]",
  },
] as const;

export default function HomePage() {
  const [composerValue, setComposerValue] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-6">
      {/* Top-right: in-app explainer entry point. Home-only by design — */}
      {/* inside Spaces/Shells the workspace already owns the top-right. */}
      {/* The slow indigo halo (`pill-attention` keyframes in globals.css) */}
      {/* draws the eye on first load; it pauses on hover so the hover */}
      {/* border + bg take over without the glow fighting them. */}
      <button
        type="button"
        onClick={() => setAboutOpen(true)}
        aria-label="Open the prototype guide"
        className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors animate-[pill-attention_3.5s_ease-in-out_infinite] hover:border-white/[0.20] hover:bg-white/[0.06] hover:text-foreground hover:[animation-play-state:paused] focus-visible:[animation-play-state:paused]"
      >
        <Sparkles size={12} strokeWidth={1.8} className="text-[#8c83ee]" />
        What's in this prototype
      </button>

      <div className="w-full max-w-2xl space-y-6">
        {/* Greeting */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs font-medium text-muted-foreground px-3 py-1 rounded-full border border-white/[0.1]">
            Free Plan
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            Hi Prathamesh, what would you improve in your product?
          </h1>
        </div>

        {/* Chat Input — same shell as workspace (no border, charcoal card) */}
        <ChatComposer
          value={composerValue}
          onChange={setComposerValue}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!composerValue.trim()) return;
              setComposerValue("");
            }
          }}
          placeholder="Go through the screen recording, to revamp permissions, project level and org level"
          onSubmit={() => {
            if (!composerValue.trim()) return;
            setComposerValue("");
          }}
          canSubmit={!!composerValue.trim()}
        />

        {/* Quick Actions — same width as composer; light outline, no fill */}
        <div className="grid h-[81px] w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex h-full w-full flex-col items-start justify-between rounded-xl border border-white/10 bg-transparent p-4 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.02]"
            >
              <action.icon
                size={20}
                strokeWidth={1.75}
                className={action.iconClassName}
                aria-hidden
              />
              <span className="text-xs leading-snug text-foreground">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AboutOverlay open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}
