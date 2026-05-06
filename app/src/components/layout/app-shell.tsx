"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LeftPanel } from "./left-panel";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isShellBuilder = /^\/shells\/[^/]+\/chat\/[^/]+/.test(pathname);
  const isWorkspace =
    pathname.startsWith("/space/") ||
    pathname.startsWith("/chat/") ||
    isShellBuilder;
  // Public handover pages + component PR pages: no left nav, full-bleed.
  const isPublicHandover = pathname.startsWith("/h/");
  const isPublicPr = pathname.startsWith("/pr/");

  if (isWorkspace || isPublicHandover || isPublicPr) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <LeftPanel collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
