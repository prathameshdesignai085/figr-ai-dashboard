"use client";

import {
  PenTool,
  FileText,
  FileSpreadsheet,
  GitBranch,
  Zap,
  Check,
} from "lucide-react";

const integrations = [
  {
    name: "Figma",
    description: "Import frames, components, and design system tokens",
    icon: PenTool,
    connected: true,
    color: "text-purple-400",
  },
  {
    name: "Google Docs",
    description: "Import documents, PRDs, and research",
    icon: FileText,
    connected: true,
    color: "text-blue-400",
  },
  {
    name: "Google Sheets",
    description: "Import spreadsheets, data, and business rules",
    icon: FileSpreadsheet,
    connected: false,
    color: "text-green-400",
  },
  {
    name: "GitHub",
    description: "Pull code context, READMEs, and architecture docs",
    icon: GitBranch,
    connected: false,
    color: "text-foreground",
  },
  {
    name: "Linear",
    description: "Sync tickets, requirements, and backlogs",
    icon: Zap,
    connected: false,
    color: "text-indigo-400",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-3xl px-8 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your tools to bring context into Figred
          </p>
        </div>

        <div className="space-y-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 px-5 py-4 hover:border-primary/30 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-3">
                <integration.icon size={20} className={integration.color} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground">
                  {integration.description}
                </p>
              </div>
              {integration.connected ? (
                <div className="flex items-center gap-1.5 text-xs text-teal-400">
                  <Check size={14} />
                  <span>Connected</span>
                </div>
              ) : (
                <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
