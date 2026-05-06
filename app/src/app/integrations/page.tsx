"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PenTool,
  FileText,
  FileSpreadsheet,
  GitBranch,
  Zap,
  Check,
  RefreshCw,
} from "lucide-react";
import { useDesignSystemStore } from "@/stores/useDesignSystemStore";
import type { DsProvider } from "@/types";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const timersRef = useRef<number[]>([]);
  const { connections, setConnectionStatus } = useDesignSystemStore();

  const fromDesignSystem = searchParams.get("from") === "knowledge-design-system";
  const returnTo =
    searchParams.get("returnTo") && searchParams.get("returnTo")!.startsWith("/")
      ? searchParams.get("returnTo")!
      : "/knowledge/design-system";

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const handleConnectToggle = (provider: DsProvider) => {
    const current = connections[provider];
    if (current.status === "connected") {
      setConnectionStatus(provider, "disconnected", {
        accountLabel: undefined,
        resourceLabel: undefined,
        lastSyncedAt: undefined,
      });
      return;
    }

    setConnectionStatus(provider, "syncing", {
      errorMessage: undefined,
    });
    const timer = window.setTimeout(() => {
      setConnectionStatus(provider, "connected", {
        accountLabel: provider === "github" ? "figred/monorepo" : "Figred Team",
        resourceLabel:
          provider === "github" ? "packages/ui, packages/tokens" : "Core UI Library",
        lastSyncedAt: new Date().toISOString(),
      });
    }, 900);
    timersRef.current.push(timer);
  };

  const mergedIntegrations = integrations.map((integration) => {
    if (integration.name === "GitHub") {
      const status = connections.github.status;
      return { ...integration, connected: status === "connected", status };
    }
    if (integration.name === "Figma") {
      const status = connections.figma.status;
      return { ...integration, connected: status === "connected", status };
    }
    return { ...integration, status: integration.connected ? "connected" : "disconnected" };
  });

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-3xl px-8 py-12">
        {fromDesignSystem && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-white/[0.08] bg-surface-2 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Design System setup</p>
              <p className="text-xs text-muted-foreground">
                Connect GitHub and Figma, then continue creating your Design System run.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(returnTo)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors"
            >
              Back to Design System
            </button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your tools to bring context into Figred
          </p>
        </div>

        <div className="space-y-3">
          {mergedIntegrations.map((integration) => (
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
                {(integration.name === "GitHub" || integration.name === "Figma") &&
                  integration.connected && (
                    <p className="mt-1 text-[11px] text-foreground/45">
                      Last synced{" "}
                      {(() => {
                        const lastSyncedAt =
                          integration.name === "GitHub"
                            ? connections.github.lastSyncedAt
                            : connections.figma.lastSyncedAt;
                        return lastSyncedAt
                          ? new Date(lastSyncedAt).toLocaleString()
                          : "not available";
                      })()}
                    </p>
                  )}
              </div>

              {integration.status === "syncing" ? (
                <div className="flex items-center gap-1.5 text-xs text-blue-300">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Syncing...</span>
                </div>
              ) : integration.connected ? (
                <div className="flex items-center gap-1.5 text-xs text-teal-400">
                  <Check size={14} />
                  <span>Connected</span>
                </div>
              ) : (
                <>
                  {(integration.name === "GitHub" || integration.name === "Figma") ? (
                    <button
                      onClick={() =>
                        handleConnectToggle(
                          integration.name === "GitHub" ? "github" : "figma"
                        )
                      }
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors"
                    >
                      Connect
                    </button>
                  ) : (
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors">
                      Connect
                    </button>
                  )}
                </>
              )}

              {(integration.name === "GitHub" || integration.name === "Figma") &&
                integration.connected && (
                  <button
                    onClick={() =>
                      handleConnectToggle(
                        integration.name === "GitHub" ? "github" : "figma"
                      )
                    }
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors"
                  >
                    Disconnect
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
