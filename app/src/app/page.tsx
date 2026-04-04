"use client";

import {
  Monitor,
  PenTool,
  Globe,
  Upload,
  Plus,
  Mic,
  CornerDownLeft,
} from "lucide-react";

const quickActions = [
  { icon: Monitor, label: "Record your screen", color: "text-red-400" },
  { icon: PenTool, label: "Attach Figma frames", color: "text-teal-400" },
  { icon: Globe, label: "Capture webpage", color: "text-orange-400" },
  { icon: Upload, label: "Upload PRD or image", color: "text-blue-400" },
];

export default function HomePage() {
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

        {/* Chat Input */}
        <div className="relative">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 pt-5 pb-4">
            <textarea
              placeholder="Go through the screen recording, to revamp permissions, project level and org level"
              rows={1}
              className="w-full resize-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-4">
              <button className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground rounded-full border border-white/[0.1] px-3 py-1.5 transition-colors hover:bg-white/[0.04]">
                <Plus size={14} />
                <span>Add contexts</span>
              </button>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground/70 transition-colors">
                  <Globe size={14} />
                  <span>Auto</span>
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/50 hover:text-foreground/70 transition-colors">
                  <Mic size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">
                  <CornerDownLeft size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

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
