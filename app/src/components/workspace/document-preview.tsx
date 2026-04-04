"use client";

import type { ContainerTab } from "@/types";

export function DocumentPreview({ tab }: { tab: ContainerTab }) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl">
        <div className="prose prose-invert prose-sm max-w-none">
          {/* Simple markdown-like rendering */}
          {tab.content.split("\n").map((line, i) => {
            if (line.startsWith("# ")) {
              return (
                <h1 key={i} className="text-xl font-semibold text-foreground mb-4 mt-6 first:mt-0">
                  {line.slice(2)}
                </h1>
              );
            }
            if (line.startsWith("## ")) {
              return (
                <h2 key={i} className="text-base font-medium text-foreground/90 mb-2 mt-5">
                  {line.slice(3)}
                </h2>
              );
            }
            if (line.startsWith("### ")) {
              return (
                <h3 key={i} className="text-sm font-medium text-foreground/80 mb-2 mt-4">
                  {line.slice(4)}
                </h3>
              );
            }
            if (line.startsWith("- ")) {
              return (
                <li key={i} className="text-sm text-foreground/60 ml-4 list-disc mb-1">
                  {line.slice(2)}
                </li>
              );
            }
            if (line.startsWith("```")) {
              return null; // Skip code fence markers
            }
            if (line.trim() === "") {
              return <div key={i} className="h-2" />;
            }
            return (
              <p key={i} className="text-sm text-foreground/60 mb-1 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
