"use client";

/** Read-only HTML preview for output tabs (non-built screen content). */
export function OutputHtmlPreview({ html }: { html: string }) {
  const srcDoc = html.trim().startsWith("<") ? html : `<!DOCTYPE html><html><body><pre>${escapeHtml(html)}</pre></body></html>`;
  return (
    <div className="flex h-full flex-col bg-white/[0.01]">
      <div className="flex flex-1 items-start justify-center overflow-auto p-4">
        <div className="h-full min-h-[400px] w-full max-w-4xl rounded-lg border border-white/[0.06] bg-white shadow-sm overflow-hidden">
          <iframe title="Output preview" className="h-full min-h-[400px] w-full" sandbox="allow-scripts" srcDoc={srcDoc} />
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
