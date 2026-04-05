"use client";

import { Highlight, PrismTheme } from "prism-react-renderer";
import { useMemo } from "react";
import type { ContainerTab } from "@/types";
import { useBuildStore } from "@/stores/useBuildStore";

const figredCodeTheme: PrismTheme = {
  plain: { color: "rgba(255,255,255,0.6)", backgroundColor: "#1a1a1a" },
  styles: [
    { types: ["keyword", "operator"], style: { color: "#c792ea" } },
    { types: ["string", "char"], style: { color: "#c3e88d" } },
    { types: ["comment"], style: { color: "rgba(255,255,255,0.25)" } },
    { types: ["tag", "constant", "symbol"], style: { color: "#f07178" } },
    { types: ["number"], style: { color: "#f78c6c" } },
    { types: ["function", "class-name", "maybe-class-name"], style: { color: "#ffcb6b" } },
    { types: ["punctuation"], style: { color: "rgba(255,255,255,0.45)" } },
    { types: ["property", "attr-name"], style: { color: "#7fdbca" } },
  ],
};

function languageFromPath(path: string | undefined, fallback: string): string {
  if (!path) return fallback;
  if (path.endsWith(".tsx") || path.endsWith(".jsx")) return "tsx";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".html")) return "markup";
  return fallback;
}

export function CodeView({ tab }: { tab: ContainerTab }) {
  const project = useBuildStore((s) =>
    tab.buildProjectId ? s.getProject(tab.buildProjectId) : undefined
  );
  const file = useMemo(() => {
    if (!project || !tab.filePath) return null;
    return project.files.find((f) => f.path === tab.filePath) ?? null;
  }, [project, tab.filePath]);

  const content = file?.content ?? tab.content;
  const lang = languageFromPath(tab.filePath, "typescript");

  return (
    <div
      className="h-full overflow-auto bg-[#1a1a1a]"
      style={{
        fontFamily:
          "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, 'Fira Code', 'Fira Mono', monospace",
        fontSize: 13,
      }}
    >
      <Highlight theme={figredCodeTheme} code={content} language={lang}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre style={{ ...style, margin: 0, padding: "1rem", background: "#1a1a1a" }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                <span className="table-cell w-10 select-none pr-4 text-right text-foreground/15 align-top">
                  {i + 1}
                </span>
                <span className="table-cell pl-0">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
