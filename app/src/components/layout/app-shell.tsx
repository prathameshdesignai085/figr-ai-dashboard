"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LeftPanel } from "./left-panel";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isWorkspace = pathname.startsWith("/space/") || pathname.startsWith("/chat/");

  if (isWorkspace) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <main className="flex-1 overflow-hidden">{children}</main>
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
