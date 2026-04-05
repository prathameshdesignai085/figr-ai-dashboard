"use client";

import { useState } from "react";
import {
  MonitorPlay,
  PenTool,
  Scan,
  Paperclip,
} from "lucide-react";
import { ChatComposer } from "@/components/chat/chat-composer";

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

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
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
    </div>
  );
}
