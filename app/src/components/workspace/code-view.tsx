"use client";

import type { ContainerTab } from "@/types";

export function CodeView({ tab }: { tab: ContainerTab }) {
  return (
    <div className="h-full overflow-auto p-4">
      <pre className="text-xs leading-relaxed">
        <code className="text-foreground/60">
          {tab.content.split("\n").map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 shrink-0 text-right pr-4 text-foreground/15 select-none">
                {i + 1}
              </span>
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
