"use client";

import { useState } from "react";
import {
  Monitor,
  PenTool,
  Globe,
  Upload,
} from "lucide-react";
import { ChatComposer } from "@/components/chat/chat-composer";

const quickActions = [
  { icon: Monitor, label: "Record your screen", color: "text-red-400" },
  { icon: PenTool, label: "Attach Figma frames", color: "text-teal-400" },
  { icon: Globe, label: "Capture webpage", color: "text-orange-400" },
  { icon: Upload, label: "Upload PRD or image", color: "text-blue-400" },
];

export default function HomePage() {
  const [composerValue, setComposerValue] = useState("");

  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Greeting */}
        <div className="text-center space-y-4">
          <span className="inline-block text-xs font-medium text-muted-foreground px-3 py-1 rounded-full border border-white/[0.1]">
            Free Plan
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-start gap-6 rounded-xl border border-white/[0.08] p-5 hover:border-white/[0.15] hover:bg-white/[0.02] transition-all group"
            >
              <action.icon size={20} className={action.color} />
              <span className="text-sm text-foreground/60 group-hover:text-foreground/80 transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
